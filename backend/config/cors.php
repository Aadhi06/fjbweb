<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:8007',
        'http://localhost:3000',
        env('FRONTEND_URL', 'http://localhost:8007'),
        'https://finejewellerybuyers.co.uk',
        'https://www.finejewellerybuyers.co.uk',
    ],

    'allowed_origins_patterns' => [
        '#https://fine-jewellery-buyers.*\.vercel\.app#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,
];
