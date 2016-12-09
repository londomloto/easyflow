<?php
namespace App\Module\Diagram;

use App\Module\User\User;

class Creator extends \Sys\Core\Module {

    public function findAction() {
        $result = array(
            'success' => TRUE,
            'data' => array(),
            'total' => 0
        );
        
        $sql = "
            SELECT
                a.id,
                a.fullname,
                a.avatar,
                CONCAT('". User::getAssetsUrl() ."', a.avatar) AS avatar_url,
                COUNT(b.id) as total
            FROM 
                user a
                LEFT JOIN diagram b ON (a.id = b.user_id)
            GROUP BY a.id
            ORDER BY total DESC
            LIMIT 12
        ";

        $creators = $this->db->fetchAll($sql);
        $result['data'] = $creators;

        $this->response->setJsonContent($result);
    }

}