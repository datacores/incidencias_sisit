<?php

/* @WebProfiler/Collector/router.html.twig */
class __TwigTemplate_91a69137ae6569f3f7de1dcbddfad3af0aa0b215c255a7dd215f61beeb52908b extends Twig_Template
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
        $__internal_8e63668e9eb029cbe9f4fc5767651b6aca3326393c5fc4fa2bf281e4cab85c14 = $this->env->getExtension("native_profiler");
        $__internal_8e63668e9eb029cbe9f4fc5767651b6aca3326393c5fc4fa2bf281e4cab85c14->enter($__internal_8e63668e9eb029cbe9f4fc5767651b6aca3326393c5fc4fa2bf281e4cab85c14_prof = new Twig_Profiler_Profile($this->getTemplateName(), "template", "@WebProfiler/Collector/router.html.twig"));

        $this->parent->display($context, array_merge($this->blocks, $blocks));
        
        $__internal_8e63668e9eb029cbe9f4fc5767651b6aca3326393c5fc4fa2bf281e4cab85c14->leave($__internal_8e63668e9eb029cbe9f4fc5767651b6aca3326393c5fc4fa2bf281e4cab85c14_prof);

    }

    // line 3
    public function block_toolbar($context, array $blocks = array())
    {
        $__internal_280691054a3985e0e679b0eed5d2a59a71886e893a39167d13e6fcbcc5335f19 = $this->env->getExtension("native_profiler");
        $__internal_280691054a3985e0e679b0eed5d2a59a71886e893a39167d13e6fcbcc5335f19->enter($__internal_280691054a3985e0e679b0eed5d2a59a71886e893a39167d13e6fcbcc5335f19_prof = new Twig_Profiler_Profile($this->getTemplateName(), "block", "toolbar"));

        
        $__internal_280691054a3985e0e679b0eed5d2a59a71886e893a39167d13e6fcbcc5335f19->leave($__internal_280691054a3985e0e679b0eed5d2a59a71886e893a39167d13e6fcbcc5335f19_prof);

    }

    // line 5
    public function block_menu($context, array $blocks = array())
    {
        $__internal_bc8e25a0dbf3d0657844cee73752f2f8e74a731a5aa7d60a321fb680a1b79286 = $this->env->getExtension("native_profiler");
        $__internal_bc8e25a0dbf3d0657844cee73752f2f8e74a731a5aa7d60a321fb680a1b79286->enter($__internal_bc8e25a0dbf3d0657844cee73752f2f8e74a731a5aa7d60a321fb680a1b79286_prof = new Twig_Profiler_Profile($this->getTemplateName(), "block", "menu"));

        // line 6
        echo "<span class=\"label\">
    <span class=\"icon\">";
        // line 7
        echo twig_include($this->env, $context, "@WebProfiler/Icon/router.svg");
        echo "</span>
    <strong>Routing</strong>
</span>
";
        
        $__internal_bc8e25a0dbf3d0657844cee73752f2f8e74a731a5aa7d60a321fb680a1b79286->leave($__internal_bc8e25a0dbf3d0657844cee73752f2f8e74a731a5aa7d60a321fb680a1b79286_prof);

    }

    // line 12
    public function block_panel($context, array $blocks = array())
    {
        $__internal_bd74a96beb4c65575aa172741704ef9f300132fe509c9885f88d3d6fe8a53ac8 = $this->env->getExtension("native_profiler");
        $__internal_bd74a96beb4c65575aa172741704ef9f300132fe509c9885f88d3d6fe8a53ac8->enter($__internal_bd74a96beb4c65575aa172741704ef9f300132fe509c9885f88d3d6fe8a53ac8_prof = new Twig_Profiler_Profile($this->getTemplateName(), "block", "panel"));

        // line 13
        echo "    ";
        echo $this->env->getExtension('http_kernel')->renderFragment($this->env->getExtension('routing')->getPath("_profiler_router", array("token" => (isset($context["token"]) ? $context["token"] : $this->getContext($context, "token")))));
        echo "
";
        
        $__internal_bd74a96beb4c65575aa172741704ef9f300132fe509c9885f88d3d6fe8a53ac8->leave($__internal_bd74a96beb4c65575aa172741704ef9f300132fe509c9885f88d3d6fe8a53ac8_prof);

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
