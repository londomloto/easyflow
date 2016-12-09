<?php
namespace App\Module\User;

use App\Module\Diagram\Diagram as BaseDiagram;

class Comment extends \Sys\Core\Module {

    public function findAction($diagramId) {
        $result = array(
            'success' => TRUE,
            'data' => array(),
            'total' => 0
        );

        $sql = "
            SELECT
                SQL_CALC_FOUND_ROWS 
                a.*,
                b.user_id AS diagram_user_id,
                c.fullname AS user_fullname,
                c.email AS user_email,
                c.avatar AS user_avatar,
                0 AS editing
            FROM 
                comment a
                JOIN diagram b ON (a.diagram_id = b.id)
                JOIN user c ON (a.user_id = c.id)
            WHERE b.id = ?
        ";

        $params = array($diagramId);
        $comments = $this->db->fetchAll($sql, $params);

        $user = $this->auth->getCurrentUser();
        $userId = $user ? $user->id : NULL;

        foreach($comments as $comment) {
            $editable = ($comment->user_id == $userId || $comment->diagram_user_id == $userId) ? 1 : 0;

            $comment->editable  = $editable;
            $comment->removable = $editable;
        }

        $result['data'] = $comments;
        $result['total'] = $this->db->foundRows();

        $this->response->setJsonContent($result);
    }

    public function createAction($diagramId) {
        $post = $this->request->getPost();
        $user = $this->auth->getCurrentUser();

        $result = array(
            'success' => FALSE,
            'message' => NULL
        ); 

        if ( ! $user) {
            $result['message'] = _('You have to logged in first to post comment');
        } else if (empty($post['message'])) {
            $result['message'] = _("Comment can't be empty");
        } else {
            $diagram = BaseDiagram::findById($diagramId);
            if ( ! $diagram) {
                $result['message'] = _("Diagram doesn't exists");
            } else {
                $result['success'] = $this->db->insert(
                    'comment',
                    array(
                        'message' => $post['message'],
                        'diagram_id' => $diagram->id,
                        'user_id' => $user->id,
                        'post_date' => date('Y-m-d H:i:s')
                    )
                );
            }
        }

        if ( ! $result['success']) {
            $result['status'] = 500;
        }

        $this->response->setJsonContent($result);   
    }

    public function updateAction($diagramId, $commentId) {
        $result = array(
            'success' => FALSE,
            'message' => NULL
        );

        $post = $this->request->getPost();

        if ( ! empty($post['message'])) {
            $result['success'] = $this->db->update(
                'comment',
                array(
                    'message' => $post['message']
                ),
                array(
                    'id' => $commentId
                )
            );

            if ( ! $result['success']) {
                $result['status'] = 500;
                $result['message'] = $this->db->getError();
            }
        } else {
            $result['status'] = 500;
            $result['message'] = _("Comment can't be empty!");
        }

        $this->response->setJsonContent($result);      
    }

    public function deleteAction($diagramId, $commentId) {
        $result = array(
            'success' => FALSE,
            'message' => NULL
        );

        if ($this->db->delete('comment', array('id' => $commentId))) {
            $result['success'] = TRUE;
        } else {
            $result['status'] = 500;
            $result['message'] = $this->db->getError();
        }

        $this->response->setJsonContent($result);      
    }

}