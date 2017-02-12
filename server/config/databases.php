<?php

/**
 * Konfigurasi database
 */

return array(
    'db' => array(
        'type' => 'mysql',
        'host' => '127.0.0.1',
        'user' => 'root',
        'pass' => 'secret',
        'name' => 'easyflow',
        'load' => TRUE
    ),
    'test' => array(
        'type' => 'mysql',
        'host' => '127.0.0.1',
        'user' => 'root',
        'pass' => 'secret',
        'name' => 'test',
        'load' => FALSE
    ),
);