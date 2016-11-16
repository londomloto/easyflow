<?php
namespace Sys\Core;

class Security extends Component {

    protected $_gpc;
    protected $_config;

    public function __construct(IApplication $app) {
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
    public function generateKey() {
        return base64_encode(openssl_random_pseudo_bytes(64));
    }

    /**
     * Generate user access token
     */
    public function generateToken($user) {
        $time = time();

        $data = array(
            // issued time
            'iat' => $time,
            // token id
            'jti' => base64_encode(mcrypt_create_iv(32)),
            // issuer
            'iss' => $this->getService('request')->getServerName(),
            // not before
            'nbf' => $time + 10,
            // expire
            'exp' => $time + 10 + 60,
            // payload
            'data' => array(
                'user_id' => $user->id,
                'user_email' => $user->email
            )
        );

        $config = $this->_config;
        $secret = base64_decode($config->secret_key);
        $token  = \Firebase\JWT\JWT::encode($data, $secret, 'HS512');

        return $token;
    }

    public function verifyToken($token) {
        $config = $this->_config;
        $secret = base64_decode($config->secret_key);
        $result = FALSE;

        try {
            $decode = \Firebase\JWT\JWT::decode($token, $secret, array('HS512'));
            $result = TRUE;
        } catch(\Exception $e) {}

        return $result;
    }

}