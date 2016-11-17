<?php

return array(
    'admin' => array(
        'label' => 'Administrasi',
        'caps' => array(
            'manage_site' => TRUE,
            'manage_user' => TRUE,

            'delete_tutorial' => TRUE
        )
    ),
    'user' => array(
        'label' => 'User',
        'caps' => array(
            'delete_tutorial' => TRUE
        )
    ),
    'guest' => array(
        'label' => 'Guest',
        'caps' => array(
            
        )
    )
);