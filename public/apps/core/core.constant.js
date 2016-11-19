
(function(){

    angular
        .module('core')
        .constant('HTTP_STATUS', {
            UNAUTHORIZED: 401,
            FORBIDDEN: 403,
            NOT_FOUND: 404,
            SERVER_ERROR: 500
        })
        .constant('GOOGLE', {
            SDK_URL: 'https://apis.google.com/js/platform.js?onload=gapiOnLoad',
            APP_ID: '289547281043-4ansglrheepe69sch1182rbrcnr6imf1.apps.googleusercontent.com'
        })
        .constant('FACEBOOK', {
            SDK_URL: '//connect.facebook.net/en_US/sdk.js',
            APP_ID: '1687131594931129'
        });

}());