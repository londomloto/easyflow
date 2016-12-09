<?php
namespace App\Module\User;

use Sys\Helper\File,
    Sys\Helper\Text,
    App\Module\Diagram\Diagram as BaseDiagram;

class Bookmark extends \Sys\Core\Module {

    /**
     * @Authenticate
     */
    public function findAction($diagramId = NULL) {
        
        $diagramId = intval($diagramId);
        $single = $diagramId ? TRUE : FALSE;

        $user = $this->auth->getCurrentUser();
        $userId = $user ? $user->id : 0;

        $opts = array(
            'user_id' => $userId
        );

        if ( ! $single) {
            $opts['params'] = array(
                'c.user_id' => $userId
            );

            $start = $this->request->getParam('start');
            $limit = $this->request->getParam('limit');

            if ($start != '' && $limit != '') {
                $opts['start'] = $start;
                $opts['limit'] = $limit;
            }    

            $result = BaseDiagram::query($opts);

            foreach($result['data'] as $diagram) {
                $diagram->link = 'profile.bookmark.detail({id: item.id})';
            }
        } else {
            $opts['params'] = array(
                'a.id' => $diagramId
            );
            $result = BaseDiagram::query($opts, TRUE);
        }

        $this->response->setJsonContent($result);
    }
    
}