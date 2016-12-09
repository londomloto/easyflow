<?php

/* backend-user-edit.html */
class __TwigTemplate_5557a962921168c70ff76b29e864db80b14ef11ca7f3b66d965e2da344b2fe21 extends Twig_Template
{
    public function __construct(Twig_Environment $env)
    {
        parent::__construct($env);

        $this->parent = false;

        $this->blocks = array(
        );
    }

    protected function doDisplay(array $context, array $blocks = array())
    {
        // line 1
        $context["readonly"] = (($this->getAttribute((isset($context["can"]) ? $context["can"] : null), "update_user", array())) ? ("") : ("readonly"));
        // line 2
        echo "<div class=\"col-sm-3 col-lg-2\">
    ";
        // line 9
        echo "
    <div data-ui-lightbox=\".profile-photo\">
        <a class=\"profile-photo\" data-ng-href=\"{{ photo.data }}\">
            <img data-ui-image=\"photo.file\" class=\"img-responsive\" data-ng-src=\"{{ edit.avatar | thumbnail:'/user/':200:200 }}\">    
        </a>
    </div>    
    ";
        echo "

    ";
        // line 11
        if ($this->getAttribute((isset($context["can"]) ? $context["can"] : null), "update_user", array())) {
            // line 12
            echo "        ";
            // line 20
            echo "
        <div class=\"m-t text-center\">
            <div class=\"form-file\">
                <input data-ui-file=\"photo.file\" data-on-select=\"onSelectPhoto\" type=\"file\">
                <button class=\"btn white\">Unggah Foto</button>
                <p class=\"p-a\">{{ photo.name }}</p>
            </div>
        </div>
        ";
            echo "
    ";
        }
        // line 22
        echo "</div>

<div class=\"col-sm-9 col-lg-10\">
    <div class=\"row-col light lt\">
        <form name=\"form\" data-ng-submit=\"saveUser(form)\" class=\"p-a-md col-md-6\" novalidate>
            <h4 class=\"m-a-0 m-b-sm text-md\">Profile Pengguna</h4>
            <hr>
            <div class=\"form-group\">
                <label>Hak Akses</label>

                ";
        // line 32
        if ($this->getAttribute((isset($context["can"]) ? $context["can"] : null), "update_user", array())) {
            // line 33
            echo "                    ";
            // line 37
            echo "
                    <select data-ng-model=\"edit.role\" name=\"role\" class=\"form-control\" required>
                        <option data-ng-repeat=\"role in roles\" value=\"{{ role.name }}\">{{ role.title }}</option>
                    </select>
                    ";
            echo "
                ";
        } else {
            // line 39
            echo "                    <input type=\"text\" data-ng-model=\"edit.role\" name=\"role\" class=\"form-control\" required ";
            echo twig_escape_filter($this->env, (isset($context["readonly"]) ? $context["readonly"] : null), "html", null, true);
            echo ">
                ";
        }
        // line 41
        echo "                
            </div>
            <div class=\"form-group\" data-ng-class=\"{ 'has-danger' : form.fullname.\$invalid && !form.fullname.\$pristine }\">
                <label>Nama Lengkap</label>
                <input data-ng-model=\"edit.fullname\" name=\"fullname\" type=\"text\" class=\"form-control\" required ";
        // line 45
        echo twig_escape_filter($this->env, (isset($context["readonly"]) ? $context["readonly"] : null), "html", null, true);
        echo ">
            </div>
            <div class=\"form-group\">
                <label>Jenis Kelamin</label>
                <select class=\"form-control\" data-ng-model=\"edit.sex\">
                    <option value=\"pria\">Pria</option>
                    <option value=\"wanita\">Wanita</option>
                </select>
            </div>
            <div class=\"form-group\">
                <label>Pekerjaan</label>
                <input data-ng-model=\"edit.job_title\" type=\"text\" class=\"form-control\" ";
        // line 56
        echo twig_escape_filter($this->env, (isset($context["readonly"]) ? $context["readonly"] : null), "html", null, true);
        echo ">
            </div>
            <div class=\"form-group\">
                <label>Keterangan</label>
                <textarea style=\"resize: none;\" data-ng-model=\"edit.bio\" class=\"form-control\" ";
        // line 60
        echo twig_escape_filter($this->env, (isset($context["readonly"]) ? $context["readonly"] : null), "html", null, true);
        echo "></textarea>
            </div>
            <div class=\"clearfix m-b\"></div>
            <h4 class=\"m-a-0 m-b-sm text-md\">Akun Pengguna</h4>
            <hr>
            <div class=\"form-group\" data-ng-class=\"{ 'has-danger' : form.email.\$invalid && !form.email.\$pristine }\">
                <label>Alamat Email</label>
                <input data-ng-model=\"edit.email\" name=\"email\" type=\"email\" class=\"form-control\" required ";
        // line 67
        echo twig_escape_filter($this->env, (isset($context["readonly"]) ? $context["readonly"] : null), "html", null, true);
        echo ">
            </div>
            <div class=\"form-group\">
                <label>Kata Sandi (minimal 8 karakter)</label>
                <input name=\"passwd1\" data-ng-model=\"edit.passwd1\" data-ng-minlength=\"8\" type=\"password\" class=\"form-control\" ";
        // line 71
        echo twig_escape_filter($this->env, (isset($context["readonly"]) ? $context["readonly"] : null), "html", null, true);
        echo ">
            </div>
            <div class=\"form-group\" data-ng-class=\"{ 'has-danger' : form.passwd2.\$invalid && !form.passwd2.\$pristine }\">
                <label>Konfirmasi kata Sandi</label>
                <input name=\"passwd2\" data-ng-model=\"edit.passwd2\" data-ng-minlength=\"8\" data-ui-match=\"form.passwd1\" type=\"password\" class=\"form-control\" ";
        // line 75
        echo twig_escape_filter($this->env, (isset($context["readonly"]) ? $context["readonly"] : null), "html", null, true);
        echo ">
                <span class=\"text-xs text-danger\" data-ng-show=\"form.passwd2.\$error.match\">Kata sandi tidak cocok</span>
            </div>
            <div class=\"form-group\">
                <label class=\"md-check\">
                    <input data-ng-model=\"edit.active\" data-ng-true-value=\"1\" data-ng-false-value=\"0\" type=\"checkbox\">
                    <i class=\"blue\"></i> Pengguna aktif (tidak diblokir)
                </label>
            </div>
            ";
        // line 84
        if ($this->getAttribute((isset($context["can"]) ? $context["can"] : null), "update_user", array())) {
            // line 85
            echo "            <button data-ng-disabled=\"form.\$invalid\" type=\"submit\" class=\"btn btn-info m-t\">Simpan Perubahan</button>
            ";
        }
        // line 87
        echo "        </form>   
        ";
        // line 109
        echo " 
        <div class=\"p-a-md col-md-6\">
            <h4 class=\"m-a-0 m-b-sm text-md\">Info Pengguna</h4>
            <hr>
            <div class=\"form-group\">
                <label>Tanggal Daftar</label>
                <p class=\"form-control-static text-md\">{{ edit.register_date | dateformat:'dd MMM yyyy HH:mm' }}</p>
            </div>
            <div class=\"form-group\">
                <label>Terakhir Login</label>
                <p class=\"form-control-static text-md\">{{ edit.last_login | dateformat:'dd MMM yyyy HH:mm' }}</p>
            </div>
            <div class=\"form-group\">
                <label>Alamat Mesin</label>
                <p class=\"form-control-static text-md\">{{ edit.last_ip }}</p>
            </div>
            <div class=\"clearfix m-b\"></div>
            <h4 class=\"m-a-0 m-b-sm text-md\">Penghapusan</h4>
            <hr>
            <a href=\"javascript:;\" data-ng-click=\"deleteUser()\" class=\"btn btn-danger\">Hapus Pengguna</a>
        </div>
        ";
        echo " 
    </div>    
</div>

";
    }

    public function getTemplateName()
    {
        return "backend-user-edit.html";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  155 => 109,  152 => 87,  148 => 85,  146 => 84,  134 => 75,  127 => 71,  120 => 67,  110 => 60,  103 => 56,  89 => 45,  83 => 41,  77 => 39,  68 => 37,  66 => 33,  64 => 32,  52 => 22,  39 => 20,  37 => 12,  35 => 11,  24 => 9,  21 => 2,  19 => 1,);
    }

    /** @deprecated since 1.27 (to be removed in 2.0). Use getSourceContext() instead */
    public function getSource()
    {
        @trigger_error('The '.__METHOD__.' method is deprecated since version 1.27 and will be removed in 2.0. Use getSourceContext() instead.', E_USER_DEPRECATED);

        return $this->getSourceContext()->getCode();
    }

    public function getSourceContext()
    {
        return new Twig_Source("", "backend-user-edit.html", "D:\\server\\dev\\github\\easyflow\\server\\template\\backend-user-edit.html");
    }
}
