<?php
namespace Sys\Core;

use Sys\Helper\Text,
    Sys\Service\DispatcherException;

class Application implements IApplication {

    protected $_services;
    protected $_databases;
    protected $_modules;
    protected $_config;
    protected $_debug;

    protected static $_default;

    public function __construct() {

        $this->_services  = array();
        $this->_modules   = array();
        $this->_databases = array();
        $this->_debug = TRUE;

        if ( ! self::$_default) {
            self::$_default = $this;
        }

        $this->_handleError();
    }

    public static function getDefault() {
        return self::$_default;
    }

    protected function _handleError() {
        $handler = new ErrorHandler($this);

        register_shutdown_function(array($handler, 'handleShutdown'));
        set_error_handler(array($handler, 'handleError'));
        set_exception_handler(array($handler, 'handleException'));
    }
    
    protected function _initConfig() {

        $find = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator(CFGPATH),
            \RecursiveIteratorIterator::SELF_FIRST
        );

        $array  = array();

        foreach($find as $key => $obj) {
            if ($obj->isFile()) {
                $name = str_replace('.php', '', $obj->getFilename());
                $array[$name] = include_once($obj->getPath().DS.$name.'.php');
            }
        }

        $this->_config = new Config($array);
    }

    protected function _initService() {
        // register some services
        $this->addService('response', 'Sys\Service\Response', TRUE);
        $this->addService('request', 'Sys\Service\Request', TRUE);
        $this->addService('session', 'Sys\Service\Session', TRUE);
        $this->addService('dispatcher', 'Sys\Service\Dispatcher', TRUE);
        $this->addService('security', 'Sys\Service\Security', TRUE);
        $this->addService('url', 'Sys\Service\URL', TRUE);

        $this->addService('uploader', 'Sys\Service\Uploader', TRUE);
        $this->addService('role', 'Sys\Service\Role', TRUE);
        $this->addService('auth', 'Sys\Service\Auth', TRUE);

        // start session
        $this->getService('session')->start();

        if ($this->_config->application->has('services')) {
            $services = $this->_config->application->services->toArray();
            foreach($services as $name => $opts) {
                if (isset($opts['class'])) {
                    $shared  = isset($opts['shared']) ? $opts['shared'] : FALSE;    
                    $params  = isset($opts['params']) && is_array($opts['params']) ? $opts['params'] : array();
                    $this->addService($name, $opts['class'], $shared);
                    $this->getResolver($name)->resolve($params);
                }
            }
        }
    }

    protected function _initDatabase() {
        
        $databases = $this->_config->database->toArray();
        
        foreach($databases as $name => $opts) {
            $type = isset($opts['type']) ? $opts['type'] : 'mysql';
            $load = isset($opts['load']) ? $opts['load'] : FALSE;

            switch($type) {
                case 'mysql':
                    $class = 'Sys\Db\Mysql';
                    break;
            }

            if (class_exists($class)) {
                
                $service = new Service($name, $class, TRUE);
                
                if ($load) {
                    $params = array(
                        $opts['host'],
                        $opts['user'],
                        $opts['pass'],
                        $opts['name'],
                        isset($opts['port']) ? $opts['port'] : NULL
                    );

                    $instance = $service->resolve($params);

                    if ($instance) {
                        $instance->connect();
                    }

                    $this->_databases[$name] = $service;
                }
            }
        }
    }

    protected function _initModule() {

        $find = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator(APPPATH.'Module'),
            \RecursiveIteratorIterator::SELF_FIRST
        );

        $array  = array();

        foreach($find as $key => $obj) {
            if ($obj->isFile()) {
                $path = $obj->getPath();
                $file = $obj->getFilename();
                $base = strtolower(str_replace('.php', '', $file));
                $defs = 'App\\'.str_replace(APPPATH, '', $path);
                $defs = $defs.'\\'.str_replace('.php', '', $file);
                $name = strtolower(str_replace(APPPATH.'Module'.DS, '', $path));
                
                if ($base != $name) {
                    $name = $name.'/'.$base;
                }

                $module = new Service($name, $defs, TRUE);
                $this->_modules[$name] = $module;
            }
        }
    }

    public function getDb($name) {
        $service = $this->_databases[$name];

        if ($service) {
            $instance = $service->resolve();
            return $instance;
        }

        return NULL;
    }

    public function getDbServices() {
        return $this->_databases;
    }

    public function getReadDb() {
        $dbread = $this->_config->application->database->read;
        return $this->getDb($dbread);
    }

    public function getWriteDb() {
        $dbwrite = $this->_config->application->database->write;
        return $this->getDb($dbwrite);   
    }

    public function getConfig() {
        return $this->_config;
    }

    public function getResolver($name) {
        return $this->_services[$name];
    }

    public function hasService($name) {
        return isset($this->_services[$name]);
    }

    public function addService($name, $defs, $shared = TRUE) {
        $service = new Service($name, $defs, $shared);
        $this->_services[$name] = $service;
    }

    public function getService($name) {
        if (isset($this->_services[$name])) {
            $service  = $this->_services[$name];
            $instance = NULL;

            if ($service) {
                return $service->resolve(array($this));
            } else {
                throw new ServiceException("Service {$name} tidak ditemukan");
            }
        } else {
            throw new ServiceException("Service {$name} tidak ditemukan");
        }
    }

    public function getModules() {

    }

    /**
     * Handle request
     */
    public function handle() {
        $res = $this->getService('response');
        $req = $this->getService('request');
        $dis = $this->getService('dispatcher');
        $url = $this->getService('url');
        $cfg = $this->getConfig()->application;

        $url->parse();
        $req->parse();

        $segments = $url->getSegments();

        if ($url->getPath() == '/') {
            $segments = explode('/', $cfg->default);
        }
        
        $module = FALSE;
        $action = FALSE;
        $params = FALSE;

        if (count($segments) == 1) {
            $module = isset($this->_modules[$segments[0]]) ? $segments[0] : FALSE;
            $action = $req->getDefaultHandler();
            $params = array();
        } else {
            $params = array();

            while (count($segments)) {
                $segment = array_pop($segments);
                array_unshift($params, $segment);

                $name = implode('/', $segments);

                if (isset($this->_modules[$name])) {
                    $module = $name;
                    break;
                }
            }

            if ( ! empty($params)) {
                $action = array_shift($params);
            } else {
                $action = $req->getDefaultHandler();
            }

        }

        if ($module) {
            $resolver = $this->_modules[$module];
            $instance = $resolver->resolve(array($this));

            if ($instance) {
                $dis->setModule($instance);
                $dis->dispatch($action, $params);

                $res->setContent($dis->getOutput());
                $res->setReturn($dis->getReturn());
            } else {
                throw new DispatcherException("Module {$module} tidak ditemukan");
            }
        } else {
            throw new DispatcherException("Alamat {$url->getCurrentUrl()} tidak ditemukan");
        }  

        return $res;
    }

    public function isDebug() {
        return $this->_debug;
    }

    public function start($debug = TRUE) {
        
        $this->_debug = $debug;

        error_reporting(E_ALL ^ E_DEPRECATED);

        if ($debug) {
            ini_set('display_errors', 'On');
        } else {
            ini_set('display_errors', 'Off');
        }

        $this->_initConfig();
        $this->_initService();
        $this->_initDatabase();
        $this->_initModule();

        $this->handle()->send();
    }

}