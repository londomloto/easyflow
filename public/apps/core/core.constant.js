
(function(){

    angular
        .module('core')
        .constant('API_URL', '/server')
        .constant('BASE_URL', 'http://easyflow.io/')
        .constant('APPPATH', '/public/apps/')
        .constant('GOOGLE', {
            SDK_URL: 'https://apis.google.com/js/platform.js?onload=gapiOnLoad',
            API_KEY: '289547281043-4ansglrheepe69sch1182rbrcnr6imf1.apps.googleusercontent.com'
        })
        .constant('FACEBOOK', {
            SDK_URL: '//connect.facebook.net/en_US/sdk.js',
            API_KEY: '1687131594931129'
        });

}());