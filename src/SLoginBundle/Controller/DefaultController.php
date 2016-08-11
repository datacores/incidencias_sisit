<?php

namespace SLoginBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
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
        } catch (\Exception $e) {
            $logger->error('SLogin#metadata: '.$e->getMessage());
            echo $e->getMessage();
            $response = new Response($e);
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
        }

        if (!$auth->isAuthenticated()) {
          $response = new Response("No está autenticado");
          $response->setCharset('ISO-8859-1');
          return $response;
        }

        $session = $request->getSession();
        $sess_attr_base64 = $auth->getAttributes();

        $session->set('SLoginUserdata/displayName', utf8_decode(base64_decode($sess_attr_base64['displayName'][0])));
        $session->set('SLoginUserdata/sAMAccountName', utf8_decode(base64_decode($sess_attr_base64['sAMAccountName'][0])));

        return $this->redirect($this->generateUrl('backend_homepage'));
    }

    public function sloAction(Request $request)
    {
      
        $session = $request->getSession();

        if ($session->has('SLoginUserdata/sAMAccountName')) {

            $auth = $this->get('slogin.authz');
            $auth->processSLO();

            return $this->redirect($this->generateUrl('backend_homepage'));
        }

    }
}
