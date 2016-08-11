<?php

namespace Pincap\SLoginBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;


class DefaultController extends Controller
{
    /**
     * @return Response
     * @throws \OneLogin_Saml2_Error
     *
     * It checks whether metadata request was done properly.
     */
    public function metadataAction()
    {
        $logger = $this->get('logger');

        try {
            $auth = $this->get('slogin.authz');

            //OneLogin_Saml2_Settings
            $settings = $auth->getSettings();

            //Gets the SP metadata. The XML representation.
            $metadata = $settings->getSPMetadata();

            //Validates an XML SP Metadata.
            $errors = $settings->validateMetadata($metadata);

            //No errors.
            if (empty($errors)) {
                $logger->info('SLogin#metadata: Petición de metadatos');
                $response = new Response($metadata);
                $response->headers->set('Content-Type', 'xml');
            } else {
                //Errors were found. Invalid metadata.
                $logger->error('Invalid SP metadata: '.implode(', ', $errors), \OneLogin_Saml2_Error::METADATA_SP_INVALID);
                throw new \OneLogin_Saml2_Error(
                    'Invalid SP metadata: '.implode(', ', $errors),
                    \OneLogin_Saml2_Error::METADATA_SP_INVALID
                );
            }
        } catch (Exception $e) {

            //print exception message.
            $logger->error('SLogin#metadata: '.$e->getMessage());
            echo $e->getMessage();
        }

        return $response;
    }

    public function acsAction(Request $request)
    {
        $auth = $this->get('slogin.authz');
        $auth->processResponse();
        $errors = $auth->getErrors();

        if (!empty($errors)) {
          $response = new Response('<p>'.implode(', ', $errors).'</p>');
          $response->setCharset('ISO-8859-1');
          return $response;
          exit();
        }

        if (!$auth->isAuthenticated()) {
          $response = new Response("No está autenticado");
          $response->setCharset('ISO-8859-1');
          return $response;
        }

        /*
        $session->set('tokens/c', $value);

        $tokens = array('tokens' => array('a' => 'a6c1e0b6',
                                  'b' => 'f4a7b1f3'));
        */
        // Aqui hacemos la asignación a lo bruto pero lo suyo sería hacerlo bien y usar el parameter bag.
        //$session->set('SLoginUserdata', $auth->getAttributes());

        $session = $request->getSession();
        $sess_attr_base64 = $auth->getAttributes();

        //$session->set('SLoginUserdataBrute', $sess_attr_base64);
        //$session->set('SLoginUserdata/cn', $sess_attr_base64['cn']);
        //$session->set('SLoginUserdata/sn', $sess_attr_base64['sn']);
        //$session->set('SLoginUserdata/description', $sess_attr_base64['description']);
        //$session->set('SLoginUserdata/givenName', $sess_attr_base64['givenName']);
        //$session->set('SLoginUserdata/distinguishedName', $sess_attr_base64['distinguishedName']);
        $session->set('SLoginUserdata/displayName', utf8_decode(base64_decode($sess_attr_base64['displayName'][0])));
        //$session->set('SLoginUserdata/memberOf', $sess_attr_base64['memberOf']);
        //$session->set('SLoginUserdata/userPrincipalName', $sess_attr_base64['userPrincipalName']);
        //$session->set('SLoginUserdata/sAMAccountType', $sess_attr_base64['sAMAccountType']);
        $session->set('SLoginUserdata/sAMAccountName', utf8_decode(base64_decode($sess_attr_base64['sAMAccountName'][0])));

        // Lo que tenemos en cada clave de la sesion es un array no asociativo codificado en utf8 y base64 por
        // por lo que para actuar tendremos que coger (normalmente) el primer valor y decodificarlo. p.e:
        //print_r(utf8_decode(base64_decode($session->get('SLoginUserdata/sAMAccountName')[0])));
        //print_r($session->get('SLoginUserdata/sAMAccountName'));
        //die;

        return $this->redirect($this->generateUrl('backend_homepage'));
    }

    public function sloAction(Request $request)
    {
      
        $session = $request->getSession();

        if ($session->has('SLoginUserdata/sAMAccountName')) {

            $auth = $this->get('slogin.authz');
            
            $auth->processSLO();

            /*/CAMBIAR!!0
            $errors = $auth->getErrors();
            if(empty($errors)) {
                
            } else {
                return $errors;
            }
            //*/

            //$session->clear();
            return $this->redirect($this->generateUrl('backend_homepage'));
            //return 'hola';
        }

        
        // return 'deslogeado';
        // 
        // return $this->render('SLoginBundle:Default:index.html.twig', array('name' => $name));
    }
}
