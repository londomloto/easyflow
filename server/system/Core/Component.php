<?php
namespace Sys\Core;

use Sys\Helper\Text;

abstract class Component implements IComponent {

    protected $_app;
    protected $_config;
    protected $_eventBus;

    public function __construct(IApplication $app) {
        $this->_app = $app;
        $this->_eventBus = NULL;
    }

    public function __call($method, $args) {
        if (Text::startsWith($method, 'get')) {
            $service = Text::camelize(substr($method, 3), FALSE);
            $instance = NULL;

            if ($this->_app->hasService($service)) {
                $instance = $this->_app->getServiceInstance($service);
            } else if ($this->_app->hasDatabase($service)) {
                $instance = $this->_app->getDatabaseInstance($service);
            }

            return $instance;
        }

        throw new \Exception(sprintf(_("Call to undefined method or service '%s'"), $method), 500);
    }
    
    public function getApp() {
        return $this->_app;
    }

    public function getAppConfig() {
        return $this->_app->getConfig();
    }

    public function setEventBus(IEventBus $eventBus) {
        $this->_eventBus = $eventBus;
    }
    
    public function getEventBus() {
        return $this->_eventBus;
    }
    
    public function getService($name) {
        return $this->_app->getService($name);
    }

    public function hasService($name) {
        return $this->_app->hasService($name);
    }

    public function getServiceInstance($name) {
        return $this->_app->getServiceInstance($name);
    }

    public function hasDatabase($name) {
        return $this->_app->hasDatabase($name);
    }

    public function getDatabase($name) {
        return $this->_app->getDatabase($name);
    }

    public function getDatabaseInstance($name) {
        return $this->_app->getDatabaseInstance($name);
    }

    public function addService($name, $defs, $shared = TRUE) {
        return $this->_app->addService($name, $defs, $shared);
    }

    public function getConfig() {
        return $this->_config;
    }

    public function setConfig($name, $value = NULL) {
        if (is_array($name)) {
            foreach($name as $key => $val) {
                $this->_config->set($key, $val);
            }
        } else {
            $this->_config->set($name, $value);
        }
    }
}