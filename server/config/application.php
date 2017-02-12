<?php

/**
 * Konfigurasi aplikasi
 */

return array(

    'name' => 'Easyflow',

    'description' => 'Aplikasi pengolah diagram aktifitas berbasis web',
    
    'version' => '1.0.0',

    'author' => 'Roso Sasongko <roso.sasongko@gmail.com>',  

    'locale' => 'id_ID',

    'index' => '',

    'default' => 'site',

    'charset' => 'UTF-8',

    'urlchars' => 'a-z 0-9~%.:_\-@',

    'session' => array(
        'name' => 'EASYSESSID',
        'cookie_lifetime' => 86400,
        // 'cookie_lifetime' => 1440,
        'cookie_path' => '/',
    ),

    'security' => array(
        'secret_key' => 'Lv4dmEWEWAjEyLaJkXz+BGvypPYcH/aSO3LMOCloAuM=',
    ),

    'setting' => array(
        'source' => 'setting',
    ),
    
    'auth' => array(
        'source' => 'user',
    ),

    'role' => array(
        'source' => 'role'
    ),
    
    'services' => array(
        'setting' => 'App\Service\Setting',
        'site' => 'App\Service\Site',
        'auth' => 'App\Service\Auth',
        'role' => 'App\Service\Role',
        'notification' => 'App\Service\Notification',
    ),

    'plugins' => array(
        'module' => 'App\Plugin\Module',
        'database' => 'App\Plugin\Database',
        'dispatcher' => 'App\Plugin\Dispatcher',
        'application' => 'App\Plugin\Application',
    ),
    
);