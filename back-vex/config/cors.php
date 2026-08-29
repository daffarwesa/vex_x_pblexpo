<?php

return [
    'paths' => [
        'api/*',
        'storage/*',
        'sanctum/csrf-cookie',
        '*',
    ],

    'allowed_methods' => ['*'],

    'allowed_origins' => [env('FRONTEND_URL', 'https://vex.terpalb25.web.id')],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 86400,

    'supports_credentials' => false,
];
