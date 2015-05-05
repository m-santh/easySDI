var fromreload = false;

function selectPerimeter(perimeter, isrestrictedbyperimeter) {
    resetAll();

    fieldid = perimeter.featuretypefieldid;
    fieldname = perimeter.featuretypefieldname;
    fieldlevel = perimeter.featuretypefieldlevel;
    prefix = perimeter.prefix;    
    jQuery('#t-perimeter').val(perimeter.id);
    jQuery('#t-perimetern').val(perimeter.name);
    jQuery('#t-features').val('');
    jQuery('#t-surface').val('');

    //Current user is not subject to perimeter restriction
    if (isrestrictedbyperimeter === 0) {
        //Layer
        var layerconfig = {type: "OpenLayers.Layer.WMS",
            name: perimeter.maplayername,
            transparent: true,
            isindoor: perimeter.isindoor,
            servertype: perimeter.server,
            levelfield: perimeter.levelfield,
            opacity: perimeter.opacity,
            source: perimeter.source,
            tiled: true,
            title: "perimeterLayer",
            iwidth: "360",
            iheight: "360",
            visibility: true};
        var sourceconfig = {id: perimeter.source,
            ptype: "sdi_gxp_wmssource",
            hidden: "true",
            url: perimeter.wmsurl
        }

        var queue = window.parent.app.addExtraLayer(sourceconfig, layerconfig);
        gxp.util.dispatch(queue, window.parent.app.reactivate, window.parent.app);

        //Select control
        selectControl = new OpenLayers.Control.GetFeature({
            protocol: new OpenLayers.Protocol.WFS({
                version: "1.0.0",
                url: perimeter.wfsurl,
                srsName: app.mapPanel.map.projection,
                featureType: perimeter.featuretypename,
                featurePrefix: perimeter.prefix,
                featureNS: perimeter.namespace,
                geometryName: perimeter.featuretypefieldgeometry
            }),
            box: true,
            click: true,
            multipleKey: "ctrlKey",
            clickout: true
        });
        //Manage indoor level filter on select control tool
        if (perimeter.featuretypefieldlevel) {
            selectControl.protocol.defaultFilter = getSelectControlLevelFilter();
        }

    } else {

        /** TODO : 
         * - User restricted perimeter is not compatible with arcGIS server :
         * param layerDefs must be used instead of CQL_FILTER.
         * - User restricted perimeter is not compatible with indoor navigation :
         * filter defined here will be overwrite when navigate through levels
         */
        var featurerestriction = getUserRestrictedExtentFeature(userperimeter);
        var g = featurerestriction.geometry;
        var exp = new OpenLayers.Format.WKT().write(featurerestriction);
        //----------------------------------------------------------------------
        // The WMS version of the perimeter layer filtered 
        // by user restricted perimeter
        //----------------------------------------------------------------------
        perimeterLayer = new OpenLayers.Layer.WMS("perimeterLayer",
                perimeter.wmsurl,
                {layers: perimeter.layername,
                    transparent: true,
                    CQL_FILTER: 'INTERSECTS(the_geom,' + exp + ')'},
        {tileOptions: {maxGetUrlLength: 2048}, transitionEffect: 'resize'}
        );
        //----------------------------------------------------------------------
        //Select control
        selectControl = new OpenLayers.Control.GetFeature({
            protocol: new OpenLayers.Protocol.WFS({
                version: "1.0.0",
                url: perimeter.wfsurl,
                srsName: app.mapPanel.map.projection,
                featureType: perimeter.featuretypename,
                featureNS: perimeter.namespace,
                featurePrefix: perimeter.prefix,
                geometryName: perimeter.featuretypefieldgeometry,
                defaultFilter: new OpenLayers.Filter.Spatial({
                    type: OpenLayers.Filter.Spatial.INTERSECTS,
                    value: featurerestriction.geometry
                })
            }),
            box: true,
            click: true,
            multipleKey: "ctrlKey",
            clickout: true
        });
        app.mapPanel.map.addLayer(perimeterLayer);
    }

    //Selection  Layer
    selectLayer = new OpenLayers.Layer.Vector("Selection", {srsName: app.mapPanel.map.projection, projection: app.mapPanel.map.projection});
    selectLayer.events.register("featureadded", selectLayer, listenerFeatureAdded);
    app.mapPanel.map.addLayer(selectLayer);
    
    //Keep selection layer on top
    app.mapPanel.map.events.register('addlayer', this, function(){
        app.mapPanel.map.setLayerIndex(selectLayer, app.mapPanel.map.getNumLayers());
    });
    
    //Select control
    selectControl.events.register("featureselected", this, listenerFeatureSelected);
    selectControl.events.register("featureunselected", this, listenerFeatureUnselected);
    //Managing indoor navigation with predefined perimeter WFS
    if (perimeter.featuretypefieldlevel) {
        app.mapPanel.map.events.register("indoorlevelchanged", this, function(level) {
            if(selectLayer) selectLayer.removeAllFeatures();
            jQuery('#t-features').val('');
            if(selectControl && selectControl.protocol){
                selectControl.protocol.defaultFilter = getSelectControlLevelFilter();
            }
        });
    }
    app.mapPanel.map.addControl(selectControl);
    toggleSelectControl('selection');

    return false;
}

