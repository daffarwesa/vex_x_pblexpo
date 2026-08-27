<?php

return [
    'paths' => ['api/*', 'storage/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['*'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 86400, // Cache preflight OPTIONS selama 24 jam agar browser tidak mengirim request ganda

    'supports_credentials' => false,
];
