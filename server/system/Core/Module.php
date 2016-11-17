<?php 
namespace Sys\Core;

abstract class Module extends Component {

    protected static $_default = NULL;
    protected static $_initialied = array();

    protected static $_authenticatedMethods = array();
    protected static $_authorizedMethods = array();

    public function __construct(IApplication $app) {
        parent::__construct($app);

        $class = get_class($this);

        if ( ! isset(self::$_initialied[$class])) {
            self::$_initialied[$class] = TRUE;
            $this->initialize();
        }

        if ( ! self::$_default) {
            self::$_default = $this;    
        }

    }

    public function initialize() {

    }

    public function authenticateMethods($methods) {

    }

    public function authorizeMethods($methods) {

    }

    public function __get($name) {
        
        $prop = '_'.$name;

        if ( ! isset($this->{$prop})) {
            $services = array('request', 'response', 'session', 'security', 'uploader', 'auth', 'role', 'url');

            if (in_array($name, $services)) {
                // check in service
                $instance = $this->getService($name);    
            } else {
                // check in database
                $instance = $this->getDb($name);
            }
            
            $this->{$prop} = $instance;
        }

        return $this->{$prop};
    }

    /**
     * HTTP GET
     */
    public function findAction($id = NULL) {

    }

    /**
     * HTTP POST
     */
    public function postAction() {

    }

    /**
     * HTTP PUT
     */
    public function putAction($id) {

    }

    /**
     * HTTP DELETE
     */
    public function deleteAction($id) {
        
    }

    /**
     * Get shared module over application
     */
    public static function getDefault() {
        return self::$_default;
    }
}