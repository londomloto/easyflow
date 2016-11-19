<?php
namespace Sys\Service;

class SecurityException extends \Exception {

    public function __construct($message = NULL, $code = 403) {
        parent::__construct($message, $code);
    }

}