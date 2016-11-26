<?php
namespace Sys\Db;

interface IResult  {

    public function __construct(IDatabase $db, $result);

}