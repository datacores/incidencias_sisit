<?php
namespace AppBundle\Controller\API;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class LdapController extends Controller
{
    private $users;
    private $connection;

    private function connect($user, $password)
    {
        $r=ldap_bind($this->connection, $user, $password);
        return ($r) ? $r : "error";
    }

    private function disconnect()
    {
        ldap_close($this->connection);
    }

    /**
     * @return array|string
     * @Route("/ldapUsers")
     */
    public function get_users()
    {
        $this->connect($this->getParameter('ldap_user'), $this->getParameter('ldap_password'));
        if ($this->connection) {
            $dn = "OU=AYUNCORDOBA,DC=ayuncordoba,DC=org";
            $filtro = "(|(displayname=*))";
            $solonecesito = array("samaccountname","dn","sn", "displayname","department","telephoneNumber","mail");
            $sr=ldap_search($this->connection, $dn, $filtro, $solonecesito);
            ldap_sort($this->connection, $sr, "sAMAccountName");
            $info = ldap_get_entries($this->connection, $sr);
            $i = 0;
            foreach($info as $key => $value){
                if($key != "count"){
                    $long = strlen($value['samaccountname'][0]);
                    if(($long == 4 || $long == 5) && stripos($value['displayname'][0], 'prueba') === false
                        && stripos($value['displayname'][0], $value['samaccountname'][0]) === false ){
                        $this->users[$i]['usuario_id'] = $value['samaccountname'][0];
                        if(isset($value['displayname'][0]))
                            $this->users[$i]['displayname']=$value["displayname"][0];
                        if(isset($value['dn'][0]))
                            $this->users[$i]['departamento']=$value["dn"];
                        if(isset($value['telephonenumber'][0]))
                            $this->users[$i]['telefono']=$value["telephonenumber"][0];
                        if(isset($value['mail'][0]))
                            $this->users[$i]['mail']=$value["mail"][0];
                        $i++;
                    }
                }
            }
            $this->disconnect();
            return new JsonResponse($this->users);
        } else {
            return "La autenticación con el LDAP a fallado";
        }
    }

    public function __construct()
    {
        error_reporting(0);
        $this->users = array();
        $this->connection = ldap_connect("10.129.5.106", "389");
        ldap_set_option($this->connection, LDAP_OPT_PROTOCOL_VERSION, 3);
    }
}