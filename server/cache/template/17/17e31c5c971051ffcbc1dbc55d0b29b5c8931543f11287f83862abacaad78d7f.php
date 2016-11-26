<?php

/* email_recover_password.html */
class __TwigTemplate_3eee3ac53c76c1d78c4eb04115ebdce3c0f14c7e19cba159c91f4d76bb7e3b7c extends Twig_Template
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
        echo "<table width=\"100%\" bgcolor=\"#F3F5F7\" cellpadding=\"0\" cellspacing=\"0\">
    <tr>
        <td align=\"center\" style=\"font-family: Helvetica, Arial, sans-serif; color: #B8BFC5; padding: 15px; font-size: 17px;\">
            <p style=\"font-weight: bold; margin: 0\">";
        // line 4
        echo twig_escape_filter($this->env, $this->getAttribute((isset($context["site"]) ? $context["site"] : null), "name", array()), "html", null, true);
        echo "</p>
        </td>
    </tr>
</table>

<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\">
    <tr>
        <td style=\"font-family: Helvetica, Arial, sans-serif; font-size: 17px; padding: 15px 20%;\">
            <h2 style=\"color:#2ABBA8;line-height:30px;margin-bottom:12px;margin:0 0 12px; font-size: 20px;\">
                Halo, ";
        // line 13
        echo twig_escape_filter($this->env, $this->getAttribute((isset($context["user"]) ? $context["user"] : null), "fullname", array()), "html", null, true);
        echo "
            </h2>
            <p>
                Pembaharuan sandi telah berhasil digunakan. Silahkan login dengan sandi baru Anda.
            </p>
            <p>
                Sandi baru Anda adalah: <strong style=\"color: orange;\">";
        // line 19
        echo twig_escape_filter($this->env, $this->getAttribute((isset($context["user"]) ? $context["user"] : null), "passwd_real", array()), "html", null, true);
        echo "</strong>.<br>
                Pastikan sandi Anda tetap aman.
            </p>
            <p>
                Terima kasih.
            </p>
        </td>
    </tr>
</table>

<table width=\"100%\" bgcolor=\"#F3F5F7\" cellpadding=\"0\" cellspacing=\"0\">
    <tr>
        <td align=\"center\" style=\"font-family: Helvetica, Arial, sans-serif; color: #B8BFC5; padding: 15px; font-size: 17px;\">
            <span style=\"-webkit-transform: rotate(180deg); transform: rotate(180deg); display: inline-block;\">&copy;</span> ";
        // line 32
        echo twig_escape_filter($this->env, twig_date_format_filter($this->env, "now", "Y"), "html", null, true);
        echo " - <a href=\"";
        echo twig_escape_filter($this->env, $this->getAttribute((isset($context["site"]) ? $context["site"] : null), "url", array()), "html", null, true);
        echo "\">";
        echo twig_escape_filter($this->env, $this->getAttribute((isset($context["site"]) ? $context["site"] : null), "name", array()), "html", null, true);
        echo "</a>. All wrongs reserved.
            <br>
            <br>
            <p style=\"font-weight: bold; margin: 0\">";
        // line 35
        echo twig_escape_filter($this->env, $this->getAttribute((isset($context["site"]) ? $context["site"] : null), "company_name", array()), "html", null, true);
        echo "</p>
            ";
        // line 36
        echo twig_escape_filter($this->env, $this->getAttribute((isset($context["site"]) ? $context["site"] : null), "company_address", array()), "html", null, true);
        echo "<br>
            ";
        // line 37
        echo twig_escape_filter($this->env, $this->getAttribute((isset($context["site"]) ? $context["site"] : null), "company_city", array()), "html", null, true);
        echo ", ";
        echo twig_escape_filter($this->env, $this->getAttribute((isset($context["site"]) ? $context["site"] : null), "company_state", array()), "html", null, true);
        echo "<br>
            ";
        // line 38
        echo twig_escape_filter($this->env, $this->getAttribute((isset($context["site"]) ? $context["site"] : null), "company_country", array()), "html", null, true);
        echo "
        </td>
    </tr>
</table>";
    }

    public function getTemplateName()
    {
        return "email_recover_password.html";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  85 => 38,  79 => 37,  75 => 36,  71 => 35,  61 => 32,  45 => 19,  36 => 13,  24 => 4,  19 => 1,);
    }

    /** @deprecated since 1.27 (to be removed in 2.0). Use getSourceContext() instead */
    public function getSource()
    {
        @trigger_error('The '.__METHOD__.' method is deprecated since version 1.27 and will be removed in 2.0. Use getSourceContext() instead.', E_USER_DEPRECATED);

        return $this->getSourceContext()->getCode();
    }

    public function getSourceContext()
    {
        return new Twig_Source("", "email_recover_password.html", "/var/www/dev/github/easyflow/server/template/email_recover_password.html");
    }
}
