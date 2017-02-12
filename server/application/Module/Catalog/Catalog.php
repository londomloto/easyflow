<?php
namespace App\Module\Catalog;

use App\Module\Diagrams\Diagrams;

class Catalog extends \Sys\Core\Module {

    public function findAction() {
        $request = $this->request;
        $user = $this->auth->getCurrentUser();

        $options = array(
            'user_id' => $user ? $user->id : 0
        );

        if ($request->hasParam('filters')) {
            $options['filters'] = json_decode($request->getParam('filters'));
        }

        if ($request->hasParam('sorters')) {
            $options['sorters'] = json_decode($request->getParam('sorters'));
        }

        $start = $request->getParam('start');
        $limit = $request->getParam('limit');

        if ($start != '' && $limit != '') {
            $options['start'] = $start;
            $options['limit'] = $limit;
        }

        $result = Diagrams::query($options);

        foreach($result['data'] as $diagram) {
            $diagram->link = 'catalog.detail({slug: item.slug})';
        }

        $this->response->setJsonContent($result);
    }

    public function findBySlugAction() {

        $user = $this->auth->getCurrentUser();
        $slug = $this->dispatcher->getParam('slug');

        $userId = $user ? $user->id : 0;

        $options = array(
            'user_id' => $userId,
            'params' => array(
                'a.slug' => $slug
            )
        );

        $result = Diagrams::query($options, TRUE);
        $this->response->setJsonContent($result);
    }

    public function bookmarkAction() {
        $result = array(
            'success' => FALSE,
            'data' => NULL
        );

        $post = $this->request->getPost();
        $user = $this->auth->getCurrentUser();
        $diagram = Diagrams::findBySlug($this->dispatcher->getParam('slug'));

        if ($user && $diagram) {
            $result = Diagrams::bookmark($diagram->id, $user->id, $post['bookmarked']);
        } else {
            $result['message'] = _("You have to logged in first to bookmark this diagram");
        }

        if ( ! $result['success']) {
            $result['status'] = 500;
        }

        $this->response->setJsonContent($result);
    }

    public function forkAction() {
        $result = array(
            'success' => FALSE,
            'data' => NULL
        );

        $post = $this->request->getPost();
        $user = $this->auth->getCurrentUser();
        $diagram = Diagrams::findBySlug($this->dispatcher->getParam('slug'));
        
        if ($user && $diagram) {
            $result = Diagrams::fork($diagram->id, $user->id, $post['forked']);
            if ($result['success'] && $post['forked'] == 0) {
                $this->notification->notify('fork-request', $diagram, $user);
            }
        } else {
            $result['message'] = _("You have to logged in first to fork this diagram");
        }

        if ( ! $result['success']) {
            $result['status'] = 500;
        }

        $this->response->setJsonContent($result);
    }

    /**
     * Sub module forwarder
     */
    public function forwardAction() {
        $dispatcher = $this->dispatcher;

        $params = $dispatcher->getParam();
        $arguments = $dispatcher->getArguments();

        $module = 'catalog/'.$params['module'];
        $method = $params['method'];

        $dispatcher->forward(array(
            'module' => $module,
            'action' => $method,
            'params' => $params,
            'arguments' => $arguments
        ));
    }

}