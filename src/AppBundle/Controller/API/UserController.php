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
            'SELECT nombre FROM sisit.net_servicios where final = 1 and nombre != "" ORDER BY nombre;'
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
            $username       = $request->request->get("username");
            $user_surname   = $request->request->get("user_surname");
            $user_idNumber  = $request->request->get("user_idNumber");
            $user_dpt       = $request->request->get("user_dpt");
            $services       = $request->request->get("services");


            $conn->exec(
                "INSERT INTO usuarios (
                    password,                        
                    id_grupo,                         
                    estado,                           
                    super_usuario,                    
                    externo,                          
                    vip,                              
                    crear_alertas,                    
                    usuariocorreo,                    
                    usuarioanonimo,                   
                    usuarioldap,                      
                    fecha_creacion,         
                    ultima_modificacion,        
                    nivel,                      
                    ultima_modificacion_tecnico
                ) VALUES (
                        '".strval(md5($username. " " .$user_surname))."',
                        ".strval($user_dpt).",
                        1,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        '".strval(date("Y-m-d H:i:s"))."',
                        '".strval(date("Y-m-d H:i:s"))."',
                        0,
                        0
                );");

            $response = Response::HTTP_OK;
        } else {
            $response = Response::HTTP_METHOD_NOT_ALLOWED;
        }
        return new JsonResponse($response);
    }
}