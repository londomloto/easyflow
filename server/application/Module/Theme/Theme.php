<?php
namespace App\Module\Theme;

class Theme extends \Sys\Core\Module {
    
    /**
     * @Authenticate
     */
    public function testAction() {

    }

    public function templateAction($template) {
        if ( ! $this->auth->getCurrentUser()) {
            echo '<div>'._('Your session has been expired').'</div>';
        } else {
            $template = str_replace(array('.html'), '', $template);
            $caps = $this->role->getCapabilities();
            
            $content = $this->template->load($template, array(
                'can' => $caps
            ));

            echo $content;
        }
    }

}