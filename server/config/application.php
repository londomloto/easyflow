<?php

/**
 * Konfigurasi aplikasi
 */

return array(

    'name' => 'Easyflow',

    'description' => 'Aplikasi pengolah diagram aktifitas berbasis web',
    
    'version' => '1.0.0',

    'author' => 'Roso Sasongko <roso.sasongko@gmail.com>',  

    'locale' => 'id_ID', // 'id_ID',

    /**
     * Nama file index: index.php
     */
    'index' => '',

    /**
     * Default path
     */
    'default' => 'site',

    /**
     * Ekstensi url
     */
    'suffix' => '',

    'charset' => 'UTF-8',

    /**
     * Daftar karakter yang diperbolehkan dalam URL
     */
    'urlchars' => 'a-z 0-9~%.:_\-',

    /**
     * Session config
     */
    'session' => array(
        'name' => 'EASYSESSID',
        // 'cookie_lifetime' => 86400,
        'cookie_lifetime' => 1440,
        'cookie_path' => '/',
    ),

    /**
     * Security setting
     */
    'security' => array(
        'secret_key' => 'Lv4dmEWEWAjEyLaJkXz+BGvypPYcH/aSO3LMOCloAuM=',
    ),

    /**
     * Setting
     */
    'setting' => array(
        'source' => 'setting',
    ),
    
    /**
     * Authentication
     */
    'auth' => array(
        'source' => 'user',
    ),

    /**
     * Authorization
     */
    'role' => array(
        'source' => 'role'
    ),
    
    /**
     * Daftar service yang otomatis diload ketika aplikasi dimulai
     */
    'services' => array(
        'setting' => 'App\Service\Setting',
        'site' => 'App\Service\Site',
        'auth' => 'App\Service\Auth',
        'role' => 'App\Service\Role',
        'notification' => 'App\Service\Notification',
    ),

    /**
     * Events listener plugins
     */
    'plugins' => array(
        'module' => 'App\Plugin\Module',
        'database' => 'App\Plugin\Database',
        'dispatcher' => 'App\Plugin\Dispatcher',
        'application' => 'App\Plugin\Application',
    ),
    
);