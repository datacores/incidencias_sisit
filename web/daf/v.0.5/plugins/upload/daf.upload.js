/*
 * Plugin para subir ficheros de manera totalmente controlada.
 * El plugin almacena los ficheros en memoria y luego los sube, permitiendo ejecutar acciones
 * en cualquier parte del proceso.
 * Seguramente, ficheros muy grandes pueden dar problemas, pero existe la opción de trocearlos.
 */
(function(CORE, API){

    /**
     * @constructor
     * @param   {string/Array}  _link             Selector/Array de selectores tipo jquery, del link/s que abre 
     *                                            el/los selector/es de archivos.
     * @param   {function}      _callback_carga   Callback a ejecutar despues de cargar fichero. La función callback 
     *                                            recibirá 3 parametros, el objeto Progress Event, el objeto File, y
     *                                            el objeto/link iniciador.
     * @param   {function}      _callback_subida  Callback a ejecutar despues de subir fichero.
     * @param   {array}         _permitir         Array con los tipos permitidos, si vacio o false, los permitirá todos.
     *                                            Este array se puede usar para subir solo imagenes o solo pdfs y textos, 
     *                                            etc...
     */
    function Upload(_link, _multiple, _callback_carga, _permitir){
        if(!window.File || !window.FileReader || !window.FileList || !window.Blob)
            throw("\nDAF Error:\nNavegador incompatible con daf.upload.js.\nPor favor, actualice su navegador.");

        var multiple  = multiple || false;
        
        // Creamos el elemento input tipo file, debe ser lo primero, sinó se pueden setear los iniciadores
        this.input_file = document.createElement("INPUT");
        this.input_file.setAttribute("type", "file");
        this.input_file.setAttribute("name", "files[]");
        if(multiple) this.input_file.setAttributte("multiple", "true");

        /**
         * Array de links que pueden iniciar la subida de archivos, con un mismo input file.
         * normalmente solo habrá un iniciador, pero dejamos hecha esta estructura para cuando 
         * tengamos más de uno.
         * 
         * @type {Array}
         */
        this.iniciadores = [];

        this.set_iniciadores(_link);

        this.permitir  = _permitir || false;
        this.callback  = _callback_carga && _.isFunction(_callback_carga) ? 
                            _callback_carga : 
                            function(f){ console.log('Fichero cargado:'); console.debug(f); }
                            
        // Array donde va almacenando los ficheros antes de subirlos
        this.ficheros_asubir = [];

        // Array donde almacenar datos a subir junto a los ficheros
        this.datos = [];

        


        // Variable para poder guardar el objeto FormData, y poder setearlo si lo necesitasemos
        this.formdata = false;
    }

    /**
     * Setea el Formdata, util para subir manejar el FormData desde fuera del plugin
     *
     * @param      {DOMObject}  frmdata  Objeto FormData
     */
    Upload.prototype.set_formdata = function(frmdata){
        if(_.isObject(frmdata) && frmdata.toString() === "[object FormData]") 
            this.formdata = frmdata;
    }
    
    /**
     * Permite setear los iniciadores más tarde, por si los links no existen, en el momento de
     * instanciar el objeto.
     *
     * @param      {<type>}  _iniciadores  The iniciadores
     */
    Upload.prototype.set_iniciadores = function(_iniciadores){
        var that = this;
        
        if(_.isArray(_iniciadores)){
            _.each(_iniciadores, function(lnk){
                that.iniciadores.push($(lnk));
            });
        }else that.iniciadores = [$(_iniciadores)];

        if(this.iniciadores.length > 0 ) this.comportamientos();  
    }

    /**
     * Activa los comportamientos, como por ejemplo, si click en iniciador -> click en el input file, 
     */
    Upload.prototype.comportamientos = function(){
        var that = this,
            iniciador;
        
        _.each(this.iniciadores, function(inic){
            inic.off("click");
            inic.on("click", function(ev){
                ev.preventDefault();
                ev.stopPropagation();
                iniciador = ev;
                $(that.input_file).click();
            });
        });

        $(that.input_file).off("change");
        $(that.input_file).on("change", function(ev){
            
            var files = ev.target.files; // Objeto con todos los ficheros seleccionados
                   
            //Obtenemos ficheros del campo "file". 
            for(var i = 0, f; f = files[i]; i++){         
                
                //Solo admitimos imágenes.
                //if(!f.type.match('image.*')){
                    //continue;
                //}

                var reader = new FileReader();
                reader.onload = (function(fichero){
                    that.ficheros_asubir.push(fichero);
                    return  function(e){
                                that.callback(e, fichero, iniciador);   
                            }
                })(f);
                reader.readAsDataURL(f);
            }
        });
    }

    /**
     * Añades datos al array datos, que se subirá con los ficheros en caso de tener contenido.
     *
     * @param      {ArrayElement}  datos   Datos a añadir al array
     */
    Upload.prototype.add_datos = function(datos){
        if(_.isArray(datos) || _.isObject(datos)) datos = JSON.stringify(datos);
        this.datos.push(datos);
    }

    /**
     * Función que se encarga de subir todos los ficheros que tengamos en memoria
     *
     * @param   {string}          url       Url donde se subiran los ficheros.
     * @param   {Function}        callback  Callback tras subir el/los ficheros.
     * @param   {string}          nombre    nombre del array de ficheros que recibirá el servidor. Si false = ficheros
     */
    Upload.prototype.subir = function(_url, _callback, _nombre){

        var formdata = this.formdata || new FormData(),
            nombre   = _nombre || "ficheros",
            callback =  _.isFunction(_callback) ? 
                        _callback : 
                        function(r){
                            console.log('Respuesta:');
                            console.debug(r);
                        };

        _.each(this.ficheros_asubir, function(f){
            formdata.append(nombre+"[]", f);
        });


        if(this.datos.length > 0) formdata.append("upload_datos", this.datos);

        $.ajax({
            url : _url,
            type : 'POST',
            data : formdata,
            processData : false,
            contentType : false,           
        })
        .done(function(rsp){
            callback(rsp);
        })
        .fail(function(err){
            console.log('Error:');
            console.debug(err);
        });
    }


    /**
     * Implementación de zona para arrastrar ficheros a subir.
     * [PARA FUTURO]
     */
    Upload.prototype.ficheros_arrastrados = function(){

    }

    /**
     * Impletmentacion para trocear un fichero antes de subirlo
     */
    Upload.prototype.split_file = function(){

    }

    /**
     * Resetea el objeto instanciado, para reutilizarlo
     */
    Upload.prototype.reset = function(){
        this.iniciadores = [];
        this.ficheros_asubir = [];
        this.datos = [];
    }

    API.dataURItoFile = function(dataURI, nombre_fichero) {
        // Convierte datos base64/URLEncoded en una cadena.
        var byteString;
        if(dataURI.split(',')[0].indexOf('base64') >= 0)
            byteString = atob(dataURI.split(',')[1]);
        else
            byteString = unescape(dataURI.split(',')[1]);

        // Obtiene el mime de dateURI
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

        // Escribe los bytes del string en un array tipado a enteros de 8 bits sin signo
        var datos = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            datos[i] = byteString.charCodeAt(i);
        }

        return new File([datos], nombre_fichero, {type:mimeString});
    }

    CORE.Upload = Upload;

    API.eventos.push(['inicio', function(){ // Se ejecutará al lanzar inicio
        // Extiende validar a textos, numeros, Arrays y Objetos (incluidos los objetos HTML)
        // this.interno.extender({validar: API.validar}, String.prototype);
        // interno.extender({validar: API.validar}, Number.prototype);
        
        // Si jQuery está cargado le extiende la funcionalidad validar y tipo
        //if($){ $.fn.upload = API.upload; }
    }]);

}(DAF, DAF.API));