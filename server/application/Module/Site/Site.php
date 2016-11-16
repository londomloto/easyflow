<?php
namespace App\Module\Site;

class Site  extends \Sys\Core\Module {

    public function infoAction() {
        $config = $this->getAppConfig();
        
        $site = $this->db->fetchOne("SELECT * FROM site");
        $site->server_url = $this->uri->getBaseUrl();
        $site->client_url = str_replace('/server', '', $site->server_url);

        $user = $this->session->get('CURRENT_USER');
        
        // add csrf token
        $site->csrf = $this->security->generateKey();

        $status = array(
            'site' => $site,
            'user' => $user
        );
        
        $this->response->responseJson();
        return $status;
    }

}
