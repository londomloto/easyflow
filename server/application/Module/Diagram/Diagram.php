<?php
namespace App\Module\Diagram;

use Sys\Helper\Text,
    Sys\Helper\File,
    App\Module\User\User;

class Diagram extends \Sys\Core\Module {

    const DIAGRAM_DIR = PUBPATH.'diagram'.DS;

    public function findAction($id = NULL) {
        $request = $this->request;
        $id = intval($id);

        if ($id) {
            $opts = array(
                'params' => array(
                    'a.id' => $id
                )
            );

            $result = self::query($opts, TRUE);
        } else {

            $opts = array(

            );

            $start = $request->getParam('start');
            $limit = $request->getParam('limit');

            if ($start != '' && $limit != '') {
                $opts['start'] = $start;
                $opts['limit'] = $limit;
            }

            $result = self::query($opts);
        }

        $this->response->setJsonContent($result);

    }

    public function updateAction($id) {
        if ($this->role->can('update_diagram')) {
            $result = array(
                'status' => 403,
                'success' => FALSE,
                'message' => _("You don't have permission to update diagram")
            );
        } else {
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
                    'path' => self::DIAGRAM_DIR
                ));

                if ($this->uploader->upload()) {

                    // remove existing
                    if (isset($post['cover']) &&  ! empty($post['cover'] && $post['cover'] != 'diagram-2.jpg')) {
                        File::delete(self::DIAGRAM_DIR.$post['cover']);
                    }

                    $upload = $this->uploader->getResult();
                    $post['cover'] = $upload['file_name'];
                    $post['cover_url'] = $this->url->getBaseUrl().'public/diagram/'.$post['cover'];
                }
            }

            $result['success'] = $this->db->update('diagram', $post, array('id' => $id));
            $result['data'] = $post;
        }
        

        $this->response->setJsonContent($result);
    }

    public function bookmarkAction($slug) {
        $user = $this->auth->getCurrentUser();
        $post = $this->request->getPost();

        $result = array(
            'success' => FALSE,
            'data' => NULL
        );

        if ($user) {

            // toggle
            $bookmarked = $post['bookmarked'] == 1 ? 0 : 1;

            if ($bookmarked == 1) {

                $found = $this->db->fetchOne(
                    "SELECT * FROM bookmark WHERE user_id = ? AND diagram_id = ?", 
                    array($user->id, $post['id'])
                );

                if ( ! $found) {
                    $result['success'] = $this->db->execute(
                        "INSERT INTO bookmark (user_id, diagram_id) VALUES (?, ?)", 
                        array($user->id, $post['id'])
                    );
                } else {
                    $result['success'] = TRUE;
                }
            } else {
                $result['success'] = $this->db->execute(
                    "DELETE FROM bookmark WHERE user_id = ? AND diagram_id = ?", 
                    array($user->id, $post['id'])
                );
            }

            $query = self::query(array(
                'user_id' => $user->id,
                'params' => array(
                    'a.id' => $post['id']
                )
            ), TRUE);

            $result['data'] = $query['data'];
        }

        $this->response->setJsonContent($result);
    }

    public function forkAction($slug) {
        $user = $this->auth->getCurrentUser();
        $post = $this->request->getPost();

        $result = array(
            'success' => FALSE,
            'message' => NULL,
            'data' => NULL
        );

        if ($user) {

            // toggle
            $forked = $post['forked'] == 1 ? 0 : 1;

            if ($forked == 1) {

                $found = $this->db->fetchOne(
                    "SELECT * FROM fork WHERE user_id = ? AND diagram_id = ?", 
                    array($user->id, $post['id'])
                );

                if ( ! $found) {
                    $result['success'] = $this->db->execute(
                        "INSERT INTO fork (user_id, diagram_id) VALUES (?, ?)", 
                        array($user->id, $post['id'])
                    );
                } else {
                    $result['success'] = TRUE;
                }
            } else {
                $result['success'] = $this->db->execute(
                    "DELETE FROM fork WHERE user_id = ? AND diagram_id = ?", 
                    array($user->id, $post['id'])
                );
            }

            $query = self::query(array(
                'user_id' => $user->id,
                'params' => array(
                    'a.id' => $post['id']
                )
            ), TRUE);

            $result['data'] = $query['data'];
        } else {
            $result['status'] = 500;
            $result['message'] = _('You have to logged in first to fork this diagram');
        }

        $this->response->setJsonContent($result);
    }

    public function thumbnailAction($image, $width = 400, $height = 200) {
        $file = self::DIAGRAM_DIR.$image;
        
        if ( ! file_exists($file)) {
            $file = self::DIAGRAM_DIR.'diagram.jpg';
        }

        $image = new \Sys\Library\Image($file);
        return $image->thumbnail($width, $height);
    }

    public function downloadAction($slug) {
        if ( ! is_null($slug)) {

            $format = $this->request->getParam('format');
            $format = empty($format) ? 'jpg' : $format;

            $diagram = $this->db->fetchOne("SELECT * FROM diagram WHERE slug = ?", array($slug));

            if ($diagram) {
                if ( ! empty($diagram->cover)) {
                    $cover = self::DIAGRAM_DIR.$diagram->cover;
                    if (file_exists($cover)) {
                        $this->db->update(
                            'diagram',
                            array(
                                'downloads' => ($diagram->downloads + 1)
                            ),
                            array(
                                'id' => $diagram->id
                            )
                        );
                        $this->response->setFileContent($cover);
                    }
                }
            }
        }
    }
    
    public static function getAssetsDir() {
        return PUBPATH.'diagram'.DS;
    }

    public static function getAssetsUrl() {
        return self::getInstance()->url->getBaseUrl() . 'public/diagram/';
    }

    public static function getDefaultSelect() {
        $sql = "
            SELECT 
                SQL_CALC_FOUND_ROWS 
                a.id,
                a.name,
                a.slug,
                a.description,
                a.cover,
                CONCAT('" . self::getAssetsUrl() . "', a.cover) as cover_url,
                a.published,
                a.created_date,
                a.updated_date,
                a.user_id,
                b.fullname as user_fullname,
                b.email as user_email,
                b.avatar as user_avatar
            FROM 
                diagram a
                JOIN user b ON (a.user_id = b.id)
        ";

        return $sql;
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
            $diagram->short_description = Text::ellipsis($diagram->description, 200);
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

    public static function findById($id) {
        $result = self::query(array(
            'params' => array(
                'a.id' => $id
            )
        ), TRUE);

        return $result['data'];
    }

    public static function findBySlug($slug) {
        $result = self::query(array(
            'params' => array(
                'a.slug' => $slug
            )
        ), TRUE);

        return $result['data'];   
    }

}