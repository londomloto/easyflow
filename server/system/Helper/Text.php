<?php
namespace Sys\Helper;

class Text {
    
    public static function contains($haystack, $needle) {
        return strpos($haystack, $needle) !== FALSE;
    }

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
        if (empty($str)) {
            return $str;
        }
        
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

    public static function compact($str) {
        $str = trim($str);
        $str = preg_replace('/[\\x00-\\x20]/', ' ', $str);
        $str = preg_replace('/\s{2,}/', ' ', $str);
        return $str;
    }

    public static function slugify($str, $replacer = '-') {
        $str = preg_replace('~[^\\pL\d]+~u', $replacer, $str);
        $str = trim($str, '-');
        $str = iconv('utf-8', 'us-ascii//TRANSLIT', $str);
        $str = strtolower($str);
        $str = preg_replace('~[^-\w]+~', '', $str);

        if (empty($str)) return 'n-a';
        return $str;
    }

    public static function ellipsis($str, $n = 500, $end_char = '...') {
        if (mb_strlen($str) < $n) {
            return $str;
        }

        $str = preg_replace('/ {2,}/', ' ', str_replace(array("\r", "\n", "\t", "\x0B", "\x0C"), ' ', $str));

        if (mb_strlen($str) <= $n) {
            return $str;
        }

        $out = '';

        foreach (explode(' ', trim($str)) as $val) {
            $out .= $val.' ';
            if (mb_strlen($out) >= $n) {
                $out = trim($out);
                return (mb_strlen($out) === mb_strlen($str)) ? $out : $out.$end_char;
            }
        }
    }

}