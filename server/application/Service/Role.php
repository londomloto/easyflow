<?php
namespace App\Service;

class Role extends \Sys\Core\Component {

    public function __construct(\Sys\Core\IApplication $app) {
        parent::__construct($app);

        if ($app->getConfig()->application->has('role')) {
            $this->_config = $app->getConfig()->application->role;
        } else {
            $this->_config = new \Sys\Core\Config(array(
                'source_role' => 'role',
                'source_caps' => 'capability',
                'source_perm' => 'permission'
            ));
        }

        $this->_db = $app->getDefaultDatabase();
    }

    public function handle($role) {
        if ( ! $role) {
            $this->invalidate();
            return;
        }

        $session = $this->getSession();

        if ($session->has('CURRENT_ROLE')) {
            if ($session->get('CURRENT_ROLE') == $role) {
                return;
            }
        }

        $sourceRole = $this->_config->source_role;
        $sourceCaps = $this->_config->source_caps;
        $sourcePerm = $this->_config->source_perm;

        $role = $this->_db->fetchOne("SELECT * FROM {$sourceRole} WHERE name = ?", array($role));

        if ($role) {
            
            $session->set('CURRENT_ROLE', $role->name);

            $sql = "
                SELECT 
                    `a`.`name` AS `name`,
                    IFNULL(`b`.`active`, 0) AS `active`
                FROM
                    `{$sourceCaps}` `a`
                    LEFT JOIN `{$sourcePerm}` `b` ON (`a`.`id` = `b`.`capability_id` AND `b`.`role_id` = ?)
            ";

            $caps = $this->_db->fetchAll($sql, array($role->id));
            $data = array();

            foreach($caps as $row) {
                $data[$row->name] = $row->active;
            }

            $session->set('CURRENT_CAPS', json_encode($data));
        }
    }

    public function refresh() {
        $user = $this->getServiceInstance('auth')->getCurrentUser();
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
        $session->remove('CURRENT_CAPS');
    }

    public function getCurrentRole() {
        $session = $this->getSession();
        return $session->get('CURRENT_ROLE');
    }

    public function can($capability) {
        $caps = $this->getCapabilities();
        return isset($caps->{$capability}) ? !!$caps->{$capability} : FALSE;
    }

    public function authorize($capability) {
        $user = $this->getAuth()->getCurrentUser();

        if ($user) {
            $this->handle($user->role);
        }
        
        if ( ! $this->can($capability)) {
            throw new SecurityException(_("You don't have permission to perform this action"), 403);
        }
    }

    public function getCapabilities() {
        $session = $this->getSession();
        if ( ! $session->has('CURRENT_ROLE')) {
            return array();
        }

        $caps = $session->get('CURRENT_CAPS');
        $caps = json_decode($caps);

        return $caps;
    }
    
}