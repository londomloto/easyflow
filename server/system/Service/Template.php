<?php
namespace Sys\Service;

class Template extends \Sys\Core\Component {

    protected $_loader;
    protected $_engine;

    public function __construct(\Sys\Core\IApplication $app) {
        parent::__construct($app);

        $this->_loader = new \Twig_Loader_Filesystem(BASEPATH.'template');

        $cache = BASEPATH.'cache'.DS.'template';

        $this->_engine = new \Twig_Environment($this->_loader, array(
            'cache' => $cache,
            'auto_reload' => TRUE
        ));

        // i18n
        if (class_exists('Twig_Extensions_Extension_I18n')) {
            $this->_engine->addExtension(new \Twig_Extensions_Extension_I18n());    
        }
    }

    public function addFunction($name, $defs) { 
        $function = new \Twig_SimpleFunction($name, $defs);
        $this->_engine->addFunction($function);
    }

    public function load($path, $data = array()) {
        if (strripos($path, '.html') === FALSE) {
            $path .= '.html';
        }
        
        $content = '';

        try {
            $template = $this->_engine->load($path);
            $content = $template->render($data);
        } catch(\Exception $e){}
        
        return $content;
    }

}