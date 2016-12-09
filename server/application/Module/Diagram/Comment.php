<?php
namespace App\Module\Diagram;

class Comment extends \Sys\Core\Module {

    public function findAction($identity) {
        $result = array(
            'success' => TRUE,
            'data' => array(),
            'total' => 0
        );

        $sql = "
            SELECT
                SQL_CALC_FOUND_ROWS 
                a.*,
                c.fullname AS user_fullname,
                c.email AS user_email,
                c.avatar AS user_avatar,
                0 AS editing
            FROM 
                comment a
                JOIN diagram b ON (a.diagram_id = b.id)
                JOIN user c ON (a.user_id = c.id)
            WHERE 1 = 1 
        ";

        if (is_numeric($identity)) {
            $sql .= " AND b.id = ?";
        } else {
            $sql .= " AND b.slug = ?";
        }

        $params = array($identity);
        $comments = $this->db->fetchAll($sql, $params);

        $user = $this->auth->getCurrentUser();
        $userId = $user ? $user->id : NULL;

        foreach($comments as $comment) {
            $comment->editable = $userId === $comment->user_id;
            $comment->removable = $userId === $comment->user_id;
        }

        $result['data'] = $comments;
        $result['total'] = $this->db->foundRows();

        $this->response->setJsonContent($result);
    }

    public function createAction($slug) {
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
            $diagram = Diagram::findBySlug($slug);
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

    public function updateAction($slug, $commentId) {
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

    public function deleteAction($slug, $commentId) {
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