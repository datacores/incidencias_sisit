/*************
 * NAVEGACIÓN *
 *************/

/*
 * Array navegacion, almacena las vistas por las que va pasando, asi sabe siempre donde volver.
 * Objeto que almacena todas las vistas de la aplicación.
 */
var routing = [],
    view = {
        upper_menu: new Vista (
            '../../bundles/app/vistas/upper_menu.tpl.html',
            upper_menu_controller,
            $('.page-content'), 'prepend'
        ),
        index: new Vista (
            '../../bundles/app/vistas/index.tpl.html',
            index_controller,
            $('#main_container')
        ),
        ticket_new: new Vista (
            '../../bundles/app/vistas/ticket/ticket_new.tpl.html',
            ticket_new_controller,
            $('#main_container')
        ),
        ticket_preConfirm: new Vista (
            '../../bundles/app/vistas/ticket/ticket_preConfirm.tpl.html',
            ticket_preConfirm_controller,
            $('#main_container')
        ),
        ticket_managingError: new Vista (
            '../../bundles/app/vistas/ticket/ticket_managingError.tpl.html',
            ticket_managingError_controller,
            $('#main_container')
        ),
        user_new: new Vista (
            '../../bundles/app/vistas/user/user_new.tpl.html',
            user_new_controller,
            $('#main_container')
        ),

        user_preConfirm: new Vista (
            '../../bundles/app/vistas/user/user_preConfirm.tpl.html',
            user_preConfirm_controller,
            $('#main_container')
        )
    };
