<?php
namespace Sys\Service;

class Mailer extends \Sys\Core\Component {

    protected $_engine;
    protected $_error;

    public function __construct(\Sys\Core\IApplication $app) {
        parent::__construct($app);

        if ($app->getConfig()->application->has('mailer')) {
            $this->_config = $app->getConfig()->application->mailer;
        } else {
            $this->_config = new \Sys\Core\Config(array(
                'smtp_server' => 'server@domain.com',
                'smtp_user' => 'user@domain.com',
                'smtp_pass' => 'pass',
                'smtp_port' => 587,
                'smtp_secure' => 'tls'
            ));
        }

        $this->_engine = new \PHPMailer();

        $this->_engine->SMTPOptions = array(
            'ssl' => array(
                'verify_peer' => FALSE,
                'verify_peer_name' => FALSE,
                'allow_self_signed' => TRUE
            )
        );

        $this->_engine->isSMTP();
        $this->_engine->isHTML(TRUE);
        $this->_engine->SMTPAuth = TRUE;
        // $this->_engine->SMTPDebug = 2;

        $this->applyConfig();
    }

    public function setConfig($name, $value = NULL) {
        parent::setConfig($name, $value);
        $this->applyConfig();
    }

    public function applyConfig() {
        $this->_engine->Host = $this->_config->smtp_server;
        $this->_engine->Username = $this->_config->smtp_user;
        $this->_engine->Password = $this->_config->smtp_pass;
        $this->_engine->SMTPSecure = $this->_config->smtp_secure;
        $this->_engine->SMTPAutoTLS = FALSE;
        $this->_engine->Port = (int)$this->_config->smtp_port;
    }

    public function from($email, $name = NULL) {
        $this->_engine->setFrom($email, $name);
    }

    public function to($email, $name = NULL) {
        $this->_engine->addAddress($email, $name);
    }

    public function cc($email) {
        $this->_engine->addCC($email);
    }

    public function bcc($email) {
        $this->_engine->addBCC($email);
    }

    public function html() {
        $this->_engine->isHTML(TRUE);
    }

    public function subject($subject) {
        $this->_engine->Subject = $subject;
    }

    public function message($message) {
        $this->_engine->Body = $message;
    }

    public function send() {
        $success = $this->_engine->send();

        if ( ! $success) {
            $this->_error = $this->_engine->ErrorInfo;
        }
        return $success;
    }

    public function getError() {
        return $this->_error;
    }

}