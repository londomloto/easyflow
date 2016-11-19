<?php
namespace Sys\Service;

class Response extends \Sys\Core\Component {

    const RESPONSE_TEXT = 0;    // text/html
    const RESPONSE_JSON = 1;    // application/json

    protected $_content;
    protected $_retval;
    protected $_responseType;

    public function __construct(\Sys\Core\IApplication $app) {
        parent::__construct($app);

        $this->_responseType = self::RESPONSE_TEXT;
        $this->_content = NULL;
        $this->_retval = NULL;
    }
    
    public function setContent($content) {
        $this->_content = $content;
    }

    public function setReturn($retval) {
        $this->_retval = $retval;
    }

    public function setHeader($name, $value) {
        header("{$name}: {$value}");
    }

    public function getContent() {
        return $this->_content;
    }

    public function getReturn() {
        return $this->_retval;
    }

    public function responseText() {
        $this->_responseType = self::RESPONSE_TEXT;
    }

    public function responseJson() {
        $this->_responseType = self::RESPONSE_JSON;
    }
    
    public function send() {

        if ($this->_responseType == self::RESPONSE_JSON) {
            $this->setHeader('Content-Type', 'application/json');
        }

        if ( ! is_null($this->_content)) {
            echo $this->_content;   
        }

        if ( ! is_null($this->_retval)) {
            if ((is_array($this->_retval) || is_object($this->_retval))) {
                if ($this->_responseType == self::RESPONSE_JSON) {
                     echo json_encode($this->_retval, JSON_PRETTY_PRINT);
                } else {
                    // force error to user;
                    echo $this->_retval;
                }
            } else {
                echo $this->_retval;
            }
        }
    }
    
    public function send204() {
        header('HTTP/1.1 204 No Content');
    }

    public function send404() {
        header('HTTP/1.1 404 Not Found');
    }

    public function send500() {
        header('HTTP/1.1 500 Internal Server Error');
    }

}