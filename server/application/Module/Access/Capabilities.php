<?php
namespace App\Module\Access;

class Capabilities extends \Sys\Core\Module {

    public function findAction() {
        $result = array(
            'success' => TRUE,
            'data' => array()
        );

        $roleId = intval($this->request->getParam('role_id'));

        if ($roleId) {
            $role = $this->role->findById($roleId);

            if ($role) {
                $perms = $this->role->getAvailablePermissions();

                foreach($perms as $perm) {
                    $perm['capable'] = $this->role->roleCanPerform($role, $perm['name']) ? 1 : 0;
                    $result['data'][] = $perm;
                }

            }
        }

        $this->response->setJsonContent($result);
    }

}