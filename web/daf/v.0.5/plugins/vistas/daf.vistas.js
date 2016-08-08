var Vista = (function(){
	
	// Constructor
	Vista = function(template, callback, contenedor, insertar, posicion){
		var that = this;
		/* 
		 * Puede recibir un template underscore o una url de la que obtener 
		 * una plantilla html que será convertida a underscore
		 */
		if(_.isObject(template)) this.template   = template;
		else {
			$.ajax({
				url: template,
				type: 'GET',
				dataType: 'html',
				async: false
			})
			.done(function(respuesta) {
				that.template = respuesta;
			})
			.fail(function(error) {
				console.log(error);
			});
		}
		/*
		 * Función que procesa los datos al setearlos.
		 * Normalmente , para adaptar o formatear los datos antes de la vista
		 */
		this.preprocesa_datos = function(datos){
			return datos;
		}

		/* 
		 * Callback despues de renderizar. 
		 * Este callback se puede usar como controlador de la vista.
		 */
		this.callback   = callback; 
		this.contenedor = contenedor;
		/*
		 * this.insertar, determina como se inserta la vista o parcial.
		 * si false, sustituye la vista en el contendor.
		 * si append, la añade al final
		 * si prepend, la añade al principio
		 */
		this.insertar = insertar || false; 
		this.posicion   = posicion;
	}

	/*
	 * Recupera los datos de la vista usados para renderizar.
	 */
	Vista.prototype.get_datos = function(){
		return this.datos;
	}

	Vista.prototype.set_datos = function(datos){
		this.datos = _.isObject(datos) ? this.preprocesa_datos(datos) : {};
	}
	
	Vista.prototype.extender_datos = function(nuevos_datos){
		_.extend(this.datos, nuevos_datos);
	}

	Vista.prototype.set_preprocesa_datos = function(fx){
		if(_.isFunction(fx)) this.preprocesa_datos = fx;
	}

	Vista.prototype.set_callback = function(callback){
		if(typeof callback === 'function') this.callback = callback;
		else console.debug('Parametro callback necesita una función. Parametro pasado:\n'+callback);
	}

	Vista.prototype.extender_callback = function(nuevo_callback){
		_.extend(this.callback, nuevo_callback);
	}

	Vista.prototype.set_posicion = function(posicion){
		this.posicion = posicion;
	}
	
	/*
	 * Crea un plantilla underscore con el HTML de la vista y la
	 * enlaza con los datos de la vista, devolviendo el HTML resultante.
	 */
	Vista.prototype.enlazar = function(){
		var plantilla = _.template(this.template);
		return plantilla(this.datos);
	}

	Vista.prototype.render = function(datos, insertar){

		var that = this,
			datos = datos || this.datos,
			insertar = (insertar === 'append' || insertar === 'prepend') ? insertar : this.insertar;


		this.datos = datos;
		this.insertar = insertar;
		
		switch(insertar){
			case 'append':
				this.contenedor.append(that.enlazar(datos));
				break;
			case 'prepend':
				this.contenedor.prepend(that.enlazar(datos));
				break;
			case false:
				this.contenedor.html('');
				this.contenedor.html(that.enlazar(that.preprocesa_datos(datos)));
				break;
		}
		
		/*
		 * En la ejecución del callback, le pasamos como parametros los datos que tenga la vista
		 * y la instancia de la vista.
		 */
		if(typeof this.callback === 'function') this.callback(datos, this);
		else if(this.callback !== false ) 
			console.debug('Parametro callback necesita una función. Parametro pasado:\n'+this.callback);
	}

	Vista.prototype.set_html = function(accion, html){
		switch(accion){
			case 'append':
				this.template.append(html);
				break;
			case 'prepend':
				this.template.prepend(html);
				break;
			default:
				break;
		}
	}

	return Vista;
}());