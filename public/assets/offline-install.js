(function(){

    function install() {
        var protocol = location.protocol;
        if (protocol == 'https:') {
            if ('serviceWorker' in navigator && 'caches' in window) {
                navigator.serviceWorker.register('/assets/offline-worker.js',{scope: '/assets/'})
                .then(function(reg){
                    
                }).catch(function(err){
                    console.log('Worker registration failed with ' + err);
                });
            }
        }
    }

    install();

}());

