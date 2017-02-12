<?php
namespace App\Service;

class Auth extends \Sys\Core\Component {

    protected $_db;
    protected $_error;

    public function __construct(\Sys\Core\IApplication $app) {
        parent::__construct($app);

        if ($app->getConfig()->application->has('auth')) {
            $this->_config = $app->getConfig()->application->auth;
            $this->_config->def('locking', TRUE);
            $this->_config->def('attempts', 3);
            $this->_config->def('timeout', 120);
        } else {
            $this->_config = new \Sys\Core\Config(array(
                'source' => 'user',
                'attempts' => 3,
                'locking' => TRUE,
                'timeout' => 120
            ));
        }

        $this->_db = $app->getDefaultDatabase();
        $this->_error = NULL;
    }

    public function getSessionKey() {
        $context = $this->getRegistry()->get('context');
        return "CURRENT_{$context}_USER";
    }

    public function login($email, $pass, $hashed = FALSE) {
        $source = $this->_config->source;
        $success = FALSE;
        $message = '';

        $role = $this->getRole();
        $security = $this->getSecurity();

        $user = $this->findByEmail($email);

        if ($user) {
            // verify password
            $hash = $hashed ? $pass : $security->generateHash($pass, $user->passwd_salt);
            
            if ($hash == $user->passwd) {
                $role->handle($user->role);
                $capability = 'login_' . strtolower($this->getRegistry()->get('context'));

                if ($role->can($capability)) {

                    $token = $security->generateToken(array(
                        'user_email' => $user->email,
                        'user_role' => $user->role
                    ));

                    $user->token = $token;
                    $user->last_login = date('Y-m-d H:i:s');
                    
                    // save to session
                    $this->save($user);

                    // update table
                    $this->_db->update(
                        $source, 
                        array(
                            'token' => $token,
                            'last_login' => $user->last_login,
                            'last_ip' => $this->getRequest()->getClientAddress()
                        ),
                        array(
                            'email' => $email
                        )
                    );

                    $success = TRUE;
                } else {
                    $message = _("You don't have permission to access this application");
                }
            } else {
                $message = _("Invalid email or password");
            }
        } else {
            $message = _("Invalid email or password");
        }

        if ( ! $success) {
            $this->_error = $message;
        }

        return $success;
    }

    public function logout() {
        $session = $this->getSession();
        $sesskey = $this->getSessionKey();

        if ($session->has($sesskey)) {
            $session->remove($sesskey);
        }

        $this->getRole()->invalidate();
    }

    public function invalidate() {
        $this->logout();
    }

    public function findByEmail($email) {
        $source = $this->_config->source;
        return $this->_db->fetchOne("SELECT * FROM {$source} WHERE email = ?", array($email));
    }

    public function register($spec) {
        $security = $this->getSecurity();
        $source = $this->_config->source;
        $user = $this->findByEmail($spec['email']);

        if ($user) {
            $this->_error = _('This email address is not available');
            return FALSE;
        } else {
            $username = strstr($spec['email'], '@', TRUE);

            $found = $this->_db->fetchAll("SELECT username FROM {$source} WHERE username LIKE ?", array("{$username}%"));
            
            if (count($found) > 0) {
                $username = $username.'.'.(count($found) + 1);
            }

            // create password
            $salt = $security->generateSalt();
            $hash = $security->generateHash($spec['passwd'], $salt);
            $role = $this->getRole()->findDefault();

            $spec['username'] = $username;
            $spec['passwd'] = $hash;
            $spec['passwd_salt'] = $salt;
            $spec['register_date'] = date('Y-m-d H:i:s');
            $spec['avatar'] = 'noavatar.png';
            $spec['role'] = $role ? $role->name : 'user';

            if ($this->_db->insert('user', $spec)) {
                $user = $this->_db->fetchOne("SELECT * FROM user WHERE email = ?", array($spec['email']));
                return $user;
            } else {
                $this->_error = _('An error occurred while creating account');
                return FALSE;
            }
        }
    }

    public function getCurrentUser() {
        $session = $this->getSession();
        $sesskey = $this->getSessionKey();
        return $session->get($sesskey);
    }

    /**
     * Save user into session
     */
    public function save($user) {
        $session = $this->getSession();
        $url = $this->getUrl();

        $data = new \stdClass();
        $info = $session->info();
        $data->expired_date = $info['session_expired'];

        // avatar url
        $data->avatar_url = \App\Module\Users\Users::getAvatarUrl($user->avatar);
        
        // remove sensitive data
        foreach($user as $key => $val) {
            if ( ! in_array($key, array('passwd', 'passwd_salt'))) {
                $data->{$key} = $val;
            }
        }

        $sesskey = $this->getSessionKey();
        $session->set($sesskey, $data);
    }

    public function getError() {
        return $this->_error;
    }
    
}