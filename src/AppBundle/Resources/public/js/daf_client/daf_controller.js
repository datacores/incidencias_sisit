/******************************
 *
 *       GETTERS & SETTERS
 *
 *************************/

/**
 * Devuelve la información del ticket antes de preprocesarlo.
 * @param $cv
 * @returns {{abstract: *, description: (*|string), issuedUser: *, requestUser: *, impactLevel: *, criticalLevel: *, inventory_number: *, commonError: *, user: *}}
 */
var $getTicket = function($cv) {
    return {
        abstract:           $cv.find('#abstract').val(),
        description:        CKEDITOR.instances['description'].getData(),
        issuedUser:         $cv.find('#issuedUser').val(),
        requestUser:        $cv.find('#requestUser').val(),
        impactLevel:        $cv.find('#impactLevel option:selected').text(),
        criticalLevel:      $cv.find('#criticalLevel option:selected').text(),
        inventory_number:   $cv.find('#inventory_number option:selected').text(),
        commonError:        $cv.find('#issue_1').is(':checked') || $cv.find('#issue_2').is(':checked') ||
        $cv.find('#issue_3').is(':checked'),
        user:               $cv.find('#issuedUser').val()
    };
};

/**
 *
 * @param cv
 * @param services
 * @returns {{user_name: *, user_surname: *, user_nif: *, user_dpt: *, user_services: *}}
 */
var getUser = function(cv, services) {
    return {
        user_name:      cv.find('#new_user_name').val(),
        user_surname:   cv.find('#new_user_surname').val(),
        user_nif:       cv.find('#new_user_nif').val(),
        user_dpt:       cv.find('#new_user_dpt').val(),
        user_services:  services
    };
};

/******************************
 *
 *       CONTROLADORES QUE PREPROCESAN
 *       DATOS DE PLANTILLAS
 *
 *************************/

/**
 *
 * @param $newTicket
 */
var $setNewTicket = function ($newTicket) {
    $('#abstract_label').text($newTicket.abstract);
    $('#description_label').append($.parseHTML($newTicket.description));
    $('#issuedUser_label').text($newTicket.issuedUser);
    $('#requestUser_label').text($newTicket.requestUser);
    $('#criticalLevel_label').text($newTicket.criticalLevel);
    $('#impactLevel_label').text($newTicket.impactLevel);
    $('#inventory_number_label').text($newTicket.inventory_number);
};

/**
 *
 * @param $newTicket
 */
var $processTicket = function ($newTicket) {
    if ($newTicket.commonError){
        view.ticket_managingError.render();
    } else {
        view.ticket_preConfirm.render();
        $setNewTicket($newTicket);

        $user = _.findWhere(DATA.ldapUsers, { usuario_id: $newTicket.user});
        $('#issuedUser_name_label').text($user.displayname);
        $('#issuedUser_login_label').text($user.usuario_id);

        // $.ajax({
        //     url:        'http://pincap.ayuncordoba.org/A08/item/' + $newTicket.inventory_number,
        //     dataType:   'json',
        //     method:     'GET',
        //     headers:    {
        //         'Access-Control-Allow-Origin':      '*',
        //         'Access-Control-Allow-Methods':     'GET, POST, OPTIONS, PUT, PATCH, DELETE',
        //         'Access-Control-Allow-Headers':     'X-Requested-With,content-type',
        //         'Access-Control-Allow-Credentials': true
        //     }
        // }).done(function(rsp) {
        //     console.log(rsp);
        // });
    }
};

/**
 *
 * @param $newUser
 */
var processUser = function ($newUser) {

    view.user_preConfirm.render();
    $('#new_user_name_label').text($newUser.user_name);
    $('#new_user_surname_label').text($newUser.user_surname);
    $('#new_user_nif_label').text($newUser.user_nif);
    $('#new_user_dpt_label').text($newUser.user_dpt);
    $($newUser.user_services).each(function() {
        $('#new_user_services_label').append(
            'Servicio: ' + this.name + ' Accion: ' + this.action + ' Vigencia: ' + this.life + ' Info: ' + this.info +'<br>'
        );
    });
};

/****************************
 *
 *          CONTROLADORES
 *            DE EVENTOS
 *          DE PLANTILLAS
 *
 ***************************/

function ticket_managingError_controller(){}
function user_preConfirm_controller(){}

/**
 * Gestiona eventos de la plantilla 'upper_menu.tpl.html'
 * --------
 * It handles events from 'upper_menu.tpl.html' template
 */
function upper_menu_controller() {

    var $container = $('#upper_menu');

    $container.find('#view_list_informationAssets').on('click', function() {
        view.informationAssets_list.render();
    });
    $container.find('#home').on('click', function() {
        view.index.render();
    });
    $container.find('#ticket_management').on('click', function () {
        view.ticket_new.render();
    });
}

/**
 * Gestiona eventos de la plantilla 'index.tpl.html'
 * --------
 * It handles events from 'index.tpl.html' template
 */
