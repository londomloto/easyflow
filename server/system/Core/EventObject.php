<?php
namespace Sys\Core;

class EventObject implements IEventObject {

    protected $_type;
    protected $_data;
    protected $_target;
    protected $_stopped;
    protected $_cancelable;

    public function __construct($type, $target, $data = NULL, $cancelable = TRUE) {
        $this->_type = $type;
        $this->_data = $data;
        $this->_target = $target;
        $this->_stopped = FALSE;
        $this->_cancelable = $cancelable;
    }

    public function stop() {
        if ( ! $this->_cancelable) {
            throw new \Exception(_('Trying to cancel a non-cancelable event'));
        }

        $this->_stopped = TRUE;
    }

    public function getType() {
        return $this->_type;
    }

    public function getData() {
        return $this->_data;
    }

    public function getTarget() {
        return $this->_target;
    }

    public function isCancelable() {
        return $this->_cancelable;
    }

    public function isStopped() {
        return $this->_stopped;
    }

}