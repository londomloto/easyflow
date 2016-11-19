<?php
namespace Sys\Service;

class Security extends \Sys\Core\Component {

    protected $_gpc;
    protected $_config;

    public function __construct(\Sys\Core\IApplication $app) {
        parent::__construct($app);

        $this->_gpc = get_magic_quotes_gpc();
        $this->_config = $this->getAppConfig()->application->security;

    }
    
    public function sanitize($data) {
        if (is_array($data)) {
            foreach($data as $key => $val) {
                $data[$key] = $this->sanitize($val);
            }
        } else {
            if (is_string($data)) {
                if ( ! $this->_gpc) {
                    $data = addslashes($data);
                }
                $data = strip_tags($data);
                $data = htmlspecialchars(
                    $data, 
                    ENT_COMPAT | ENT_HTML401, 
                    $this->getAppConfig()->application->charset
                );
            }
        }
        return $data;
    }

    public function sanitizeQuery($query) {
        if ( ! empty($query)) {
            parse_str($query, $array);
            $array = $this->sanitize($array);
            $query = http_build_query($array);
        }
        return $query;
    }

    public function generateSalt($length = 6) {
        $salt = md5(uniqid(rand(), TRUE));
        return substr($salt, 0, $length);
    }

    public function generateHash($password, $salt) {
        return hash('sha256', $password.$salt);
    }

    /**
     * Useful for generating secret key
     */
    public function generateKey($encoder = 'base64_encode', $length = 32) {
        return $encoder(openssl_random_pseudo_bytes($length));
    }
    
    /**
     * Like generateKey(), but numeric only
     */
    public function generateId($length = 6) {
        $chars = '0123456789';
        $max = strlen($chars) - 1;
        $id = date('YmdHis').'-';

        for ($i = 0; $i < $length; $i++) {
            $id .= $chars[mt_rand(0, $max)];
        }

        return $id;
    }

    /**
     * Useful for generating auth token
     */
    public function generateToken($payload = array(), $lifetime = NULL) {
        $time = time();

        if (is_null($lifetime)) {
            $lifetime = $this->getAppConfig()->application->session->cookie_lifetime;
        }

        $data = array(
            // issued time
            'iat' => $time,
            // token id
            'jti' => base64_encode(mcrypt_create_iv(32)),
            // issuer
            'iss' => $this->getService('request')->getServerName(),
            // not before ($time + 10)
            'nbf' => $time + 1,
            // expire
            'exp' => $time + 1 + $lifetime,
            // payload
            'data' => $payload
        );

        $config = $this->_config;
        $secret = base64_decode($config->secret_key);
        $token  = \Firebase\JWT\JWT::encode($data, $secret, 'HS512');

        return $token;
    }

    /**
     * Generate user access token
     */
    public function generateUserToken($user, $lifetime = 1400) {
        return $this->generateToken(array(
            'user_id' => $user->id,
            'user_email' => $user->email
        ), $lifetime);
    }

    public function verifyToken($token) {
        $config = $this->_config;
        $secret = base64_decode($config->secret_key);
        $result = FALSE;

        try {
            $result = \Firebase\JWT\JWT::decode($token, $secret, array('HS512'));
        } catch(\Exception $e) {
            $message = $e->getMessage();

            switch(TRUE) {
                case $e instanceof \Firebase\JWT\BeforeValidException:
                    $message = "Hak akses Anda belum aktif";
                    break;
                case $e instanceof \Firebase\JWT\ExpiredException:
                    $message = "Hak akses Anda sudah kadaluarsa";
                    break;
            }

            throw new SecurityException($message);
        }
        
        return $result;
    }

}