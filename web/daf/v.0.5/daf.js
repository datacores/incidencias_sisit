'use strict';
var DAF = (function(global){
	
	/**
	 * @class      Observador patron   	publicador/subscriptor, usada para la API. El objeto de esta
	 *             						clase es que todos los plugins asociados a la API de DAF, 
	 *             						puedan ejecutar codigo asociado un evento, que todos "escuchan" 
	 *             						como subscriptores.
	 * @param      {Object}   context  	Define el contexto/nexo de unión entre todos los publicadores 
	 *                                  y subscriptores, que este caso es el objeto API
	 * @return     {boolean}  retorna false al dar de baja a un subscriptor, o el token, en el caso de
	 *                        que sea haga una nueva subscripción.
	 */
	function Observador(context){
		/**
		 * Array para grabar topics. Un topic es una etiqueta/tema/evento al que se 
		 * suscriben objetos, los cuales ejecutarán un codigo propio asociado a ese 
		 * topic, cada vez que sea publicado en cualquier parte del codigo.
		 *
		 * @type       {Array}
		 */
		var topics = {};

		/**
		 * Subscribe
		 *
		 * @param      {string}    		topic   	nombre del topic al que se subscribe
		 * @param      {Function}  		callback  	Codigo propio del subscriptor, que se ejecutará
		 *                                      	cuando se publique el topic.
		 * @param      {boolean}    	once     	Si true, solo se ejecutará en la primera publicación del topic.
		 * @return     {token}  		Devuelve el token de la subscripción, o false en caso de error.
		 */
		this.subscribe = function(topic, callback, once) {
			if(typeof callback !== 'function') return false;

			// Si no existe el topic lo crea
			if(!topics.hasOwnProperty(topic)) topics[topic] = {};

			// Crea un token aleatorio de 35 caracteres
			var token = Math.random().toString(35);

			/** 
			 * Asocia el topic a un token, y este a su vez queda asociado al array 
			 * [función con codigo a ejecutar, once]
			 * con codigo que ejecutará el objeto subscriptor cuando se publique el topic,
			 * y el booleano once.
			 * (si once true solo se ejecutará en la primera publicación del topic).
			 */
			topics[topic][token] = [callback,!!once];

			return token;
		};


		/**
		 * Da de baja el codigo de un objeto asociado a un topic, del topic, 
		 * por ende, el objeto subscriptor dejará de serlo y por lo tanto no 
		 * hará nada, cuando se publique el topic.
		 * Para darlo de baja usamos el token que asocia el codigo al topic
		 *
		 * @param      {string}   token   String que identifica el codigo del subscriptor
		 * @return     {boolean}  Si true, ha encontrado y eliminado de codigo asociado al
		 *                        topic a traves del token. En caso contrario, devuelve false.
		 */
		this.unsubscribe = function(token) {
			for(var topic in topics) {
				if(topics[topic][token]) {
					delete topics[topic][token];
					return true;
				}
			}
			return false;
		};


		/**
		 * Función que publica un topic, y por lo tanto, ejecuta todo el codigo
		 * de distintos ficheros,plugins, etc, asociado a ese topic
		 *
		 * @param      {string}  topic   Nombre del topic
		 */
		this.publish = function(topic) {
			if(topics.hasOwnProperty(topic)) {
				var args = Array.prototype.slice.call(arguments, 1), 
					idr = [];

				for(var id in topics[topic]) {
					var sub = topics[topic][id];
					try {
						sub[0].apply(context, args);
					} catch(ex) {
						if(global.console) console.error('DAF Observador Error', ex.message, ex);
					}
					if(sub[1]) idr.push(id);
				}
				if(idr.length) idr.forEach(this.unsubscribe);
			}
		};
	}

	/**
	 * CONSTRUCTOR
	 */
	function DAF() {
		var options = {};

		var API = {}, 					// Objeto donde tendremos todos los metodos disponibles en DAF
			EV = new Observador(API);	// Objeto de la clase observador, explicada más arriba.

		/***********************
		*	METODOS PRIVADOS   *
		***********************/

		    /**
		     * Función que extiende un array u objeto, sobreescribe o crea todos
		     * los metodos y propiedades del objeto origen en destino.
		     *
		     * @param      {Object/Array}  origen	{ Objeto del que extiende}
		     * @param      {Object/Array}  destino  { Objeto que extiende }
		     * @return     {Object/Array}  { Objeto resultante }
		     */
		    var extender = function(origen, destino){
			        var destino = destino || this;
			        for(var x in origen) destino[x] = origen[x];
			        return destino;
			    },
			/*
			 * Selector básico, tipo jquery, para objetos HTML, no tiene mucho sentido, 
			 * cuando usamos plugins con la dependencia de jquery, pero sirve, si usamos 
			 * DAF y plugins sin dependencia de jquery.
			 *
			 * @param      {string}  expr    Expresión que empieza con un caracter selector.
			 * @return     {Array}  { devuelve un array con los objetos coincidentes }
			 */
	    	selector = function(expr){
	    		var s = expr.substr(0,1)
	    		switch(s){
	    			case '#': // ids
	    				return document.getElementById(expr.substr(1, expr.length-1));
	    				break;
	    			case '.': // clases
	    				return  document.getElementsByClassName(expr.substr(1, expr.length-1));
	    				break;
	    			case '_': // names
	    				return document.getElementsByName(expr.substr(1, expr.length-1));
	    				break;
	    		}
	    	}

		/***********
		*	API	   *
		***********/
		
		// Getters para los metodos privados, para acceder a ellos desde API.interno
		API.interno = { 
			'extender' : function(o, e){ return extender(o, e); },
			'selector' : function(expr){ return selector(expr); }
		}

		// Permite publicar fuera de DAF, a traves de la API.
		API.publish = function(topic){
			var args = Array.prototype.slice.call(arguments, 1);
			EV.publish(topic, args);
		}

		/**
		 * Metodo que permite cargar css y javascript en el head, 
		 * incluso despues de haber cargado la pagina. Este metodo
		 * está tambien en daf.url.js, que formará parte de este nucleo
		 * junto con daf.vistas.js, daf.router.js y daf.colecciones.js
		 */
		API.carga_2head = function(fichero, tipo){
		    if (tipo == "js") {
		        var to_head = document.createElement('script');
		        to_head.setAttribute("type", "text/javascript");
		        to_head.setAttribute("src", fichero);
		    } else if (tipo == "css") {
		        var to_head = document.createElement("link");
		        to_head.setAttribute("rel", "stylesheet");
		        to_head.setAttribute("type", "text/css");
		        to_head.setAttribute("href", fichero);
		    }
		    if(typeof to_head != "undefined")
		        document.getElementsByTagName("head")[0].appendChild(to_head)
		}

		// Integramos metodos y eventos de los plugins en DAF
		for(var plugin in DAF.API){
			// Si es un evento
			if(plugin === 'eventos' && DAF.API.eventos.length){
				(function(EV, eventos_plugin) {
					
					var nombre_evento,
						handler_and_args;
					
					for (var i = eventos_plugin.length - 1; i !== -1; i--) {
						nombre_evento = eventos_plugin[i][0];
						handler_and_args = eventos_plugin[i][1];
						EV.subscribe.apply(
							EV,
							[nombre_evento].concat(
								typeof handler_and_args === 'function' ?
									[handler_and_args] : handler_and_args));
					}

				}(EV, DAF.API.eventos));
			} 
			// Si se trata de un metodo para la API, lo asocia directamente.
			else {
				API[plugin] = DAF.API[plugin];
			}
		}

		/*
		 * Nos subscribimos al evento inicio que se ejecutará se instancie DAF.
		 * En este caso, solo se ejecutrá la primera vez que se publique el topic 'inicio'
		 */
		EV.subscribe('inicio', function(){
			console.debug('DAF '+DAF.version);
			console.debug('Iniciado...')
		}, true);

		// Publicamos el inicio de DAF
		EV.publish('inicio');
		
		return API;
	}

	// FN tiene por defecto un array donde almacenar eventos para lanzar a los subscriptores 
	DAF.API = {eventos:[]};
	DAF.version = "0.5 ©Datacor(www.datacor.es), Autor: Ukem(https://github.com/ukem)";

	global.DAF = DAF;

	return DAF;
}(typeof self == 'object' && self.self == self && self));
