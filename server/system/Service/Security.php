<?php
namespace Sys\Service;

use Sys\Helper\Kernel;

class Security extends \Sys\Core\Component {

    protected $_gpc;
    protected $_config;
    protected $_xsshash;

    protected $_disallowedString = array(
        'document.cookie' => '[removed]',
        'document.write' => '[removed]',
        '.parentNode' => '[removed]',
        '.innerHTML' => '[removed]',
        '-moz-binding' => '[removed]',
        '<!--' => '&lt;!--',
        '-->' => '--&gt;',
        '<![CDATA[' => '&lt;![CDATA[',
        '<comment>' => '&lt;comment&gt;'
    );

    protected $_disallowedRegexes = array(
        'javascript\s*:',
        '(document|(document\.)?window)\.(location|on\w*)',
        'expression\s*(\(|&\#40;)',
        'vbscript\s*:',
        'wscript\s*:',
        'jscript\s*:',
        'vbs\s*:',
        'Redirect\s+30\d',
        "([\"'])?data\s*:[^\\1]*?base64[^\\1]*?,[^\\1]*?\\1?"
    );

    public function __construct(\Sys\Core\IApplication $app) {
        parent::__construct($app);

        $this->_gpc = get_magic_quotes_gpc();
        $this->_config = $app->getConfig()->application->security;

        if ( ! $this->_config->has('secret_key')) {
            $this->_config->set('secret_key', 'Lv4dmEWEWAjEyLaJkXz+BGvypPYcH/aSO3LMOCloAuM=');
        }

    }

    protected function _converAttribute($match) {
        return str_replace(array('>', '<', '\\'), array('&gt;', '&lt;', '\\\\'), $match[0]);
    }

    protected function _decodeEntity($match) {
        $charset = $this->_app->getConfig()->application->charset;
        $match = preg_replace('|\&([a-z\_0-9\-]+)\=([a-z\_0-9\-/]+)|i', $this->xssHash().'\\1=\\2', $match[0]);
        return str_replace($this->xssHash(), '&', $this->decodeEntity($match, $charset));
    }

    protected function _neverAllowed($str) {
        $str = str_replace(array_keys($this->_disallowedString), $this->_disallowedString, $str);

        foreach ($this->_disallowedRegexes as $regex) {
            $str = preg_replace('#'.$regex.'#is', '[removed]', $str);
        }

        return $str;
    }

    protected function _compactWords($matches){
        return preg_replace('/\s+/s', '', $matches[1]).$matches[2];
    }

    protected function _jsLinkRemoval($match) {
        return str_replace($match[1],
            preg_replace('#href=.*?(?:(?:alert|prompt|confirm)(?:\(|&\#40;)|javascript:|livescript:|mocha:|charset=|window\.|document\.|\.cookie|<script|<xss|data\s*:)#si',
                    '',
                    $this->_filter_attributes(str_replace(array('<', '>'), '', $match[1]))
            ),
            $match[0]);
    }

    protected function _jsImageRemoval($match) {
        return str_replace($match[1],
            preg_replace('#src=.*?(?:(?:alert|prompt|confirm)(?:\(|&\#40;)|javascript:|livescript:|mocha:|charset=|window\.|document\.|\.cookie|<script|<xss|base64\s*,)#si',
                    '',
                    $this->_filter_attributes(str_replace(array('<', '>'), '', $match[1]))
            ),
            $match[0]);
    }

    protected function _removeEvilAttr($str) {
        $evil_attributes = array('on\w*', 'style', 'xmlns', 'formaction', 'form', 'xlink:href', 'FSCommand', 'seekSegmentTime');

        do {
            $count = $temp_count = 0;

            $str = preg_replace('/(<[^>]+)(?<!\w)('.implode('|', $evil_attributes).')\s*=\s*(\042|\047)([^\\2]*?)(\\2)/is', '$1[removed]', $str, -1, $temp_count);
            $count += $temp_count;

            $str = preg_replace('/(<[^>]+)(?<!\w)('.implode('|', $evil_attributes).')\s*=\s*([^\s>]*)/is', '$1[removed]', $str, -1, $temp_count);
            $count += $temp_count;
        } while ($count);

        return $str;
    }

    protected function _sanitizeKiddies($matches) {
        return '&lt;'.$matches[1].$matches[2].$matches[3].str_replace(array('>', '<'), array('&gt;', '&lt;'), $matches[4]);
    }

