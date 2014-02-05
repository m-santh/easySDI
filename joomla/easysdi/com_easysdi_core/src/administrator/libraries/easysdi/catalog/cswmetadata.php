<?php

/**
 * @version     4.0.0
 * @package     com_easysdi_core
 * @copyright   Copyright (C) 2012. All rights reserved.
 * @license     GNU General Public License version 3 or later; see LICENSE.txt
 * @author      EasySDI Community <contact@easysdi.org> - http://www.easysdi.org
 */
require_once JPATH_ADMINISTRATOR . '/components/com_easysdi_contact/tables/user.php';
require_once JPATH_ADMINISTRATOR . '/components/com_easysdi_core/tables/version.php';
require_once JPATH_ADMINISTRATOR . '/components/com_easysdi_core/tables/resource.php';
require_once JPATH_ADMINISTRATOR . '/components/com_easysdi_shop/tables/diffusion.php';
require_once JPATH_ADMINISTRATOR . '/components/com_easysdi_catalog/tables/metadata.php';
require_once JPATH_ADMINISTRATOR . '/components/com_easysdi_core/libraries/easysdi/model/sdimodel.php';
require_once JPATH_SITE . '/components/com_easysdi_map/helpers/easysdi_map.php';

class cswmetadata {

    const LISTE = 1;
    const MULTIPLELIST = 2;
    const CHECKBOX = 3;
    const TEXT = 4;
    const TEXTAREA = 5;
    const MESSAGE = 6;

    /**
     * database
     *
     * @var    JDatabaseDriver
     */
    public $db = null;

    /**
     * 
     */
    public $guid = null;

    /**
     * 
     */
    public $catalogurl = null;

    /**
     * 
     */
    public $dom = null;

    /**
     * 
     */
    public $extendeddom = null;

    /**
     * Easysdi_catalogTablemetadata
     *
     * @var    Easysdi_catalogTablemetadata
     */
    public $metadata = null;

    /**
     *
     * @var Easysdi_coreTableversion 
     */
    public $version = null;

    /**
     *
     * @var Easysdi_coreTablediffusion 
     */
    public $diffusion = null;

    /**
     *
     * @var Easysdi_coreTableresource 
     */
    public $resource = null;

    function __construct($guid = null) {
        $this->guid = $guid;
        $this->db = JFactory::getDbo();
        $params = JComponentHelper::getParams('com_easysdi_catalog');
        $this->catalogurl = $params->get('catalogurl');
        $this->rootxslfile = $params->get('rootXSLfile');
    }

    /**
     * @return DOMDocument 
     */
    public function load($content = 'CORE') {
        
        $catalogUrlGetRecordById = $this->catalogurl . "?request=GetRecordById&service=CSW&version=2.0.2&elementSetName=full&outputschema=csw:IsoRecord&content=" . $content . "&id=" . $this->guid;

        $response = $this->CURLRequest("GET", $catalogUrlGetRecordById);
        if (!$response) {
            return false;
        }
        $doc = new DOMDocument();
        $doc->loadXML($response);

        if ($doc == false) {
            $msg = JText::_('CATALOG_METADATA_EDIT_NOMETADATA_MSG');
            JFactory::getApplication()->enqueueMessage('No such metadata in the catalog.', 'error');
            return false;
        }
        if ($doc->getElementsByTagName("ExceptionReport")->length > 0) {
            $msg = $doc->getElementsByTagName("ExceptionReport")->item(0)->nodeValue;
            JFactory::getApplication()->enqueueMessage($msg, 'error');
            return false;
        }

        $elements = $doc->getElementsByTagName('GetRecordByIdResponse');
        $this->dom = new DOMDocument('1.0', 'UTF-8');
        $children = $elements->item(0)->childNodes;
        foreach ($children as $child):
            if ($child->nodeType == XML_ELEMENT_NODE):
                $xmlContent = $this->dom->importNode($child, true);
                $this->dom->appendChild($xmlContent);
                break;
            endif;
        endforeach;

        return $doc;
    }

    /**
     * A call to this function replaces a GetRecordById request by giving directly the metadata xml content
     * @param mixed $metadata DOMDocument or DOMElement
     */
    public function init($metadata) {
        if ($metadata):
            if ($metadata instanceof DOMDocument) {
                $this->dom = $metadata;
            } else
            if ($metadata instanceof DOMElement) {
                
                $this->dom = new DOMDocument('1.0', 'UTF-8');
                $xmlContent = $this->dom->importNode($metadata, true);
                $this->dom->appendChild($xmlContent);
            } else {

                $this->dom = new DOMDocument('1.0', 'UTF-8');


                $xmlContent = $this->dom->importNode(dom_import_simplexml($metadata), true);
                $this->dom->appendChild($xmlContent);
            }
        endif;
    }

