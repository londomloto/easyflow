<?php
namespace App\Module\Pool;

class Pool extends \Sys\Core\Module {

    public function streamAction() {
        $start = time();
        session_write_close();
        do {
            if ((time() - $start) > 10) {
                die();
            }
            $this->send('ABC');
            sleep(5);
        } while (TRUE);
    }

    public function send($message) {
        echo "data: {\n";
        echo "data: \"message\": \"$message\"\n";
        echo "data: }\n";
        echo PHP_EOL;
        // @ob_flush();
        // flush();
    }

}