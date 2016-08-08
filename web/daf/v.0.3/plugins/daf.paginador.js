(function(API){
	/*
	 * Formato constructor con HTML externo:
	 * 		new Paginador(contenedor, html_externo, datos, callback);
	 * Formato constructor con HTML interno
	 * 		new Paginador(contenedor, datos, callback);
	 *   ó  new Paginador(contenedor, false, datos, callback;
	 */
	Paginador = function(){
		var a = Array.prototype.slice.call(arguments, 0),
			that = this, i;
		// Contenedor de los controles
		this.contenedor = a[0],
		this.$c         = $(a[0]); // Global
		
		/* 
		 * Quita todas las clases que influyen en el comportamiento y que
		 * normalmente estaran para ver la maquetación antes de implementar el plugin.
		 */
		//this.$c.find('li').removeClass('activo').removeClass('inactivo');

		/*
		 * Si el segundo parametro es true, usará el html contenido en el objeto
		 * cuyo id es pasado como contenedor.
		 * Si no se usa el HTML interno del plugin, hay que asegurarse que el
		 * HTML del paginador tenga las clases necesarias para paginar.
		 * En caso contrario, insertará en el contenedor el HTML por defecto del plugin.
		 */
		i = (_.isBoolean(a[1]) && a[1] === true) ? 2 : 1;
		if(i !== 2)	this.$c.html(that.get_html());

		this.datos = _.isArray(a[i]) ? a[i] : false;
		this.url = this.datos ? false : a[i];

		this.callback = a[i+1] || 
			function(datos){ 
				console.log('Callback por defecto:');
				console.debug(datos); 
			};

		this.controles = { // Objetos que actuan sobre la paginacion
			regs_x_pag: $(this.contenedor+" #regs_x_pag"),
			btn_pags: 	this.$c.find('.pag_control'),
		};

		this.info = { // Objetos que devuelven datos de la paginacion
			primero: $(this.contenedor+" #primero"),
			ultimo:  $(this.contenedor+" #ultimo"),
			total:   $(this.contenedor+" #total")
		}

		this.intervalo 	   = parseInt($(this.contenedor+" #regs_x_pag").val()); 	// Numero de registros por pagina

		this.refrescar();
		
	}

	Paginador.prototype.refrescar = function(){
		
		// Marcamos los valores de información
		this.set_info(1, this.intervalo, this.datos.length);
		
		// Activa los comportamientos de los controles
		this.comportamientos_ctrls();

		/* 
		 * Lanza un evento change que inicia la paginación.
		 * Lo hacemos con el select, por que solo los cambios en el select manipulan todos los controles.
		 */
		this.controles.regs_x_pag.trigger('change');
	}

	Paginador.prototype.set_datos = function(datos){
		if(_.isArray(datos)) this.datos = datos;
		else throw 'Los datos pasados para paginar deben de ser una colección(Array de objetos)';
	}

	Paginador.prototype.set_callback = function(callback){
		this.callback = callback;
	}

	/*
	 * Devuelve html básico del paginador, para el selector 
	 * y botones que controlan la paginación.
	 */
	Paginador.prototype.get_html = function(){
        return '<div style="width: 33%;float: left;"> \
		            <span> \
		                Mostrar&nbsp;&nbsp; \
		                <select id="regs_x_pag"> \
		                    <option value="10"> 10 </option> \
		                    <option value="20"> 20 </option> \
		                    <option value="50"> 50 </option> \
		                    <option value="70"> 70 </option> \
		                    <option value="100"> 100 </option> \
		                </select> \
		                &nbsp;&nbsp;registros \
		            </span> \
		        </div> \
		        <div style="width: 34%;float: left;"> \
		            <div style="margin-top: 6px;text-align: center;"> \
		                Mostrando  \
		                <span id="primero">&nbsp;</span> a  \
		                <span id="ultimo">&nbsp;</span> de  \
		                <span id="total">&nbsp;</span> Solicitudes \
		            </div> \
		        </div> \
		        <div style="width: 33%;float: right;"> \
		            <ul style="float: right;margin: 0px;"> \
		                <li class="inactivo"> \
		                    <a class="pag_control" id="prev"> \
		                        << Previa \
		                    </a> \
		                </li> \
		                <li class="activo"> \
		                    <a class="pag_control" id="1">1</a> \
		                </li> \
		                <li> \
		                    <a class="pag_control" id="2">2</a> \
		                </li> \
		                <li> \
		                    <a class="pag_control" id="3">3</a> \
		                </li> \
		                <li> \
		                    <a class="pag_control" id="4">4</a> \
		                </li> \
		                <li> \
		                    <a class="pag_control" id="next"> \
		                        Siguiente >> \
		                    </a> \
		                </li> \
		            </ul> \
		        </div>';
	}

	/* 
	 * Da comportamientos a todos los botones y selector
	 */
	Paginador.prototype.comportamientos_ctrls = function(){
		var that = this;

		this.controles.btn_pags.off('click');
		this.controles.btn_pags.on('click', function(ev){ 
			var l = $(ev.currentTarget).parent();
			if(!l.hasClass('activo') && !l.hasClass('inactivo')){
				that.paginar(ev.currentTarget);
			}
		});

		this.controles.regs_x_pag.off('change');
	    this.controles.regs_x_pag.on('change', function(ev){
	    	that.paginar(ev.currentTarget);
	    });
	}

	/*
	 * Actualiza el estado de los controles
	 * Siempre tiene que haber un objeto lanzador
	 */
	Paginador.prototype.set_controles = function(){
		var ol = $(this.lanzador), // Objeto lanzador
			tc = this.controles.btn_pags.length, // Total de controles
			ca = { // Controles actuales
				prev: ($(this.controles.btn_pags[0]).parent().hasClass('inactivo'))  ? false : true,
				btns: [],
				next: ($(this.controles.btn_pags[tc]).parent().hasClass('inactivo')) ? false : true
			},
			cn = { // Controles Nuevos
				prev: false,
				btns: [],
				next: false
			},
			total = this.total_paginas,
			num_btns = tc-2,
			last_btn_id = tc-3, 
			i;
		
		for(i = 1; i < this.controles.btn_pags.length-1; i++)
			ca.btns.push(parseInt($(this.controles.btn_pags[i]).html()));

		// Si el lanzador es un botón
		if(!isNaN(parseInt(ol.attr('id')))) this.marcar_activa(ol.attr('id'));
		else {
			var primera, ultima;
			
			// Si el lanzador es el selector
			if(ol.attr('id') === 'regs_x_pag'){		
				i = 0;
				while(i < num_btns)		
					if(i < total) cn.btns[i] = ++i;		
					else cn.btns[i++] = false;		
				cn.prev = false;		
				cn.next = cn.btns[last_btn_id] === false || cn.btns[last_btn_id]+1 > total ? false : true; 		
			} 
			// Si el lanzador es prev
			else if(ol.attr('id') === 'prev'){
				
				ultima  = ca.btns[0]-1,
				primera = ultima-num_btns+1,
				
				i = 0;
				while(primera <= ultima) cn.btns[i++] = primera++;

				cn.prev = cn.btns[0] > 1 ? true : false;
				cn.next = cn.btns[last_btn_id]+1 <= total ? true : false;
			}	
			// Si el lanzador es next
			else if(ol.attr('id') === 'next'){

				primera = ca.btns[last_btn_id]+1;

				i = 0;
				while(i < num_btns){
					if(primera+i <= total)cn.btns[i] = primera+i++;
					else cn.btns[i++] = false;
				}

				cn.prev = num_btns < cn.btns[0] ? true : false;
				cn.next = cn.btns[last_btn_id] === false || cn.btns[last_btn_id]+1 > total ? false : true;
			}	
		}

		// Si el lanzador es un botón, no cambian los controles, solo la pagina activa que ya se marcó antes 
		if(cn.btns.length === 0) cn = ca;
		else {

			this.$c.find('li').removeClass('activo').addClass('inactivo');

			if(cn.prev) $(this.controles.btn_pags[0]).parent().removeClass('inactivo');
			if(cn.next) $(this.controles.btn_pags[this.controles.btn_pags.length-1]).parent().removeClass('inactivo');
			i = 0;
			while(i < num_btns){
				
				var activo = cn.btns[i] ? true : false,
					v = activo ? cn.btns[i] : cn.btns[i-1]+1,
					btn = $(this.controles.btn_pags[i+1]);
				
				if(isNaN(v)) v = i+1;
				
				cn.btns[i++] = v;

				btn.html(v);
				if(activo) btn.parent().removeClass('inactivo');
			}
			
			// Si no hay registros, no se marca ninguna
			if(total > 0) this.marcar_activa(1);
		}

		return cn.btns[0];
	}

	/*
	 *	Marca pagina activa (visible)
	 */
	Paginador.prototype.marcar_activa = function(id){
		this.$c.find('li').removeClass('activo');
		$(this.controles.btn_pags[parseInt(id)]).parent().addClass('activo');
	}

	/*
	 * Actualiza el estado de la infromación de paginación
	 */
	Paginador.prototype.set_info = function(){
		var a = Array.prototype.slice.call(arguments, 0);
		this.info.primero.html(a[0]);
		this.info.ultimo.html(a[1]);
		this.info.total.html(a[2]);
	}

	/* 
	 * Inicia la paginacion con los datos dados
	 */
	Paginador.prototype.paginar = function(control){
	
		if(control)	this.lanzador = control
		
		$lanzador = $(this.lanzador);
		
		var that = this,
			tipo = API.tipo(this.lanzador),
			id_control = $lanzador.attr('id'),
			tb = this.controles.btn_pags.length-2,
			paginado, v;

		if(tipo === 'HTMLAnchorElement'){ 	
			v = $lanzador.html();
			if(id_control === 'next')
				v = parseInt($(this.controles.btn_pags[1]).html())+tb;
			if(id_control == 'prev')
				v = parseInt($(this.controles.btn_pags[1]).html())-tb;
			this.get_pagina(false, v);
		} else if(tipo === 'HTMLSelectElement'){
			this.get_pagina($lanzador.val(), 1);
		}
	}

	/*
	 * Devuelve una pagina dentro de los datos proporcionados
	 * get_pagina(intervalo, pagina_actual, datos);
	 */
	Paginador.prototype.get_pagina = function(){
		
		var a = Array.prototype.slice.call(arguments, 0),
			intervalo = parseInt(a[0]) || this.intervalo,
			pagina_actual = a[1] || this.pagina_actual,
			datos = a[2] || this.datos,
			rsp = {
				primero: parseInt(((pagina_actual-1)*intervalo)+1),
				ultimo:  parseInt(((pagina_actual-1)*intervalo)+intervalo),
				total: 	 0,
				datos: 	 []	
			},
			i = rsp.primero-1,
			that = this;
	
		this.intervalo     = intervalo;
		this.pagina_actual = pagina_actual;

		if(this.datos){
			
			rsp.total = datos.length;
			
			if(rsp.primero > rsp.total) rsp.primero = rsp.total;
			if(rsp.ultimo > rsp.total) rsp.ultimo = rsp.total;

			while(i < rsp.ultimo){
				rsp.datos.push(datos[i]);
				i++;	
			}

			this.total_paginas = Math.ceil(rsp.total/intervalo);
			this.set_controles();
			this.set_info(rsp.primero, rsp.ultimo, rsp.total);
			this.callback(rsp.datos);
		}

		if(this.url){
			$.ajax({
				url: this.url,
				type: 'POST',
				data: {
					primero: rsp.primero,
					intervalo: intervalo
				}
			})
			.done(function(respuesta) {
				var r = JSON.parse(respuesta);
				rsp.datos = r.datos;
				rsp.total = r.total;
				that.total_paginas = Math.ceil(rsp.total/intervalo);
				that.set_controles(that.lanzador);
				that.set_info(rsp.primero, rsp.ultimo, rsp.total);
				that.callback(rsp.datos);
			})
			.fail(function(error) {
				console.log(error);
			});
		}
	}

}(DAF.API));