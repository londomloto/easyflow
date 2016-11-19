<?php 
namespace Sys\Core;

use Sys\Service\SecurityException;

abstract class Module extends Component {

    protected static $_default = NULL;
    protected static $_initialied = array();

    protected $_protectedActions = array();

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

    public function authorize($action) {
        if (isset($this->_protectedActions[$action])) {
            
            if ( ! $this->session->has('CURRENT_USER')) {
                throw new SecurityException("Sesi Anda sudah habis, silahkan login kembali", 401);
            }

            /*
            $token = $this->request->getHeader('Authorization');
            
            if (empty($token)) {
                $token = $this->request->getParam('token');
            }

            if ( ! $this->session->has('CURRENT_USER') || empty($token)) {
                throw new SecurityException("Sesi Anda sudah habis, silahkan login kembali", 401);
            }
            
            $token = str_replace('Bearer ', '', $token);
            return $this->security->verifyToken($token);
            */
        }

        return TRUE;
    }

    public function protect($action, $type = 'user') {
        if (is_array($action)) {
            foreach($action as $key => $val) {
                if (is_numeric($key)) {
                    $_action = $val;
                    $_type = 'user';
                } else {
                    $_action = $key;
                    $_type = isset($val['type']) ? $val['type'] : 'user';
                }

                $this->_protectedActions[$_action] = array(
                    'type' => $_type
                );
            }
        } else {
            $this->_protectedActions[$action] = array(
                'type' => $type
            );
        }
    }

    public function __get($name) {
        
        $prop = '_'.$name;

        if ( ! isset($this->{$prop})) {
            $services = array(
                'request', 
                'response', 
                'session', 
                'dispatcher',
                'security', 
                'uploader', 
                'auth', 
                'role', 
                'url'
            );

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