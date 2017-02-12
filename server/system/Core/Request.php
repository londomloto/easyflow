<?php
namespace Sys\Core;

use Sys\Helper\Text;

class Request extends \Sys\Core\Component {

    protected $_raw;
    protected $_put;

    public function parse() {
        $input = $this->getInput();

        if ( ! empty($input)) {
            if ($this->isJson()) {
                try {
                    $input = json_decode($input, TRUE);
                } catch(\Exception $e){}
            }

            $post = $this->isPost() || $this->isPut() || $this->isDelete();

            if (is_array($input) && $post) {
                $put = $this->isPut();

                if ($put) {
                    $this->_put = array();
                }

                foreach($input as $key => $val) {
                    if ( ! isset($_REQUEST[$key])) {
                        $_REQUEST[$key] = $val;
                    }

                    $_POST[$key] = $val;

                    if ($put) {
                        $this->_put[$key] = $val;
                    }
                }    
            }
        }
    }

    public function getHeaders() {
        $headers = array();

        foreach($_SERVER as $name => $value) {
            if (Text::startsWith($name, 'HTTP_')) {
                $name = ucwords(strtolower(str_replace('_', ' ', substr($name, 5))));
                $name = str_replace(' ', '-', $name);
                $headers[$name] = $value;
            } else if($name == 'CONTENT_TYPE' || $name == 'CONTENT_LENGTH') {
                $name = ucwords(strtolower(str_replace('_', ' ', $name)));
                $name = str_replace(' ', '-', $name);
                $headers[$name] = $value;
            }
        }

        return $headers;
    }

    public function hasHeader($header) {
        $header = strtoupper(strtr($header, '-', '_'));
        return isset($_SERVER[$header]) || isset($_SERVER['HTTP_'.$header]);
    }

    public function getHeader($header) {
        $header = strtoupper(strtr($header, '-', '_'));

        if (isset($_SERVER[$header])) {
            return $_SERVER[$header];
        }

        if (isset($_SERVER['HTTP_'.$header])) {
            return $_SERVER['HTTP_'.$header];
        }

        return '';
    }

    public function getServerAddress() {
        if (isset($_SERVER['SERVER_ADDR'])) {
            return $_SERVER['SERVER_ADDR'];
        }
        return gethostbyname('localhost');
    }

    public function getServerName() {
        if (isset($_SERVER['SERVER_NAME'])) {
            return $_SERVER['SERVER_NAME'];
        }   
        return 'localhost';
    }

    public function getClientAddress() {
        $address = NULL;

        if (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $address = $_SERVER['HTTP_X_FORWARDED_FOR'];
        }

        if (is_null($address) && isset($_SERVER['HTTP_CLIENT_IP'])) {
            $address = $_SERVER['HTTP_CLIENT_IP'];
        }

        if (is_null($address)) {
            $address = $_SERVER['REMOTE_ADDR'];
        }

        if (is_string($address)) {
            if (strpos($address, ',') !== FALSE) {
                $exp = explode(',', $address);
                return $exp[0];
            }
            return $address;
        }

        return FALSE;
    }

    public function getToken() {
        // check from query
        if (isset($_GET['token'])) {
            return $_GET['token'];
        }

        // check from header
        $auth = $this->getHeader('Authorization');

        if ( ! empty($auth)) {
            list($token) = sscanf($auth, 'Authorization: Bearer %s');
            return $token;
        }

        return FALSE;
    }

    public function has($name) {
        return isset($_REQUEST[$name]);
    }

    public function hasParam($name) {
        return isset($_GET[$name]);
    }

    public function hasPost($name) {
        $post = $this->getPost();
        return isset($post[$name]);
    }

    public function hasPut($name) {
        $put = $this->getPut();
        return isset($put[$name]);
    }

    public function getMethod() {
        return $_SERVER['REQUEST_METHOD'];
    }

    public function isGet() {
        return $this->getMethod() == 'GET';
    }

    public function isPost() {
        return $this->getMethod() == 'POST';   
    }

    public function isPut() {
        return $this->getMethod() == 'PUT';   
    }

    public function isDelete() {
        return $this->getMethod() == 'DELETE';   
    }

    public function isAjax() {
        return ( 
            ! empty($_SERVER['HTTP_X_REQUESTED_WITH']) && 
            strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest'
        );
    }

    public function isSoap() {

    }

    public function isJson() {
        return $this->getPreferredType() == 'application/json';
    }

    public function isSecure() {
        return $this->getUrl()->isSecure();
    }

    public function get($name = NULL, $sanitize = TRUE) {
        return $this->_fetch($_REQUEST, $name, $sanitize);
    }

