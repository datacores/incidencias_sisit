/*
 *	Para el óptimo funcionamiento del plugin, es recomendable añadir al CSS, la regla:
 *  .daf_modal { display: none; }
 * 	Si no se añade, el plugin funcionará bien igualmente, pero pueden verse de vez en cuando algun
 *  "flash", de aparecer y desparecer en un div, cuando se carge una vista HTML por primera vez.
 */

(function(){

	// Argumentos por orden: width, height, close, left, top, padding, color_fondo, borde, radio_borde, sombra
	Modal = function(){
		var args = Array.prototype.slice.call(arguments, 0);
		this.alto  = screen.height,
		this.ancho = screen.width,
		this.body  = document.getElementsByTagName('body')[0],
		this.modal_wrap = document.createElement('div'),
		this.modal = document.createElement('div'),
		this.btn_close = document.createElement('button'),
		this.x  = document.createTextNode('X');
		this.w  = args[0] || '900px', // width
		this.h  = args[1] || '50%',	 // height
		this.bc = args[2] || true, // Botón close
 		this.l  = args[3] || 'calc((100% - '+this.w+')/2', // Left
		this.t  = args[4] || 'calc((100% - '+this.h+')/3', // Top
		this.p  = args[5] || '16px',
		this.c  = args[6] || '#fff',
		this.b  = args[7] || '1px solid rgba(0, 0, 0, .2)',
		this.r  = args[8] || '5px',
		this.s  = args[9] || '0 5px 15px rgba(0, 0, 0, .5)';

		this.crea_modal();
	}
	
	// Lanza el modal que tiene como id el pasado como parametro
	Modal.prototype.crea_modal = function(){
		var that = this;
		this.modal_wrap.style.opacity = 0;
		this.modal_wrap.style.filter = 'alpha(opacity=0)';

		this.modal_wrap.style.position = 'absolute';
		this.modal_wrap.style.zIndex = '2000';
		this.modal_wrap.style.left = 0;
		this.modal_wrap.style.top = 0;
		this.modal_wrap.style.backgroundColor = 'rgba(0,0,0,0.6)';
		this.modal_wrap.style.boxSizing = 'border-box';
		this.modal_wrap.style.width  = '100%';
		this.modal_wrap.style.height = '100%';

		this.modal.style.opacity = 0;
		this.modal.style.filter = 'alpha(opacity=0)';

		this.modal.style.position = 'absolute';
		this.modal_wrap.style.zIndex = '2001';
		this.modal.style.left = this.l;
		this.modal.style.top	 = this.t;
		
		this.modal.style.width = that.w;
		this.modal.style.height = this.h;
		this.modal.style.padding = this.p;
		this.modal.style.backgroundColor = this.c;
		this.modal.style.border = this.b;
		this.modal.style.borderRadius = this.r;
		this.modal.style.boxShadow = this.s;

		if(this.bc) this.add_close();
	}

	Modal.prototype.add_close = function(){
		var that = this;
		this.modal.appendChild(this.btn_close);
		var pos_close = (this.modal.offsetWidth+7) + 'px';
		this.btn_close.style.position = 'absolute';
		this.btn_close.style.zIndex = '2002';
		this.btn_close.style.border = 'none';
		this.btn_close.style.right = pos_close;
		this.btn_close.style.top = '7px';
		this.btn_close.style.cursor = 'pointer';
		this.btn_close.style.backgroundColor = '#fff';
		this.btn_close.appendChild(this.x);

		this.btn_close.addEventListener('click', function(){
			that.cierra_modal();
		});
	}

	Modal.prototype.abre_modal = function(callback){
		var callback = _.isFunction(callback) ? callback : function(){};
		this.body.appendChild(this.modal_wrap);
		this.modal_wrap.appendChild(this.modal);
		this.modal_wrap.style.opacity = 1;
		this.modal_wrap.style.filter = 'alpha(opacity=100)';
		fadeIn(this.modal, callback(this.modal));
	}

	Modal.prototype.cierra_modal = function(){
		var that = this,
			callback = function(){
				if(that.modal_wrap.parentNode)
					that.modal_wrap.parentNode.removeChild(that.modal_wrap);
			};
		
		fadeOut(that.modal, callback);
	}

	Modal.prototype.set_html = function(html){
		// Si se pasa un objeto
		if(typeof(html) === 'object') this.modal.innerHTML = html.innerHTML;
		else {
			// Si es texto no html
			if(html.search('<') == -1 && html.search('>') == -1){
				// Si el texto recibido coincide con un id en el DOM
				if(document.getElementById(html))
					this.modal.innerHTML = document.getElementById(html).innerHTML;
				else throw('identificador o HTML pasado al metodo set_html, no valido');
				
			} 
			// Si es texto HTML
			else this.modal.innerHTML = html;
		}
		if(this.bc) this.add_close();
	}

	Modales = function(){
		var modales = document.getElementsByClassName('daf_modal'),
			contenedor = {};

		for(var i = 0; i < modales.length; i++){
			modales[i].style.display = 'none';
			contenedor[modales[i].id] = new Modal(
				modales[i].getAttribute('data-width') || false,
				modales[i].getAttribute('data-height') || false,
				modales[i].getAttribute('data-close') || true,
				modales[i].getAttribute('data-left') || false,
				modales[i].getAttribute('data-top') || false,
				modales[i].getAttribute('data-padding') || false,
				modales[i].getAttribute('data-color_fondo') || false,
				modales[i].getAttribute('data-borde') || false,
				modales[i].getAttribute('data-radio_borde') || false,
				modales[i].getAttribute('data-sombra') || false
			);
			contenedor[modales[i].id].set_html(modales[i]);
		}

		return contenedor;
	}

	// Metodos Privados
	function fadeIn(element, callback) {
	    var op = 0.1;
	    var timer = setInterval(function(){
	        if (op >= 1){
	        	clearInterval(timer);
	        	if(callback) callback();
	        }
	        element.style.opacity = op;
	        element.style.filter = 'alpha(opacity='+op*100+')';
	        op += op*0.1;
	    }, 1);
	}

    function fadeOut(element, callback) {
    	var op = 1;
    	var timer = setInterval(function(){
	        if(op <= 0.1){
	            clearInterval(timer);
	            if(callback) callback();
	        } else {
	        	element.style.opacity = op;
	        	element.style.filter = 'alpha(opacity='+op*100+')';
	        	op -= op*0.1;
	    	}
	    }, 1);
	}
}());
