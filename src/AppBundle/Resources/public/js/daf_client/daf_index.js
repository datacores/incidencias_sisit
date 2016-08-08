/***************************
 * INICIO DE LA APLICACIÓN *
 **************************/

var app = new DAF,
    modal = new Modales,
    modal_active = false;

// Objeto que almacena TODOS los datos de la aplicacion
var DATA = {
    machines: [],
    services: [],
    impact:   [],
    criticality: []
};

// Objeto para gestionar la carga inicial de datos
var load_index = {
    machines:   false,
    services:   false,
    impact:     false,
    criticality: false,
    test: function() { // Testea si se ha terminado la carga inicial, y ejecuta acciones asociadas
        if (this.machines && this.services && this.impact && this.criticality) {
            index();
            modal.cargando_datos.cierra_modal();
        }
    }
};

function index() {
    modal.cargando_datos.cierra_modal();
    view.upper_menu.render();
    view.index.render();
}

/*
 * Función que implementa comportamientos a todos los elementos con clase .volver,
 * dentro del objeto nodo recibido como parametro.
 * Hace uso del objeto de navegación para volver a la vista anterior, siendo el
 * objeto nodo la raiz de la vista que llama a la función.
 */
function set_action_back(obj){
    obj.find('.back').off('click');
    obj.find('.back').on('click', function(){
        routing.pop();
        var destino = routing.pop();
        if(destino)  {
            view[destino].render();
        }

        // Si hay un modal activo abre de nuevo modal
        if(_.isObject(modal_active)){
            view[modal_active.nombre]();
        }
    });
}

//$(document).ready (function() {
//
//    modal.cargando_datos.abre_modal();
//    var data_types = ['machines', 'services'];
//
//    if (data_types.length == 0) {
//        load_index.test();
//        return false;
//    }
//
//    _.each(data_types, function(td) {
//        app.peticion (
//            'GET', td, false, false,
//            function(data) {
//                DATA[td] = data;
//                load_index[td] = true;
//                load_index.test();
//            },
//            function() {
//                //Error
//                modal.cargando_datos.cierra_modal();
//                modal.error_cargando_datos.abre_modal();
//            }
//        );
//    });
//});


$(document).ready (function() {

    modal.cargando_datos.abre_modal();
    var data_types = ['machines', 'services', "impact", "criticality"];

    _.each(data_types, function(td) {
        app.peticion(
            'GET', td, false, false,
            function(data) {
                DATA[td] = data;
                load_index[td] = true;
                load_index.test();
            },
            function() {
                //Error
                modal.cargando_datos.cierra_modal();
                modal.error_cargando_datos.abre_modal();
            }
        );
    });
});