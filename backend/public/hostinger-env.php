<?php

/**
 * Read .env values on Hostinger when config is cached (env() returns empty).
 */
function hostinger_env(string $key, string $default = ''): string
{
    $envFile = dirname(__DIR__) . '/.env';

    if (!is_readable($envFile)) {
        return $default;
    }

    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];

    foreach ($lines as $line) {
        $line = trim($line);

        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }

        if (!str_contains($line, '=')) {
            continue;
        }

        [$name, $value] = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value, " \t\n\r\0\x0B\"'");

        if ($name === $key) {
            return $value;
        }
    }

    return $default;
}
