/*
 * PROYECTO:
 * Una coleccion es un conjunto de datos en la forma array de objetos.
 * Cada coleccion, se encarga de toda la gestion CRUD y de mantenerse actuallizada con el servidor.
 * Una colección puede tener relacciones con otras colecciones, y al igual que las bases de datos, estas
 * pueden ser de distintos tipos.
 * Las vistas asociadas a una colección, se actualizaran automaticamente al actualizar la coleccion
 */
 (function(CORE, $){
 	/*
 	 * Una coleccion esta formada por unos datos (array de objetos, que es la forma habitual en la que 
 	 * se obtienen los datos tras una peticion), y una serie de metodos, para manipularlos
 	 */
 	CORE.Coleccion = function(url, clave){
 		// url usada para el CLAB, si acaba en / se lo quita
 		this.url = url.substr(-1) == '/' ? url.substr(0, str.length-1) : url; 
 		this.datos = [];
 		// Nombre del campo clave en la coleccion
 		this.clave = clave || 'id';
        /*
         * Array que almacena las relacciones de la colección en forma de strings con la siguiente forma:
         * "campo_origen | coleccion_destino | campo_destino"
         */
        this.relacciones = [];
        
        /*
         * Flag para saber que la colección a completado bien la última_peticion al servidor.
         */
        this.actualizada = false;
 	}

	/*
	 * Funciones para parsear un registro entre el servidor y la coleccion
	 */
 	CORE.Coleccion.prototype.parser = {
 		del_srv: function(datos){
 			return datos;
 		},
 		al_srv: function(datos){
 			return datos;
 		}
 	}

    CORE.Coleccion.prototype.test = function(){
        console.log('TEST');
        console.debug('TEST DE COLECCION CORRECTO');
    }

 	/*
 	 * Metodos para setear los parseadores
 	 */
 	CORE.Coleccion.prototypeset_del_srv = function(mtd){
 		this.parser.del_srv = _.isFunction(mtd) ? mtd : this.parser.del_srv;
 	}
 	
    CORE.Coleccion.prototype.set_al_srv = function(mtd){
 		this.parser_al_srv = _.isFunction(mtd) ? mtd : this.parser.al_srv;
 	}

 	/*
 	 * METODOS PARA EL CLAB (CREAR/LEER/ACTUALIZAR/BORRAR)
 	 */
 	CORE.Coleccion.prototype.crear = function(registro, callback){
 		var that = this;//,
 			//key = ;

 		CORE.peticion(
 			'POST', that.url, registro, 'json',
 			function(rsp){ //OK
 				that.datos[key] = that.parser.del_srv(rsp);
 			},
 			function(error){ // Error
 				console.log('Error');
 				console.debug(error);
 			},
 			function(){ // Peticion
 			}
 		);
 	}

 	CORE.Coleccion.prototype.leer = function(clave_registro, callback){
 		// Cambiamos la urls al plural segun las reglas del castellano
 		var that = this;
 		// 0-metodo, 1-ruta, 2-datos, 3-formato_datos, 4-callback-OK, 5-callback-ERROR, 6-Callback-Petición
 		CORE.peticion(
 			'GET', that.url, clave_registro, 'json',
 			function(rsp){ //OK
 				that.datos = [];
 				_.each(rsp, function(reg){
 					that.datos.push(that.parser.del_srv(reg));
 				});
 			},
 			function(error){ // Error
 				console.log('Error');
 				console.debug(error);
 			},
 			function(){ // Peticion
 			}
 		);
 	}

 	CORE.Coleccion.prototype.leer_todos = function(callback){
 		// Cambiamos la urls al plural segun las reglas del castellano
 		var _url = CORE.plural(this.url);

 		// 0-metodo, 1-ruta, 2-datos, 3-formato_datos, 4-callback-OK, 5-callback-ERROR, 6-Callback-Petición
 		CORE.peticion(
 			'GET', _url, false, 'json',
 			function(rsp){ //OK
 				that.datos = [];
 				_.each(rsp, function(reg){
 					that.datos.push(that.parser.del_srv(reg));
 				});
 			},
 			function(error){ // Error
 				console.log('Error');
 				console.debug(error);
 			},
 			function(){ // Peticion
 			}
 		);
 	}

 	CORE.Coleccion.prototype.actualizar = function(registro, callback){
 		var that = this,
 			key = registro[this.clave];// Hay que obtener la key internamente, no hay porque recibirla
 		
 		CORE.peticion(
 			'PUT', that.url, false, 'json',
 			function(rsp){ //OK
 				$.each(that.datos, function(key){
 					if(this[that.clave] == rsp[that.clave]){
 						that.datos[key] = that.parse.del_srv(rsp);
 						return false;
 					}
 				})
 			},
 			function(error){ // Error
 				console.log('Error');
 				console.debug(error);
 			},
 			function(){ // Peticion
 			}
 		);
 	}

 	CORE.Coleccion.prototype.borrar = function(clave_registro, callback){
 		var that = this;//,
 			//key = ;

 		CORE.peticion(
 			'DELETE', that.url, clave_registro, 'json',
 			function(rsp){ //OK
 				_.filter(that.datos, function(reg){
 					return reg[that.clave] !== clave_registro;
 				});
 			},
 			function(error){ // Error
 				console.log('Error');
 				console.debug(error);
 			},
 			function(){ // Peticion
 			}
 		);
 	}


    /*/ Devuelve el tipo de un objeto, muy util cuando se trata de un objeto DOM
    CORE.coleccion = function(v){
        var v = v || this;
        return Object.prototype.toString.call(v).replace('[object ', '').replace(']', '');
    }


    CORE.eventos.push(['inicio', function(){ // Se ejecutará al lanzar inicio
        
        // Extiende validar a textos, numeros, Arrays y Objetos (incluidos los objetos HTML)
        this.interno.extender({validar: CORE.validar}, String.prototype);
        this.interno.extender({validar: CORE.validar}, Number.prototype);

        
        // Si jQuery está cargado le extiende la funcionalidad validar y tipo
        if($){
            $.fn.validar = CORE.validar;
            $.fn.tipo = function(){ return CORE.tipo(this[0]); }
        }
    }]);
	*/
}(DAF.API || typeof window !== 'undefined' && window || this, typeof jQuery !== 'undefined' ? jQuery : false));