<?php
/**
 * Entri aplikasi
 *
 * @author Roso Sasongko <roso.sasongko@gmail.com>
 */

date_default_timezone_set('Asia/Jakarta');

/**
 * Mandatory Consts
 */
define('DS', DIRECTORY_SEPARATOR);

define('BASEPATH', __DIR__ . DS);
define('SYSPATH', BASEPATH.'system'.DS);
define('APPPATH', BASEPATH.'application'.DS);
define('CFGPATH', BASEPATH.'config'.DS);
define('PUBPATH', BASEPATH.'public'.DS);
define('LANGDIR', BASEPATH.'locale'.DS);

require __DIR__ . '/vendor/autoload.php';

$app = new Sys\Core\Application();
$app->start();