//Get the OpenLayers Filter to apply for features selection
var getSelectControlLevelFilter = function () {
    selectControl.fieldlevel = prefix + ':' + fieldlevel;
    return new OpenLayers.Filter.Comparison({
        type: OpenLayers.Filter.Comparison.EQUAL_TO,
        property: selectControl.fieldlevel,
        value: app.mapPanel.map.indoorlevelslider.getLevel().code
    });
}

var listenerWFSFeatureAdded = function(e) {
    listenerFeatureAdded(e);

    if (typeof e.feature.data[fieldname] === "undefined") {
        jQuery('#perimeter-recap-details').append(jQuery('<div>' + e.feature + '</div>'));
    } else {
        jQuery('#perimeter-recap-details').append(jQuery('<div>' + e.feature.data[fieldname] + '</div>'));
    }
    jQuery('#perimeter-recap-details').show();

}

var listenerFeatureSelected = function(e) {
    if (fromreload === true) {
        selectLayer.removeAllFeatures();
        miniLayer.removeAllFeatures();
        fromreload = false;
    }
    var alreadySelected = selectLayer.features;
    for (var i = 0; i < alreadySelected.length; i++) {
        if (alreadySelected[i].attributes[fieldid] === e.feature.attributes[fieldid])
            return;
    }

    var features_text = jQuery('#t-features').val();
    if (features_text !== "")
        var features = JSON.parse(features_text);
    else
        var features = new Array();
    features.push({"id": e.feature.attributes[fieldid], "name": e.feature.attributes[fieldname]});
    jQuery('#t-features').val(JSON.stringify(features));
    if (jQuery('#t-surface').val() !== '')
        var surface = parseInt(jQuery('#t-surface').val());
    else
        var surface = 0;

    jQuery('#t-surface').val(JSON.stringify(surface + e.feature.geometry.getGeodesicArea(app.mapPanel.map.projection)));

    selectLayer.addFeatures([e.feature]);
};

var listenerFeatureUnselected = function(e) {
    selectLayer.removeFeatures([e.feature]);
    var features = miniLayer.features;
    for (var i = 0; i < features.length; i++) {
        if (features[i].attributes['id'] === e.feature.attributes['id']) {
            miniLayer.removeFeatures([features[i]]);
            break;
        }
    }
    var features_text = jQuery('#t-features').val();
    if (features_text !== "")
        var features = JSON.parse(features_text);
    else
        return;
    jQuery.each(features, function(index, value) {
        if (typeof value === "undefined")
            return true;
        if (value.id === e.feature.attributes[fieldid]) {
            features.splice(index, 1);
        }
    });
    if (features.size === 0)
        jQuery('#t-features').val('');
    else
        jQuery('#t-features').val(JSON.stringify(features));

    if (jQuery('#t-surface').val() !== '') {
        var surface = parseInt(jQuery('#t-surface').val());
        jQuery('#t-surface').val(JSON.stringify(surface - e.feature.geometry.getGeodesicArea(app.mapPanel.map.projection)));
    }
};

function reloadFeatures(perimeter) {
    var wfsurl = perimeter.wfsurl;
    var featuretypename = perimeter.prefix + ':' + perimeter.featuretypename;
    var featuretypefieldid = perimeter.prefix + ':' + perimeter.featuretypefieldid;

    jQuery('#t-features').val(jQuery('#features').val());
    jQuery('#t-surface').val(jQuery('#surface').val());
    var wfsUrl = wfsurl + '?request=GetFeature&SERVICE=WFS&TYPENAME=' + featuretypename + '&VERSION=1.0.0';
    var wfsUrlWithFilter = wfsUrl + '&FILTER=';
    wfsUrlWithFilter = wfsUrlWithFilter + escape('<ogc:Filter xmlns:ogc="http://www.opengis.net/ogc">');

    var features_text = jQuery('#features').val();
    if (features_text !== "")
        var features = JSON.parse(features_text);
    else
        var features = new Array();

    if (features.length > 1)
        wfsUrlWithFilter = wfsUrlWithFilter + escape('<ogc:Or>');


    for (var i = 0; i < features.length; i++)
    {
        wfsUrlWithFilter = wfsUrlWithFilter + escape('<ogc:PropertyIsEqualTo><ogc:PropertyName>' + featuretypefieldid + '</ogc:PropertyName><ogc:Literal>' + features[i].id + '</ogc:Literal></ogc:PropertyIsEqualTo>');

    }
    if (features.length > 1)
    {
        wfsUrlWithFilter = wfsUrlWithFilter + escape('</ogc:Or>');
    }
    wfsUrlWithFilter = wfsUrlWithFilter + escape('</ogc:Filter>');

    selectLayer.events.register("featureadded", selectLayer, listenerFeatureAdded);
    app.mapPanel.map.removeLayer(selectLayer);

    selectLayer = new OpenLayers.Layer.Vector("Selection", {
        strategies: [new OpenLayers.Strategy.Fixed()],
        protocol: new OpenLayers.Protocol.HTTP({
            url: wfsUrlWithFilter,
            format: new OpenLayers.Format.GML()
        })
    });
    selectLayer.events.register("featureadded", selectLayer, listenerWFSFeatureAdded);
//    selectLayer.events.register("loadend", selectLayer, listenerFeatureAddedToZoom);
    app.mapPanel.map.addLayer(selectLayer);
    fromreload = true;
}
;

var listenerFeatureAddedToZoom = function(e) {
    app.mapPanel.map.zoomToExtent(e.object.getDataExtent());
};

