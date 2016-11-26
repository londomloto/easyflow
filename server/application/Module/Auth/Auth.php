<?php
namespace App\Module\Auth;

use App\Module\User\User,
    App\Module\Site\Site;

class Auth extends \Sys\Core\Module {
    
    public function verifyAction() {
        $user = $this->auth->getCurrentUser();

        $result = array(
            'success' => FALSE,
            'message' => '',
            'data' => $user
        );

        if ($user) {
            $result['success'] = TRUE;
        } else {
            $result['message'] = _('User have never logged in');
        }

        $this->response->responseJson();
        return $result;
    }
    
    /**
     * Request access token via normal form
     */
    public function loginAction() {
        $post = $this->request->getPost();

        $result = array(
            'success' => FALSE,
            'message' => ''
        );

        if (isset($post['email'], $post['passwd'])) {
            if ($this->auth->login($post['email'], $post['passwd'])) {
                $result['success'] = TRUE;
                $result['data'] = $this->auth->getCurrentUser();
            } else {
                $result['message'] = $this->auth->getError();
            }
        } else {
            $result['message'] = _('Invalid parameters');
        }

        $this->response->responseJson();
        return $result;
    }

    public function logoutAction() {
        $this->auth->logout();
        $this->response->responseJson();
        
        return array(
            'success' => TRUE
        );
    }

    public function registerAction() {
        $post = $this->request->getPost();

        $result = array(
            'success' => FALSE,
            'message' => ''
        );

        if (isset($post['email'], $post['passwd'], $post['fullname'])) {
            $user = $this->auth->register($post);

            if ($user) {
                $this->auth->login($user['email'], $post['passwd']);
                $result['success'] = TRUE;
                $result['data'] = $this->auth->getCurrentUser();
            } else {
                $result['message'] = $this->auth->getError();
            }
        } else {
            $result['message'] = _('Invalid parameters');
        }
        
        $this->response->responseJson();
        return $result;
    }

    public function socialAction() {
        $post = $this->request->getPost();

        $result = array(
            'success' => FALSE,
            'message' => ''
        );
        
        if (isset($post['email'])) {
            $user = User::findByEmail($post['email'], FALSE);

            if ( ! $user) {
                
                $post['passwd'] = $this->security->generateSalt(8);
                $user = $this->auth->register($post);

                if ($user) {
                    $this->auth->login($user->email, $post['passwd']);

                    $result['success'] = TRUE;
                    $result['data'] = $this->auth->getCurrentUser();

                    // send notification email
                    $user->passwd_real = $post['passwd'];
                    
                    $site = Site::current();

                    $message = $this->template->load('email_account_created', array(
                        'site' => $site,
                        'user' => $user
                    ));

                    $this->mailer->from($site->author_email, $site->author);
                    $this->mailer->to($user->email);
                    $this->mailer->subject(sprintf(_('%s, welcome to %s'), $user->fullname, $site->name));
                    $this->mailer->message($message);
                    $this->mailer->send();

                } else {
                    $result['message'] = $this->auth->getError();
                }
            } else {
                $this->auth->login($user->email, $user->passwd, TRUE);
                $result['success'] = TRUE;
                $result['data'] = $this->auth->getCurrentUser();
            }

            // update avatar
            if ($post['avatar']) {
                if ($upload = $this->uploadAvatar($post['avatar'])) {
                    $avatar = $upload['file_name'];
                    
                    $this->db->update(
                        'user',
                        array(
                            'avatar' => $avatar
                        ),
                        array(
                            'email' => $post['email']
                        )
                    );

                    $result['data']->avatar = $avatar;
                    $result['data']->avatar_url = User::getAvatarUrl($avatar);

                    $this->auth->save($result['data']);
                }
            }
        } else {
            $result['message'] = _('Invalid parameters');
        }

        $this->response->responseJson();
        return $result;
    }
    
    public function uploadAvatar($url) {
        $this->uploader->setup(array(
            'path' => User::AVATAR_DIR
        ));

        if ($this->uploader->uploadUrl($url)) {
            return $this->uploader->getResult();
        } else {
            return FALSE;
        }
    }

}