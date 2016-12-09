<?php
namespace Sys\Service;

class Session extends \Sys\Core\Component {

    protected $_started;
    protected $_config;
    protected $_elapsed;

    public function __construct(\Sys\Core\IApplication $app) {
        parent::__construct($app);
        
        $this->_started = FALSE;
        $this->_config  = $app->getConfig()->application->session;
    }

    public function isStarted() {
        return $this->_started;
    }

    public function id($id = NULL) {
        if (is_null($id)) {
            return session_id();
        }

        session_id($id);
        return $id;
    }

    public function name() {
        return session_name();
    }

    public function has($key) {
        return isset($_SESSION[$key]);
    }

    public function set($key, $value) {
        $_SESSION[$key] = $value;
    }

    public function get($key) {
        return $this->has($key) ? $_SESSION[$key] : FALSE;
    }

    public function remove($key) {
        unset($_SESSION[$key]);
    }

    public function close() {
        session_write_close();
    }

    public function start($name = NULL, $path = NULL) {

        if ($this->_started) {
            $this->close();
        }
        
        $config = $this->_config;
        $secure = $this->getUrl()->isSecure();
        
        if (is_null($name)) {
            $name = $config->name;
        }

        if (is_null($path)) {
            $path = $config->cookie_path;
        }
        
        session_name($name);

        // setcookie(
        //     session_name(),
        //     session_id(),
        //     $this->_expires,
        //     $config['cookie_path'],
        //     NULL,
        //     $secure,
        //     TRUE
        // );

        session_set_cookie_params(
            $config->cookie_lifetime,
            $path,
            NULL,
            $secure,
            TRUE
        );

        session_start();
        $this->_started = TRUE;
        
        if ($this->isValid()) {
            if ( ! $this->isSafe()) {
                $_SESSION = array();
                $_SESSION['IPADDRESS'] = isset($_SERVER['HTTP_X_FORWARDED_FOR'])
                        ? $_SERVER['HTTP_X_FORWARDED_FOR'] 
                        : $_SERVER['REMOTE_ADDR'];
                $_SESSION['USERAGENT'] = $_SERVER['HTTP_USER_AGENT'];

                $_SESSION['STARTDATE'] = time();
                $_SESSION['STOPDATE']  = $_SESSION['STARTDATE'] + $config->cookie_lifetime;

                $this->regenerate();
            } else if (rand(1, 100) <= 5) {
                $this->regenerate();
            }
        } else {
            $_SESSION = array();
            session_destroy();
            session_start();
        }
    }

    public function info() {
        $start = isset($_SESSION['STARTDATE']) ? $_SESSION['STARTDATE'] : time();
        $stop  = isset($_SESSION['STOPDATE']) ? $_SESSION['STOPDATE'] : $start;

        $info = array(
            'session_name' => session_name(),
            'session_start' => date('Y-m-d H:i:s', $start),
            'session_expired' => date('Y-m-d H:i:s', $stop)
        );
        
        return $info;
    }

    public function destroy() {
        $params = session_get_cookie_params();
        
        setcookie(
            session_name(), 
            '', 
            0, 
            $params['path'], 
            $params['domain'], 
            $params['secure'], 
            isset($params['httponly'])
        );

        $_SESSION = array();
        session_destroy();

        $this->_started = FALSE;
    }
    
    public function isSafe() {
        if ( ! isset($_SESSION['IPADDRESS']) || ! isset($_SESSION['USERAGENT']))
            return FALSE;

        if( $_SESSION['USERAGENT'] != $_SERVER['HTTP_USER_AGENT']
            && ! ( strpos($_SESSION['USERAGENT'], ÔTridentÕ) !== FALSE
                && strpos($_SERVER['HTTP_USER_AGENT'], ÔTridentÕ) !== FALSE)) {
            return FALSE;
        }

        $sessionIpSegment = substr($_SESSION['IPADDRESS'], 0, 7);

        $remoteIpHeader = isset($_SERVER['HTTP_X_FORWARDED_FOR'])
            ? $_SERVER['HTTP_X_FORWARDED_FOR'] 
            : $_SERVER['REMOTE_ADDR'];

        $remoteIpSegment = substr($remoteIpHeader, 0, 7);

        if ($_SESSION['IPADDRESS'] != $remoteIpHeader) {
            return FALSE;
        }

        if ( $_SESSION['USERAGENT'] != $_SERVER['HTTP_USER_AGENT']) {
            return FALSE;
        }

        return TRUE;
    }

    public function regenerate() {
        if (isset($_SESSION['OBSOLETE']) || (isset($_SESSION['OBSOLETE']) && $_SESSION['OBSOLETE'] == TRUE)) {
            return;
        }

        $_SESSION['OBSOLETE'] = TRUE;
        $_SESSION['EXPIRES'] = time() + 10;

        session_regenerate_id(FALSE);

        $id = session_id();
        session_write_close();

        session_id($id);
        session_start();

        if (isset($_SESSION['STARTDATE'], $_SESSION['STOPDATE'])) {
            $current = time();
            $elapsed = $current - $_SESSION['STARTDATE'];
            $_SESSION['STARTDATE'] = $current;
            $_SESSION['STOPDATE']  = $_SESSION['STOPDATE'] + $elapsed;
        }

        unset($_SESSION['OBSOLETE']);
        unset($_SESSION['EXPIRES']);
    }

    public function isValid() {
        if (isset($_SESSION['OBSOLETE']) && ! isset($_SESSION['EXPIRES'])) {
            return FALSE;
        }

        if (isset($_SESSION['EXPIRES']) && $_SESSION['EXPIRES'] < time()) {
            return FALSE;
        }

        return TRUE;
    }

}