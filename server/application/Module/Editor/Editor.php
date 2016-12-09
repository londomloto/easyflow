<?php
namespace App\Module\Editor;

class Editor extends \Sys\Core\Module {

    public function saveAction() {
        $user = $this->auth->getCurrentUser();

        $data = array(
            'success' => FALSE,
            'message' => ''
        );

        if ($user) {
            if ($this->request->hasFiles()) {
                $post = $this->request->getPost();

                $this->uploader->setup(array(
                    'path' => PUBPATH.'diagram/'
                ));

                if ($this->uploader->upload()) {
                    $upload = $this->uploader->getResult();
                    $post['cover'] = $upload['file_name'];
                }

            } else {
                $post = $this->request->getInput();
            }

            if (isset($post['id']) && ! empty($post['id'])) {
                // update
            } else {
                // create
                $post['user_id'] = $user->id;
                $post['user_contrib'] = 'CREATE';
                $post['created_date'] = date('Y-m-d H:i:s');
                $post['updated_date'] = date('Y-m-d H:i:s');

                $data['success'] = $this->db->insert('diagram', $post);

                if ($data['success']) {
                    $diagram = $this->db->fetchOne(
                        "SELECT * FROM diagram WHERE id = ?", 
                        array($this->db->insertId())
                    );

                    $data['data'] = $diagram;
                }
            }    
        } else {
            $data['message'] = 'Anda tidak diperkenankan melakukan tindakan ini';
        }

        $this->response->setJsonContent($data);
    }

}