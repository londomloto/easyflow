<?php
namespace Sys\Core;

use Sys\Helper\Text;

class Dispatcher extends Component {
    
    protected $_module;
    protected $_action;
    protected $_params;
    protected $_handler;
    protected $_arguments;

    public function setModule(Module $module) {
        $this->_module = $module;
        $this->_params = array();
        $this->_arguments = array();
        $this->_action = NULL;
        $this->_handler = NULL;
    }

    public function setParam($key, $value = NULL) {
        if (is_array($key)) {
            $this->_params = array_merge($this->_params, $key);
        } else {
            $this->_params[$key] = $value;
        }
    }

    public function getParam($key = NULL) {
        if (is_null($key)) {
            return $this->_params;
        }
        return isset($this->_params[$key]) ? $this->_params[$key] : NULL;
    }

    public function setAction($action) {
        $this->_action = $action;
    }

    public function setArguments($args = array()) {
        $this->_arguments = $args;
    }

    public function getArguments() {
        return $this->_arguments;
    }

    public function getModule() {
        return $this->_module;
    }

    public function execute($module, $method = NULL, $params = array()) {
        $locate = $this->getApp()->locateModule($module);
        $module = $locate['module'];

        if (method_exists($module, $method)) {
            if (is_null($params)) {
                $params = array();
            }
            return call_user_func_array(array($module, $method), $params);
        } else {
            throw new \Exception(sprintf(_("Method %s->%s() doesn't exists!"), get_class($module), $method), 404);
        }
    }
    
    public function emulate($method, $path, $params = array(), $headers = array()){
        $method  = strtoupper($method);
        $options = array(
            'http' => array(
                'method' => 'GET'
            )
        );

        // use ip-address
        $ips = $this->getRequest()->getServerAddress();
        $url = $this->getUrl()->getSiteUrl($path);
        $url = preg_replace_callback(
            '#(^https?://)([^/:]+)(.*)#',
            function($matches) use ($ips) {
                return $matches[1].$ips.$matches[3];
            },
            $url
        );

        $headers[] = 'User-Agent: Mozilla/5.0 (Windows NT 10.0; WOW64; rv:50.0) Gecko/20100101 Firefox/50.0';
        $headers[] = 'Connection: close';

        $options['http']['header'] = $headers;

        switch($method) {
            case 'GET':
                $params = http_build_query($params);
                if (strripos($url, '?') === FALSE) {
                    $url .= '?'.$params;
                } else {
                    $url .= '&'.$params;
                }
                break;
            case 'POST':
                $options['http']['header'][] = "Content-Type: application/x-www-form-urlencoded";
                $options['http']['content']  = http_build_query($params);
                $options['http']['method']   = 'POST';

                break;
        }

        $context = stream_context_create($options);
        $result = file_get_contents($url, FALSE, $context);
        $context = NULL;

        return $result;
    }

    public function dispatch() {
        $module = $this->_module;
        $action = $this->_action;
        $action = Text::camelize($action, FALSE);
        $action = $action . 'Action';

        $actions = $module->listActions();

        if ( ! isset($actions[$action])) {
            $message = sprintf(_("Call to undefined method %s->%s()"), get_class($module), $action);
            throw new \Exception($message, 500);
        }

        $this->_handler = $actions[$action];

        $eventBus = $this->getEventBus();

        if ($eventBus) {
            if ($eventBus->fire('dispatcher:beforeDispatch', $this, NULL, TRUE) === FALSE) {
                return FALSE;
            }
        }
        
        $result  = call_user_func_array(array($module, $action), $this->_arguments);
        
        $response = $this->getResponse();
        $response->setReturn($result);

    }

    public function forward($spec) {
        if (is_array($spec)) {

            if ( ! isset($spec['module'])) {
                throw new \Exception("Redirect to non existing module", 404);
            }

            $app = $this->getApp();
            $modules = $app->getModules();

            if ( ! isset($modules['module:'.$spec['module']])) {
                throw new \Exception("Redirect to non existing module", 404);
            }

            $action = isset($spec['action']) ? $spec['action'] : Router::DEFAULT_ACTION;
            $arguments = isset($spec['arguments']) ? $spec['arguments'] : array();
            $params = isset($spec['params']) ? $spec['params'] : array();

            $instance = $app->getModuleInstance($spec['module']);

            $this->setModule($instance);
            $this->setAction($action);
            $this->setArguments($arguments);
            $this->setParam($params);

            $this->dispatch();
        } else {
            throw new \Exception("Invalid redirect specification", 404);
        }
    }

    public function getHandler() {
        return $this->_handler;
    }

    public function getAction() {
        return $this->_action;
    }

    public function getParams() {
        return $this->_params;
    }
}