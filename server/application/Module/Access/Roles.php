<?php
namespace App\Module\Access;

class Roles extends \Sys\Core\Module {

    public function findAction() {
        $result = array(
            'success' => TRUE,
            'data' => array(),
            'total' => 0
        );

        $sql = "SELECT SQL_CALC_FOUND_ROWS * FROM role";

        $limit = $this->request->getParam('limit');
        $start = $this->request->getParam('start');

        if ($limit != '' && $start != '') {
            $sql .= " LIMIT $start, $limit";
        }

        $roles = $this->db->fetchAll($sql);

        $result['data'] = $roles;
        $result['total'] = $this->db->foundRows();

        $this->response->setJsonContent($result);
    }

    public function findByIdAction($id) {
        $id = (int) $id;

        $result = array(
            'success' => TRUE,
            'data' => NULL
        );

        if ($id) {
            $result['data'] = $this->role->findById($id);
        }

        $this->response->setJsonContent($result);
    }

    /**
     * @authentication
     * @authorization   create_access
     */
    public function createAction() {
        $result = array(
            'success' => FALSE,
            'message' => NULL
        );

        $post = $this->request->getPost();

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

        $this->response->setJsonContent($result);
    }

    /**
     * @authentication
     * @authorization   update_access
     */
    public function updateAction($id) {
        $post = $this->request->getPost();
        
        $result = array();
        $result['success'] = $this->db->update('role', $post, array('id' => $id));
        
        if ($result['success'] && isset($post['caps'])) {
            $perms = array();

            foreach($post['caps'] as $cap) {
                if ((int)$cap['capable'] == 1) {
                    $perms[] = $cap['name'];
                }
            }

            $this->role->assignPermissionToRole((object)$post, $perms);
        }

        $this->response->setJsonContent($result);
    }

    /**
     * @authentication
     * @authorization   delete_access
     */
    public function deleteAction($id) {
        $role = $this->role->findById($id);
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
}