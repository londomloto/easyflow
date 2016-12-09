<?php
namespace App\Module\User;

class Notification extends \Sys\Core\Module {

    public function findAction() {
        $user = $this->auth->getCurrentUser();
        $result = $this->notification->load($user);
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