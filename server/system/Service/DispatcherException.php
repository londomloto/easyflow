<?php
namespace Sys\Service;

class DispatcherException extends \Exception {

    public function __construct($message = NULL, $code = 404) {
        parent::__construct($message, $code);
    }

}