<?php

namespace App\Services;

use App\Models\Setting;

class MarketingEmailTemplate
{
    public static function wrap(string $innerHtml, string $previewText = ''): string
    {
        $business = e(Setting::get('business_name', 'Fine Jewellery Buyers'));
        $phone = e(Setting::get('phone', '020 3123 4567'));
        $email = e(Setting::get('email', 'info@finejewellerybuyers.co.uk'));
        $address = e(Setting::get('address', 'Hatton Garden, London'));
        $siteUrl = rtrim(env('FRONTEND_URL', 'https://finejewellerybuyers.co.uk'), '/');
        $preview = e($previewText ?: strip_tags($innerHtml));

        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{$business}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Georgia,'Times New Roman',serif;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">{$preview}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f5f5;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e5e5;">
<tr><td style="height:6px;background:linear-gradient(90deg,#B45309,#D97706,#F59E0B);"></td></tr>
<tr><td style="padding:32px 32px 24px;text-align:center;background:#000;">
<h1 style="margin:0;color:#F59E0B;font-size:22px;font-weight:700;letter-spacing:0.5px;">{$business}</h1>
<p style="margin:8px 0 0;color:#ffffff;font-size:13px;opacity:0.85;">Hatton Garden Gold &amp; Jewellery Buyers</p>
</td></tr>
<tr><td style="padding:36px 32px;color:#111111;font-size:16px;line-height:1.7;">
{$innerHtml}
</td></tr>
<tr><td style="padding:0 32px 32px;text-align:center;">
<a href="{$siteUrl}/free-valuation" style="display:inline-block;background:#000;color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 28px;border-radius:999px;">Get Free Valuation</a>
</td></tr>
<tr><td style="padding:24px 32px;background:#fafafa;border-top:1px solid #eee;text-align:center;">
<p style="margin:0 0 8px;color:#666;font-size:13px;line-height:1.6;">{$address}</p>
<p style="margin:0 0 8px;color:#666;font-size:13px;"><a href="tel:" style="color:#D97706;text-decoration:none;">{$phone}</a> · <a href="mailto:{$email}" style="color:#D97706;text-decoration:none;">{$email}</a></p>
<p style="margin:16px 0 0;color:#999;font-size:11px;line-height:1.5;">You received this because you subscribed on our website. We never share your details.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>
HTML;
    }
}
