var map, perimeterLayer, selectControl, selectLayer, polygonLayer, selectControl, request, myLayer, fieldid, fieldname, loadingPerimeter, miniLayer, minimap;

function initMiniMap() {
    minimap = new OpenLayers.Map({div: 'minimap', controls: []});
    var layer = app.mapPanel.map.layers[1].clone();
    minimap.addLayer(layer);
    minimap.setBaseLayer(layer);
    minimap.zoomToExtent(app.mapPanel.map.getExtent());
    miniLayer = new OpenLayers.Layer.Vector("miniLayer");
    minimap.addLayer(miniLayer);
    miniLayer.events.register("featuresadded", miniLayer, listenerMiniFeaturesAdded);
}

var listenerMiniFeaturesAdded = function() {
    minimap.zoomToExtent(miniLayer.getDataExtent());
};

var listenerFeatureAdded = function(e) {
    miniLayer.addFeatures([e.feature.clone()]);

    var toobig = false;
    var toosmall = false;
    if (jQuery('#surfacemax').val() !== '') {
        if (parseFloat(jQuery('#t-surface').val()) > parseFloat(jQuery('#surfacemax').val()))
            toobig = true;
    }
    if (jQuery('#surfacemin').val() !== '') {
        if (parseFloat(jQuery('#t-surface').val()) < parseFloat(jQuery('#surfacemin').val()))
            toosmall = true;
    }
    if (toobig || toosmall) {
        jQuery("#alert_template").empty();
        jQuery("#alert_template").append('<span>Your current selection of ' + jQuery('#t-surface').val() + ' is not in the allowed surface range [' + jQuery('#surfacemin').val() + ',' + jQuery('#surfacemax').val() + '].</span>');
        jQuery('#alert_template').fadeIn('slow');
        jQuery('#btn-saveperimeter').attr("disabled", "disabled");
    } else {
        jQuery('#alert_template').fadeOut('slow');
        jQuery('#btn-saveperimeter').removeAttr("disabled");

    }
};

function clearLayersVector() {
    for (var j = 0; j < app.mapPanel.map.layers.length; j++) {
        if (app.mapPanel.map.layers[j].__proto__.CLASS_NAME === "OpenLayers.Layer.Vector") {
            app.mapPanel.map.layers[j].removeAllFeatures();
        }
    }
    for (var j = 0; j < minimap.layers.length; j++) {
        if (minimap.layers[j].__proto__.CLASS_NAME === "OpenLayers.Layer.Vector") {
            minimap.layers[j].removeAllFeatures();
        }
    }
}

function clearTemporaryFields() {
    jQuery('#t-perimeter').val('');
    jQuery('#t-perimetern').val('');
    jQuery('#t-surface').val('');
    jQuery('#t-features').val('');
    jQuery('#alert_template').fadeOut('slow');
    jQuery('#btn-saveperimeter').removeAttr("disabled");
}

function resetTemporaryFields() {
    jQuery('#t-perimeter').val(jQuery('#perimeter').val());
    jQuery('#t-perimetern').val(jQuery('#perimetern').val());
    jQuery('#t-surface').val(jQuery('#surface').val());
    jQuery('#t-features').val(jQuery('#features').val());
    jQuery('#alert_template').fadeOut('slow');
    jQuery('#btn-saveperimeter').removeAttr("disabled");
}

function saveTemporaryFields() {
    jQuery('#perimeter').val(jQuery('#t-perimeter').val());
    jQuery('#perimetern').val(jQuery('#t-perimetern').val());
    jQuery('#surface').val(jQuery('#t-surface').val());
    jQuery('#features').val(jQuery('#t-features').val());
}

function beforeFeatureAdded(event) {
    clearLayersVector();

    jQuery('#t-features').val('');
    jQuery('#t-surface').val(JSON.stringify(event.feature.geometry.getGeodesicArea(app.mapPanel.map.projection)));
}

function resetAll() {
    resetTemporaryFields();
    clearLayersVector();
    jQuery('#btns-selection').show();

    if (typeof selectControl !== 'undefined') {
        selectControl.deactivate();
        //toggleSelectControl('pan');
        selectControl.events.unregister("featureselected", this, listenerFeatureSelected);
        selectControl.events.unregister("featureunselected", this, listenerFeatureUnselected);
        app.mapPanel.map.removeControl(selectControl);
    }
    if (app.mapPanel.map.getLayersByName("perimeterLayer").length > 0) {
        perimeterLayer.events.unregister("loadend", perimeterLayer, listenerLoadEnd);
        app.mapPanel.map.removeLayer(perimeterLayer);
        app.mapPanel.map.removeLayer(selectLayer);
    }
    if (app.mapPanel.map.getLayersByName("myLayer").length > 0) {
        app.mapPanel.map.removeLayer(myLayer);
    }
    for (key in drawControls) {
        var control = drawControls[key];
        control.deactivate();
    }
}

function toggleSelectControl(action) {
    if (action == 'selection') {
        if (typeof selectControl !== 'undefined') {
            selectControl.activate();
        }
    } else {
        resetAll();
        selectControl.deactivate();
    }
}

