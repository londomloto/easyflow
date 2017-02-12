
this.addEventListener('install', function(e){
    e.waitUntil(
        caches.open('v1').then(function(cache){
            return cache.addAll([
                '/assets/vendor/pace/pace.min.js',
                '/assets/vendor/jquery/jquery.js',
                '/assets/vendor/angular/angular.js',
                '/assets/vendor/angular/angular-sanitize.min.js',
                '/assets/vendor/ui-router/angular-ui-router.js',
                '/assets/vendor/ui-breadcrumbs/ui-breadcrumbs.js',
                '/assets/vendor/oclazyload/oclazyload.js',
                '/assets/vendor/bootstrap/v3/css/bootstrap.min.css',
                '/assets/vendor/bootstrap/v3/css/material.css',
                '/assets/vendor/bootstrap/v3/js/bootstrap.min.js',
                '/assets/vendor/bootstrap/v4/css/bootstrap.min.css',
                '/assets/vendor/bootstrap/v4/js/bootstrap.js',
                '/assets/css/frontend.css',
                '/assets/css/backend.css'
            ]);
        })
    );
});

this.addEventListener('fetch', function(e){
    var response;

    e.respondWith(
        caches
            .match(e.request)
            .catch(function(){
                return fetch(e.request);
            })
            .then(function(r){
                response = r;
                caches.open('v1').then(function(cache){
                    cache.put(e.request, response);
                });
                return response.clone();
            })
            .catch(function(){
                return '';
            })
    );
});