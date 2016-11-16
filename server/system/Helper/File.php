<?php
namespace Sys\Helper;

class File {

    public static function getExtension($file) {
        $ext = pathinfo($file, PATHINFO_EXTENSION);
        return $ext;
    }

    public static function getExtensionFromType($type) {
        $maps = array(
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/x-png' => 'png'
        );

        return isset($maps[$type]) ? $maps[$type] : 'application/octet-stream';
    }

    public static function getType($file) {
        $info = new \finfo(FILEINFO_MIME_TYPE);
        $mime = $info->file($file);
        $info = NULL;
        return $mime;
    }

    public function delete($file) {
        return @unlink($file);
    }

}