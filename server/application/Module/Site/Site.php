<?php
namespace App\Module\Site;

class Site extends \Sys\Core\Module {

    public function testAction() {
        
    }

    public function verifyAction() {
        $code = $this->request->getHeader('X-Application');

        if (empty($code)) {
            $code = $this->request->getParam('appid');
        }

        if ( ! empty($code)) {
            $site = $this->db->fetchOne(
                "SELECT * FROM application WHERE id = ? AND active = 1", 
                array($code)
            );    

            if ($site) {
                $site->csrf = $this->security->generateKey();
                unset($site->key);
            }

            $this->session->context($site->id);
        }
        
        $result = array(
            'success' => TRUE,
            'site' => $site
        );

        $this->response->responseJson();
        return $result;
    }

}