<?php
namespace Sys\Service;

use Sys\Core\Module,
    Sys\Helper\Text;

class Dispatcher extends \Sys\Core\Component {
    
    protected $_module;
    protected $_action;
    protected $_output;
    protected $_retval;
    protected $_params;

    public function setModule(Module $module) {
        $this->_module = $module;
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
                print_r($matches);
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

    public function dispatch($action, $params = array()) {
        $module = $this->_module;
        $action = Text::camelize($action, FALSE);
        $method = $action . 'Action';

        $actions = $module->listActions();

        if ( ! isset($actions[$method])) {
            $message = sprintf(_("Call to undefined method %s::%s()"), get_class($module), $method);
            throw new \Exception($message, 500);
        }

        $current = $actions[$method];

        $this->_action = $current;
        $this->_params = array();

        foreach($current->params as $key => $val) {
            $pos = $val->position;
            $req = $val->required;
            $def = $val->defaultValue;

            if ($req && ! isset($params[$pos])) {
                throw new \Exception(sprintf(_("Missing required parameter '%s' for method %s::%s()"), $key, get_class($module), $method), 500);
            }

            $this->_params[$key] = isset($params[$pos]) ? $params[$pos] : $def;
        }

        $eventBus = $this->getEventBus();

        if ($eventBus) {
            if ($eventBus->fire('dispatcher:beforeDispatch', $this, NULL, TRUE) === FALSE) {
                return FALSE;
            }
        }
        
        ob_start();

        $this->_retval = call_user_func_array(array($module, $method), $params);
        
        if (ob_get_length()) {
            $this->_output = ob_get_contents();
            ob_end_clean();
        }

    }

    public function getAction() {
        return $this->_action;
    }

    public function getActionName() {
        return is_array($this->_action) && isset($this->_action['name']) ? $this->_action['name'] : NULL;
    }

    public function getParam($name) {
        return isset($this->_params[$name]) ? $this->_params[$name] : NULL;
    }

    public function getParams() {
        return $this->_params;
    }

    public function getOutput() {
        return $this->_output;
    }

    public function getReturn() {
        return $this->_retval;
    }
}