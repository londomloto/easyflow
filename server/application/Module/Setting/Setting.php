<?php
namespace App\Module\Setting;

class Setting extends \Sys\Core\Module {
    
    public function loadAction() {
        $result = array(
            'success' => TRUE,
            'data' => NULL
        );

        $result['data'] = $this->setting->load();
        
        $this->response->setJsonContent($result);
    }

    /**
     * @authentication
     */
    public function saveAction() {

        $result = array(
            'success' => FALSE,
            'message' => NULL
        );

        if ($this->role->can('update_app')) {

            $post = $this->request->getPost();
            $rows = array();

            foreach($post as $key => $val) {
                $rows[] = array(
                    'name'  => $key,
                    'value' => $val
                );
            }

            $result['success'] = $this->setting->set($rows);

            if ( ! $result['succes']) {
                $result['message'] = $this->db->getError();
            }

        } else {
            $result['status'] = 403;
            $result['message'] = _("You don't have permission to update application settings");
        }

        $this->response->setJsonContent($result);
    }

    public function generateKeyAction() {
        $result = array(
            'success' => TRUE,
            'data' => $this->security->generateKey()
        );

        $this->response->setJsonContent($result);
    }

}