<?php
namespace Sys\Library;

class Auth extends \Sys\Core\Component {

    protected $_config;
    protected $_db;
    protected $_error;

    public function __construct(\Sys\Core\IApplication $app) {
        parent::__construct($app);

        $this->_config = $this->getAppConfig()->application->auth;
        $this->_db = $this->getApp()->getReadDb();
        $this->_error = NULL;
    }

    public function login($email, $pass, $hashed = FALSE) {
        $tabuser = $this->_config->user_table;

        $security = $this->getService('security');
        $session  = $this->getService('session');

        // check session
        if ($session->has('CURRENT_USER')) {
            return TRUE;
        }
        
        $user = $this->find($email);

        if ($user) {
            // verify password
            $hash = $hashed ? $pass : $security->generateHash($pass, $user->passwd_salt);

            if ($hash == $user->passwd) {

                $token = $security->generateToken($user);

                // save to session
                $this->save($user);

                // update table
                
                $this->_db->update(
                    $tabuser, 
                    array(
                        'access_token' => $token,
                        'last_login' => date('Y-m-d H:i:s'),
                        'last_ip' => $this->getService('request')->getClientAddress()
                    ),
                    array(
                        'email' => $email
                    )
                ); 

                $this->getService('role')->refresh();
                return TRUE;
            }
        }

        $this->_error = "Email atau password tidak valid";
        return FALSE;
    }

    public function logout() {
        $session = $this->getService('session');

        if ($session->has('CURRENT_USER')) {
            $user = $session->get('CURRENT_USER');
            $session->remove('CURRENT_USER');

            $this->getService('role')->refresh();
        }
    }

    public function find($email) {
        $tabuser = $this->_config->user_table;
        return $this->_db->fetchOne("SELECT * FROM {$tabuser} WHERE email = ?", array($email));
    }

    public function register($spec) {
        $security = $this->getService('security');
        $user = $this->find($spec['email']);

        if ($user) {
            $this->_error = 'Alamat email tidak tersedia';
            return FALSE;
        } else {
            // create password
            $salt = $security->generateSalt();
            $hash = $security->generateHash($spec['passwd'], $salt);

            $spec['passwd'] = $hash;
            $spec['passwd_salt'] = $salt;
            $spec['register_date'] = date('Y-m-d H:i:s');

            if ($this->_db->insert('user', $spec)) {
                $user = $this->_db->fetchOne("SELECT * FROM user WHERE email = ?", array($spec['email']));
                return $user->toArray();
            } else {
                $this->_error = 'Terjadi kegagalan dalam pembuatan akun';
                return FALSE;
            }
        }
    }

    public function getUser() {
        $session = $this->getService('session');
        return $session->get('CURRENT_USER');
    }

    /**
     * Save user into session
     */
    public function save($user) {
        $session = $this->getService('session');
        $data = new \stdClass();

        // avatar url
        $data->avatar_url = '';

        if ($user->avatar) {
            $data->avatar_url = $this->getService('uri')->getBaseUrl().'public/upload/avatar/'.$user->avatar;
        } else {
            $data->avatar_url = $this->getService('uri')->getBaseUrl().'public/upload/avatar/avatar.png';
        }

        // remove sensitive data
        foreach($user as $key => $val) {
            if ( ! in_array($key, array('passwd', 'passwd_salt'))) {
                $data->{$key} = $val;
            }
        }

        $session->set('CURRENT_USER', $data);
    }

    public function getError() {
        return $this->_error;
    }
}