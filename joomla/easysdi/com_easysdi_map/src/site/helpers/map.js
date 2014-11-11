Ext.Container.prototype.bufferResize = false;
Ext.onReady(function() {
    loadingMask = new Ext.LoadMask(Ext.getBody(), {msg: msg});
    loadingMask.show();
    height = Ext.get(renderto).getHeight();
    if (!height)
        height = Ext.get(renderto).getWidth() * 1 / 2;
    width = Ext.get(renderto).getWidth();
    OpenLayers.ImgPath = "administrator/components/com_easysdi_core/libraries/openlayers/img/";
    GeoExt.Lang.set(langtag);
    window.appname = new gxp.Viewer(getMapConfig());
    //Add the mouseposition control if activated in the map configuration
    //Can not be done in the gxp.Viewer instanciation because it has to be done on the openlayers map object
    if (mouseposition == 1) {
        window.appname.mapPanel.map.addControl(new OpenLayers.Control.MousePosition());
    }
    var locator = null;
    window.appname.on("ready", function() {
        window.appname.portalConfig.renderTo = "sdiNewContainer";
        if (data.urlwfslocator != "") {
            if (locator == null) {
                locator = {xtype: "gxp_autocompletecombo",
                    listeners: {
                        select: function(list, record) {
                            var extent = new OpenLayers.Bounds();
                            extent.extend(record.data.feature.geometry.getBounds());
                            window.appname.mapPanel.map.zoomToExtent(extent);
                        }
                    },
                    url: data.urlwfslocator,
                    fieldName: data.fieldname,
                    featureType: data.featuretype,
                    featurePrefix: data.featureprefix,
                    fieldLabel: data.fieldname,
                    geometryName: data.geometryname,
                    maxFeatures: "10",
                    emptyText: "Search..."};
                window.appname.portal.items.items[0].items.items[0].toolbars[0].add(locator);
                window.appname.portal.items.items[0].items.items[0].toolbars[0].doLayout();
            }
        }
        loadingMask.hide();
    });

    if (cleared == "false") {
        SdiScaleLineParams = {
            bottomInUnits: data.bottomInUnits,
            bottomOutUnits: data.bottomOutUnits,
            topInUnits: data.topInUnits,
            topOutUnits: data.topOutUnits
        };
    }
    Ext.QuickTips.init();
    Ext.apply(Ext.QuickTips.getQuickTip(), {maxWidth: 1000});
    Ext.EventManager.onWindowResize(function() {
        window.appname.portal.setWidth(Ext.get(renderto).getWidth());
        window.appname.portal.setHeight(Ext.get(renderto).getWidth() * 1 / 2);
    });

});

