<?php

namespace AppBundle\Controller\API;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * Class HardwareController
 * @package AppBundle\Controller\API
 */
class HardwareController extends Controller
{
    /**
     * @Route("/machines")
     * @return JsonResponse
     */
    public function getMachinesAction()
    {
        $conn = $this->get('database_connection');
        $machines = $conn->fetchAll(
            'SELECT ninventario FROM hardware where ninventario is not null and ninventario != ""'
        );
        return new JsonResponse($machines);
    }

    /**
     * @Route("/services")
     * @return JsonResponse
     */
    public function getServicesAction()
    {
        $conn = $this->get('database_connection');
        $services = $conn->fetchAll(
            'SELECT nombre FROM sisit.net_servicios where final = 1 and nombre != "";'
        );
        return new JsonResponse($services);
    }

    /**
     * @Route("/impact")
     * @return JsonResponse
     */
    public function getImpact()
    {
        $conn = $this->get('database_connection');
        $impact = $conn->fetchAll(
            'SELECT * FROM sisit.impacto'
        );
        return new JsonResponse($impact);
    }
}