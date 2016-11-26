<?php

/* i18n.html */
class __TwigTemplate_5ec58d003c942d707ab395632d9c1eb2cef936785c22772e218fd44d7b26eccb extends Twig_Template
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
        echo "<div>
    <p>";
        // line 2
        echo gettext("Hello world");
        echo "</p>
</div>";
    }

    public function getTemplateName()
    {
        return "i18n.html";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  22 => 2,  19 => 1,);
    }

    /** @deprecated since 1.27 (to be removed in 2.0). Use getSourceContext() instead */
    public function getSource()
    {
        @trigger_error('The '.__METHOD__.' method is deprecated since version 1.27 and will be removed in 2.0. Use getSourceContext() instead.', E_USER_DEPRECATED);

        return $this->getSourceContext()->getCode();
    }

    public function getSourceContext()
    {
        return new Twig_Source("", "i18n.html", "/var/www/dev/github/easyflow/server/template/i18n.html");
    }
}
