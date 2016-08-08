<?php

/* @Twig/Exception/exception_full.html.twig */
class __TwigTemplate_f02e303370a49bc3146db14fda58d39f1c60e60e6705343a8cc78683a1b8edf6 extends Twig_Template
{
    public function __construct(Twig_Environment $env)
    {
        parent::__construct($env);

        // line 1
        $this->parent = $this->loadTemplate("@Twig/layout.html.twig", "@Twig/Exception/exception_full.html.twig", 1);
        $this->blocks = array(
            'head' => array($this, 'block_head'),
            'title' => array($this, 'block_title'),
            'body' => array($this, 'block_body'),
        );
    }

    protected function doGetParent(array $context)
    {
        return "@Twig/layout.html.twig";
    }

    protected function doDisplay(array $context, array $blocks = array())
    {
        $__internal_9691bbae440fac517293975c9d6bd0146ce5d3d68ea80848b4be6581d6a388d9 = $this->env->getExtension("native_profiler");
        $__internal_9691bbae440fac517293975c9d6bd0146ce5d3d68ea80848b4be6581d6a388d9->enter($__internal_9691bbae440fac517293975c9d6bd0146ce5d3d68ea80848b4be6581d6a388d9_prof = new Twig_Profiler_Profile($this->getTemplateName(), "template", "@Twig/Exception/exception_full.html.twig"));

        $this->parent->display($context, array_merge($this->blocks, $blocks));
        
        $__internal_9691bbae440fac517293975c9d6bd0146ce5d3d68ea80848b4be6581d6a388d9->leave($__internal_9691bbae440fac517293975c9d6bd0146ce5d3d68ea80848b4be6581d6a388d9_prof);

    }

    // line 3
    public function block_head($context, array $blocks = array())
    {
        $__internal_035d9cfe8e6ca23e3ce7de24216c9422c43219867a7e32c29db2e3c8af5f3874 = $this->env->getExtension("native_profiler");
        $__internal_035d9cfe8e6ca23e3ce7de24216c9422c43219867a7e32c29db2e3c8af5f3874->enter($__internal_035d9cfe8e6ca23e3ce7de24216c9422c43219867a7e32c29db2e3c8af5f3874_prof = new Twig_Profiler_Profile($this->getTemplateName(), "block", "head"));

        // line 4
        echo "    <link href=\"";
        echo twig_escape_filter($this->env, $this->env->getExtension('request')->generateAbsoluteUrl($this->env->getExtension('asset')->getAssetUrl("bundles/framework/css/exception.css")), "html", null, true);
        echo "\" rel=\"stylesheet\" type=\"text/css\" media=\"all\" />
";
        
        $__internal_035d9cfe8e6ca23e3ce7de24216c9422c43219867a7e32c29db2e3c8af5f3874->leave($__internal_035d9cfe8e6ca23e3ce7de24216c9422c43219867a7e32c29db2e3c8af5f3874_prof);

    }

    // line 7
    public function block_title($context, array $blocks = array())
    {
        $__internal_1b93daab0048b5ce3880472860c02020b3e202e5b5e3559d71b33aa036b5173f = $this->env->getExtension("native_profiler");
        $__internal_1b93daab0048b5ce3880472860c02020b3e202e5b5e3559d71b33aa036b5173f->enter($__internal_1b93daab0048b5ce3880472860c02020b3e202e5b5e3559d71b33aa036b5173f_prof = new Twig_Profiler_Profile($this->getTemplateName(), "block", "title"));

        // line 8
        echo "    ";
        echo twig_escape_filter($this->env, $this->getAttribute((isset($context["exception"]) ? $context["exception"] : $this->getContext($context, "exception")), "message", array()), "html", null, true);
        echo " (";
        echo twig_escape_filter($this->env, (isset($context["status_code"]) ? $context["status_code"] : $this->getContext($context, "status_code")), "html", null, true);
        echo " ";
        echo twig_escape_filter($this->env, (isset($context["status_text"]) ? $context["status_text"] : $this->getContext($context, "status_text")), "html", null, true);
        echo ")
";
        
        $__internal_1b93daab0048b5ce3880472860c02020b3e202e5b5e3559d71b33aa036b5173f->leave($__internal_1b93daab0048b5ce3880472860c02020b3e202e5b5e3559d71b33aa036b5173f_prof);

    }

    // line 11
    public function block_body($context, array $blocks = array())
    {
        $__internal_f263dcf36b2cca94fe9f5966c25877fd378260f60455cd5b8c6caa4f169df998 = $this->env->getExtension("native_profiler");
        $__internal_f263dcf36b2cca94fe9f5966c25877fd378260f60455cd5b8c6caa4f169df998->enter($__internal_f263dcf36b2cca94fe9f5966c25877fd378260f60455cd5b8c6caa4f169df998_prof = new Twig_Profiler_Profile($this->getTemplateName(), "block", "body"));

        // line 12
        echo "    ";
        $this->loadTemplate("@Twig/Exception/exception.html.twig", "@Twig/Exception/exception_full.html.twig", 12)->display($context);
        
        $__internal_f263dcf36b2cca94fe9f5966c25877fd378260f60455cd5b8c6caa4f169df998->leave($__internal_f263dcf36b2cca94fe9f5966c25877fd378260f60455cd5b8c6caa4f169df998_prof);

    }

    public function getTemplateName()
    {
        return "@Twig/Exception/exception_full.html.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  78 => 12,  72 => 11,  58 => 8,  52 => 7,  42 => 4,  36 => 3,  11 => 1,);
    }
}
/* {% extends '@Twig/layout.html.twig' %}*/
/* */
/* {% block head %}*/
/*     <link href="{{ absolute_url(asset('bundles/framework/css/exception.css')) }}" rel="stylesheet" type="text/css" media="all" />*/
/* {% endblock %}*/
/* */
/* {% block title %}*/
/*     {{ exception.message }} ({{ status_code }} {{ status_text }})*/
/* {% endblock %}*/
/* */
/* {% block body %}*/
/*     {% include '@Twig/Exception/exception.html.twig' %}*/
/* {% endblock %}*/
/* */
