<?php
namespace Sys\Core;

use Sys\Helper\Text;

class Application implements IApplication {

    protected $_services;
    protected $_databases;
    protected $_modules;
    protected $_config;
    protected $_debug;
    protected $_plugins;
    protected $_eventBus;

    protected static $_default;

    public function __construct() {

        $this->_services = array();
        $this->_modules = array();
        $this->_databases = array();
        $this->_plugins = array();
        $this->_debug = TRUE;

        $this->_eventBus = new EventBus();

        if ( ! self::$_default) {
            self::$_default = $this;
        }
    }

    public function __call($method, $args) {
        if (Text::startsWith($method, 'get')) {
            $service = Text::camelize(substr($method, 3), FALSE);
            $instance = NULL;

            if ($this->hasService($service)) {
                $instance = $this->getServiceInstance($service);    
            } else if ($this->hasDatabase($service)) {
                $instance = $this->getDatabaseInstance($service);
            }

            if ($instance) {
                return $instance;    
            } else {
                throw new \Exception(sprintf(_("Service '%s' not found"), $service), 404);
            }
        }

        throw new \Exception(sprintf(_("Call to undefined method or service '%s'"), $method), 500);
    }

    public function setEventBus(IEventBus $eventBus) {
        $this->_eventBus = $eventBus;
    }

    public function getEventBus() {
        return $this->_eventBus;
    }

    public static function getDefault() {
        return self::$_default;
    }

