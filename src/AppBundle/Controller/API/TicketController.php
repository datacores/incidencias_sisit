<?php

namespace AppBundle\Controller\API;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;


class TicketController extends Controller
{
    /**
     * @Route("/criticality")
     * @return JsonResponse
     */
    public function getCriticality()
    {
        $conn        = $this->get('database_connection');
        $criticality = $conn->fetchAll('SELECT * FROM sisit.criticidad');
        return new JsonResponse($criticality);
    }

    /**
     * @Route("/impact")
     * @return JsonResponse
     */
    public function getImpact()
    {
        $conn   = $this->get('database_connection');
        $impact = $conn->fetchAll('SELECT * FROM sisit.impacto');
        return new JsonResponse($impact);
    }
}