<?php
namespace App\Module\Diagrams;

use Sys\Helper\Text,
    Sys\Helper\File,
    App\Module\Users\Users;

class Diagrams extends \Sys\Core\Module {

    const COVER_DEFAULT = 'no-image.png';

    public function findAction() {
        $request = $this->request;

        $opts = array(

        );

        $start = $request->getParam('start');
        $limit = $request->getParam('limit');

        if ($start != '' && $limit != '') {
            $opts['start'] = $start;
            $opts['limit'] = $limit;
        }

        $result = self::query($opts);
        $this->response->setJsonContent($result);
    }

    public function findByIdAction($id) {
        $id = (int) $id;

        $opts = array(
            'params' => array(
                'a.id' => $id
            )
        );

        $result = self::query($opts, TRUE);
        $this->response->setJsonContent($result);
    }

    /**
     * @authentication
     * @authorization create_diagram
     */
    public function createAction() {

    }

    /**
     * @authentication
     * @authorization update_diagram
     */
    public function updateAction($id) {
        $post = $this->request->getPost();

        $result = array(
            'success' => FALSE,
            'message' => ''
        );

        $slug = Text::slugify($post['name']);

        if ($post['slug'] != $slug) {
            // validate slug
            $found = $this->db->fetchOne(
                "SELECT COUNT(1) as num FROM diagram WHERE slug LIKE ? AND id <> ?",
                array($slug.'%', $post['id'])
            );

            $found = (int)$found->num;

            if ($found > 0) {
                $post['slug'] = $slug . '-' . ($found + 1);
            } else {
                $post['slug'] = $slug;
            }
        }

        if ($this->request->hasFiles()) {
            $this->uploader->setup(array(
                'path' => self::getAssetsDir()
            ));

            if ($this->uploader->upload()) {

                // remove existing
                if (isset($post['cover']) &&  ! empty($post['cover'] && $post['cover'] != self::COVER_DEFAULT)) {
                    File::delete(self::getAssetsDir().$post['cover']);
                }

                $upload = $this->uploader->getResult();
                $post['cover'] = $upload['file_name'];
                $post['cover_url'] = $this->url->getBaseUrl().'public/diagram/'.$post['cover'];
            }
        }

        $result['success'] = $this->db->update('diagram', $post, array('id' => $id));
        $result['data'] = $post;

        $this->response->setJsonContent($result);
    }

    /**
     * @authentication
     * @authorization delete_diagram
     */
    public function deleteAction($id) {

    }

    public function downloadAction($identity, $format) {
        $diagram = is_numeric($identity) ? self::findById($identity) : self::findBySlug($identity);
        $base = self::getAssetsDir();
        $file = $base.self::COVER_DEFAULT;

        if ($diagram) {
            switch($format) {
                case 'jpg':
                case 'svg':
                    if ( ! empty($diagram->cover)) {
                        $file = $base.$diagram->cover;
                    }
                    break;
            }
        }

        if (file_exists($file) && ! is_dir($file)) {
            $this->response->setFileContent($file);
        } else {
            $this->response->send404();
        }
    }

    public function thumbnailAction($image, $width = 400, $height = 200) {
        $base = self::getAssetsDir();
        $file = $base.$image;

        if ( ! file_exists($file) || is_dir($file)) {
            $file = $base.self::COVER_DEFAULT;
        }

        $image = new \Sys\Library\Image($file);
        return $image->thumbnail($width, $height);
    }

    public function forwardAction() {
        $dispatcher = $this->dispatcher;

        $params = $dispatcher->getParam();
        $module = 'diagrams/'.$params['module'];
        $action = $params['method'];

        $dispatcher->forward(array(
            'module' => $module,
            'action' => $action,
            'params' => $params,
            'arguments' => $dispatcher->getArguments()
        ));
    }

    ///////// API /////////

    public static function getAssetsDir() {
        return PUBPATH.'diagram'.DS;
    }

    public static function getAssetsUrl() {
        return self::getInstance()->url->getBaseUrl() . 'public/diagram/';
    }

    public static function findById($id) {
        return self::getInstance()->db->fetchOne('SELECT * FROM diagram WHERE id = ?', array($id));
    }

    public static function findBySlug($slug) {
        return self::getInstance()->db->fetchOne('SELECT * FROM diagram WHERE slug = ?', array($slug));
    }

