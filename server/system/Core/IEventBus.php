<?php
namespace Sys\Core;

interface IEventBus {

    public function attach($eventType, $handler, $priority = 1500);
    public function detach($eventType, $handler);
    public function fire($eventType, $target, $data = NULL, $cancelable = TRUE);

}