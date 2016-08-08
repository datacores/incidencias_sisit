/*
 * Recibe:
 *		contenedor 	-	String. Referencia al lugar donde se generará todo sistema de recorte. 
 *						La imagen cargada para recortar se adaptará al contenedor referenciado
 *		cut_area 	-	Objeto. Para definir el area de recorte, que se situará respecto al contenedor
 *						segun los parametros pasados.
 *						Forma:  {
 *							width:
 *							height:
 *							top:
 *							left:
 *						}
 * 		imagen 		-	Objeto Image de javascript, con un src ya añadido.
 *		callback 	- 	Función a ejecutar tras recortar la imagen, recibe como parametro la imagen recortada
 * 						en base64.
 * un objeto imagen
 */
var EditaImagen = (function(API){

	/**
	 * @contructor
	 *
	 * @param 	{DOMelement}    _contenedor  Lugar donde se cargaran las imagen y el area de recorte
	 * @param 	{Image Object}  _imagen      Imagen en formato Objeto javascript
	 * @param 	{Boolean}       _escalar     Si true, redimensiona manteniendo las proporciones.
	 *                                       Por defecto es true.
	 */
	function EditaImagen(_contenedor, _imagen, _escalar) {
		var that = this;
		this.imagen 	= _imagen;
		this.contenedor = _contenedor;
		this.$contenedor = $(this.contenedor);
		this.escalar 	= _escalar || true;
		this.ver_recorte();
		// No inicia el plugin, si la imagen no se ha cargado aun en el navegador/objeto
		var comprobacion = setInterval(function(){
			if(_imagen.complete){
				clearInterval(comprobacion);
				that.setDefaults();
			}
		},200);	
	}

	EditaImagen.prototype.setDefaults = function(){

		var that = this;

		this.$container;
		// Copia del original, que usaremos para redimensionar
		this.orig_src 	= new Image();
		this.imagen_visible = new Image();
		this.event_state = {};
		
		// Minimos y maximos a partir de los cuales la imagen no se redimensiona
		this.min_width 	= 20;
		this.min_height = 20;
		this.max_width 	= parseInt(this.$contenedor.width())*70/100;
		this.max_height	= parseInt(this.$contenedor.height())*70/100;

		// Elemento canvas para redimensionar.
		this.resize_canvas = document.createElement('canvas');

		this.orig_src.src       = this.imagen.src;
		this.imagen_visible.src = this.imagen.src;
		
		this.$imagen = $(this.imagen);
		this.$imagen.css('opacity', '0.5');

		// Contenedor y manejadores añadidos alrededor de la imagen a recortar
		var css = "position: relative;display: inline-block;box-sizing: content-box;cursor: move;margin: 0 auto;";
		this.$imagen.wrap('<div class="daf_resize-container" style="'+css+'"></div>')
		.before('<span class="daf_resize-handle daf_resize-handle-nw"></span>')
		.before('<span class="daf_resize-handle daf_resize-handle-ne"></span>')
		.after('<span class="daf_resize-handle daf_resize-handle-se"></span>')
		.after('<span class="daf_resize-handle daf_resize-handle-sw"></span>');

		// Asignamos la imagen a recortar junto con el div y los manejadores que la envuelven a una variable.
		this.$container =  this.$imagen.parent('.daf_resize-container');
		// Lo insertamos todo en el contenedor proporcionado por el host.
		$("#recorte_visible").html(this.$container);

		var width_inicial = parseInt(this.$container.width());
		if(width_inicial === 0 || width_inicial > this.max_width || !width_inicial){
			this.resizeImage(this.max_width);
		}
		
		// Añadimos comportamientos a los eventos de los manejadores y la imagen a recortar.
		this.$container.on('mousedown touchstart', '.daf_resize-handle', function(ev){
			that.startResize(ev);
		});

		this.$container.on('mousedown touchstart', 'img', function(ev){
			that.startMoving(ev);
		});	
	}
	
	EditaImagen.prototype.saveEventState = function(e){
		var that = this;
		// Save the initial event details and container state
		that.event_state.container_width = that.$container.width();
		that.event_state.container_height = that.$container.height();
		that.event_state.container_left = that.$container.offset().left; 
		that.event_state.container_top = that.$container.offset().top;
		that.event_state.mouse_x = (e.clientX || e.pageX || e.originalEvent.touches[0].clientX) + $(window).scrollLeft(); 
		that.event_state.mouse_y = (e.clientY || e.pageY || e.originalEvent.touches[0].clientY) + $(window).scrollTop();

		// This is a fix for mobile safari
		// For some reason it does not allow a direct copy of the touches property
		if(typeof e.originalEvent.touches !== 'undefined'){
			that.event_state.touches = [];
			$.each(e.originalEvent.touches, function(i, ob){
				that.event_state.touches[i] = {};
				that.event_state.touches[i].clientX = 0+ob.clientX;
				that.event_state.touches[i].clientY = 0+ob.clientY;
			});
		}

		that.event_state.evnt = e;
	}

	// Ejecuta función redimensionar en respuesta a eventos del ratón
	EditaImagen.prototype.startResize = function(e){
		var that = this;
		e.preventDefault();
		e.stopPropagation();
		this.saveEventState(e);
		$(that.contenedor).on('mousemove touchmove', function(ev){
			that.resizing(ev)
		});
		$(that.contenedor).on('mouseup touchend', function(ev){
			$(that.contenedor).off('mousemove touchmove');
		});
	}

	// Ejecuta función mover en respuesta a eventos del ratón
	EditaImagen.prototype.startMoving = function(e){
		var that = this;
		e.preventDefault();
		e.stopPropagation();
		this.saveEventState(e);
		$(that.contenedor).on('mousemove touchmove', function(ev){
			that.moving(ev);
		});
		$(that.contenedor).on('mouseup touchend', function(ev){
			$(that.contenedor).off('mousemove touchmove');
		});
	}

	EditaImagen.prototype.resizing = function(e){
		var width,height,left,top,
			mouse = {},
			offset = this.$container.offset();

		mouse.x = (e.clientX || e.pageX || e.originalEvent.touches[0].clientX) + $(window).scrollLeft(); 
		mouse.y = (e.clientY || e.pageY || e.originalEvent.touches[0].clientY) + $(window).scrollTop();
		
		// Position image differently depending on the corner dragged and constraints
		if( $(this.event_state.evnt.target).hasClass('daf_resize-handle-se') ){
			width = mouse.x - this.event_state.container_left;
			height = mouse.y  - this.event_state.container_top;
			left = this.event_state.container_left;
			top = this.event_state.container_top;
		} else if($(this.event_state.evnt.target).hasClass('daf_resize-handle-sw') ){
			width = this.event_state.container_width - (mouse.x - this.event_state.container_left);
			height = mouse.y  - this.event_state.container_top;
			left = mouse.x;
			top = this.event_state.container_top;
		} else if($(this.event_state.evnt.target).hasClass('daf_resize-handle-nw') ){
			width = this.event_state.container_width - (mouse.x - this.event_state.container_left);
			height = this.event_state.container_height - (mouse.y - this.event_state.container_top);
			left = mouse.x;
			top = mouse.y;
			if(this.escalar || e.shiftKey){
				top = mouse.y - ((width / this.orig_src.width * this.orig_src.height) - height);
			}
		} else if($(this.event_state.evnt.target).hasClass('daf_resize-handle-ne') ){
			width = mouse.x - this.event_state.container_left;
			height = this.event_state.container_height - (mouse.y - this.event_state.container_top);
			left = this.event_state.container_left;
			top = mouse.y;
			if(this.escalar || e.shiftKey){
				top = mouse.y - ((width / this.orig_src.width * this.orig_src.height) - height);
			}
		}

		// Mantiene el ratio de las dimesiones de la imagen si se pulsa Shift
		if(this.escalar || e.shiftKey)
			height = width / this.orig_src.width * this.orig_src.height;


		if(width > this.min_width && height > this.min_height ){ //&& width < this.max_width && height < this.max_height){
			// To improve performance you might limit how often resizeImage() is called
			this.resizeImage(width, height);  
			// Without this Firefox will not re-calculate the the image dimensions until drag end
			this.$container.offset({'left': left, 'top': top});
		}
	}

	EditaImagen.prototype.resizeImage = function(width, height){
		// Si solo recibe el width, la redimensiona proporcionalmente
		var height = height || width / this.orig_src.width * this.orig_src.height;

		this.resize_canvas.width = width;
		this.resize_canvas.height = height;
		this.resize_canvas.getContext('2d').drawImage(this.orig_src, 0, 0, width, height);   
		this.imagen.src = this.resize_canvas.toDataURL("image/png");  
	}

	EditaImagen.prototype.moving = function(e){
		var that = this,
			mouse={}, 
			touches;
		
		e.preventDefault();
		e.stopPropagation();
		
		touches = e.originalEvent.touches;
		
		mouse.x = (e.clientX || e.pageX || touches[0].clientX) + $(window).scrollLeft(); 
		mouse.y = (e.clientY || e.pageY || touches[0].clientY) + $(window).scrollTop();
		
		this.$container.offset({
			'left': mouse.x - ( that.event_state.mouse_x - that.event_state.container_left ),
			'top': mouse.y - ( that.event_state.mouse_y - that.event_state.container_top ) 
		});

		// Watch for pinch zoom gesture while moving
		if(this.event_state.touches && this.event_state.touches.length > 1 && touches.length > 1){
			var width = this.event_state.container_width, height = this.event_state.container_height;
			var a = this.event_state.touches[0].clientX - this.event_state.touches[1].clientX;
			a = a * a; 
			var b = this.event_state.touches[0].clientY - this.event_state.touches[1].clientY;
			b = b * b; 
			var dist1 = Math.sqrt( a + b );
			
			a = e.originalEvent.touches[0].clientX - touches[1].clientX;
			a = a * a; 
			b = e.originalEvent.touches[0].clientY - touches[1].clientY;
			b = b * b; 
			var dist2 = Math.sqrt( a + b );

			var ratio = dist2 /dist1;

			width  = width * ratio;
			height = height * ratio;
			// To improve performance you might limit how often resizeImage() is called
			//resizeImage(width, height);
		}
	}

	EditaImagen.prototype.recortar = function(tipo, nombre_fichero){
		// Tipo de respuesta, por defecto, base64
		var tipo = (tipo !== undefined && tipo !== 'base64' && tipo !== 'file' && tipo !== 'both') ? 'base64' : tipo;

		if(tipo === 'file')
			nombre_fichero = nombre_fichero || "recorte";
		
		nombre_fichero += ".png";

		//Find the part of the image that is inside the crop box
		var that = this,
			crop_canvas,
			img_b64,
			left   = $('#recorte_visible').offset().left - this.$container.offset().left,
			top    = $('#recorte_visible').offset().top - this.$container.offset().top,
			width  = $('#recorte_visible').width(),
			height = $('#recorte_visible').height();
		
		crop_canvas = document.createElement('canvas');
		crop_canvas.width = width;
		crop_canvas.height = height;
		crop_canvas.getContext('2d').drawImage(that.imagen, left, top, width, height, 0, 0, width, height);
		
		img_b64 = crop_canvas.toDataURL("image/png");
		
		this.ocultar_recorte();
		switch(tipo){
			case 'base64':	
				return img_b64;
				break;
			case 'file':
				return API.dataURItoFile(img_b64, nombre_fichero);
				break;
			case 'both':	
				return [img_b64, API.dataURItoFile(img_b64, nombre_fichero)];
				break;
			default:
				break;
		}
	}

	EditaImagen.prototype.ver_recorte = function(){
		this.$contenedor.css("display", "block");
		$("#recorte_visible").css("display", "block");
	}

	EditaImagen.prototype.ocultar_recorte = function(){
		this.$contenedor.css("display", "block");
		$("#recorte_visible").css("display", "none");
	}

	EditaImagen.prototype.close = function(){
		this.$contenedor.css("display", "none");
		$("#recorte_visible").html("");	
	}

	function dataURItoFile(dataURI) {
	    // convert base64/URLEncoded data component to raw binary data held in a string
	    var byteString;
	    if (dataURI.split(',')[0].indexOf('base64') >= 0)
	        byteString = atob(dataURI.split(',')[1]);
	    else
	        byteString = unescape(dataURI.split(',')[1]);

	    // separate out the mime component
	    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

	    // write the bytes of the string to a typed array
	    var ia = new Uint8Array(byteString.length);
	    for (var i = 0; i < byteString.length; i++) {
	        ia[i] = byteString.charCodeAt(i);
	    }

	    return new File([ia], "recorte.png", {type:mimeString});
	}

	return EditaImagen

}(DAF.API));
	