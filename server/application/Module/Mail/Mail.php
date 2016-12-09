<?php
namespace App\Module\Mail;

class Mail extends \Sys\Core\Module {

    public function messageAction() {
        $result = array(
            'success' => FALSE,
            'message' => ''
        );

        $post = $this->request->getPost();

        if ( ! empty($post['email'])) {
            $post['subject'] = sprintf(_('Criticisms and suggestions from %s'), $post['fullname']);
            $post['message_date'] = date('Y-m-d H:i:s');
            $result['success'] = $this->db->insert('inbox', $post);
        } else {
            $result['message'] = _('An error ocurred while sending message');
        }

        $this->response->setJsonContent($result);
    }

    public function findTrashAction() {
        $result = array(
            'success' => TRUE,
            'message' => '',
            'data' => array()
        );

        $sql = "SELECT SQL_CALC_FOUND_ROWS * FROM inbox WHERE deleted = 1";

        $start = $this->request->getParam('start');
        $limit = $this->request->getParam('limit');

        if ($start != '' && $limit != '') {
            $sql .= " LIMIT $start, $limit";
        }

        $messages = $this->db->fetchAll($sql);

        $result['data'] = $messages;
        $result['total'] = $this->db->foundRows();

        $this->response->setJsonContent($result);
    }

    public function deleteTrashAction() {
        $post = $this->request->getPost();
        $keys = $post['keys'];

        if (count($keys) > 0) {
            $sql = "DELETE FROM inbox WHERE id IN (" . implode(", ", $keys) . ")";    
            $this->db->execute($sql);
        }
        
        $this->response->setJsonContent(array('success' => TRUE));
    }

    public function emptyTrashAction() {
        $this->db->execute("DELETE FROM inbox");
        $this->response->setJsonContent(array('success' => TRUE));
    }

}