<?php
namespace App\Module\User;

use Sys\Library\Uploader,
    Sys\Helper\File,
    App\Module\Site\Site;

class User extends \Sys\Core\Module {

    const AVATAR_DIR = PUBPATH.'avatar'.DS;
    
    /**
     * @Authenticate
     */
    public function findAction($id = NULL) {
        $id = intval($id);
        $columns = self::columns();

        if ($id) {
            $result = array(
                'success' => TRUE,
                'data' => NULL
            );
            
            $user = $this->db->fetchOne("SELECT {$columns} FROM user WHERE id = ?", array($id));
            $user = self::secure($user);
            $user->avatar_url = self::getAvatarUrl($user);

            $result['data'] = $user;
        } else {
            $result = array(
                'success' => TRUE,
                'data' => array(),
                'total' => 0
            );

            $users = $this->db->fetchAll("SELECT SQL_CALC_FOUND_ROWS {$columns} FROM user");

            $result['data'] = $users;
            $result['total'] = $this->db->foundRows();
        }

        $this->response->responseJson();
        return $result;    
    }

    /**
     * @Authenticate
     */
    public function updateAction() {
        $result = array(
            'success' => FALSE
        );

        $post = $this->request->getPost();

        if ($this->request->hasFiles()) {
            $this->uploader->setup(array(
                'path' => self::AVATAR_DIR
            ));

            if ($this->uploader->upload()) {
                $upload = $this->uploader->getResult();
                $post['avatar'] = $upload['file_name'];
            }
        }

        $result['success'] = $this->db->update('user', $post, array('id' => $post['id']));

        $this->response->responseJson();
        return $result;    
    }

