<?php

/**
 * @version     4.0.0
 * @package     com_easysdi_map
 * @copyright   Copyright (C) 2012. All rights reserved.
 * @license     GNU General Public License version 3 or later; see LICENSE.txt
 * @author      EasySDI Community <contact@easysdi.org> - http://www.easysdi.org
 */
defined('_JEXEC') or die;

require_once JPATH_SITE . '/components/com_easysdi_map/models/map.php';

abstract class Easysdi_mapHelper {

    public static function getMapScript($mapid) {
        $model = JModelLegacy::getInstance('map', 'Easysdi_mapModel');
        $item = $model->getData($mapid);

        $config = Easysdi_mapHelper::getMapConfig($item);

        //Load admin language file
        $lang = JFactory::getLanguage();
        $lang->load('com_easysdi_map', JPATH_ADMINISTRATOR);

        if (JDEBUG) {
            $output =
            '<link rel="stylesheet" href="' . JURI::base() . 'administrator/components/com_easysdi_core/libraries/ext/resources/css/ext-all.css" type="text/css" />
            <link rel="stylesheet" href="' . JURI::base() . 'administrator/components/com_easysdi_core/libraries/ext/resources/css/xtheme-gray.css" type="text/css" />
            <link rel="stylesheet" href="' . JURI::base() . 'administrator/components/com_easysdi_core/libraries/openlayers/theme/default/style.css" type="text/css" />
            <link rel="stylesheet" href="' . JURI::base() . 'administrator/components/com_easysdi_core/libraries/geoext/resources/css/popup.css" type="text/css" />
            <link rel="stylesheet" href="' . JURI::base() . 'administrator/components/com_easysdi_core/libraries/geoext/resources/css/layerlegend.css" type="text/css" />
            <link rel="stylesheet" href="' . JURI::base() . 'administrator/components/com_easysdi_core/libraries/geoext/resources/css/gxtheme-gray.css" type="text/css" />
            <link rel="stylesheet" href="' . JURI::base() . 'administrator/components/com_easysdi_core/libraries/ux/geoext/resources/css/printpreview.css" type="text/css" />
            <link rel="stylesheet" href="' . JURI::base() . 'administrator/components/com_easysdi_core/libraries/gxp/theme/all.css" type="text/css" />
            <link rel="stylesheet" href="' . JURI::base() . 'components/com_easysdi_map/views/map/tmpl/easysdi.css" type="text/css" />

            <script src="' . JURI::base(true) . '/administrator/components/com_easysdi_core/libraries/ext/adapter/ext/ext-base-debug.js" type="text/javascript"></script>
            <script src="' . JURI::base(true) . '/administrator/components/com_easysdi_core/libraries/ext/ext-all-debug.js" type="text/javascript"></script>
            <script src="' . JURI::base(true) . '/administrator/components/com_easysdi_core/libraries/ux/ext/RowExpander.js" type="text/javascript"></script>
            <script src="' . JURI::base(true) . '/administrator/components/com_easysdi_core/libraries/openlayers/OpenLayers.js" type="text/javascript"></script>
            <script src="' . JURI::base(true) . '/administrator/components/com_easysdi_core/libraries/geoext/lib/GeoExt.js" type="text/javascript"></script>
            <script src="' . JURI::base(true) . '/administrator/components/com_easysdi_core/libraries/ux/geoext/PrintPreview.js" type="text/javascript"></script>
            <script src="' . JURI::base(true) . '/administrator/components/com_easysdi_core/libraries/gxp/script/gxp.js" type="text/javascript"></script>
            <script src="' . JURI::base(true) . '/administrator/components/com_easysdi_core/libraries/easysdi/js/sdi.js" type="text/javascript"></script>';

            $files = glob('administrator/components/com_easysdi_core/libraries/easysdi/js/gxp/locale/*.{js}', GLOB_BRACE);
            foreach ($files as $file) {
                $output .= '<script src="' . $file . '" type="text/javascript"></script>';
            }

            $output .=
                    '<script src="' . JURI::base(true) . '/media/jui/js/jquery.js" type="text/javascript"></script>
            <script src="' . JURI::base(true) . '/media/jui/js/jquery-noconflict.js" type="text/javascript"></script>
            <script src="' . JURI::base(true) . '/media/jui/js/bootstrap.js" type="text/javascript"></script>
            <script src="' . JURI::base(true) . '/media/system/js/mootools-core-uncompressed.js" type="text/javascript"></script>
            <script src="' . JURI::base(true) . '/media/system/js/core-uncompressed.js" type="text/javascript"></script>';
        } else {
            $output =
                    '<link rel="stylesheet" href="' . JURI::base() . 'administrator/components/com_easysdi_core/libraries/ext/resources/css/ext-all.css" type="text/css" />
            <link rel="stylesheet" href="' . JURI::base() . 'administrator/components/com_easysdi_core/libraries/ext/resources/css/xtheme-gray.css" type="text/css" />
            <link rel="stylesheet" href="' . JURI::base() . 'administrator/components/com_easysdi_core/libraries/openlayers/theme/default/style.css" type="text/css" />
            <link rel="stylesheet" href="' . JURI::base() . 'administrator/components/com_easysdi_core/libraries/geoext/resources/css/popup.css" type="text/css" />
            <link rel="stylesheet" href="' . JURI::base() . 'administrator/components/com_easysdi_core/libraries/geoext/resources/css/layerlegend.css" type="text/css" />
            <link rel="stylesheet" href="' . JURI::base() . 'administrator/components/com_easysdi_core/libraries/geoext/resources/css/gxtheme-gray.css" type="text/css" />
            <link rel="stylesheet" href="' . JURI::base() . 'administrator/components/com_easysdi_core/libraries/ux/geoext/resources/css/printpreview.css" type="text/css" />
            <link rel="stylesheet" href="' . JURI::base() . 'administrator/components/com_easysdi_core/libraries/gxp/theme/all.css" type="text/css" />
            

            <script src="' . JURI::base(true) . '/administrator/components/com_easysdi_core/libraries/ext/adapter/ext/ext-base.js" type="text/javascript"></script>
            <script src="' . JURI::base(true) . '/administrator/components/com_easysdi_core/libraries/ext/ext-all.js" type="text/javascript"></script>
            <script src="' . JURI::base(true) . '/administrator/components/com_easysdi_core/libraries/ux/ext/RowExpander.js" type="text/javascript"></script>
            <script src="' . JURI::base(true) . '/administrator/components/com_easysdi_core/libraries/openlayers/OpenLayers.js" type="text/javascript"></script>
            <script src="' . JURI::base(true) . '/administrator/components/com_easysdi_core/libraries/geoext/lib/geoext.min.js" type="text/javascript"></script>
            <script src="' . JURI::base(true) . '/administrator/components/com_easysdi_core/libraries/ux/geoext/PrintPreview.js" type="text/javascript"></script>
            <script src="' . JURI::base(true) . '/administrator/components/com_easysdi_core/libraries/gxp/script/gxp.min.js" type="text/javascript"></script>
            <script src="' . JURI::base(true) . '/administrator/components/com_easysdi_core/libraries/easysdi/js/sdi.min.js" type="text/javascript"></script>';

            $files = glob('administrator/components/com_easysdi_core/libraries/easysdi/js/gxp/locale/*.{js}', GLOB_BRACE);
            foreach ($files as $file) {
                $output .= '<script src="' . $file . '" type="text/javascript"></script>';
            }

            $output .=
                    '<script src="' . JURI::base(true) . '/media/jui/js/jquery.js" type="text/javascript"></script>
            <script src="' . JURI::base(true) . '/media/jui/js/jquery-noconflict.js" type="text/javascript"></script>
            <script src="' . JURI::base(true) . '/media/jui/js/bootstrap.js" type="text/javascript"></script>
            <script src="' . JURI::base(true) . '/media/system/js/mootools-core.js" type="text/javascript"></script>
            <script src="' . JURI::base(true) . '/media/system/js/core.js" type="text/javascript"></script>';
        }

        $output .= '<div id="sdimapcontainer" class="cls-sdimapcontainer"></div>';

        $output .= '<script>
            var app;
            var loadingMask;
            Ext.Container.prototype.bufferResize = false;
            Ext.onReady(function(){
                loadingMask = new Ext.LoadMask(Ext.getBody(), {
                msg:"';
                    $output .= JText::_('COM_EASYSDI_MAP_MAP_LOAD_MESSAGE');
                    $output .= '"
                });
                loadingMask.show();
                var height = Ext.get("sdimapcontainer").getHeight();
                if(!height)  height = Ext.get("sdimapcontainer").getWidth() * 1/2;
                var width = Ext.get("sdimapcontainer").getWidth();
                OpenLayers.ImgPath = "administrator/components/com_easysdi_core/libraries/openlayers/img/";
                GeoExt.Lang.set("';
                    $output .= $lang->getTag();
                    $output .= '");
                app = new gxp.Viewer(' . $config . ');';

                //Add the mouseposition control if activated in the map configuration
                //Can not be done in the gxp.Viewer instanciation because it has to be done on the openlayers map object
                foreach ($item->tools as $tool) {
                    if ($tool->alias == 'mouseposition') {
                        $output .= 'app.mapPanel.map.addControl(new OpenLayers.Control.MousePosition());';
                        break;
                    }
                }

                $output .= '
                    app.on("ready", function (){ loadingMask.hide(); });



                    SdiScaleLineParams= { 
                            bottomInUnits :"' . $item->bottomInUnits . '",
                            bottomOutUnits :"' . $item->bottomOutUnits . '",
                            topInUnits :"' . $item->topInUnits . '",
                            topOutUnits :"' . $item->topOutUnits . '"
                    }; 
                    Ext.QuickTips.init();
                    Ext.apply(Ext.QuickTips.getQuickTip(), {maxWidth: 1000 });
                    Ext.EventManager.onWindowResize(function() {
                        app.portal.setWidth(Ext.get("sdimapcontainer").getWidth());
                        app.portal.setHeight(Ext.get("sdimapcontainer").getWidth() * 1/2);
                    });
            });';
            $output .= '</script>';

        return $output;
    }

    /**
     * @param Object        Complete map object (with all linked objects embedded)
     * 
     * @return string       Config JSON object to initialize map
     */
    public static function getMapConfig($item, $layer = null) {
        $user = JFactory::getUser();
        $app = JFactory::getApplication();
        $params = $app->getParams('com_easysdi_map');

        $config = '{';
        $proxyhost = $params->get('proxyhost');
        if (!empty($proxyhost)) {
            $config .= 'proxy :"' . $proxyhost . '"';
        }
        $config .= 'about: 
                        { 
                            title: "' . $item->title . '", 
                            "abstract": "' . $item->abstract . '"
                         },
                    portalConfig: 
                        {
                        renderTo:"sdimapcontainer",
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
                            }, ';

        $layertreeactivated = false;
        foreach ($item->tools as $tool) {
            if ($tool->alias == 'layertree') {
                 $layertreeactivated = true;
                  $config .= '{
                        id: "westpanel",
                        xtype: "panel",
                        header: false,
                        split: true,
                        collapsible: true,
                        collapseMode: "mini",
                        hideCollapseTool: true,
                        layout: "fit",
                        region: "west",
                        width: 200
                    },';
                break;
            }
        }

       if(!$layertreeactivated){
           $config .= '{
                        id: "westpanel",
                        xtype: "panel",
                        header: false,
                        split: false,
                        layout: "fit",
                        region: "west",
                        width: 0
                    },';
       }
        
