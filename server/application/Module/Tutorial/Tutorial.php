<?php
namespace App\Module\Tutorial;

class Tutorial extends \Sys\Core\Module {

    public function findAction() {
        $result = array(
            'success' => TRUE,
            'data' => array()
        );

        $tutorials = $this->db->fetchAll("SELECT * FROM tutorial");
        $baseVideoUrl = $this->uri->getBaseUrl().'public/tutorial/';

        foreach($tutorials as $item) {
            $item->video_url = $baseVideoUrl.$item->video;
            $item->poster_url = $item->poster ? $baseVideoUrl.$item->poster : '';
        }

        $result['data'] = $tutorials;

        $this->response->responseJson();
        return $result;
    }

}