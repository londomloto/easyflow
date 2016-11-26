<?php
namespace Sys\Core;

interface IEventObject {

    public function stop();
    public function getType();
    public function getData();
    public function getTarget();
    public function isCancelable();

}