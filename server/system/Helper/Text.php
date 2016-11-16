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

    public static function camelize($text, $capitalize = TRUE) {
        $text = preg_replace('/[^a-z0-9]+/i', ' ', $text);
        $text = trim($text);
        $text = ucwords($text);

        if ( ! $capitalize) {
            $text[0] = strtolower($text[0]);
        }

        $text = str_replace(' ', '', $text);

        return $text;
    }

    public static function uncamelize($text, $separator = '-') {
        $text[0] = strtolower($text);
        
        $text = preg_replace_callback(
            '/([A-Z])/', 
            function($match) use ($separator) {
                return $separator . strtolower($match[1]);
            }, 
            $text
        );

        return $text;
    }

    public static function slugify($text) {

    }

}