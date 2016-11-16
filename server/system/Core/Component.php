<?php
namespace Sys\Core;

abstract class Component implements IComponent {

    protected $_app;

    public function __construct(IApplication $app) {
        $this->_app = $app;
    }

    public function getApp() {
        return $this->_app;
    }   

    public function getAppConfig() {
        return $this->getApp()->getConfig();
    }

    public function getResolver($name) {
        return $this->getApp()->getResolver($name);
    }

    public function getService($name) {
        return $this->getApp()->getService($name);
    }

    public function getDb($name) {
        return $this->getApp()->getDb($name);
    }

    public function addService($name, $defs, $shared = TRUE) {
        return $this->getApp()->addService($name, $defs, $shared);
    }

}