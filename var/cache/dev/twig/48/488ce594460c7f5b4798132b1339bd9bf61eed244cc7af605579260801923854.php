<?php

/* @Twig/Exception/exception_full.html.twig */
class __TwigTemplate_9c5d35f2dbde3394b57674d22903e99f5b80b6a7d8cc53caa9c1fb152bc75b44 extends Twig_Template
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
        $__internal_07768887dc5ff520d6e391830e0ad0f651faf007d7fc26559f261e9178b38df1 = $this->env->getExtension("native_profiler");
        $__internal_07768887dc5ff520d6e391830e0ad0f651faf007d7fc26559f261e9178b38df1->enter($__internal_07768887dc5ff520d6e391830e0ad0f651faf007d7fc26559f261e9178b38df1_prof = new Twig_Profiler_Profile($this->getTemplateName(), "template", "@Twig/Exception/exception_full.html.twig"));

        $this->parent->display($context, array_merge($this->blocks, $blocks));
        
        $__internal_07768887dc5ff520d6e391830e0ad0f651faf007d7fc26559f261e9178b38df1->leave($__internal_07768887dc5ff520d6e391830e0ad0f651faf007d7fc26559f261e9178b38df1_prof);

    }

    // line 3
    public function block_head($context, array $blocks = array())
    {
        $__internal_79fcbe45419ad4e24d7a868cb5bb73941c6ebaf6eb674bc1ac4211d0761712cb = $this->env->getExtension("native_profiler");
        $__internal_79fcbe45419ad4e24d7a868cb5bb73941c6ebaf6eb674bc1ac4211d0761712cb->enter($__internal_79fcbe45419ad4e24d7a868cb5bb73941c6ebaf6eb674bc1ac4211d0761712cb_prof = new Twig_Profiler_Profile($this->getTemplateName(), "block", "head"));

        // line 4
        echo "    <link href=\"";
        echo twig_escape_filter($this->env, $this->env->getExtension('request')->generateAbsoluteUrl($this->env->getExtension('asset')->getAssetUrl("bundles/framework/css/exception.css")), "html", null, true);
        echo "\" rel=\"stylesheet\" type=\"text/css\" media=\"all\" />
";
        
        $__internal_79fcbe45419ad4e24d7a868cb5bb73941c6ebaf6eb674bc1ac4211d0761712cb->leave($__internal_79fcbe45419ad4e24d7a868cb5bb73941c6ebaf6eb674bc1ac4211d0761712cb_prof);

    }

    // line 7
    public function block_title($context, array $blocks = array())
    {
        $__internal_9b50d7e0bcabd903ee495d3379387502cbf6aa82dc0bfa68061ba777eaa4e970 = $this->env->getExtension("native_profiler");
        $__internal_9b50d7e0bcabd903ee495d3379387502cbf6aa82dc0bfa68061ba777eaa4e970->enter($__internal_9b50d7e0bcabd903ee495d3379387502cbf6aa82dc0bfa68061ba777eaa4e970_prof = new Twig_Profiler_Profile($this->getTemplateName(), "block", "title"));

        // line 8
        echo "    ";
        echo twig_escape_filter($this->env, $this->getAttribute((isset($context["exception"]) ? $context["exception"] : $this->getContext($context, "exception")), "message", array()), "html", null, true);
        echo " (";
        echo twig_escape_filter($this->env, (isset($context["status_code"]) ? $context["status_code"] : $this->getContext($context, "status_code")), "html", null, true);
        echo " ";
        echo twig_escape_filter($this->env, (isset($context["status_text"]) ? $context["status_text"] : $this->getContext($context, "status_text")), "html", null, true);
        echo ")
";
        
        $__internal_9b50d7e0bcabd903ee495d3379387502cbf6aa82dc0bfa68061ba777eaa4e970->leave($__internal_9b50d7e0bcabd903ee495d3379387502cbf6aa82dc0bfa68061ba777eaa4e970_prof);

    }

    // line 11
    public function block_body($context, array $blocks = array())
    {
        $__internal_1df6155a4715f191dd054203368fa640735d3dc59fbec548fcb8f784fe0ed79a = $this->env->getExtension("native_profiler");
        $__internal_1df6155a4715f191dd054203368fa640735d3dc59fbec548fcb8f784fe0ed79a->enter($__internal_1df6155a4715f191dd054203368fa640735d3dc59fbec548fcb8f784fe0ed79a_prof = new Twig_Profiler_Profile($this->getTemplateName(), "block", "body"));

        // line 12
        echo "    ";
        $this->loadTemplate("@Twig/Exception/exception.html.twig", "@Twig/Exception/exception_full.html.twig", 12)->display($context);
        
        $__internal_1df6155a4715f191dd054203368fa640735d3dc59fbec548fcb8f784fe0ed79a->leave($__internal_1df6155a4715f191dd054203368fa640735d3dc59fbec548fcb8f784fe0ed79a_prof);

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
