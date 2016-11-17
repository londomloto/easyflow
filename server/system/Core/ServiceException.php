<?php
namespace Sys\Core;

class ServiceException extends \Exception {

    public function __construct($message = NULL) {
        parent::__construct($message, 404);
    }

}