<?php

namespace AppBundle\Controller\API;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * Class HardwareController
 * @package AppBundle\Controller\API
 */
class UserController extends Controller
{
    /**
     * @Route("/services")
     * @return JsonResponse
     */
    public function getServicesAction()
    {
        $conn = $this->get('database_connection');
        $services = $conn->fetchAll(
            'SELECT nombre FROM sisit.net_servicios where final = 1 and nombre != "" ORDER BY nombre;'
        );
        return new JsonResponse($services);
    }
}