<?php
namespace App\Plugin;

class Module {

    public function onSetupAction($event) {
        $data = $event->getData();

        $method = $data['method'];
        $action = $data['action'];

        $authenticate = FALSE;
        $comment = $method->getDocComment();
        
        if ($comment) {
            // $pattern = '#(@[a-zA-Z]+\s*[a-zA-Z0-9, ()_].*)#';
            $pattern = '#(@Authenticate)#';

            if (preg_match($pattern, $comment, $matches)) {
                $authenticate = TRUE;
            }
        }

        $action->authenticate = $authenticate;
    }

}