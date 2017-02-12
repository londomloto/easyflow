<?php
namespace App\Module\Accounts;

use Sys\Helper\Validator,
    App\Module\Users\Users,
    App\Module\Diagrams\Diagrams as Base;

class Diagrams extends \Sys\Core\Module {

    /**
     * @authentication
     */
    public function findAction() {
        $email = $this->dispatcher->getParam('email');

        $result = array(
            'success' => TRUE,
            'data' => array(),
            'total' => 0
        );

        if (Validator::isEmail($email)) {

            $user = Users::findByEmail($email);

            $opts = array(
                'user_id' => $user ? $user->id : 0,
                'params' => array(
                    'b.id' => $user ? $user->id: 0
                )
            );

            $start = $this->request->getParam('start');
            $limit = $this->request->getParam('limit');

            if ($start != '' && $limit != '') {
                $opts['start'] = $start;
                $opts['limit'] = $limit;
            }
            
            $result = Base::query($opts);

        }

        $this->response->setJsonContent($result);
    }

    /**
     * @authentication
     */
    public function findByIdAction($id) {
        $id = (int) $id;
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
                        'a.id' => $id
                    )
                );

                $result = Base::query($options, TRUE);
            }
        }

        $this->response->setJsonContent($result);
    }

    public function findBySlugAction($slug) {
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
                        'a.slug' => $slug
                    )
                );

                $result = Base::query($options, TRUE);
            }
        }

        $this->response->setJsonContent($result);
    }
    
    /**
     * @authentication
     */
    public function updateAction($id) {
        
    }
}