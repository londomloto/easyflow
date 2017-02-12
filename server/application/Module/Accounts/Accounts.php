<?php
namespace App\Module\Accounts;

use Sys\Helper\File,
    Sys\Helper\Validator,
    App\Module\Users\Users;

class Accounts extends \Sys\Core\Module {
    
    public function findByUserNameAction($username) {
        $result = array(
            'success' => FALSE,
            'data' => NULL
        );

        $account = Users::findByUserName($username);
        $current = $this->auth->getCurrentUser();

        if ($account) {
            $account->avatar_url = Users::getAvatarUrl($account);
            $account->editable = ($current && $current->id == $account->id) ? TRUE : FALSE;
            
            $result['data'] = $account;
        }

        $this->response->setJsonContent($result);
    }

    public function findByEmailAction($email) {
        $result = array(
            'success' => FALSE,
            'data' => NULL
        );

        if (Validator::isEmail($email)) {
            $account = Users::findByEmail($email);
            $current = $this->auth->getCurrentUser();

            if ($account) {
                $account->avatar_url = Users::getAvatarUrl($account);
                $account->facebook_url = Users::getSocialUrl($account, 'facebook');
                $account->google_url = Users::getSocialUrl($account, 'google');
                $account->twitter_url = Users::getSocialUrl($account, 'twitter');
                $account->editable = ($current && $current->id == $account->id) ? TRUE : FALSE;
                $account->following = FALSE;

                if ($current && $current->id != $account->id) {
                    $account->following = Users::followStatus($current, $account);
                }
                
                $result['data'] = $account;
            }
        }

        $this->response->setJsonContent($result);
    }

    /**
     * @authentication
     * @authorization update_account
     */
    public function updateAction($email) {
        $result = array(
            'success' => FALSE,
            'message' => ''
        );

        if (Validator::isEmail($email)) {

            $file = $this->request->hasFiles();
            $post = $this->request->getPost();

            if (count($post) > 0) {
            
                if ($file) {

                    $this->uploader->setup(array(
                        'path' => Users::getAssetsDir()
                    ));

                    if (($this->uploader->upload())) {
                        if ( ! empty($post['avatar']) && $post['avatar'] != Users::AVATAR_DEFAULT) {
                            File::delete(Users::getAssetsDir().$post['avatar']);
                        }

                        $upload = $this->uploader->getResult();
                        $post['avatar'] = $upload['file_name'];
                    }
                }

                Users::validatePasswordChange($post);

                $keys = array('email' => $post['email']);

                if ($this->db->update('user', $post, $keys)) {
                    $user = $this->db->fetchOne("SELECT * FROM user WHERE email = ?", array($post['email']));
                    $this->auth->save($user);
                    
                    $result['user'] = $this->auth->getCurrentUser();
                    $result['success'] = TRUE;
                }
            } else {
                $result['message'] = _('Invalid parameters');
            }

        }

        $this->response->setJsonContent($result);
    }

    public function deleteAction($email) {
        $result = array(
            'success' => FALSE,
            'message' => ''
        );

        if (Validator::isEmail($email)) {
            $result = Users::purge($email);

            if ($result['success']) {
                $this->auth->invalidate();
            }
        } else {
            $result['message'] = _("Invalid email address!");
        }

        if ( ! $result['success']) {
            $result['status'] = 500;
        }
        
        $this->response->setJsonContent($result);
    }
    
    /**
     * Sub module forwarder
     */
    public function forwardAction() {
        $dispatcher = $this->dispatcher;

        $params = $dispatcher->getParam();
        $arguments = $dispatcher->getArguments();

        $module = 'accounts/'.$params['module'];    
        $method = $params['method'];

        $dispatcher->forward(array(
            'module' => $module,
            'action' => $method,
            'params' => $params,
            'arguments' => $arguments
        ));
    }
}