        foreach ($item->tools as $tool) {
            if ($tool->alias == 'getfeatureinfo') {
                $config .= '{
                                id:"hiddentbar",
                                xtype:"panel",
                                split: false,
                                layout: "fit",
                                height:0,
                                region:"south",
                                items:[]
                            }';
                break;
            }
        }
        $config .= ']
                    },                   
                    tools: [';
        
       
                $config .= '{
                            ptype: "sdi_gxp_layermanager",
                            rootNodeText: "' . $item->rootnodetext . '",';

                foreach ($item->groups as $group) :
                    if ($group->isdefault) {
                        //Acces not allowed
                        if (!in_array($group->access, $user->getAuthorisedViewLevels()))
                            break;
                        $config .= 'defaultGroup: "' . $group->alias . '",';
                        break;
                    }
                endforeach;

                $config .= 'outputConfig: {
                            id: "tree",
                            border: true,
                            tbar: [] 
                            },
                            groups: {';


                //Groups are added in the order saved in the database
                foreach ($item->groups as $group) :
                    //Acces not allowed
                    if (!in_array($group->access, $user->getAuthorisedViewLevels()))
                        continue;

                    if ($group->isbackground) {
                        $config .= '
                                    "background": {
                                    title: "' . $group->name . '", 
                                    exclusive: true,';
                        if ($group->isdefaultopen) :
                            $config .= 'expanded: true},';
                        else :
                            $config .= 'expanded: false},';
                        endif;
                    }
                    else {
                        $config .= '"' . $group->alias . '" : {
                                        title : "' . $group->name . '",';
                        if ($group->isdefaultopen) :
                            $config .= 'expanded: true},';
                        else :
                            $config .= 'expanded: false},';
                        endif;
                    }
                endforeach;

                $config .= '},';
                $config .= ' outputTarget: "westpanel"
                        },';
               
               


        foreach ($item->tools as $tool) {
            switch ($tool->alias) {
                case 'googleearth':
                    $config .= '
                    {
                    ptype: "gxp_googleearth",
                    actionTarget: ["map.tbar", "globe.tbar"]
                    },
                    {
                    actions: ["-"],
                    actionTarget: "map.tbar"
                    },
                    ';
                    break;
                case 'navigationhistory':
                    $config .= '
                    {
                    ptype: "gxp_navigationhistory",
                    actionTarget: "map.tbar"
                    },
                    ';
                    break;
                case 'navigation':
                    $config .= '
                    {
                    ptype: "gxp_navigation",
                    actionTarget: "map.tbar", 
                    toggleGroup: "navigation"
                    },
                    ';
                    break;
                case 'zoom':
                    $config .= '
                    {
                    ptype: "gxp_zoom",
                    actionTarget: "map.tbar",
                    toggleGroup: "navigation",
                    showZoomBoxAction: true,
                    controlOptions: {zoomOnClick: false}
                    },
                    ';
                    break;
                case 'zoomtoextent':
                    if ($layertreeactivated) {
                        $config .= '
                        {
                        ptype: "gxp_zoomtoextent",
                        actionTarget: "map.tbar"
                        },
                        {
                        ptype: "gxp_zoomtolayerextent",
                        actionTarget: {target: "tree.contextMenu", index: 0}
                        },
                        ';
                    }
                    break;
                case 'measure':
                    $config .= '
                    {
                    actions: ["-"],
                    actionTarget: "map.tbar"
                    },
                    {
                    ptype: "gxp_measure",
                    toggleGroup: "measure",
                    actionTarget: "map.tbar"
                    },
                    ';
                    break;
                case 'addlayer':
                    if ($layertreeactivated) {
                        $config .= '
                        {
                        ptype: "gxp_addlayers",
                        actionTarget: "tree.tbar"
                        },
                        ';
                    }
                    break;
                case 'removelayer':
                    if ($layertreeactivated) {
                        $config .= '
                        {
                        ptype: "gxp_removelayer",
                        actionTarget: ["tree.contextMenu"]
                        },
                        ';
                    }
                    break;

                case 'layerproperties':
                    if ($layertreeactivated) {
                        $config .= '
                        {
                        ptype: "gxp_layerproperties",
                        id: "layerproperties",
                        actionTarget: ["tree.contextMenu"]
                        },
                        ';
                    }
                    break;

                case 'getfeatureinfo':
                    $config .= '
                    {
                    ptype: "gxp_wmsgetfeatureinfo",
                    popupTitle: "Feature Info", 
                    toggleGroup: "interaction", 
                    format: "' . $tool->params . '", 
                    actionTarget: "hiddentbar",
                    defaultAction: 0
                    },

                    ';
                    break;
                case 'googlegeocoder':
                    $config .= '
                    {
                    actions: ["-"],
                    actionTarget: "map.tbar"
                    },
                    {
                    ptype: "gxp_googlegeocoder",
                    outputTarget: "map.tbar"
                    },
                    ';
                    break;
                case 'print':
                    if (!$params->get('printserviceurl'))
                        continue;
                    else
                        $config .= '
                    {
                    actions: ["-"],
                    actionTarget: "map.tbar"
                    },
                    {
                    ptype: "sdi_gxp_print",
                    customParams: {outputFilename: "GeoExplorer-print"},
                    printService: "' . $params->get('printserviceurl') . '",';
                    if ($params->get('printserviceprinturl') == '')
                        $config .= 'printURL : "' . $params->get('printserviceurl') . 'print.pdf",';
                    else
                        $config .= 'printURL : "' . $params->get('printserviceprinturl') . '",';
                    if ($params->get('printservicecreateurl') == '')
                        $config .= ' createURL : "' . $params->get('printserviceurl') . 'create.json",';
                    else
                        $config .= ' createURL : "' . $params->get('printservicecreateurl') . '",';

                    $config .= 'includeLegend: true, 
                    actionTarget: "map.tbar",
                    showButtonText: false
                    },
                    ';
                    break;
            }
        }
        $config .= '
        ],';

        // layer sources
        switch ($item->defaultserviceconnector_id) {
            case 2 :
                $config .= '
                defaultSourceType: "gxp_wmssource",
                ';
                break;
            case 11 :
                $config .= '
                defaultSourceType: "gxp_wmscsource",
                ';
                break;
        }

        $config .= '
        sources: 
        {
        "ol": { ptype: "gxp_olsource" }, ';

        foreach ($item->physicalservices as $service) {
            //Acces not allowed
            if (!in_array($service->access, $user->getAuthorisedViewLevels()))
                continue;
            switch ($service->serviceconnector_id) {
                case 2 :
                    $config .= ' 
                    "' . $service->alias . '":
                    {
                    ptype: "gxp_wmssource",
                    url: "' . $service->resourceurl . '"
                    },
                    ';
                    break;
                case 11 :
                    $config .= ' 
                    "' . $service->alias . '":
                    {
                    ptype: "gxp_wmscsource",
                     url: "' . $service->resourceurl . '"
                    },
                    ';
                    break;
                case 12 :
                    $config .= ' 
                    "' . $service->alias . '":
                    {
                    ptype: "sdi_gxp_bingsource"
                    },
                    ';
                    break;
                case 13 :
                    $config .= ' 
                    "' . $service->alias . '":
                    {
                    ptype: "sdi_gxp_googlesource"
                    },
                    ';
                    break;
                case 14 :
                    $config .= ' 
                    "' . $service->alias . '":
                    {
                    ptype: "sdi_gxp_osmsource"
                    },
                    ';
                    break;
            }
        }
        if (isset($item->virtualservices)) {
            foreach ($item->virtualservices as $service) {
                switch ($service->serviceconnector_id) {
                    case 2 :
                        $config .= ' 
                    "' . $service->alias . '":
                        {
                        ptype: "gxp_wmssource",
                        url: "' . $service->url . '"
                        },
                        ';
                        break;
                    case 11 :
                        $config .= ' 
                    "' . $service->alias . '":
                        {
                        ptype: "gxp_wmscsource",
                        url: "' . $service->url . '"
                        },
                    ';
                }
            }
        }
        $config .= ' 
        },

        // map and layers
        map: 
        {
        id: "sdimap",
        title: "Map",
        header:false,
        projection: "' . $item->srs . '",
        center: [' . $item->centercoordinates . '],
        maxExtent : [' . $item->maxextent . '],
        restrictedExtent: [' . $item->maxextent . '],
        maxResolution: ' . $item->maxresolution . ',
        units: "' . $item->unit . '",
        layers: 
        [
        ';

        //Layers have to be added the lowest before the highest
        //To do that, the groups have to be looped in reverse order
        $groups_reverse = array_reverse($item->groups);
        foreach ($groups_reverse as $group) {
            //Acces not allowed
            if (!in_array($group->access, $user->getAuthorisedViewLevels()))
                continue;

            if (!empty($group->layers)) {
                foreach ($group->layers as $layer) {
                    //Acces not allowed
                    if (!in_array($layer->access, $user->getAuthorisedViewLevels()))
                        continue;

                    if ($layer->asOL || $layer->serviceconnector == 'WMTS') {
                        switch ($layer->serviceconnector) {
                            case 'WMTS' :
                                $config .= ' 
                                {
                                source: "ol",
                                type: "OpenLayers.Layer.WMTS",
                                args: [
                                {
                                name:"' . $layer->name . '", 
                                url : "' . $layer->serviceurl . '", 
                                layer: "' . $layer->layername . '", ';

                                if ($layer->isdefaultvisible == 1)
                                    $config .= 'visibility: true,';
                                else
                                    $config .= 'visibility: false,';
                                if ($layer->istiled == 1)
                                    $config .= 'singleTile: true';
                                else
                                    $config .= 'singleTile: false';

                                $config .= 'transitionEffect: "resize",
                                opacity: ' . $layer->opacity . ',
                                style: "' . $layer->asOLstyle . '",
                                matrixSet: "' . $layer->asOLmatrixset . '",';
                                if (!empty($layer->metadatalink)) {
                                    $config .= 'metadataURL: "' . $layer->metadatalink . '",';
                                }

                                $config .= $layer->asOLoptions;

                                $config .=' }
                                ],';
                                if ($group->isbackground)
                                    $config .= 'group: "background"';
                                else
                                    $config .= 'group: "' . $group->alias . '"';
                                $config .='
                                },
                                ';
                                break;
                            case 'WMS' :
                                $config .= ' 
                                {
                                source : "ol",
                                type : "OpenLayers.Layer.WMS",
                                args: 
                                [
                                "' . $layer->name . '",
                                "' . $layer->serviceurl . '",
                                {
                                layers: "' . $layer->layername . '", 
                                version: "' . $layer->version . '"
                                },
                                {';


                                if ($layer->isdefaultvisible == 1)
                                    $config .= 'visibility :  true';
                                else
                                    $config .= 'visibility :  false';
                                $config .= ',';

                                if ($layer->istiled == 1)
                                    $config .= 'singleTile :  true';
                                else
                                    $config .= 'singleTile :  false';
                                $config .=',
                                opacity: ' . $layer->opacity . ',
                                transitionEffect: "resize",
                                style: "' . $layer->asOLstyle . '",';

                                if (!empty($layer->metadatalink)) {
                                    $config .='metadataURL: "' . $layer->metadatalink . '",';
                                }
                                $config .= '}';
                                $config .= $layer->asOLoptions;
                                $config .= '}
                                ],';

                                if ($group->isbackground)
                                    $config .= ' group : "background"';
                                else
                                    $config .= ' group : "' . $group->alias . '"';
                                $config .= '
                                },
                                ';
                                break;
                            case 'WMSC' :
                                $config .= ' 
                                {
                                source : "ol",
                                type : "OpenLayers.Layer.WMS",
                                args: 
                                [
                                "' . $layer->name . '",
                                "' . $layer->serviceurl . '",
                                {
                                layers: "' . $layer->layername . '", 
                                version: "' . $layer->version . '",
                                tiled: true
                                },
                                {';

                                if ($layer->isdefaultvisible == 1)
                                    $config .= 'visibility :  true,';
                                else
                                    $config .= 'visibility :  false,';


                                if ($layer->istiled == 1)
                                    $config .= 'singleTile :  true,';
                                else
                                    $config .= 'singleTile :  false,';

                                $config .= 'opacity: ' . $layer->opacity . ',
                                transitionEffect: "resize",
                                style: "' . $layer->asOLstyle . '",';

                                if (!empty($layer->metadatalink)) {
                                    $config .= 'metadataURL: "' . $layer->metadatalink . '",';
                                }
                                $config .=$layer->asOLoptions;

                                $config .= '}],';
                                if ($group->isbackground)
                                    $config .= ' group : "background"';
                                else
                                    $config .= ' group : "' . $group->alias . '"';
                                $config .= '
                                },
                                ';
                                break;
                        }
                    }
                    else {
                        switch ($layer->serviceconnector) {
                            case 'WMTS':
                                break;
                            default :
                                $config .= '
                                {
                                source: "' . $layer->servicealias . '",';

                                if ($layer->istiled == 1)
                                    $config .= 'tiled :  true,';
                                else
                                    $config .= 'tiled :  false,';

                                if (!empty($layer->version)) {
                                    $config .= 'version: "' . $layer->version . '",';
                                }
                                if (!empty($layer->metadatalink)) {
                                    $config .= 'metadataURL: "' . $layer->metadatalink . '",';
                                }
                                $config .= 'name: "' . $layer->layername . '",
                                title: "' . $layer->name . '",';
                                if ($group->isbackground)
                                    $config .= ' group : "background",';
                                else
                                    $config .= ' group : "' . $group->alias . '",';
                                if ($group->alias == "background")
                                    $config .= 'fixed: true,';

                                if ($layer->isdefaultvisible == 1)
                                    $config .= 'visibility :  true,';
                                else
                                    $config .= 'visibility :  false,';

                                $config .= 'opacity: ' . $layer->opacity . '
                                },
                                ';
                                break;
                        }
                    }
                }
            }
        }
        $config .= '
        ]
        }
        ,
        mapItems: 
        [
            {
                xtype: "gx_zoomslider",
                vertical: true,
                height: 100
            },
            {
                xtype: "gxp_scaleoverlay"
            }
        ],
        mapPlugins:
        [
            {
                ptype: "sdi_gxp_loadingindicator",
                loadingMapMessage: "' . JText::_('COM_EASYSDI_MAP_LAYER_LOAD_MESSAGE') . '"
            }
        ]
';
        $config .='}';

        return $config;
    }

}

