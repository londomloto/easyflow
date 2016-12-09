<?php
namespace App\Module\Diagram;

class Catalog extends \Sys\Core\Module {

    public function findAction($slug = NULL) {

        $request = $this->request;
        $user = $this->auth->getCurrentUser();

        $opts = array(
            'user_id' => $user ? $user->id : 0
        );

        if ( ! is_null($slug)) {
            $opts['params'] = array(
                'a.slug' => $slug
            );
        }

        if ($request->hasParam('filters')) {
            $opts['filters'] = json_decode($request->getParam('filters'));
        }

        if ($request->hasParam('sorters')) {
            $opts['sorters'] = json_decode($request->getParam('sorters'));
        }

        $start = $request->getParam('start');
        $limit = $request->getParam('limit');

        if ($start != '' && $limit != '') {
            $opts['start'] = $start;
            $opts['limit'] = $limit;
        }

        $result = Diagram::query($opts, is_null($slug) ? FALSE : TRUE);

        foreach($result['data'] as $diagram) {
            $diagram->link = 'catalog.detail({slug: item.slug})';
        }

        $this->response->setJsonContent($result);

    }

}