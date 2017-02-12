<?php
namespace App\Module\Tutorials;

use Sys\Helper\File;

class Tutorials extends \Sys\Core\Module {

    public function findAction() {
        $result = array(
            'success' => TRUE,
            'data' => array()
        );    

        $tutorials = $this->db->fetchAll("SELECT * FROM tutorial");
        $baseVideoUrl = $this->url->getBaseUrl().'public/tutorial/';
        
        foreach($tutorials as $item) {
            $item->video_url = $baseVideoUrl.$item->video;
            $item->poster_url = $item->poster ? $baseVideoUrl.$item->poster : '';
        }

        $result['data'] = $tutorials;
        $this->response->setJsonContent($result);
    }

    public function findByIdAction($id) {
        $id = (int) $id;

        $result = array(
            'success' => TRUE,
            'data' => NULL
        );

        $baseVideoUrl = $this->url->getBaseUrl().'public/tutorial/';
        $tutorial = $this->db->fetchOne("SELECT * FROM tutorial WHERE id = ?", array($id));

        $tutorial->video_url = $baseVideoUrl.$tutorial->video;
        $tutorial->poster_url = $tutorial->poster ? $baseVideoUrl.$tutorial->poster : '';

        $result['data'] = $tutorial;
        $this->response->setJsonContent($result);
    }
    
    /**
     * @authentication
     * @authorization   create_tutorial
     */    
    public function createAction() {
        $post = $this->request->getPost();

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

        $this->response->setJsonContent($result);
    }

    /**
     * @authentication
     * @authorization   update_tutorial
     */
    public function updateAction($id) {
        $post = $this->request->getPost();

        if ($this->request->hasFiles()) {
            $this->uploader->setup(array(
                'path' => PUBPATH.'tutorial'.DS,
                'type' => 'mp4'
            ));

            if ($this->uploader->upload()) {
                if ( ! empty($post['video'])) {
                    File::delete(PUBPATH.'tutorial'.DS.$post['video']);
                }
                $upload = $this->uploader->getResult();
                $post['video'] = $upload['file_name'];
                $post['video_type'] = $upload['file_type'];
            }
        }

        $result = array(
            'success' => FALSE
        );

        $result['success'] = $this->db->update('tutorial', $post, array('id' => $post['id']));
        $this->response->setJsonContent($result);
    }

    public function deleteAction($id) {
        $id = (int) $id;
        
        $tutorial = $this->db->fetchOne('SELECT * FROM tutorial WHERE id = ?', array($id));

        if ($tutorial) {
            if ( ! empty($tutorial->video)) {
                File::delete(PUBPATH.'tutorial/'.$tutorial->video);
            }

            if ( ! $this->db->delete('tutorial', array('id' => $id))) {
                throw new \Exception(_('Failed to delete tutorial'));
            }
        }

        $this->response->send204();
    }
}