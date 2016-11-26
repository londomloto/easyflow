<?php
namespace Sys\Core;

class Config {

    public function __construct($array = array()) {
        foreach($array as $key => $val) {
            $this->set($key, $val);
        }
    }

    public function has($key) {
        $key = strval($key);
        return isset($this->{$key});
    }
    
    public function set($key, $value) {
        $key = strval($key);

        if (is_array($value)) {
            $this->{$key} = new self($value);
        } else {
            $this->{$key} = $value;
        }
    }

    public function get($key, $default = NULL) {
        $key = strval($key);
        
        if (isset($this->{$key})) {
            return $this->{$key};
        }

        return $default;
    }

    public function def($key, $value) {
        if ( ! isset($this->{$key})) {
            $this->set($key, $value);
        }
    }

    public function toArray() {
        $array = array();
        $vars  = get_object_vars($this);

        foreach($vars as $key => $value) {
            if (is_object($value)) {
                if (method_exists($value, 'toArray')) {
                    $array[$key] = $value->toArray();
                } else {
                    $array[$key] = $value;
                }
            } else {
                $array[$key] = $value;
            }
        }

        return $array;
    }

}