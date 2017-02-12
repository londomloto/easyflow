<?php

return array(
    
    'fallback' => array(
        'module' => 'site',
        'action' => 'index'
    ),

    'routes' => array(

        ///////// ACCOUNT /////////

        'GET /accounts/(email:any)/(module:any)' => array(
            'module' => 'accounts',
            'action' => 'forward',
            'method' => 'find'
        ),
        
        'GET /accounts/(email:any)/(module:any)/:num' => array(
            'module' => 'accounts',
            'action' => 'forward',
            'method' => 'findById'
        ),

        'GET /accounts/(email:any)/(module:any)/:any' => array(
            'module' => 'accounts/diagrams',
            'action' => 'findBySlug'
        ),

        'POST /accounts/(email:any)/(module:any)' => array(
            'module' => 'accounts',
            'action' => 'forward',
            'method' => 'create'
        ),
        
        'PUT /accounts/(email:any)/(module:any)/:num' => array(
            'module' => 'accounts',
            'action' => 'forward',
            'method' => 'update'  
        ),

        'DELETE /accounts/(email:any)/(module:any)/:num' => array(
            'module' => 'accounts',
            'action' => 'forward',
            'method' => 'delete'  
        ),

        'GET /accounts/:any' => array(
            'module' => 'accounts',
            'action' => 'findByEmail'
        ),

        'PUT|POST /accounts/:any' => array(
            'module' => 'accounts',
            'action' => 'update'
        ),

        'DELETE /accounts/:any' => array(
            'module' => 'accounts',
            'action' => 'delete'
        ),

        ///////// DIAGRAM /////////
        
        'GET /diagrams/(identity:any)/(module:any)' => array(
            'module' => 'diagrams',
            'action' => 'forward',
            'method' => 'find'
        ),

        'GET /diagrams/(identity:any)/(module:any)/:num' => array(
            'module' => 'diagrams',
            'action' => 'forward',
            'method' => 'findById'
        ),

        'POST /diagrams/(identity:any)/(module:any)' => array(
            'module' => 'diagrams',
            'action' => 'forward',
            'method' => 'create'
        ),

        'PUT /diagrams/(identity:any)/(module:any)/:num' => array(
            'module' => 'diagrams',
            'action' => 'forward',
            'method' => 'update'
        ),

        'DELETE /diagrams/(identity:any)/(module:any)/:num' => array(
            'module' => 'diagrams',
            'action' => 'forward',
            'method' => 'delete'
        ),

        ///////// CATALOG /////////
        
        'POST /catalog/(module:any)' => array(
            'module' => 'catalog',
            'action' => 'forward',
            'method' => 'create'
        ),

        'DELETE /catalog/(module:any)/:num' => array(
            'module' => 'catalog',
            'action' => 'forward',
            'method' => 'delete'
        ),

        'GET /catalog' => array(
            'module' => 'catalog',
            'action' => 'find'
        ),

        'GET /catalog/(slug:any)' => array(
            'module' => 'catalog',
            'action' => 'findBySlug'
        ),

        ///////// COMMON REST /////////

        'GET /:module/:num' => array(
            'module' => 1,
            'action' => 'findById'
        ),

        'PUT|POST /:module/:num' => array(
            'module' => 1,
            'action' => 'update'
        ),

        'DELETE /:module/:num' => array(
            'module' => 1,
            'action' => 'delete'
        ),

        'GET /:module' => array(
            'module' => 1,
            'action' => 'find'
        ),

        'POST /:module' => array(
            'module' => 1,
            'action' => 'create'
        ),

        ///////// COMMON VERBS /////////

        '* /:module/:action/:params' => array(
            'module' => 1,
            'action' => 2,
            'params' => 3
        ),

        '* /:module/:action' => array(
            'module' => 1,
            'action' => 2
        )

    ),

);