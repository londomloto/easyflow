<?php
namespace App\Module\Mail;

class Inbox extends \Sys\Core\Module {

    public function findAction($id = NULL) {
        $id = intval($id);

        $result = array(
            'success' => FALSE,
            'message' => '',
            'data' => NULL
        );

        if ($id) {
            $result['success'] = TRUE;
            $result['data'] = $this->db->fetchOne("SELECT * FROM inbox WHERE deleted = 0 AND id = ?", array($id));
        } else {
            $sql = "
                SELECT 
                    SQL_CALC_FOUND_ROWS 
                    id,
                    fullname,
                    SUBSTR(fullname, 1, 1) AS initial,
                    email,
                    subject,
                    message,
                    message_date
                FROM 
                    inbox 
                WHERE 
                    deleted = 0";

            $start = $this->request->getParam('start');
            $limit = $this->request->getParam('limit');

            if ($start != '' && $limit != '') {
                $sql .= " LIMIT $start, $limit";
            }

            $messages = $this->db->fetchAll($sql);

            $result['success'] = TRUE;
            $result['data'] = $messages;
            $result['total'] = $this->db->foundRows();
        }

        $this->response->setJsonContent($result);
    }

    public function replyAction() {
        $result = array(
            'success' => FALSE,
            'message' => ''
        );

        $post = $this->request->getPost();
        $site = $this->site->getCurrentSite();

        if ($site) {
            $this->mailer->from($site->email, $site->author);
            $this->mailer->to($post['to']);
            $this->mailer->subject($post['subject']);
            $this->mailer->message($post['message']);

            if ($this->mailer->send()) {
                $result['success'] = TRUE;
            } else {
                $result['message'] = $this->mailer->getError();
            }
        } else {
            throw new \Exception(_('Invalid application context'));
        }

        $this->response->setJsonContent($result);
    }

    public function deleteAction($id) {
        $id = intval($id);

        if ($this->db->update('inbox', array('deleted' => 1), array('id' => $id))) {
            $this->response->send204();
        } else {
            throw new \Exception($this->db->getError());
        }
    }

}