    /**
     * Taken from codeigniter
     */
    public function _removeInvisibleChars($str, $urlEncoded = TRUE) {
        $nonDisplayable = array();

        if ($urlEncoded) {
            $nonDisplayable[] = '/%0[0-8bcef]/';
            $nonDisplayable[] = '/%1[0-9a-f]/';
        }

        $nonDisplayable[] = '/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]+/S';

        do {
            $str = preg_replace($nonDisplayable, '', $str, -1, $count);
        } while ($count);

        return $str;
    }

    protected function _filter_attributes($str) {
        $out = '';
        if (preg_match_all('#\s*[a-z\-]+\s*=\s*(\042|\047)([^\\1]*?)\\1#is', $str, $matches)) {
            foreach ($matches[0] as $match) {
                $out .= preg_replace('#/\*.*?\*/#s', '', $match);
            }
        }
        return $out;
    }

    public function xssHash() {
        if ($this->_xsshash === NULL) {
            $rand = $this->generateBytes(16);
            $this->_xsshash = ($rand === FALSE)
                ? md5(uniqid(mt_rand(), TRUE))
                : bin2hex($rand);
        }

        return $this->_xsshash;
    }

    public function decodeEntity($str, $charset = NULL) {
        if (strpos($str, '&') === FALSE) {
            return $str;
        }

        static $_entities;

        isset($charset) OR $charset = $this->charset;

        $flag = Kernel::php('5.4')
            ? ENT_COMPAT | ENT_HTML5
            : ENT_COMPAT;

        do {
            $strCompare = $str;

            if (preg_match_all('/&[a-z]{2,}(?![a-z;])/i', $str, $matches)) {
                if ( ! isset($_entities)) {
                    $_entities = array_map(
                        'strtolower',
                        Kernel::php('5.3.4')
                            ? get_html_translation_table(HTML_ENTITIES, $flag, $charset)
                            : get_html_translation_table(HTML_ENTITIES, $flag)
                    );  

                    if ($flag === ENT_COMPAT) {
                        $_entities[':'] = '&colon;';
                        $_entities['('] = '&lpar;';
                        $_entities[')'] = '&rpar;';
                        $_entities["\n"] = '&newline;';
                        $_entities["\t"] = '&tab;';
                    }
                }

                $replace = array();
                $matches = array_unique(array_map('strtolower', $matches[0]));

                foreach ($matches as &$match) {
                    if (($char = array_search($match.';', $_entities, TRUE)) !== FALSE) {
                        $replace[$match] = $char;
                    }
                }

                $str = str_ireplace(array_keys($replace), array_values($replace), $str);
            }

            $str = html_entity_decode(
                preg_replace('/(&#(?:x0*[0-9a-f]{2,5}(?![0-9a-f;])|(?:0*\d{2,4}(?![0-9;]))))/iS', '$1;', $str),
                $flag,
                $charset
            );
        } while ($strCompare !== $str);

        return $str;
    }
    