function cancel() {
    resetAll();
    jQuery('#modal-perimeter [id^="btn-perimeter"]').removeClass('active');
    if (jQuery('#perimeter').val() !== '') {
        eval('selectPerimeter' + jQuery('#perimeter').val() + '()');
        eval('reloadFeatures' + jQuery('#perimeter').val() + '()');
        jQuery('#btn-perimeter' + jQuery('#perimeter').val()).addClass('active');
    }
}

function savePerimeter() {
    jQuery("#progress").css('visibility', 'visible');

    var extent = {"id": jQuery('#t-perimeter').val(),
        "name": jQuery('#t-perimetern').val(),
        "surface": jQuery('#t-surface').val(),
        "allowedbuffer": jQuery('#allowedbuffer').val(),
        "buffer": jQuery('#buffer').val(),
        "features": JSON.parse(jQuery('#t-features').val())};

    jQuery.ajax({
        type: "POST",
        url: "index.php?option=com_easysdi_shop&task=addExtentToBasket" ,
        data :"item="+ JSON.stringify(extent),
        success: function(data) {
            displayExtentRecap();
        }
    });

}

function displayExtentRecap() {
    saveTemporaryFields();

    jQuery('#perimeter-recap').empty();
    jQuery('#perimeter-recap').append("<div><h4>" + Joomla.JText._('COM_EASYSDI_SHOP_BASKET_SURFACE', 'Surface') + "</h4>");
    var surface = parseFloat(jQuery('#surface').val());
    var surfacedigit = parseInt(jQuery('#surfacedigit').val());
    var maxmetervalue = parseFloat(jQuery('#maxmetervalue').val());
    if (surface > maxmetervalue) {
        surface = surface / 1000000;
        surface = surface.toFixed(surfacedigit);
        surface += Joomla.JText._('COM_EASYSDI_SHOP_BASKET_KILOMETER', ' km2');
    } else {
        surface = surface.toFixed(surfacedigit);
        surface += Joomla.JText._('COM_EASYSDI_SHOP_BASKET_METER', ' m2');
    }

    jQuery('#perimeter-recap').append("<div>" + surface + "</div></div>");
    jQuery('#perimeter-recap').append("<div><h4>" + jQuery('#perimetern').val() + "</h4></div>");
    
    var features_text = jQuery('#features').val();

    if (features_text === '')
        return;

    try {
        var features = JSON.parse(features_text);
        var createdivdetails = false;
        if (jQuery.isArray(features)) {
            jQuery.each(features, function(index, value) {
                if (typeof value === "undefined")
                    return true;

                if (typeof value.name === "undefined") {
//                    jQuery('#perimeter-recap-details').append("<div>" + features + "</div>");
                    return false;
                }
                if(createdivdetails === false){
                    jQuery('#perimeter-recap').append("<div id='perimeter-recap-details' style='overflow-y:scroll; height:100px;'>");
                    createdivdetails = true;
                }
                jQuery('#perimeter-recap-details').append("<div>" + value.name + "</div>");
            });
        } else {
//            reprojectWKT(JSON.parse(features_text));            
        }
    } catch (e) {
//        jQuery('#perimeter-recap-details').append("<div>" + JSON.parse(features_text) + "</div>");
    }
    if(createdivdetails === true){
        jQuery('#perimeter-recap').append("<div");
    }
}
               

//function reprojectWKT(wkt) {
//    var features = new OpenLayers.Format.WKT().read(wkt);
//    var reprojfeatures = new Array();
//    if (features instanceof Array) {
//        for (var i = 0; i < features.length; i++) {
//            var geometry = features[i].geometry.transform(
//                    new OpenLayers.Projection("EPSG:4326"),
//                    new OpenLayers.Projection(app.mapPanel.map.projection)
//                    );
//            var reprojfeature = new OpenLayers.Feature.Vector(geometry);
//            reprojfeatures.push(reprojfeature);
//        }
//    }
//    else {
//        var geometry = features.geometry.transform(
//                new OpenLayers.Projection("EPSG:4326"),
//                new OpenLayers.Projection(app.mapPanel.map.projection)
//                );
//        var reprojfeature = new OpenLayers.Feature.Vector(geometry);
//        reprojfeatures.push(reprojfeature);
//        
//    }
//    var reprojwkt = new OpenLayers.Format.WKT().write(reprojfeatures);
//    jQuery('#perimeter-recap').append("<div>" + reprojwkt + "</div>");
//}

function reprojectWKT(wkt) {
    var features = new OpenLayers.Format.WKT().read(wkt);
    var reprojfeatures = new Array();
    if (features instanceof Array) {
        for (var i = 0; i < features.length; i++) {
            var geometry = features[i].geometry.transform(
                    new OpenLayers.Projection("EPSG:4326"),
                    new OpenLayers.Projection(app.mapPanel.map.projection)
                    );
            var reprojfeature = new OpenLayers.Feature.Vector(geometry);
            reprojfeatures.push(reprojfeature);
        }
    }
    else {
        var geometry = features.geometry.transform(
                new OpenLayers.Projection("EPSG:4326"),
                new OpenLayers.Projection(app.mapPanel.map.projection)
                );
        var reprojfeature = new OpenLayers.Feature.Vector(geometry);
        reprojfeatures.push(reprojfeature);
        
    }
    var reprojwkt = new OpenLayers.Format.WKT().write(reprojfeatures);
    jQuery('#perimeter-recap-details').append("<div>" + reprojwkt + "</div>");
}





