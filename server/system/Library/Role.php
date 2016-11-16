<?php
namespace Sys\Library;

class Role extends \Sys\Core\Component {

    protected $_roles;
    protected $_user;
    protected $_userRole;

    public function __construct(\Sys\Core\IApplication $app) {
        parent::__construct($app);
        $this->_roles = $this->getAppConfig()->roles->toArray();
        $this->_user = NULL;
        $this->_userRole = NULL;
    }

    public function refresh() {
        // grab current user
        $session = $this->getService('session');

        if ($session->has('CURRENT_USER')) {
            $this->_user = $session->get('CURRENT_USER');
            $this->_userRole = $this->_user->role;
        } else {
            $this->_user = NULL;
            $this->_userRole = NULL;
        }
    }

    public function has($role) {
        return isset($this->_roles[$role]);
    }

    public function add($role, $spec) {

    }

    public function get($role) {
        return $this->has($role) ? $this->_roles[$role] : FALSE;
    }

    ///////// USER LEVEL /////////

    public function is($role) {
        if ( ! $this->_userRole) {
            return FALSE;
        }
        return $this->_userRole == $role;
    }

    public function can($capability) {
        if ( ! $this->_userRole) {
            return FALSE;
        }

        $role = $this->get($this->_userRole);

        if ($role) {
            if (isset($role['caps'][$capability])) {
                return $role['caps'][$capability] === TRUE;
            }
        }

        return FALSE;
    }

}