    public function sanitize($data) {
        if (is_array($data)) {
            while(list($key) = each($data)) {
                $data[$key] = $this->sanitize($data[$key]);
            }
            return $data;
        } else {
            $data = $this->_removeInvisibleChars($data);
            
            do {
                $data = rawurldecode($data);
            } while (preg_match('/%[0-9a-f]{2,}/i', $data));

            $data = preg_replace_callback("/[^a-z0-9>]+[a-z0-9]+=([\'\"]).*?\\1/si", array($this, '_converAttribute'), $data);
            $data = preg_replace_callback('/<\w+.*/si', array($this, '_decodeEntity'), $data);

            $data = $this->_removeInvisibleChars($data);
            $data = str_replace("\t", ' ', $data);

            $data = $this->_neverAllowed($data);
            $data = str_replace(array('<?', '?'.'>'), array('&lt;?', '?&gt;'), $data);

            $words = array(
                'javascript', 'expression', 'vbscript', 'jscript', 'wscript',
                'vbs', 'script', 'base64', 'applet', 'alert', 'document',
                'write', 'cookie', 'window', 'confirm', 'prompt'
            );

            foreach ($words as $word) {
                $word = implode('\s*', str_split($word)).'\s*';
                $data = preg_replace_callback('#('.substr($word, 0, -3).')(\W)#is', array($this, '_compactWords'), $data);
            }

            do {
                $original = $data;

                if (preg_match('/<a/i', $data)) {
                    $data = preg_replace_callback('#<a[^a-z0-9>]+([^>]*?)(?:>|$)#si', array($this, '_jsLinkRemoval'), $data);
                }

                if (preg_match('/<img/i', $data)) {
                    $data = preg_replace_callback('#<img[^a-z0-9]+([^>]*?)(?:\s?/?>|$)#si', array($this, '_jsImageRemoval'), $data);
                }

                if (preg_match('/script|xss/i', $data)) {
                    $data = preg_replace('#</*(?:script|xss).*?>#si', '[removed]', $data);
                }
            } while ($original !== $data);

            unset($original);

            $data = $this->_removeEvilAttr($data);

            $kiddies = 'alert|prompt|confirm|applet|audio|basefont|base|behavior|bgsound|blink|body|embed|expression|form|frameset|frame|head|html|ilayer|iframe|input|button|select|isindex|layer|link|meta|keygen|object|plaintext|style|script|textarea|title|math|video|svg|xml|xss';
            $data = preg_replace_callback('#<(/*\s*)('.$kiddies.')([^><]*)([><]*)#is', array($this, '_sanitizeKiddies'), $data);
            $data = preg_replace('#(alert|prompt|confirm|cmd|passthru|eval|exec|expression|system|fopen|fsockopen|file|file_get_contents|readfile|unlink)(\s*)\((.*?)\)#si',
                    '\\1\\2&#40;\\3&#41;', $data);

            $data = $this->_neverAllowed($data);
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

    public function generateBytes($length = 32) {
        if (function_exists('random_bytes')) {
            $bytes = random_bytes($length);
        } else if (function_exists('openssl_random_pseudo_bytes')) {
            $bytes = openssl_random_pseudo_bytes($length);
        } else {
            throw new \Exception(_('No cryptographically secure random function available'));
        }
        return $bytes;
    }

    /**
     * Useful for generating secret key
     */
    public function generateKey($encoder = 'base64_encode', $length = 32) {
        if (is_null($encoder)) $encoder = 'base64_encode';
        return $encoder($this->generateBytes($length));
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
    public function generateToken($payload = array(), $timeout = NULL) {
        $time = time();
        $secret = $this->_config->secret_key;

        if (is_null($timeout)) {
            $timeout = $this->getSession()->getConfig()->cookie_lifetime;
        }

        $issudedName = $this->getRequest()->getServerName();
        $issudedDate = $time;
        $enabledDate = $time + 1;
        $expiredDate = $time + 1 + $timeout;

        // additionals payload
        $payload['issuded_date'] = date('Y-m-d H:i:s', $issudedDate);
        $payload['enabled_date'] = date('Y-m-d H:i:s', $enabledDate);
        $payload['expired_date'] = date('Y-m-d H:i:s', $expiredDate);

        $tokenId = base64_encode(mcrypt_create_iv(32, MCRYPT_DEV_URANDOM));
        
        $data = array(
            // issued time
            'iat' => $issudedDate,
            // token id
            'jti' => $tokenId,
            // issuer
            'iss' => $issudedName,
            // not before
            'nbf' => $enabledDate,
            // expire
            'exp' => $expiredDate,
            // payload
            'data' => $payload
        );

        $token  = \Firebase\JWT\JWT::encode($data, base64_decode($secret), 'HS512');
        return $token;
    }

    public function verifyToken($token) {
        $secret = $this->_config->secret_key;

        $result = array(
            'success' => FALSE,
            'message' => '',
            'payload' => NULL
        );
        
        try {
            $decoded = \Firebase\JWT\JWT::decode($token, base64_decode($secret), array('HS512'));

            $result['success'] = TRUE;
            $result['payload'] = $decoded->data;
        } catch(\Exception $e) {
            $message = $e->getMessage();

            switch(TRUE) {
                case $e instanceof \Firebase\JWT\BeforeValidException:
                    $message = _('Access token is not ready yet');
                    break;
                case $e instanceof \Firebase\JWT\ExpiredException:
                    $message = _('Access token has been expired');
                    break;
            }

            $result['message'] = $message;
        }
        
        return $result;
    }

}