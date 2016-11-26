<?php
namespace App\Plugin;

class Dispatcher {
    
    public function onBeforeDispatch($event) {
        $dispatcher = $event->getTarget();

        $action = $dispatcher->getAction();
        $module = $dispatcher->getModule();

        if ($action->authenticate) {
            $this->authenticateAction($module);
        }
        
    }

    public function authenticateAction($module) {
        $user = $module->auth->getCurrentUser();
        if ( ! $user) {
            throw new \Exception(_('Your session has been expired!'), 401);
        }
    }

    public function onAfterDispatch($event) {

    }

}