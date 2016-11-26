<?php
namespace App\Service;

class Site extends \Sys\Core\Component {

    public function getSessionKey() {
        $context = $this->getRegistry()->get('context');
        return "CURRENT_{$context}_SITE";
    }


}