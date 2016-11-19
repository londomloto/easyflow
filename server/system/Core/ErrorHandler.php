<?php
namespace Sys\Core;

class ErrorHandler extends Component {

    public static function isFatal($severity) {
        return in_array(
            $severity, 
            array(
                E_ERROR,
                E_PARSE,
                E_CORE_ERROR,
                E_COMPILE_ERROR,
                E_USER_ERROR,
                E_RECOVERABLE_ERROR
            )
        ) ? TRUE : FALSE;
    }

    public static function isUnhandledError($severity) {
        return in_array(
            $severity,
            array(
                E_PARSE
            )
        ) ? TRUE : FALSE;
    }

    public static function getSeverityName($severity) {
        switch($severity) {
            case E_ERROR:
            case E_CORE_ERROR:
            case E_COMPILE_ERROR:
            case E_PARSE:
                return "Kesalahan fatal";
            case E_USER_ERROR:
            case E_RECOVERABLE_ERROR:
                return "Kesalahan";
            case E_WARNING:
            case E_USER_WARNING:
            case E_CORE_WARNING:
            case E_COMPILE_WARNING:
                return "Peringatan";
            case E_NOTICE:
            case E_USER_NOTICE:
                return "Notifikasi";
            case E_STRICT:
                return "Debug";
            default:
                return "Kesalahan tidak dikenal";
        }
    }

    public static function getStatusCode($exception) {
        $code = (int) $exception->getCode();
        $maps = array(
            401 => 401,
            403 => 403,
            404 => 404,
            500 => 500
        );
        return isset($maps[$code]) ? $maps[$code] : 500;
    }

    public static function getStatusName($status) {
        $maps = array(
            401 => 'Unauthorized',
            403 => 'Forbidden',
            404 => 'Not Found',
            500 => 'Internal Server Error'
        );

        return isset($maps[$status]) ? $maps[$status] : 'Internal Server Error';
    }

    public function isJsonRequest() {
        return $this->hasService('request') ? $this->getService('request')->isJson() : FALSE;
    }

    public function handleError($errno, $errstr, $errfile, $errline) {
        $fatal = self::isFatal($errno);
        $debug = $this->getApp()->isDebug();

        if ( ! ob_get_level()) {
            ob_start();
        }

        $content = ob_get_contents();
        ob_end_clean();

        $name = self::getSeverityName($errno);
        $json = $this->isJsonRequest();

        if ($fatal) {
            header('HTTP/1.1 500 Internal Server Error');
        }

        if ($json) {
            if ($fatal) {
                header('Content-Type: application/json');
                
                $data = array(
                    'title' => $name,
                    'status'  => 500,
                    'success' => FALSE,
                    'message' => $errstr
                );
                
                print(json_encode($data, JSON_PRETTY_PRINT));    
                exit();
            }
        } else {
            if ( ! empty($content)) {
                echo $content;
            }

            if ($debug) {
                if ($fatal) {
                    $data = array(
                        'name' => $name,
                        'file' => $errfile,
                        'line' => $errline,
                        'message' => $errstr
                    );
                    extract($data);
                    include(SYSPATH.'Template/error.php');
                } else {
                    echo "<br><b>$name</b>: $errstr in <b>$errfile</b> on line <b>$errline</b><br>";
                }
            }
        }
    }

    public function handleException($exception) {
        $debug = $this->getApp()->isDebug();
        $content = NULL;
        
        if ( ! ob_get_level()) {
            ob_start();
        }

        $content = ob_get_contents();
        ob_end_clean();

        $json = $this->isJsonRequest();

        $code = self::getStatusCode($exception);
        $name = self::getStatusName($code);

        header("HTTP/1.1 {$code} {$name}");

        if ($json) {
            $data = array(
                'title' => $name,
                'status' => $code,
                'success' => FALSE, 
                'message' => $exception->getMessage()
            );
            print(json_encode($data, JSON_PRETTY_PRINT));
            exit;
        } else {
            header("HTTP/1.1 {$code} {$name}");

            if ( ! is_null($content)) {
                echo $content;
            }

            if ($debug) {
                $data = array(
                    'code' => $code,
                    'name' => $name,
                    'message' => $exception->getMessage(),
                    'file' => $exception->getFile(),
                    'line' => $exception->getLine(),
                    'trace' => $exception->getTrace()
                );

                extract($data);
                include(SYSPATH.'Template/exception.php');
            }
        }

    }

    public function handleShutdown() {
        $lastError = error_get_last();

        if (is_null($lastError) === FALSE) {
            $code  = $lastError['type'];
            
            if (self::isUnhandledError($code)) {
                if ( ! headers_sent()) {
                    header("HTTP/1.1 500 Internal Server Error");
                }

                $name = self::getSeverityName($code);
                $json = $this->isJsonRequest();
                
                if ($json) {
                    if ( ! headers_sent()) {
                        header('Content-Type: application/json');
                    }

                    $data = array(
                        'title' => $name,
                        'status' => 500,
                        'success' => FALSE,
                        'message' => $lastError['message']
                    );

                    print(json_encode($data, JSON_PRETTY_PRINT));
                    exit;
                } else {
                    
                    $debug = $this->getApp()->isDebug();

                    if ($debug) {
                        $data = array(
                            'name' => $name,
                            'file' => $lastError['file'],
                            'line' => $lastError['line'],
                            'message' => $lastError['message']
                        );

                        extract($data);
                        include(SYSPATH.'Template/error.php');    
                    }
                }
            }
        }
        
    }

}