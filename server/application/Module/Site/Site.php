<?php
namespace App\Module\Site;

class Site extends \Sys\Core\Module {
    
    public function indexAction() {
        exit();
    }

    public function getSessionKey() {
        $context = $this->getRegistry()->get('context');
        return "CURRENT_{$context}_SITE";
    }

    public function verifyAction() {
        $session = $this->getSession();
        $sesskey = $this->getSessionKey();
        
        if ( ! $session->has($sesskey)) {
            $site = self::buildFromSetting();
            $this->session->set($sesskey, $site);
        } else {
            $site = $this->session->get($sesskey);
        }

        $result = array(
            'success' => FALSE,
            'data' => $site
        );

        $this->response->setJsonContent($result);
    }
    

    public static function buildFromSetting() {
        $settings = self::getInstance()->db->fetchAll("SELECT * FROM setting WHERE section = 'site'");
        $site = new \Sys\Core\Config();

        foreach($settings as $item) {
            $site->set($item->name, $item->value);
        }

        return $site;
    }

    public static function invalidate() {
        $module = self::getInstance();
        $module->session->remove($module->getSessionKey());
    }

    public static function getCurrentSite() {
        $module = self::getInstance();
        return $module->session->get($module->getSessionKey());
    }

}