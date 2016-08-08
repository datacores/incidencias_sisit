/*
 * Version 0.1.02
 * 
 */
(function(CORE){
	/* Condición para el filtro.
     * La condición debe de ser un objeto con la estructura:
     * 		{
     			id: id de la condición, necesario para poder tener varias condiciones sobre un mismo campo,
	 *			cp: campo sobre el que actua la condición,
	 *			op: operador en formato numero,
	 *			ex: expresion o valor que actua con el operador sobre el objetivo a filtrar
     *		}
	 */
	Condicion = function(campo, operador, expresion, id){
		this.cp = campo;
		this.op = operador;
		this.ex = expresion;

		// Si no se le da un id especifico (como un nombre), la clase le asignara uno cuando lo necesite.
		this.id = id || null;
	}

	/* 
	 * Un filtro es un grupo de condiciones, no manipula datos
	 * El grupo de condiciones, se aplican con or o con and, entre ellas. Por defecto AND.
	 * El filtro se aplica SOLO sobre un array de objetos.
	 */
	Filtro = function(union){
		// Validación de dependencias
		if(!DAF.API.tipo) 		throw("El plugin daf.filtros.js, necesita el plugin daf.validar.js para trabajar.");
		if(!DAF.API.no_acentos) throw("El plugin daf.filtros.js, necesita el plugin daf.utiles.js para trabajar.");
		try { _.isArray([]) } catch(e){ throw("Este plugin necesita la libreria underscore.js para trabajar."); }
		
		this.union = union || false; // true/false = OR/AND
		this.condiciones = [];  	 // Array de arrays con todas las condiciones para aplicar a datos
		this.omisiones = []; // Array que almacena los campos que no se filtraran. Util sobre todo cuando se usa *
	}

	/*
	 * Elimina todas las condiciones de un filtro.
	 */
	Filtro.prototype.reset_condiciones = function(){
		this.condiciones = [];
	}

	Filtro.prototype.set_omisiones = function(oms){
		if(_.isString(oms)) this.omisiones.push(oms);
		if(_.isArray(oms)) this.omisiones = _.union(this.omisiones, oms);
	}

	/* Accion: 		Añade condición para el filtro
	 * Formato: 	Filtro.add_condicion(nombre_campo, expresion, indice)
	 * Parametros:
	 * nombre_campo Es el nombre del campo sobre el que actua. 
     * 				Puede ser un string o un array:
     *  			- *	- La condicion actua sobretodos los campos.
     *  			- String distinto de * - actua sólo sobre el campo con nombre igual 
	 *     			  a ese string.
     *				- Array - actuara sobre todos los campos cuyos nombres coincidan con los
     * 	  			  campos de los elementos del array y  se crearan tantas condiciones como 
     * 	  			  elementos tenga el array.
     * 
     * expresion 	consta de un operador (*#<>!=%$) seguido (con espacio o sin el) 
     * 				de la fecha, valor o string a filtrar, dependiendo del operador.
     *
     * indice		Opcional. Un indice que indentifica a la condición, si se omite, se le asignará
     * 				uno automaticamente, para poder trabajar internamente con grupos de condiciones.
	 */
	Filtro.prototype.add_condicion = function(){

		var args = Array.prototype.slice.call(arguments, 0),
			campo = args[0],
			c = args[1].trim(),
			id = args[2] || this.condiciones.length+1,
			that = this,
			operador = c.charCodeAt(0),
			expresion = c.substr(1).trim(),
			tipo = DAF.API.tipo.call(campo),
			operadores = '*#<>!=%$',
			condicion,
			/* 
			 * Metodo privado que procesa una condicion antes de añadirla.
			 * Tiene en cuenta si ya existe, si hay que eliminarla, su id, etc...
			 */
			procesa_condicion = function(condicion){
				var f;
				// Si ya existe la condicion en condiciones.
				if(f = _.findWhere(that.condiciones, { id: condicion.id })){
					// Si existe pero la expresion a matchear es "", se elimina
					if(condicion.ex.length < 1){
						that.del_condicion(condicion.id);
					} else { // Si no se actualiza
						// Una condicion siempre actua sobre el mismo campo.
						f.op = condicion.op,
						f.ex = condicion.ex.trim();
					}
				} else { // Si no se añade
					that.condiciones.push(condicion);
				}
			}

		if(operadores.search(String.fromCharCode(operador)) == -1) 
			return 'Expresion sin operador u operador no valido, al añadir condicion al filtro.';

		if(tipo.toLowerCase() === 'string'){
			condicion = new Condicion(campo, operador, expresion, id);
			procesa_condicion(condicion);
		} 
		/**
		 * Hay que tener en cuenta que cuando se insertan varias condiciones
		 * estas seran OR/AND, segun sea el filtro.
		 * En el futuro deberia
		 */
		else if(tipo.toLowerCase() === 'array'){
			_.each(campo, function(c, key){
				condicion = new Condicion(c, operador, expresion, _.isArray(id) ? id[key] : i++);
				procesa_condicion(condicion);
			});
		}
	}

	/*
	 * Elimina la condicion del filtro cuyo id coincida con el id pasado..
	 */
	Filtro.prototype.del_condicion = function(id_condicion){
		this.condiciones = _.filter(this.condiciones, function(c){
								return c.id != id_condicion; 
							});
	}

	Filtro.prototype.aplicar_filtro = function(datos){
	/*******************************************************************************
 	* ¡¡¡¡ OJO !!!!! DEBERIA NO APLICAR LAS CONDICIONES QUE COTENGAN CAMPOS QUE NO *
 	* ESTEN EN LOS DATOS, PARA NO PROVOCAR ERROR POR expr1 || expr2 === undefined  *
 	* HAY QUE ARREGLARLO EFICIENTEMENTE, PARA QUE NO PARE MUCHO EL FILTRADO.	   *
 	*******************************************************************************/
	
		if(this.condiciones.length === 0) return datos;

		var that = this,
			datos_filtrados = this.union ? [] : datos;

		_.each(that.condiciones, function(condicion){
			if(that.union)// OR
				datos_filtrados = _.uniq(datos_filtrados.concat(that.aplicar_condicion(condicion, datos)));
			else // AND
				datos_filtrados = that.aplicar_condicion(condicion, datos_filtrados);
		});
		return datos_filtrados;
	}

	Filtro.prototype.aplicar_condicion = function(condicion, source){
		var campo     = condicion.cp,
			operador  = isNaN(parseInt(condicion.op)) ? condicion.op.charCodeAt(0) : parseInt(condicion.op), // Admite el operador en su forma numerica o string
			expresion = condicion.ex,
			rsp       = [],
			match     = false,
			that      = this;

		if(expresion == "") return source;

		if(campo == '*'){
			_.each(source, function(registro){
				$.each(registro, function(){
					if(that.compara_expresion(this, expresion, operador)){
						rsp.push(registro);
						return false;
					}
				});
			});
		} else {
			_.each(source, function(registro){
				if(that.compara_expresion(registro[campo], expresion, operador))
					rsp.push(registro);
			});
		}

		return rsp;
	}

	/* Compara una expresion, contra el valor de un campo.
	 *
	 * Formato:  Filtro.compara_expresion(expresion1(pajar), expresion 2(aguja), operador).
	 * Devuelve: Si al aplicar el operador dado como tercer argumento,
	 * 			 con la segunda expresion (aguja) contra la primera expresion (pajar),
	 * 			 encuentra coincidencias, devuelve true. En caso contrario devuelve false.
	 * Expresión aguja es la que viene con  la condición. 
	 * Expresión pajar es la que tiene es registro.
	 */
	Filtro.prototype.compara_expresion = function(){
		var args = Array.prototype.slice.call(arguments, 0);

		if(args.length != 3) return false;
			
		var	expr1 = args[0],
			expr2 = args[1];
	
		if((!expr1 && isNaN(expr1)) || (!expr2 && isNaN(expr1))) return false;

		switch(args[2]){
			case 35: // # - Igual string case-sensitive
				return expr1 === expr2;
				break;
		 	case 60: // < con valor numérico ó fecha
		 	case 62: // > con valor numérico ó fecha
		 		var menor = args[2] === 60 ? true : false;

		 		// Si ambas son numeros
		 		if(!isNaN(expr1) && !isNaN(expr2))
		 			return  menor ? parseFloat(expr2) > parseFloat(expr1) : parseFloat(expr2) < parseFloat(expr1);
		 		// Si ambas son fechas españolas o inglesas, las convierte en objeto y las compara
		 		else if(CORE.validar('fecha', expr1) && CORE.validar('fecha',expr2))
		 			return 	menor ?
		 					CORE.fecha_2obj(expr2) > CORE.fecha_2obj(expr1):
		 					CORE.fecha_2obj(expr2) < CORE.fecha_2obj(expr1);
		 		else return false;
		 		break;
		 	case 61: // = con valor numérico y string no case-sensitive
		 		if(parseFloat(expr1) === parseFloat(expr2)) return true;
		 		expr1 += "";
		 		expr2 += "";
		 		if(expr1.toLowerCase() === expr2.toLowerCase()) return true;
		 		return false;
		 		break;
		 	case 33: // ! - Distinto de, numérico, string o fecha.
		 		return expr2 != expr1;
		 		break;
		 	case 37: // % - Contiene
		 		expr1 = expr1+"";//.toString();
		 		expr2 = expr2+"";//.toString();
		 		if(expr1.length == 0 || expr2.length == 0) return false;
		 		if(expr1.search('Object]') > -1 || expr2.search('Object]') > -1) return false;

		 		return CORE.no_acentos(expr1.toLowerCase()).search(CORE.no_acentos(expr2.toLowerCase())) > -1;
		 		break;
		 	case 36: // $ - No contiene
		 		return expr1.toLowerCase().search(expr2.toLowerCase()) == -1;	
		 		break;
		 	default:
		 		return false;
		 		break;
		}
	}
	
	CORE.aplicar_filtro = function(filtro, datos){
		if(_.isArray(datos)){
			
			if(!datos.length > 0) return [];
			
			if(!filtro.condiciones) 
				throw "El metodo aplicar_filtro, necesita un filtro como primer parametro.";
			if(!typeof datos || !_.isArray(datos) || !_.isObject(datos[0]))
				throw "Los datos a filtrar no son un Array de datos, el array está vacio, mal formado, o no es un array de objetos";

			var datos = datos || this;

			var datos_filtrados = filtro.union ? [] : datos;

			return filtro.aplicar_filtro(datos);
		} else if(_.isString(datos)){

			$.ajax({
				url: datos,
				type: 'GET',
				data: {
					filtro: JSON.stringify(filtro)
				}
			})
			.done(function(r){
				console.log('Respuesta:');
				console.debug(r);
				return r;
			})
			.fail(function(error) {
				console.log(error);
			});
		}
	}

	/*
	 * Aplica un grupo de filtros.
	 * Parametros:
	 * filtros - Array con todos los filtros a aplicar
	 * datos   - Datos sobre los que aplicar los filtros
	 * union   - false = AND, true = OR, forma en la que se aplican los filtros a los datos
	 */
	CORE.aplicar_filtros = function(_filtros, datos, union){

		var union = union || false,
			filtros = _.clone(_filtros);

		if(_.isArray(datos)){
			var datos_filtrados = [];

			if(!_.isArray(filtros) || filtros.length < 1) return datos;

			if(!union){ // AND
				datos_filtrados = datos
				while(filtros.length > 0){
					datos_filtrados = filtros.shift().aplicar_filtro(datos_filtrados);
				}
			} else // OR
				while(filtros.length > 0){
					datos_filtrados = _.union(datos_filtrados, filtros.shift().aplicar_filtro(datos));
				}

			return datos_filtrados;
		
		} else if(_.isString(datos)){
			// EN DESARROLLO
				//$.ajax({
					//url: datos,
					//type: 'GET',
					//data: {
						//filtro: JSON.stringify(filtro)
					//}
				//})
				//.done(function(r){
					//console.log('Respuesta:');
					//console.debug(r);
					//return r;
				//})
				//.fail(function(error) {
					//console.log(error);
				//});
		}
	}

	CORE.aplicar_condicion = function(condicion, datos){

		var datos = datos || this;

		return Filtro.prototype.aplicar_condicion(condicion, datos);
	}

	/* Accion:  	Funciona de forma similar a add_condicion, con la diferencia de que la expresión,
	 * 				en caso de contener varias palabras, las convierte en varias condiciones, que se 
	 * 				pueden aplicar de forma OR o AND. Como se añaden varias condiciones, los indices han
	 *   			de ser definidos por la clase, por lo tanto, no acepta indice como parametro.
	 * Formato: 	CORE.aplicar_busqueda(expresion, datos, union, nombre_campo)
	 * Parametros: 	
	 * nombre_campo	Igual que en add_condicion.
	 * expresion 	Consta de un operador seguido de un string. El string se separará por los espacios,
	 *				generando múltiples expresiones más sencillas.
	 * union		Devolverá los registros que coincidan con todas las condiciones(AND) o los que conincidan
	 * 				con alguna de las condiciones(OR). Si se omite, o se pasa el valor ALL, devolverá las AND, 
	 * 				seguidas de las OR.
	 * 
	 * ESTE METODO SIN union O CON union = ALL, Y NOMBRE DE CAMPO TRABAJA DE FORMA SIMILAR AL BUSCADOR DE GOOGLE
	 */
	CORE.aplicar_busqueda = function(expresion, datos, union, nombre_campo){
		/*
		 * A partir de la version 0.1.01
		 * Este tipo de busqueda funciona sin los operadores de filtros.
		 * Para poder usar el filtro, le asignaremos el operador '#'.
		 */
		var union 		= union || 'and', // Cambia a and, normalmente es all
			campo 		= nombre_campo || '*',
			expresiones = expresion.split(' '),
			operador = '%',
			flt 	= false,
			flt_and = false,
			flt_or	= false;

		union = union.toLowerCase();
		
		// Validacion
		if(union !== '' && union !== 'and' && union !== 'or' && union !== 'all')
			throw "El tercer parametro ( union ), debe ser and, or, all, '', u omitirse.";
		if(!_.isArray(datos) || !_.isObject(datos[0]))
			throw "Datos a filtrar debe de ser un array de objetos";
		if(datos.length == 0)
			throw "No hay datos para filtrar";

		expresiones = _.map(expresiones, function(ex){ return operador+ex; });

		if(union === '' || union === 'all')
			flt_and = new Filtro(false),
			flt_or  = new Filtro(true);
		else if(union === 'and')
			flt = new Filtro(false);
		else if(union === 'or')
			flt = new Filtro(true);

		if(flt){
			_.each(expresiones, function(ex){ flt.add_condicion(campo, ex); });
			
			return flt.aplicar_filtro(datos);
		} else if(flt_and && flt_or){
			_.each(expresiones, function(ex){ flt_and.add_condicion(campo, ex); });
			_.each(expresiones, function(ex){ flt_or.add_condicion(campo, ex); });

			return _.uniq(flt_and.aplicar_filtro(datos).concat(flt_or.aplicar_filtro(datos)));
		}
	}

	CORE.eventos.push(['inicio', function(){ // Se ejecutará al lanzar inicio
    	
        // Javascript
		this.interno.extender({aplicar_filtro: CORE.aplicar_filtro}, Array.prototype);
		this.interno.extender({aplicar_filtros: CORE.aplicar_filtros}, Array.prototype);
        this.interno.extender({aplicar_condicion: CORE.aplicar_condicion}, Array.prototype);
        this.interno.extender({aplicar_busqueda: CORE.aplicar_busqueda}, Array.prototype);

        // JQuery 
        if($) $.fn.aplicar_filtro = CORE.aplicar_filtro;
        if($) $.fn.aplicar_filtros = CORE.aplicar_filtros;
        if($) $.fn.aplicar_condicion = CORE.aplicar_condicion;
        if($) $.fn.aplicar_busqueda = CORE.aplicar_busqueda;
	}]);

}(DAF.API));

