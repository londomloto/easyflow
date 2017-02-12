<?php
namespace App\Module\Theme;

class Theme extends \Sys\Core\Module {
    
    /**
     * @authentication
     */
    public function testAction() {

    }

    public function templateAction($template) {
        $template = str_replace(array('.html'), '', $template);

        $result = array(
            'success' => TRUE,
            'status' => 200,
            'data' => ''
        );

        // check session auth
        if ( ! $this->auth->getCurrentUser()) {
            
            $result['success'] = FALSE;
            $result['status'] = 401;

        } else {
            $result['data'] = $this->template->load($template);
        }
        
        $this->response->setJsonContent($result);
    }

}