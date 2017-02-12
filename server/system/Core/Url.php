<?php
namespace Sys\Core;

class Url extends Component {

    protected $_baseUri;
    protected $_baseUrl;
    protected $_scheme;
    protected $_path;
    protected $_query;
    protected $_request;
    protected $_current;

    public function __construct(\Sys\Core\IApplication $app) {
        parent::__construct($app);
        $this->_baseUri = NULL;
        $this->_baseUrl = NULL;
        $this->_scheme = NULL;
    }
    
    function getScheme() {
        if (is_null($this->_scheme)) {
            $this->_scheme = (! empty($_SERVER['HTTPS']) && strtolower($_SERVER['HTTPS']) !== 'off') || $_SERVER['SERVER_PORT'] == 443 
                ? 'https'
                : 'http';
        }
        return $this->_scheme;
    }

    function isSecure() {
        return $this->getScheme() == 'https';
    }

    function getBaseUri() {
        if (is_null($this->_baseUri)) {
            $this->_baseUri = substr(
                $_SERVER['SCRIPT_NAME'], 
                0, 
                strpos(
                    $_SERVER['SCRIPT_NAME'], 
                    basename($_SERVER['SCRIPT_FILENAME'])
                )
            );
        }

        return $this->_baseUri;
    }

    function getBaseUrl() {
        if (is_null($this->_baseUrl)) {
            $this->_baseUrl = $this->getScheme().'://'.$_SERVER['HTTP_HOST'].$this->getBaseUri();
        }
        return $this->_baseUrl;
    }

    function getSiteUrl($path, $query = '') {
        $url = $this->getBaseUrl();
        $config = $this->getApp()->getConfig()->application;

        if ( ! empty($config->index)) {
            $url .= $config->index.'/';
        }

        $url .= trim($path, '/');

        if ($query) {
            $url = $this->appendUrl($url, $query);
        }

        return $url;
    }

    function getCurrentUrl() {
        return $this->_current;
    }

    function appendUrl($url, $query) {
        
        $security = $this->getSecurity();

        $parsed = parse_url($url);
        $param1 = array();
        $param2 = array();

        // PHP 4: undefined index `path`
        if ( ! isset($parsed['path'])) {
            $uri = $_SERVER['REQUEST_URI'];
            $pos = strpos($uri, '?');
            $parsed['path'] = $pos !== FALSE ? substr($uri, 0, $pos) : $uri;
        }

        if (isset($parsed['query'])) {
            $parsed['query'] = $security->sanitizeQuery($parsed['query']);
            parse_str($parsed['query'], $param1);
        }

        $query = $security->sanitizeQuery($query);
        parse_str($query, $param2);

        $params = array_merge($param1, $param2);
        $query  = http_build_query($params);

        $url = $parsed['scheme'].'://'.$parsed['host'].$parsed['path'];

        return $url.'?'.$query;
    }

    public function validateUrl() {
        $uri = $_SERVER['REQUEST_URI'];
        $chr = '?&#=+'.$this->getApp()->getConfig()->application->urlchars;
        $uri = str_replace('/', '', $uri);

        if ( ! empty($uri) && ! empty($chr) && ! preg_match('|^['.$chr.']+$|i', $uri)) {
            trigger_error('URI tidak valid!', E_USER_ERROR);
        }

        return $uri;
    }

    public function parse() {
        
        $this->validateUrl();

        $url = parse_url($_SERVER['REQUEST_URI']);

        if (isset($url['path'])) {
            $path = $url['path'];
        } else {
            $path = $_SERVER['REQUEST_URI'];
            $pos = strpos($path, '?');
            $path = $pos !== FALSE ? substr($path, 0, $pos) : $path;
        }

        $query = isset($url['query']) ? $url['query'] : '';
        $script = $_SERVER['SCRIPT_NAME'];

        if (isset($script[0])) {
            $dir = str_replace('\\', '/', dirname($script));
            if ($dir != '/') {
                if (strpos($path, $script) === 0) {
                    $path = (string) substr($path, strlen($script));
                } else if (strpos($path, $dir) === 0) {
                    $path = (string) substr($path, strlen($dir));
                }
            }
        }

        if (trim($path, '/') === '' && strncmp($query, '/', 1) === 0) {
            $tmp = explode('?', $query, 2);
            $path = $tmp[0];
            $_SERVER['QUERY_STRING'] = isset($tmp[1]) ? $tmp[1] : '';
        } else {
            $_SERVER['QUERY_STRING'] = $query;
        }

        parse_str($_SERVER['QUERY_STRING'], $_GET);

        if ($path == '') {
            $path = '/';
        }

        $this->_path  = $path;
        $this->_query = $query;
        $this->_current = $this->_path;

    }

    public function getPath() {
        return $this->_path;
    }

    public function getQuery() {
        return $this->_query;
    }

    public function getSegments() {
        $uri = trim($this->getPath(), '/');
        return explode('/', $uri);
    }

}