<?php
namespace Sys\Core;

use Sys\Helper\Text;

class EventBus implements IEventBus {

    protected $_listeners;

    public function __construct() {
        $this->_listeners = array();
    }

    public function attach($eventType, $handler, $priority = 1500) {
        if ( ! is_object($handler)) {
            throw new \Exception(_('Event handler must be an Object'));
        }

        if ( ! isset($this->_listeners[$eventType])) {
            $this->_listeners[$eventType] = array();
        }

        $this->_listeners[$eventType][] = $handler;
    }

    public function detach($eventType, $handler) {

    }

    public function fire($eventType, $target, $data = NULL, $cancelable = TRUE) {
        $lsnr = $this->_listeners;

        if (strchr($eventType, ':') === FALSE) {
            throw new \Exception(sprintf(_("Invalid event type '%s'"), $eventType));
        }

        $part = explode(':', $eventType);
        $comp = $part[0];
        $type = $part[1];

        $event = NULL;
        $status = NULL;

        if (isset($lsnr[$comp])) {
            if (is_array($lsnr[$comp]) || is_object($lsnr[$comp])) {
                $event = new EventObject($type, $target, $data, $cancelable);
                $status = $this->fireQueue($lsnr[$comp], $event);
            }
        }

        if (isset($lsnr[$eventType])) {
            if (is_array($lsnr[$eventType]) || is_object($lsnr[$eventType])) {
                if (is_null($event)) {
                    $event = new EventObject($type, $target, $data, $cancelable);
                }
                $status = $this->fireQueue($lsnr[$eventType], $event);
            }
        }
        
        return $status;
    }

    public function fireQueue($queue, IEventObject $event) {
        if ( ! is_array($queue)) {
            if (is_object($queue)) {
                // check heap
            } else {
                throw new \Exception(_('The queue is not valid'));
            }
        }

        $status = NULL;
        $target = $event->getTarget();
        $type = $event->getType();
        $data = $event->getData();
        $cancelable = $event->isCancelable();
        $method = 'on'.Text::camelize($type);

        if (is_object($queue)) {

        } else {
            foreach($queue as $handler) {
                if (is_object($handler)) {
                    if ($handler instanceof \Closure) {
                        $status = call_user_func_array($handler, array($event));
                        if ($cancelable) {
                            if ($event->isStopped()) {
                                break;
                            }
                        }
                    } else {
                        if (method_exists($handler, $method)) {
                            $status = $handler->{$method}($event);
                            if ($cancelable) {
                                if ($event->isStopped()) {
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }

        return $status;

    }

}