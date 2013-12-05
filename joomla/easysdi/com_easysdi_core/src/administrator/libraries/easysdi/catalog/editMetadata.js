js = jQuery.noConflict();
var currentUrl = location.protocol + '//' + location.host + location.pathname;
var tabIsOpen = false;
js('document').ready(function() {


    // Change publish date field to Calendar field
    Calendar.setup({
        // Id of the input field
        inputField: "publish_date",
        // Format of the input field
        ifFormat: "%Y-%m-%d",
        // Trigger for the calendar (button ID)
        button: "publish_date_img",
        // Alignment (defaults to "Bl")
        align: "Tl",
        singleClick: true,
        firstDay: 1
    });


    /**
     * Control the "Open All" button.
     */
    js('#btn_toogle_all').click(function() {
        var btn = js(this);
        if (tabIsOpen) {
            btn.text('Tout ouvrir');
            js('.inner-fds').hide();
            js('.collapse-btn').attr({'src': '/joomla/administrator/components/com_easysdi_catalog/assets/images/expand.png'});
            tabIsOpen = true;
        } else {
            btn.text('Tout fermer');
            js('.inner-fds').show();
            js('.collapse-btn').attr({'src': '/joomla/administrator/components/com_easysdi_catalog/assets/images/collapse_top.png'});
            tabIsOpen = false;
        }

    });
    /**
     * When the preview modal is visible, we colorize the XML.
     */
    js('#previewModal').on('show.bs.modal', function() {
        SyntaxHighlighter.highlight();
    });

    /**
     * We override the "submitbutton" function for Joomla buttonbar .
     * 
     * @param {string} task The task to execute.
     * @returns {Boolean}
     */
    Joomla.submitbutton = function(task) {

        if (task == '') {
            return false;
        } else {
            var actions = task.split('.');
            var form = document.getElementById('form-metadata');
            var form_import = document.getElementById('form_import_resource');

            switch (actions[1]) {
                case 'cancel':

                    break;
                case 'save':
                case 'saveAndContinue':
                    Joomla.submitform(task, form);
                    return true;
                    break;
                case 'control':
                    if (document.formvalidator.isValid(form)) {
                        js('#system-message-container').remove();
                        bootbox.alert(Joomla.JText._('COM_EASYSDI_CATALOGE_METADATA_CONTROL_OK', 'COM_EASYSDI_CATALOGE_METADATA_CONTROL_OK'));
                        break;
                    }
                    break;
                case 'valid':
                case 'validAndClose':
                    if (document.formvalidator.isValid(form)) {
                        Joomla.submitform(task, form);
                        break;
                    }
                    break;
                case 'show':
                case 'preview':
                    js('input[name="task"]').val(task);
                    js.ajax({
                        url: currentUrl + '?' + task,
                        type: js('#form-metadata').attr('method'),
                        data: js('#form-metadata').serialize(),
                        success: function(data) {
                            var response = js.parseJSON(data);
                            if (response.success) {
                                js('#previewModalBody').html(response.xml);
                                js('#previewModal').modal('show');
                            }
                        }
                    });
                    break;
                case 'inprogress':
                    Joomla.submitform(task, form);
                    break;
                case 'publish':
                    if (document.formvalidator.isValid(form)) {
                        Joomla.submitform(task, form);
                    }
                    break;
                case 'setPublishDate':
                    if (document.formvalidator.isValid(form)) {
                        js('#publishModal').modal('show');
                        break;
                    }
                    break;
                case 'publishWithDate':
                    js('#jform_published').val(js('#publish_date').val());
                    Joomla.submitbutton('metadata.publish');
                    break;
                case 'replicate':
                    js('#searchModal').modal('show');
                    break;
                case 'searchresource':
                    searchResource(task);
                    break;
                case 'importResource':
                    Joomla.submitform(task, form_import);
                    break;
                case 'toggle':
                    toggleAll();
                    break;
            }

        }
    }
    ;
}
);
function searchResource(task) {
    if (js('#resource_name').val().length < 3) {
        js('#resource_name_group').addClass('error');
        return;
    }

    js('input[name="task"]').val(task);
    js('#resource_name_group').addClass('error');

    var search_form = js('#form_search_resource');
    js.ajax({
        url: currentUrl + '?' + task,
        type: search_form.attr('method'),
        data: search_form.serialize(),
        success: function(data) {
            var response = js.parseJSON(data);
            if (response.success) {
                var items = '';
                js.each(response.result, function() {
                    items += '<tr><td><input type="radio" name="resource_guid" id="resource_guid_' + this.guid + '" value="' + this.guid + '" checked=""</td><td>' + this.name + '</td><td>' + this.created + '</td><td>' + this.guid + '</td></tr>';
                });
                js('#search_result').html(items);
                js('#search_table').show();
                js('#search_table').dataTable({
                    "bFilter": false,
                    "oLanguage": {
                        "sLengthMenu": "Afficher _MENU_ resultats par page",
                        "sZeroRecords": "Aucune réponse",
                        "sInfo": "Afficher _START_ à _END_ de _TOTAL_ resultats",
                        "sInfoEmpty": "Afficher 0 à 0 de 0 resultats",
                        "sInfoFiltered": "(Filtré de _MAX_ total resultats)"
                    }
                });
            }
        }
    });
}

