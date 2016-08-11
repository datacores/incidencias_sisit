<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;


class DefaultController extends Controller
{
    private $local = false; // false por defecto
    private $id_app = 0;
    private $id_op  = 0;

    /**
     * @Route("/", name="homepage")
     */
    public function indexAction(Request $request)
    {
        $response = new Response();
        $response
            ->setContent(file_get_contents(__DIR__.'/../Resources/views/Default/index.html'));

        $auth_ok = $this->get('check.authorization')
            ->checkAuth($request, $this->id_app, $this->id_op);

        if($auth_ok)
            return $response;
        else
            return $this->get('slogin.authz')->login();
    }
}
