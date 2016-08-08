(function(CORE){
 	
 	// Devuelve true o false, si la ruta existe
	CORE.existe_url = function(url){
	    var http = new XMLHttpRequest();
	    http.open('HEAD', url, false);
	    http.send();
	    return http.status != 404;
	};
	
	/*
	 * Metodo para hacer peticiones al servidor
	 * Parametros:
	 *		0-metodo, 1-ruta, 2-datos, 3-formato_datos, 4-callback-OK, 5-callback-ERROR, 6-Callback-Petición
	 */
	CORE.peticion = function(){
		var p = Array.prototype.slice.call(arguments, 0);
		
		var	metodo = p[0],
			ruta = p[1],
			datos = p[2] || {},
			formato_datos = p[3] || 'json',
			callback_OK = typeof p[4] === 'function' ? p[4] : function(rsp){ 
				console.log('Respuesta Peticion:');
				console.debug(rsp);
			},
			callback_ERROR = typeof p[5] === 'function' ? p[5] : function(error){
				console.log('\nRuta:');
				console.debug(ruta);
				console.log('Metodo:');
				console.debug(metodo);
				console.log('Formato:');
				console.debug(formato_datos);
				console.log('Datos');
				console.debug(datos);
				console.debug('\n\n');
				console.debug(error);	
			},
			callback = typeof p[6] === 'function' ? p[6] : function(){
			};

		if(!_.isObject(datos)) datos = JSON.stringify(datos);

		$.ajax({
			url: ruta,
			type: metodo,
			dataType: formato_datos,
			data: datos,
			statusCode: {
				404: function(){
					callback_ERROR("El servidor no ha recibido un valor valido, \
						de un elemento necesario para completar la petición.<br/>");
				},
				500: function(){
					callback_ERROR("Error en la respuesta del servidor<br/>");
				}
			}
		})
		.done(function(respuesta){ callback_OK(respuesta); })
		.fail(function(error){	callback_ERROR(error); })
		.always(function(){ callback();	});
	}

	// Metodo que permite cargar css y javascript en el head, incluso despues de haber cargado la pagina
	CORE.carga_2head = function(fichero, tipo, ambito){
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

}(DAF.API)); 	