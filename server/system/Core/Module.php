<?php 
namespace Sys\Core;

abstract class Module extends Component {

    protected static $_default;

    public function __construct(IApplication $app) {
        parent::__construct($app);
        
        $services = array(
            'role' => 'Sys\Library\Role',
            'auth' => 'Sys\Library\Auth'
        );

        foreach($services as $name => $defs) {
            $this->addService($name, $defs, TRUE);
            $this->getResolver($name)->resolve(array($app));
        }

        if ( ! self::$_default) {
            self::$_default = $this;    
        }   
    }

    /**
     * Get shared module over application
     */
    public static function getDefault() {
        return self::$_default;
    }

    public function __get($name) {
        
        $prop = '_'.$name;

        if ( ! isset($this->{$prop})) {
            $services = array('request', 'response', 'session', 'security', 'uploader','auth','role','uri');

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

    public function getAction($id = NULL) {

    }

    public function postAction() {

    }

    public function putAction($id) {

    }

    public function deleteAction($id) {
        
    }

    ///////// OBSERVER /////////
    
    public function onConstruct() {}
}