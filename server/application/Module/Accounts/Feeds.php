<?php
namespace App\Module\Accounts;

use App\Module\Diagrams\Diagrams;

class Feeds extends \Sys\Core\Module {

    public function findAction() {

        $start = $this->request->getParam('start');
        $limit = $this->request->getParam('limit');
        $opts = array();

        if ($start != '' && $limit != '') {
            $opts['start'] = $start;
            $opts['limit'] = $limit;
        }

        $feeds = Diagrams::query($opts);
        $this->response->setJsonContent($feeds);

    }

}