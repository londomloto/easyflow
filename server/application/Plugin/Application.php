<?php
namespace App\Plugin;

use Sys\Core\IEventObject;

class Application  {

    public function onInitialize(IEventObject $event) {
        $this->setupApp($event->getTarget());
    }

    public function setupApp($app) {

        $request = $app->getRequest();
        $registry = $app->getRegistry();

        if ($request->hasHeader('X-Contex')) {
            $ctx = $request->getHeader('X-Contex');
        } else if ($request->hasParam('context')) {
            $ctx = $request->getParam('context');
        } else {
            $ctx = 'FRONTEND';
        }

        $registry->set('context', $ctx);

        $app->getSetting()->apply();
    }

}
