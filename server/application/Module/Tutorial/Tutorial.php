<?php
namespace App\Module\Tutorial;

class Tutorial extends \Sys\Core\Module {

    public function findAction($id = NULL) {
        $id = intval($id);
        $baseVideoUrl = $this->uri->getBaseUrl().'public/tutorial/';

        if ($id) {
            $result = array(
                'success' => TRUE,
                'data' => NULL
            );

            $tutorial = $this->db->fetchOne("SELECT * FROM tutorial WHERE id = ?", array($id));

            $tutorial->video_url = $baseVideoUrl.$tutorial->video;
            $tutorial->poster_url = $tutorial->poster ? $baseVideoUrl.$tutorial->poster : '';

            $result['data'] = $tutorial;
        } else {
            $result = array(
                'success' => TRUE,
                'data' => array()
            );    

            $tutorials = $this->db->fetchAll("SELECT * FROM tutorial");
            
            foreach($tutorials as $item) {
                $item->video_url = $baseVideoUrl.$item->video;
                $item->poster_url = $item->poster ? $baseVideoUrl.$item->poster : '';
            }

            $result['data'] = $tutorials;
        }
        
        $this->response->responseJson();
        return $result;
    }

    public function createAction() {
        $post = $this->request->getInput();

        $result = array(
            'success' => FALSE,
            'data' => NULL
        );

        $result['success'] = $this->db->insert('tutorial', $post);

        if ($result['success']) {
            $result['data'] = $this->db->fetchOne(
                "SELECT * FROM tutorial WHERE id = ?",
                array($this->db->insertId())
            );
        }

        $this->response->responseJson();

        return $result;
    }

    public function updateAction() {
        $post = $this->request->getInput();
        $result = array(
            'success' => FALSE
        );

        $result['success'] = $this->db->update('tutorial', $post, array('id' => $post['id']));

        $this->response->responseJson();
        return $result;
    }

    public function thumbnailAction($image, $width = 96, $height = 96) {
        $image = new \Sys\Library\Image(PUBPATH.'tutorial/'.$image);
        return $image->thumbnail($width, $height);
    }

}