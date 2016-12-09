<?php
namespace App\Module\User;

class Forker extends \Sys\Core\Module {

    public function findAction($diagramId) {
        $result = array(
            'success' => TRUE,
            'data' => array(),
            'total' => 0
        );

        $diagramId = intval($diagramId);

        if ($diagramId) {
            $sql = "
                SELECT
                    b.id,
                    b.fullname,
                    b.email,
                    b.avatar,
                    a.user_id AS diagram_user_id,
                    'owner' AS `type`
                FROM
                    diagram a
                    JOIN user b ON (a.user_id = b.id)
                WHERE a.id = ? 
                UNION
                SELECT 
                    b.id,
                    b.fullname,
                    b.email,
                    b.avatar,
                    c.user_id AS diagram_user_id,
                    'forker' AS `type`
                FROM
                    fork a 
                    JOIN user b ON (a.user_id = b.id)
                    JOIN diagram c ON (a.diagram_id = c.id)
                WHERE c.id = ?
            ";

            $params = array($diagramId, $diagramId);
            $forkers = $this->db->fetchAll($sql, $params);

            $user = $this->auth->getCurrentUser();
            $userId = $user ? $user->id : NULL;

            for ($i = count($forkers) - 1; $i >= 0; $i--) {
                if ($forkers[$i]->id == $userId && $forkers[$i]->diagram_user_id == $userId) {
                    array_splice($forkers, $i, 1);
                }
            }

            $result['data'] = $forkers;
        }
        
        $this->response->setJsonContent($result);
    }

}