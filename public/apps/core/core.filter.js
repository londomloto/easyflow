

(function(){

    angular
        .module('core')
        .filter('thumbnail', thumbnailFilter)
        .filter('decodehtml', decodehtmlFilter)
        .filter('dateformat', dateformatFilter);

    /** @ngInject */
    function thumbnailFilter($rootScope, url) {
        var BASE_URL = url.getServiceUrl();
        
        return function(image, path, width, height) {
            return BASE_URL + path + 'thumbnail/' + image + '/' + width + '/' + height;
        }
    }

    function decodehtmlFilter() {
        return function(input) {
            var map = {
                'lt': '<',
                'gt': '>',
                'amp': '&'
            };
            
            return input.replace(/&(#(?:x[0-9a-f]+|\d+)|[a-z]+);?/gi, function($0, $1) {
                if ($1[0] === "#") {
                    return String.fromCharCode($1[1].toLowerCase() === "x" ? parseInt($1.substr(2), 16)  : parseInt($1.substr(1), 10));
                } else {
                    return map.hasOwnProperty($1) ? map[$1] : $0;
                }
            });
        }
    }

    /** @ngInject */
    function dateformatFilter($filter) {
        return function(input, format) {
            if (input) {
                input = input.replace(/\s/, 'T');
                return $filter('date')(input, format);
            } else {
                return input;
            }
        };
    }

}());