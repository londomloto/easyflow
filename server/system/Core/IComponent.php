<?php
namespace Sys\Core;

interface IComponent {

    public function __construct(IApplication $app);
    public function setEventBus(IEventBus $eventBus);
    public function getEventBus();
    public function getApp();
    public function getConfig($key = NULL);
    public function setConfig($key, $val = NULL);
    
}