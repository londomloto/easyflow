<?php
namespace Sys\Db;

interface IResult  {

    public function __construct(IDb $db, $result);

}