(function(CORE){
    
    /* Convierte a CSV un array de arrays/objetos(colección).
     * El primer array se toma como titulo.
     * Todos los arrays del array debe de tener el mismo numero de elementos.
     * Parametros:
     * datos    - Datos con los que generar el CSV. 
     *            Los datos pueden tener 2 formatos: o arrays de objetos o arrays de arrays.
     *            Si recibe un array de arrays, para generar el csv se convertirá en un array de objetos, 
     *            cuyas claves seran los elementos del primer array. Si algun array tiene mas o menos elementos,
     *            o elementos en distinto orden, el csv saldrá mal formado.
     *            Si recibe un array de objetos, las claves del primer objeto seran los titulos
     *            y del resto solo se tomaran los valores de dichas claves. Hay que tener en cuenta que
     *            si un objeto del array, tiene claves que no estan en el primer objeto, estas no se tendran
     *            en cuenta en la generación del csv.
     * formato  - Objeto que formatea los datos antes de convertirlos en un string csv
     * titulos  - Obejto para crear/formatear los titulos
     * nombre   - Nombre del fichero a generar, si se omite, se genera uno aleatorio
     * ie       - true/false, compatible con internet explorer (con las limitaciones que impone en otros navegadores).
     */
    CSV = function(){
        var args = Array.prototype.slice.call(arguments, 0);

        /*
         * this.formato es un objeto usado para dar formato a todos los registros para el csv.
         * Cada elemento del objeto formato, puede ser un metodo o false.
         * Las claves de un registro que coincidan con las claves del objeto formato
         * seran procesadas si es un metodo, o filtradas si es false.
         * Un metodo dentro del objeto formato, recibirá como parametro el registro a procesar y 
         * debe retornar el resultado que será asignado.
         */
        this.formato = args[1] || _.isObject(args[1]) ? args[1] : {};

        this.titulos = args[2] || false;
        
        this.datos = [];
        this.set_datos(args[0]); 
        
        this.nombre  = args[3] || new Date().getTime();

        // Compatibilidad con Internet Explorer, si se aplica, limitará el tamaño del CSV al crearlo en Chrome.
        this.ie      = args[4] || false;
    }

    /*
     * El plugin trabaja con array de objetos, si recibe un array de arrays, lo convierte a array de objetos,
     * siendo los titulos el primer elemento.
     */
    CSV.prototype.set_datos = function(datos_recibidos){

        /* 
         * Clonamos los datos para evitar que interactuen cuando se recibe una colección global 
         * o con un ambito mayor al ambito de la función que va a generar el csv en el host.
         */
        var datos = _.clone(datos_recibidos);

        if(_.isObject(datos[0])){
            var titulos = _.keys(datos[0]);
                this.datos = [_.object(titulos, titulos)];
            if(!this.titulos){
                this.datos = _.union(this.datos, datos);
            } else {
                // POR IMPLEMENTAR, DEBE LEER LOS TITULOS DE this.titulos Y COLOCARLOS EN EL PRIMER REGISTRO.
            }
        } else if(_.isArray(datos[0])){
            var claves = datos[0], tmp_obj = {};
            this.datos = [];
            _.each(datos, function(arr, key){
                tmp_obj = {};
                _.each(claves,function(clave){
                    tmp_obj[clave] = arr.length > 0 ? arr.shift() : "";
                });
                this.datos.push(tmp_obj);
            });
        }
        else this.datos = [];
    }

    /*
     * Setea el this.formato con un objeto formato recibido
     */
    CSV.prototype.set_formato = function(formato){       
        if(formato && _.isObject(formato)) this.formato = formato;
    }

    /*
     * Aplica el formato del objeto formato a un registro
     */
    CSV.prototype.aplicar_formato = function(registro){
        var that = this,
            tmp_reg = [];
        _.each(registro, function(reg, key){
            // Si no existe la clave del registro en el objeto formato, lo usa tal cual.
            if(_.isUndefined(that.formato[key])) tmp_reg.push(reg);
            /*
             * Si es false, sencillamente no lo pushea a tmp_arr, filtrandolo por omisión.
             * Si no es false y es un metodo, le aplica el metodo.
             * Si no es false ni un metodo, lo asigna tal cual, ni lo filtra, ni lo procesa
             */
            else {
                if(that.formato[key])
                    if(_.isFunction(that.formato[key]))
                        tmp_reg.push(that.formato[key](reg));
                else tmp_reg.push(reg);
            }
        });

        return tmp_reg;
    }

    CSV.prototype.datos_2str_csv = function(){
        var that = this,
            reg = "", 
            datos = "",
            registros_erroneos = [],
            a = 0, b = 0, // Contadores
            v;

        // Aplicamos formato
        if(_.size(this.formato) > 0)
            _.each(this.datos, function(dato, key){
                that.datos[key] = that.aplicar_formato(dato);
            });

        // Pasa los datos a string csv
        while(a < this.datos.length){
            reg = "", b = 0;
            while(b < this.datos[a].length){
                v = this.datos[a][b];//.replace('"', '""');
                reg += '"'+v+'";';
                b++;
            }
            // LOS REGISTROS QUE NO SOPORTAN CONVERSION A BASE64 los marca como **NC**
            try {
                if(btoa(reg)) datos += reg+"\r\n";
                else datos += "**NC**\r\n";
            } catch(e){
                registros_erroneos.push(reg);
                console.log('Registro problematico');
                console.debug(reg);
                console.log('Error:');
                console.debug(e);
            }       
            a++;
        }
        return { datos: datos, errores: registros_erroneos }
    }

    /*
     * Recibe un string son el formato csv, 
     * lo convierte en un fichero, 
     * y lo descarga en el navegador.
     */
    CSV.prototype.descargar = function(str_csv){
        var str_csv = str_csv || this.datos_2str_csv()['datos'];

        var a = document.createElement('a'),
            url = window.URL || window.webkiURL;
        
        if(!this.ie){
            // FUNCIONA EN CHROME Y FIREFOX, NO EN IE
            a.setAttribute("href",
                url.createObjectURL(
                    new Blob(
                        ['\ufeff', str_csv], 
                        { type: 'text/csv;' }
                    )
                )
            );
            a.setAttribute("download", this.nombre+'.csv'); 
            a.click();
            url.revokeObjectURL(a.href); // Libera el objeto URL de window
        } else {
            // FUNCIONA en todos los navegadores PERO SE BLOQUEA CON ARCHIVOS MUY GRANDES EN CHROME
            a.setAttribute("href", url);
            a.setAttribute("href", 'data:text/csv;charset=utf-8,%EF%BB%BF'+encodeURI(str_csv));
            //a.href        = 'data:text/csv;charset=utf-16le,%EF%BB%BF'+encodeURI(str_csv);
            //a.href        = 'data:text/csv;base64,77u/'+str_csv;
            a.setAttribute("download", this.nombre+'.csv');  
            document.body.appendChild(a);
            a.click();
        }
    }

    /*
     * Para poder extender Array facilmente.
     */
    CORE.to__csv = function(formato, nombre, ie){
        var csv = new CSV(this, formato, nombre, ie);
        csv.descargar();
    }

    CORE.eventos.push(['inicio', function(){ // Se ejecutará al lanzar inicio
        // Extiende el plugin a Array
        this.interno.extender({ generar_csv: CORE.to__csv }, Array.prototype);
    }]);


})(DAF.API);
