/* Dependencias:
	daf.validar.js
*/
(function(API){

    // Metodos y propiedades Privados
    var $c, // Para guardar el objeto contenedor
    	// Colores de fondo de las celdas
    	c_error    = "#fdd",
    	c_activo   = "#fff",
    	c_inactivo = "#f3f3f3",
    	c_valido   = "#dfd";

    /*
     * Crea una consulta. Una consulta es solo un grupo de filtros gestionables facilmente
     * mediante un grid, al estilo de access. 
     * Una consulta necesita los siguientes parametros:
     * contenedor - objeto HTML donde se insertará el grid de consulta
     * campos     - Nombres de campos usados para construir los filtros
     * url  	  - URL que se usará para el CRUD de consultas
     * ejecutar   - Función que se ejecutará cada vez que se pulse ejecutar	
     */
	Consulta = function(contenedor, campos, url, ejecutar){
		var that = this;
		this.contenedor = contenedor || 'body';
		$c = _.isObject(this.contenedor) ? this.contenedor : $(this.contenedor);
		this.ancho_tabla = 71;   // Ancho inicial = ancho etiquetas en css
		this.ancho       = 150;	 // Ancho de las columnas
		this.ult_columna = 0;    // Última columna
		this.activa		 = false; // true si hay alguna consulta activa para aplicar
		/*
		 * Array para almacenar todas las posibles consultas a cargar.
		 * El formato de las consultas es:
		 * {
		 * 		nombre: "Nombre de la consulta",
		 *		template: "String con la consulta en json. Asi se almacena en la base de datos"
		 * }
		 */ 
		this.consultas   = [];
		this.url = url; // URL para el CRUD de consultas

		/* Array con todos los posibles campos que usa la consulta.
		 * Cada elemente de este array es otro array en la forma "{ id: id, nombre: nombre }"
		 */
		this.campos = campos || [];

		/*
		 * Array que almacena todos los filtros que conforman la consulta activa en este momento.
		 * Si se quiere ejecutar la consulta desde fuera del grid, solo hay que obtener estos filtros
		 * con el metodo get_consulta y aplicarlos.
		 */
		this.filtros = {
			criterio: null,
			o1: null,
			o2: null,
			o3: null,
			o4: null,
			o5: null,
			o6: null,
			o7: null
		}

		/*
		 * Función que se ejecutará cada vez que se pulse el botón ejecutar.
		 * Viene dada desde fuera para poder interactuar con filtros externos
		 */
		this.ejecutar_callback = function(datos_consulta){
			// this hace referencia a Consulta
			var datos_consulta = datos_consulta || 'Sin datos de consulta';
			console.log('Pulsado el boton ejecutar de la consulta:');
			console.debug(datos_consulta);
		}

		if(_.isFunction(ejecutar)) this.ejecutar_callback = ejecutar;

		this.nombre_consulta = null;
		this.html();
		this.comportamientos();

		this.leer_consultas();
	}

	/*
	 * Obtiene todos los datos de la consulta y los pasa al ejecutar_callback
	 * definido por el host.
	 */
	Consulta.prototype.ejecutar_consulta = function(){ 
		var datos_consulta = this.get_consulta_xFilas();
		this.ejecutar_callback(datos_consulta);
	}
	
	/*
	 * Carga esqueleto html con columnas vacias y modales
	 */
	Consulta.prototype.html = function(){
		var that = this;

		$('<div>', { id: 'filtro'})
			.append(
				$('<div>',{ id: 'cabecera'})
				.append(
					$('<h3>', { text: 'Área de consultas' }),
		            $('<div>', { id: "herramientas" })
		        	.append(
		                $('<select id="selector_consulta" style="height:100%;">', {})
		                .append('<option value="-1">Seleccionar Consulta</option>'),
		                $('<button>', { id: "ver_consulta", text: 'Ver', title: "Ver en modo edición la consulta selecciona" }),
		                $('<button>', { id: "ejecutar_consulta", text: 'Ejecutar', title: "Ejecutar consulta seleccionada." }),
		                $('<button>', { id: "nueva_consulta", text: 'Nueva', title: "Nueva consulta vacia." }),
		                $('<button>', { id: "guardar_consulta", text: 'Guardar', title: "Grabar o actualizar consulta actual" }),
		                $('<button>', { id: "renombrar_consulta", text: 'Renombrar', title: "Renombrar consulta actual" }),
		                $('<button>', { id: "eliminar_consulta", text: 'Borrar', title:"Borrar consulta actual" }),
		                $('<button>', { id: "reset_consulta", text: 'Reset', title: "Resetea listado y consultas." })
		        	)
				),
				$('<div>',{ id: 'cuerpo', css: { 'display' : 'none' } })
				.append(
					$('<table>')
					.append(
						$('<tr>').append($('<td>', { 'class': 'etqu', text: 'Campo:' })),
						$('<tr>').append($('<td>', { 'class': 'etqu', text: 'Ver:' })),
						$('<tr>').append($('<td>', { 'class': 'etqu', text: 'Orden:' })),
						$('<tr>').append($('<td>', { 'class': 'etqu', text: 'Criterio:' })),
						$('<tr>').append($('<td>', { 'class': 'etqu', text: 'o:' })),
						$('<tr>').append($('<td>', { 'class': 'etqu', text: 'o:' })),
						$('<tr>').append($('<td>', { 'class': 'etqu', text: 'o:' })),
						$('<tr>').append($('<td>', { 'class': 'etqu', text: 'o:' })),
						$('<tr>').append($('<td>', { 'class': 'etqu', text: 'o:' })),
						$('<tr>').append($('<td>', { 'class': 'etqu', text: 'o:' })),
						$('<tr>').append($('<td>', { 'class': 'etqu', text: 'o:' }))
		            )
				)
			).hide().appendTo(this.contenedor).fadeIn();
	
		/* HTML de opciones, para no usar modales y no depender de bootstrap, 
		 * ni tener que insertar HTML en el host.
		 */
		var html = {
			renombrar: 	'<div style="margin: 6px 5px;display:none;">\
							<h4>Nuevo nombre para la consulta</h4>\
							<input type="text" id="nombre_renombrar" style="width: 300px;height:26px;" placeholder="Introduzca nombre..." />\
							<button id="cancelar_renombrar">Cancelar</button>\
							<button id="btn_renombrar">Renombrar</button>\
						</div>',
			guardar: 	'<div style="margin: 6px 5px;display:none;">\
							<h4>Nombre de la consulta a guardar</h4>\
							<input type="text" id="nombre_guardar" style="width: 300px;height:26px;" placeholder="Introduzca nombre..." />\
							<button id="cancelar_guardar">Cancelar</button>\
							<button id="btn_guardar">Guardar</button>\
						</div>'
		}

		$c.find('#cabecera').after(html.renombrar).after(html.guardar);
		/*/ Cargamos los modales
		$c.append('<div="modales_de_daf_consultas" style="padding:0px;margin:0px;"> \
			<div id="modal_set_nombre" class="modal fade" tabindex="-1" role="dialog"> \
				<div class="modal-dialog"> \
					<div class="modal-content"> \
						<div class="modal-header well"> \
							<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button> \
				 			<h4 style="color:#10548b;margin-top:10px;">Guardar Consulta</h4> \
				  		</div> \
						<div class="modal-body" > \
							<input type="text" id="modal_nombre_consulta" class="input-xxlarge" placeholder="Nombre de la Consulta" /> \
						</div>	 \
				    	<div class="modal-footer"> \
				       		<div id="modal_out_ins_rel" class="col-md-8"></div> \
				       		<button class="btn btn-xs btn-default span2" data-dismiss="modal" aria-hidden="true" > \
								<i class="icon-remove"></i> Cancelar \
							</button> \
				       		<button id="btn_ok" data-dismiss="modal" class="btn btn-xs btn-info span2"> \
								<i class="icon-ok"></i> Grabar \
							</button>    	 \
						</div> \
					</div> \
				</div> \
			</div> \
			<div id="modal_update_nombre" class="modal fade" tabindex="-1" role="dialog"> \
				<div class="modal-dialog"> \
					<div class="modal-content"> \
						<div class="modal-header well"> \
							<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button> \
				 			<h4 style="color:#10548b;margin-top:10px;">Renombrar Consulta</h4> \
				  		</div> \
						<div class="modal-body" > \
							<input type="text" id="modal_nuevo_nombre_consulta" class="input-xxlarge" placeholder="Nuevo nombre de la Consulta" /> \
						</div>	 \
				    	<div class="modal-footer"> \
				       		<div id="modal_out_ins_rel" class="col-md-8"></div> \
				       		<button class="btn btn-xs btn-default span2" data-dismiss="modal" aria-hidden="true" > \
								<i class="icon-remove"></i> Cancelar \
							</button> \
				       		<button id="btn_ok" data-dismiss="modal" class="btn btn-xs btn-info span2"> \
								<i class="icon-ok"></i> Grabar \
							</button>    	 \
						</div> \
					</div> \
				</div> \
			</div> \
		</div>');
		*/
		_.each(this.campos, function(campo){
			that.carga_columna(false);
		});

		// Cargamos los estilos ( aunque aqui los cargamos directamente en el HTML)
		//DAF.API.carga_2head('estilos.css', 'css', this.contenedor);
	}

	/*
	 * Carga una columna vacia o con datos.
	 * Parametros:
	 *  - array de valores, si es false, todos en blanco.
	 */
	Consulta.prototype.carga_columna = function(valores){

		var valores = valores || false;

		var filas = $c.find("#filtro table tr"),
			that = this,
			celda,
			ancho = this.ancho,
			campos = this.campos,
			selector_campos = $('<select style="width:100%">');

		selector_campos.append('<option value="-1">Seleccione campo...</option>');

		_.each(campos, function(campo){
			selector_campos.append('<option value="'+campo.id+'">'+campo.nombre+'</option>')
		});

		that.ult_columna++;
		$.each(filas, function(id_fila){
			id_fila++; // Empieza por 1 la fila, y no 0
			if(id_fila == 1){
				selector_campos.attr('columna', that.ult_columna);
				celda = $('<td width="'+ancho+'px">').append(selector_campos);
			} else if(id_fila == 2)
				celda = $('<td width="'+ancho+'px">')
							.append($('<input>', {
								type: 'checkbox',
								css: {
									'width': '100%',
									'text-align': 'center',
									'vertical-align': 'middle'
								},
								columna: that.ult_columna, 
								fila: id_fila }));
			else if(id_fila == 3)
				celda = $('<td width="'+ancho+'px">')
						.append($('<select style="width:100%;" columna="'+that.ult_columna+'" >')
							.append('<option value=0></option><option value=1>Ascendente</option><option value=2>Descendente</option>'));
			else
				celda = $('<td width="'+ancho+'px">')
						.append($('<input>', {
								css: {
									'width': '100%'
								},
								class: 'condicion',
								columna: that.ult_columna, 
								fila: id_fila }
						));
			$(this).append(celda);
		});

		this.ancho_tabla = parseInt(this.ancho_tabla)+parseInt(ancho);
		$c.find('table').css('width', this.ancho_tabla+"px");

		return true;
	}

	/*
	 * 	Comportamientos del grid
	 */
	Consulta.prototype.comportamientos = function(){
		var that = this;

		// Permite moverse por la tabla con los cursores
			$c.on('keydown', function(e){
				
				var foco = document.activeElement,
					f = parseInt(foco.getAttribute('fila')),
					c = parseInt(foco.getAttribute('columna'));

				switch(e.keyCode){
					case 37: c--; break; // Izquierda
					case 39: c++; break; // Derecha
					case 38: f--; break; // Arriba
					case 40: f++; break; // Abajo
					default: break;
				}

				$c.find('input[fila='+f+'][columna='+c+']').focus();
			});

		// Cambios en las condiciones
			$c.off('change', 'input.condicion');
			$c.on('change', 'input.condicion', function(){ that.cambia_condicion(this); });

		// Comportamientos de selector y botones superiores

		// Botón Ver / Ocultar
		$c.find("#ver_consulta").off('click');
		$c.find("#ver_consulta").on('click', function(ev){
		    if($(this).html().search('Ocultar') != -1 ){
		        $(this).html('Ver');
		        $c.find('#cuerpo').css('display', 'none');
		    } else {
		        $(this).html('Ocultar');
		        $c.find('#cuerpo').css('display', 'block');    
		    }
		});
		
		// Botón Ejecutar consulta
		$c.find("#ejecutar_consulta").off('click');
		$c.find("#ejecutar_consulta").on('click', function(){
			that.ejecutar_consulta();
		});		

		/*/ Botón Nueva Consulta
		$(this.contenedor+" #nueva_consulta").off('click');
		$(this.contenedor+" #nueva_consulta").on('click', function(ev){
		    $(that.contenedor+" #selector_consulta").val("-1");
		    that.reset_grid();
		});
		*/

		// Botón Guardar consulta
		$c.find("#guardar_consulta").off('click');
		$c.find("#guardar_consulta").on('click', function(ev){
			
			var div_guardar = $c.find('#btn_guardar').parent(),
				div_cabecera = $c.find('#cabecera');

			if(parseInt($c.find('#selector_consulta').val()) === -1){
				div_cabecera.css('display', 'none');
				div_guardar.css('display', 'block');

				div_guardar.find('#cancelar_guardar').off('click');
				div_guardar.find('#cancelar_guardar').on('click', function(){
					
					$(this).find('input').val("");
					div_cabecera.css('display', 'block');
					div_guardar.css('display', 'none');
				});

				div_guardar.find('#btn_guardar').off('click');
				div_guardar.find('#btn_guardar').on('click', function(){
					
					that.graba_consulta($c.find('#nombre_guardar').val(), false, function(rsp){
						console.log('Consulta Grabada');
						console.debug(rsp);
						div_guardar.find('#cancelar_guardar').click();
					});
				});	
			} else {
				that.graba_consulta($c.find('#selector_consulta').val(), false, function(rsp){
					console.log('Consulta grabada.');
					console.debug(rsp);
				});
			}

			
		});

		// Botón Renombrar consulta
		$c.find("#renombrar_consulta").off('click');
		$c.find("#renombrar_consulta").on('click', function(ev){
			var div_renombrar = $c.find('#btn_renombrar').parent(),
				div_cabecera = $c.find('#cabecera');

			div_cabecera.css('display', 'none');
			div_renombrar.css('display', 'block');

			div_renombrar.find('#cancelar_renombrar').off('click');
			div_renombrar.find('#cancelar_renombrar').on('click', function(){
				
				$(this).find('input').val("");
				div_cabecera.css('display', 'block');
				div_renombrar.css('display', 'none');
			});

			div_renombrar.find('#btn_renombrar').off('click');
			div_renombrar.find('#btn_renombrar').on('click', function(){
				that.graba_consulta($c.find('#nombre_renombrar').val(), true, function(rsp){
					console.log('Consulta renombrada');
					console.debug(rsp);
					div_renombrar.find('#cancelar_renombrar').click();
				});
			});
		});

		// Botón Eliminar consulta
		$c.find("#eliminar_consulta").off('click');
		$c.find("#eliminar_consulta").on('click', function(ev){
			ev.preventDefault();
		    var lanzador = ev.currentTarget,
		    	selector = $(lanzador).parent().find('select');

		    that.borra_consulta($(selector).val());
		});


		// Botón Resetear consulta
		$c.find("#reset_consulta").off('click');
		$c.find("#reset_consulta").on('click', function(ev){
			ev.preventDefault();
		    var lanzador = ev.currentTarget;
		    that.reset_grid();
		});
	}

	Consulta.prototype.cambia_condicion = function(celda){

		var $celda 	= $(celda),
			fila 	= $celda.attr('fila'),
			columna = $celda.attr('columna');

		/*
		 * Si no es una celda de condición devuelve false, no obstante, solo deberian llegar aqui
		 * las celdas filtradas por la clase "concicion".
		 */
		if(fila < 4) return false;

		var tmp;
		if(tmp = this.validar_condicion($celda)){
			$celda.css('background-color', c_valido);
		} else {
			$celda.css('background-color', c_error);
		};

		// Quita los colores de fondo si se vacia la condición
		if($celda.val().length < 1) $celda.css('background-color', c_activo);
	}

	Consulta.prototype.validar_condicion = function($celda){
		var c 		   = $celda.val(),
			operador   = c.trim().substr(0, 1),
			operadores = '*#<>!=%$';

		if(operadores.search(operador) == -1) return false;
		else return c;
	}

	/*
	 * Devuelve la consulta mostrada en pantalla, con el formato:
	 *		{
	 *			columna: numero de la columna donde esta ubicada 		
	 *			campos: array con campos a mostrar
	 *			filtros: array de filtros a aplicar (cada filtro es un grupos de condiciones AND)
	 *		}
	 * Esta forma de leer la consulta es ideal para obtener sus filtros
	 */ 
	Consulta.prototype.get_consulta_xFilas = function(){
		var that 			 	= this,
			condiciones_filtro 	= [],
			all_selects      	= $c.find('table > tbody > tr:nth-child(1) select'),
			all_checkbox     	= $c.find('table > tbody > tr:nth-child(2) input'),
			all_orden			= $c.find('table > tbody > tr:nth-child(3) select'),
			campos_mostrados 	= [],
			orden_campos 		= [],
			error 			 	= false;

		

		for(var i = 4; i <12; i++){ // Recorre filas
			var condiciones = $c.find('*[fila='+i+']');
			
			condiciones = _.filter(condiciones, function(c){
				return c.value.length > 0;
			}); 

			condiciones = _.map(condiciones, function(input_condicion){
				
				var columna = $(input_condicion).attr('columna'),
					selector = $c.find('select[columna='+columna+']'),
					valor_selector = $(selector).val();
				
				var condicion = that.validar_condicion($(input_condicion));

				if(parseInt(valor_selector) == -1 || !condicion ){
					error = true;
					return false;
				}

				return {
					columna:   columna,
					campo: 	   valor_selector,
					expresion: condicion
				}
			});

			if(error) break;
			else if(condiciones.length > 0) condiciones_filtro.push(condiciones);
		}

		all_orden = _.filter(all_orden, function(s){
			return $(s).val() > 0;
		})

		_.each(all_orden, function(o){
			var campo_orden = $c.find('select[columna='+$(o).attr('columna')+']'),
				valor_orden  = $(o).val();
			
			orden_campos.push([campo_orden.val(), valor_orden]);
		});

		all_checkbox = _.filter(all_checkbox, function(check){
			return $(check).is(':checked');
		});


		_.each(all_checkbox, function(check){
			var select_check = $c.find('select[columna='+$(check).attr('columna')+']'),
				valor_select = $(select_check).val();

			if(parseInt(valor_select) == -1){
				error = true;
				return false;
			} else {
				campos_mostrados.push(valor_select);	
			}		
		});

		if(campos_mostrados.length < 1) error = true;

		if(error){ 
			alert('La consulta contiene errores:\n\n\
				Por favor compruebe lo siguiente: \n\
				\tQue no tenga ningun campo en rojo.\n\
				\tQue ha seleccionado un campo en todas las columnas con condiciones.\n\
				\tQue no tiene marcada para ver ninguna columna sin campo seleccionado.\n\
				\tQue tiene marcado al menos un campo para consultar.');
			return false;
		} else return {
			campos: campos_mostrados,
			filtros: condiciones_filtro,
			orden: orden_campos
		}
	}

	/* 
	 * Devuelve la consutla mostrada en pantalla con el formato:
	 * {
	 * }
	 * Esta forma es mejor para almacenar las consultas
	 */
	Consulta.prototype.get_consulta_xColumnas = function(){

		var that = this,
			all_selects  = $c.find('table > tbody > tr:nth-child(1) select'),
			all_checkbox = $c.find('table > tbody > tr:nth-child(2) input'),
			all_orden    = $c.find('table > tbody > tr:nth-child(3) select'),
			columnas_llenas = [],
			tmp_obj = {};

		all_selects = _.filter(all_selects, function(sel){
			return parseInt($(sel).val()) !== -1;
		});

		_.each(all_selects, function(sel){
			var num_columna = $(sel).attr('columna');
	
			tmp_obj = {
				campo: 	  that.get_campo(num_columna),
				chekbox:  that.get_ver(num_columna),
				orden: 	  that.get_orden(num_columna),
				criterio: that.get_celda(4, num_columna).val(),
				o1: 	  that.get_celda(5, num_columna).val(),
				o2: 	  that.get_celda(6, num_columna).val(),
				o3: 	  that.get_celda(7, num_columna).val(),
				o4: 	  that.get_celda(8, num_columna).val(),
				o5: 	  that.get_celda(9, num_columna).val(),
				o6: 	  that.get_celda(10, num_columna).val(),
				o7: 	  that.get_celda(11, num_columna).val()
			}

			columnas_llenas.push(tmp_obj);
		});

		return columnas_llenas;
	}
	/* 
	 * Resetea el grid de consultas
	 */
	Consulta.prototype.reset_grid = function(){

		$c.find('tr:nth-child(1) select').val("-1");
		$c.find('tr:nth-child(2) input').prop('checked', false);
		$c.find('tr:nth-child(3) select').val("0");
		$c.find('tr:nth-child(4) input').val("");
		$c.find('tr:nth-child(5) input').val("");
		$c.find('tr:nth-child(6) input').val("");
		$c.find('tr:nth-child(7) input').val("");
		$c.find('tr:nth-child(8) input').val("");
		$c.find('tr:nth-child(9) input').val("");
		$c.find('tr:nth-child(10) input').val("");
		$c.find('tr:nth-child(11) input').val("");

		this.activa = false;
	}

	/*
	 * Carga consultas en el selector de consultas y reactiva su comportamiento
	 */
	Consulta.prototype.set_select_consultas = function(){
		var that = this,
			selector = $c.find('#selector_consulta');
		selector.html('<option value="-1">Seleccionar Consulta</option>');
		_.each(that.consultas, function(consulta){
			selector.append('<option value="'+consulta.nombre+'">'+consulta.nombre+'</option>');
		});
		selector.off('change');
		selector.on('change', function(ev){
			ev.preventDefault();
		    var lanzador = ev.currentTarget,
		    	val = parseInt($(lanzador).val());
		    
		    that.reset_grid();
		    
		    if(isNaN(val) || val > -1){
		    	_.each(that.consultas, function(consulta){
			    	if(consulta.nombre == $(lanzador).val()){
			    		that.carga_consulta(consulta);
			    		return false;
			    	}
			    });
		    }
		});
	}

	/*
	 * Carga consulta por columnas, usando los metodos, set_campo, set_ver, set_orden, set_celda
	 */
	Consulta.prototype.carga_consulta = function(q){

		var columnas = JSON.parse(q.template),
			that = this;
	
		_.each(columnas, function(col, k){
			k++;
			that.set_campo(k, col.campo);
			that.set_ver(k, col.chekbox);
			that.set_orden(k, col.orden);
			that.set_celda(4, k, col.criterio);
			that.set_celda(5, k, col.o1);
			that.set_celda(6, k, col.o2);
			that.set_celda(7, k, col.o3);
			that.set_celda(8, k, col.o4);
			that.set_celda(9, k, col.o5);
			that.set_celda(10, k, col.o6);
			that.set_celda(11, k, col.o7);
		});
	}

	/*
	 * Getter y Setters de celdas.
     */
    // Celda
	Consulta.prototype.set_celda = function(fila,columna, valor){
		var target = $c.find('*[fila='+fila+'][columna='+columna+']');
		target.val(valor);
	}

	Consulta.prototype.get_celda = function(fila,columna){
		return $c.find('*[fila='+fila+'][columna='+columna+']');
	}

	// Campo
	Consulta.prototype.set_campo = function(columna, valor){
		var target = $c.find('tr:nth-child(1) select[columna='+columna+']');
		target.val(valor);
	}

	Consulta.prototype.get_campo = function(columna){
		return $c.find('tr:nth-child(1) select[columna='+columna+']').val();
	}

	// Ver
	Consulta.prototype.get_ver = function(columna){
		return $c.find('tr:nth-child(2) input[columna='+columna+']').is(':checked');
	}

	Consulta.prototype.set_ver = function(columna, valor){
		$c.find('tr:nth-child(2) input[columna='+columna+']').prop('checked', JSON.parse(valor));
	}

	// Orden
	Consulta.prototype.get_orden = function(columna){
		var orden = $c.find('tr:nth-child(3) select[columna='+columna+']').val();
			return orden;
	}

	Consulta.prototype.set_orden = function(columna, valor){
		$c.find('tr:nth-child(3) select[columna='+columna+']').val(valor);
	}

	/*
	 * CRUD DE CONSULTAS
	 * Para todas las peticiones se usa this.url, pero si la peticion es plural ( get registros), se le añade una s
	 * El metodo leer_consultas, puede leerlas localmente o a traves de la url. Si recibe parametro, lo interpreta
	 * como las consultas a añadir.
	 */
	Consulta.prototype.leer_consultas = function(consultas_locales){
		
		var that = this,
			locales = consultas_locales || false;
		if(!locales)
			// 0-metodo, 1-ruta, 2-datos, 3-formato_datos, 4-callback-OK, 5-callback-ERROR, 6-Callback-Petición
			API.peticion('GET', that.url+"s", false, 'json',
				function(consultas){
					that.consultas = consultas;
					that.set_select_consultas();
				}
			);
		else {
			this.consultas = consultas_locales;
			this.set_select_consultas();
		}
	}

	Consulta.prototype.graba_consulta = function(nombre, solo_nombre, callback){

		var that = this,
			selector = $c.find('#selector_consulta'),
			//consulta_seleccionada = selector.val(),
			antiguo_nombre = $c.find('#selector_consulta option:selected').text(),
			tpl_obj = {
				nombre:   nombre,
				template: this.get_consulta_xColumnas()
			},
			metodo = parseInt(selector.val()) !== -1 || solo_nombre ? 'PUT' : 'POST';

		console.log('selector:');
		console.debug(selector.val());

		if(solo_nombre) tpl_obj['antiguo_nombre'] = antiguo_nombre;

		API.peticion(
            metodo,
            that.url,
            tpl_obj,
            'json',
            function(rsp){

				if(_.isArray(rsp.template)) rsp.template = JSON.stringify(rsp.template);

				if(metodo === 'POST') that.consultas.push(rsp);
				else 
					$.each(that.consultas, function(key){
						if(this.nombre == antiguo_nombre){
							that.consultas[key] = rsp;
							return false;
						}
					});

				that.set_select_consultas(); // Refresca el selector de consultas
				
				/* OLD POST
				selector.append('<option value="'+nombre+'" selected="selected">'+nombre+'</option>');
				DATOS.consultas.push(tpl_obj);
				that.set_consultas(DATOS.consultas);
				*/ 
				/* OLD PUT
				$.each(DATOS.consultas, function(){
					if(this.nombre == nombre){
						this.template = consulta;
						return false;
					}
				});
				that.set_consultas(DATOS.consultas);
				*/
				callback(rsp);
            }
        );
	}

	return Consulta;
}(DAF.API));
