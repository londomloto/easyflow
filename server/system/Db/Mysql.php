<?php
namespace Sys\Db;

class Mysql implements IDb {

    protected $_conn;

    protected $_host;
    protected $_user;
    protected $_pass;
    protected $_name;
    protected $_port;

    protected $_error;
    protected $_fields;
    
    public function __construct($host, $user, $pass, $name, $port = NULL) {
        $this->_host = $host;
        $this->_user = $user;
        $this->_pass = $pass;
        $this->_name = $name;
        $this->_port = is_null($port) ? 3306 : $port;
        $this->_error = NULL;
        $this->_fields = array();
    }

    public function connect() {

        $this->_conn = new \Mysqli(
            $this->_host,
            $this->_user,
            $this->_pass,
            $this->_name,
            $this->_port
        );

    }

    public function validate() {
        if ( ! $this->_conn) {
            throw new \Exception("Database tidak terhubung!");
        }
    }

    public function query($sql, $params = NULL) {
        
        $this->validate();

        $conn = $this->_conn;
        $stmt = $conn->stmt_init();
        $result = NULL;

        if ($stmt->prepare($sql)) {
            if (is_array($params)) {
                $values = array();
                $types = '';

                foreach($params as $key => &$value) {
                    if ($value == 'null') {
                        $value = NULL;
                    }
                    
                    if (is_string($value)) {
                        $value = stripslashes($value);    
                    }

                    if (is_numeric($value)) {
                        $float  = floatval($value);
                        $types .= ($float && intval($float) != $float) ? 'd' : 'i';
                    } else {
                        $types .= 's';
                    }
                    
                    $values[$key] = &$params[$key];
                }

                $args = array_merge(array($types), $params);
                call_user_func_array(array($stmt, 'bind_param'), $args);
            }

            if ($stmt->execute()) {
                if (preg_match('/^(SELECT|SHOW)/i', $sql)) {
                    if (method_exists($stmt, 'get_result')) {
                        $result = $stmt->get_result();
                        $stmt->close();
                    } else {
                        $result = $stmt;
                        $result->store_result();
                    }
                    return new Result($this, $result);
                } else {
                    $stmt->close();
                    return TRUE;
                }
            } else {
                $this->_error($stmt->error);
                return FALSE;
            }
        } else {
            $this->_error($stmt->error);
            return FALSE;
        }
    }

    public function execute($sql, $params = NULL) {
        return $this->query($sql, $params);
    }

    public function fetchOne($sql, $params = NULL, $mode = Result::FETCH_ROW) {
        $result = $this->query($sql, $params);
        $result->setFetchMode($mode);
        return $result->getFirst();
    }

    public function fetchAll($sql, $params = NULL, $mode = Result::FETCH_ROW) {
        $result = $this->query($sql, $params);
        $result->setFetchMode($mode);
        
        return $result->toArray();
    }

    public function foundRows() {
        $result = $this->query("SELECT FOUND_ROWS() as total");
        $row = $result->getFirst();
        return (int) $row->total;
    }

    public function listField($table) {
        if ( ! isset($this->_fields[$table])) {
            $query  = $this->_conn->query("SELECT * FROM $table LIMIT 1");
            $fields = array();

            if ($query) {
                $fields = $query->fetch_fields();
                foreach($fields as $field) {
                    if ($field->flags == MYSQLI_PRI_KEY_FLAG) {
                        $field->primary = TRUE;
                    } else {
                        $field->primary = FALSE;
                    }
                }
            }

            $this->_fields[$table] = $fields;
        }
        return $this->_fields[$table];
    }

    public function update($table, $data, $keys = NULL) {
        $fields = $this->listField($table);
        $update = array();
        $params = array();

        foreach($data as $key => $val) {
            foreach($fields as $field) {
                if ($key == $field->name) {
                    $update[] = "`{$key}` = ?";
                    $params[] = $val;
                }
            }
        }

        if (count($update) > 0) {
            $sql = "UPDATE `$table` SET ";
            $sql = $sql . implode(', ', $update);

            if (is_array($keys) && count($keys) > 0) {
                $sql = $sql . " WHERE ";
                $where = array();

                foreach($keys as $name => $val) {
                    $params[] = $val;
                    $where[] = "`{$name}` = ?";
                }

                $sql = $sql . implode(' AND ', $where);
            }    
            return $this->query($sql, $params);
        }
        return FALSE;
    }

    public function insert($table, $data) {
        $fields = $this->listField($table);

        $params = array();
        $column = array();
        $values = array();

        foreach($data as $key => $val) {
            foreach($fields as $field) {
                if ($key == $field->name && ! $field->primary) {
                    $column[] = "`{$key}`";
                    $values[] = '?';
                    $params[] = $val;
                }
            }
        }

        if (count($column) > 0) {
            $sql = "INSERT INTO `$table` (" . implode(', ', $column) . ") VALUES (" . implode(', ', $values) . ")";
            return $this->query($sql, $params);
        }   

        return FALSE;
    }

    public function delete($table, $keys = NULL) {
        $sql = "DELETE FROM {$table}";

        $param = array();
        $where = array();

        if (is_array($keys)) {
            foreach($keys as $k => $v) {
                $where[] = "`{$k}` = ?";
                $param[] = $v;
            }
        }

        if (count($where) > 0) {
            $sql .= " WHERE (". implode(' AND ', $where) .")";
        }

        return $this->query($sql, $param);
    }

    public function insertId() {
        $this->validate();
        return $this->_conn->insert_id;
    }

    public function trans($action) {
        $this->validate();

        switch($action) {
            case 'start':
                $this->_conn->begin_transaction();
                break;
            case 'commit':
                $this->_conn->commit();
                break;
        }
    }

    public function getError() {
        return $this->_error;
    }

    protected function _error($message) {
        $this->_error = $message;
    }
}