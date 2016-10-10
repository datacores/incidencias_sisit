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
            this.action + " en " + this.name + " | " + "Vigencia: " + this.life + ", Info: " + this.info +'<br>'
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
function user_preConfirm_controller(){
    var $cv = $('#foreground_newUser_preConfirm');
    set_action_back($cv);
}

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
    $container.find('#user_management').on('click', function () {
        view.user_new.render();
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

function writeHardwareInfo(hardware, cv) {
    var $machineInfo = cv.find('machineInfo');
    $($machineInfo+'.row:nth-child(1) .col:nth-child(2)').val(hardware.cod_item);
    $($machineInfo+'.row:nth-child(1) .col:nth-child(2)').val(hardware.n_serie);
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

function ticket_preConfirm_controller() {
    routing.push('ticket_preConfirm');
    var $cv = $('#foreground_preConfirm');
    var newTicket = $getTicket($cv);

    $.ajax({
        url:        "/machines/'"+ newTicket.inventory_number.replace('-','') + "'",
        dataType:   'json',
        method:     'GET'
    }).done(function(rsp) {
        $.each(rsp, function () {
            console.log($cv,this);
        });
    });

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
        services_table                 = new Tabla ('services_table', true, true),
        services_column_filter         = new Filtro,
        services_filter                = new Filtro;

    var services_pagination = new Paginador('#controles_listado_services', true, DATA.services, function (paginated_data) {
        services_table.carga_registros(paginated_data, 'id', function () {});
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

    services_table.set_cambia_filtro(function ($input) {
        var _id = $input.attr('data-filtro-id'),
            valor = $input.val();

        services_column_filter.add_condicion(_id, "%"+valor, _id);
        services_pagination_refresh();
    });

    services_table.set_reordenar(function(col) {
        DATA.services = (this.orden) ? _.sortBy(DATA.services, col).reverse() : _.sortBy(DATA.services, col);
        services_pagination_refresh();
    });

    cv.find('#buscador_services').off('change');
    cv.find('#buscador_services').on('keyup', function(ev) {
        if(espera) clearTimeout(espera);
        var espera = setTimeout(function(){
            services_filter.add_condicion('*', "%"+ev.currentTarget.value, 'services_filter');
            services_pagination_refresh();
        }, 1000);
    });

    function services_pagination_refresh() {
        services_pagination.set_datos(
            app.aplicar_filtros([services_column_filter, services_filter], DATA.services)
        );
        services_pagination.refrescar();
    }

    cv.find('#submit_preConfirm').off('click');
    cv.find('#submit_preConfirm').on('click', function(ev) {
        var $newUser = getUser(cv, services);
        processUser($newUser);
    });
}