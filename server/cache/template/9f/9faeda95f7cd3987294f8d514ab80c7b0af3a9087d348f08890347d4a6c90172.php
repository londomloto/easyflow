<?php

/* email_account_created.html */
class __TwigTemplate_8afd6bfa5e5a59997ac8aeaea99d9e966ba5e6fa7ad7bb5e5ea0a9de6c4fd74d extends Twig_Template
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
                Selamat datang di <strong>";
        // line 17
        echo twig_escape_filter($this->env, $this->getAttribute((isset($context["site"]) ? $context["site"] : null), "name", array()), "html", null, true);
        echo "</strong>. Sekarang, Anda dapat login ke dalam akun Anda di: <a href=\"";
        echo twig_escape_filter($this->env, $this->getAttribute((isset($context["site"]) ? $context["site"] : null), "url", array()), "html", null, true);
        echo "\">";
        echo twig_escape_filter($this->env, $this->getAttribute((isset($context["site"]) ? $context["site"] : null), "url", array()), "html", null, true);
        echo "</a>.
            </p>
            <p>
                Berikut ini adalah informasi tentang akun Anda:
            </p>
            <table cellpadding=\"0\" cellspacing=\"0\">
                <tr>
                    <td width=\"100\">Email:</td><td><strong>";
        // line 24
        echo twig_escape_filter($this->env, $this->getAttribute((isset($context["user"]) ? $context["user"] : null), "email", array()), "html", null, true);
        echo "</strong></td>
                </tr>
                <tr>
                    <td>Kata sandi:</td><td><strong>";
        // line 27
        echo twig_escape_filter($this->env, $this->getAttribute((isset($context["user"]) ? $context["user"] : null), "passwd_real", array()), "html", null, true);
        echo "</strong></td>
                </tr>
            </table>
            <p>
                Selamat menggunakan aplikasi kami.
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
        // line 43
        echo twig_escape_filter($this->env, twig_date_format_filter($this->env, "now", "Y"), "html", null, true);
        echo " - <a href=\"";
        echo twig_escape_filter($this->env, $this->getAttribute((isset($context["site"]) ? $context["site"] : null), "url", array()), "html", null, true);
        echo "\">";
        echo twig_escape_filter($this->env, $this->getAttribute((isset($context["site"]) ? $context["site"] : null), "name", array()), "html", null, true);
        echo "</a>. All wrongs reserved.
            <br>
            <br>
            <p style=\"font-weight: bold; margin: 0\">";
        // line 46
        echo twig_escape_filter($this->env, $this->getAttribute((isset($context["site"]) ? $context["site"] : null), "company_name", array()), "html", null, true);
        echo "</p>
            ";
        // line 47
        echo twig_escape_filter($this->env, $this->getAttribute((isset($context["site"]) ? $context["site"] : null), "company_address", array()), "html", null, true);
        echo "<br>
            ";
        // line 48
        echo twig_escape_filter($this->env, $this->getAttribute((isset($context["site"]) ? $context["site"] : null), "company_city", array()), "html", null, true);
        echo ", ";
        echo twig_escape_filter($this->env, $this->getAttribute((isset($context["site"]) ? $context["site"] : null), "company_state", array()), "html", null, true);
        echo "<br>
            ";
        // line 49
        echo twig_escape_filter($this->env, $this->getAttribute((isset($context["site"]) ? $context["site"] : null), "company_country", array()), "html", null, true);
        echo "
        </td>
    </tr>
</table>";
    }

    public function getTemplateName()
    {
        return "email_account_created.html";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  106 => 49,  100 => 48,  96 => 47,  92 => 46,  82 => 43,  63 => 27,  57 => 24,  43 => 17,  36 => 13,  24 => 4,  19 => 1,);
    }

    /** @deprecated since 1.27 (to be removed in 2.0). Use getSourceContext() instead */
    public function getSource()
    {
        @trigger_error('The '.__METHOD__.' method is deprecated since version 1.27 and will be removed in 2.0. Use getSourceContext() instead.', E_USER_DEPRECATED);

        return $this->getSourceContext()->getCode();
    }

    public function getSourceContext()
    {
        return new Twig_Source("", "email_account_created.html", "/var/www/dev/github/easyflow/server/template/email_account_created.html");
    }
}
