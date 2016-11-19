<?php
namespace Sys\Core;

class Service {

    protected $_name;
    protected $_definition;
    protected $_shared;
    protected $_resolved;
    protected $_params;

    protected $_sharedInstance;

    public function __construct($name, $definition, $shared = FALSE) {
        $this->_name = $name;
        $this->_definition = $definition;
        $this->_shared = $shared;
        $this->_params = array();
        $this->_resolved = FALSE;
    }

    public function setParams($params = array()) {
        $this->_params = $params;
    }

    public function getDefinition() {
        return $this->_definition;
    }

    public function isResolved() {
        return $this->_resolved;
    }

    public function resolve($params = NULL) {
        
        $definition = $this->_definition;

        if ($this->_shared) {
            $sharedInstance = $this->_sharedInstance;
            if ($sharedInstance) {
                return $sharedInstance;
            }
        }

        $instance = NULL;
        $found = TRUE;

        if (is_string($definition)) {
            if (class_exists($definition)) {
                $class = new \ReflectionClass($definition);
                if (is_array($params)) {
                    $instance = $class->newInstanceArgs($params);
                } else {
                    $instance = $class->newInstance();
                }
            } else {
                $found = FALSE;
            }
        } else {
            if (is_object($definition)) {
                if ($definition instanceof \Closure) {
                    $instance = call_user_func_array($definition, $params);
                } else {
                    $instance = $definition;
                }
            } else {
                $found = FALSE;
            }
        }

        if ( ! $found) {
            throw new ServiceException("Service '" . $this->_name . "' tidak ditemukan");
        }

        $this->_resolved = TRUE;

        if ($this->_shared) {
            $this->_sharedInstance = $instance;
        }

        return $instance;
    }

}