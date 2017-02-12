<?php
namespace Sys\Core;

use Sys\Helper\Text;

class Router extends Component {

    const DEFAULT_ACTION = 'index';

    const REGEX_MODULE = '([^/]+)';
    const REGEX_ACTION = '([^/]+)';
    const REGEX_PARAMS = '(.*)';
    const REGEX_ANY = '([^/]+)';
    const REGEX_NUM = '(\d+)';

    protected $_routes;
    protected $_currentRoute;

    protected static $_verbs;

    public function __construct(IApplication $app) {
        parent::__construct($app);

        $this->_routes = array();
        $this->_config = $app->getConfig()->routes;
        $this->_currentRoute = NULL;

        self::$_verbs = array('GET', 'POST', 'PUT', 'DELETE');

        foreach($this->_config->routes as $key => $val) {
            $this->addRoute($key, $val->toArray());
        }
    }

    public function addRoute($route, Array $spec) {

        if ( ! isset($spec['module'])) {
            return;
        }

        if ( ! isset($spec['action'])) {
            $spec['action'] = self::DEFAULT_ACTION;
        }

        // extract verbs from route
        $verbs = self::$_verbs;

        if ($route[0] != '/') {
            $parts = preg_split('/\s+/', $route);
            
            $verbs = $parts[0];
            $route = $parts[1];
            
            if ($verbs == '*') {
                $verbs = self::$_verbs;;
            } else {
                $verbs = explode('|', $verbs);
            }
        }

        $params = array();
        
        $pattern = preg_replace_callback(
            '/:([a-z]+)|\(([a-zA-Z-_]+):([^\/]+)\)/',
            function($match) use (&$params, $spec) {
                static $offset = 0;
                $offset++;

                if (count($match) == 2) {

                    switch($match[1]) {
                        case 'params':
                            $replacer = self::REGEX_PARAMS;
                            $params[] = array(
                                'type' => 'params',
                                'name' => $match[1],
                                'offset' => isset($spec['params']) ? $spec['params'] : $offset,
                                'value' => NULL
                            );
                            break;
                        case 'num':
                            $replacer = self::REGEX_NUM;
                            $params[] = array(
                                'type' => 'arguments',
                                'name' => $match[1],
                                'offset' => $offset,
                                'value' => NULL
                            );
                            break;
                        case 'any':
                            $replacer = self::REGEX_ANY;
                            $params[] = array(
                                'type' => 'arguments',
                                'name' => $match[1],
                                'offset' => $offset,
                                'value' => NULL
                            );
                            break;
                        case 'module':
                        case 'action':
                            $replacer = self::REGEX_ANY;
                            break;
                        default:

                            break;
                    }

                } else if (count($match) == 4) {

                    switch($match[3]) {
                        case 'num':
                            $replacer = self::REGEX_NUM;
                            break;
                        case 'any':
                            $replacer = self::REGEX_ANY;
                            break;
                        case 'email':
                            $replacer = self::REGEX_EMAIL;
                            break;
                        default:
                            $replacer = '('.$match[3].')';
                            break;
                    }

                    $params[] = array(
                        'type' => 'named',
                        'name' => $match[2],
                        'offset' => $offset,
                        'value' => NULL
                    );
                }
                
                return $replacer;
            },
            $route
        );

        // grab additional states
        $native = array('module', 'action', 'params');
        
        foreach($spec as $key => $val) {
            if ( ! in_array($key, $native)) {
                $params[] = array(
                    'type'   => 'states',
                    'name'   => $key,
                    'offset' => -1,
                    'value'  => $val
                );
            }
        }

        $pattern = '^'.$pattern.'/?$';

        $spec['route'] = $route;
        $spec['pattern'] = $pattern;
        $spec['verbs'] = $verbs;
        $spec['params'] = $params;

        $this->_routes[] = $spec;

    }

    public function getCurrentRoute() {
        return $this->_currentRoute;
    }

