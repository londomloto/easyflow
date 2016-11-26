<?php
namespace Sys\Core;

interface IComponent {

    public function __construct(IApplication $app);
    public function setEventBus(IEventBus $eventBus);
    public function getEventBus();
    public function getApp();
    public function getAppConfig();
    public function getService($name);
    public function hasService($name);
    public function getServiceInstance($name);
    public function hasDatabase($name);
    public function getDatabase($name);
    public function getDatabaseInstance($name);
    public function addService($name, $defs, $shared = TRUE);
    public function getConfig();
    public function setConfig($name, $value = NULL);
    
}