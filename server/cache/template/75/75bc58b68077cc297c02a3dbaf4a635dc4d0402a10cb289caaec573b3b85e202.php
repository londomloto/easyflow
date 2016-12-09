<?php

/* backend-menu.html */
class __TwigTemplate_457602efd49630520088b135f0be7b0bb51a19c919a9383ba75048922d88f39b extends Twig_Template
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
        echo "<nav class=\"scroll nav-light\">
    <ul class=\"nav\">
        <li class=\"nav-header hidden-folded\"><small class=\"text-muted\">BERANDA</small></li>
        <li>
            <a data-ui-sref=\"main.dashboard\">
                <span class=\"nav-icon\"><i class=\"ion-stats-bars\"></i></span>
                <span class=\"nav-text\">Dashboard</span>
            </a>
        </li>
        <li>
            <a data-ui-sref=\"main.mail.inbox\">
                <span class=\"nav-icon\"><i class=\"ion-android-mail\"></i></span>
                <span class=\"nav-text\">Perpesanan</span>
            </a>
        </li>
        ";
        // line 16
        if ($this->getAttribute((isset($context["can"]) ? $context["can"] : null), "access_app", array())) {
            // line 17
            echo "        <li class=\"nav-header hidden-folded\"><small class=\"text-muted\">PENGATURAN</small></li>
        ";
        }
        // line 19
        echo "        ";
        if ($this->getAttribute((isset($context["can"]) ? $context["can"] : null), "access_app", array())) {
            // line 20
            echo "        <li>
            <a data-ui-sref=\"main.setting\">
                <span class=\"nav-icon\"><i class=\"ion-cube\"></i></span>
                <span class=\"nav-text\">Aplikasi</span>
            </a>
        </li>
        ";
        }
        // line 27
        echo "        ";
        if (($this->getAttribute((isset($context["can"]) ? $context["can"] : null), "access_access", array()) && $this->getAttribute((isset($context["can"]) ? $context["can"] : null), "access_user", array()))) {
            // line 28
            echo "        <li class=\"nav-header hidden-folded\"><small class=\"text-muted\">ADMIN &amp; PENGGUNA</small></li>
        ";
        }
        // line 30
        echo "        ";
        if ($this->getAttribute((isset($context["can"]) ? $context["can"] : null), "access_access", array())) {
            // line 31
            echo "        <li>
            <a data-ui-sref=\"main.access\">
                <span class=\"nav-icon\"><i class=\"ion-locked\"></i></span>
                <span class=\"nav-text\">Hak Akses</span>
            </a>
        </li>
        ";
        }
        // line 38
        echo "        ";
        if ($this->getAttribute((isset($context["can"]) ? $context["can"] : null), "access_user", array())) {
            // line 39
            echo "        <li data-ui-sref-active=\"active\">
            <a data-ui-sref=\"main.user\">
                <span class=\"nav-icon\"><i class=\"ion-android-contact\"></i></span>
                <span class=\"nav-text\">Pengguna</span>
            </a>
        </li>
        ";
        }
        // line 46
        echo "        <li class=\"nav-header hidden-folded\"><small class=\"text-muted\">DIAGRAM</small></li>
        <li data-ui-sref-active=\"active\">
            <a data-ui-sref=\"main.diagram\">
                <span class=\"nav-icon\"><i class=\"ion-erlenmeyer-flask\"></i></span>
                <span class=\"nav-text\">Data Diagram</span>
            </a>
        </li>
        <li>
            <a href=\"dashboard.html\" >
                <span class=\"nav-icon\"><i class=\"ion-android-globe\"></i></span>
                <span class=\"nav-text\">Data Publikasi</span>
            </a>
        </li>
        <li class=\"nav-header hidden-folded\"><small class=\"text-muted\">HALAMAN (BLOG)</small></li>
        <li>
            <a data-ui-sref=\"main.tutorial\" >
                <span class=\"nav-icon\"><i class=\"ion-easel\"></i></span>
                <span class=\"nav-text\">Tutorial</span>
            </a>
        </li>
    </ul>
</nav>";
    }

    public function getTemplateName()
    {
        return "backend-menu.html";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  85 => 46,  76 => 39,  73 => 38,  64 => 31,  61 => 30,  57 => 28,  54 => 27,  45 => 20,  42 => 19,  38 => 17,  36 => 16,  19 => 1,);
    }

    /** @deprecated since 1.27 (to be removed in 2.0). Use getSourceContext() instead */
    public function getSource()
    {
        @trigger_error('The '.__METHOD__.' method is deprecated since version 1.27 and will be removed in 2.0. Use getSourceContext() instead.', E_USER_DEPRECATED);

        return $this->getSourceContext()->getCode();
    }

    public function getSourceContext()
    {
        return new Twig_Source("", "backend-menu.html", "D:\\server\\dev\\github\\easyflow\\server\\template\\backend-menu.html");
    }
}
