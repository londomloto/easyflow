<?php
namespace Sys\Core;

class Service {

    protected $_name;
    protected $_definition;
    protected $_shared;
    protected $_resolved;
    protected $_params;

    protected $_sharedInstance;
    protected $_eventBus;

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

    public function setEventBus(IEventBus $eventBus) {
        $this->_eventBus = $eventBus;
    }

    public function getDefinition() {
        return $this->_definition;
    }

    public function getName() {
        $name = $this->_name;
        if (strpos($name, ':') !== FALSE) {
            $name = substr($name, strpos($name, ':') + 1);
        }
        return $name;
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

        if (is_null($params)) {
            $params = $this->_params;
        }
        
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
            $message = sprintf(_("Service '%s' not found!"), $this->_name);
            throw new \Exception($message, 404);
        }

        if ($this->_eventBus && method_exists($instance, 'setEventBus')) {
            $instance->setEventBus($this->_eventBus);
        }

        $this->_resolved = TRUE;

        if ($this->_shared) {
            $this->_sharedInstance = $instance;
        }

        return $instance;
    }

}