<?php
namespace Sys\Helper;

class Text {
    
    public static function startsWith($haystack, $needle) {
        $length = strlen($needle);
        return substr($haystack, 0, $length) == $needle;
    }

    public static function endsWith($haystack, $needle) {
        $length = strlen($needle);
        if ($length == 0) {
            return TRUE;
        }
        return substr($haystack, -$length) == $needle;
    }

    public static function camelize($str, $capitalize = TRUE) {
        $str = preg_replace('/[^a-z0-9]+/i', ' ', $str);
        $str = trim($str);
        $str = ucwords($str);

        if ( ! $capitalize) {
            $str[0] = strtolower($str[0]);
        }

        $str = str_replace(' ', '', $str);

        return $str;
    }

    public static function uncamelize($str, $separator = '-') {
        $str[0] = strtolower($str);
        
        $str = preg_replace_callback(
            '/([A-Z])/', 
            function($match) use ($separator) {
                return $separator . strtolower($match[1]);
            }, 
            $str
        );

        return $str;
    }

    public static function slugify($str) {

    }

    public static function compact($str) {
        $str = trim($str);
        $str = preg_replace('/[\\x00-\\x20]/', ' ', $str);
        $str = preg_replace('/\s{2,}/', ' ', $str);
        return $str;
    }

}