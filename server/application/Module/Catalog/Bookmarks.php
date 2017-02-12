<?php
namespace App\Module\Catalog;

use App\Module\Diagrams\Diagrams;

class Bookmarks extends \Sys\Core\Module {

    public function createAction() {
        $post = $this->request->getPost();
        $result = array(
            'success' => FALSE,
            'data' => NULL
        );

        $user = $this->auth->getCurrentUser();

        if ($user) {
            $result = Diagrams::bookmark($post['id'], $user->id);
        } else {
            $result['message'] = _("You have to logged in first to bookmark this diagram");
        }

        if ( ! $result['success']) {
            $result['status'] = 500;
        }

        $this->response->setJsonContent($result);
    }

    public function deleteAction($diagramId) {
        $diagram = Diagrams::findById($diagramId);
        $user = $this->auth->getCurrentUser();
        
        $result = array(
            'success' => FALSE,
            'data' => NULL
        );

        if ($user && $diagram) {
            $result = Diagrams::bookmark($diagram->id, $user->id, FALSE);
        } else {
            $result['message'] = _("You have to logged in first to unbookmark this diagram");   
        }

        if ( ! $result['success']) {
            $result['status'] = 500;
        }

        $this->response->setJsonContent($result);   
    }
}