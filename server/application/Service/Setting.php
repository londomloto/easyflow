<?php
namespace App\Service;

class Setting extends \Sys\Core\Component {

    protected $_db;

    public function __construct(\Sys\Core\IApplication $app) {
        parent::__construct($app);

        if ($app->getConfig()->application->has('setting')) {
            $this->_config = $app->getConfig()->application->setting;
        } else {
            $this->_config = new \Sys\Core\Config(array(
                'source' => 'setting'
            ));
        }

        $this->_db = $app->getDefaultDatabase();
    }

    public function load() {
        $source = $this->_config->source;
        $rows = $this->_db->fetchAll("SELECT * FROM `$source`");
        $data = array();

        foreach($rows as $row) {
            $data[$row->name] = $row->value;
        }

        return $data;
    }

    public function apply() {
        $source = $this->_config->source;

        $rows = $this->_db->fetchAll("SELECT `name`, `value`, `section` FROM `{$source}` WHERE `section` IN('smtp', 'security')");
        $security = array();
        $mail = array();

        foreach($rows as $row) {
            if ($row->section == 'smtp') {
                $mail[$row->name] = $row->value;
            } else if($row->section == 'security') {
                $security[$row->name] = $row->value;
            }
        }

        $this->getMailer()->setConfig($mail);
        $this->getSecurity()->setConfig($security);
    }

    public function get() {

    }

    public function set($name, $value) {
        $success = FALSE;

        if ( ! empty($name)) {
            $source = $this->_config->source;
            $keys = array_keys($name);
            $bulk = ! is_string($keys[0]);

            if ($bulk) {
                $success = $this->_db->updateBatch($source, $name, 'name');
            } else {
                $success = $this->_db->update(
                    $source, 
                    array(
                        'name' => $name,
                        'value' => $value
                    ), 
                    array('name' => $name)
                );
            }
        }

        if ($success) {
            $this->apply();
        }

        return $success;
    }

}