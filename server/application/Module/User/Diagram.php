<?php
namespace App\Module\User;

use \Sys\Helper\File;

class Diagram extends \Sys\Core\Module {

    public function findAction() {
        $user = $this->auth->getUser();

        $data = array(
            'success' => TRUE,
            'data' => array(),
            'total' => 0
        );

        if ($user) {

            $query = $this->request->getParam('query');

            if ( ! empty($query)) {
                $diagrams = $this->db->fetchAll(
                    "SELECT * FROM diagram WHERE user_id = ? AND (name LIKE ? OR description LIKE ?)", 
                    array($user->id, "%{$query}%", "%{$query}%")
                );
            } else {
                $diagrams = $this->db->fetchAll("SELECT * FROM diagram WHERE user_id = ?", array($user->id));
            }
            
            $baseCoverUrl = $this->url->getBaseUrl().'public/diagram/';


            foreach($diagrams as $diagram) {
                $diagram->cover_url = $baseCoverUrl.$diagram->cover;
            };

            $data['data'] = $diagrams;
            $data['total'] = $this->db->foundRows();
        }

        $this->response->responseJson();
        return $data;
    }

    public function testAction() {
        $this->response->send404();
    }

    public function thumbnailAction($image, $width = 242, $height = 200) {
        if ( ! empty($image)) {
            $image = new \Sys\Library\Image(PUBPATH.'diagram/'.$image);
            $image->thumbnail($width, $height);
        } else {
            $this->response->send404();
        }
    }

    public function updateAction() {
        
        if ($this->request->hasFiles()) {
            $post = $this->request->getPost();

            $this->uploader->setup(array(
                'path' => PUBPATH.'diagram/'
            ));

            if ($this->uploader->upload()) {
                $upload = $this->uploader->getResult();
                $post['cover'] = $upload['file_name'];
                $post['cover_url'] = $this->url->getBaseUrl().'public/diagram/'.$upload['file_name'];
            }
        } else {
            $post = $this->request->getInput();
        }

        $result = array(
            'success' => FALSE,
            'message' => '',
            'data' => $post
        );

        if (empty($post['created_date'])) {
            
        }

        $post['updated_date'] = date('Y-m-d H:i:s');

        $result['success'] = $this->db->update(
            'diagram',
            $post,
            array(
                'id' => $post['id']
            )
        );

        if ($result['success']) {
            $result['data'] = $post;
        } else {
            $result['message'] = $this->db->getError();
        }

        $this->response->responseJson();
        return $result;
    }

    public function removeAction() {
        $post = $this->request->getInput();
        $data = array(
            'success' => FALSE
        );

        if (isset($post['id']) && ! empty($post['id'])) {
            // remove cover first
            File::delete(PUBPATH.'diagram/'.$post['cover']);

            $data['success'] = $this->db->delete(
                'diagram',
                array(
                    'id' => $post['id']
                )
            );
        }

        $this->response->responseJson();
        return $data;
    }

}