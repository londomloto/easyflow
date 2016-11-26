<?php
namespace Sys\Library;

use Sys\Helper\File;

class Image {

    protected $_file;

    public function __construct($file) {
        $this->_file = $file;
    }

    public function thumbnail($width = 100, $height = 100) {
        session_write_close();
        ini_set('memory_limit', '500M');

        $file = $this->_file;
        $mime = File::getType($file);

        if (in_array($mime, array('image/png', 'image/x-png'))) {
            apache_setenv('no-gzip', 1);
        }

        $etag = md5_file($file);
        $lastmod = gmdate('D, d M Y H:i:s', filemtime($file)) . ' GMT';
        $expires = gmdate('D, d M Y H:i:s', time()) . ' GMT';

        self::caching($etag, $lastmod, $mime);

        $size = getimagesize($file);
        $quality = 100;

        $imageWidth = $size[0];
        $imageHeight = $size[1];

        if ($width >= $imageWidth && $height >= $imageHeight) {
            $width = $imageWidth;
            $height = $imageHeight;
        }

        $offsetX = 0;
        $offsetY = 0;
        $ratio = "{$width}:{$height}";
        $cropRatio = explode(':', (string) $ratio);
           
        if (count($cropRatio) == 2) {

            $ratioComputed = $imageWidth / $imageHeight;
            $cropRatioComputed = (float) $cropRatio[0] / (float) $cropRatio[1];

            if ($ratioComputed < $cropRatioComputed) { 
                $origHeight = $imageHeight;
                $imageHeight = $imageWidth / $cropRatioComputed;
                $offsetY = ($origHeight - $imageHeight) / 2;
            } else if ($ratioComputed > $cropRatioComputed) { 
                $origWidth = $imageWidth;
                $imageWidth = $imageHeight * $cropRatioComputed;
                $offsetX = ($origWidth - $imageWidth) / 2;
            }
        }

        $xRatio = $width / $imageWidth;
        $yRatio = $height / $imageHeight;

        if ($xRatio * $imageHeight < $height) { 
            $tnHeight = ceil($xRatio * $imageHeight);
            $tnWidth = $width;
        } else {
            $tnWidth = ceil($yRatio * $imageWidth);
            $tnHeight = $height;
        }

        $dst = imagecreatetruecolor($tnWidth, $tnHeight);

        switch ($mime) {
            case 'image/gif':
                $creationFunction = 'ImageCreateFromGif';
                $outputFunction = 'ImagePng';
                $mime = 'image/png';
                $doSharpen = FALSE;
                $quality = round(10 - ($quality / 10));
            break;

            case 'image/x-png':
            case 'image/png':
                $creationFunction = 'ImageCreateFromPng';
                $outputFunction = 'ImagePng';
                $doSharpen = FALSE;
                $quality = round(10 - ($quality / 10));
            break;

            default:
                $creationFunction = 'ImageCreateFromJpeg';
                $outputFunction = 'ImageJpeg';
                $doSharpen = TRUE;
            break;
        }

        $src = $creationFunction($file);

        if (in_array($mime, array('image/gif', 'image/png'))) {
            imagealphablending($dst, FALSE);
            imagesavealpha($dst, TRUE);
        }

        ImageCopyResampled($dst, $src, 0, 0, $offsetX, $offsetY, $tnWidth, $tnHeight, $imageWidth, $imageHeight);

        ob_start();
        $outputFunction($dst, NULL, $quality);
        $data = ob_get_contents();
        ob_clean();

        ImageDestroy($src);
        ImageDestroy($dst);

        header("Cache-Control: cache");
        header("Pragma: cache");
        header("Expires: ".$expires);
        header("Content-type: ".$mime);
        header("Content-Length: ".strlen($data));

        echo $data;
    }

    public static function caching($etag, $lastmodified, $mime = '') {
        $etag_str = $etag;

        header("Last-Modified: $lastmodified");
        header("ETag: \"{$etag}\"");

        $if_none_match     = isset($_SERVER['HTTP_IF_NONE_MATCH']) ? stripslashes($_SERVER['HTTP_IF_NONE_MATCH']) : FALSE;
        $if_modified_since = isset($_SERVER['HTTP_IF_MODIFIED_SINCE']) ? stripslashes($_SERVER['HTTP_IF_MODIFIED_SINCE']) : FALSE;

        if (isset($_SERVER['HTTP_ACCEPT_ENCODING']) && strpos($_SERVER['HTTP_ACCEPT_ENCODING'], 'gzip') !== FALSE) {
            if ( ! in_array($mime, array('image/x-png'))) {
                $etag = $etag.'-gzip';
                $if_none_match = strtolower(str_replace(array(
                    '"',
                    '-gzip'
                ) , '', $if_none_match)) . '-gzip';
            }
        }

        if ( ! $if_modified_since && ! $if_none_match) return;
        if ($if_none_match && $if_none_match != $etag && $if_none_match != '"' . $etag . '"') return;
        if ($if_modified_since && $if_modified_since != $lastmodified) return;

        header('HTTP/1.1 304 Not Modified');
        exit();
    }

    public function render() {

    }

}