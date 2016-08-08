(function(CORE, $){

    /**
     * Devuelve un string con del numero recibido formateado
     *
     * @param      {string}  formato              Formato a aplicar
     * @param      {number}  valor                Numero a formatear
     * @param      {string}  separador_decimales  Separador decimales opcional
     * @param      {string}  separador_miles      Separador miles opcional
     * @return     {string}  String con el numero ya formateado
     */
    CORE.num_format = function(formato, valor, separador_decimales, separador_miles){
        var valor = valor || this,
            separador_decimales = separador_decimales || ",",
            separador_miles = separador_miles || ".",
            add = "",
            cifras = 0,
            formatos_numericos;

        switch(true){
            case formato.substr(0, 3) === 'num':
                add = "";
                cifras = formato.replace("num", "");
                formatos_numericos = true;
                break;
            case formato.substr(0, 1) === '€':
                add = " €";
                cifras = formato.replace("€", "");
                formatos_numericos = true;
                break;
            case formato.substr(0, 1) === '$':
                add = " $";
                cifras = formato.replace("$", "");
                formatos_numericos = true;
                break;
            case formato.substr(0, 1) === '%':
                add = " %";
                cifras = formato.replace("%", "");
                formatos_numericos = true;
                break;
            default:
                break;
        }

        if(formatos_numericos){
            formato += "";
            cifras = parseInt(cifras);
            cifras = !isNaN(cifras) && cifras > 0 ? cifras : 0;
            return set_decimales(valor, cifras, separador_decimales, separador_miles)+add;
        }
    }

    /*
     * Recupera el valor de una expresion formateada
     * expr     - Expresion de la que obtener el valor
     * tipo     - Tipo de valor a recuperar
     */
    CORE.num_unformat = function(expresion, tipo_retorno){
        var tipo = tipo || 'num',
            expresion = expresion.trim();


        switch(tipo){
            case 'num': // Desoformatea todos los formatos númericos (monedas, floats, porcentajes)
                var float = false,
                    char = "",
                    rsp = "";
                for(var i = 0; i < expresion.length; i++){
                    char = expresion.charAt(i)
                    if(!isNaN(parseInt(char))) rsp += char;
                    else if(char === ',') rsp += '.';
                }

                break;
            default:
                break;
        }

        return rsp;
    }

    var set_decimales = function(num, decimales, sep_d, sep_m){
        var num;
        num += "";
        num = num.split(".");

        return set_miles(num[0], sep_m)+sep_d+num[1].substr(0, decimales);
    }

    var set_miles = function(num, sep_m){
        var rsp ="";
        for (var j, i = num.length - 1, j = 0; i >= 0; i--, j++)
            rsp = num.charAt(i) + ((j > 0) && (j % 3 == 0)? ".": "") + rsp;
        return rsp;
    }

    CORE.eventos.push(['inicio', function(){ // Se ejecutará al lanzar inicio
        
        // Extiende formato a textos, numeros, Arrays y Objetos (incluidos los objetos HTML)
        this.interno.extender({format: CORE.format}, String.prototype);
        this.interno.extender({format: CORE.format}, Number.prototype);
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
        if($){ $.fn.formato = CORE.formato; }
    }]);

}(DAF.API || typeof window !== 'undefined' && window || this, typeof jQuery !== 'undefined' ? jQuery : false));