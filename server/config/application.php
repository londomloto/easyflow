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
    'default' => 'user',

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
        'name' => 'easyflow',
        'cookie_lifetime' => 86400,
        'cookie_path' => '/'
    ),

    /**
     * Security setting
     */
    'security' => array(
        'secret_key' => 'dM0m8TVFtwxcKiMFJ2hA2o+eo7RH2kr7amiLsIOQxVJ+S29VtWjzS1M7mUlR8dtNyuwFNMOAC6+LZtv7c2PhJg=='
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