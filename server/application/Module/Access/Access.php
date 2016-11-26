<?php
namespace App\Module\Access;

use Sys\Helper\Text;

class Access extends \Sys\Core\Module {
    
    public function findRoleAction($id = NULL) {
        $id = intval($id);

        if ($id) {
            $result = array(
                'success' => TRUE,
                'data' => NULL
            );

            $role = $this->db->fetchOne("SELECT * FROM role WHERE id = ?", array($id));
            $result['data'] = $role;
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

        $this->response->responseJson();
        return $result;
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

        } else {

            $this->role->authorize('update_access');

            $result['success'] = $this->db->update('role', $post, array('id' => $post['id']));
            
            if ($result['success'] && isset($post['perms'])) {
                $this->savePerm($post['perms'], TRUE);
            }
        }

        if ($result['success']) {
            $this->role->refresh();
        }

        $this->response->responseJson();
        return $result;
    }

    public function findCapAction($id = NULL) {
        $id = intval($id);

        if ($id) {
            $result = array(
                'success' => TRUE,
                'data' => NULL
            );

            $cap = $this->db->fetchOne("SELECT * FROM capability WHERE id = ?", array($id));
            $result['data'] = $cap;
        } else {
            $result = array(
                'success' => TRUE,
                'data' => array(),
                'total' => 0
            );

            $sql = "SELECT 
                        SQL_CALC_FOUND_ROWS 
                        a.id, 
                        a.name, 
                        a.title, 
                        a.description,  
                        0 as active
                    FROM 
                        capability a 
                    WHERE 1 = 1";

            $limit  = $this->request->getParam('limit');
            $start  = $this->request->getParam('start');
            $query  = $this->request->getParam('query');
            $fields = $this->request->getParam('fields');

            $params = array();

            if ( ! empty($query) && ! empty($fields)) {
                $fields = json_decode($fields);
                $where  = array();

                foreach($fields as $name) {
                    $where[]  = "$name LIKE ?";
                    $params[] = "%{$query}%";
                }

                if (count($where) > 0) {
                    $sql .= " AND (". implode(" OR ", $where) .")";
                }
            }

            $sql .= " ORDER BY name ASC";

            if ($limit != '' && $start != '') {
                $sql .= " LIMIT $start, $limit";
            }

            $caps = $this->db->fetchAll($sql, $params);
            $result['data'] = $caps;
            $result['total'] = $this->db->foundRows();
        }

        $this->response->responseJson();
        return $result;
    }

    public function saveCapAction() {
        $post = $this->request->getPost();

        $result = array(
            'success' => FALSE
        );

        if ( ! empty($post['id'])) {
            $result['success'] = $this->db->update('capability', $post, array('id' => $post['id']));
        } else {
            unset($post['id']);
            $result['success'] = $this->db->insert('capability', $post);
        }

        $this->response->responseJson();
        return $result;
    }

    function deleteCapAction($id) {
        $id = intval($id);
        $success = FALSE;

        if ($id) {
            $success = $this->db->delete('capability', array('id' => $id));
            if ( ! $success) {
                throw new \Exception($this->db->getError());
            }
        }

        $this->response->send204();
    }

    public function findPermAction() {
        $roleId = intval($this->request->getParam('role_id'));

        $result = array(
            'success' => TRUE,
            'data' => array(),
            'total' => 0
        );

        if ($roleId) {
            $sql = "
                SELECT 
                    SQL_CALC_FOUND_ROWS 
                    a.id AS capability_id,
                    a.name AS capability_name,
                    a.title AS capability_title,
                    a.description AS capability_description,
                    IFNULL(b.active, 0) AS permission_active,
                    $roleId AS role_id
                FROM
                    capability a
                    LEFT JOIN permission b ON (a.id = b.capability_id AND b.role_id = ?)
                ORDER BY a.title ASC 
            ";

            $start = $this->request->getParam('start');
            $limit = $this->request->getParam('limit');

            if ($start != '' && $limit != '') {
                $sql .= " LIMIT $start, $limit";
            }

            $perms = $this->db->fetchAll($sql, array($roleId));

            $result['data'] = $perms;
            $result['total'] = $this->db->foundRows();
        }

        $this->response->responseJson();
        return $result;

    }

    public function savePerm($perm, $batch = FALSE) {
        if (is_null($perm)) return;

        if ($batch) {

            // cleanup
            if (count($perm) > 0) {
                $roleId = $perm[0]['role_id'];
                $capIds = implode(',', array_map(function($item){ return $item['capability_id']; }, $perm));

                $sql  = "DELETE FROM permission WHERE role_id = $roleId";
                $sql .= " AND capability_id IN (" . $capIds . ")";

                $this->db->execute($sql);

                $sql  = "INSERT INTO permission (capability_id, role_id, active) VALUES ";

                foreach($perm as $item) {
                    $sql .= " ({$item['capability_id']}, {$item['role_id']}, {$item['permission_active']}),";
                }

                $sql = substr($sql, 0, -1);
                $this->db->execute($sql);
            }
        }

    }

}