    public function display($catalog, $type, $callfromJoomla, $lang) {
        $this->load();
        $this->extend($catalog, $type, $callfromJoomla, $lang);
        return $this->applyXSL();
    }

    /**
     * Buils an extended Metadata containing EasySDI information fields for XSL transformation
     */
    public function extend($catalog, $type, $preview, $callfromJoomla, $lang) {
        
        
        //Is it an harvested metadata
        $xpath = new DomXPath($this->dom);
        $xpath->registerNamespace('sdi', 'http://www.easysdi.org/2011/sdi');
        $sdiplatform = $xpath->query('descendant::sdi:platform');
        $isharvested = $sdiplatform->item(0)->getAttribute('harvested');
        
        $root = $this->dom->documentElement;

        $this->extendeddom = new DOMDocument('1.0', 'UTF-8');
        $this->extendeddom->formatOutput = true;
        $gmdroot = $this->extendeddom->importNode($root, true);

        $extendedroot = $this->extendeddom->createElement("Metadata");

        $extendedroot->appendChild($gmdroot);

        $extendedmetadata = $this->extendeddom->createElementNS('http://www.easysdi.org/2011/sdi', 'sdi:ExtendedMetadata');
        $extendedmetadata->setAttribute('lang', $lang);
        $extendedmetadata->setAttribute('callfromjoomla', (int) $callfromJoomla);

        $action = $this->extendeddom->createElementNS('http://www.easysdi.org/2011/sdi', 'sdi:action');

        if ($isharvested == 'false') {
            $this->metadata = JTable::getInstance('metadata', 'Easysdi_catalogTable');
            if (empty($this->guid)):
                $mdnode = $xpath->query('//sdi:metadata');
                $this->guid = $mdnode->item(0)->getAttribute('guid');
            endif;
            $keys = array("guid" => $this->guid);
            $this->metadata->load($keys);
            if (!empty($this->metadata->version_id)):
                $this->version = JTable::getInstance('version', 'Easysdi_coreTable');
                $this->version->load($this->metadata->version_id);
                $this->resource = JTable::getInstance('resource', 'Easysdi_coreTable');
                $this->resource->load($this->version->resource_id);

                $query = $this->db->getQuery(true)
                        ->select('name, logo')
                        ->from('#__sdi_organism')
                        ->where('id = ' . $this->resource->organism_id);
                $this->db->setQuery($query);
                $organism = $this->db->loadObject();

                $params = JComponentHelper::getParams('com_easysdi_core');
                $width = $params->get('logowidth');
                $height = $params->get('logoheight');
                $length = $params->get('descriptionlength');

                $exresource = $this->extendeddom->createElementNS('http://www.easysdi.org/2011/sdi', 'sdi:ex_Resource');
                $exresource->setAttribute('name', $this->resource->name);
                $exresource->setAttribute('descriptionLength', $length);

                $exorganism = $this->extendeddom->createElementNS('http://www.easysdi.org/2011/sdi', 'sdi:ex_Organism');
                $exorganism->setAttribute('name', $organism->name);

                $exlogo = $this->extendeddom->createElementNS('http://www.easysdi.org/2011/sdi', 'sdi:ex_Logo');
                $exlogo->setAttribute('path', $organism->logo);
                $exlogo->setAttribute('width', $width);
                $exlogo->setAttribute('height', $height);

                $query = $this->db->getQuery(true)
                        ->select('name, alias, logo')
                        ->from('#__sdi_resourcetype')
                        ->where('id = ' . $this->resource->resourcetype_id);
                $this->db->setQuery($query);
                $resourcetype = $this->db->loadObject();
                $exresourcetype = $this->extendeddom->createElementNS('http://www.easysdi.org/2011/sdi', 'sdi:ex_Resourcetype');
                $exresourcetype->setAttribute('name', $resourcetype->name);
                $exresourcetype->setAttribute('alias', $resourcetype->alias);

                $logo = $this->extendeddom->createElementNS('http://www.easysdi.org/2011/sdi', 'sdi:ex_Logo');
                $logo->setAttribute('path', $resourcetype->logo);
                $logo->setAttribute('width', $width);
                $logo->setAttribute('height', $height);

                $exversion = $this->extendeddom->createElementNS('http://www.easysdi.org/2011/sdi', 'sdi:ex_Version');
                $exversion->setAttribute('name', $this->version->name);

                $exmetadata = $this->extendeddom->createElementNS('http://www.easysdi.org/2011/sdi', 'sdi:ex_Metadata');
                $exmetadata->setAttribute('created', $this->metadata->created);
                $exmetadata->setAttribute('updated', $this->metadata->modified);

                $query = $this->db->getQuery(true)
                        ->select('id, guid ,pricing_id, hasdownload, hasextraction, accessscope_id')
                        ->from('#__sdi_diffusion')
                        ->where('version_id = ' . $this->version->id)
                        ->where('state = 1');
                $this->db->setQuery($query);
                $diffusion = $this->db->loadObject();
                if (!empty($diffusion)):
                    $isfree = ($diffusion->pricing_id == 1 ) ? 'true' : 'false';
                    $isDownladable = ($diffusion->hasdownload == 1 ) ? 'true' : 'false';
                    $isOrderable = ($diffusion->hasextraction == 1 ) ? 'true' : 'false';
                    $exdiffusion = $this->extendeddom->createElementNS('http://www.easysdi.org/2011/sdi', 'sdi:ex_Diffusion');
                    $exdiffusion->setAttribute('isfree', $isfree);
                    $exdiffusion->setAttribute('isDownladable', $isDownladable);
                    $exdiffusion->setAttribute('isOrderable', $isOrderable);
                    $exdiffusion->setAttribute('file_size', '');
                    $exdiffusion->setAttribute('size_unit', '');
                    $exdiffusion->setAttribute('file_type', '');

                    $exmetadata->appendChild($exdiffusion);
                endif;

                $exresource->appendChild($exmetadata);
                $exresource->appendChild($exversion);
                $exresourcetype->appendChild($logo);
                $exresource->appendChild($exresourcetype);
                $exorganism->appendChild($exlogo);
                $exresource->appendChild($exorganism);
                $extendedmetadata->appendChild($exresource);

                //Shop properties
                if (!empty($diffusion) && $diffusion->hasextraction == 1):
                    $html = $this->getShopExtension();
                    $extraction = $this->extendeddom->createElementNS('http://www.easysdi.org/2011/sdi', 'sdi:extraction');
                    $extractionhtml = $this->extendeddom->createElementNS('http://www.easysdi.org/2011/sdi', 'sdi:html', $html);
                    $extraction->appendChild($extractionhtml);
                    $action->appendChild($extraction);
                endif;

                //Download
                if (!empty($diffusion) && $diffusion->hasdownload == 1):
                    //check if the user has the right to download
                    $right = true;
                    if ($diffusion->accessscope_id != 1):
                        if (!sdiFactory::getSdiUser()->isEasySDI):
                            $right = false;
                        else:
                            if ($diffusion->accessscope_id == 2):
                                $organisms = sdiModel::getAccessScopeOrganism($diffusion->guid);
                                $organism = sdiFactory::getSdiUser()->getMemberOrganisms();
                                if (empty($organisms) || !in_array($organism[0]->id, $organisms)):
                                    $right = false;
                                endif;
                            endif;
                            if ($diffusion->accessscope_id == 3):
                                $users = sdiModel::getAccessScopeUser($diffusion->guid);
                                if (empty($users) || !in_array(sdiFactory::getSdiUser()->id, $users)):
                                    $right = false;
                                endif;
                            endif;
                        endif;
                    endif;

                    if ($right):
                        $download = $this->extendeddom->createElementNS('http://www.easysdi.org/2011/sdi', 'sdi:download');
                        $downloadlink = $this->extendeddom->createElementNS('http://www.easysdi.org/2011/sdi', 'sdi:link', htmlentities(JURI::root() . 'index.php?option=com_easysdi_shop&task=download.direct&id=' . $diffusion->id));
                        $download->appendChild($downloadlink);
                        $action->appendChild($download);
                    else:
                        //Download right
                        $query = $this->db->getQuery(true)
                                ->select('ju.name, ju.email')
                                ->from('#__sdi_user_role_resource urr')
                                ->innerJoin('#__sdi_user u ON u.id = urr.user_id')
                                ->innerJoin('#__users ju ON ju.id = u.user_id')
                                ->where('urr.resource_id = ' . $this->resource->id)
                                ->where('urr.role_id = 5')
                        ;
                        $this->db->setQuery($query);
                        $user = $this->db->loadObject();
                        if (!empty($user)):
                            $downloadright = $this->extendeddom->createElementNS('http://www.easysdi.org/2011/sdi', 'sdi:downloadright');
                            $downloadrighttooltip = $this->extendeddom->createElementNS('http://www.easysdi.org/2011/sdi', 'sdi:tooltip');
                            $downloadrighttooltip->setAttribute('username', $user->name);
                            $downloadrighttooltip->setAttribute('email', $user->email);
                            $downloadright->appendChild($downloadrighttooltip);
                            $action->appendChild($downloadright);
                        endif;
                    endif;
                endif;

                //View
                $query = $this->db->getQuery(true)
                        ->select('v.id, v.guid, v.maplayer_id, v.accessscope_id, ml.layername, ml.service_id, ml.servicetype, ml.attribution')
                        ->from('#__sdi_visualization v')
                        ->join('LEFT', '#__sdi_maplayer ml ON ml.id = v.maplayer_id')
                        ->where('v.version_id = ' . $this->version->id)
                        ->where('v.state = 1');
                $this->db->setQuery($query);
                $visualization = $this->db->loadObject();
                if (!empty($visualization) && !empty($visualization->maplayer_id)) :
                    //check if the user has the right to view
                    $right = true;
                    if ($visualization->accessscope_id != 1):
                        if (!sdiFactory::getSdiUser()->isEasySDI):
                            $right = false;
                        else:
                            if ($visualization->accessscope_id == 2):
                                $organisms = sdiModel::getAccessScopeOrganism($visualization->guid);
                                $organism = sdiFactory::getSdiUser()->getMemberOrganisms();
                                if (!in_array($organism[0]->id, $organisms)):
                                    $right = false;
                                endif;
                            endif;
                            if ($visualization->accessscope_id == 3):
                                $users = sdiModel::getAccessScopeUser($visualization->guid);
                                if (!in_array(sdiFactory::getSdiUser()->id, $users)):
                                    $right = false;
                                endif;
                            endif;
                        endif;
                    endif;
                    if ($right):
                        $view = $this->extendeddom->createElementNS('http://www.easysdi.org/2011/sdi', 'sdi:view');
                        $viewlink = $this->extendeddom->createElementNS('http://www.easysdi.org/2011/sdi', 'sdi:link', htmlentities(JURI::root() . 'index.php?option=com_easysdi_map&view=preview&catalog=' . $catalog . '&metadataid=' . $this->metadata->id));
                        $view->appendChild($viewlink);
                        $action->appendChild($view);

//                    sourceConfig = {id :"'.$this->item->service->alias.'",
//                                    ptype: "sdi_gxp_wmssource",
//                                    url: "'.$this->item->service->resourceurl.'"
//                                    };
//
//                    layerConfig = { group: "'.$defaultgroup.'",
//                                    name: "'.$this->item->layername.'",
//                                    attribution: "'.addslashes ($this->item->attribution).'",
//                                    opacity: 1,
//                                    source: "'.$this->item->service->alias.'",
//                                    group:"",
//                                    tiled: true,
//                                    title: "'.$this->item->layername.'",
//                                    visibility: true};
//
//                    app.addExtraLayer(sourceConfig, layerConfig)
                        if ($visualization->servicetype == 'physical')://Physical
                            $query = $this->db->getQuery(true)
                                    ->select('id, alias, resourceurl')
                                    ->from('#__sdi_physicalservice')
                                    ->where('id = ' . $visualization->service_id)
                            ;
                            $this->db->setQuery($query);
                            $service = $this->db->loadObject();
                        else://Virtual
                            $query = $this->db->getQuery(true)
                                    ->select('id, alias, url, reflectedurl')
                                    ->from('#__sdi_virtualservice')
                                    ->where('id = ' . $visualization->service_id)
                            ;
                            $this->db->setQuery($query);
                            $service = $this->db->loadObject();
                            if (!empty($service->reflectedurl)):
                                $service->resourceurl = $service->reflectedurl;
                            else:
                                $service->resourceurl = $service->url;
                            endif;
                        endif;
                        
                        //Get the current displayed map, from which the call is made
                        $mapid = JFactory::getApplication()->getUserState('com_easysdi_map.edit.map.id');
                        if(!empty($mapid)){
                            $query = $this->db->getQuery(true)
                                    ->select('g.alias')
                                    ->from('#__sdi_map m')
                                    ->innerJoin('#__sdi_map_layergroup mg ON mg.map_id = m.id AND mg.isdefault = 1')
                                    ->innerJoin('#__sdi_layergroup g ON mg.group_id = g.id')
                                    ->where('m.id = ' . $mapid);
                            $this->db->setQuery($query);
                            $group = $this->db->loadResult();
                        }

//                        $href = htmlentities(JURI::root() . 'index.php?option=com_easysdi_catalog&view=sheet&guid=' . $this->metadata->guid . '&lang=' . $lang . '&catalog=' . $catalog . '&preview=' . $preview . '&tmpl=component');
                        $href = Easysdi_mapHelper::getLayerDetailSheetToolUrl($this->metadata->guid, $lang, $catalog, $preview) ;
                        $sourceconfig = '{id :"' . $service->alias . '",hidden : "true", ptype: "sdi_gxp_wmssource",url: "' . $service->resourceurl . '"}';

                        $mapparams = JComponentHelper::getParams('com_easysdi_map');
                        $mwidth = $mapparams->get('iframewidth');
                        $mheight = $mapparams->get('iframeheight');

                        $layerconfig = '{ name: "' . $visualization->layername . '",attribution: "' . addslashes($visualization->attribution) . '",opacity: 1,source: "' . $service->alias . '",tiled: true,title: "' . $visualization->layername . '", visibility: true, href: "' . $href . '"';
                        if (!empty($diffusion) && $diffusion->hasdownload == 1):
//                            $downloadurl = htmlentities(JURI::root() . 'index.php?option=com_easysdi_shop&task=download.direct&tmpl=component&id=' . $diffusion->id);
                            $downloadurl = Easysdi_mapHelper::getLayerDownloadToolUrl($diffusion->id) ;    
                        $layerconfig .= ', download: "' . $downloadurl . '"';                        
                        endif;
                        if (!empty($diffusion) && $diffusion->hasextraction == 1):
//                            $orderurl = htmlentities(JURI::root() . 'index.php?option=com_easysdi_catalog&view=sheet&guid=' . $this->metadata->guid . '&lang=' . $lang . '&catalog=' . $catalog . '&type=shop&preview=map&tmpl=component');
                            $orderurl = Easysdi_mapHelper::getLayerOrderToolUrl($this->metadata->guid, $lang, $catalog);
                            $layerconfig .= ', order: "' . $orderurl . '"';                        
                        endif;
                        if(!empty($group)):
                            $layerconfig .= ', group: "' . $group . '"';  
                        endif;
                        $layerconfig .='}';

                        $addtomap = $this->extendeddom->createElementNS('http://www.easysdi.org/2011/sdi', 'sdi:addtomap');
                        $addtomaponclick = $this->extendeddom->createElementNS('http://www.easysdi.org/2011/sdi', 'sdi:onclick', ' window.parent.app.addExtraLayer(' . $sourceconfig . ', ' . $layerconfig . ')');
                        $addtomap->appendChild($addtomaponclick);
                        $action->appendChild($addtomap);
                    endif;
                endif;

                //Links
                $query = $this->db->getQuery(true)
                        ->select('vl.parent_id, m.guid as guid, r.name as name, v.name as version, rt.alias as type, t.text1 as title')
                        ->from('#__sdi_versionlink vl')
                        ->innerJoin('#__sdi_version v ON v.id = vl.parent_id')
                        ->innerJoin('#__sdi_metadata m ON m.version_id = v.id')
                        ->innerJoin('#__sdi_resource r ON r.id = v.resource_id')
                        ->innerJoin('#__sdi_resourcetype rt ON rt.id = r.resourcetype_id')
                        ->leftJoin('#__sdi_translation t on t.element_guid = m.guid')
                        ->leftJoin('#__sdi_language l ON l.id = t.language_id AND l.code = "' . $lang . '"')
                        ->where('vl.child_id = ' . $this->version->id)
                ;
                $this->db->setQuery($query);
                $parentsitem = $this->db->loadObjectList();
                $links = $this->extendeddom->createElementNS('http://www.easysdi.org/2011/sdi', 'sdi:links');
                $parents = $this->extendeddom->createElementNS('http://www.easysdi.org/2011/sdi', 'sdi:parents');
                foreach ($parentsitem as $item):
                    $parent = $this->extendeddom->createElementNS('http://www.easysdi.org/2011/sdi', 'sdi:parent');
                    $parent->setAttribute('guid', $item->guid);
                    $parent->setAttribute('title', $item->title);
                    $parent->setAttribute('resourcename', $item->name);
                    $parent->setAttribute('resourcetype', $item->type);
                    $parent->setAttribute('version', $item->version);
                    $sheetlink = $this->extendeddom->createElementNS('http://www.easysdi.org/2011/sdi', 'sdi:link', htmlentities(JURI::root() . 'index.php?option=com_easysdi_catalog&view=sheet&guid=' . $item->guid . '&lang=' . $lang . '&catalog=' . $catalog . '&preview=' . $preview . '&type='));
                    $parent->appendChild($sheetlink);
                    $parents->appendChild($parent);
                endforeach;

                $query = $this->db->getQuery(true)
                        ->select('vl.parent_id, m.guid as guid, r.name as name, v.name as version, rt.alias as type,  t.text1 as title')
                        ->from('#__sdi_versionlink vl')
                        ->innerJoin('#__sdi_version v ON v.id = vl.child_id')
                        ->innerJoin('#__sdi_metadata m ON m.version_id = v.id')
                        ->innerJoin('#__sdi_resource r ON r.id = v.resource_id')
                        ->innerJoin('#__sdi_resourcetype rt ON rt.id = r.resourcetype_id')
                        ->leftJoin('#__sdi_translation t on t.element_guid = m.guid')
                        ->leftJoin('#__sdi_language l ON l.id = t.language_id AND l.code = "' . $lang . '"')
                        ->where('vl.parent_id = ' . $this->version->id);
                $this->db->setQuery($query);
                $childrenitem = $this->db->loadObjectList();
                $children = $this->extendeddom->createElementNS('http://www.easysdi.org/2011/sdi', 'sdi:children');
                foreach ($childrenitem as $item):
                    $child = $this->extendeddom->createElementNS('http://www.easysdi.org/2011/sdi', 'sdi:child');
                    $child->setAttribute('guid', $item->guid);
                    $child->setAttribute('title', $item->title);
                    $child->setAttribute('resourcename', $item->name);
                    $child->setAttribute('resourcetype', $item->type);
                    $child->setAttribute('version', $item->version);
                    $sheetlink = $this->extendeddom->createElementNS('http://www.easysdi.org/2011/sdi', 'sdi:link', htmlentities(JURI::root() . 'index.php?option=com_easysdi_catalog&view=sheet&guid=' . $item->guid . '&lang=' . $lang . '&catalog=' . $catalog . '&preview=' . $preview . '&type='));
                    $child->appendChild($sheetlink);
                    $children->appendChild($child);
                endforeach;

                $links->appendChild($parents);
                $links->appendChild($children);
                $extendedmetadata->appendChild($links);

                //Applications
                $query = $this->db->getQuery(true)
                        ->select('*')
                        ->from('#__sdi_application')
                        ->where('resource_id = ' . $this->resource->id);
                $this->db->setQuery($query);
                $applicationsitem = $this->db->loadObjectList();
                $applications = $this->extendeddom->createElementNS('http://www.easysdi.org/2011/sdi', 'sdi:applications');
                foreach ($applicationsitem as $item):
                    $application = $this->extendeddom->createElementNS('http://www.easysdi.org/2011/sdi', 'sdi:application', $item->url);
                    $application->setAttribute('name', $item->name);
                    $application->setAttribute('windowname', $item->windowname);
                    $application->setAttribute('options', $item->options);
                    $applications->appendChild($application);
                endforeach;

                $extendedmetadata->appendChild($applications);
            endif;
        }

        //Sheet view
        $sheet = $this->extendeddom->createElementNS('http://www.easysdi.org/2011/sdi', 'sdi:sheetview');
        $sheetlink = $this->extendeddom->createElementNS('http://www.easysdi.org/2011/sdi', 'sdi:link', htmlentities(JURI::root() . 'index.php?option=com_easysdi_catalog&view=sheet&guid=' . $this->guid . '&lang=' . $lang . '&catalog=' . $catalog . '&preview=' . $preview . '&type='));
        $sheet->appendChild($sheetlink);
        $action->appendChild($sheet);

        //Make pdf
        $exportpdf = $this->extendeddom->createElementNS('http://www.easysdi.org/2011/sdi', 'sdi:exportpdf');
        $exportpdflink = $this->extendeddom->createElementNS('http://www.easysdi.org/2011/sdi', 'sdi:link', htmlentities(JURI::root() . 'index.php?option=com_easysdi_catalog&task=sheet.exportPDF&id=' . $this->guid . '&lang=' . $lang . '&catalog=' . $catalog . '&preview=' . $preview . '&type='));
        $exportpdf->appendChild($exportpdflink);
        $action->appendChild($exportpdf);

        //Export XML
        $exportxml = $this->extendeddom->createElementNS('http://www.easysdi.org/2011/sdi', 'sdi:exportxml');
        $exportxmllink = $this->extendeddom->createElementNS('http://www.easysdi.org/2011/sdi', 'sdi:link', htmlentities(JURI::root() . 'index.php?option=com_easysdi_catalog&task=sheet.exportXML&id=' . $this->guid));
        $exportxml->appendChild($exportxmllink);
        $action->appendChild($exportxml);

        $extendedmetadata->appendChild($action);



        $extendedroot->appendChild($extendedmetadata);
        $this->extendeddom->appendChild($extendedroot);

        $string = $this->extendeddom->saveXML();

        return $this->extendeddom;
    }

