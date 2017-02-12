<?php
namespace App\Module\Diagrams;

class Forkers extends \Sys\Core\Module {

    public function findAction() {
        
        $identity = $this->dispatcher->getParam('identity');

        $result = array(
            'success' => TRUE,
            'data' => array(),
            'total' => 0
        );

        $numeric = is_numeric($identity);

        $sql = "
            SELECT
                b.id,
                b.fullname,
                b.email,
                b.avatar,
                'owner' AS `type`
            FROM
                diagram a
                JOIN user b ON (a.user_id = b.id)
        ";

        $sql .= " WHERE " . ($numeric ? "a.id = ?" : "a.slug = ?");

        $sql .= "
            UNION
            SELECT 
                b.id,
                b.fullname,
                b.email,
                b.avatar,
                'forker' AS `type`
            FROM
                fork a 
                JOIN user b ON (a.user_id = b.id)
                JOIN diagram c ON (a.diagram_id = c.id)
        ";

        $sql .= " WHERE " . ($numeric ? "c.id = ?" : "c.slug = ?");

        $params = array($identity, $identity);
        $forkers = $this->db->fetchAll($sql, $params);
        $result['data'] = $forkers;

        $this->response->setJsonContent($result);

    }

}