    public function handle() {
        $app = $this->getApp();
        $path = $this->getUrl()->getPath();
        $method = $this->getRequest()->getMethod();
        $response = $this->getResponse();
        $dispatcher = $this->getDispatcher();

        $modules = $app->getModules();

        $found = FALSE;
        $match = NULL;
        $token = NULL;

        if ($path != '/') {

            // TODO: refine regexes
            $segments = explode('/', substr($path, 1));
            $prefix = FALSE;

            if (count($segments) > 1) {
                while(count($segments)) {
                    $named = implode('/', $segments);
                    $token = 'module:'.$named.(count($segments) == 1 ? '/'.$segments[0] : '');
                    if (isset($modules[$token])) {
                        $prefix = $named;
                        break;
                    }
                    array_pop($segments);
                }    
            }

            foreach($this->_routes as $item) {
                $pattern = $item['pattern'];
                
                if ($prefix) {
                    if (substr($pattern, 0, 9) == '^/([^/]+)') {
                        $pattern = '^/('.$prefix.')/'.substr($pattern, 10);    
                    }
                }

                preg_match_all('#'.$pattern.'#', $path, $matches, PREG_SET_ORDER);

                if ( ! empty($matches)) {
                    
                    $match = $matches[0];

                    if (in_array($method, $item['verbs'])) {
                        $found = $item;
                        $found['pattern'] = $pattern;
                        break;
                    }
                }
            }

            if ($found) {

                $module = $found['module'];

                if (is_numeric($module)) {
                    $module = isset($match[$module]) ? $match[$module] : NULL;
                }

                if (strpos($module, '/') === FALSE) {   
                    $module = $module.'/'.$module;
                }

                $action = $found['action'];

                if (is_numeric($action) && isset($match[$action])) {
                    $action = $match[$action];
                }

                $params = array();
                $arguments = array();

                foreach($found['params'] as &$item) {
                    $value = NULL;

                    if ($item['type'] == 'arguments') {
                        $value = isset($match[$item['offset']]) ? $match[$item['offset']] : NULL;
                        $arguments[] = $value;
                    } else if ($item['type'] == 'params') {
                        $value = isset($match[$item['offset']]) ? $match[$item['offset']] : NULL;
                        $value = explode('/', $value);
                        $arguments = array_merge($arguments, $value);
                    } else if ($item['type'] == 'states') {
                        $value = is_numeric($item['value']) 
                            ? (isset($match[$item['value']]) ? $match[$item['value']] : NULL) 
                            : $item['value'];
                    } else {
                        $value = isset($match[$item['offset']]) ? $match[$item['offset']] : NULL;
                    }

                    $item['value'] = $value;
                    $params[$item['name']] = $value;
                }

            }

        }

        // still not found ?
        if ( ! $found) {
            $route = $this->_config->fallback->toArray();

            if (isset($route['module'])) {
                
                $module = $route['module'];
                
                if (strpos($module, '/') === FALSE) {
                    $module = $module.'/'.$module;
                }

                if (isset($modules['module:'.$module])) {
                    $found = $route;
                    $found['verbs'] = self::$_verbs;

                    if ( ! isset($found['action'])) {
                        $found['action'] = self::DEFAULT_ACTION;
                    }

                }
            }

            $action = $found['action'];
            $params = array();
            $arguments = array();
        }

        if ($found) {
            
            $found['module'] = $module;
            $found['action'] = Text::camelize($action);

            $this->_currentRoute = $found;

            $instance = $app->getModuleInstance($module);

            $dispatcher->setModule($instance);
            $dispatcher->setAction($action);
            $dispatcher->setArguments($arguments);
            $dispatcher->setParam($params);
            
            ob_start();

            $buffer = NULL;

            $dispatcher->dispatch();

            if (ob_get_length()) {
                $buffer = ob_get_contents();
                ob_end_clean();
            }

            if ( ! is_null($buffer)) {
                $response->prependContent($buffer);
            }

        } else {
            $this->_currentRoute = NULL;
            throw new \Exception(_("Page you requested doesn't found"), 404);
        }

        return $response;
    }

}