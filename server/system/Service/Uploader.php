<?php
namespace Sys\Service;

use Sys\Helper\File;

class Uploader extends \Sys\Core\Component {
    
    protected $_name;
    protected $_data;
    protected $_path;
    protected $_type;
    protected $_limit;
    protected $_error;

    public function setup($options = array()) {
        $this->_path  = isset($options['path']) ? $options['path'] : PUBPATH.'upload';
        $this->_limit = isset($options['limit']) ? $options['limit'] : NULL;
        $this->_type  = isset($options['type']) ? $options['type'] : '*';
        $this->_name  = isset($options['name']) ? $options['name'] : FALSE;
        $this->_error = '';
        $this->_data  = NULL;
    }

    /**
     * Single upload
     */
    public function upload($key = NULL) {
        $key  = is_null($key) ? 'userfile' : $key;
        $file = $_FILES[$key];

        if ( ! isset($file['error']) || is_array($file['error'])) {
            $this->_error = 'Parameter upload tidak valid';
            return FALSE;
        }

        switch($file['error']) {
            case UPLOAD_ERR_OK:
                break;
            case UPLOAD_ERR_NO_FILE:
                $this->_error = 'Tidak ada file yang diupload';
                return FALSE;
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                $this->_error = 'File yang diupload melebihi kapasitas';
                return FALSE;
            default:
                $this->_error = 'Upload file gagal';
                return FALSE;
        }

        if ( ! is_null($this->_limit)) {
            if ($file['size'] > $this->_limit) {
                $this->_error = 'File yang diupload melebihi kapasitas';
                return FALSE;
            }
        }

        $mime = File::getType($file['tmp_name']);

        if ($this->_name) {
            $orig = $this->_name;
            $exts = substr($orig, strrpos($orig, '.') + 1);
        } else {
            if ($file['name'] == 'blob') {
                $exts = File::getExtensionFromType($mime);
                $orig = $file['name'].'.'.$exts;
            } else {
                $exts = File::getExtension($file['name']);
                $orig = $file['name'];
            }
        }

        if ($this->_type != '*') {
            if ( ! preg_match('/'. $this->_type .'/i', $exts)) {
                $this->_error = 'Format file tidak diperbolehkan';
                return FALSE;
            }
        }

        $size = $file['size'];
        $name = sprintf('%s.%s', sha1($file['tmp_name'].date('YmdHis')), $exts);
        
        if ( ! move_uploaded_file($file['tmp_name'], $this->_path.$name)) {
            $this->_error = 'Upload file gagal';
            return FALSE;
        } else {
            $this->_data = array(
                'file_name' => $name,
                'file_size' => $size,
                'file_type' => $mime,
                'orig_name' => $orig
            );
            return TRUE;
        }
    }

    public function uploadUrl($url) {
        $url = htmlspecialchars_decode($url);

        $data = file_get_contents($url);
        $orig = substr($url, 0, strpos($url, '?'));
        $orig = basename($orig);
        $exts = substr($orig, strrpos($orig, '.') + 1);
        $name = sprintf('%s.%s', sha1($url.date('YmdHis')), $exts);
        $file = $this->_path.$name;

        if (file_put_contents($file, $data)) {
            $this->_data = array(
                'file_name' => $name,
                'file_size' => filesize($file),
                'orig_name' => $orig
            );
            return TRUE;
        } else {
            $this->_error = 'Upload file gagal';
            return FALSE;
        }
    }

    public function getResult() {
        return $this->_data;
    }

    public function getError() {
        return $this->_error;
    }

}