<?php
namespace App\Service;

use Sys\Core\Application,
    Sys\Core\Config,
    Sys\Helper\Text;

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

    public function notify() {
        $args = func_get_args();
        $type = array_shift($args);
        $func = Text::camelize($type, FALSE);

        if (method_exists($this, $func)) {
            call_user_func_array(array($this, $func), $args);
        }
    }

    public function follow($sender, $receiver) {
        $source = $this->getSource();
        $verb = _('<a data-ui-sref="account.home({email: \'%s\'})">%s</a> start following you');
        $data = array(
            $sender->email,
            $sender->fullname
        );
        $this->_db->insert(
            $source,
            array(
                'type' => 'notification',
                'verb' => $verb,
                'data' => json_encode($data),
                'sender_id' => $sender->id,
                'receiver_id' => $receiver->id,
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
            $sql = "SELECT * FROM notification WHERE `receiver_id` = ? ORDER BY notify_date DESC";
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