(function(CORE, $){

    // Devuelve el tipo de un objeto, muy util cuando se trata de un objeto DOM
    CORE.tipo = function(v){
        var v = v || this;
        return Object.prototype.toString.call(v).replace('[object ', '').replace(']', '');
    }

    CORE.validar = function(t, v){
            
        var v = v || this;

        // Realiza la validación contra expresiones regulares
        var checkea =  function(t, v){
            var e;
            switch(t){
                case 'nif':      // Documentos NIF (CIF, DNI, NIE)
                    if(v.length != 9) return false;
                    // Quitamos la primera y la ultima cifra.
                    var tipo     = v.substr(0, 1).toUpperCase(),
                        control  = v.substr(v.length-1, 1),
                        numero   = v.substr(1, v.length-2),
                        lts_nie  = 'XYZ',
                        lts_cif = 'JABCDEFGHI';
                    if(lts_nie.indexOf(tipo) != -1 || !isNaN(parseInt(tipo))){ // DNI o NIE
                        numero = !isNaN((parseInt(tipo))) ?
                                    tipo+numero : lts_nie.indexOf(tipo)+numero;
                        control = control.toUpperCase();
                        // Calculamos la letra de correcta del DNI
                        var t = "TRWAGMYFPDXBNJZSQVHLCKE";
                        var ok = t.charAt(numero % 23);
                        // Si la letra es correcta
                        if(ok == control) return true;
                    } else {                                                   // CIF
                        var test  = 0, 
                            valor = 0;
                        control = (parseInt(control)) ? parseInt(control) : control.toUpperCase();
                        for(var i=0;i < numero.length;i++){
                            valor = parseInt(numero.charAt(i));
                            if((i+1)%2 == 0){ // Si son pares
                                test += valor;
                            } else {          // Si son impares
                                valor = String(valor*2);
                                valor = (valor.length > 1) ?
                                        parseInt(valor.charAt(0))+parseInt(valor.charAt(1)):
                                        parseInt(valor);
                                test += valor;
                            }
                        }
                        test = (test%10 != 0) ? 10-(test%10): 0;
                        return  (!isNaN(parseInt(control))) ?
                                    ((test == control)                 ? true : false):
                                    ((lts_cif.charAt(test) == control) ? true : false);
                    }
                    return false;
                    break;
                case 'fecha_sp': // Fecha en castellano
                    e = /^[0-3]*\d(-|\/)[0-1]?\d(-|\/)\d\d{1,3}$/;
                    if(v != "" && !e.test(v)) return false;
                    return true;
                    break;
                case 'fecha_en': // Fecha en ingles
                    e = /^\d\d{1,3}(-|\/)[0-1]?\d(-|\/)[0-3]*\d$/;
                    if(v != "" && !e.test(v)) return false;
                    return true;
                    break;
                case 'fecha': // Devuelve true si es una fecha en ingles, en español, o un espacio vacio
                    es = /^[0-3]*\d(-|\/)[0-1]?\d(-|\/)\d\d{1,3}$/;
                    ee = /^\d\d{1,3}(-|\/)[0-1]?\d(-|\/)[0-3]*\d$/;
                    
                    if(v != "" && (es.test(v) || ee.test(v))) return true;
                    return true;
                    
                    break;
                case 'c_postal': // Codigo postal de 5 cifras
                    e = /^\d{5}$/;
                    if(e.test(v)) return true;
                    return false;
                    break;
                case 'tlfno':    // Telefono (+34)93400700(01234)
                    e = /^(\(\+\d{2,3}\))*\d{9}(\(\d{2,5}\))*$/;
                    if(e.test(v)) return true;
                    return false;
                    break;
                case 'mail':     // Correo electronico con puntos en dominio y nombre
                    e = /^[\w-\.]{3,}@([\w-]{3,}\.)+([\w-]{2,}\.)*[\w-]{2,4}$/;
                    if(e.test(v)) return true;
                    return false;
                    break;
                case 'int_u':    // Entero sin signo
                    e = /^\d+$/;
                    if(e.test(v)) return true;
                    return false;
                    break;
                case 'int_s':    // Entero con signo
                    e = /^-?\d+$/;
                    if(e.test(v)) return true;
                    return false;
                    break;
                case 'float_u':  // Flotante sin signo
                    e = /^\d+\.\d+$/;
                    if(e.test(v)) return true;
                    return false;
                    break;
                case 'float_s':  // Flotante con signo
                    e = /^-?\d+\.\d+$/;
                    if(e.test(v)) return true;
                    return false;
                    break;
                default:
                    return false;
                    break;
            }
        }

        // Determina lo que debe validar en función de lo que recibe como valor
        switch(CORE.tipo(v)){
            case 'Number':
                return checkea(t, v);
                break;
            case 'String':
                return checkea(t, v);
                break;
            case 'Array':
                var rsp = [];
                v.each(function(ky){
                    rsp[ky] = checkea(t, v[ky]);
                });
                return rsp;
                break;
            case 'Object':
                if(CORE.tipo(v[0]) === 'HTMLInputElement'
                || CORE.tipo(v[0]) === 'HTMLSelectElement')
                    return checkea(t, v[0].value);
                return false;
                break;
            case 'HTMLInputElement':
                if(CORE.tipo(v) == 'text')
                    return checkea(t, v.value);
                break;
            case 'HTMLTextAreaElement':
                return false;
                break;
            case 'HTMLSelectElement':
                return false;
                break;
            case 'HTMLFormElement':
                console.log(v.elements);
                var rsp = [];
                for (i=0;i<v.elements.length;i++){
                    if(v.elements[i].type == 'text'){
                        rsp.push({
                            obj:   v.elements[i],
                            valor: v.elements[i].value,
                            validado: checkea(
                                v.elements[i].getAttribute('data-tipo'),
                                v.elements[i].value
                            )
                        });    
                    }
                }
                return rsp;
                break;
            default:
                return false;
                break;
        } 
    }
    
    CORE.eventos.push(['inicio', function(){ // Se ejecutará al lanzar inicio
        
        // Extiende validar a textos, numeros, Arrays y Objetos (incluidos los objetos HTML)
        this.interno.extender({validar: CORE.validar}, String.prototype);
        this.interno.extender({validar: CORE.validar}, Number.prototype);
        /* Es una mala practica extender objetos, no solo rompe jquery 
         * en versiones anteriores a 1.11, sino que afecta a todos los 
         * objetos de javascript, y puede crear conflictos con otros 
         * plugins o librerias.
         * Para validar objetos, usar validar en la forma:
         *      instancia_libreria_daf.validar(tipo, objeto).
         */
        // this.interno.extender({validar: validar}, Object.prototype);
        // this.interno.extender({validar: CORE.validar}, Array.prototype);
        
        // Si jQuery está cargado le extiende la funcionalidad validar y tipo
        if($){
            $.fn.validar = CORE.validar;
            $.fn.tipo = function(){ return CORE.tipo(this[0]); }
        }
    }]);

}(DAF.API || typeof window !== 'undefined' && window || this, typeof jQuery !== 'undefined' ? jQuery : false));