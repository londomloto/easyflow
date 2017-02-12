<?php
namespace Sys\Helper;

class Validator {

    protected static $_emails = array();

    public static function isEmail($email) {
        if ( ! isset(self::$_emails[$email])) {
            self::$_emails[$email] = filter_var($email, FILTER_VALIDATE_EMAIL);
        }
        return self::$_emails[$email];
    }

}