    /**
     * 
     * @param type $catalog
     * @param type $type
     * @param type $preview
     * @param DOMDocument $dom
     * @return boolean
     */
    public function applyXSL($catalog, $type, $preview, $dom = null) {
        if (empty($dom)) {
            $dom = $this->extendeddom;
        }

        $xml = $dom->saveXML();
        
        $style = new DomDocument();
        if (!$style->load(JPATH_BASE . '/media/easysdi/catalog/xsl/' . $this->rootxslfile)):
            return false;
        endif;
        $processor = new xsltProcessor();
        $processor->importStylesheet($style);
        $processor->setParameter("", 'catalog', $catalog);
        $processor->setParameter("", 'type', $type);
        $processor->setParameter("", 'preview', $preview);
        $html = $processor->transformToDoc($dom);
        $text = $html->saveXML();
        //Workaround to avoid printf problem with text with a "%", must
        //be changed to "%%".
        $text = str_replace("%", "%%", $text);

        return $text;
    }

    public function getShopExtension() {
        if (empty($this->version)):
            try {
                $this->metadata = JTable::getInstance('metadata', 'Easysdi_catalogTable');
                $keys = array("guid" => $this->guid);
                $this->metadata->load($keys);
                $this->version = JTable::getInstance('version', 'Easysdi_coreTable');
                if (!$this->version->load($this->metadata->version_id)):
                    return null;
                endif;
            } catch (Exception $exc) {
                //This metadata seems to be an harvested one
                return null;
            }
        endif;


        $this->diffusion = JTable::getInstance('diffusion', 'Easysdi_shopTable');
        $keys = array("version_id" => $this->version->id);
        if (!$this->diffusion->load($keys)):
            //No diffusion configured for this version
            return null;
        endif;

        if ($this->diffusion->hasextraction == 0)
            return null;

        //Check access scope
        if ($this->diffusion->accessscope_id != 1):
            if ($this->diffusion->accessscope_id == 2):
                $organisms = sdiModel::getAccessScopeOrganism($this->diffusion->guid);
                $organism = sdiFactory::getSdiUser()->getMemberOrganisms();
                if(empty($organism)):
                    return null;
                endif;
                if (!in_array($organism[0]->id, $organisms)):
                    return null;
                endif;
            endif;
            if ($this->diffusion->accessscope_id == 3):
                $users = sdiModel::getAccessScopeUser($this->diffusion->guid);
                if (!in_array(sdiFactory::getSdiUser()->id, $users)):
                    return null;
                endif;
            endif;
        endif;

        $language = JFactory::getLanguage();

        $query = $this->db->getQuery(true)
                ->select('DISTINCT p.id as property_id, t.text1 as propertyname, p.mandatory, p.propertytype_id, p.accessscope_id')
                ->from('#__sdi_diffusion_propertyvalue dpv')
                ->innerJoin('#__sdi_propertyvalue pv ON pv.id = dpv.propertyvalue_id')
                ->innerJoin('#__sdi_property p ON p.id = pv.property_id')
                ->innerJoin('#__sdi_translation t ON t.element_guid = p.guid')
                ->innerJoin('#__sdi_language l ON l.id = t.language_id')
                ->where('dpv.diffusion_id = ' . $this->diffusion->id)
                ->where('l.code = "' . $language->getTag() . '"')
                ->order('p.ordering');
        $this->db->setQuery($query);
        $properties = $this->db->loadObjectList();


//        $html = '<script src="' . JURI::root() . '/administrator/components/com_easysdi_core/libraries/easysdi/catalog/addToBasket.js" type="text/javascript"></script>';
        $html = '<form class="form-horizontal form-inline form-validate" action="" method="post" id="adminForm" name="adminForm" enctype="multipart/form-data">';
        $html .= '<div class="sdi-shop-order well">';
        $html .= '<div class="sdi-shop-properties" >';
        $html .= '<div class="sdi-shop-properties-title" ></div>';
        $html .= '<div class="row-fluid" >';
        foreach ($properties as $property):
            try {
                if ($property->accessscope_id == 2):
                    $organisms = sdiModel::getAccessScopeOrganism($this->guid);
                    if (!in_array(array_shift(sdiFactory::getSdiUser()->getMemberOrganisms()), $organisms)):
                        //Property not allowed for this user
                        continue;
                    endif;
                endif;
                if ($property->accessscope_id == 3):
                    $users = sdiModel::getAccessScopeUser($this->guid);
                    if (!in_array(sdiFactory::getSdiUser()->id, $users)):
                        //Property not allowed for this user
                        continue;
                    endif;
                endif;

                $required = '';
                $classrequired = '';
                $labelrequired = '';
                if ($property->mandatory == 1):
                    $required = 'required="required"';
                    $classrequired = 'required';
                    $labelrequired = '<span class="star">&nbsp;*</span>';
                endif;

                $html .= '
                    <div class="control-group">
                        <div class="control-label"><label id="' . $property->property_id . '-lbl" for="' . $property->property_id . '" class="hasTip" title="">' . $property->propertyname . $labelrequired . '</label></div>
                ';

                $query = $this->db->getQuery(true)
                        ->select(' t.text1 as propertyvaluename, pv.id as propertyvalue_id')
                        ->from('#__sdi_diffusion_propertyvalue dpv')
                        ->innerJoin('#__sdi_propertyvalue pv ON pv.id = dpv.propertyvalue_id')
                        ->innerJoin('#__sdi_property p ON p.id = pv.property_id')
                        ->innerJoin('#__sdi_translation t ON t.element_guid = pv.guid')
                        ->innerJoin('#__sdi_language l ON l.id = t.language_id')
                        ->where('dpv.diffusion_id = ' . (int) $this->diffusion->id)
                        ->where('p.id = ' . (int) $property->property_id)
                        ->where('l.code = "' . $language->getTag() . '"')
                ;
                $this->db->setQuery($query);
                $values = $this->db->loadObjectList();

                if (!empty($values[0])):
                    $text = $values[0]->propertyvaluename;
                else:
                    $text = '';
                endif;

                switch ($property->propertytype_id):
                    case self::LISTE:
                        $html .= '
                            <div class="controls">
                                <select id="' . $property->property_id . '" name="' . $property->property_id . '"  class="sdi-shop-property-list inputbox ' . $classrequired . '" ' . $required . '>';
                        foreach ($values as $value):
                            $html .= '<option value="' . $value->propertyvalue_id . '">' . $value->propertyvaluename . '</option>';
                        endforeach;
                        $html .= '</select>
                            </div>';
                        break;
                    case self::MULTIPLELIST:
                        $html .= '
                            <div class="controls">
                                <select id="' . $property->property_id . '" name="' . $property->property_id . '[]"  class="sdi-shop-property-list inputbox ' . $classrequired . '" multiple="multiple" ' . $required . '>';
                        foreach ($values as $value):
                            $html .= '<option value="' . $value->propertyvalue_id . '">' . $value->propertyvaluename . '</option>';
                        endforeach;
                        $html .= '</select>
                            </div>';
                        break;
                    case self::CHECKBOX:
                        $html .='
                            <div class="controls">
                                <fieldset id="' . $property->property_id . '" class="sdi-shop-property-checkbox ">';
                        $i = 0;
                        foreach ($values as $value):
                            $html .= '<input type="checkbox" id="' . $property->property_id . $i . '" name="' . $property->property_id . '" value="' . $value->propertyvalue_id . '" />
                                          <label for="' . $property->property_id . $i . '">' . $value->propertyvaluename . '</label>';
                            $i++;
                        endforeach;
                        $html .='
                            </fieldset>
                        </div>
                            ';
                        break;
                    case self::TEXT:
                        $html .= '
                        <div class="controls"><input type="text" name="' . $property->property_id . '" id="' . $property->property_id . '" value=""  propertyvalue_id="' . $values[0]->propertyvalue_id . '" class="sdi-shop-property-text inputbox ' . $classrequired . '" size="255" ' . $required . '></div>
                        ';
                        break;
                    case self::TEXTAREA:
                        $html .= '
                        <div class="controls"><textarea cols="100" id="' . $property->property_id . '" name="' . $property->property_id . '" propertyvalue_id="' . $values[0]->propertyvalue_id . '" rows="5" ' . $required . ' class="sdi-shop-property-text ' . $classrequired . '" ></textarea></div>
                        ';
                        break;
                    case self::MESSAGE:
                        $html .= '
                        <div class="controls"><p class="sdi-shop-property-message">' . $text . '</p></div>
                        ';
                        break;
                endswitch;

                $html .= '</div>';
            } catch (Exception $exc) {
                //User is not an EasySDI user
            }
        endforeach;
        
        $html .="</div>";
        $html .="</div>";
        $html .="</form>";
        
        //Submit to shop button
        //Load lang to translate button label
        $lang = JFactory::getLanguage();
        $lang->load('com_easysdi_shop', JPATH_ADMINISTRATOR);
        $html .= '
            <div class="sdi-shop-toolbar-add-basket pull-right">
                <button id="sdi-shop-btn-add-basket" class="btn btn-success btn-small" onclick="Joomla.submitbutton(); return false;">'.JText::_('COM_EASYSDI_SHOP_BASKET_ADD_TO_BASKET').'</button>
                <input type="hidden" name="diffusion_id" id="diffusion_id" value="' . $this->diffusion->id . '" />
            </div>
            ';
        $html .='</div>';

        return $html;
    }

    protected function CURLRequest($type, $url, $xmlBody = "") {
        // Get COOKIE as key=value
        $cookiesList = array();
        foreach ($_COOKIE as $key => $val) {
            $cookiesList[] = $key . "=" . $val;
        }
        $cookies = implode(";", $cookiesList);

        $ch = curl_init($url);
        // Configuration
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: text/xml; charset="UTF-8"', 'charset="UTF-8"'));
        curl_setopt($ch, CURLOPT_COOKIE, $cookies);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_ENCODING, "");

        // Specific POST
        if ($type == "POST") {
            curl_setopt($ch, CURLOPT_POST, 1);
            //curl_setopt($ch, CURLOPT_MUTE, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, "$xmlBody");
        }
        // Specific GET
        else if ($type == "GET") {
            curl_setopt($ch, CURLOPT_POST, 0);
        }

        //User authentication
        $params = JComponentHelper::getParams('com_easysdi_contact');
        $serviceaccount_id = $params->get('serviceaccount');
        $juser = JFactory::getUser($serviceaccount_id);

        curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
        curl_setopt($ch, CURLOPT_USERPWD, $juser->username . ":" . $juser->password);

        $output = curl_exec($ch);
        curl_close($ch);

        return $output;
    }

}

?>