    public function getPost($name = NULL, $sanitize = TRUE) {
        return $this->_fetch($_POST, $name, $sanitize);
    }

    public function getParam($name = NULL, $sanitize = TRUE) {
        return $this->_fetch($_GET, $name, $sanitize);
    }

    public function getPut($name = NULL, $sanitize = TRUE) {
        if ( ! is_array($this->_put)) {
            $put = array();
            parse_str($this->getInput(), $put);
            $this->_put = $this->_fetch($put, $name, $sanitize);
        }
        return $this->_put;
    }

    public function getInput() {
        if (empty($this->_raw)) {
            $content = file_get_contents('php://input');
            $this->_raw = $content;
        }
        return $this->_raw;
    }

    /*public function getInput($name = NULL, $sanitize = TRUE) {
        $content = $this->getInput();
        if ( ! is_string($content)) {
            return array();
        }
        $input = json_decode($content, TRUE);
        return $this->_fetch($input, $name, $sanitize);
    }*/

    public function hasFiles() {
        $files = $_FILES;
        $count = 0;

        if ( ! is_array($files)) {
            return 0;
        }

        foreach($files as $key => $file) {
            $error = $file['error'];
            
            if ( ! is_array($error)) {
                if ( ! $error) {
                    $count++;
                }
            }

            if (is_array($error)) {
                $count += $this->_countFiles($error);
            }
        }

        return $count;
    }

    protected function _countFiles($data) {
        $count = 0;

        if ( ! is_array($data)) {
            return 1;
        }

        foreach($data as $value) {
            if ( ! is_array($value)) {
                if ( ! $value) {
                    $count++;
                }
            }

            if (is_array($value)) {
                $count += $this->_countFiles($value);
            }
        }

        return $count;
    }

    protected function _fetch($provider, $name, $sanitize) {
        if ( ! is_null($provider)) {
            if (empty($name)) {
                $values = $provider;
                if ($sanitize) {
                    $security = $this->getSecurity();
                    foreach($values as $key => $val) {
                        $values[$key] = $security->sanitize($val);
                    }
                }
                return $values;
            }
            
            $value = isset($provider[$name]) ? $provider[$name] : '';

            if ($sanitize) {
                $security = $this->getSecurity();
                $value = $security->sanitize($value);
            }
            
            return $value;    
        } else {
            return $provider;
        }
        
    }

    public function getAcceptedType($supported, $default = 'text/html') {
        $supp = array();

        foreach($supported as $type) {
            $supp[strtolower($type)] = $type;
        }

        if (empty($supp)) {
            return $default;
        }

        $httpAccept = isset($_SERVER['HTTP_X_ACCEPT']) 
            ? $_SERVER['HTTP_X_ACCEPT'] 
            : (isset($_SERVER['HTTP_ACCEPT'])
                ? $_SERVER['HTTP_ACCEPT'] 
                : FALSE);

        if ($httpAccept) {
            $accepts = $this->sortAccept($httpAccept);

            foreach($accepts as $type => $q) {
                if (substr($type, -2) != '/*') {
                    if (isset($supp[$type])) {
                        return $supp[$type];
                    }
                    continue;
                }

                if ($type == '*/*') {
                    return array_shift($supp);
                }

                list($general, $specific) = explode('/', $type);

                $general .= '/';
                $len = strlen($general);

                foreach ($supp as $mime => $t) {
                    if (strncasecmp($general, $mime, $len) == 0) {
                        return $t;
                    }
                }
            }
        }

        return $default;
    }

    public function getPreferredType() {
        $preferred = array(
            'text/html',
            'text/plain',
            'application/json',
            'application/xml',
            'application/xhtml+xml'
        );

        return $this->getAcceptedType($preferred);
    }

    public function sortAccept($header) {
        $matches = array(); 
        $parts = explode(',', $header);
        
        foreach($parts as $option) {
            $option = array_map('trim', explode(';', $option));
            $l = strtolower($option[0]);
            if (isset($option[1])) {
                $q = (float) str_replace('q=', '', $option[1]);
            } else {
                $q = null;
                if ($l == '*/*') {
                    $q = 0.01;
                } elseif (substr($l, -1) == '*') {
                    $q = 0.02;
                }
            }
            $matches[$l] = isset($q) ? $q : 1000 - count($matches);
        }

        arsort($matches, SORT_NUMERIC);
        return $matches;
    }

    public function getPreferredHandler() {
        $method = $this->getMethod();
        switch($method) {
            case 'GET':
                return 'find';
            case 'POST':
                return 'create';
            case 'PUT':
                return 'update';
            case 'DELETE':
                return 'delete';
        }
        return strtolower($method);
    }

}