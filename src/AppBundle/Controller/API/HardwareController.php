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
        $conn   = $this->get('database_connection');
        $machines = $conn->fetchAll(
            'SELECT ninventario FROM hardware where ninventario is not null and ninventario != ""'
        );
        return new JsonResponse($machines);
    }

    /**
     * @Route("/machines/{id}")
     * @return JsonResponse
     */
    public function getMachineInfoAction($id)
    {
        $conn   = $this->get('database_connection');
        $machines = $conn->fetchAll('SELECT * FROM a08_iteminformatico where codigo_item = '.$id);
        return new JsonResponse($machines);
    }
}