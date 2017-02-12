<?php
namespace Sys\Core;

use Sys\Helper\Text,
    Sys\Helper\File;

class Response extends \Sys\Core\Component {

    const RESPONSE_TEXT = 0;    // text/html
    const RESPONSE_JSON = 1;    // application/json
    const RESPONSE_FILE = 2;

    protected $_content;
    protected $_retval;
    protected $_responseType;
    protected $_headers;

    public function __construct(\Sys\Core\IApplication $app) {
        parent::__construct($app);

        $this->_responseType = self::RESPONSE_TEXT;
        $this->_content = '';
        $this->_retval = NULL;
        $this->_headers = array();
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

    public function setHeader($header, $value = NULL, $replace = TRUE) {
        $this->_headers[] = array(
            'name' => $header,
            'value' => $value,
            'replace' => $replace
        );
    }

    public function getMethod() {
        return $_SERVER['REQUEST_METHOD'];
    }

    public function responseText() {
        $this->_responseType = self::RESPONSE_TEXT;
        $this->setContentType('text/html', 'UTF-8');
    }

    public function responseJson() {
        $this->_responseType = self::RESPONSE_JSON;
        $this->setContentType('application/json', 'UTF-8');
    }

    public function responseFile() {
        $this->_responseType = self::RESPONSE_FILE;
    }

    public function setContentType($type, $charset = NULL) {
        if (is_null($charset)) {
            $this->setHeader('Content-Type', $type);
        } else {
            $this->setHeader('Content-Type', $type . '; charset=' . $charset);
        }
    }

    public function setContent($content) {
        $this->_content = $content;
    }

    public function prependContent($content) {
        $this->_content = $content . $this->_content;
    }

    public function appendContent($content) {
        $this_content .= $content;
    }

    public function setJsonContent($content) {
        $this->responseJson();
        $this->setContent(json_encode($content, JSON_PRETTY_PRINT | JSON_NUMERIC_CHECK));
    }

    public function setFileContent($content) {
        $this->responseFile();
        $this->setContent($content);
    }

    public function setReturn($retval) {
        $this->_retval = $retval;
    }

    public function getContent() {
        return $this->_content;
    }

    public function getReturn() {
        return $this->_retval;
    }

    public function sendHeaders() {
        if ( ! headers_sent()) {
            foreach($this->_headers as $item) {
                $key = $item['name'];
                $val = $item['value'];
                $rep = $item['replace'];

                if ( ! is_null($val)) {
                    header("{$key}: {$val}", $rep);
                } else {
                    if (Text::contains($key, ':')) {
                        header("{$key}", $rep);
                    } else {
                        header("{$key}: ", $rep);
                    }
                }
            }

            $this->_headers = array();
            return TRUE;
        }

        $this->_headers = array();
        return FALSE;
    }
    
    public function send() {

        // enable CORS
        if ($this->hasHeader('Origin')) {
            $this->setHeader('Access-Control-Allow-Origin', $this->getHeader('Origin'));
            $this->setHeader('Access-Control-Allow-Credentials', 'true');
            $this->setHeader('Access-Control-Max-Age', '86400');
        }

        if ($this->getMethod() == 'OPTIONS') {
            if ($this->hasHeader('Access-Control-Request-Method')) {
                $this->setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            }

            if ($this->hasHeader('Access-Control-Request-Headers')) {
                $this->setHeader('Access-Control-Allow-Headers', $this->getHeader('Access-Control-Request-Headers'));
            }

            $this->sendHeaders();
            exit(0);
        }

        $content = $this->_content;
        $responseType = $this->_responseType;

        if ( ! is_null($content)) {
            switch($responseType) {
                case self::RESPONSE_JSON:
                    if (is_array($content) || is_object($content)) {
                        $content = json_encode($content, JSON_PRETTY_PRINT | JSON_NUMERIC_CHECK);
                    }
                    break;
                case self::RESPONSE_FILE:
                    $mime = File::getType($content);
                    $name = basename($content);
                    $size = filesize($content);

                    $this->setHeader('Pragma', 'public'); // compat
                    $this->setHeader('Cache-Control', 'must-revalidate, post-check=0, pre-check=0');
                    $this->setHeader('Expires', '0');
                    $this->setHeader('Last-Modified', gmdate('D, d M Y H:i:s', filemtime($content)).' GMT');
                    $this->setHeader('Cache-Control', 'private', FALSE);
                    $this->setContentType($mime);
                    $this->setHeader('Content-Description', 'File Transfer');
                    $this->setHeader('Content-Disposition', 'attachment; filename='.$name);
                    $this->setHeader('Content-Transfer-Encoding', 'binary');
                    $this->setHeader('Content-Length', $size);
                    $this->setHeader('Connection', 'close');
                    // $this->setHeader('Content-Encoding', 'none');
                    
                    $content = file_get_contents($content);
                    break;
            }
        } else {
            $content = '';
        }

        $this->sendHeaders();
        echo $content;
        exit();
    }
    
    public function send204() {
        header('HTTP/1.1 204 No Content');
        exit();
    }

    public function send404() {
        header('HTTP/1.1 404 Not Found');
        exit();
    }

    public function send500() {
        header('HTTP/1.1 500 Internal Server Error');
        exit();
    }

}