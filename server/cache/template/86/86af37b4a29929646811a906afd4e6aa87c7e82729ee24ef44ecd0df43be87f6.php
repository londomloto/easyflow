<?php

/* authentication.html */
class __TwigTemplate_db8d55c2b6a00ff4282afe0b4b3a7b8408526c0aa89654080845e102a887e566 extends Twig_Template
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
        echo "<!DOCTYPE html>
<html>
<head>
    <title>Authentication</title>
    <style>
        * {
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
        }
        label {
            display: block;
        }
    </style>
</head>
<body>
    <form action=\"";
        // line 19
        echo twig_escape_filter($this->env, (isset($context["form_action"]) ? $context["form_action"] : null), "html", null, true);
        echo "\" method=\"POST\">
        <div class=\"form-group\">
            <label>Email address</label>
            <input type=\"email\" name=\"email\" class=\"form-control\">
        </div>
        <div class=\"form-group\">
            <label>Password</label>
            <input type=\"password\" name=\"passwd\" class=\"form-control\">
        </div>
        <button type=\"submit\">Submit</button>
    </form>
</body>
</html>";
    }

    public function getTemplateName()
    {
        return "authentication.html";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  39 => 19,  19 => 1,);
    }

    /** @deprecated since 1.27 (to be removed in 2.0). Use getSourceContext() instead */
    public function getSource()
    {
        @trigger_error('The '.__METHOD__.' method is deprecated since version 1.27 and will be removed in 2.0. Use getSourceContext() instead.', E_USER_DEPRECATED);

        return $this->getSourceContext()->getCode();
    }

    public function getSourceContext()
    {
        return new Twig_Source("", "authentication.html", "/var/www/dev/github/easyflow/server/template/authentication.html");
    }
}
