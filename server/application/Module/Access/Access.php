<?php
namespace App\Module\Access;

use Sys\Helper\Text;

class Access extends \Sys\Core\Module {
    
    public function findRoleAction($id = NULL) {
        $id = intval($id);

        if ($id) {
            $result = array(
                'success' => TRUE,
                'data' => $this->role->findById($id)
            );
        } else {
            $result = array(
                'success' => TRUE,
                'data' => array(),
                'total' => 0
            );

            $query = "SELECT SQL_CALC_FOUND_ROWS * FROM role";
            $limit = $this->request->getParam('limit');
            $start = $this->request->getParam('start');

            if ($limit != '' && $start != '') {
                $query .= " LIMIT $start, $limit";
            }

            $roles = $this->db->fetchAll($query);

            $result['data'] = $roles;
            $result['total'] = $this->db->foundRows();
        }

        $this->response->setJsonContent($result);
    }

    /**
     * @Authenticate
     */
    public function saveRoleAction() {
        
        $result = array(
            'success' => FALSE
        );
        
        $post = $this->request->getPost();
        $create = ! isset($post['id']) || (isset($post['id']) && empty($post['id']));
        
        if ($create) {
            $this->role->validate('create_access');

            if ($this->role->has($post['name'])) {
                $result['message'] = _("Data already exists!");
            } else {
                $result['success'] = $this->db->insert('role', $post);

                if ($result['success']) {
                    $result['data'] = $this->db->fetchOne(
                        "SELECT * FROM role WHERE id = ?",
                        array($this->db->insertId())
                    );
                }    
            }

        } else {
            $this->role->validate('update_access');

            $result['success'] = $this->db->update('role', $post, array('id' => $post['id']));
            
            if ($result['success'] && isset($post['caps'])) {
                $perms = array();

                foreach($post['caps'] as $cap) {
                    if ((int)$cap['capable'] == 1) {
                        $perms[] = $cap['name'];
                    }
                }

                $this->role->assignPermissionToRole((object)$post, $perms);
            }
        }

        if ($result['success']) {
            $this->role->refresh();
        }

        $this->response->setJsonContent($result);
    }

    /**
     * @Authenticate
     */
    public function deleteRoleAction($id) {
        $role = $this->role->getById($id);
        $error = FALSE;

        if ($role) {
            if ($role->removable) {
                if ( ! $this->db->delete('role', array('id' => $id))) {
                    $error = $this->db->getError();
                }
            } else {
                $error = _('Unable to delete data');
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

    public function findPermAction() {
        $result = array(
            'success' => TRUE,
            'data' => $this->role->getAvailablePermissions()
        );

        $this->response->setJsonContent($result);
    }

    public function findCapAction() {
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