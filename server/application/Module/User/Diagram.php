<?php
namespace App\Module\User;

use Sys\Helper\File,
    Sys\Helper\Text,
    App\Module\Diagram\Diagram as BaseDiagram;

class Diagram extends \Sys\Core\Module {

    /**
     * @Authenticate
     */
    public function findAction($id = NULL) {
        $id = intval($id);

        if ( ! $id) {

            $user = $this->auth->getCurrentUser();

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
            
            $result = BaseDiagram::query($opts);

        } else {
            $opts = array(
                'params' => array(
                    'a.id' => $id
                )
            );

            $result = BaseDiagram::query($opts, TRUE);
        }

        $this->response->setJsonContent($result);
    }
    
}