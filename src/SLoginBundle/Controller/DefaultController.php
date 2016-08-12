<?php

namespace SLoginBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;


class DefaultController extends Controller
{
    /**
     * @return Response
     * @throws \OneLogin_Saml2_Error
     * @Route("/slogin/saml2/metadata", name="slogin_metadata")
     *
     *
     * It checks whether metadata request was done properly.
     */
    public function metadataAction()
    {
        try {
            $auth = $this->get('slogin.authz');
            $settings   = $auth->getSettings();                     //OneLogin_Saml2_Settings
            $metadata   = $settings->getSPMetadata();               //Gets the SP metadata. The XML representation.
            $errors     = $settings->validateMetadata($metadata);   //Validates an XML SP Metadata.

            //No errors.
            if (!empty($errors)) {
                $response = new Response($metadata);
                $response->headers->set('Content-Type', 'xml');
            } else {
                //Errors were found. Invalid metadata.
                throw new \OneLogin_Saml2_Error(
                    'Invalid SP metadata: '.implode(', ', $errors),
                    \OneLogin_Saml2_Error::METADATA_SP_INVALID
                );
            }
        } catch (\Exception $e) {
            $response = new Response($e);
        }

        return $response;
    }

    /**
     * @Route("/logout/", name="pincap_logout")
     * @param Request $request
     */
    public function logoutAction(Request $request)
    {
        $session = $request->getSession();
        $auth = $this->get('slogin.authz');
        if($session->has('SLoginUserdata/sAMAccountName')){
            $request->getSession()->clear();
            $auth->logout();
        } else {
            $auth->login();
        }
    }

    /**
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\RedirectResponse|Response
     * @Route("/slogin/saml2/acs", name="slogin_acs")
     */
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
        return $this->redirect($this->generateUrl('homepage'));
    }

    /**
     * @Route("/slogin/saml2/slo", name="slogin_slo")
     */
    public function sloAction(Request $request)
    {
        $session = $request->getSession();
        if ($session->has('SLoginUserdata/sAMAccountName')) {
            $auth = $this->get('slogin.authz');
            $auth->processSLO();
            return $this->redirect($this->generateUrl('homepage'));
        }
        else {
            $response = new Response("no entra ni flores");
            return $response;
        }
    }
}
