/*
 * Versión 0.1.02
 */
(function(CORE){
   
    /*
     * Convierte un string en un objeto html, solo si tiene es convertible
     * a HTML, en caso contrario, devolverá el string.
     * La diferencia con el metodo $(str), es que siempre devuelve un objeto.
     */
    CORE.str_to_htmlObj = function(str){
        var obj_virtual = document.createElement('div'),
            stro = str;

        str = str.split("\n").join("").trim();
        obj_virtual.innerHTML = str;
        obj_virtual = obj_virtual.firstChild;
        
        return obj_virtual && obj_virtual.nodeType == 3 ? stro : obj_virtual;
    }

    /*
     * Pone cualquier elemento del DOM a pantalla completa,
     * dando la opcion de cerrarlo.
     */
    CORE.pantalla_completa = {
        open: function(el){
            if(el.requestFullScreen)            el.requestFullScreen();
            else if(el.mozRequestFullScreen)    el.mozRequestFullScreen();
            else if(el.webkitRequestFullScreen) el.webkitRequestFullScreen();
        },
        close: function(el){
            if(el.cancelFullScreen)            el.cancelFullScreen();
            else if(el.mozCancelFullScreen)    el.mozCancelFullScreen();
            else if(el.webkitCancelFullScreen) el.webkitCancelFullScreen();
        },
        estado: function(){
            var full_screen_enable =  document.fullScreenEnabled || document.mozScreenEnabled || document.webkitScreenEnabled;
            return full_screen_enable;
        },
        objeto_ampliado: function(el){
            var el_full_screen = el.fullScreenElement || el.mozFullScreenElement || el.webkitFullScreenElement;
            return el_full_screen;
        }
    }

    /* Elimina acentos de un string:
     * Un uso es elimnar los acentos de un grupo de strings en castellano, para que 
     * se puedan ordenar alfabeticamente.
     * Si recibe algo diferente a un string devuelve lo mismo que haya recibido.
     */
    CORE.no_acentos = function(txt){
        var txt = txt || "";
        try{
            var ac   = [
                /[ÃÀÁÄÂ]/g, /[ÈÉËÊ]/g, /[ÌÍÏÎ]/g, /[ÒÓÖÔ]/g, /[ÙÚÜÛ]/g, 
                /[ãàáäâ]/g, /[èéëê]/g, /[ìíïî]/g, /[òóöô]/g, /[ùúüû]/g,
                ],
                noac = "AEIOUaeiou",
                txt  = txt.toString() || this.toString();
        } catch(e){
            console.log('Error provocado por al quitar acentos a:');
            console.debug(txt);
        }

        if(txt.search('Object]') > -1){
            console.log('El metodo no_acentos, solo acepta una cadena u objeto String como parametro. Recibido:');
            console.debug(txt);
            return txt;
        }
        
        if(txt !== "")
            for(var i=0; i<ac.length; i++)
                txt = txt.replace(ac[i], noac.charAt(i));
        
        return txt;
    }

    /* 
     * Ordena Array de objetos por una de sus propiedades, teniendo en cuenta los acentos:
     * Ordena todo el Array en base a una propiedad común.
     * Si se omite el orden, ordena ascendentemente. Si se le pasa 'dsc' como segundo parametro,
     * ordena de forma descendente.
     * 
     * Dendende del metodo no_acentos.
     *
     * No hace falta tener en cuenta si son numeros o texto, porque javascript ordena los float
     * igual en formato texto (por el orden de caracteres numéricos y .), que en formato numero.
     */
    CORE.sortObj = function(prop, orden, array){

        var orden = orden || 'asc',
            array = array || this;
        
        array.sort(function(a,b){
            var comp_a = a[prop]+"" || "",
                comp_b = b[prop]+"" || "";
            
            comp_a = comp_a.no_acentos().toLowerCase();
            comp_b = comp_b.no_acentos().toLowerCase();
            
            if(comp_a < comp_b) return (orden == 'dsc') ?  1 : -1;
            if(comp_a > comp_b) return (orden == 'dsc') ? -1 :  1;
        });
    };

    /*
     * Recibe un objeto Date,
     * un string como se recibe un obj Date de PHP,
     * o un string en la forma AAAA-MM-DD
     * Devuelve la fecha con formato español en la forma DD-MM-AAAA.
     * Si su segundo parametro es true, devuelve un objeto fecha
     */
    CORE.get_fecha = function(fecha, obj){
        var obj = obj || false,
            obj_fecha = CORE.tipo(fecha) === 'Date' ? fecha : new Date(fecha);
        if(obj_fecha == 'Invalid Date' || fecha == null) return "";
        else {
            if(obj) return fecha;
            else return this.ceros_izq(obj_fecha.getDate(),2)+"-"+
                        this.ceros_izq(parseInt(obj_fecha.getMonth()+1),2)+"-"+
                        obj_fecha.getFullYear();
        }
    }

    /*
     * Recibe un objeto Date o un string en la forma DD-MM-AAAA
     * Devuelve un string en la forma AAAA-MM-DD, preparado para enviarlo a PHP.
     * Si se pasa true como segundo parametro, devuelve el objeto fecha.
     */
    CORE.prepara_fecha = function(fecha, obj){
        var obj = obj || false,
            tmp;
        if(CORE.tipo(fecha) !== 'Date'){
            tmp = fecha.split('-');
            if(tmp.length < 2) tmp = fecha.split('/');
            if(tmp.length < 2) return "";
        }
        fecha = CORE.tipo(fecha) === 'Date' ? fecha : new Date(fecha);
        if(fecha === 'Invalid Date') return "";
        else {
            if(obj) return fecha;
            else return fecha.getFullYear()+"-"+
                        this.ceros_izq(parseInt(fecha.getMonth()+1),2)+"-"+
                        this.ceros_izq(fecha.getDate(),2);
        }
    }

    /*
     * Recibe un objeto checkbox y devuelve su valor correspodiente
     * Recibe tres parametros:
     * obj        - Objeto checkbox, puede ser un objeto DOM, un objeto jquery o un string
     *              en la forma '#id_objeto'.
     * marcado    - Valor a devolver si el checkbox está marcado. Devuelve 1 si se omite.
     * no_marcado - Valor a devolver si el checkbox no está marcado. Devuelve 0 si se omite.
     */
    CORE.valor_checkbox = function(obj, marcado, no_marcado){
        var obj = obj,
            marcado = marcado || 1,
            no_marcado = no_marcado || 0;

        // Si es un string con el formato correcto obtiene el objeto referneciado
        if(!_.isObject(obj)) obj = $(obj)[0] !== 'undefined' ? $(obj) : false;
        else 
            // Esto es para que trabaje tanto con un objeto DOM como con un objeto jquery
            if(CORE.tipo(obj) !== 'HTMLInputElement') obj = obj[0];
        
        if(obj)
            return obj.checked ? marcado : no_marcado;
        else {
            return 'ERROR a obtener valor del checkbox. En daf.utiles.js, metodo valor_checkbox';
        }
    }

    /*
     * Recibe un numero.
     * Devuelve un numero (transformado en string) con tantos ceros
     * añadidos a la izquierda como precise, para que su numero de cifras
     * sea igual a las cifras pedidas como argumento.
     */
    CORE.ceros_izq = function(num, cifras){
        var num = String(num),
            num_ceros = cifras - num.length,
            ceros_str = "";

        for(var i = 0; i < num_ceros; i++) ceros_str += "0";
        
        return (num_ceros > 0) ? ceros_str+num : num;
    }

    /*
     * Recibe un numero float, o un string con formato de numero float
     * Devuelve el float redondeado a 2 decimales
     */
    CORE.decimales2 = function(num){
        return Math.round(parseFloat(num)*100)/100;
    }

    /* NO TIENEn SENTIDO CON LAS DEPENDENCIAS DE JQUERY Y UNDERSCORE
        // Funcion each, para Arrays y para Objetos
        CORE.each = function(f){
            if (typeof f != "function") throw new TypeError(); // Hasta crear Gestion de errores en DAF
            for (var i = 0; i < this.length; i++) f.call(this[i], i);
            return this;
        }

        //Función para verificar si existe una clase
        CORE.tieneClase = function(obj,cls){
            return obj.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
        }

        //Función para agregar una clase, si existe la clase enviada.
        CORE.addClase = function(obj,cls){
            if(!existeClase(obj,cls)) {
                obj.className+=" "+cls;
            }
        }
        
        //Función para Eliminar una clase, si existe
        CORE.quitaClase = function(obj,cls){
            if(existeClase(obj,cls)) {
                var exp =new RegExp('(\\s|^)'+cls+'(\\s|$)');
                obj.className=obj.className.replace(exp,"");
            }
        }
    */

    CORE.eventos.push(['inicio', function(){ // Se ejecutará al lanzar inicio
        this.interno.extender({no_acentos: this.no_acentos}, String.prototype);
        this.interno.extender({sortObj: this.sortObj}, Array.prototype);
        this.interno.extender({each: this.each}, Array.prototype);
    }]);

}(DAF.API || typeof window !== 'undefined' && window || this));