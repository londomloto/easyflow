<?php
namespace App\Module\Tutorial;

class Tutorial extends \Sys\Core\Module {
    
    public function findAction($id = NULL) {
        $id = intval($id);
        $baseVideoUrl = $this->url->getBaseUrl().'public/tutorial/';

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

    /**
     * @Authenticate
     */
    public function updateAction() {
        $post = $this->request->getPost();

        if ($this->request->hasFiles()) {
            $this->uploader->setup(array(
                'path' => PUBPATH.'tutorial/',
                'type' => 'mp4'
            ));

            if ($this->uploader->upload()) {
                $upload = $this->uploader->getResult();
                $post['video'] = $upload['file_name'];
                $post['video_type'] = $upload['file_type'];
            }
        }

        $result = array(
            'success' => FALSE
        );

        $result['success'] = $this->db->update('tutorial', $post, array('id' => $post['id']));

        $this->response->responseJson();
        return $result;
    }

    public function deleteAction($id) {
        $post = $this->request->getInput();

        // delete poster
        if (isset($post['poster']) && ! empty($post['poster'])) {
            \Sys\Helper\File::delete(PUBPATH.'tutorial/'.$post['poster']);
        }

        // delete video
        if (isset($post['video']) && ! empty($post['video'])) {
            \Sys\Helper\File::delete(PUBPATH.'tutorial/'.$post['video']);   
        }

        if ( ! $this->db->delete('tutorial', array('id' => $id))) {
            throw new \Exception(_('Failed to delete tutorial'));
        }

        $this->response->send204();
    }

    public function thumbnailAction($image, $width = 96, $height = 96) {
        $image = new \Sys\Library\Image(PUBPATH.'tutorial/'.$image);
        return $image->thumbnail($width, $height);
    }

}