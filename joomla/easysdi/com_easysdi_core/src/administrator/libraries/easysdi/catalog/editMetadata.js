js = jQuery.noConflict();
var currentUrl = location.protocol + '//' + location.host + location.pathname;
var tabIsOpen;
var resourcetypes;
js('document').ready(function() {

    /**
     * Retrieves resource types and displays or not the checkboxes versions. 
     */
    js.get(currentUrl + '/?option=com_easysdi_catalog&task=ajax.getResourceType', function(data) {
        resourcetypes = js.parseJSON(data);

        for (var i in resourcetypes) {
            if (resourcetypes[i].versioning != 0) {
                js('#version-control-group').show();
            }
        }

    });
    
    /**
     * Boundaries NSEW inputs events
     */
    js('input[id$=_sla_gmd_dp_northBoundLatitude_sla_gco_dp_Decimal]').each(function(){
        var parentPath = js(this).attr('id').replace('jform_','').replace('_sla_gmd_dp_northBoundLatitude_sla_gco_dp_Decimal','');
        
        js('input[id^=jform_'+parentPath+'_sla_gmd_dp_][id$=_sla_gco_dp_Decimal]').on('change', function(){
            clearbbselect(parentPath.replace('_sla_gmd_dp_geographicElement_sla_gmd_dp_EX_GeographicBoundingBox',''));
            drawBB(parentPath);
        });
        
    });

    /**
     * displays or not the checkboxes versions on change event
     */
    js('#resourcetype_id').change(function() {
        js('#resourcetype_id option:selected').each(function() {
            if (js(this).val() == 0) {
                for (var i in resourcetypes) {
                    if (resourcetypes[i].versioning != 0) {
                        js('#version-control-group').show();
                    }
                }
            } else {
                if (resourcetypes[js(this).val()].versioning == 1) {
                    js('#version-control-group').show();
                } else {
                    js('#version-control-group').hide();
                }
            }
        });
    });

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
    js('#btn_toggle_all').click(function() {
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
            var form_import = document.getElementById('form_replicate_resource');
            var form_xml_import = document.getElementById('form_xml_import');
            var form_csw_import = document.getElementById('form_csw_import');

            switch (actions[1]) {
                case 'cancel':

                    break;
                case 'save':
                case 'saveAndContinue':
                    js('.required').removeClass('required').addClass('remove-required').removeAttr('required').removeAttr('aria-required');
                    if (document.formvalidator.isValid(form)) {
                        Joomla.submitform(task, form);
                    } else {
                        js('.remove-required').removeClass('remove-required').addClass('required').attr('aria-required', 'true').attr('required', 'required');
                        js('html, body').animate({scrollTop: 0}, 'slow');
                    }
                    return true;
                    break;
                case 'control':
                    if (document.formvalidator.isValid(form)) {
                        js('#system-message-container').remove();
                        bootbox.alert(Joomla.JText._('COM_EASYSDI_CATALOG_METADATA_CONTROL_OK', 'COM_EASYSDI_CATALOG_METADATA_CONTROL_OK'));
                        break;
                    } else {
                        js('html, body').animate({scrollTop: 0}, 'slow');
                    }
                    break;
                case 'valid':
                case 'validAndClose':
                    if (document.formvalidator.isValid(form)) {
                        Joomla.submitform(task, form);
                        break;
                    } else {
                        js('html, body').animate({scrollTop: 0}, 'slow');
                    }
                    break;
                case 'show':
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
                case 'preview':
                    js('input[name="task"]').val(task);
                    js.ajax({
                        url: currentUrl + '?' + task,
                        type: js('#form-metadata').attr('method'),
                        data: js('#form-metadata').serialize(),
                        success: function(data) {

                            var response = js.parseJSON(data);
                            if (response.success) {
                                var options = {size: {x: 600, y: 700}};
                                SqueezeBox.initialize(options);
                                SqueezeBox.setContent('iframe', currentUrl + '?option=com_easysdi_catalog&tmpl=component&view=sheet&preview=editor&guid=' + response.guid);
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
                        js('html, body').animate({scrollTop: 0}, 'slow');
                        js('#publishModal').modal('show');
                        break;
                    }
                    else{
                        js('html, body').animate({scrollTop: 0}, 'slow');
                    }
                    break;
                case 'publishAndClose':
                    if (document.formvalidator.isValid(form)) {
                        Joomla.submitform(task, form);
                    }
                    break;
                case 'publishWithDate':
                    js('#jform_published').val(js('#publish_date').val());
                    Joomla.submitbutton('metadata.publish');
                    break;
                case 'replicate':
                    confirmReplicate(task);
                    break;
                case 'searchresource':
                    searchResource(task);
                    break;
                case 'edit':
                    Joomla.submitform(task, form_import);
                    break;
                case 'import':
                    confirmImport(task);
                    break;
                case 'importxml':
                    if (document.formvalidator.isValid(form_xml_import)) {
                        Joomla.submitform('metadata.edit', form_xml_import);
                    }
                    break;
                case 'importcsw':
                    if (document.formvalidator.isValid(form_csw_import)) {
                        Joomla.submitform('metadata.edit', form_csw_import);
                    }
                    break;
                case 'toggle':
                    toggleAll();
                    break;
            }

        }
    };
}
);


/**
 * 
 * @param {type} task
 * @returns {undefined}
 */
function searchResource(task) {

    js('input[name="task"]').val(task);

    js.ajax({
        url: currentUrl + '?' + task,
        type: js('#form_search_resource').attr('method'),
        data: js('#form_search_resource').serialize(),
        success: function(data) {
            var response = js.parseJSON(data);
            if (response.success) {
                var items = '';
                js.each(response.result, function() {
                    items += '<tr><td><input type="radio" name="import[id]" id="import_id_' + this.id + '" value="' + this.id + '" checked=""</td><td>' + this.name + '</td><td>' + this.created + '</td><td>' + this.guid + '</td><td>' + this.rt_name + '</td><td>' + Joomla.JText._(this.status) + '</td></tr>';
                });
                js('#search_result').html(items);
                if (response.total > 0) {
                    js('#import-btn').show();
                } else {
                    js('#import-btn').hide();
                }
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

function importSwitch(task) {
    var actions = task.split('.');

    js.get(currentUrl + '?task=' + actions[0] + '.' + actions[1] + '&id=' + actions[2], function(data) {
        var response = js.parseJSON(data);

        if (response.success) {
            js('.import_importref_id').val(response.result.id);
            if (response.result.cswservice_id !== null) {
                js('#importCswModal').modal('show');
            } else {
                js('#importXmlModal').modal('show');
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
    js.get(currentUrl + '?option=com_easysdi_catalog&view=ajax&parent_path=' + parent_path + '&relid=' + relid, function(data) {

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

function addBoundaryToStructure(name, parent_path) {
    console.log(name);
    console.log(parent_path);

    js.get(currentUrl + '/?option=com_easysdi_catalog&task=ajax.removeNode&uuid=' + uuid, function(data) {
        var response = js.parseJSON(data);
        return response.success;
    });
}

function addToStructure(relid, parent_path) {
    js.get(currentUrl + '?option=com_easysdi_catalog&view=ajax&parent_path=' + parent_path + '&relid=' + relid);
}

function addFieldset(id, idwi, relid, parent_path, lowerbound, upperbound) {
    var uuid = getUuid('add-btn-', id);
    js.get(currentUrl + '?option=com_easysdi_catalog&view=ajax&parent_path=' + parent_path + '&relid=' + relid, function(data) {
        js('#bottom-' + idwi).before(data);
        if (js(data).find('select') !== null) {
            chosenRefresh();
        }

        js(data).find('button').each(function() {
            idbtn = js(this).attr('id');
            if('undefined' !== typeof idbtn)
                Calendar.setup({
                    inputField: idbtn.replace('_img', ''),
                    ifFormat: "%Y-%m-%d",
                    button: idbtn,
                    align: "Tl",
                    singleClick: true,
                    firstDay: 1
                });
            //else console.log(js(this));
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

function allopen() {
    js('.inner-fds').show();
}

function confirmImport(task) {
    bootbox.confirm(Joomla.JText._('COM_EASYSDI_CATALOG_METADATA_SAVE_WARNING', 'COM_EASYSDI_CATALOG_METADATA_SAVE_WARNING'), function(result) {
        if (result) {
            importSwitch(task);
        }
    });
}

function confirmReplicate() {
    bootbox.confirm(Joomla.JText._('COM_EASYSDI_CATALOG_METADATA_SAVE_WARNING', 'COM_EASYSDI_CATALOG_METADATA_SAVE_WARNING'), function(result) {
        if (result) {
            js('#searchModal').modal('show');
        }
    });

}

function confirmFieldset(id, idwi, lowerbound, upperbound) {
    bootbox.confirm(Joomla.JText._('COM_EASYSDI_CATALOG_METADATA_EMPTY_WARNING', 'COM_EASYSDI_CATALOG_METADATA_EMPTY_WARNING'), function(result) {
        if (result) {
            removeFieldset(id, idwi, lowerbound, upperbound);
        }
    });
}

function confirmField(id, idwi, lowerbound, upperbound) {
    bootbox.confirm(Joomla.JText._('COM_EASYSDI_CATALOG_METADATA_EMPTY_WARNING', 'COM_EASYSDI_CATALOG_METADATA_EMPTY_WARNING'), function(result) {
        if (result) {
            removeField(id, idwi, lowerbound, upperbound);
        }
    });
}

function confirmReset(){
    bootbox.confirm("COM_EASYSDI_CATALOG_METADATA_ARE_YOU_SURE", function(result) {
        if(result){
            
        }
    }); 
}

function removeFromStructure(id) {
    var uuid = getUuid('remove-btn-', id);
    js.get(currentUrl + '/?option=com_easysdi_catalog&task=ajax.removeNode&uuid=' + uuid, function(data) {
        var response = js.parseJSON(data);
        return response.success;
    });
}

function removeField(id, idwi, lowerbound, upperbound) {
    var uuid = getUuid('remove-btn-', id);
    js.get(currentUrl + '/?option=com_easysdi_catalog&task=ajax.removeNode&uuid=' + uuid, function(data) {
        var response = js.parseJSON(data);
        if (response.success) {
            var toRemove = js('#attribute-group-' + uuid);
            toRemove.remove();
        }
    });
}

function removeFieldset(id, idwi, lowerbound, upperbound) {
    var uuid = getUuid('remove-btn-', id);
    js.get(currentUrl + '/?option=com_easysdi_catalog&task=ajax.removeNode&uuid=' + uuid, function(data) {
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

    js.get(currentUrl + '/?option=com_easysdi_catalog&task=ajax.getBoundaryByCategory&value=' + value, function(data) {

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

        js('#jform_' + replaceId + '_sla_gmd_dp_geographicElement_sla_gmd_dp_EX_GeographicBoundingBox_sla_gmd_dp_northBoundLatitude_sla_gco_dp_Decimal').attr('value', response['0'].northbound);
        js('#jform_' + replaceId + '_sla_gmd_dp_geographicElement_sla_gmd_dp_EX_GeographicBoundingBox_sla_gmd_dp_southBoundLatitude_sla_gco_dp_Decimal').attr('value', response['0'].southbound);
        js('#jform_' + replaceId + '_sla_gmd_dp_geographicElement_sla_gmd_dp_EX_GeographicBoundingBox_sla_gmd_dp_eastBoundLongitude_sla_gco_dp_Decimal').attr('value', response['0'].eastbound);
        js('#jform_' + replaceId + '_sla_gmd_dp_geographicElement_sla_gmd_dp_EX_GeographicBoundingBox_sla_gmd_dp_westBoundLongitude_sla_gco_dp_Decimal').attr('value', response['0'].westbound);
        //js('#jform_' + replaceId + '_sla_gmd_dp_geographicElement_la_2_ra__sla_gmd_dp_EX_GeographicDescription_sla_gmd_dp_geographicIdentifier_sla_gmd_dp_MD_Identifier_sla_gmd_dp_code_sla_gco_dp_CharacterString').attr('value', response['0'].alias);

        var map_parent_path = replaceId + '_sla_gmd_dp_geographicElement_sla_gmd_dp_EX_GeographicBoundingBox';
        drawBB(map_parent_path);
    });
}

function setBoundary(parentPath, value) {
    js.get(currentUrl + '/?option=com_easysdi_catalog&task=ajax.getBoundaryByName&value=' + value, function(data) {
        var response = js.parseJSON(data);
        var replaceId = parentPath.replace(/-/g, '_');
        js('#jform_' + replaceId + '_sla_gmd_dp_geographicElement_sla_gmd_dp_EX_GeographicBoundingBox_sla_gmd_dp_northBoundLatitude_sla_gco_dp_Decimal').attr('value', response.northbound);
        js('#jform_' + replaceId + '_sla_gmd_dp_geographicElement_sla_gmd_dp_EX_GeographicBoundingBox_sla_gmd_dp_southBoundLatitude_sla_gco_dp_Decimal').attr('value', response.southbound);
        js('#jform_' + replaceId + '_sla_gmd_dp_geographicElement_sla_gmd_dp_EX_GeographicBoundingBox_sla_gmd_dp_eastBoundLongitude_sla_gco_dp_Decimal').attr('value', response.eastbound);
        js('#jform_' + replaceId + '_sla_gmd_dp_geographicElement_sla_gmd_dp_EX_GeographicBoundingBox_sla_gmd_dp_westBoundLongitude_sla_gco_dp_Decimal').attr('value', response.westbound);
        //js('#jform_' + replaceId + '_sla_gmd_dp_geographicElement_la_2_ra__sla_gmd_dp_EX_GeographicDescription_sla_gmd_dp_geographicIdentifier_sla_gmd_dp_MD_Identifier_sla_gmd_dp_code_sla_gco_dp_CharacterString').attr('value', response.alias);

        var map_parent_path = replaceId + '_sla_gmd_dp_geographicElement_sla_gmd_dp_EX_GeographicBoundingBox';
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
        var dest = new Proj4js.Proj(map.getProjection());
        var source = new Proj4js.Proj("EPSG:4326");
        var bottom_left = new Proj4js.Point(left, bottom);
        var top_right = new Proj4js.Point(right, top);
        Proj4js.transform(source, dest, bottom_left);
        Proj4js.transform(source, dest, top_right);
        var bounds = new OpenLayers.Bounds(bottom_left.x, bottom_left.y, top_right.x, top_right.y);
        var box = new OpenLayers.Feature.Vector(bounds.toGeometry());
        var layer = window['polygonLayer_' + parent_path];
        layer.addFeatures([box]);
        
        // re-set NSEW input values to avoid any projection changes
        js('#jform_' + parent_path + '_sla_gmd_dp_northBoundLatitude_sla_gco_dp_Decimal').val(top);
        js('#jform_' + parent_path + '_sla_gmd_dp_southBoundLatitude_sla_gco_dp_Decimal').val(bottom);
        js('#jform_' + parent_path + '_sla_gmd_dp_eastBoundLongitude_sla_gco_dp_Decimal').val(right);
        js('#jform_' + parent_path + '_sla_gmd_dp_westBoundLongitude_sla_gco_dp_Decimal').val(left);
    }
}


//Décode une chaîne
function html_entity_decode(texte) {
    texte = texte.replace(/&quot;/g, '"'); // 34 22
    texte = texte.replace(/&amp;/g, '&'); // 38 26	
    texte = texte.replace(/&#39;/g, "'"); // 39 27
    texte = texte.replace(/&lt;/g, '<'); // 60 3C
    texte = texte.replace(/&gt;/g, '>'); // 62 3E
    texte = texte.replace(/&circ;/g, '^'); // 94 5E
    texte = texte.replace(/&lsquo;/g, '‘'); // 145 91
    texte = texte.replace(/&rsquo;/g, '’'); // 146 92
    texte = texte.replace(/&ldquo;/g, '“'); // 147 93
    texte = texte.replace(/&rdquo;/g, '”'); // 148 94
    texte = texte.replace(/&bull;/g, '•'); // 149 95
    texte = texte.replace(/&ndash;/g, '–'); // 150 96
    texte = texte.replace(/&mdash;/g, '—'); // 151 97
    texte = texte.replace(/&tilde;/g, '˜'); // 152 98
    texte = texte.replace(/&trade;/g, '™'); // 153 99
    texte = texte.replace(/&scaron;/g, 'š'); // 154 9A
    texte = texte.replace(/&rsaquo;/g, '›'); // 155 9B
    texte = texte.replace(/&oelig;/g, 'œ'); // 156 9C
    texte = texte.replace(/&#357;/g, ''); // 157 9D
    texte = texte.replace(/&#382;/g, 'ž'); // 158 9E
    texte = texte.replace(/&Yuml;/g, 'Ÿ'); // 159 9F
    texte = texte.replace(/&nbsp;/g, ' '); // 160 A0
    texte = texte.replace(/&iexcl;/g, '¡'); // 161 A1
    texte = texte.replace(/&cent;/g, '¢'); // 162 A2
    texte = texte.replace(/&pound;/g, '£'); // 163 A3
    texte = texte.replace(/&curren;/g, ' '); // 164 A4
    texte = texte.replace(/&yen;/g, '¥'); // 165 A5
    texte = texte.replace(/&brvbar;/g, '¦'); // 166 A6
    texte = texte.replace(/&sect;/g, '§'); // 167 A7
    texte = texte.replace(/&uml;/g, '¨'); // 168 A8
    texte = texte.replace(/&copy;/g, '©'); // 169 A9
    texte = texte.replace(/&ordf;/g, 'ª'); // 170 AA
    texte = texte.replace(/&laquo;/g, '«'); // 171 AB
    texte = texte.replace(/&not;/g, '¬'); // 172 AC
    texte = texte.replace(/&shy;/g, '­'); // 173 AD
    texte = texte.replace(/&reg;/g, '®'); // 174 AE
    texte = texte.replace(/&macr;/g, '¯'); // 175 AF
    texte = texte.replace(/&deg;/g, '°'); // 176 B0
    texte = texte.replace(/&plusmn;/g, '±'); // 177 B1
    texte = texte.replace(/&sup2;/g, '²'); // 178 B2
    texte = texte.replace(/&sup3;/g, '³'); // 179 B3
    texte = texte.replace(/&acute;/g, '´'); // 180 B4
    texte = texte.replace(/&micro;/g, 'µ'); // 181 B5
    texte = texte.replace(/&para/g, '¶'); // 182 B6
    texte = texte.replace(/&middot;/g, '·'); // 183 B7
    texte = texte.replace(/&cedil;/g, '¸'); // 184 B8
    texte = texte.replace(/&sup1;/g, '¹'); // 185 B9
    texte = texte.replace(/&ordm;/g, 'º'); // 186 BA
    texte = texte.replace(/&raquo;/g, '»'); // 187 BB
    texte = texte.replace(/&frac14;/g, '¼'); // 188 BC
    texte = texte.replace(/&frac12;/g, '½'); // 189 BD
    texte = texte.replace(/&frac34;/g, '¾'); // 190 BE
    texte = texte.replace(/&iquest;/g, '¿'); // 191 BF
    texte = texte.replace(/&Agrave;/g, 'À'); // 192 C0
    texte = texte.replace(/&Aacute;/g, 'Á'); // 193 C1
    texte = texte.replace(/&Acirc;/g, 'Â'); // 194 C2
    texte = texte.replace(/&Atilde;/g, 'Ã'); // 195 C3
    texte = texte.replace(/&Auml;/g, 'Ä'); // 196 C4
    texte = texte.replace(/&Aring;/g, 'Å'); // 197 C5
    texte = texte.replace(/&AElig;/g, 'Æ'); // 198 C6
    texte = texte.replace(/&Ccedil;/g, 'Ç'); // 199 C7
    texte = texte.replace(/&Egrave;/g, 'È'); // 200 C8
    texte = texte.replace(/&Eacute;/g, 'É'); // 201 C9
    texte = texte.replace(/&Ecirc;/g, 'Ê'); // 202 CA
    texte = texte.replace(/&Euml;/g, 'Ë'); // 203 CB
    texte = texte.replace(/&Igrave;/g, 'Ì'); // 204 CC
    texte = texte.replace(/&Iacute;/g, 'Í'); // 205 CD
    texte = texte.replace(/&Icirc;/g, 'Î'); // 206 CE
    texte = texte.replace(/&Iuml;/g, 'Ï'); // 207 CF
    texte = texte.replace(/&ETH;/g, 'Ð'); // 208 D0
    texte = texte.replace(/&Ntilde;/g, 'Ñ'); // 209 D1
    texte = texte.replace(/&Ograve;/g, 'Ò'); // 210 D2
    texte = texte.replace(/&Oacute;/g, 'Ó'); // 211 D3
    texte = texte.replace(/&Ocirc;/g, 'Ô'); // 212 D4
    texte = texte.replace(/&Otilde;/g, 'Õ'); // 213 D5
    texte = texte.replace(/&Ouml;/g, 'Ö'); // 214 D6
    texte = texte.replace(/&times;/g, '×'); // 215 D7
    texte = texte.replace(/&Oslash;/g, 'Ø'); // 216 D8
    texte = texte.replace(/&Ugrave;/g, 'Ù'); // 217 D9
    texte = texte.replace(/&Uacute;/g, 'Ú'); // 218 DA
    texte = texte.replace(/&Ucirc;/g, 'Û'); // 219 DB
    texte = texte.replace(/&Uuml;/g, 'Ü'); // 220 DC
    texte = texte.replace(/&Yacute;/g, 'Ý'); // 221 DD
    texte = texte.replace(/&THORN;/g, 'Þ'); // 222 DE
    texte = texte.replace(/&szlig;/g, 'ß'); // 223 DF
    texte = texte.replace(/&agrave;/g, 'à'); // 224 E0
    texte = texte.replace(/&aacute;/g, 'á'); // 225 E1
    texte = texte.replace(/&acirc;/g, 'â'); // 226 E2
    texte = texte.replace(/&atilde;/g, 'ã'); // 227 E3
    texte = texte.replace(/&auml;/g, 'ä'); // 228 E4
    texte = texte.replace(/&aring;/g, 'å'); // 229 E5
    texte = texte.replace(/&aelig;/g, 'æ'); // 230 E6
    texte = texte.replace(/&ccedil;/g, 'ç'); // 231 E7
    texte = texte.replace(/&egrave;/g, 'è'); // 232 E8
    texte = texte.replace(/&eacute;/g, 'é'); // 233 E9
    texte = texte.replace(/&ecirc;/g, 'ê'); // 234 EA
    texte = texte.replace(/&euml;/g, 'ë'); // 235 EB
    texte = texte.replace(/&igrave;/g, 'ì'); // 236 EC
    texte = texte.replace(/&iacute;/g, 'í'); // 237 ED
    texte = texte.replace(/&icirc;/g, 'î'); // 238 EE
    texte = texte.replace(/&iuml;/g, 'ï'); // 239 EF
    texte = texte.replace(/&eth;/g, 'ð'); // 240 F0
    texte = texte.replace(/&ntilde;/g, 'ñ'); // 241 F1
    texte = texte.replace(/&ograve;/g, 'ò'); // 242 F2
    texte = texte.replace(/&oacute;/g, 'ó'); // 243 F3
    texte = texte.replace(/&ocirc;/g, 'ô'); // 244 F4
    texte = texte.replace(/&otilde;/g, 'õ'); // 245 F5
    texte = texte.replace(/&ouml;/g, 'ö'); // 246 F6
    texte = texte.replace(/&divide;/g, '÷'); // 247 F7
    texte = texte.replace(/&oslash;/g, 'ø'); // 248 F8
    texte = texte.replace(/&ugrave;/g, 'ù'); // 249 F9
    texte = texte.replace(/&uacute;/g, 'ú'); // 250 FA
    texte = texte.replace(/&ucirc;/g, 'û'); // 251 FB
    texte = texte.replace(/&uuml;/g, 'ü'); // 252 FC
    texte = texte.replace(/&yacute;/g, 'ý'); // 253 FD
    texte = texte.replace(/&thorn;/g, 'þ'); // 254 FE
    texte = texte.replace(/&yuml;/g, 'ÿ'); // 255 FF
    return texte;
}