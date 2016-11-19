<?php
namespace Sys\Core;

class ComponentException extends \Exception {

    public function __construct($message = NULL) {
        parent::__construct($message, 500);
    }

}