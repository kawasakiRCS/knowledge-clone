<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default LDAP Connection Name
    |--------------------------------------------------------------------------
    |
    | Here you may specify which of the LDAP connections below you wish
    | to use as your default connection for all LDAP operations. Of
    | course you may use many connections at once using the LDAP
    | manager class.
    |
    */

    'default' => env('LDAP_CONNECTION', 'default'),

    /*
    |--------------------------------------------------------------------------
    | LDAP Connections
    |--------------------------------------------------------------------------
    |
    | Below you may configure each LDAP connection for your application.
    | Be sure to include the proper schema as well as your LDAP hosts.
    | You may also set any additional configuration options you need.
    |
    */

    'connections' => [

        'default' => [
            'hosts' => [env('LDAP_HOST', '127.0.0.1')],
            'username' => env('LDAP_USERNAME', 'username'),
            'password' => env('LDAP_PASSWORD', 'password'),
            'port' => env('LDAP_PORT', 389),
            'base_dn' => env('LDAP_BASE_DN', 'dc=local,dc=com'),
            'timeout' => env('LDAP_TIMEOUT', 5),
            'use_ssl' => env('LDAP_SSL', false),
            'use_tls' => env('LDAP_TLS', false),
            'sasl_options' => [
                // Additional SASL options if needed for Entra ID
            ],
        ],

        // Entra ID / Azure AD Configuration
        'entra_id' => [
            'hosts' => [env('ENTRA_ID_HOST', 'login.microsoftonline.com')],
            'username' => env('ENTRA_ID_USERNAME'),
            'password' => env('ENTRA_ID_PASSWORD'),
            'port' => env('ENTRA_ID_PORT', 636),
            'base_dn' => env('ENTRA_ID_BASE_DN'),
            'timeout' => env('ENTRA_ID_TIMEOUT', 5),
            'use_ssl' => env('ENTRA_ID_SSL', true),
            'use_tls' => env('ENTRA_ID_TLS', false),
            'options' => [
                // Entra ID specific options
                LDAP_OPT_PROTOCOL_VERSION => 3,
                LDAP_OPT_REFERRALS => 0,
            ],
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | LDAP Logging
    |--------------------------------------------------------------------------
    |
    | When LDAP logging is enabled, all LDAP search and authentication
    | attempts are logged using the default application logging driver.
    | This can assist in debugging issues and monitoring usage.
    |
    */

    'logging' => env('LDAP_LOGGING', true),

    /*
    |--------------------------------------------------------------------------
    | LDAP Cache
    |--------------------------------------------------------------------------
    |
    | LDAP caching allows you to cache LDAP search results for a specified
    | amount of time. This can drastically increase the speed of common
    | operations. Cache is disabled by default.
    |
    */

    'cache' => [
        'enabled' => env('LDAP_CACHE', false),
        'driver' => env('CACHE_DRIVER', 'file'),
    ],

];