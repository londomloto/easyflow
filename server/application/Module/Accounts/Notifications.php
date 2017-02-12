<?php
namespace App\Module\Accounts;

use Sys\Helper\Validator,
    App\Module\Users\Users;

class Notifications extends \Sys\Core\Module {

    public function findAction() {
        
        $email = $this->dispatcher->getParam('email');

        $result = array(
            'success' => TRUE,
            'data' => array(),
            'total' => 0
        );

        if (Validator::isEmail($email)) {
            $user = Users::findByEmail($email);
            if ($user) {
                $result = $this->notification->load($user);    
            }
        }

        $this->response->setJsonContent($result);
    }

    public function deleteAction($id) {
        $result = array(
            'success' => FALSE,
            'message' => NULL
        );

        if ($this->notification->delete($id)) {
            $result['success'] = TRUE;
        }

        $this->response->setJsonContent($result);   
    }

}