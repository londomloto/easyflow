<?php

/* email_request_password.html */
class __TwigTemplate_2834f5245db94b137b0b319b9877326230947d963b33d311128c886675ab7da6 extends Twig_Template
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

<table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">
    <tr>
        <td style=\"font-family: Helvetica, Arial, sans-serif; font-size: 17px; padding: 15px 20%;\">
            <h2 style=\"color:#2ABBA8; line-height:30px; margin-bottom:12px; margin:0 0 12px; font-size: 20px;\">
                Halo, ";
        // line 13
        echo twig_escape_filter($this->env, $this->getAttribute((isset($context["user"]) ? $context["user"] : null), "fullname", array()), "html", null, true);
        echo "
            </h2>
            <p>
            Seseorang telah melakukan permintaan pembaharuan sandi kepada kami.
            Jika itu adalah Anda sendiri, silahkan klik tautan di bawah ini untuk melakukan pembaharuan sandi.
            </p>
            <table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"margin-top: 40px; margin-bottom: 40px;\">
                <tr>
                    <td align=\"center\">
                        <table>
                            <tr>
                                <td bgcolor=\"#2ABBA8\" align=\"center\" style=\"padding: 12px 18px 12px 18px; -webkit-border-radius:3px; border-radius:3px;\">
                                    <a href=\"";
        // line 25
        echo twig_escape_filter($this->env, (isset($context["link"]) ? $context["link"] : null), "html", null, true);
        echo "\" target=\"_blank\" style=\"font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: #ffffff;text-decoration: none;display: inline-block; font-weight: bold;\">
                                        Pembaharuan Sandi &rarr;
                                    </a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
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
        // line 44
        echo twig_escape_filter($this->env, twig_date_format_filter($this->env, "now", "Y"), "html", null, true);
        echo " - <a href=\"";
        echo twig_escape_filter($this->env, $this->getAttribute((isset($context["site"]) ? $context["site"] : null), "url", array()), "html", null, true);
        echo "\">";
        echo twig_escape_filter($this->env, $this->getAttribute((isset($context["site"]) ? $context["site"] : null), "name", array()), "html", null, true);
        echo "</a>. All wrongs reserved.
            <br>
            <br>
            <p style=\"font-weight: bold; margin: 0\">";
        // line 47
        echo twig_escape_filter($this->env, $this->getAttribute((isset($context["site"]) ? $context["site"] : null), "company_name", array()), "html", null, true);
        echo "</p>
            ";
        // line 48
        echo twig_escape_filter($this->env, $this->getAttribute((isset($context["site"]) ? $context["site"] : null), "company_address", array()), "html", null, true);
        echo "<br>
            ";
        // line 49
        echo twig_escape_filter($this->env, $this->getAttribute((isset($context["site"]) ? $context["site"] : null), "company_city", array()), "html", null, true);
        echo ", ";
        echo twig_escape_filter($this->env, $this->getAttribute((isset($context["site"]) ? $context["site"] : null), "company_state", array()), "html", null, true);
        echo "<br>
            ";
        // line 50
        echo twig_escape_filter($this->env, $this->getAttribute((isset($context["site"]) ? $context["site"] : null), "company_country", array()), "html", null, true);
        echo "
        </td>
    </tr>
</table>";
    }

    public function getTemplateName()
    {
        return "email_request_password.html";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  97 => 50,  91 => 49,  87 => 48,  83 => 47,  73 => 44,  51 => 25,  36 => 13,  24 => 4,  19 => 1,);
    }

    /** @deprecated since 1.27 (to be removed in 2.0). Use getSourceContext() instead */
    public function getSource()
    {
        @trigger_error('The '.__METHOD__.' method is deprecated since version 1.27 and will be removed in 2.0. Use getSourceContext() instead.', E_USER_DEPRECATED);

        return $this->getSourceContext()->getCode();
    }

    public function getSourceContext()
    {
        return new Twig_Source("", "email_request_password.html", "/var/www/dev/github/easyflow/server/template/email_request_password.html");
    }
}
