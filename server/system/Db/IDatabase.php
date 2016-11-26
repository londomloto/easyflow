<?php
namespace Sys\Db;

interface IDatabase {

    public function __construct($host, $user, $pass, $name, $port = NULL);

    public function setEventBus(\Sys\Core\IEventBus $eventBus);

    public function getEventBus();

    public function connect();

    public function query($sql, $params = NULL);

    public function fetchAll($sql, $params = NULL);

    public function fetchOne($sql, $params = NULL);

    public function foundRows();

    public function insert($table, $data);

    public function update($table, $data, $keys = NULL);

    public function updateBatch($table, $values, $index);

    public function delete($table, $keys = NULL);

    public function getError();
}