function toggleAll() {
    var btn = js('#btn_toogle_all');
    if (tabIsOpen) {
        btn.text('Tout ouvrir');
        js('.inner-fds').hide();
        js('.collapse-btn').attr({'src': '/joomla/administrator/components/com_easysdi_catalog/assets/images/expand.png'});
        tabIsOpen = false;
    } else {
        btn.text('Tout fermer');
        js('.inner-fds').show();
        js('.collapse-btn').attr({'src': '/joomla/administrator/components/com_easysdi_catalog/assets/images/collapse_top.png'});
        tabIsOpen = true;
    }
}

function collapse(id) {

    var uuid = getUuid('collapse-btn-', id);
    var current_div = js('#inner-fds-' + uuid);
    var current_btn = js('#' + id);
    current_div.toggle('fast', function() {
        if (current_div.css('display') == 'none') {
            current_btn.attr({'src': '/joomla/administrator/components/com_easysdi_catalog/assets/images/expand.png'});
        } else {
            current_btn.attr({'src': '/joomla/administrator/components/com_easysdi_catalog/assets/images/collapse_top.png'});
        }
    });
}

function addField(id, idwi, relid, parent_path, lowerbound, upperbound) {
    js.get(currentUrl + '?view=ajax&parent_path=' + parent_path + '&relid=' + relid, function(data) {

        js('#attribute-group-' + idwi + ':last').after(data);
        if (js(data).find('select') !== null) {
            chosenRefresh();
        }

        js(data).find('button').each(function() {
            var idbtn = js(this).attr('id');
            Calendar.setup({
                inputField: idbtn.replace('_img', ''),
                ifFormat: "%Y-%m-%d",
                button: idbtn,
                align: "Tl",
                singleClick: true,
                firstDay: 1
            });
        });
    });
}

function addOrRemoveCheckbox(id, relid, parent_path, path) {
    var checked = js('#' + id).is(':checked');
    if (checked) {
        addToStructure(relid, parent_path);
    } else {
        removeFromStructure(path);
    }

}

function addToStructure(relid, parent_path) {
    js.get(currentUrl + '?view=ajax&parent_path=' + parent_path + '&relid=' + relid);
}

function addFieldset(id, idwi, relid, parent_path, lowerbound, upperbound) {
    var uuid = getUuid('add-btn-', id);
    js.get(currentUrl + '?view=ajax&parent_path=' + parent_path + '&relid=' + relid, function(data) {
        js('#bottom-' + idwi).before(data);
        if (js(data).find('select') !== null) {
            chosenRefresh();
        }

        js(data).find('button').each(function() {
            idbtn = js(this).attr('id');
            Calendar.setup({
                inputField: idbtn.replace('_img', ''),
                ifFormat: "%Y-%m-%d",
                button: idbtn,
                align: "Tl",
                singleClick: true,
                firstDay: 1
            });
        });
        var occurance = getOccuranceCount('.outer-fds-' + idwi);
        if (upperbound > occurance) {
            js('.add-btn-' + idwi).show();
        }

        if (occurance > lowerbound) {
            js('.remove-btn-' + idwi).show();
        }

        if (upperbound == occurance) {
            js('.add-btn-' + idwi).hide();
        }
    });
}

function allopen(){
    js('.inner-fds').show();
}

