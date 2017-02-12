<?php
namespace App\Plugin;

class Module {

    public function onSetupAction($event) {
        $data = $event->getData();

        $method = $data['method'];
        $action = $data['action'];

        $comment = $method->getDocComment();

        $authentication = FALSE;
        $authorization = '*';
        
        if ($comment) {
            $lines = explode('*', $comment);
            $rules = array();

            foreach($lines as $line) {
                if (preg_match('/@(\w+)\s?(.*)/', $line, $match)) {
                    if ($match[1] == 'authentication') {
                        $authentication = TRUE;
                    } else if ($match[1] == 'authorization') {
                        $authorization = str_replace(' ', '', $match[2]);
                    }
                }
            }
        }

        $action->authentication = $authentication;
        $action->authorization = $authorization;
    }

}