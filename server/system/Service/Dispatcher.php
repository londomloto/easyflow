<?php
namespace Sys\Service;

use Sys\Core\Module,
    Sys\Helper\Text,
    Sys\Service\SecurityException;

class Dispatcher extends \Sys\Core\Component {
    
    protected $_module;
    protected $_action;
    protected $_output;
    protected $_retval;
    protected $_params;

    public function setModule(Module $module) {
        $this->_module = $module;
    }

    public function dispatch($action, $params = array()) {
        $module = $this->_module;
        $action = Text::camelize($action, FALSE);
        $method = $action . 'Action';

        if ( ! method_exists($module, $method)) {
            throw new DispatcherException("Fungsi ". get_class($module) ."->{$method}() tidak ditemukan");
        }

        if ( ! $module->authorize($action)) {
            throw new SecurityException("Akses ditolak");
        }

        $this->_action = $action;
        $this->_params = $params;
        
        ob_start();

        $this->_retval = call_user_func_array(array($module, $method), $params);
        $this->_output = ob_get_contents();

        ob_end_clean();
    }

    public function getAction() {
        return $this->_action;
    }

    public function getParams() {
        return $this->_params;
    }

    public function getOutput() {
        return $this->_output;
    }

    public function getReturn() {
        return $this->_retval;
    }
}