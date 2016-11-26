<?php 
namespace Sys\Core;

abstract class Module extends Component {

    protected static $_loaded = array();
    protected static $_instances = array();
    protected static $_actions = array();

    public function __construct(IApplication $app) {
        parent::__construct($app);
    }

    public function start() {
        $class = get_called_class();

        if (isset(self::$_loaded[$class])) {
            return;
        }

        self::$_loaded[$class] = $this;

        $class = new \ReflectionClass($class);
        $funcs = $class->getMethods(\ReflectionMethod::IS_PUBLIC);
        $actions = array();
        $eventBus = $this->getEventBus();
        
        foreach($funcs as $func) {
            $fname = $func->name;
            
            if (substr($fname, -6) == 'Action') {

                $action = new \stdClass();
                $action->name = substr($fname, 0, strpos($fname, 'Action'));
                $action->numberOfParams = $func->getNumberOfParameters();
                $action->numberOfRequiredParams = $func->getNumberOfRequiredParameters();
                $action->params = new \stdClass();

                foreach($func->getParameters() as $param) {
                    $pname = $param->name;
                    $paramItem = new \stdClass();
                    $paramItem->position = $param->getPosition();
                    $paramItem->required = $param->isOptional() === FALSE;
                    $paramItem->defaultValue = $param->isDefaultValueAvailable() ? $param->getDefaultValue() : NULL;

                    $action->params->{$pname} = $paramItem;
                }

                $actions[$fname] = $action;

                if ($eventBus) {
                    $eventBus->fire(
                        'module:setupAction', 
                        $this, 
                        array(
                            'method' => $func,
                            'action' => $actions[$fname]
                        )
                    );
                }

            }
        }

        self::$_actions[$class->name] = $actions;

        $this->initialize();
    }

    public function initialize() {

    }

    public function listActions() {
        $class = get_called_class();
        return self::$_actions[$class];
    }

    public function __get($name) {
        
        $prop = '_'.$name;

        if ( ! isset($this->{$prop})) {

            if ($this->hasDatabase($name)) {
                $instance = $this->getDatabaseInstance($name);
            } else if ($this->hasService($name)) {
                $instance = $this->getServiceInstance($name);
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

    public static function getInstance() {
        $class = get_called_class();

        if (isset(self::$_loaded[$class])) {
            return self::$_loaded[$class];
        }

        $app = Application::getDefault();

        $modules = array_filter(
            $app->getModules(),
            function($service) {
                return $service->getDefinition() == $class;
            }
        );

        $modules = array_values($modules);
        $name = $modules[0]->getName();
        $name = substr($name, 7);

        return $app->getModuleInstance($name);
    }

}