<?php
namespace Sys\Core;

use Sys\Helper\Text;

abstract class Component implements IComponent {

    protected $_app;
    protected $_config;
    protected $_eventBus;

    protected static $_services = array();

    public function __construct(IApplication $app) {
        $this->_app = $app;
        $this->_eventBus = NULL;
    }

    public final function __call($method, $args) {
        if (Text::startsWith($method, 'get')) {
            $service = Text::camelize(substr($method, 3), FALSE);
            $result = NULL;

            if (isset(self::$_services[$service])) {
                $result = self::$_services[$service];
            } else {
                if ($this->_app->hasService($service)) {
                    $result = $this->_app->getServiceInstance($service);
                } else if ($this->_app->hasDatabase($service)) {
                    $result = $this->_app->getDatabaseInstance($service);
                }

                if ($result) {
                    self::$_services[$service] = $result;
                }
            }

            if ( ! $result) {
                throw new \Exception(sprintf(_("Call to undefined method or service '%s'"), $method));        
            }

            return $result;
        } else {
            if ( ! method_exists($this, $method)) {
                throw new \Exception(sprintf(_("Call to undefined method '%s->%s()'"), get_called_class(), $method));  
            }
        }

    }

    public final function __get($key) {
        $val = NULL;

        if (isset(self::$_services[$key])) {
            $val = self::$_services[$key];
        } else {
            if ($this->_app->hasDatabase($key)) {
                $val = $this->_app->getDatabaseInstance($key);
            } else if ($this->_app->hasService($key)) {
                $val = $this->_app->getServiceInstance($key);
            }    

            self::$_services[$key] = $val;
        }

        return $val;
    }

    public function getApp() {
        return $this->_app;
    }

    public function setEventBus(IEventBus $eventBus) {
        $this->_eventBus = $eventBus;
    }
    
    public function getEventBus() {
        return $this->_eventBus;
    }
    
    public function getConfig($key = NULL) {
        return is_null($key) ? $this->_config : $this->_config->{$key};
    }

    public function setConfig($key, $val = NULL) {
        if (is_array($key)) {
            foreach($key as $k => $v) {
                $this->_config->set($k, $v);
            }
        } else {
            $this->_config->set($key, $val);
        }
    }
}