'use strict';
var DAF = (function(global){
	
	/**
	 * @class      Observador patron   	publicador/subscriptor, usada para la API. El objeto de esta
	 *             						clase es que todos los plugins asociados a la API de DAF, 
	 *             						puedan escribir y leer metodos de la API.
	 * @param      {Object}   context  	Define el contexto/nexo de unión entre todos los publicadores 
	 *                                  y subscriptores, que este caso es el objeto API
	 * @return     {boolean}  retorna false al dar de baja a un subscriptor, o el token, en el caso de
	 *                        que sea haga una nueva subscripción.
	 */
	function Observador(context){
		var topics = {};

		this.subscribe = function(topic, callback, once) {
			if(typeof callback !== 'function') return false;

			if(!topics.hasOwnProperty(topic)) topics[topic] = {};

			var token = Math.random().toString(35);
			topics[topic][token] = [callback,!!once];

			return token;
		};

		this.unsubscribe = function(token) {
			for(var topic in topics) {
				if(topics[topic][token]) {
					delete topics[topic][token];
					return true;
				}
			}
			return false;
		};

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

		var API = {}, 					// Todos los metodos asociados a DAF
			EV = new Observador(API);	// Todos los eventos, para publicar/escuchar en DAF

		/*
		 *	METODOS PRIVADOS
		 */
			// Función que extiende un elemento array u objeto
		    var extender = function(o, e){
			        var e = e || this;
			        for (var x in o) e[x] = o[x];
			        return e;
			    },
			// Selector para objetos HTML, devuelve un array con objetos coincidentes
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

		/*
		 *	API
		 */
		
		// Getters para los metodos privados, para acceder a ellos desde API
		API.interno = { 
			'extender' : function(o, e){ return extender(o, e); },
			'selector' : function(expr){ return selector(expr); }
		}

		// Permite publicar desde los plugins y fuera de DAF
		API.lanzar = function(){
			var args = Array.prototype.slice.call(arguments, 0);
			EV.publish(args.shift(), args);
		}

		// Metodo que permite cargar css y javascript en el head, incluso despues de haber cargado la pagina
		API.carga_2head = function(fichero, tipo, ambito){
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
			if (plugin === 'eventos' && DAF.API.eventos.length) {
				(function(EV, eventos_plugin) {
					var nombre_evento,handler_and_args,i;
					for (i = eventos_plugin.length - 1; i !== -1; i--) {
						nombre_evento = eventos_plugin[i][0];
						handler_and_args = eventos_plugin[i][1];
						EV.subscribe.apply(
							EV,
							[nombre_evento].concat(
								typeof handler_and_args === 'function' ?
									[handler_and_args] : handler_and_args));
					}
				}(EV, DAF.API.eventos));
			} else {
				API[plugin] = DAF.API[plugin];
			}
		}

		/*
		 *	EVENTOS
		 */
		EV.subscribe('inicio', function(){
			console.debug('NUCLEO DE DAF INICIADO');
		});

		// Inicializacion de DAF
		EV.publish('inicio');
		
		return API;
	}

	// FN tiene por defecto un array donde almacenar eventos para lanzar a los subscriptores 
	DAF.API = {eventos:[]};
	DAF.version = "0.3 © Ukem, Datacor.es";

	global.DAF = DAF;

	return DAF;
}(typeof self == 'object' && self.self == self && self));
