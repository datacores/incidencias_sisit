<?php

namespace AppBundle\Controller\API;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

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
        $conn   = $this->get('database_connection');
        $services = $conn->fetchAll(
            'SELECT nombre, texto_solicitud FROM sisit.net_servicios where final = 1 and nombre != "" ORDER BY nombre;'
        );
        return new JsonResponse($services);
    }

    /**
     * @Route("/groups")
     * @return JsonResponse
     */
    public function getGroupsAction()
    {
        $conn   = $this->get('database_connection');
        $services = $conn->fetchAll(
            'SELECT id, nombre FROM sisit.grupos ORDER BY nombre;'
        );
        return new JsonResponse($services);
    }

    /**
     * @Route("/createUser")
     * @return JsonResponse
     */
    public function createUserAction(Request $request)
    {
        if ($request->getMethod() == 'POST') {
            $conn   = $this->get('database_connection');
            $conn->exec("
              INSERT INTO solicitantes(
                ubicacion, nombre, login, apellidos, idsede, idunidad, activado, ultima_modificacion, 
                ultima_modificacion_tecnico
              ) VALUES (
                ubicacion,
                nombre,
                login,
                apellidos,
                idsede,
                idunidad,
                activado,
                ultima_modificacion,
                ultima_modificacion_tecnico,
              )
            ");
            $response = Response::HTTP_OK;
        } else {
            $response = Response::HTTP_METHOD_NOT_ALLOWED;
        }
        return new JsonResponse($response);
    }
}