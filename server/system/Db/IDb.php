<?php
namespace Sys\Db;

interface IDb {

    public function __construct($host, $user, $pass, $name, $port = NULL);

    public function connect();

    public function query($sql, $params = NULL);

    public function fetchAll($sql, $params = NULL);

    public function fetchOne($sql, $params = NULL);

    public function foundRows();

    public function insert($table, $data);

    public function update($table, $data, $keys = NULL);

    public function delete($table, $keys = NULL);
}