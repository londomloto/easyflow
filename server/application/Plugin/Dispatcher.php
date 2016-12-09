<?php
namespace App\Plugin;

class Dispatcher {
    
    public function onBeforeDispatch($event) {
        $dispatcher = $event->getTarget();

        $action = $dispatcher->getAction();
        $module = $dispatcher->getModule();

        $this->validateAction($module, $action);
    }

    public function validateAction($module, $action) {
        $user = $module->auth->getCurrentUser();

        if ($user) {
            $module->role->handle($user->role);
        }

        if ($action->authenticate) {
            if ( ! $user) {
                throw new \Exception(_('Your session has been expired!'), 401);
            }    
        }
        
    }

    public function onAfterDispatch($event) {

    }

}