<?php
namespace Sys\Service;

class DispatcherException extends \Exception {

    public function __construct($message = NULL) {
        parent::__construct($message, 404);
    }

}