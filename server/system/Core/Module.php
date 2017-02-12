<?php 
namespace Sys\Core;

abstract class Module extends Component {

    protected static $_loaded = array();
    protected static $_instances = array();
    protected static $_actions = array();
    
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
    
    public static function getInstance() {
        $class = get_called_class();

        if (isset(self::$_loaded[$class])) {
            return self::$_loaded[$class];
        }

        $app = Application::getDefault();

        $modules = array_filter(
            $app->getModules(),
            function($service) use ($class) {
                return $service->getDefinition() == $class;
            }
        );

        $modules = array_values($modules);
        
        $name = $modules[0]->getName();
        return $app->getModuleInstance($name);
    }

}