<?php

namespace App\Services;

use App\Models\PushSubscription;
use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WebPushService
{
    private const DEFAULT_PUBLIC = 'BCU8h5bG6Pi0WOU6poZz_nmfA7wQ9qDwmgxZHENd35zPWQ_6RhMs8KoUjTbggFbi0Ra7H--Pz5XPzFf3MkCFH_A';
    private const DEFAULT_PRIVATE = 'cGnzq70R7hjz6OR3q__PpBZoJezgPNf2abe_Qb1ZJRM';

    public function publicKey(): string
    {
        $key = Setting::get('vapid_public_key', self::DEFAULT_PUBLIC);

        return is_string($key) && $key !== '' ? $key : self::DEFAULT_PUBLIC;
    }

    public function notifyAdmins(string $title, string $body, string $url, string $tag = 'fjb-admin'): void
    {
        $payload = json_encode([
            'title' => $title,
            'body' => $body,
            'url' => $url,
            'tag' => $tag,
        ], JSON_UNESCAPED_UNICODE);

        if ($payload === false) {
            return;
        }

        foreach (PushSubscription::query()->get() as $subscription) {
            try {
                $this->send($subscription, $payload);
            } catch (\Throwable $e) {
                Log::warning('Web push failed: '.$e->getMessage(), [
                    'subscription_id' => $subscription->id,
                ]);
            }
        }
    }

    public function send(PushSubscription $subscription, string $payload): void
    {
        $endpoint = $subscription->endpoint;
        $audience = $this->audience($endpoint);
        $jwt = $this->vapidJwt($audience);
        $encrypted = $this->encrypt($payload, $subscription->public_key, $subscription->auth_token);

        $response = Http::timeout(12)
            ->withHeaders([
                'Authorization' => 'vapid t='.$jwt.', k='.$this->publicKey(),
                'Content-Type' => 'application/octet-stream',
                'Content-Encoding' => 'aes128gcm',
                'TTL' => '86400',
                'Urgency' => 'high',
            ])
            ->withBody($encrypted, 'application/octet-stream')
            ->post($endpoint);

        if (in_array($response->status(), [404, 410], true)) {
            $subscription->delete();
            return;
        }

        if ($response->failed()) {
            throw new \RuntimeException('Push endpoint '.$response->status().': '.$response->body());
        }

        $subscription->update(['last_used_at' => now()]);
    }

    private function audience(string $endpoint): string
    {
        $parts = parse_url($endpoint);

        return ($parts['scheme'] ?? 'https').'://'.($parts['host'] ?? '');
    }

    private function vapidJwt(string $audience): string
    {
        $header = $this->b64url(json_encode(['typ' => 'JWT', 'alg' => 'ES256']));
        $claims = $this->b64url(json_encode([
            'aud' => $audience,
            'exp' => time() + 12 * 3600,
            'sub' => 'mailto:info@finejewellerybuyers.co.uk',
        ]));
        $data = $header.'.'.$claims;

        $private = openssl_pkey_get_private($this->privateKeyPem());
        if ($private === false) {
            throw new \RuntimeException('Invalid VAPID private key');
        }

        $signature = '';
        if (!openssl_sign($data, $signature, $private, OPENSSL_ALGO_SHA256)) {
            throw new \RuntimeException('Could not sign VAPID JWT');
        }

        return $data.'.'.$this->b64url($this->derToJose($signature));
    }

    private function encrypt(string $payload, string $userPublicKey, string $userAuth): string
    {
        $uaPublic = $this->b64urlDecode($userPublicKey);
        $authSecret = $this->b64urlDecode($userAuth);
        if (strlen($uaPublic) !== 65 || strlen($authSecret) !== 16) {
            throw new \RuntimeException('Invalid push subscription keys');
        }

        $local = openssl_pkey_new([
            'private_key_type' => OPENSSL_KEYTYPE_EC,
            'curve_name' => 'prime256v1',
        ]);
        if ($local === false) {
            throw new \RuntimeException('Could not create local ECDH key');
        }

        $details = openssl_pkey_get_details($local);
        $asPublic = chr(4).$details['ec']['x'].$details['ec']['y'];
        $peer = openssl_pkey_get_public($this->publicKeyPem($uaPublic));
        $shared = openssl_pkey_derive($peer, $local, 32);
        if ($shared === false || strlen($shared) !== 32) {
            throw new \RuntimeException('ECDH failed');
        }

        $ikm = hash_hkdf('sha256', $shared, 32, "WebPush: info\0".$uaPublic.$asPublic, $authSecret);
        $salt = random_bytes(16);
        $cek = hash_hkdf('sha256', $ikm, 16, "Content-Encoding: aes128gcm\0", $salt);
        $nonce = hash_hkdf('sha256', $ikm, 12, "Content-Encoding: nonce\0", $salt);
        $plaintext = $payload."\x02";
        $tag = '';
        $cipher = openssl_encrypt($plaintext, 'aes-128-gcm', $cek, OPENSSL_RAW_DATA, $nonce, $tag);
        if ($cipher === false) {
            throw new \RuntimeException('Could not encrypt push payload');
        }

        $ciphertext = $cipher.$tag;
        $rs = pack('N', max(4096, strlen($ciphertext) + 16));

        return $salt.$rs.chr(65).$asPublic.$ciphertext;
    }

    private function privateKeyPem(): string
    {
        $stored = Setting::get('vapid_private_key', self::DEFAULT_PRIVATE);
        $raw = $this->b64urlDecode(is_string($stored) && $stored !== '' ? $stored : self::DEFAULT_PRIVATE);
        $raw = str_pad($raw, 32, "\x00", STR_PAD_LEFT);
        $version = $this->derInteger("\x01");
        $octet = "\x04".$this->derLength(32).$raw;
        $params = "\xa0\x0a".hex2bin('06082a8648ce3d030107');
        $body = $version.$octet.$params;

        return $this->pem('EC PRIVATE KEY', "\x30".$this->derLength(strlen($body)).$body);
    }

    private function publicKeyPem(string $uncompressed): string
    {
        $der = hex2bin('3059301306072a8648ce3d020106082a8648ce3d030107034200').$uncompressed;

        return $this->pem('PUBLIC KEY', $der);
    }

    private function pem(string $type, string $der): string
    {
        return "-----BEGIN {$type}-----\n".chunk_split(base64_encode($der), 64, "\n")."-----END {$type}-----\n";
    }

    private function derInteger(string $bytes): string
    {
        $bytes = ltrim($bytes, "\x00");
        if ($bytes === '' || (ord($bytes[0]) & 0x80)) {
            $bytes = "\x00".$bytes;
        }

        return "\x02".$this->derLength(strlen($bytes)).$bytes;
    }

    private function derLength(int $length): string
    {
        if ($length < 128) {
            return chr($length);
        }

        $bin = ltrim(pack('N', $length), "\x00");

        return chr(0x80 | strlen($bin)).$bin;
    }

    private function derToJose(string $der): string
    {
        $offset = 0;
        if (ord($der[$offset++]) !== 0x30) {
            throw new \RuntimeException('Invalid ECDSA signature');
        }
        $seqLen = $this->readDerLength($der, $offset);
        unset($seqLen);
        $r = $this->readDerInteger($der, $offset);
        $s = $this->readDerInteger($der, $offset);

        return str_pad($r, 32, "\x00", STR_PAD_LEFT).str_pad($s, 32, "\x00", STR_PAD_LEFT);
    }

    private function readDerLength(string $der, int &$offset): int
    {
        $len = ord($der[$offset++]);
        if (($len & 0x80) === 0) {
            return $len;
        }
        $bytes = $len & 0x7f;
        $value = 0;
        for ($i = 0; $i < $bytes; $i++) {
            $value = ($value << 8) | ord($der[$offset++]);
        }

        return $value;
    }

    private function readDerInteger(string $der, int &$offset): string
    {
        if (ord($der[$offset++]) !== 0x02) {
            throw new \RuntimeException('Invalid ECDSA integer');
        }
        $len = $this->readDerLength($der, $offset);
        $bytes = substr($der, $offset, $len);
        $offset += $len;

        return ltrim($bytes, "\x00");
    }

    private function b64url(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }

    private function b64urlDecode(string $value): string
    {
        $padding = strlen($value) % 4;
        if ($padding > 0) {
            $value .= str_repeat('=', 4 - $padding);
        }

        return (string) base64_decode(strtr($value, '-_', '+/'), true);
    }
}
