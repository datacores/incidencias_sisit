<?php
/**
 * Created by PhpStorm.
 * User: jamarboledas
 * Date: 20/01/16
 * Time: 15:58
 */

namespace Services;


use Symfony\Component\HttpFoundation\Request;

/**
 * Class AuthFactory
 * @package Services
 */
class AuthFactory
{
    /**
     * @param Request $request
     * @param $id_app
     * @param $id_op_acceso
     * @return bool
     */
    public function checkAuth(Request $request, $id_app, $id_op_acceso )
    {
        $session = $request->getSession();

        /* Si está autenticado */
        if ($session->has('SLoginUserdata/sAMAccountName') && $session->has('datos_profile')) {

            $url = 'http://autoriza.ayuncordoba.org/index_dev.php/rest/public/autoriza';
            $datos_usuario = $session->get('datos_profile');

            $context = $this->createRequestContext($datos_usuario);

            /**
             * Asigna el contenido del fichero (o en este caso de la url)
             * a una cadena.
             *
             * Devuelve los datos leídos, o FALSE.
             */
            $datos = @file_get_contents($url, false, $context);

            if ($this->checkIfAuth($datos, $datos_usuario, $id_app, $id_op_acceso)) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    /**
     * @param $datos_usuario
     * @return resource
     */
    private function createRequestContext($datos_usuario)
    {
        /**
         * Devuelve los datos que se van a postear en formato url.
         *
         * Fuente: http://php.net/manual/es/function.http-build-query.php
         *
         */
        $datos_post = http_build_query(
            array(
                'samaccountname' => $datos_usuario['user_name'],
                'id_aplicacion'  => 'PINCAP'
            )
        );


        /**
         * Se forma la petición 'POST'
         */
        $opciones = array(
            'http' => array(
                'method'  => 'POST',
                'header'  => 'Content-type: application/x-www-form-urlencoded',
                'content' => $datos_post
            )
        );

        /**
         * Crea y devuelve un contexto de flujo con cualquier opción
         * proporcionada en options.
         *
         * Necesita un array asociativo de arrays asociativos.
         *
         */
        $context  = stream_context_create($opciones);

        return $context;
    }

    /**
     * @param $fileData
     * @param $userData
     * @param $appId
     * @param $opId
     * @return bool
     */
    private function checkIfAuth($fileData, $userData, $appId, $opId)
    {
        if (!$fileData) {
            $userData['datos'] = 'ERROR:';
        } else {

            $fileData = json_decode($fileData, true);
            $userData['datos'] = $fileData; // PROVISIONAL

            foreach ($fileData['aplicaciones'] as $app) {
                // Si encuentra el id entre los id de apps autorizadas
                if ($app['id_auth'] == $appId) {
                    foreach ($app['operaciones'] as $key=>$op) {
                        // Y si encuentra el id de acceso entre los ids de operacion autorizados
                        if ($op == 'acceso' && $key == $opId) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }
}