    public static function query($options, $first = FALSE) {
        $self = self::getInstance();
        
        $sql = "SELECT";

        if ( ! $first) {
            $sql .=" SQL_CALC_FOUND_ROWS";
        }

        $sql .= "
                a.id,
                a.name,
                a.slug,
                a.description,
                a.cover,
                CONCAT('". self::getAssetsUrl() ."', a.cover) AS cover_url,
                a.published,
                a.created_date,
                a.updated_date,
                a.user_id,
                a.downloads,
                b.fullname AS user_fullname,
                b.email AS user_email,
                b.avatar AS user_avatar,
                b.bio AS user_bio,
                COUNT(DISTINCT c.user_id) AS bookmarks,
                COUNT(DISTINCT d.user_id) AS forks,
                IF(ISNULL(e.user_id), 0, 1) AS bookmarked,
                IF(ISNULL(f.user_id), 0, 1) AS forked
            FROM 
                diagram a
                LEFT JOIN user b ON (a.user_id = b.id)
                LEFT JOIN bookmark c ON (a.id = c.diagram_id)
                LEFT JOIN fork d ON (a.id = d.diagram_id)
                LEFT JOIN bookmark e ON (a.id = e.diagram_id AND e.user_id = ?)
                LEFT JOIN fork f ON (a.id = f.diagram_id AND f.user_id = ?)
            WHERE 1 = 1 
        ";

        $userId = isset($options['user_id']) ? $options['user_id'] : 0;
        $params = array($userId, $userId);

        if (isset($options['params'])) {
            $where = array();
            foreach($options['params'] as $key => $val) {
                $where[] = "{$key} = ?";
                $params[] = $val;
            }

            if (count($where) > 0) {
                $sql .= " AND (".implode(" AND ", $where) . ")";
            }
        }

        if (isset($options['filters'])) {
            $where = array();
            foreach($options['filters'] as $item) {
                if ($item->value != '') {
                    $where[] = "{$item->field} LIKE ?";
                    $params[] = "%{$item->value}%";
                }
            }
            if (count($where) > 0) {
                $sql .= " AND (" . implode(" AND ", $where) . ")";
            }
        }

        $sql .= " GROUP BY a.id";

        if (isset($options['sorters'])) {
            $order = array();
            foreach($options['sorters'] as $item) {
                $order[] = "{$item->property} {$item->direction}";
            }
            if (count($order) > 0) {
                $sql .= " ORDER BY " . implode(", ", $order);
            }
        }

        if (isset($options['start'], $options['limit'])) {
            $sql .= ' LIMIT ' . $options['start'] . ', ' . $options['limit'];
        }

        $diagrams = $self->db->fetchAll($sql, $params);
        
        foreach($diagrams as $diagram) {
            $diagram->owned = ($userId == $diagram->user_id) ? TRUE : FALSE;
            $diagram->short_description = Text::ellipsis($diagram->description, 150);
        }

        if ($first) {
            $diagram = count($diagrams) > 0 ? $diagrams[0] : NULL;
            return array(
                'success' => TRUE,
                'data' => $diagram
            );
        } else {
            $total = $self->db->foundRows();

            return array(
                'success' => TRUE,
                'data' => $diagrams,
                'total' => $total
            );
        }
    }

    public static function fork($diagramId, $userId, $fork) {
        $result = array(
            'success' => TRUE,
            'data' => NULL
        );

        $fork = $fork == 1 ? 0 : 1;
        $db = self::getInstance()->db;
        
        if ($fork == 1) {
            $found = $db->fetchOne(
                "SELECT * FROM fork WHERE user_id = ? AND diagram_id = ?", 
                array($userId, $diagramId)
            );

            if ( ! $found) {
                $result['success'] = $db->execute(
                    "INSERT INTO fork (user_id, diagram_id, approved) VALUES (?, ?, ?)", 
                    array($userId, $diagramId, 0)
                );
            } else {
                $result['success'] = TRUE;
            }
        } else {
            $result['success'] = $db->execute(
                "DELETE FROM fork WHERE user_id = ? AND diagram_id = ?", 
                array($userId, $diagramId)
            );
        }

        $query = self::query(array(
            'user_id' => $userId,
            'params' => array(
                'a.id' => $diagramId
            )
        ), TRUE);

        $result['data'] = $query['data'];

        return $result;
    }

    public static function bookmark($diagramId, $userId, $bookmark = TRUE) {
        $result = array(
            'success' => TRUE,
            'data' => NULL
        );

        $db = self::getInstance()->db;

        if ($bookmark) {
            $found = $db->fetchOne(
                "SELECT * FROM bookmark WHERE user_id = ? AND diagram_id = ?", 
                array($userId, $diagramId)
            );

            if ( ! $found) {
                $result['success'] = $db->execute(
                    "INSERT INTO bookmark (user_id, diagram_id) VALUES (?, ?)", 
                    array($userId, $diagramId)
                );
            } else {
                $result['success'] = TRUE;
            }
        } else {
            $result['success'] = $db->execute(
                "DELETE FROM bookmark WHERE user_id = ? AND diagram_id = ?", 
                array($userId, $diagramId)
            );
        }

        $query = self::query(array(
            'user_id' => $userId,
            'params' => array(
                'a.id' => $diagramId
            )
        ), TRUE);
        
        $result['data'] = $query['data'];
        return $result;
    }
}