<?php

return [
    'paths' => [
        'api/*',
        'storage/*',
        'sanctum/csrf-cookie',
        '*',
    ],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_values(array_filter([
        env('FRONTEND_URL') ? (parse_url(env('FRONTEND_URL'), PHP_URL_SCHEME) . '://' . parse_url(env('FRONTEND_URL'), PHP_URL_HOST) . (parse_url(env('FRONTEND_URL'), PHP_URL_PORT) ? ':' . parse_url(env('FRONTEND_URL'), PHP_URL_PORT) : '')) : null,
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'https://vex.terpalb25.web.id',
    ])),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 86400,

    'supports_credentials' => false,
];
