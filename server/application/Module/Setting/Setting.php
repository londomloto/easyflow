<?php
namespace App\Module\Setting;

class Setting extends \Sys\Core\Module {
    
    public function loadAction() {
        $result = array(
            'success' => TRUE,
            'data' => NULL
        );

        $result['data'] = $this->setting->load();
        
        $this->response->responseJson();
        return $result;
    }

    public function saveAction() {
        $result = array(
            'success' => FALSE,
            'message' => NULL
        );

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

        $this->response->responseJson();
        return $result;
    }

    public function generateKeyAction() {
        $result = array(
            'success' => TRUE,
            'data' => $this->security->generateKey()
        );

        $this->response->responseJson();
        return $result;
    }

}