<?php
namespace App\Module\Accounts;

use App\Module\Users\Users;

class Followers extends \Sys\Core\Module {

    public function findAction() {

    }

    public function findByEmailAction($email) {

    }

    public function createAction() {
        $current = $this->auth->getCurrentUser();
        $email = $this->dispatcher->getParam('email');

        $result = array(
            'success' => FALSE
        );

        if ($current && $email && ($current->email != $email)) {
            $user = Users::findByEmail($email);
            if ($user) {
                $following = Users::followStatus($current, $user);
                if ($following == 'N') {
                    $success = $this->db->insert(
                        'follower',
                        array(
                            'user_id' => $user->id,
                            'follower_id' => $current->id
                        )
                    );

                    if ($success) {
                        $this->notification->notify('follow', $current, $user);
                    }

                    $result['success'] = $success;
                }
            }
        }

        $this->response->setJsonContent($result);
    }

    public function updateAction($id) {

    }

    public function deleteAction($id) {
        $current = $this->auth->getCurrentUser();
        $email = $this->dispatcher->getParam('email');

        $result = array(
            'success' => FALSE
        );

        if ($email && $current) {
            $user = Users::findByEmail($email);
            if ($user) {
                $success = $this->db->delete(
                    'follower', 
                    array(
                        'user_id' => $user->id,
                        'follower_id' => $current->id
                    )
                );

                $result['success'] = $success;    
            }
        }
        $this->response->setJsonContent($result);
    }
}