function confirmFieldset(id, idwi, lowerbound, upperbound) {
    bootbox.confirm("Are you sure?", function(result) {
        if (result) {
            removeFieldset(id, idwi, lowerbound, upperbound);
        }
    });
}

function confirmField(id, idwi, lowerbound, upperbound) {
    bootbox.confirm("Are you sure?", function(result) {
        if (result) {
            removeField(id, idwi, lowerbound, upperbound);
        }
    });
}

function removeFromStructure(id) {
    var uuid = getUuid('remove-btn-', id);
    js.get(currentUrl + '/?task=ajax.removeNode&uuid=' + uuid, function(data) {
        var response = js.parseJSON(data);
        return response.success;
    });
}

function removeField(id, idwi, lowerbound, upperbound) {
    var uuid = getUuid('remove-btn-', id);
    js.get(currentUrl + '/?task=ajax.removeNode&uuid=' + uuid, function(data) {
        var response = js.parseJSON(data);
        if (response.success) {
            var toRemove = js('#attribute-group-' + uuid);
            toRemove.remove();
        }
    });
}

function removeFieldset(id, idwi, lowerbound, upperbound) {
    var uuid = getUuid('remove-btn-', id);
    js.get(currentUrl + '/?task=ajax.removeNode&uuid=' + uuid, function(data) {
        var response = js.parseJSON(data);
        if (response.success) {

            var toRemove = js('#outer-fds-' + uuid);
            toRemove.remove();
            var occurance = getOccuranceCount('.outer-fds-' + idwi);
            if (lowerbound == occurance) {
                js('.remove-btn-' + idwi).hide();
            }

            if (upperbound > occurance) {
                js('.add-btn-' + idwi).show();
            }
        }
    });
}

function confirmEmptyFile(id) {
    bootbox.confirm("Are you sure?", function(result) {
        if (result) {
            emptyFile(id);
        }
    });
}

function emptyFile(id) {
    var uuid = getUuid('empty-btn-', id);
    var replaceUuid = uuid.replace(/-/g, '_');
    js('#jform_' + replaceUuid + '_filetext').attr('value', '');
    js('#preview-' + uuid).hide();
    js('#empty-file-' + uuid).hide();
}

/**
 * 
 * @param {string} prefix
 * @param {string} string
 * @returns {array}
 */
function getUuid(prefix, string) {
    string = string.replace(prefix, '');
    return string;
}

function getOccuranceCount(className) {
    var nbr = js(className).length;
    return nbr;
}

function chosenRefresh() {
    js('select').chosen({
        disable_search_threshold: 10,
        allow_single_deselect: true
    });
}

function filterBoundary(parentPath, value) {
    if(value == ''){
        
    }
    
    js.get(currentUrl + '?task=ajax.getBoundaryByCategory&value=' + value, function(data) {
        var response = js.parseJSON(data);
        var replaceId = parentPath.replace(/-/g, '_');
        var selectList = js('#jform_' + replaceId + '_sla_gmd_dp_description_sla_gco_dp_CharacterString');
        selectList.empty();
        var items = "<option value=\"\"></option>";
        js.each(response, function(i) {
            if (i === 0) {
                items += "<option selected=\"selected\" value=\"" + this.option_value + "\">" + this.option_value + "</option>";
            } else {
                items += "<option value=\"" + this.option_value + "\">" + this.option_value + "</option>";
            }
        });
        selectList.html(items);
        selectList.trigger("liszt:updated");
        //selectList.change();

        js('#jform_' + replaceId + '_sla_gmd_dp_geographicElement_la_1_ra__sla_gmd_dp_EX_GeographicBoundingBox_sla_gmd_dp_northBoundLatitude_sla_gco_dp_Decimal').attr('value', response['0'].northbound);
        js('#jform_' + replaceId + '_sla_gmd_dp_geographicElement_la_1_ra__sla_gmd_dp_EX_GeographicBoundingBox_sla_gmd_dp_southBoundLatitude_sla_gco_dp_Decimal').attr('value', response['0'].southbound);
        js('#jform_' + replaceId + '_sla_gmd_dp_geographicElement_la_1_ra__sla_gmd_dp_EX_GeographicBoundingBox_sla_gmd_dp_eastBoundLongitude_sla_gco_dp_Decimal').attr('value', response['0'].eastbound);
        js('#jform_' + replaceId + '_sla_gmd_dp_geographicElement_la_1_ra__sla_gmd_dp_EX_GeographicBoundingBox_sla_gmd_dp_westBoundLongitude_sla_gco_dp_Decimal').attr('value', response['0'].westbound);
        js('#jform_' + replaceId + '_sla_gmd_dp_geographicElement_la_2_ra__sla_gmd_dp_EX_GeographicDescription_sla_gmd_dp_geographicIdentifier_sla_gmd_dp_MD_Identifier_sla_gmd_dp_code_sla_gco_dp_CharacterString').attr('value', response['0'].alias);

        var map_parent_path = replaceId + '_sla_gmd_dp_geographicElement_la_1_ra__sla_gmd_dp_EX_GeographicBoundingBox';
        drawBB(map_parent_path);
    });
}