function getMapConfig() {
    var config = {};

    config.proxy = proxyhost;
    config.about = {
        title: data.title,
        "abstract": data.abstract
    };

    //Portal config
    config.portalConfig = {
        renderTo: renderto,
        width: width,
        height: height,
        layout: "border",
        region: "center",
        items: [
            {
                id: "centerpanel",
                xtype: "panel",
                layout: "card",
                region: "center",
                border: false,
                activeItem: 0,
                items: [
                    "sdimap",
                    {
                        xtype: "gxp_googleearthpanel",
                        id: "globe",
                        tbar: [],
                        mapPanel: "sdimap"
                    }
                ]
            }
        ]
    };

    //tools
    var layertreeactivated = false;
    if (data.tools !== null && data.tools.length > 0) {
        for (index = 0; index < data.tools.length; ++index) {
            if (data.tools[index].alias == 'layertree') {
                config.portalConfig.items.push({
                    id: "westpanel",
                    xtype: "panel",
                    header: false,
                    split: true,
                    collapsible: true,
                    collapseMode: "mini",
                    hideCollapseTool: true,
                    layout: "fit",
                    region: "west",
                    width: 200,
                    items: []
                });
                layertreeactivated = true;
            }
            if (data.tools[index].alias == 'getfeatureinfo') {
                config.portalConfig.items.push(
                        {
                            id: "hiddentbar",
                            xtype: "panel",
                            split: false,
                            layout: "fit",
                            height: 0,
                            region: "south",
                            items: []
                        })
            }
        }
    }
    if (layertreeactivated == false) {
        config.portalConfig.items.push(
                {
                    id: "westpanel",
                    xtype: "panel",
                    header: false,
                    split: false,
                    layout: "fit",
                    region: "west",
                    width: 0
                });
    }
    config.tools = [];
    var layermanager = {
        ptype: "sdi_gxp_layermanager",
        rootNodeText: data.rootnodetext,
        defaultGroup: defaultgroup,
        outputConfig: {
            id: "tree",
            border: true,
            tbar: []
        },
        outputTarget: "westpanel"
    };

    //Groups
    layermanager.groups = {background: {title: backgroundname, exclusive: true, expanded: backgroundexpanded}};
    for (index = 0; index < groups.length; ++index) {
        layermanager.groups[groups[index].alias] = {title: groups[index].title, expanded: groups[index].expanded};
    }
    config.tools.push(layermanager);

    for (index = 0; index < data.tools.length; ++index) {
        switch (data.tools[index].alias) {
            case 'googleearth':
                var tool = {ptype: "gxp_googleearth", actionTarget: ["map.tbar", "globe.tbar"]};
                config.tools.push(tool);
                config.tools.push({actions: ["-"], actionTarget: "map.tbar"});
                break;
            case 'navigationhistory':
                var tool = {
                    ptype: "gxp_navigationhistory",
                    actionTarget: "map.tbar"
                };
                config.tools.push(tool);
                break;
            case 'navigation':
                var tool = {
                    ptype: "gxp_navigation",
                    actionTarget: "map.tbar",
                    toggleGroup: "navigation"
                };
                config.tools.push(tool);
                break;
            case 'zoom':
                var tool = {
                    ptype: "gxp_zoom",
                    actionTarget: "map.tbar",
                    toggleGroup: "navigation",
                    showZoomBoxAction: true,
                    controlOptions: {zoomOnClick: false}
                };
                config.tools.push(tool);
                break;
            case 'zoomtoextent':
                if (layertreeactivated == true) {
                    var tool = {
                        ptype: "gxp_zoomtoextent",
                        actionTarget: "map.tbar"
                    };
                    config.tools.push(tool);
                    tool = {
                        ptype: "gxp_zoomtolayerextent",
                        actionTarget: {target: "tree.contextMenu", index: 0}
                    };
                    config.tools.push(tool);
                }
                break;
            case 'measure':
                var tool = {
                    ptype: "gxp_measure",
                    toggleGroup: "navigation",
                    actionTarget: "map.tbar"
                };
                config.tools.push({actions: ["-"], actionTarget: "map.tbar"});
                config.tools.push(tool);
                break;
            case 'addlayer':
                if (layertreeactivated == true) {
                    var tool = {
                        ptype: "gxp_addlayers",
                        actionTarget: "tree.tbar"
                    };
                    config.tools.push(tool);
                }
                break;
            case 'searchcatalog':
                if (layertreeactivated == true) {
                    var tool = {
                        ptype: "sdi_searchcatalog",
                        actionTarget: "tree.tbar",
                        url: "index.php?option=com_easysdi_catalog&view=catalog&id=",
                        iwidth: mwidth,
                        iheight: mheight
                    };
                    config.tools.push(tool);
                }
                break;
            case 'layerdetailsheet':
                if (layertreeactivated == true) {
                    var tool = {
                        ptype: "sdi_layerdetailsheet",
                        actionTarget: ["tree.contextMenu"],
                        iwidth: mwidth,
                        iheight: mheight
                    };
                    config.tools.push(tool);
                }
                break;
            case 'layerdownload':
                if (layertreeactivated == true) {
                    var tool = {ptype: "sdi_layerdownload",
                        actionTarget: ["tree.contextMenu"],
                        iwidth: mwidth,
                        iheight: mheight};
                    config.tools.push(tool);
                }
                break;
            case 'layerorder':
                if (layertreeactivated == true) {
                    var tool = {ptype: "sdi_layerorder",
                        actionTarget: ["tree.contextMenu"],
                        iwidth: mwidth,
                        iheight: mheight};
                    config.tools.push(tool);
                }
                break;
            case 'removelayer':
                if (layertreeactivated == true) {
                    var tool = {ptype: "gxp_removelayer",
                        actionTarget: ["tree.contextMenu"]};
                    config.tools.push(tool);
                }
                break;
            case 'layerproperties':
                if (layertreeactivated == true) {
                    var tool = {ptype: "gxp_layerproperties",
                        id: "layerproperties",
                        actionTarget: ["tree.contextMenu"]};
                    config.tools.push(tool);
                }
                break;
            case 'getfeatureinfo':
                var tool = {
                    ptype: "gxp_wmsgetfeatureinfo",
                    popupTitle: "Feature Info",
                    toggleGroup: "interaction",
                    format: "' . $tool->params . '",
                    actionTarget: "hiddentbar",
                    defaultAction: 0
                }
                config.tools.push(tool);
                break;
            case 'googlegeocoder':
                config.tools.push({actions: ["-"], actionTarget: "map.tbar"});
                var tool = {
                    ptype: "gxp_googlegeocoder",
                    outputTarget: "map.tbar"
                }
                config.tools.push(tool);
                break;
            case 'print':
                if (params.printserviceurl != null) {
                    config.tools.push({actions: ["-"], actionTarget: "map.tbar"});
                    var tool = {
                        ptype: "sdi_gxp_print",
                        customParams: {outputFilename: "GeoExplorer-print"},
                        printService: params.printserviceurl,
                        includeLegend: true,
                        actionTarget: "map.tbar",
                        showButtonText: false
                    };
                    if (params.printserviceprinturl == '') {
                        tool.printURL = params.printserviceurl + 'print.pdf';
                    }
                    ;
                    if (params.printserviceprinturl == '') {
                        tool.printURL = params.printserviceurl + 'print.pdf';
                    } else {
                        tool.printURL = params.printserviceprinturl;
                    }
                    ;
                    if (params.printservicecreateurl == '') {
                        tool.printURL = params.printserviceurl + 'create.json';
                    } else {
                        tool.printURL = params.printservicecreateurl;
                    }
                    ;
                    config.tools.push(tool);
                }
                break;

        }
    }

    //Default source
    config.defaultSourceType = "sdi_gxp_wmssource";

    //Sources
    config.sources = {"ol": {ptype: "sdi_gxp_olsource"}};

    for (index = 0; index < services.length; ++index) {
        if (services[index].url != null) {
            config.sources[services[index].alias] = {ptype: services[index].ptype, url: services[index].url};
        }
        else {
            config.sources[services[index].alias] = {ptype: services[index].ptype};
        }
    }

    //Map
    config.map = {id: "sdimap",
        title: "Map",
        header: false,
        projection: data.srs,
        maxExtent: JSON.parse("[" + data.maxextent + "]"),
        maxResolution: data.maxresolution,
        units: data.units
    };
    if (data.centercoordinates)
        config.map["center"] = JSON.parse("[" + data.centercoordinates + "]");
    if (data.restrictedextent)
        config.map["restrictedExtent"] = JSON.parse("[" + data.restrictedextent + "]");
    if (data.zoom)
        config.map["zoom"] = data.zoom;
    if (cleared == "true") {
        config.map.controls = [];
    }

    //Layers
    config.map.layers = [];
    for (index = 0; index < layers.length; ++index) {
        var layer = layers[index];
        switch (layer.source) {
            case 'ol':
                switch (layer.type) {
                    case 'WMTS':
                        var wmts = {
                            source: "ol",
                            type: "OpenLayers.Layer.WMTS",
                            group: layer.group,
                            args: [
                                {
                                    name: layer.name,
                                    url: layer.url,
                                    layer: layer.layer,
                                    visibility: layer.visibility,
                                    singleTile: layer.singleTile,
                                    transitionEffect: layer.transitionEffect,
                                    opacity: layer.opacity,
                                    style: layer.asOLstyle,
                                    matrixSet: layer.matrixSet
                                }
                            ]
                        };
                        for (prop = 0; prop < layer.asOLoptions.lentgh; ++prop) {
                            //layer[]
                        }
                        if (layer.href) {
                            wmts.href = layer.href;
                        }
                        ;
                        if (layer.download) {
                            wmts.download = layer.download;
                        }
                        ;
                        if (layer.order) {
                            wmts.order = layer.order;
                        }
                        ;
                        config.map.layers.push(wmts);
                        break
                    case 'WMSC':
                    case 'WMS' :
                        var wms = {
                            source: "ol",
                            type: "OpenLayers.Layer.WMS",
                            group: layer.group,
                            args: [
                                layer.name,
                                layer.url,
                                {
                                    layers: layer.layers,
                                    version: layer.version,
                                    tiled: true
                                },
                                {
                                    visibility: layer.visibility,
                                    singleTile: layer.singleTile,
                                    transitionEffect: layer.transitionEffect,
                                    opacity: layer.opacity
                                }
                            ]
                        };
                        if (layer.style) {
                            wms.args[3].style = layer.style;
                        }
                        ;
                        if (layer.href) {
                            wms.href = layer.href;
                        }
                        ;
                        if (layer.download) {
                            wms.download = layer.download;
                        }
                        ;
                        if (layer.order) {
                            wms.order = layer.order;
                        }
                        ;
                        //TODO : asoloptions
                        config.map.layers.push(wms);
                        break;
                    default:
                        break;
                }
                break;

            default :
                var overlay = {
                    source: layer.source,
                    tiled: layer.tiled,
                    version: layer.version,
                    name: layer.name,
                    title: layer.title,
                    group: layer.group,
                    visibility: layer.visibility,
                    opacity: layer.opacity
                };
                if (layer.attribution) {
                    overlay.attribution = layer.attribution;
                }
                if (layer.fixed) {
                    overlay.fixed = layer.fixed;
                }
                if (layer.href) {
                    overlay.href = layer.href;
                }
                ;
                if (layer.download) {
                    overlay.download = layer.download;
                }
                ;
                if (layer.order) {
                    overlay.order = layer.order;
                }
                ;
                config.map.layers.push(overlay);
                break;
        }
    }

    //TODO //If not cleared
    if (cleared == "false") {
        config.mapItems = [
            {
                xtype: "gx_zoomslider",
                vertical: true,
                height: 100
            }
            ,
            {
                xtype: "sdi_gxp_scaleoverlay"
            }
        ];
    }

    config.mapPlugins =
            [
                {
                    ptype: "sdi_gxp_loadingindicator",
                    loadingMapMessage: layermsg
                }
            ];
    return config;
}