    /**
     * @Authenticate
     */
    public function updateAccountAction() {
        $result = array(
            'success' => FALSE,
            'message' => ''
        );

        $file = $this->request->hasFiles();
        $post = $this->request->getPost();
        
        if (count($post) > 0) {
            
            if (isset($post['noavatar']) && $post['noavatar'] == '1' && ! empty($post['avatar'])) {
                File::delete(self::AVATAR_DIR.$post['avatar']);
                $post['avatar'] = '';
            }

            if ($file) {

                $this->uploader->setup(array(
                    'path' => self::AVATAR_DIR
                ));

                if (($this->uploader->upload())) {
                    $upload = $this->uploader->getResult();
                    $post['avatar'] = $upload['file_name'];
                }
            }

            if (
                isset($post['passwd1'], $post['passwd2']) && 
                $post['passwd1'] != '' && 
                $post['passwd2'] != '' && 
                $post['passwd1'] == $post['passwd2']
            ) {
                $salt = $this->security->generateSalt();
                $hash = $this->security->generateHash($post['passwd1'], $salt);

                $post['passwd'] = $hash;
                $post['passwd_salt'] = $salt;
            }

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

        $this->response->responseJson();
        return $result;
    }

    public function deleteAccountAction() {
        $result = array(
            'success' => FALSE,
            'message' => ''
        );

        $email = $this->request->getPost('email');

        if ($this->db->delete('user', array('email' => $email))) {
            $this->auth->invalidate();
            $result['success'] = TRUE;
        } else {
            $result['message'] = $this->db->getError();
        }

        $this->response->responseJson();
        return $result;
    }

    public function thumbnailAction($image, $width = 96, $height = 96) {
        $image = new \Sys\Library\Image(self::AVATAR_DIR.$image);
        return $image->thumbnail($width, $height);
    }

    public function requestPassAction() {
        $email = $this->request->getParam('email');
        $redir = $this->request->getParam('redir');

        $result = array(
            'success' => FALSE,
            'message' => ''
        );

        $user = self::findByEmail($email);
        $site = Site::getCurrentSite();

        if ($site) {
            if ($user) {
                
                $security = $this->getSecurity();
                $token  = $security->generateToken(array('email' => $email), 120);
                $redir .= (stristr($redir, '?') !== FALSE ? '&' : '?') . "token={$token}";
                    
                $message = $this->template->load('email-request-password', array(
                    'user' => $user,
                    'site' => $site,
                    'link' => $redir
                ));

                $this->mailer->from($site->email, $site->author);
                $this->mailer->to($user->email);
                $this->mailer->subject(_('Password reset request'));
                $this->mailer->message($message);

                if ($this->mailer->send()) {
                    $result['success'] = TRUE;
                } else {
                    $result['message'] = $this->mailer->getError();
                }
            } else {
                $result['message'] = _("The email you entered doesn't match the registration info");
            }
        } else {
            $result['message'] = _('Invalid application context');
        }

        $this->response->responseJson();
        return $result;
        
        /*$email = $this->request->getParam('email');
        $url = $this->request->getParam('url');
        $user = self::findByEmail($email);
        $site = $this->site->getCurrentSite();

        $result = array(
            'success' => FALSE,
            'message' => ''
        );

        if ($user) {
            $token = $this->site->generateToken(array('email' => $email), 86400);
            $link  = $url . '&token=' . $token;
            
            $message = $this->template->load('email_request_password', array(
                'user' => $user,
                'site' => $site,
                'link' => $link
            ));
            
            $this->mailer->from($site->author_email, $site->author);
            $this->mailer->to($user->email);
            $this->mailer->subject(_('Password reset request'));
            $this->mailer->message($message);

            if ($this->mailer->send()) {
                $result['success'] = TRUE;
            } else {
                $result['message'] = $this->mailer->getError();
            }
        } else {
            $result['message'] = _("The email you entered doesn't match the registration info");    
        }

        $this->response->responseJson();
        return $result;*/
    }

    public function recoverPassAction() {
        $post = $this->request->getPost();
        $result = array(
            'success' => FALSE,
            'message' => ''
        );

        if (isset($post['email'], $post['passwd'])) {
            $user = self::findByEmail($post['email']);
            if ($user) {
                $salt = $this->security->generateSalt();
                $hash = $this->security->generateHash($post['passwd'], $salt);

                $this->db->update(
                    'user', 
                    array(
                        'passwd' => $hash,
                        'passwd_salt' => $salt
                    ),
                    array(
                        'email' => $post['email']
                    )
                );

                $result['success'] = TRUE;

                $site = Site::current();
                $user->passwd_real = $post['passwd'];

                // send email
                $message = $this->template->load('email_recover_password', array(
                    'site' => $site,
                    'user' => $user
                ));

                $this->mailer->from($site->author_email, $site->author);
                $this->mailer->to($user->email);
                $this->mailer->subject(_('Password recovery'));
                $this->mailer->message($message);

                $this->mailer->send();
            } else {
                $result['message'] = _('The email address is not registered');
            }
        } else {
            $result['message'] = _('Invalid parameters');
        }

        $this->response->responseJson();
        return $result;
    }

    public function verifyTokenAction() {
        $token  = $this->request->getParam('token');

        $result = array(
            'success' => FALSE,
            'message' => '',
            'payload' => NULL
        );

        if ($token) {
            $result = $this->security->verifyToken($token);
        } else {
            $result['message'] = _('Invalid parameters');
        }

        $this->response->responseJson();
        return $result;
    }

    ///////// API's /////////
    
    public static function current() {
        
    }

    public static function columns() {
        return 'id,email,fullname,sex,job_title,bio,avatar,role,register_date,active,last_login,last_ip';
    }

    public static function getAvatarUrl($user) {
        $module = self::getInstance();
        $avatar = is_string($user) ? $user : $user->avatar;
        return $module->url->getBaseUrl().'public/avatar/'.$avatar;
    }
    
    public static function secure($user) {
        if ($user) {
            unset(
                $user->passwd, 
                $user->passwd_salt
            );
        }

        return $user;
    }

    public static function findByEmail($email, $secure = TRUE) {
        $columns = $secure ? self::columns() : '*';
        return self::getInstance()->db->fetchOne("SELECT {$columns} FROM user WHERE email = ?", array($email));
    }

}