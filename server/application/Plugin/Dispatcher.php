<?php
namespace App\Plugin;

class Dispatcher {
    
    public function onBeforeDispatch($event) {
        $dispatcher = $event->getTarget();

        $hander = $dispatcher->getHandler();
        $module = $dispatcher->getModule();

        $this->validateHandler($module, $hander);
    }
    
    public function validateHandler($module, $hander) {
        $user = $module->auth->getCurrentUser();

        if ($user) {
            $module->role->handle($user->role);
        }

        if ($hander->authentication) {
            if ( ! $user) {
                throw new \Exception(_('Your session has been expired!'), 401);
            }    
        }

        if ($hander->authorization != '*') {
            $module->role->validate($hander->authorization);
        }
        
    }

    public function onAfterDispatch($event) {

    }

}