    protected function _initError() {
        $handler = new ErrorHandler($this);

        register_shutdown_function(array($handler, 'handleShutdown'));
        set_exception_handler(array($handler, 'handleException'));
        set_error_handler(array($handler, 'handleError'));
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

    protected function _initLanguage() {
        if (function_exists('gettext')) {

            $charset = $this->_config->application->charset;
            $locale  = $this->_config->application->locale;
            $domain  = 'lang';

            if ( ! defined('LC_MESSAGES')) {
                define('LC_MESSAGES', 5);
            }

            if ($locale == 'id_ID') {
                if (substr(strtoupper(PHP_OS), 0, 3) == 'WIN') {
                    $locale = array(
                        'id_ID.UTF8',
                        'id_ID.UTF-8',
                        'id_ID.8859-1',
                        'id_ID',
                        'IND.UTF8',
                        'IND.UTF-8',
                        'IND',
                        'Indonesian.UTF8',
                        'Indonesian.UTF-8',
                        'Indonesian.8859-1',
                        'Indonesian',
                        'Indonesia',
                        'id',
                        'ID'
                    );

                    setlocale(LC_ALL, 'IND');
                    $charset = "WINDOWS-1252";
                } else {
                    setlocale(LC_ALL, $locale);
                }
            } else {
                setlocale(LC_ALL, $locale);    
            }

            bindtextdomain($domain, LANGDIR);
            bind_textdomain_codeset($domain, $charset);

            textdomain($domain);
        }
    }

    protected function _initService() {
        // register some services
        $this->addService('registry',   'Sys\Core\Registry',    TRUE);
        $this->addService('dispatcher', 'Sys\Core\Dispatcher',  TRUE);
        $this->addService('response',   'Sys\Core\Response',    TRUE);
        $this->addService('request',    'Sys\Core\Request',     TRUE);
        $this->addService('session',    'Sys\Core\Session',     TRUE);
        $this->addService('url',        'Sys\Core\Url',         TRUE);
        $this->addService('router',     'Sys\Core\Router',      TRUE);

        $this->addService('security',   'Sys\Service\Security', TRUE);
        $this->addService('uploader',   'Sys\Service\Uploader', TRUE);
        $this->addService('template',   'Sys\Service\Template', TRUE);
        $this->addService('mailer',     'Sys\Service\Mailer',   TRUE);

        if ($this->_config->application->has('services')) {
            $services = $this->_config->application->services->toArray();

            foreach($services as $name => $opts) {
                if (is_string($opts)) {
                    $opts = array($opts, TRUE);
                }

                $opts = array_pad($opts, 2, TRUE);
                
                array_unshift($opts, $name);
                call_user_func_array(array($this, 'addService'), $opts);
            }
        }

        // start session
        $this->getSession()->start();
    }

    protected function _initDatabase() {
        
        $databases = $this->_config->databases->toArray();
        $eventBus = $this->getEventBus();

        foreach($databases as $name => $opts) {
            $type = isset($opts['type']) ? $opts['type'] : 'mysql';
            $load = isset($opts['load']) ? $opts['load'] : FALSE;
            $name = "database/{$name}";

            switch($type) {
                case 'mysql':
                    $class = 'Sys\Db\Mysql';
                    break;
            }

            if (class_exists($class)) {
                
                $service = new Service($name, $class, TRUE);
                $service->setEventBus($eventBus);

                $service->setParams(array(
                    $opts['host'],
                    $opts['user'],
                    $opts['pass'],
                    $opts['name'],
                    isset($opts['port']) ? $opts['port'] : NULL
                ));
                
                $this->_databases[$name] = $service;

                // autoload ?
                if ($load) {
                    $instance = $service->resolve();
                    $instance->connect();
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
        $eventBus = $this->getEventBus();

        foreach($find as $key => $obj) {
            if ($obj->isFile()) {
                $path = $obj->getPath();
                $file = $obj->getFilename();
                $base = str_replace('.php', '', $file);
                $base = strtolower(Text::uncamelize($base));
                $defs = 'App\\'.str_replace(APPPATH, '', $path);
                $defs = $defs.'\\'.str_replace('.php', '', $file);
                $defs = str_replace('/', '\\', $defs);

                $name = strtolower(str_replace(APPPATH.'Module'.DS, '', $path));
                $name = 'module:'.$name.'/'.$base;
                
                $module = new Service($name, $defs, TRUE);
                $module->setEventBus($eventBus);

                $this->_modules[$name] = $module;
            }
        }
    }

    public function _initEvents() {

        $eventBus = $this->getEventBus();

        // collect handler from plugins
        if ($this->_config->application->has('plugins')) {  
            $plugins = $this->_config->application->plugins;
            foreach($plugins as $event => $plugin) {
                // fix handler
                $handler = FALSE;

                if (is_string($plugin)) {
                    if (class_exists($plugin)) {
                        $handler = new $plugin($this);
                    }
                } else if (is_object($plugin)) {
                    $handler = $plugin;
                }

                // fix event
                if ($handler) {
                    $eventBus->attach($event, $handler);
                }

            }
        }

    }

    public function hasDatabase($name) {
        $name = "database/{$name}";
        return isset($this->_databases[$name]);
    }

    /**
     * Get database service
     */
    public function getDatabase($name) {
        $name = "database/{$name}";
        return $this->_databases[$name];
    }

    /**
     * Get database instance from service
     */
    public function getDatabaseInstance($name) {
        $service = $this->getDatabase($name);

        if ($service) {
            $instance = $service->resolve();
            return $instance;
        }

        return NULL;
    }

    public function getDefaultDatabase() {
        return $this->getDatabaseInstance('db');
    }

    public function getConfig() {
        return $this->_config;
    }

    /**
     * Get service resolver
     */
    public function getService($name) {
        $name = "service:{$name}";
        return $this->_services[$name];
    }

    public function hasService($name) {
        $name = "service:{$name}";
        return isset($this->_services[$name]);
    }

    public function addService($name, $defs, $shared = TRUE) {
        $name = "service:{$name}";
        $service = new Service($name, $defs, $shared);
        $service->setEventBus($this->_eventBus);

        $this->_services[$name] = $service;
    }

    /**
     * Get service instance from service (resolver)
     */
    public function getServiceInstance($name) {
        if ($this->hasService($name)) {
            $service = $this->getService($name);
            return $service->resolve(array($this));
        } else {
            throw new \Exception(sprintf(_("Service %s doesn't found!"), $name), 404);
        }
    }

    public function hasModule($name) {
        $name = "module:{$name}";
        return isset($this->_modules[$name]) ? $this->_modules[$name] : FALSE;
    }

    public function getModules() {
        return $this->_modules;
    }

    public function getModule($name) {
        $name = "module:{$name}";
        return isset($this->_modules[$name]) ? $this->_modules[$name] : FALSE;
    }

    public function getModuleInstance($name) {
        if ($this->hasModule($name)) {
            $service = $this->getModule($name);
            $instance = $service->resolve(array($this));
            $instance->start();
            return $instance;
        } else {
            throw new \Exception(sprintf(_("Module %s doesn't found!"), $name), 404);
        }
    }

    public function locateModule($segments) {
        $request = $this->getRequest();
        $module = FALSE;
        $action = FALSE;
        $params = array();

        if (is_string($segments)) {
            $segments = explode('/', $segments);
            $path = $segments;
        } else {
            $path = implode('/', $segments);
        }

        if (count($segments) == 1) {
            $module = $this->hasModule($segments[0]) ? $segments[0] : FALSE;
            $action = $request->getDefaultHandler();
        } else {
            
            while (count($segments)) {
                $name = implode('/', $segments);

                if ($this->hasModule($name)) {
                    $module = $name;
                    break;
                }

                $segment = array_pop($segments);
                array_unshift($params, $segment);
            }

            if ( ! empty($params)) {
                $action = array_shift($params);
                if (is_numeric($action)) {
                    array_unshift($params, $action);
                    $action = $request->getPreferredHandler();
                }
            } else {
                $action = $request->getPreferredHandler();
            }
        }

        if ($module) {
            $module = $this->getModuleInstance($module);
        } else {
            throw new \Exception(sprintf(_("Path %s doesn't found"), $path), 404);
        }

        return array(
            'module' => $module,
            'action' => $action,
            'params' => $params
        );
    }

    /**
     * Handle request
     */
    public function handle() {
        $request = $this->getRequest();
        $url = $this->getUrl();
        $router = $this->getRouter();
        
        $dispatcher = $this->getDispatcher();
        $config = $this->getConfig()->application;

        // parse url
        $url->parse();

        // parse request
        $request->parse();

        // parse route
        return $router->handle();
    }

    public function isDebug() {
        return $this->_debug;
    }

    public function start($debug = TRUE) {
        
        $this->_debug = $debug;

        error_reporting(E_ALL);

        if ($debug) {
            ini_set('display_errors', 'On');
        } else {
            ini_set('display_errors', 'Off');
        }

        $this->_initConfig();
        $this->_initLanguage();
        $this->_initError();
        $this->_initEvents();
        $this->_initService();
        $this->_initDatabase();
        $this->_initModule();

        $this->getEventBus()->fire('application:initialize', $this);
        $this->handle()->send();
    }

}