<?php
namespace Sys\Helper;

class Kernel {

    private static $_versions = array();

    public static function php($version) {
        $version = (string) $version;

        if ( ! isset(self::$_versions[$version]))
        {
            self::$_versions[$version] = version_compare(PHP_VERSION, $version, '>=');
        }

        return self::$_versions[$version];
    }

}