(function(CORE){
	/*
	 *	CONSTRUCTOR:
	 * 	Parametros:
	 * 		tabla 		  - Id de la tabla sobre la que actua (obligatorio)
	 *		filtros 	  - Si true, implementará filtros por columnas en la tabla
	 *					    Por defecto/omitido false.
	 * 		reordenar 	  - Si true, implemetará reordenacion por columnas en la tabla
	 *					    Por defecto/omitido false.
	 * 		orden_inicial - Si true, ordena ascendete, si false descencente.
	 * 						Por defecto/omitido true.
	 */
	Tabla = function(tabla, filtros, reordenar, orden_inicial){
		var that = this,
			id_padre = $('#'+tabla).parent().attr('id');
		
		// Cargamos estilos de redimension de columnas
		if(id_padre){
			var css_2red = "#"+id_padre+" .rc-handle-container { position: relative; }\
					#"+id_padre+" .rc-handle { position: absolute; width: 7px; cursor: ew-resize; margin-left: -3px; z-index: 2; }\
					#"+id_padre+" table.rc-table-resizing { cursor: ew-resize; }\
					#"+id_padre+" table.rc-table-resizing thead, \
					#"+id_padre+" table.rc-table-resizing thead > th,\
		    		#"+id_padre+" table.rc-table-resizing thead > th > a { cursor: ew-resize; }",
		    	estilo = document.createElement('style');

		    estilo.type="text/css";
		    if(estilo.styleSheet) estilo.styleSheet.cssText = css_2red;
		    else estilo.appendChild(document.createTextNode(css_2red));

			document.getElementsByTagName("head")[0].appendChild(estilo);
		}
		else throw 'La tabla debe de estar dentro de un div con un id.';

		if(!tabla) throw 'Se necesita un identificador de tabla';

		this.filtros = filtros || false;	
		this.reordenar = reordenar || false;
		this.orden = orden_inicial || true;
		this.filas_op_columna = [];

		// Iconos para reordenar por columnas
		this.icono = {
			no_sort:   '<i style="margin-top:2px;font-size:1.3em;cursor:pointer;float:right;color:gainsboro;" class="fa fa-reorder"></i>',
			sort_down: '<i style="margin-top:2px;font-size:1.3em;cursor:pointer;float:right;color:black;" class="fa fa-sort-amount-desc"></i>',
			sort_up:   '<i style="margin-top:2px;font-size:1.3em;cursor:pointer;float:right;color:black;" class="fa fa-sort-amount-asc"></i>'
		}
		
		this.$tabla = $('#'+tabla);
		this.tpl_registro  = false; // Propiedad que almacena la plantilla de un registro
		this.ancho_tabla = 0;
		this.num_columnas = 0;
		this.ids_columnas = [];
		this.$cuerpo = $(this.$tabla.find('tbody')[0]);
		this.tr = $('tr');
		this.$tabla.parent().css({
			'width': '100%',
			'overflow': 'auto'
		});

		// Propiedad que almacena el nombre del campo que identifica cada fila (para interactuar con datos)
		this.identificador = false;
		// Variable que toma el valor de una celda al seleccionarla
		this.valor_celda_focus = false;

		/* 
		 * Metodos que operan sobre los registros y que normalmente
		 * deben de implementarse desde la instancia del objeto Tabla,
		 * que es el unico que ya puede tener referencia a los datos de la tabla.
		 */
		 	// Si cambia una celda
			this.cambia_celda = function(celda){
				console.log('CALLBACK POR DEFECTO');
				console.log('Ha cambiado la celda:');
				console.debug(celda);
			}
			// Si cambia el valor de un filtro
			this.cambia_filtro = function(input_filtro){
				var col_input = $(input_filtro)
					id_columna = col_input.attr('data-filtro-id'),
					val_columna = col_input.val();

				console.log('Orden de filtrar columna '+id_columna+' por valor:')
				console.debug(val_columna);
			}
			/* 
			 * Si se pulsa sobre el icono reordenar de una columna, se ejecuta prototype.reordenar_xcolumna y 
			 * dentro del mismo se ejecuta reordena_columna, despues gestionar los iconos.
			 * Este metodo es el que realmente reordena los datos y debe ser implementado en la instancia de Tabla,
			 * ya que Tabla no gestiona datos, y se limita a decir al host que se ha pulsado reordenar datos.
			 */
			this.reordena_columna = function(columna){
				console.log('Orden de reordenar por columna '+columna+' :');
				console.log('Orden: '+this.orden);
			}

		this.procesar_tabla();
		this.get_tpl_registro();		
	}

	/*
	 * Este metodo es el que reacciona al evento reordenar, gestionando los iconos y ejecutando luego
	 * el metodo reordenar_columna, asociado al evento.
	 */
	Tabla.prototype.reordenar_xcolumna = function(columna){
		// Gestionamos los iconos de reordenar
		var that = this;
		_.each(this.$tabla.find('tr:nth-child(1) th i'), function(icon){
			$icon = $(icon);
			if($icon.parent().attr('data-id') == columna){
				if(icon.outerHTML == that.icono.no_sort) that.orden = true;
				if(that.orden) $icon.replaceWith(that.icono.sort_up);
				else $icon.replaceWith(that.icono.sort_down);
				that.orden = !that.orden;
			} else {
				$icon.replaceWith(that.icono.no_sort);
			}
		});

		// Lanzamos función asociada a reordenar
		this.reordena_columna(columna);
		// Como hemos cambiado los objetos DOM de iconos, reimplementamos reordenar
		this.implementa_reordenar();
	}

	/*
	 * Lee todos los th del primer thead tr, y recoge 
	 * los siguientes datos datos de la tabla:
	 * 		Numero de columnas
	 * 		Ancho total de la tabla (si se lo aplica)
	 *		Ids de las columnas ( se usará este id para comunicarse con el servidor)
	 */
	Tabla.prototype.procesar_tabla = function(){
		var that = this,
			th_filtros = this.filtros ? '<tr>': false,
			ud_ancho = ""; // Hay que usar las mismas unidades de medida para el ancho de toda la tabla: px o %.
		
		// Inicializa propiedades implicadas
		this.num_columnas = 0;
		this.ids_columnas = [],
		this.columnas_editables = [];
		// Array de metodos que se pueden setear, para ser usados dentro de la instancia del objeto.
		this.metodos = []; 

		// Recoge valores
		$.each(this.$tabla.find('tr:nth-child(1) th'), function(){
			var id_columna 		 = this.getAttribute('data-id'),
				// Campo que filtra, cuando difiere del id de la columna.
				campo_filtro	 = this.getAttribute('data-campo-filtro') || false,
				// Switch ver / no ver filtro
				ver_filtro 		 = this.getAttribute('data-sin_filtro') || false,
				columna_editable = this.getAttribute('data-editable') || false,
				ancho_celda      = $(this).attr('width');
			
			if(ancho_celda){
				ud_ancho  = ancho_celda.search('%') > -1 ? '%' : 'px';
				ancho_celda = parseInt(ancho_celda);
			} else {
				ancho_celda = 0;
				ud_ancho = "";
			}

			if(that.reordenar && id_columna)
				$(this).append(that.icono.no_sort);

			that.num_columnas++;
			that.ids_columnas.push(id_columna);
			that.columnas_editables.push(columna_editable);
			
			that.ancho_tabla += !isNaN(ancho_celda) ? ancho_celda : 0;
			
			if(th_filtros)
				if(id_columna && !ver_filtro)
					if(!campo_filtro)
						th_filtros += '<th><input data-filtro-id="'+id_columna+'" style="width:100%" value=""/></th>';
					else
						th_filtros += '<th><input data-filtro-id="'+campo_filtro+'" style="width:100%" value=""/></th>';
				else
					th_filtros += '<th></th>';
		});

		// Implementación de filtros por columnas
		if(this.filtros){
			th_filtros += '</tr>';
			this.$tabla.find('thead').append(th_filtros);
			this.$tabla.find('thead tr:nth-child(2) input').on('keyup', function(ev){
				if(espera) clearTimeout(espera);
				var espera = setTimeout(function(){
					that.cambia_filtro($(ev.currentTarget));
				}, 500);
			});
		}

		// Implementación de reordenar por columnas
		if(this.reordenar) this.implementa_reordenar();
			

		/* Aplica el ancho total a la tabla.
		 * Si no se hace con .attr('style'), no se aplica el ancho, debido al css de bootstrap.
		 */
		var ancho_padre = parseInt(this.$tabla.parent().css('width').replace("px",""));
		if(ancho_padre > parseInt(this.ancho_tabla)) this.ancho_tabla = (ancho_padre-20)+"";
		
		this.$tabla.attr('style', "width:"+this.ancho_tabla+ud_ancho+";");
	}

	Tabla.prototype.implementa_reordenar = function(){
		var that  = this;
		this.$tabla.find('tr:nth-child(1) th > i').off('click');
		this.$tabla.find('tr:nth-child(1) th > i').on('click', function(ev){
			that.reordenar_xcolumna($(ev.currentTarget).parent().attr('data-id'));
		});
	}

	/*
	 * Coge el primer tr del tbody y lo usa como plantilla underscore para los registros, 
	 * para cuando se vayan añadiendo registros.
	 * Una vez convertido en plantilla elimina el tr usado como modelo.
	 * La plantilla underscore resultante, se almacena en tpl_registro.
	 * Esta plantilla no contiene, ni trabaja con datos, solo referencias a datos que se compilaran con
	 * los datos pasados a la plantilla.
	 */
	Tabla.prototype.get_tpl_registro = function(){

		var that = this,
			celdas = this.$tabla.find('tbody tr:nth-child(1) td'),
			tpl = '<tr>';

		$.each(celdas, function(key){

			// Saber si es un objeto html o un string
			var obj = CORE.str_to_htmlObj(this.innerHTML);

			if(!that.columnas_editables[key])
				tpl += that.get_celda('celda', '<%='+that.ids_columnas[key]+'%>', key);
			else {
				switch(CORE.tipo(obj)){
					case 'HTMLInputElement':
						if(obj.type === 'checkbox')
							tpl += that.get_celda('checkbox', that.ids_columnas[key], key);
						break;
					case 'HTMLSelectElement':
						tpl += that.get_celda('select', [this.innerHTML,that.ids_columnas[key]], key);
						break;
					case 'String':
						tpl += that.get_celda('input', '<%='+that.ids_columnas[key]+'%>', key);
						break;
					case 'HTMLDivElement':
						tpl += that.get_celda('html', this.outerHTML , key);
						break;
					default:
						tpl += that.get_celda('input', '<%='+that.ids_columnas[key]+'%>', key);
						break;
				}
			}
		});

		tpl += '</tr>';
		this.tpl_registro = _.template(tpl);

		// Quitamos el usado como molde
		this.$tabla.find('tbody tr:nth-child(1)').remove();	
	}
	
	/*
	 *	Devuelve una celda de la tabla.
	 * 	Por ahora solo admite tres tipos de celda: input, select y checkbox.
	 * 	Si no es una de estas tres, devuelve una celda tipo input.
	 */
	Tabla.prototype.get_celda = function(tipo, val_celda, columna){
		var val_celda = val_celda || '',
			that = this;
		switch(tipo){
			case 'celda':
				return  '<td><span identificador="<%=_identificador%>" fila="<%=_fila_registro%>" columna="'+columna+'" style="width:100%">'+val_celda+'</span>';
				break;
			case 'input':
				return  '<td><input identificador="<%=_identificador%>" fila="<%=_fila_registro%>" columna="'+columna+'" style="width:100%" value="'+val_celda+'"/></td>';
				break;
			case 'select':
				var select = '<td><select identificador="<%=_identificador%>" fila="<%=_fila_registro%>" columna="'+columna+'" style="width:100%;">';

				$.each($(val_celda[0]).find('option'), function(){
					select += '<option data-valor="<%='+val_celda[1]+'%>" value="'+this.value+'" <% if('+val_celda[1]+' == "'+this.value+'"){ print("selected"); } %> >'+this.innerHTML+'</option>';	
				});

				return select+'</select></td>';
				break;
			case 'checkbox':
				return	'<td><input identificador="<%=_identificador%>" fila="<%=_fila_registro%>" columna="'+columna+'" type="checkbox" <% if('+val_celda+' == 1){ print("checked") } %> style="width: 100%;text-align: center; vertical-align: middle">';
				break;
			case 'html':
				/*
				 * Si se encuentra un div dentro de un td, se coge todo el html, y se sustituye todos los
				 * data-id="nombre_propiedad" por data-id="<%=nombre_propiedad%>" y todos los 
				 * data-codigo="codigo_javascript" por data-codigo="<% codigo_javascript %>"
				 * Si atributo es html, se inserta dentro del tag (innerHTML).
				 */
				var $html          = $(val_celda),
					$objs_w_ids    = $html.find('[data-id]'),
					$objs_w_cdgo   = $html.find('[data-codigo]'),
					$objs_w_html   = $html.find('[data-html]'),
					$append_valor  = $html.find('[data-append_valor]'),
					$prepend_valor = $html.find('[data-prepend_valor]');

				/*
				 * Reformatea data-id="valor" a data-id="<%=valor%>"
				 */
				$.each($objs_w_ids, function(){
					$(this).attr('data-id', '<%='+$(this).attr('data-id')+'%>');
				});

				/*
				 * Interpreta el contenido de una celda, que tenga el atributo data-codigo,
				 * como codigo, y lo inserta.
				 */
				$.each($objs_w_cdgo, function(){
					if($(this).attr('data-codigo')){
						var codigo = $(this).html();
						$(this).removeAttr('data-codigo');
						$(this).html('<%'+codigo+'%>');
					}
				});

				/*
				 * Añade valores al final del objeto HTML
				 */
				$.each($append_valor, function(){
					$(this).append('<%='+$(this).attr('data-append_valor')+'%>');
				});

				/*
				 * Añade valores al principio del objeto HTML
				 */
				$.each($prepend_valor, function(){
					$(this).append('<%='+$(this).attr('data-prepend_valor')+'%>');
				});

				/*
				 * Inserta HTML
				 */
				$.each($objs_w_html, function(){
					$(this).html('<%='+this+'%>');
				});

				return $html[0].outerHTML.replace('&lt;', '<').replace('&gt;', '>');
				break;
			default:
				return  '<td><input identificador="<%=_identificador%>" fila="<%=_fila_registro%>" columna="'+columna+'" style="width:100%" value="'+val_celda+'"/></td>';
				break;
		}
	}

	/*
	 * Crea un nuevo metodo en la tabla
	 */
	Tabla.prototype.set_metodo = function(nombre, metodo){
		if(_.isFunction(metodo)) Tabla.prototype[nombre] = metodo;
	}

	/*
	 * Carga un array de registros(objetos), en la tabla, 
	 * usando la plantilla underscore.
	 * Parametros:
	 * registros a cargar, 
	 * nombre del campo a usar como id (para actualizar celdas, etc..),
	 * y función callback.
	 */
	Tabla.prototype.carga_registros = function(registros, campo_id, callback){
		var that = this, 
			callback = callback || function(){
					console.debug('REGISTROS CARGADOS');
				},
			campo_id = campo_id || false;

		this.identificador = campo_id;
		
		// Vaciamos el cuerpo
		this.$cuerpo.html('');

		// Cargamos los registros en la tabla con su plantilla
		$.each(registros, function(key){
			this._fila_registro = key;
			if(campo_id) this._identificador = registros[key][campo_id];
			that.$cuerpo.append(that.tpl_registro(this));
		});

		// Cargamos filas de operaciones poir columnas si las hubiera
		while(this.filas_op_columna.length > 0){
			var $tr = $('<tr></tr>'),
				op = this.filas_op_columna.shift();
			$.each(this.$tabla.find('tr:nth-child(1) th'), function(){
				var id_columna = this.getAttribute('data-id');
				if(op.cols.lastIndexOf(id_columna) > -1){
					var valor = op.oper(id_columna);
					$tr.append('<td><input data-op-columna="'+id_columna+'" style="background-color:lightcyan;width:100%" value="'+valor+'"/></td>');
				} else {
					$tr.append('<td></td>');
				}
			});
			that.$cuerpo.append($tr);
		}

		this.comportamientos();
		callback();
	}

	/*
	 * Implementa comportamientos en la tabla una vez creada.
	 */
	Tabla.prototype.comportamientos = function(){
		var that = this;

		// Permite moverse por la tabla con los cursores
		this.$cuerpo.off('keydown');
		this.$cuerpo.on('keydown', function(e){
			//e.preventDefault();

			var foco = document.activeElement,
				f  = parseInt(foco.getAttribute('fila')),
				c  = parseInt(foco.getAttribute('columna')),
				fo = f,
				co = c; 

			switch(e.keyCode){
				case 37: c--; break; // Izquierda
				case 39: c++; break; // Derecha
				case 38: f--; break; // Arriba
				case 40: f++; break; // Abajo
				default: 
					return e;
					break;
			}

			var target;
			
			function es_select(el){
				if(CORE.tipo(el[0]) == 'HTMLSelectElement') return true;
				else return false;
			}

			function salta_celda(){
				if(f > fo){ fo = f; f++; }
				else if(f < fo){ fo = f; f--; }
				else if(c > co){ co = c; c++; }
				else if(c < co){ co = c; c--; }

				set_target();
			}

			function set_target(){
				target = that.$cuerpo.find('*[fila='+f+'][columna='+c+']');
				if(es_select(target)) salta_celda();
			}

			set_target();
			target.focus();
		});
		
		this.$cuerpo.off('focus', 'input');
		this.$cuerpo.on('focus', 'input', function(){
			that.valor_celda_focus = this.value;
		});

		this.$cuerpo.off('change', 'input');
		this.$cuerpo.on('change', 'input', function(){ 
			that.cambiar_celda(this);
		});
		this.$cuerpo.off('change', 'select');
		this.$cuerpo.on('change', 'select', function(){ that.cambiar_celda(this); });

		this.ColumnasRedimensionables(this.$tabla);
	}

	/*
	 * Ejecuta lógica asociada a cambiar celda y el callback dado por el usuario (cambia_celda)
	 */
	Tabla.prototype.cambiar_celda = function(obj_celda){

		var columna_num = $(obj_celda).attr('columna');

		var obj_datos = {
			columna: 			  $(this.$tabla.find('thead tr:nth-child(1) th')[columna_num]).attr('data-id'),
			valor_anterior: 	  this.valor_celda_focus,
			valor_actual: 		  $(obj_celda).val()
		}

		obj_datos[this.identificador] =  $(obj_celda).attr('identificador');

		// El if evita que actue sobre filtros
		if(!isNaN(parseInt($(obj_celda).attr('fila')))){
			this.cambia_celda(
				obj_celda, // Celda ( del DOM)
				obj_datos,
				$(obj_celda).attr('fila'), // fila
				columna_num // columna
			);
		}
	}

	/*
	 * Determina el comportamiento a seguir cuando cambie una celda.
	 * Recibe como parametro una funcion callback. 
	 * Cuando el plugin lanza este metodo, le pasa los siguientes parametros:
	 * columna_id, DOM del la celda, fila y columna
	 */
	Tabla.prototype.set_cambia_celda = function(cambia_celda){
		if(_.isFunction(this.cambia_celda)) this.cambia_celda = cambia_celda;
	}

	/*
	 * Determina el comportamiento a seguir cuando cambie un filtro de columna.
	 * Recibe como parametro una funcion callback, que a su vez recibirá
	 * como parametro el objeto html del filtro que ha cambiado.
	 */
	Tabla.prototype.set_cambia_filtro = function(cambia_filtro){
		this.cambia_filtro = cambia_filtro;
	}

	/*
	 * Determina el comportamiento a seguir cuando pulse el icono de reordenar 
	 * de una columna.
	 * Recibe como parametro una funcion callback, que a su vez recibirá
	 * como parametro el objeto html de la columna que hay que reordenar.
	 */
	Tabla.prototype.set_reordenar = function(reordenar){
		this.reordena_columna = reordenar;
	}

	/*
	 * Inserta un columna que ejecutará una operacion, con las columnas pasadas.
	 * Parametros:
	 * id 		- Indentificador de la operación por si hay varias en una tabla.
	 * cols 	- Array con los nombres de las columnas sobre las que se operará.
	 * oper 	- Función que operarara sobre las columnas.
	 * pos 		- (PTE implementar completamente) Posición donde se insertara la fila, por defecto al final(false).
	 * 			
	 */
	Tabla.prototype.set_fila_op_columna = function(cols, operacion, pos){
		
		var tmp_obj = {
				pos: pos || false,
				cols: cols,
				oper: operacion
			}

		if(_.isArray(cols) && cols.length > 0 && _.isFunction(operacion))
			this.filas_op_columna.push(tmp_obj);
		else {
			console.log('Error en los parametros pasados a set_fila_op_columna.');
			console.log('Parametros pasados:');
			console.debug(tmp_obj);
		}
	}

	/*
	 * Función que devuelve el nombre que corresponde a una determinada columna
	 */
	Tabla.prototype.get_nombre_columna = function(columna){
		var campos = this.$tabla.find('thead > tr:nth-child(1) > th');
		return $(campos[columna]).attr('data-id');
	}

	// METODOS PRIVADOS
	Tabla.prototype.ColumnasRedimensionables = function($table, options, filtros){
		
		// Para que coincida con el rc-handle-container
		$table.css('margin-top', '0px');

		//_classCallCheck(this, ResizableColumns);
		_constants = {
			DATA_API : 				 'resizableColumns',
			DATA_COLUMNS_ID : 		 'resizable-columns-id',
			DATA_COLUMN_ID : 		 'resizable-column-id',
			DATA_TH : 				 'th',
			CLASS_TABLE_RESIZING : 	 'rc-table-resizing',
			CLASS_COLUMN_RESIZING :  'rc-column-resizing',
			CLASS_HANDLE : 			 'rc-handle',
			CLASS_HANDLE_CONTAINER : 'rc-handle-container',
			EVENT_RESIZE_START : 	 'column:resize:start',
			EVENT_RESIZE : 			 'column:resize',
			EVENT_RESIZE_STOP : 	 'column:resize:stop',
			SELECTOR_TH : 			 'tr:nth-child(1) > th:visible',
			SELECTOR_TD : 			 'tr:first > td:visible',
			SELECTOR_UNRESIZABLE : 	 '[data-noresize]'
		}

		// Si la tabla tiene filtros
		//if(this.filtros) _constants.SELECTOR_TH = 'tr:nth-child(2) > th:visible';

		this.ColumnasRedimensionables.defaults = {
			selector: function selector($table) {
				if ($table.find('thead').length) {
					return _constants.SELECTOR_TH;
				}

				return _constants.SELECTOR_TD;
			},
			store: window.store,
			syncHandlers: true,
			resizeFromBody: true,
			maxWidth: null,
			minWidth: 0.01
		};

		this.refreshHeaders = function() {
			// Allow the selector to be both a regular selctor string as well as
			// a dynamic callback
			var selector = this.options.selector;
			if (typeof selector === 'function') {
				selector = selector.call(this, this.$table);
			}

			// Select all table headers
			this.$tableHeaders = this.$table.find(selector);

			// Assign percentage widths first, then create drag handles
			this.assignPercentageWidths();
			this.createHandles();
		}

		this.createHandles = function() {
			var _this = this;

			var ref = this.$handleContainer;
			if (ref != null) {
				ref.remove();
			}

			this.$handleContainer = $('<div style="margin-top:'+this.margin_top+'" class=\'' + _constants.CLASS_HANDLE_CONTAINER + '\' />');
			this.$table.before(this.$handleContainer);

			this.$tableHeaders.each(function (i, el) {
				var $current = _this.$tableHeaders.eq(i);
				var $next = _this.$tableHeaders.eq(i + 1);

				if ($next.length === 0 || $current.is(_constants.SELECTOR_UNRESIZABLE) || $next.is(_constants.SELECTOR_UNRESIZABLE)) {
					return;
				}

				var $handle = $('<div class=\'' + _constants.CLASS_HANDLE + '\' />').data(_constants.DATA_TH, $(el)).appendTo(_this.$handleContainer);
			});

			this.bindEvents(this.$handleContainer, ['mousedown', 'touchstart'], '.' + _constants.CLASS_HANDLE, this.onPointerDown.bind(this));
		}

		this.assignPercentageWidths = function() {
			var that = this;

			this.$tableHeaders.each(function (_, el) {
				var $el = $(el);
				that.setWidth($el[0], $el.outerWidth() / that.$table.width() * 100);
			});
		}

		this.syncHandleWidths = function(){
			var that = this;

			var $container = this.$handleContainer;

			$container.width(this.$table.width());

			$container.find('.' + _constants.CLASS_HANDLE).each(function (_, el) {
				var $el = $(el);

				var height = that.options.resizeFromBody ? that.$table.height() : that.$table.find('thead').height();

				var left = $el.data(_constants.DATA_TH).outerWidth() + ($el.data(_constants.DATA_TH).offset().left - that.$handleContainer.offset().left);

				$el.css({ left: left, height: height });
			});
		}

		this.saveColumnWidths = function(){
			var that = this;

			this.$tableHeaders.each(function (_, el) {
				var $el = $(el);

				if (that.options.store && !$el.is(_constants.SELECTOR_UNRESIZABLE)) {
					that.options.store.set(that.generateColumnId($el), that.parseWidth(el));
				}
			});
		}

		this.restoreColumnWidths = function(){
			var that = this;

			this.$tableHeaders.each(function (_, el) {
				var $el = $(el);

				if (that.options.store && !$el.is(_constants.SELECTOR_UNRESIZABLE)) {
					var width = that.options.store.get(that.generateColumnId($el));

					if (width != null) {
						that.setWidth(el, width);
					}
				}
			});
		}

		this.onPointerDown = function(event){
			// Only applies to left-click dragging
			if (event.which !== 1) {
				return;
			}

			if (this.operation) {
				this.onPointerUp(event);
			}

			// Ignore non-resizable columns
			var $currentGrip = $(event.currentTarget);
			if ($currentGrip.is(_constants.SELECTOR_UNRESIZABLE)) {
				return;
			}

			var gripIndex = $currentGrip.index();
			var $leftColumn = this.$tableHeaders.eq(gripIndex).not(_constants.SELECTOR_UNRESIZABLE);
			var $rightColumn = this.$tableHeaders.eq(gripIndex + 1).not(_constants.SELECTOR_UNRESIZABLE);

			var leftWidth = this.parseWidth($leftColumn[0]);
			var rightWidth = this.parseWidth($rightColumn[0]);

			this.operation = {
				$leftColumn: $leftColumn, $rightColumn: $rightColumn, $currentGrip: $currentGrip,

				startX: this.getPointerX(event),

				widths: {
					left: leftWidth,
					right: rightWidth
				},
				newWidths: {
					left: leftWidth,
					right: rightWidth
				}
			};

			this.bindEvents(this.$ownerDocument, ['mousemove', 'touchmove'], this.onPointerMove.bind(this));
			this.bindEvents(this.$ownerDocument, ['mouseup', 'touchend'], this.onPointerUp.bind(this));

			this.$handleContainer.add(this.$table).addClass(_constants.CLASS_TABLE_RESIZING);

			$leftColumn.add($rightColumn).add($currentGrip).addClass(_constants.CLASS_COLUMN_RESIZING);

			this.triggerEvent(_constants.EVENT_RESIZE_START, [$leftColumn, $rightColumn, leftWidth, rightWidth], event);

			event.preventDefault();
		}

		this.onPointerMove  = function(event) {
			var op = this.operation;
			if (!this.operation) {
				return;
			}

			var difference = (this.getPointerX(event) - op.startX) / this.$table.width() * 100;
			if (difference === 0) {
				return;
			}

			var leftColumn = op.$leftColumn[0];
			var rightColumn = op.$rightColumn[0];
			var widthLeft = undefined,
			    widthRight = undefined;

			if (difference > 0) {
				widthLeft = this.constrainWidth(op.widths.left + (op.widths.right - op.newWidths.right));
				widthRight = this.constrainWidth(op.widths.right - difference);
			} else if (difference < 0) {
				widthLeft = this.constrainWidth(op.widths.left + difference);
				widthRight = this.constrainWidth(op.widths.right + (op.widths.left - op.newWidths.left));
			}

			if (leftColumn) {
				this.setWidth(leftColumn, widthLeft);
			}
			if (rightColumn) {
				this.setWidth(rightColumn, widthRight);
			}

			op.newWidths.left = widthLeft;
			op.newWidths.right = widthRight;

			return this.triggerEvent(_constants.EVENT_RESIZE, [op.$leftColumn, op.$rightColumn, widthLeft, widthRight], event);
		}

		this.onPointerUp = function(event){
			var op = this.operation;
			if (!this.operation) {
				return;
			}

			this.unbindEvents(this.$ownerDocument, ['mouseup', 'touchend', 'mousemove', 'touchmove']);

			this.$handleContainer.add(this.$table).removeClass(_constants.CLASS_TABLE_RESIZING);

			op.$leftColumn.add(op.$rightColumn).add(op.$currentGrip).removeClass(_constants.CLASS_COLUMN_RESIZING);

			this.syncHandleWidths();
			this.saveColumnWidths();

			this.operation = null;

			return this.triggerEvent(_constants.EVENT_RESIZE_STOP, [op.$leftColumn, op.$rightColumn, op.newWidths.left, op.newWidths.right], event);
		}

		this.destroy = function(){
			var $table = this.$table;
			var $handles = this.$handleContainer.find('.' + _constants.CLASS_HANDLE);

			this.unbindEvents(this.$window.add(this.$ownerDocument).add(this.$table).add($handles));

			$handles.removeData(_constants.DATA_TH);
			$table.removeData(_constants.DATA_API);

			this.$handleContainer.remove();
			this.$handleContainer = null;
			this.$tableHeaders = null;
			this.$table = null;

			return $table;
		}

		this.bindEvents = function($target, events, selectorOrCallback, callback) {
			if (typeof events === 'string') {
				events = events + this.ns;
			} else {
				events = events.join(this.ns + ' ') + this.ns;
			}

			if (arguments.length > 3) {
				$target.on(events, selectorOrCallback, callback);
			} else {
				$target.on(events, selectorOrCallback);
			}
		}

		this.unbindEvents = function($target, events) {
			if (typeof events === 'string') {
				events = events + this.ns;
			} else if (events != null) {
				events = events.join(this.ns + ' ') + this.ns;
			} else {
				events = this.ns;
			}

			$target.off(events);
		}

		this.triggerEvent = function(type, args, originalEvent){
			var event = $.Event(type);
			if (event.originalEvent) {
				event.originalEvent = $.extend({}, originalEvent);
			}

			return this.$table.trigger(event, [this].concat(args || []));
		}

		this.generateColumnId = function($el){
			return this.$table.data(_constants.DATA_COLUMNS_ID) + '-' + $el.data(_constants.DATA_COLUMN_ID);
		}

		this.parseWidth = function(element) {
			return element ? parseFloat(element.style.width.replace('%', '')) : 0;
		}

		this.setWidth = function(element, width) {
			width = width.toFixed(2);
			width = width > 0 ? width : 0;
			element.style.width = width + '%';
		}

		this.constrainWidth = function(width) {
			if (this.options.minWidth != undefined) {
				width = Math.max(this.options.minWidth, width);
			}

			if (this.options.maxWidth != undefined) {
				width = Math.min(this.options.maxWidth, width);
			}

			return width;
		}
		
		this.getPointerX = function(event) {
			if (event.type.indexOf('touch') === 0) {
				return (event.originalEvent.touches[0] || event.originalEvent.changedTouches[0]).pageX;
			}
			return event.pageX;
		}

		this.ns = '.rc' + this.count++;

		this.options = $.extend({}, this.ColumnasRedimensionables.defaults, options);
		this.$window = $(window);
		this.$ownerDocument = $($table[0].ownerDocument);
		this.$table = $table;

		this.refreshHeaders();
		this.restoreColumnWidths();
		this.syncHandleWidths();

		this.bindEvents(this.$window, 'resize', this.syncHandleWidths.bind(this));

		if (this.options.start) {
			this.bindEvents(this.$table, _constants.EVENT_RESIZE_START, this.options.start);
		}
		if (this.options.resize) {
			this.bindEvents(this.$table, _constants.EVENT_RESIZE, this.options.resize);
		}
		if (this.options.stop) {
			this.bindEvents(this.$table, _constants.EVENT_RESIZE_STOP, this.options.stop);
		}
	}

	return Tabla;
}(DAF.API));