function index_controller() {

    var $cv = $('#index');

    $cv.find('#ticket_management').on('click', function () {
        view.ticket_new.render();
    });
    $cv.find('#user_management').on('click', function () {
        view.user_new.render();
    });
}

function ticket_new_controller() {

    routing.push('ticket_new');
    var $cv = $('#foreground');
    $cv.find('#submit_new_ticket').off('click');
    $cv.find('#submit_new_ticket').on('click', function() {
        var $newTicket = $getTicket($cv);
        $processTicket($newTicket);
    });

    $cv.find('#differentUser').off('click');
    $cv.find('#differentUser').on('click', function() {
        if ($('#differentUser').is(':checked')){
            $('#issuedUser').parent().show();
        } else {
            $('#issuedUser').parent().hide();
        }
    });
}

function ticket_preConfirm_controller(){
    routing.push('ticket_preConfirm');
    var $cv = $('#foreground_preConfirm');

    $cv.find('#notification').off('click');
    $cv.find('#notification').on('click', function() {
        $("#squarespaceModal").modal("show");
    });

    var $mcv = $('#squarespaceModal');

    $mcv.find('#confirm_bt').off('click');
    $mcv.find('#confirm_bt').on('click', function() {
        var $body = {
            body: CKEDITOR.instances['send_notification'].getData()
        };
        app.peticion(
            'POST', 'email', $body, 'json',
            function (rsp) {
                toastr.success('Email enviado con éxito');
                location.reload();
            },
            function (error) {
                toastr.error('Error al editar el curso. Inténtelo de nuevo, si persiste el error pulse F5');
            }
        )
    });

    set_action_back($cv);
}

function user_new_controller() {

    routing.push('user_new');
    var cv                             = $('#foreground_newUser'),
        tabla_services                 = new Tabla ('services_table', true, true),
        filtro_columnas_services       = new Filtro,
        filtro_services                = new Filtro;

    var paginador_services = new Paginador('#controles_listado_services', true, DATA.services, function (datos_paginados) {
        tabla_services.carga_registros(datos_paginados, 'id', function () {
        });
    });

    services = [];

    cv.find('.checkbox').on('click', function(ev) {
        var id      = ev.currentTarget.getAttribute('data-id');
        var col     = $(this).parent().index();
        var action;
        var life    = $(this).parent().siblings().eq(4).find('textarea').val();
        var info    = $(this).parent().siblings().eq(5).find('textarea').val();

        $(this).parent().siblings().find('.check').prop('checked', false);

        services = jQuery.grep(services, function(value) {
            return value.name != id;
        });

        if ($(this).find('.check').is(':checked')) {
            switch (col) {
                case 1:
                    action = 'alta';
                    break;
                case 2:
                    action = 'baja';
                    break;
                case 3:
                    action = 'modificacion';
                    break;
                case 4:
                    action = 'renovacion';
                    break;
            }

            services.push({
                name:   id,
                action: action,
                life:   life,
                info:   info
            });
        }
    });

    cv.find('.textarea1').on('change', function(ev) {

        var id      = ev.currentTarget.getAttribute('data-id');
        var life    = $(this).find('textarea').val();

        if (services.length > 0) {
            var service = _.findWhere(services, { name: id});

            services = jQuery.grep(services, function(value) {
                return value.name != id;
            });

            if (service) {
                services.push({
                    name:   id,
                    action: service.action,
                    life:   life,
                    info:   service.info
                });
            }
        }
    });

    cv.find('.textarea2').on('change', function(ev) {
        var id      = ev.currentTarget.getAttribute('data-id');
        var info    = $(this).find('textarea').val();
        if (services.length > 0) {
            var service = _.findWhere(services, { name: id});

            services = jQuery.grep(services, function(value) {
                return value.name != id;
            });

            if (service) {
                services.push({
                    name:   id,
                    action: service.action,
                    life:   service.life,
                    info:   info
                });
            }
        }
    });

    tabla_services.set_cambia_filtro(function ($input) {
        var _id = $input.attr('data-filtro-id'),
            valor = $input.val();

        filtro_columnas_services.add_condicion(_id, "%"+valor, _id);
        refrescar_paginacion_services();
    });

    tabla_services.set_reordenar(function(col) {
        DATA.services = (this.orden) ? _.sortBy(DATA.services, col).reverse() : _.sortBy(DATA.services, col);
        refrescar_paginacion_services();
    });

    cv.find('#buscador_services').off('change');
    cv.find('#buscador_services').on('keyup', function(ev) {
        if(espera) clearTimeout(espera);
        var espera = setTimeout(function(){
            filtro_services.add_condicion('*', "%"+ev.currentTarget.value, 'filtro_services');
            refrescar_paginacion_services();
        }, 1000);
    });

    function refrescar_paginacion_services() {
        paginador_services.set_datos(
            app.aplicar_filtros([filtro_columnas_services, filtro_services], DATA.services)
        );
        paginador_services.refrescar();
    }

    cv.find('#submit_preConfirm').off('click');
    cv.find('#submit_preConfirm').on('click', function(ev) {
        var $newUser = getUser(cv, services);
        processUser($newUser);
    });
}