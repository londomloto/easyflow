<?php
namespace App\Service;

use Sys\Core\Application,
    Sys\Core\Config;

class Notification {

    protected $_config;
    protected $_db;

    public function __construct() {
        $this->_config = new Config(array(
            'source' => 'notification'
        )); 

        $this->_db = Application::getDefault()->getDefaultDatabase();
    }

    public function getSource() {
        return $this->_config->source;
    }

    public function forkRequest($diagram, $from, $to) {
        $source = $this->getSource();

        $verb = _('<a data-ui-sref="user.view({email: \'%s\'})">%s</a> has sent you request to forking diagram <a data-ui-sref="profile.diagram.edit({id:\'%d\'})">%s</a>');
        
        $data = array(
            $from->email,
            $from->fullname,
            $diagram->id,
            $diagram->name
        );

        $this->_db->insert(
            $source,
            array(
                'type' => 'request',
                'verb' => $verb,
                'data' => json_encode($data),
                'from' => $from->id,
                'to' => $to->id,
                'object_type' => 'diagram',
                'object_id' => $diagram->id,
                'notify_date' => date('Y-m-d H:i:s')
            )
        );
    }

    public function load($user) {
        $result = array(
            'success' => TRUE,
            'data' => array(),
            'total' => 0
        );

        if ($user) {
            $sql = "SELECT * FROM notification WHERE `to` = ? ORDER BY notify_date DESC";
            $params = array($user->id);

            $result['data'] = $this->_db->fetchAll($sql, $params);

            foreach($result['data'] as $row) {
                $args = json_decode($row->data);
                array_unshift($args, $row->verb);
                $row->verb = call_user_func_array('sprintf', $args);
            }

            $result['total'] = $this->_db->foundRows();
        }

        return $result;
    }   

    public function delete($id) {
        $source = $this->getSource();
        return $this->_db->delete($source, array('id' => $id));
    }

}