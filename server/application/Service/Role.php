<?php
namespace App\Service;

class Role extends \Sys\Core\Component {

    protected $_permissions;

    public function __construct(\Sys\Core\IApplication $app) {
        parent::__construct($app);

        if ($app->getConfig()->application->has('role')) {
            $this->_config = $app->getConfig()->application->role;
        } else {
            $this->_config = new \Sys\Core\Config(array(
                'source' => 'role'
            ));
        }

        $this->_permissions = $app->getConfig()->permissions;
        $this->_db = $app->getDefaultDatabase();
    }

    public function findBy($field, $value) {
        $source = $this->_config->source;
        $params = array($value);
        return $this->_db->fetchOne("SELECT * FROM {$source} WHERE {$field} = ?", array($value));
    }

    public function findById($id) {
        return $this->findBy('id', $id);
    }

    public function findByName($name) {
        return $this->findBy('name', $name);
    }

    public function findDefault() {
        return $this->findBy('is_default', 1);
    }

    public function getAvailablePermissions() {
        $perms = array();

        foreach($this->_permissions as $key => $spec) {
            $spec = $spec->toArray();
            $spec['name'] = $key;
            $perms[] = $spec;
        }

        return $perms;
    }

    public function getPermissions() {
        $session = $this->getSession();

        if ( ! $session->has('CURRENT_ROLE')) {
            return array();
        }

        $perms = $session->get('CURRENT_PERMISSIONsS');
        $perms = json_decode($perms);

        return $perms;
    }

    public function getPermissionWeight($name) {
        $name = trim($name);

        if ($this->_permissions->has($name)) {
            return pow(2, $this->_permissions->{$name}->value);
        }
        return 0;
    }

    public function assignPermissionToRole($role, $perms) {
        $bit = 0;

        if ($role) {
            
            foreach($perms as $key) {
                $bit |= $this->getPermissionWeight($key);
            }
        }

        $source = $this->_config->source;
        $this->_db->execute("UPDATE {$source} SET permission = ? WHERE id = ?", array($bit, $role->id));
    }

    public function assign($perms) {
        $role = $this->getCurrentRole();
        $this->assignPermissionToRole($role->name, $perms);
    }

    public function roleHasPermission($role, $perm) {
        if ($role) {
            $weight = $this->getPermissionWeight($perm);
            return ((int)$role->permission & $weight);
        }
        return 0;
    }

    public function has($perm) {
        $role = $this->getCurrentRole();
        return $this->roleHasPermission($perm);
    }

    public function roleCanPerform($role, $perm) {
        if ($role) {

            $self = $this;
            $perm = explode('&', $perm);
            
            if (count($perm) > 0) {
                $curr = (int)$role->permission;
                $able = TRUE;

                // array_every
                foreach($perm as $p) {
                    $able = !!($curr & $this->getPermissionWeight($p));
                    if ( ! $able) {
                        break;
                    }
                }

                return $able;
            } else {
                return FALSE;
            }
        }
        return FALSE;
    }

    public function can($perm) {
        $role = $this->getCurrentRole();
        return $this->roleCanPerform($role, $perm);
    }

    public function handle($name) {
        if ( ! $name) {
            $this->invalidate();
            return;
        }

        $session = $this->getSession();

        if ($session->has('CURRENT_ROLE') && $session->get('CURRENT_ROLE') == $name) {
            return;
        }

        $role = $this->findByName($name);

        if ($role) {
            $session->set('CURRENT_ROLE', $role);
        }
    }

    public function refresh() {
        $user = $this->getAuth()->getCurrentUser();
        $role = $this->getCurrentRole();

        if ($user && $role) {
            if ($user->role == $role) {
                $this->invalidate();
                $this->handle($role);
            }
        }
    }

    public function invalidate() {
        $session = $this->getSession();
        $session->remove('CURRENT_ROLE');
    }

    public function getCurrentRole() {
        $session = $this->getSession();
        return $session->get('CURRENT_ROLE');
    }

    public function validate($perm) {
        if ( ! $this->can($perm)) {
            throw new \Exception(_("You don't have permission to perform this action"), 403);
        }
    }
    
}