function setBoundary(parentPath, value) {
    js.get(currentUrl + '/?task=ajax.getBoundaryByName&value=' + value, function(data) {
        var response = js.parseJSON(data);
        var replaceId = parentPath.replace(/-/g, '_');
        js('#jform_' + replaceId + '_sla_gmd_dp_geographicElement_la_1_ra__sla_gmd_dp_EX_GeographicBoundingBox_sla_gmd_dp_northBoundLatitude_sla_gco_dp_Decimal').attr('value', response.northbound);
        js('#jform_' + replaceId + '_sla_gmd_dp_geographicElement_la_1_ra__sla_gmd_dp_EX_GeographicBoundingBox_sla_gmd_dp_southBoundLatitude_sla_gco_dp_Decimal').attr('value', response.southbound);
        js('#jform_' + replaceId + '_sla_gmd_dp_geographicElement_la_1_ra__sla_gmd_dp_EX_GeographicBoundingBox_sla_gmd_dp_eastBoundLongitude_sla_gco_dp_Decimal').attr('value', response.eastbound);
        js('#jform_' + replaceId + '_sla_gmd_dp_geographicElement_la_1_ra__sla_gmd_dp_EX_GeographicBoundingBox_sla_gmd_dp_westBoundLongitude_sla_gco_dp_Decimal').attr('value', response.westbound);
        js('#jform_' + replaceId + '_sla_gmd_dp_geographicElement_la_2_ra__sla_gmd_dp_EX_GeographicDescription_sla_gmd_dp_geographicIdentifier_sla_gmd_dp_MD_Identifier_sla_gmd_dp_code_sla_gco_dp_CharacterString').attr('value', response.alias);

        var map_parent_path = replaceId + '_sla_gmd_dp_geographicElement_la_1_ra__sla_gmd_dp_EX_GeographicBoundingBox';
        drawBB(map_parent_path);
    });
}

function clearbbselect(parent_path) {

    js('#jform_' + parent_path + '_sla_sdi_dp_extentType_sla_gco_dp_CharacterString').val('').trigger('liszt:updated');
    js('#jform_' + parent_path + '_sla_gmd_dp_description_sla_gco_dp_CharacterString').val('').trigger('liszt:updated');
}

function drawBB(parent_path) {
    var top = js('#jform_' + parent_path + '_sla_gmd_dp_northBoundLatitude_sla_gco_dp_Decimal').attr('value');
    var bottom = js('#jform_' + parent_path + '_sla_gmd_dp_southBoundLatitude_sla_gco_dp_Decimal').attr('value');
    var right = js('#jform_' + parent_path + '_sla_gmd_dp_eastBoundLongitude_sla_gco_dp_Decimal').attr('value');
    var left = js('#jform_' + parent_path + '_sla_gmd_dp_westBoundLongitude_sla_gco_dp_Decimal').attr('value');
    if (top != '' && bottom != '' && left != '' && right != '') {

        var map = window['map_' + parent_path];
        var dest = new proj4.Proj(map.getProjection());
        var source = new proj4.Proj("EPSG:4326");
        var bottom_left = new proj4.Point(left, bottom);
        var top_right = new proj4.Point(right, top);
        proj4.transform(source, dest, bottom_left);
        proj4.transform(source, dest, top_right);
        var bounds = new OpenLayers.Bounds(bottom_left.x, bottom_left.y, top_right.x, top_right.y);
        var box = new OpenLayers.Feature.Vector(bounds.toGeometry());
        var layer = window['polygonLayer_' + parent_path];
        layer.addFeatures([box]);
    }
}