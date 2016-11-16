<?php
namespace Sys\Core;

interface IComponent {

    public function __construct(IApplication $app);
    public function getApp();
    public function getAppConfig();
    public function getResolver($name);
    public function getService($name);
    public function getDb($name);
    public function addService($name, $defs, $shared = TRUE);
    
}