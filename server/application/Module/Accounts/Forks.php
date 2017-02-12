<?php
namespace App\Module\Accounts;

use Sys\Helper\Validator,
    App\Module\Users\Users,
    App\Module\Diagrams\Diagrams;

class Forks extends \Sys\Core\Module {

    public function findAction() {
        $email = $this->dispatcher->getParam('email');

        $result = array(
            'success' => TRUE,
            'data' => array(),
            'total' => 0
        );

        if (Validator::isEmail($email)) {

            $user = Users::findByEmail($email);

            if ($user) {
                $options = array(
                    'user_id' => $user->id,
                    'params' => array(
                        'd.user_id' => $user->id
                    )
                );

                $start = $this->request->getParam('start');
                $limit = $this->request->getParam('limit');

                if ($start != '' && $limit != '') {
                    $options['start'] = $start;
                    $options['limit'] = $limit;
                }   

                $result = Diagrams::query($options);

                foreach($result['data'] as $diagram) {
                    $diagram->link = 'account.fork.detail({id: item.id})';
                }
            }

        }

        $this->response->setJsonContent($result);
    }

    public function findByIdAction($diagramId) {
        $email = $this->dispatcher->getParam('email');

        $result = array(
            'success' => FALSE,
            'data' => NULL
        );

        if (Validator::isEmail($email)) {
            $user = Users::findByEmail($email);
            if ($user) {
                $options = array(
                    'user_id' => $user->id,
                    'params' => array(
                        'a.id' => (int) $diagramId
                    )
                );

                $result = Diagrams::query($options, TRUE);
            }
        }

        $this->response->setJsonContent($result);
    }

    public function createAction() {
        $result = array(
            'success' => FALSE,
            'data' => NULL
        );

        $post = $this->request->getPost();
        $email = $this->dispatcher->getParam('email');

        if (Validator::isEmail($email)) {
            $user = Users::findByEmail($email);
            if ($user) {
                $result = Diagrams::fork($post['id'], $user->id, 0);
            } else {
                $result['message'] = _("User doesn't exists!");
            }
        }

        if ( ! $result['success']) {
            $result['status'] = 500;
        }

        $this->response->setJsonContent($result);
    }

    public function deleteAction($diagramId) {
        $result = array(
            'success' => FALSE,
            'data' => NULL
        );

        $email = $this->dispatcher->getParam('email');

        if (Validator::isEmail($email)) {
            $user = Users::findByEmail($email);
            if ($user) {
                $result = Diagrams::fork($diagramId, $user->id, 1);
            }
        }

        $this->response->setJsonContent($result);
    }

}