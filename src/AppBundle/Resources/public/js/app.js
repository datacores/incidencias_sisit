var $setMaterial = function($material_needed1, $material_needed2) {
    if ($material_needed1) {
        $('#material_needed_label').text("Tinta/Toner de impresora");
    }

    if ($material_needed2) {
        var $val = "";
        if ($material_needed1) {
            $val = "Tinta/Toner de impresora, ";
        }
        $('#material_needed_label').text($val+"Material informático (cable, ratón, etc)");
    }
};
//       $setMaterial($newTicket.material_needed_1, $newTicket.material_needed_2);

//       $('#material_details_label').append($.parseHTML($newTicket.material_details));