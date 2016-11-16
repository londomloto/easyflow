<?php
/**
 * Entri aplikasi
 *
 * @author Roso Sasongko <roso.sasongko@gmail.com>
 */

error_reporting(E_ALL ^ E_DEPRECATED);
ini_set('display_errors', 1);

date_default_timezone_set('Asia/Jakarta');

define('DS', DIRECTORY_SEPARATOR);
define('BASEPATH', __DIR__ . DS);
define('SYSPATH', BASEPATH . 'system' . DS);
define('APPPATH', BASEPATH . 'application' . DS);
define('CFGPATH', BASEPATH . 'config' . DS);
define('PUBPATH', BASEPATH . 'public' . DS);

require __DIR__ . '/vendor/autoload.php';

$app = new Sys\Core\Application();
$app->start();