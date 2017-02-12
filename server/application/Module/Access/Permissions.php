<?php
namespace App\Module\Access;

class Permissions extends \Sys\Core\Module {

    public function findAction() {
        $result = array(
            'success' => TRUE,
            'data' => $this->role->getAvailablePermissions()
        );
        
        $this->response->setJsonContent($result);
    }

}