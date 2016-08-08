<?php

/* @WebProfiler/Collector/router.html.twig */
class __TwigTemplate_4ef51b2b240efe3479ec2a7220b4fa28da79bca9fd9e3ab51035c26002dccd24 extends Twig_Template
{
    public function __construct(Twig_Environment $env)
    {
        parent::__construct($env);

        // line 1
        $this->parent = $this->loadTemplate("@WebProfiler/Profiler/layout.html.twig", "@WebProfiler/Collector/router.html.twig", 1);
        $this->blocks = array(
            'toolbar' => array($this, 'block_toolbar'),
            'menu' => array($this, 'block_menu'),
            'panel' => array($this, 'block_panel'),
        );
    }

    protected function doGetParent(array $context)
    {
        return "@WebProfiler/Profiler/layout.html.twig";
    }

    protected function doDisplay(array $context, array $blocks = array())
    {
        $__internal_50b88e24f47e765f121b6322774f0471bc8b1d272bd6a799a41ee95f0d5fec21 = $this->env->getExtension("native_profiler");
        $__internal_50b88e24f47e765f121b6322774f0471bc8b1d272bd6a799a41ee95f0d5fec21->enter($__internal_50b88e24f47e765f121b6322774f0471bc8b1d272bd6a799a41ee95f0d5fec21_prof = new Twig_Profiler_Profile($this->getTemplateName(), "template", "@WebProfiler/Collector/router.html.twig"));

        $this->parent->display($context, array_merge($this->blocks, $blocks));
        
        $__internal_50b88e24f47e765f121b6322774f0471bc8b1d272bd6a799a41ee95f0d5fec21->leave($__internal_50b88e24f47e765f121b6322774f0471bc8b1d272bd6a799a41ee95f0d5fec21_prof);

    }

    // line 3
    public function block_toolbar($context, array $blocks = array())
    {
        $__internal_ab57514532dc67877d2df403ae6def616a71819ad79b34b12dcf8aa209f1d64a = $this->env->getExtension("native_profiler");
        $__internal_ab57514532dc67877d2df403ae6def616a71819ad79b34b12dcf8aa209f1d64a->enter($__internal_ab57514532dc67877d2df403ae6def616a71819ad79b34b12dcf8aa209f1d64a_prof = new Twig_Profiler_Profile($this->getTemplateName(), "block", "toolbar"));

        
        $__internal_ab57514532dc67877d2df403ae6def616a71819ad79b34b12dcf8aa209f1d64a->leave($__internal_ab57514532dc67877d2df403ae6def616a71819ad79b34b12dcf8aa209f1d64a_prof);

    }

    // line 5
    public function block_menu($context, array $blocks = array())
    {
        $__internal_b314f3133d576807eeff7b9009d5419a007d5929d175b5f145a39ac245a79b5c = $this->env->getExtension("native_profiler");
        $__internal_b314f3133d576807eeff7b9009d5419a007d5929d175b5f145a39ac245a79b5c->enter($__internal_b314f3133d576807eeff7b9009d5419a007d5929d175b5f145a39ac245a79b5c_prof = new Twig_Profiler_Profile($this->getTemplateName(), "block", "menu"));

        // line 6
        echo "<span class=\"label\">
    <span class=\"icon\">";
        // line 7
        echo twig_include($this->env, $context, "@WebProfiler/Icon/router.svg");
        echo "</span>
    <strong>Routing</strong>
</span>
";
        
        $__internal_b314f3133d576807eeff7b9009d5419a007d5929d175b5f145a39ac245a79b5c->leave($__internal_b314f3133d576807eeff7b9009d5419a007d5929d175b5f145a39ac245a79b5c_prof);

    }

    // line 12
    public function block_panel($context, array $blocks = array())
    {
        $__internal_6f82fc0f20aec236e64e4d78df74dade201f84243e28d5c73b7ac974770a6c0e = $this->env->getExtension("native_profiler");
        $__internal_6f82fc0f20aec236e64e4d78df74dade201f84243e28d5c73b7ac974770a6c0e->enter($__internal_6f82fc0f20aec236e64e4d78df74dade201f84243e28d5c73b7ac974770a6c0e_prof = new Twig_Profiler_Profile($this->getTemplateName(), "block", "panel"));

        // line 13
        echo "    ";
        echo $this->env->getExtension('http_kernel')->renderFragment($this->env->getExtension('routing')->getPath("_profiler_router", array("token" => (isset($context["token"]) ? $context["token"] : $this->getContext($context, "token")))));
        echo "
";
        
        $__internal_6f82fc0f20aec236e64e4d78df74dade201f84243e28d5c73b7ac974770a6c0e->leave($__internal_6f82fc0f20aec236e64e4d78df74dade201f84243e28d5c73b7ac974770a6c0e_prof);

    }

    public function getTemplateName()
    {
        return "@WebProfiler/Collector/router.html.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  73 => 13,  67 => 12,  56 => 7,  53 => 6,  47 => 5,  36 => 3,  11 => 1,);
    }
}
/* {% extends '@WebProfiler/Profiler/layout.html.twig' %}*/
/* */
/* {% block toolbar %}{% endblock %}*/
/* */
/* {% block menu %}*/
/* <span class="label">*/
/*     <span class="icon">{{ include('@WebProfiler/Icon/router.svg') }}</span>*/
/*     <strong>Routing</strong>*/
/* </span>*/
/* {% endblock %}*/
/* */
/* {% block panel %}*/
/*     {{ render(path('_profiler_router', { token: token })) }}*/
/* {% endblock %}*/
/* */
