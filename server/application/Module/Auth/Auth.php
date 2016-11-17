<?php
namespace App\Module\Auth;

class Auth extends \Sys\Core\Module {
    
    public function loginAction() {
        $post = $this->request->getInput();
        $data = array();

        if (isset($post['email'], $post['passwd'])) {
            if ($this->auth->login($post['email'], $post['passwd'])) {
                $data['success'] = TRUE;
                $data['user'] = $this->auth->getUser();
            } else {
                $data['success'] = FALSE;
                $data['message'] = $this->auth->getError();
            }
        } else {
            $data['success'] = FALSE;
            $data['message'] = 'Inputan email dan sandi tidak boleh kosong';
        }

        $this->response->responseJson();
        return $data;
    }

    public function logoutAction() {
        $this->auth->logout();
        $this->response->responseJson();

        return array(
            'success' => TRUE
        );
    }

    public function registerAction() {
        $post = $this->request->getInput();
        $data = array();

        if (isset($post['email'], $post['passwd'], $post['fullname'])) {
            $user = $this->auth->register($post);
            if ($user) {
                $this->auth->login($user['email'], $post['passwd']);
                $data['success'] = TRUE;
                $data['user'] = $this->auth->getUser();
            } else {
                $data['success'] = FALSE;
                $data['message'] = $this->auth->getError();
            }
        } else {
            $data['success'] = FALSE;
            $data['message'] = 'Inputan data tidak valid';
        }
        
        $this->response->responseJson();
        return $data;
    }

    public function socialAction() {
        $post = $this->request->getInput();
        $user = $this->auth->find($post['email']);
        $data = array(
            'success' => FALSE
        );

        if ( ! $user) {
            $post['passwd'] = $this->security->generateSalt(8);
            $user = $this->auth->register($post);
            if ($user) {
                $this->auth->login($user['email'], $post['passwd']);
                $data['success'] = TRUE;
                $data['user'] = $this->auth->getUser();
            } else {
                $data['success'] = FALSE;
                $data['message'] = $this->auth->getError();
            }
        } else {
            $this->auth->login($user->email, $user->passwd, TRUE);
            $data['success'] = TRUE;
            $data['user'] = $this->auth->getUser();
        }

        // update avatar
        if ($post['avatar']) {
            if ($upload = $this->uploadAvatar($post['avatar'])) {
                
                $avatar = $upload['file_name'];
                $avatarName = $upload['orig_name'];

                $this->db->update(
                    'user',
                    array(
                        'avatar' => $avatar,
                        'avatar_name' => $avatarName
                    ),
                    array(
                        'email' => $post['email']
                    )
                );

                $data['user']->avatar = $avatar;
                $data['user']->avatar_name = $avatarName;
                $data['user']->avatar_url = $this->url->getBaseUrl().'public/upload/avatar/'.$avatar;

                $this->session->set('user', $data['user']);
            }
        }

        $this->response->responseJson();
        return $data;
    }

    public function uploadAvatar($url) {
        $this->uploader->setup(array(
            'path' => PUBPATH.'upload'.DS.'avatar'.DS
        ));

        if ($this->uploader->uploadUrl($url)) {
            return $this->uploader->getResult();
        } else {
            return FALSE;
        }
    }

}