<?php
namespace AppBundle\Controller\API;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\JsonResponse;

class LdapController {
    private $usuarios;
    private $conexion;
    public function __construct(){
        /* Si falla la función ldap_connect:
         * En php.ini In this file uncomment the line: extension=php_ldap.dll
         * Move the file: libsasl.dll, from \xampp\php to \xampp\apache\bin
         * Restart Apache.
         */
        // Recuperamos listado de usuarios del LDAP
        // Conectamos con el LDAP
        error_reporting(0);
        $this->usuarios = array();
        $this->conexion = ldap_connect("10.129.5.106", "389");
        ldap_set_option($this->conexion, LDAP_OPT_PROTOCOL_VERSION, 3);
    }
    private function conectar($usuario, $password){

        $r=ldap_bind($this->conexion, $usuario, $password);

        return ($r) ? $r : "error";
    }
    private function desconectar(){
        ldap_close($this->conexion);
    }

    /**
     * @return array|string
     * @Route("/ldapUsers")
     */
    public function get_usuarios(){

        $this->conectar("consultaldap", "Consulta#2016@");
        if($this->conexion){
            //OBTENEMOS SUS DATOS
            $dn = "OU=AYUNCORDOBA,DC=ayuncordoba,DC=org";
            //$filtro = "(|(SAMAccountName=$login))";
            //$filtro = "(|(displayName=$busqueda))";
            //$filtro = "(|(displayname=*$busqueda*))";
            $filtro = "(|(displayname=*))";
            $solonecesito = array("samaccountname","dn","sn", "displayname","department","telephoneNumber","mail");
            $sr=ldap_search($this->conexion, $dn, $filtro, $solonecesito);
            ldap_sort($this->conexion, $sr, "sAMAccountName");
            $info = ldap_get_entries($this->conexion, $sr);
            $i = 0;
            foreach($info as $key => $value){
                if($key != "count"){
                    $this->usuarios[$i]['usuario_id'] = $value['samaccountname'][0];
                    if(isset($value['displayname'][0]))
                        $this->usuarios[$i]['displayname']=$value["displayname"][0];
                    if(isset($value['dn'][0]))
                        $this->usuarios[$i]['departamento']=$value["dn"];
                    if(isset($value['telephonenumber'][0]))
                        $this->usuarios[$i]['telefono']=$value["telephonenumber"][0];
                    if(isset($value['mail'][0]))
                        $this->usuarios[$i]['mail']=$value["mail"][0];
                    $i++;
                }
            }
            $this->desconectar();
            return new JsonResponse($this->usuarios);
        } else {
            return "La autenticación con el LDAP a fallado";
        }
    }
}
$ldap = new LdapController();