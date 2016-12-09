<?php
namespace App\Module\User;

use Sys\Library\Uploader,
    Sys\Helper\File,
    Sys\Helper\Text,
    App\Module\Site\Site;

class User extends \Sys\Core\Module {

    const AVATAR_DIR = PUBPATH.'avatar'.DS;
    const AVATAR_DEFAULT = 'avatar.png';
    
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

            $sql = "SELECT SQL_CALC_FOUND_ROWS {$columns} FROM user WHERE 1 = 1";
            $where = array();
            $params = array();

            if ($this->request->hasParam('filters')) {
                $filters = json_decode($this->request->getParam('filters'));

                foreach($filters as $filter) {
                    if ( ! empty($filter->value)) {
                        switch($filter->comparison) {
                            case 'contains':
                                $params[] = "%{$filter->value}%";
                                $where[]  = "{$filter->field} LIKE ?";
                                break;
                        }
                    }
                }

                if (count($where)) {
                    $sql .= " AND (" . implode(" AND ", $where) . ")";
                }
            }

            $sql .= " ORDER BY fullname ASC";

            $start = $this->request->getParam('start');
            $limit = $this->request->getParam('limit');

            if ($start != '' && $limit != '') {
                $sql .= " LIMIT $start, $limit";
            }

            $users = $this->db->fetchAll($sql, $params);

            $result['data'] = $users;
            $result['total'] = $this->db->foundRows();
        }

        $this->response->setJsonContent($result);
    }
    
    /**
     * @Authenticate
     */
    public function createAction() {
        $this->role->validate('create_user');

        $post = $this->request->getPost();
        self::validatePasswordChange($post);

        $result = array(
            'success' => FALSE,
            'message' => ''
        );

        $found = self::findByEmail($post['email']);

        if ($found) {
            $result['status'] = 500;
            $result['message'] = _('Data already exists!');
        } else {

            if ($this->request->hasFiles()) {
                $this->uploader->setup(array(
                    'path' => self::AVATAR_DIR
                ));

                if ($this->uploader->upload()) {
                    $upload = $this->uploader->getResult();
                    $post['avatar'] = $upload['file_name'];
                }
            }

            $post['register_date'] = date('Y-m-d H:i:s');
            $post['active'] = 1;

            if ( ! isset($post['avatar'])) {
                $post['avatar'] = self::AVATAR_DEFAULT;
            }

            $result['success'] = $this->db->insert('user', $post);
        }

        $this->response->setJsonContent($result);
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

                // delete existing
                if ( ! empty($post['avatar']) && ! empty($post['avatar'])) {
                    File::delete(self::AVATAR_DIR.$post['avatar']);
                }

                $upload = $this->uploader->getResult();
                $post['avatar'] = $upload['file_name'];
            }
        }

        self::validatePasswordChange($post);

        $result['success'] = $this->db->update('user', $post, array('id' => $post['id']));

        $this->response->setJsonContent($result);
    }

    public function deleteAction($id) {
        $user = self::findById($id);
        $error = FALSE;

        if ($user) {
            if ($user->role == 'admin') {
                $error = _('Unable to delete admin account');
            } else {
                if ( ! $this->db->delete('user', array('id' => $id))) {
                    $error = $this->db->getError();
                }
            }
        } else {
            $error = _('No data to delete');
        }

        if ($error) {
            throw new \Exception($error);
        } else {
            $this->response->send204();
        }
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
            
            if ($file) {

                $this->uploader->setup(array(
                    'path' => self::AVATAR_DIR
                ));

                if (($this->uploader->upload())) {

                    // delete existing
                    if ( ! empty($post['avatar']) && ! empty($post['avatar'])) {
                        File::delete(self::AVATAR_DIR.$post['avatar']);
                    }

                    $upload = $this->uploader->getResult();
                    $post['avatar'] = $upload['file_name'];
                }
            }

            self::validatePasswordChange($post);

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

        $this->response->setJsonContent($result);
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

        $this->response->setJsonContent($result);
    }

    public function viewAction() {
        $result = array(
            'success' => FALSE,
            'data' => NULL
        );

        $email = $this->request->getParam('email');

        if ($email) {
            
            $user = self::findByEmail($email);

            if ($user) {
                $result['success'] = TRUE;
                $result['data'] = $user;
            } else {
                throw new \Exception("Error Processing Request", 1);
                
            }
        }

        $this->response->setJsonContent($result);
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
                $token  = $security->generateToken(array('email' => $email));
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

        $this->response->setJsonContent($result);
        
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

                $site = Site::getCurrentSite();
                $user->passwd_real = $post['passwd'];

                // send email
                $message = $this->template->load('email-recover-password', array(
                    'site' => $site,
                    'user' => $user
                ));

                $this->mailer->from($site->email, $site->author);
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

        $this->response->setJsonContent($result);
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

        $this->response->setJsonContent($result);
    }

    ///////// API's /////////
    
    public static function columns() {
        return 'id,email,fullname,sex,job_title,bio,avatar,role,register_date,active,last_login,last_ip';
    }

    public static function getQuerySelect($paging = FALSE, $secure = TRUE) {
        $sql = "SELECT";

        if ($paging) {
            $sql .= " SQL_CALC_FOUND_ROWS";
        }

        if ($secure) {
            $sql .= " id, email, fullname, sex, job_title, bio, avatar, role, register_date, active, last_login, last_ip";
        } else {
            $sql .= " *";
        }

        $sql .= " FROM user";

        return Text::compact($sql);
    }

    public static function getAssetsDir() {
        return PUBPATH.'avatar'.DS;
    }

    public static function getAssetsUrl() {
        return self::getInstance()->url->getBaseUrl().'public/avatar/';
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

    public static function findById($id, $secure = TRUE) {
        $columns = $secure ? self::columns() : '*';
        return self::getInstance()->db->fetchOne("SELECT {$columns} FROM user WHERE id = ?", array($id));
    }

    public static function findByEmail($email, $secure = TRUE) {
        $columns = $secure ? self::columns() : '*';
        return self::getInstance()->db->fetchOne("SELECT {$columns} FROM user WHERE email = ?", array($email));
    }

    public static function validatePasswordChange(&$post) {
        if (
            isset($post['passwd1'], $post['passwd2']) && 
            $post['passwd1'] != '' && 
            $post['passwd2'] != '' && 
            $post['passwd1'] == $post['passwd2']
        ) {
            $module = self::getInstance();

            $salt = $module->security->generateSalt();
            $hash = $module->security->generateHash($post['passwd1'], $salt);

            $post['passwd'] = $hash;
            $post['passwd_salt'] = $salt;
        }
    }

}