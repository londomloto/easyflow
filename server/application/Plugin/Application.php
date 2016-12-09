<?php
namespace App\Plugin;

use Sys\Core\IEventObject;

class Application  {

    public function onInitialize(IEventObject $event) {
        $this->setupApp($event->getTarget());
    }

    public function setupApp($app) {
        $request  = $app->getRequest();
        $registry = $app->getRegistry();
        
        if ($request->hasHeader('X-Context')) {
            $ctx = $request->getHeader('X-Context');
        } else if ($request->hasParam('context')) {
            $ctx = $request->getParam('context');
        } else {
            $ctx = 'FRONTEND';
        }

        $registry->set('context', $ctx);

        $db = $app->getDefaultDatabase();

        if ($db->isConnected()) {
            $app->getSetting()->apply();
        }

        // add twig function
        $template = $app->getTemplate();
        $role = $app->getRole();
        
        $template->addFunction('can', function($perm) use ($role) {
            return $role->can($perm);
        });
    }

}
