<?php

namespace AppBundle\Controller\API;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class EmailController
 * @package AppBundle\Controller\API
 */
class EmailController extends Controller
{
    /**
     * @Route("/email")
     * @Method("POST")
     */
    public function sendEmailAction(Request $request)
    {
        $message = \Swift_Message::newInstance();
//        $img_cabecera = $message->embed(\Swift_Image::fromPath('bundles/a14bancoderecursos/img/email/logo.png'));
//        $img_pie = $message->embed(\Swift_Image::fromPath('bundles/a14bancoderecursos/img/email/logoayuntamiento-pie.png'));

        $message
            ->setSubject('Casa de la juventud - Modificación de reserva de recurso')
            ->setFrom('juanto1990@gmail.com')
            ->setTo('juanto1990@gmail.com')
            ->setBody($request->request->get('body'));

        $this->get('mailer')->send($message);

        return new JsonResponse(JsonResponse::HTTP_OK);
    }
}