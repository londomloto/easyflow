<?php
namespace Sys\Core;

class Registry implements \Iterator {
    
    protected $_data;

    public function __construct() {
        $this->_data = array();
    }

    public function set($key, $value) {
        $this->_data[$key] = $value;
    }
    
    public function get($key) {
        return $this->_data[$key];
    }

    public function count() {
        return count($this->_data);
    }

    public function key() {
        return key($this->_data);
    }

    public function rewind() {
        reset($this->_data);
    }

    public function current() {
        return current($this->_data);
    }

    public function next() {
        next($this->_data);
    }

    public function valid() {
        return key($this->_data) !== NULL;
    }

}