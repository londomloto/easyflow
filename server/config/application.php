<?php

/**
 * Konfigurasi aplikasi
 */

return array(

    'name' => 'Easyflow',

    'description' => 'Aplikasi pengolah diagram aktifitas berbasis web',
    
    'version' => '1.0.0',

    'author' => 'Roso Sasongko <roso.sasongko@gmail.com>',  

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
    'suffix' => '.jsp',

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
        'cookie_path' => '/'
    ),

    /**
     * Security setting
     */
    'security' => array(
        'secret_key' => 'Lv4dmEWEWAjEyLaJkXz+BGvypPYcH/aSO3LMOCloAuM='
    ),

    /**
     * Authentication
     */
    'auth' => array(
        'user_table' => 'user',
        'role_table' => 'role',
        'locking' => TRUE,
        'max_attempts' => 3,
        'timeout' => 120
    ),

    /**
     * Authorization
     */
    'role' => array(
        'role_table' => 'role',
        'user_table' => 'user'
    ),

    /**
     * Database read/write
     */
    'database' => array(
        'read' => 'db',
        'write' => 'db'
    ),

    /**
     * Daftar service yang otomatis diload ketika aplikasi dimulai
     */
    'services' => array(
        
    )
    
);