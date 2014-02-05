<?php

require_once JPATH_BASE . '/components/com_easysdi_catalog/libraries/easysdi/dao/SdiNamespaceDao.php';
require_once JPATH_BASE . '/components/com_easysdi_catalog/libraries/easysdi/enum/EnumLayerName.php';
require_once JPATH_BASE . '/components/com_easysdi_catalog/libraries/easysdi/enum/EnumServiceConnector.php';

require_once JPATH_BASE . '/components/com_easysdi_catalog/libraries/easysdi/FormUtils.php';

/**
 * This Class will browse the xml structure in session and create the tree fielset.
 * 
 * @version     4.0.0
 * @package     com_easysdi_catalog
 * @copyright   Copyright (C) 2012. All rights reserved.
 * @license     GNU General Public License version 3 or later; see LICENSE.txt
 * @author      EasySDI Community <contact@easysdi.org> - http://www.easysdi.org
 */
class FormHtmlGenerator {

    /**
     *
     * @var JForm 
     */
    private $form;

    /**
     *
     * @var DOMDocument
     */
    private $structure;

    /**
     *
     * @var SdiLanguageDao
     */
    private $ldao;

    /**
     *
     * @var SdiNamespaceDao 
     */
    private $nsdao;

    /**
     *
     * @var DOMDocument 
     */
    private $formHtml;

    /**
     *
     * @var DOMXPath 
     */
    private $domXpathStr;

    /**
     *
     * @var DOMXPath 
     */
    private $domXpathFormHtml;

    /**
     *
     * @var JDatabaseDriver 
     */
    protected $db;

    /**
     *
     * @var string 
     */
    private $ajaxXpath;
    private $catalog_uri = 'http://www.easysdi.org/2011/sdi/catalog';
    private $catalog_prefix = 'catalog';

    function __construct(JForm $form, DOMDocument $structure, $ajaxXpath = null) {
        $this->form = $form;
        $this->structure = $structure;
        $this->ldao = new SdiLanguageDao();
        $this->nsdao = new SdiNamespaceDao();
        $this->formHtml = new DOMDocument(null, 'utf-8');
        $this->ajaxXpath = $ajaxXpath;
        $this->db = JFactory::getDbo();
    }

    /**
     * This function returns the form in HTML.
     * 
     * @author Depth S.A.
     * @since 4.0
     * @return string
     */
    public function buildForm() {
        $this->domXpathStr = new DOMXPath($this->structure);
        $this->domXpathFormHtml = new DOMXPath($this->formHtml);

        foreach ($this->nsdao->getAll() as $ns) {
            $this->domXpathStr->registerNamespace($ns->prefix, $ns->uri);
        }

        if (isset($this->ajaxXpath)) {
            $root = $this->domXpathStr->query($this->ajaxXpath)->item(0);
            switch ($root->getAttributeNS($this->catalog_uri, 'childtypeId')) {
                case EnumChildtype::$ATTRIBUT:
                    $this->formHtml->appendChild($this->getAttribute($root));
                    $html = $this->formHtml->saveHTML();

                    return $html;
                    break;

                default:
                    $rootFieldset = $this->getFieldset($root);
                    break;
            }
        } else {
            $root = $this->domXpathStr->query('/*')->item(0);
            $rootFieldset = $this->formHtml->createElement('fieldset');
        }

        $this->formHtml->appendChild($rootFieldset);

        $this->recBuildForm($root, $rootFieldset);

        $this->formHtml->formatOutput = true;
        $html = $this->formHtml->saveHTML();

        return $html;
    }

    /**
     * This function recursively browse the XML structure to create the HTML form.
     * 
     * @author Depth S.A.
     * @since 4.0
     * 
     * @param DOMElement $parent Parent element in the XML structure.
     * @param DOMElement $parentHtml Parent element in the HTML structure.
     */
    private function recBuildForm(DOMElement $parent, DOMElement $parentHtml) {
        switch ($parent->parentNode->nodeType) {
            case XML_DOCUMENT_NODE:
                $query = '*[@catalog:childtypeId="0"]|*[@catalog:childtypeId="2"]|*[@catalog:childtypeId="3"]';
                $parentInner = $parentHtml;
                break;
            case XML_ELEMENT_NODE:
                $query = '*/*[@catalog:childtypeId="0"]|*/*[@catalog:childtypeId="2"]|*/*[@catalog:childtypeId="3"]|*[@catalog:childtypeId="2"]';
                if ($parent->getAttributeNS($this->catalog_uri, 'exist') == 1) {
                    $parentInner = $parentHtml->getElementsByTagName('div')->item(0);
                } else {
                    $parentInner = $parentHtml;
                }

                break;
        }

        if (isset($_GET['relid'])) {
            switch ($parent->getAttributeNS($this->catalog_uri, 'childtypeId')) {
                case EnumChildtype::$RELATIONTYPE:
                    $searchField = $this->getAttribute($parent);

                    $parentHtml->getElementsByTagName('div')->item(0)->appendChild($searchField);
                    break;
            }
        }

        foreach ($this->domXpathStr->query($query, $parent) as $child) {

            switch ($child->getAttributeNS($this->catalog_uri, 'childtypeId')) {
                case EnumChildtype::$RELATION:
                    if (($child->getAttributeNS($this->catalog_uri, 'lowerbound') - $child->getAttributeNS($this->catalog_uri, 'upperbound')) != 0 && $child->getAttributeNS($this->catalog_uri, 'index') == 1) {
                        $action = $this->getAction($child);
                        $parentInner->appendChild($action);
                    }
                    $fieldset = $this->getFieldset($child);

                    $parentInner->appendChild($fieldset);

                    if ($this->domXpathStr->query('*/*[@catalog:childtypeId="0"]|*/*[@catalog:childtypeId="2"]|*[@catalog:childtypeId="2"]', $child)->length > 0) {
                        $this->recBuildForm($child, $fieldset);
                    }
                    break;
                case EnumChildtype::$ATTRIBUT:
                    $parentname = $parent->nodeName;
                    $childName = $child->nodeName;
                    if ($child->getAttributeNS($this->catalog_uri, 'stereotypeId') == EnumStereotype::$GEMET) {
                        if ($child->getAttributeNS($this->catalog_uri, 'index') == 1) {
                            $field = $this->getAttribute($child);
                            $parentInner->appendChild($field);
                        }
                    } else {
                        $field = $this->getAttribute($child);
                        $parentInner->appendChild($field);
                    }

                    break;
                case EnumChildtype::$RELATIONTYPE:
                    if ($child->getAttributeNS($this->catalog_uri, 'index') == 1) {
                        $action = $this->getAction($child);
                        $parentInner->appendChild($action);
                    }
                    $searchField = $this->getAttribute($child);
                    $fieldset = $this->getFieldset($child);

                    $fieldset->getElementsByTagName('div')->item(0)->appendChild($searchField);


                    $parentInner->appendChild($fieldset);

                    if ($this->domXpathStr->query('*[@catalog:childtypeId="2"]', $child)->length > 0) {
                        $this->recBuildForm($child, $fieldset);
                    }
                    break;
            }
        }
    }

    /**
     * Built on the action bar to add new relation instance.
     * 
     * @author Depth S.A.
     * @since 4.0
     * 
     * @param DOMElement $relation Current relation.
     * @return DOMElement The DIV block that contains the label and the button "add" if necessary.
     */
    private function getAction(DOMElement $relation) {

        $lowerbound = $relation->getAttributeNS($this->catalog_uri, 'lowerbound');
        $upperbound = $relation->getAttributeNS($this->catalog_uri, 'upperbound');
        $exist = $relation->getAttributeNS($this->catalog_uri, 'exist');
        $level = $relation->getAttributeNS($this->catalog_uri, 'level');

        switch ($relation->getAttributeNS($this->catalog_uri, 'childtypeId')) {
            case EnumChildtype::$RELATIONTYPE:
                $relid = $relation->getAttributeNS($this->catalog_uri, 'relationId');
                break;

            default:
                $relid = $relation->getAttributeNS($this->catalog_uri, 'dbid');
                break;
        }

        $occurance = $this->domXpathStr->query($this->removeIndex($relation->getNodePath()))->length;

        //$debug = '[oc:' . $occurance . ' lb:' . $lowerbound . ' ub:' . $upperbound . '][' . $relation->nodeName . ']';
        $debug = '';

        $aAdd = $this->formHtml->createElement('a');
        $aAdd->setAttribute('id', 'add-btn-' . FormUtils::serializeXpath($relation->getNodePath()));
        $aAdd->setAttribute('class', 'btn btn-success btn-mini add-btn add-btn-' . FormUtils::serializeXpath($this->removeIndex($relation->getNodePath())));
        $aAdd->setAttribute('onclick', 'addFieldset(this.id, \'' . FormUtils::serializeXpath($this->removeIndex($relation->getNodePath())) . '\',' . $relid . ', \'' . FormUtils::serializeXpath($relation->parentNode->getNodePath()) . '\' ,' . $lowerbound . ',' . $upperbound . ')');

        if ($exist == 1) {
            if ($upperbound <= $occurance) {
                $aAdd->setAttribute('style', 'display:none;');
            }
        }

        $iAdd = $this->formHtml->createElement('i');
        $iAdd->setAttribute('class', 'icon-white icon-plus-2');

        $divOuter = $this->formHtml->createElement('div');
        $divOuter->setAttribute('id', 'outer-fds-' . FormUtils::serializeXpath($relation->getNodePath()));
        $divOuter->setAttribute('class', 'outer-' . $level . ' outer-fds-' . FormUtils::serializeXpath($relation->getNodePath()));

        $divAction = $this->formHtml->createElement('div', EText::_($relation->getAttributeNS($this->catalog_uri, 'id')) . ' ' . $debug);
        $divAction->setAttribute('class', 'action-' . $level);

        $aAdd->appendChild($iAdd);
        $divAction->appendChild($aAdd);

        return $divAction;
    }

    /**
     * Built fieldset corresponding to a relation instance. 
     * This method also creates the "Close" button and, if necessary, the "Delete" button.
     * 
     * @author Depth S.A.
     * @since 4.0
     * 
     * @param DOMElement $element
     * @return DOMElement A fieldset containing the necessary buttons.
     */
    private function getFieldset(DOMElement $element) {
        $lowerbound = $element->getAttributeNS($this->catalog_uri, 'lowerbound');
        $upperbound = $element->getAttributeNS($this->catalog_uri, 'upperbound');
        $occurance = $this->domXpathStr->query($this->removeIndex($element->getNodePath()))->length;
        $index = $element->getAttributeNS($this->catalog_uri, 'index');
        $exist = $element->getAttributeNS($this->catalog_uri, 'exist');
        $guid = $element->getAttributeNS($this->catalog_uri, 'id');
        $legendAttribute = $element->getAttributeNS($this->catalog_uri, 'legend');
        $level = $element->getAttributeNS($this->catalog_uri, 'level');
//        $stereotypeId = $element->firstChild->getAttributeNS($this->catalog_uri, 'stereotypeId');

        $aCollapse = $this->formHtml->createElement('a');
        $aCollapse->setAttribute('id', 'collapse-btn-' . FormUtils::serializeXpath($element->getNodePath()));
        $aCollapse->setAttribute('class', 'btn btn-mini collapse-btn');
        $aCollapse->setAttribute('onclick', 'collapse(this.id)');

        $iCollapse = $this->formHtml->createElement('i');
        $iCollapse->setAttribute('class', 'icon-white icon-arrow-down');

        $aRemove = $this->formHtml->createElement('a');
        $aRemove->setAttribute('id', 'remove-btn-' . FormUtils::serializeXpath($element->getNodePath()));
        $aRemove->setAttribute('class', 'btn btn-danger btn-mini pull-right remove-btn-' . FormUtils::serializeXpath($this->removeIndex($element->getNodePath())));
        $aRemove->setAttribute('onclick', 'confirmFieldset(this.id, \'' . FormUtils::serializeXpath($this->removeIndex($element->getNodePath())) . '\' , ' . $lowerbound . ',' . $upperbound . ')');

        $iRemove = $this->formHtml->createElement('i');
        $iRemove->setAttribute('class', 'icon-white icon-cancel-2');

        $divOuter = $this->formHtml->createElement('div');
        $divOuter->setAttribute('id', 'outer-fds-' . FormUtils::serializeXpath($element->getNodePath()));
        $divOuter->setAttribute('class', ' outer-' . $level . ' outer-fds-' . FormUtils::serializeXpath($this->removeIndex($element->getNodePath())));

        $fieldset = $this->formHtml->createElement('fieldset');
        $fieldset->setAttribute('id', 'fds-' . FormUtils::serializeXpath($element->getNodePath()));

        if ($guid != '') {
            $spanLegend = $this->formHtml->createElement('span', EText::_($guid));
        } else {
            $spanLegend = $this->formHtml->createElement('span', JText::_($legendAttribute));
        }

        $spanLegend->setAttribute('class', 'legend-' . $level);
        $legend = $this->formHtml->createElement('legend');

        $divInner = $this->formHtml->createElement('div');
        $divInner->setAttribute('id', 'inner-fds-' . FormUtils::serializeXpath($element->getNodePath()));
        $divInner->setAttribute('class', 'inner-fds');
        if (!isset($_GET['relid'])) {
            $divInner->setAttribute('style', 'display:none;');
        }

        $divBottom = $this->formHtml->createElement('div');
        $divBottom->setAttribute('id', 'bottom-' . FormUtils::serializeXpath($this->removeIndex($element->getNodePath())));

        if ($exist == 1) {
            $aCollapse->appendChild($iCollapse);
            $legend->appendChild($aCollapse);
            $legend->appendChild($spanLegend);
            if ($lowerbound < $occurance) {
                $aRemove->appendChild($iRemove);
                $legend->appendChild($aRemove);
            }
            $fieldset->appendChild($legend);
            $fieldset->appendChild($divInner);

            $divOuter->appendChild($fieldset);
        }

        if ($index == $occurance) {
            $divOuter->appendChild($divBottom);
        }

        return $divOuter;
    }

    /**
     * Encode special characters into HTML entities. Unless the <> characters.
     * 
     * @author Depth S.A.
     * @since 4.0
     * 
     * @param string $text
     * @return string
     */
    private function convert($text) {
        $text = htmlentities($text, ENT_NOQUOTES, "UTF-8");
        $text = htmlspecialchars_decode($text);
        return $text;
    }

    /**
     * This method constructs a set of attributes. 
     * It will contain either a single field or a field for each language or a group of fields corresponding to a stereotype.
     * 
     * @author Depth S.A.
     * @since 4.0
     * 
     * @param DOMElement $attribute The current attribute.
     * @return DOMElement DIV containing a group of fields.
     */
    private function getAttribute(DOMElement $attribute) {

        $upperbound = $attribute->getAttributeNS($this->catalog_uri, 'upperbound');
        $stereotypeId = $attribute->getAttributeNS($this->catalog_uri, 'stereotypeId');
        $rendertypeId = $attribute->getAttributeNS($this->catalog_uri, 'rendertypeId');

        $languages = $this->ldao->getSupported();
        if ($upperbound > 1) {
            $showButton = true;
        } else {
            $showButton = false;
        }

        $attributeGroup = $this->formHtml->createElement('div');
        $attributeGroup->setAttribute('class', 'attribute-group attribute-group-' . $this->removeIndex(FormUtils::serializeXpath($attribute->getNodePath())));
        $attributeGroup->setAttribute('id', 'attribute-group-' . FormUtils::serializeXpath($attribute->getNodePath()));

        switch ($stereotypeId) {
            case EnumStereotype::$GEMET:
            case EnumStereotype::$LOCALE:
                if ($stereotypeId == EnumStereotype::$GEMET) {
                    $attributeGroup->appendChild($this->getGemet($attribute));
                    $showButton = false;
                }

                $nodePath = $attribute->firstChild->getNodePath();
                $jfield = $this->form->getField(FormUtils::serializeXpath($nodePath));
                foreach ($this->buildField($attribute, $jfield, $showButton) as $element) {
                    $attributeGroup->appendChild($element);
                }

                foreach ($languages as $key => $value) {
                    $jfield = $this->form->getField(FormUtils::serializeXpath($attribute->getNodePath() . '/gmd:PT_FreeText/gmd:textGroup/gmd:LocalisedCharacterString#' . $key));
                    if ($jfield) {
                        foreach ($this->buildField($attribute, $jfield) as $element) {
                            $attributeGroup->appendChild($element);
                        }
                    }
                }

                if ($stereotypeId == EnumStereotype::$GEMET) {

                    foreach ($this->domXpathFormHtml->query('descendant::div[@class="control-group"][position()>1]', $attributeGroup) as $control_group) {
                        $control_group->setAttribute('style', 'height:0px; opacity:0;');
                    }

                    foreach ($this->domXpathFormHtml->query('descendant::select', $attributeGroup) as $select) {
                        $i = 0;
                        foreach ($this->domXpathFormHtml->query('descendant::option', $select) as $option) {
                            $option->setAttribute('selected', 'selected');
                            $option->setAttribute('id', $select->getAttribute('id') . '_option_' . $i);
                            $i++;
                            $option->setAttribute('index', $i);
                        }
                    }
                }
                break;

            default:
                if ($attribute->getAttributeNS($this->catalog_uri, 'childtypeId') == EnumChildtype::$RELATIONTYPE) {
                    $nodePath = $attribute->getNodePath();
                    $showButton = false;
                } else {
                    $nodePath = $attribute->firstChild->getNodePath();
                }

                $nbrOccurance = 0;

                switch ($rendertypeId) {
                    case EnumRendertype::$CHECKBOX:
                        /** @var JFormField */
                        $jfield = $this->form->getField(FormUtils::removeIndexToXpath(FormUtils::serializeXpath($nodePath)));
                        $fieldid = $jfield->__get('id');
                        $query = 'descendant::*[@id="' . $fieldid . '"]';
                        $nbrOccurance = $this->domXpathFormHtml->query($query)->length;
                        break;
                    case EnumRendertype::$LIST:
                        // Mutiple list
                        if ($upperbound > 1) {
                            $jfield = $this->form->getField(FormUtils::removeIndexToXpath(FormUtils::serializeXpath($nodePath)));
                            $fieldid = $jfield->__get('id');
                            $query = 'descendant::*[@id="' . $fieldid . '"]';
                            $nbrOccurance = $this->domXpathFormHtml->query($query)->length;
                            $showButton = false;
                            // Single list
                        } else {
                            $jfield = $this->form->getField(FormUtils::serializeXpath($nodePath));
                        }
                        break;
                    default:
                        $jfield = $this->form->getField(FormUtils::serializeXpath($nodePath));
                        break;
                }

                if ($jfield) {
                    if ($nbrOccurance < 1) {
                        foreach ($this->buildField($attribute, $jfield, $showButton) as $element) {
                            $attributeGroup->appendChild($element);
                        }
                    }
                } else {
                    JFactory::getApplication()->enqueueMessage('Field not found ' . FormUtils::serializeXpath($nodePath), 'warning');
                }
                break;
        }

        if ($attribute->getAttributeNS($this->catalog_uri, 'map')) {
            $map_id = JComponentHelper::getParams('com_easysdi_catalog')->get('catalogmap');

            if (isset($map_id)) {
                $attributeGroup->appendChild($this->getMap($attribute, $map_id));
            }
        }

        return $attributeGroup;
    }

    /**
     * Returns a DIV containing the fields of the stereotype "geographic extent."
     * 
     * @author Depth S.A.
     * @since 4.0
     * 
     * @param DOMElement $attribute The current attribute.
     * @return DOMElement The DIV.
     */
    private function getMap(DOMElement $attribute, $map_id) {
        $parent_path = str_replace('-', '_', FormUtils::serializeXpath($attribute->parentNode->getNodePath()));
        $select_parent_path = str_replace('-', '_', FormUtils::serializeXpath($attribute->parentNode->parentNode->parentNode->getNodePath()));

        $div = $this->formHtml->createElement('div');

        $btnEdit = $this->formHtml->createElement('button', 'Edition');
        $btnEdit->setAttribute('type', 'button');
        $btnEdit->setAttribute('class', 'btn btn-primary btn-small edit_bb');
        $btnEdit->setAttribute('id', 'editBtn_' . $parent_path);
        $btnEdit->setAttribute('data-toggle', 'button');
        $btnEdit->setAttribute('onclick', 'polygonControl_' . $parent_path . '.activate(); clearbbselect(\'' . $select_parent_path . '\')');

        $br = $this->formHtml->createElement('br');

        $divMap = $this->formHtml->createElement('div');
        $divMap->setAttribute('id', 'map_' . $parent_path);
        $divMap->setAttribute('style', 'width: 550px;height: 300px;');

        $script = $this->formHtml->createElement('script');
        $script->setAttribute('type', 'text/javascript');

        $query = $this->db->getQuery(true);

        $query->select('m.srs, m.unit_id, m.maxresolution, m.restrictedextent, m.zoom, m.maxextent, m.centercoordinates, l.layername, l.service_id, l.servicetype, l.asOLstyle, l.asOLoptions, l.asOLmatrixset, u.`alias` as unit_alias');
        $query->from('#__sdi_map as m');
        $query->innerJoin('#__sdi_map_layergroup mlg ON m.id = mlg.map_id');
        $query->innerJoin('#__sdi_layer_layergroup llg ON llg.group_id = mlg.group_id');
        $query->innerJoin('#__sdi_maplayer l ON l.id = llg.layer_id');
        $query->innerJoin('#__sdi_sys_unit u ON u.id = m.unit_id');
        $query->where('m.id=' . $map_id);
        $query->where('mlg.isbackground = 1');

        $this->db->setQuery($query);
        $map_config = $this->db->loadObject();

        $query = $this->db->getQuery(true);
        switch ($map_config->servicetype) {
            case 'physical':
                $query->select('resourceurl as serviceurl, serviceconnector_id');
                $query->from('#__sdi_physicalservice');
                $query->where('id = ' . $map_config->service_id);
                break;
            case 'virtual':
                $query->select('url, reflectedurl as serviceurl, serviceconnector_id');
                $query->from('#__sdi_virtualservice');
                $query->where('id = ' . $map_config->service_id);
                break;
        }

        $this->db->setQuery($query);
        $service = $this->db->loadObject();

        if (empty($service->serviceurl)) {
            $service->serviceurl = $service->url;
        }

        switch ($service->serviceconnector_id) {
            case EnumServiceConnector::$GOOGLE:
                switch ($map_config->layername) {
                    case EnumLayerName::$ROADMAP:
                        $layer_definition = "layer_$parent_path = new OpenLayers.Layer.Google(
                                                'Google Streets',
                                                {numZoomLevels: 20}
                                            );";
                        break;
                    case EnumLayerName::$TERRAIN:
                        $layer_definition = "layer_$parent_path = new OpenLayers.Layer.Google(
                                                'Google Physicial',
                                                {type: G_PHYSICAL_MAP}
                                            );";
                        break;
                    case EnumLayerName::$SATELLITE:
                        $layer_definition = "layer_$parent_path = new OpenLayers.Layer.Google(
                                                'Google Satellite',
                                                {type: G_SATELLITE_MAP, numZoomLevels: 22}
                                            );";
                        break;
                    case EnumLayerName::$HYBRIDE:
                        $layer_definition = "layer_$parent_path = new OpenLayers.Layer.Google(
                                                'Google Hybrid',
                                                {type: G_HYBRID_MAP, numZoomLevels: 20}
                                            );";
                        break;
                }
                break;
            case EnumServiceConnector::$OSM:
                $layer_definition = "layer_$parent_path = new OpenLayers.Layer.OSM();";
                break;
            case EnumServiceConnector::$BING:
                $layer_definition = "layer_$parent_path = new OpenLayers.Layer.Bing({
                                        name: 'Bing',
                                        key: apiKey,
                                        type: " . $map_config->layername . "
                                    });";
                break;
            case EnumServiceConnector::$WMS:
                $layer_definition = "layer_$parent_path = new OpenLayers.Layer.WMS( 'WMS name',
                                    " . $service->serviceurl . ",
                                    {layers: " . $map_config->layername . "});";
                break;
            case EnumServiceConnector::$WMTS:
                $layer_definition = "layer_$parent_path = new OpenLayers.Layer.WMTS({
                                        name: 'Couche WMTS',
                                        url: " . $service->serviceurl . ",
                                        layer: " . $map_config->layername . ",
                                        matrixSet: " . $map_config->asOLmatrixset . ",
                                        style: " . $map_config->asOLstyle . ",
                                        " . $map_config->asOLoptions . "
                                    });";
                break;
        }

        $centercoords = explode(',', $map_config->centercoordinates);
        $script->nodeValue = "var map_$parent_path, layer_$parent_path, polygonLayer_$parent_path, polygonControl_$parent_path ;
                            js('document').ready(function() {
                                

                                var map_options = {projection: \"" . $map_config->srs . "\" 
                                    , maxResolution: " . $map_config->maxresolution . " 
                                    , units: \"" . $map_config->unit_alias . "\"
                                    , maxExtent: [" . $map_config->maxextent . "]";
        if (!empty($map_config->restrictedextent)) {
            $script->nodeValue .= ", restrictedExtent: [" . $map_config->restrictedextent . "]";
        }

        $script->nodeValue .= "};";


        $script->nodeValue.= " map_$parent_path = new OpenLayers.Map(\"map_$parent_path\", map_options);
                                 
                                " . $layer_definition . "
                                polygonLayer_$parent_path = new OpenLayers.Layer.Vector('Polygon Layer');

                                map_$parent_path.addLayers([layer_$parent_path, polygonLayer_$parent_path]);
                      
                                    var psource = new proj4.Proj(\"" . $map_config->srs . "\");
                                    var pdest   = new proj4.Proj(\"EPSG:4326\");
                                   
                    ";


        if (!empty($map_config->centercoordinates) && !empty($map_config->zoom)) {
            $script->nodeValue .= "
                                    var centercoord = new proj4.Point(" . $centercoords[0] . ", " . $centercoords[1] . ");
                                    map_$parent_path.setCenter(new OpenLayers.LonLat(centercoord.x, centercoord.y), $map_config->zoom);";
        } else if (!empty($map_config->centercoordinates)) {
            $script->nodeValue .= "
                                    var centercoord = new proj4.Point(" . $centercoords[0] . ", " . $centercoords[1] . ");
                                    map_$parent_path.setCenter(new OpenLayers.LonLat(centercoord.x, centercoord.y));";
        } else {
            $script->nodeValue .= "map_$parent_path.zoomToMaxExtent(); ";
        }


        $script->nodeValue .= "
                                var polyOptions = {sides: 4, irregular: true};
                                polygonControl_$parent_path = new OpenLayers.Control.DrawFeature(polygonLayer_$parent_path,
                                        OpenLayers.Handler.RegularPolygon,
                                        {handlerOptions: polyOptions});

                                map_$parent_path.addControl(polygonControl_$parent_path);
                                    
                               drawBB('$parent_path');
                                    
                               polygonLayer_$parent_path.events.register('featureadded', polygonLayer_$parent_path, function(e) {
                                    polygonControl_$parent_path.deactivate();
                                    js('#editBtn_$parent_path').removeClass('active');

                                    var bounds = e.feature.geometry.getBounds();
                                    
                                    var source = new proj4.Proj(map_" . $parent_path . ".getProjection());
                                    var dest   = new proj4.Proj(\"EPSG:4326\");
                                    
                                    var bottom_left = new proj4.Point(bounds.left, bounds.bottom);
                                    var top_right = new proj4.Point(bounds.right, bounds.top);

                                    proj4.transform(source, dest, bottom_left);
                                    proj4.transform(source, dest, top_right);

                                    js('#jform_" . $parent_path . "_sla_gmd_dp_northBoundLatitude_sla_gco_dp_Decimal').attr('value', top_right.y);
                                    js('#jform_" . $parent_path . "_sla_gmd_dp_southBoundLatitude_sla_gco_dp_Decimal').attr('value', bottom_left.y);
                                    js('#jform_" . $parent_path . "_sla_gmd_dp_eastBoundLongitude_sla_gco_dp_Decimal').attr('value', top_right.x);
                                    js('#jform_" . $parent_path . "_sla_gmd_dp_westBoundLongitude_sla_gco_dp_Decimal').attr('value', bottom_left.x);

                                    map_$parent_path.zoomToExtent(polygonLayer_$parent_path.getDataExtent());
                                });

                                polygonLayer_$parent_path.events.register('beforefeatureadded', polygonLayer_$parent_path, function(e) {
                                    polygonLayer_$parent_path.removeAllFeatures();

                                });
                               
                            });";

        $div->appendChild($btnEdit);
        $div->appendChild($br);
        $div->appendChild($divMap);
        $div->appendChild($script);

        return $div;
    }

    /**
     * This method returns a DIV containing the fields of the stereotype "GEMET".
     * 
     * @author Depth S.A.
     * @since 4.0
     * 
     * @param DOMElement $attribute
     * @return DOMElement
     */
    private function getGemet(DOMElement $attribute) {
        $languages = array();
        foreach ($this->ldao->getAll() as $language) {
            $languages[] = '\'' . $language->gemet . '\'';
        }

        $default = $this->ldao->getDefaultLanguage();

        $parent_path = str_replace('-', '_', FormUtils::serializeXpath($attribute->parentNode->getNodePath()));
        $div = $this->formHtml->createElement('div');

        $script = $this->formHtml->createElement('script');
        $script->setAttribute('type', 'text/javascript');

        $script_code = "js = jQuery.noConflict();

                                js('document').ready(function() {
                                
                                var languages = new Array(" . implode(',', $languages) . ");
                                var index = '';
                                if(js('#jform_" . $parent_path . "_sla_gmd_dp_keyword_sla_gco_dp_CharacterString').length == 0){
                                     index = '_la_1_ra_';
                                }

                                // path to Ext images
                                Ext.BLANK_IMAGE_URL = 'http://gis.bnhelp.cz/wwwlibs/ext/ext3/resources/images/default/s.gif';

                                // sets the user interface language
                                HS.setLang('" . $default->gemet . "');

                                Ext.onReady(function() {

                                    var thes = new ThesaurusReader({

                                        lang: '" . $default->gemet . "',
                                        outputLangs: [" . implode(',', $languages) . "],
                                        title: 'GEMET Thesaurus',
                                        separator: ' > ',
                                        returnPath: true,
                                        returnInspire: true,
                                        width: 520, height: 300,
                                        layout: 'fit',
                                        proxy: '" . JUri::base() . "administrator/components/com_easysdi_core/libraries/gemetclient-2.0.0/src/proxy.php?url=',
                                        handler: writeTerms
                                    });

                                    thes.render('gemet');
                                });
                                  
                                    
                                    js('#jform_" . $parent_path . "_sla_gmd_dp_keyword'+index+'_sla_gco_dp_CharacterString').on('change',function(evt, params){
                                        
                                                var id_default = js('#jform_" . $parent_path . "_sla_gmd_dp_keyword'+index+'_sla_gco_dp_CharacterString option[value=\''+params.deselected+'\']').attr('id');
                                                var index_number = js('#jform_" . $parent_path . "_sla_gmd_dp_keyword'+index+'_sla_gco_dp_CharacterString option[value=\''+params.deselected+'\']').attr('index');

                                                for(var i=1; i < languages.length; i++){
                                                    var id_i18n = id_default.replace('_sla_gco_dp_CharacterString','_sla_gmd_dp_PT_FreeText_sla_gmd_dp_textGroup_sla_gmd_dp_LocalisedCharacterString_'+languages[i].toUpperCase());
                                                    js('option[id=\''+id_i18n+'\']').remove();
                                                    js('#jform_" . $parent_path . "_sla_gmd_dp_keyword'+index+'_sla_gmd_dp_PT_FreeText_sla_gmd_dp_textGroup_sla_gmd_dp_LocalisedCharacterString_'+languages[i].toUpperCase()).trigger('liszt:updated');
                                                }
                                                
                                                removeFromStructure('" . FormUtils::serializeXpath($attribute->parentNode->getNodePath()) . "-sla-gmd-dp-keyword-la-'+index_number+'-ra-');
                                                
                                    });

                                
                                
                                var writeTerms = function(result) {
                                    
                                    for(var i=0; i < languages.length; i++){
                                        var paths = result.terms[languages[i]].split('>');
                                        var keyword = paths[paths.length - 1];
                                        var option_string = '<option class=\''+result.uri+'\' value=\''+keyword+'\' selected>'+keyword+'</option>';
                                        
                                        if(i==0){
                                            var current_select = js('#jform_" . $parent_path . "_sla_gmd_dp_keyword'+index+'_sla_gco_dp_CharacterString');
                                            var current_div = js('#jform_" . $parent_path . "_sla_gmd_dp_keyword'+index+'_sla_gco_dp_CharacterString_chzn ul li[class=\'search-field\'] input');
                                        
                                        }else{
                                            var current_select = js('#jform_" . $parent_path . "_sla_gmd_dp_keyword'+index+'_sla_gmd_dp_PT_FreeText_sla_gmd_dp_textGroup_sla_gmd_dp_LocalisedCharacterString_'+languages[i].toUpperCase());
                                            var current_div = js('#jform_" . $parent_path . "_sla_gmd_dp_keyword'+index+'_sla_gmd_dp_PT_FreeText_sla_gmd_dp_textGroup_sla_gmd_dp_LocalisedCharacterString_'+languages[i].toUpperCase()+'_chzn ul li[class=\'search-field\'] input');
                                        }
                                        current_select.append(option_string);
                                        current_select.trigger('liszt:updated');
                                        current_div.attr('style','width: 0px');
                                        
                                        addToStructure('" . $attribute->getAttributeNS($this->catalog_uri, 'relid') . "','" . FormUtils::serializeXpath($attribute->parentNode->getNodePath()) . "');
                                    }
                                }
                                
                            });";

        $script->nodeValue = $script_code;

        $aModal = $this->formHtml->createElement('a', 'Thesaurus Gemet');
        $aModal->setAttribute('data-toggle', 'modal');
        $aModal->setAttribute('href', '#myModal');
        $aModal->setAttribute('class', 'btn btn-primary btn-lg');

        $divModal = $this->formHtml->createElement('div');
        $divModal->setAttribute('class', 'modal fade');
        $divModal->setAttribute('id', 'myModal');
        $divModal->setAttribute('tabindex', '-1');
        $divModal->setAttribute('role', 'dialog');
        $divModal->setAttribute('aria-labelledby', 'myModalLabel');
        $divModal->setAttribute('aria-hidden', 'true');

        $divDialog = $this->formHtml->createElement('div');
        $divDialog->setAttribute('class', 'modal-dialog');

        $divContent = $this->formHtml->createElement('div');
        $divContent->setAttribute('class', 'modal-content');

        $divHeader = $this->formHtml->createElement('div');
        $divHeader->setAttribute('class', 'modal-header');

        $btnClose = $this->formHtml->createElement('button', '&times;');
        $btnClose->setAttribute('type', 'button');
        $btnClose->setAttribute('class', 'close');
        $btnClose->setAttribute('data-dismiss', 'modal');
        $btnClose->setAttribute('aria-hidden', 'true');

        $h4 = $this->formHtml->createElement('h4', 'Thesaurus Gemet');
        $h4->setAttribute('class', 'modal-title');

        $divBody = $this->formHtml->createElement('div');
        $divBody->setAttribute('class', 'modal-body');

        $divGemet = $this->formHtml->createElement('div');
        $divGemet->setAttribute('id', 'gemet');
        $divGemet->setAttribute('class', 'gemet');

        $divHeader->appendChild($btnClose);
        $divHeader->appendChild($h4);

        $divBody->appendChild($divGemet);

        $divContent->appendChild($divHeader);
        $divContent->appendChild($divBody);

        $divDialog->appendChild($divContent);

        $divModal->appendChild($divDialog);

        $div->appendChild($aModal);
        $div->appendChild($divModal);
        $div->appendChild($script);

        return $div;
    }

    /**
     * This method builds up the field retrieve structure Joomla field.
     * 
     * @author Depth S.A.
     * @since 4.0
     * 
     * @param DOMElement $attribute The current attribute.
     * @param JField $field The Joomla JField
     * @param boolean $addButton Defines whether the "Add" button must be created.
     * @return DOMElement[] 
     */
    private function buildField(DOMElement $attribute, $field, $addButton = FALSE) {
        $guid = $attribute->getAttributeNS($this->catalog_uri, 'id');
        $upperbound = $attribute->getAttributeNS($this->catalog_uri, 'upperbound');
        $stereotypeId = $attribute->getAttributeNS($this->catalog_uri, 'stereotypeId');
        $rendertypeId = $attribute->getAttributeNS($this->catalog_uri, 'rendertypeId');

        $elements = array();

        $controlGroup = $this->formHtml->createElement('div');
        $controlGroup->setAttribute('class', 'control-group');

        $controlLabel = $this->formHtml->createElement('div');
        $controlLabel->setAttribute('class', 'control-label');

        $control = $this->formHtml->createElement('div');
        $control->setAttribute('class', 'controls');

        if ($field->label != '') {
            $controlLabel->appendChild($this->getLabel($field));
        }

        $control->appendChild($this->getInput($field));
        if ($addButton) {
            $control->appendChild($this->getAttributeAction($attribute));
        }

        $controlGroup->appendChild($controlLabel);
        $controlGroup->appendChild($control);

        if ($stereotypeId == EnumStereotype::$FILE) {
            $jfieldhidden = $this->form->getField(FormUtils::serializeXpath($attribute->firstChild->getNodePath()) . '_filehidden');
            $jfieldtext = $this->form->getField(FormUtils::serializeXpath($attribute->firstChild->getNodePath()) . '_filetext');

            $br = $this->formHtml->createElement('br');
            $control->appendChild($br);
            $control->appendChild($this->getInput($jfieldtext));
            $control->appendChild($this->getInput($jfieldhidden));
            $control->appendChild($this->getPreviewAction($attribute));
            $control->appendChild($this->getEmptyFileAction($attribute));
        }

        $elements[] = $controlGroup;

        $elements[] = $this->getInputScript($field, $guid);

        if ($rendertypeId == EnumRendertype::$LIST && $upperbound > 1) {
            $elements[] = $this->getMultiSelectScript($field, $attribute);
        }

        return $elements;
    }

    /**
     * Import the HTML structure of the label in a DOMElement.
     * 
     * @author Depth S.A.
     * @since 4.0
     * 
     * @param JField $field The Joomla JField
     * @return DOMElement
     */
    private function getLabel($field) {
        $labelString = $field->label;
        $domlocal = new DOMDocument();
        $domlocal->loadHTML($this->convert($labelString));

        $domXapth = new DOMXPath($domlocal);
        $label = $domXapth->query('/*/*/*')->item(0);

        $cloned = $label->cloneNode(TRUE);

        $imported = $this->formHtml->importNode($cloned, TRUE);

        return $imported;
    }

    /**
     * Import HTML structure of input field in a DOMElement.
     * 
     * @param JField $field The Joomla JField.
     * @return DOMElement
     */
    private function getInput($field) {
        $domlocal = new DOMDocument();
        $domlocal->loadHTML($this->convert($field->input));

        $domXapth = new DOMXPath($domlocal);
        $input = $domXapth->query('/*/*/*')->item(0);

        $cloned = $input->cloneNode(TRUE);

        $imported = $this->formHtml->importNode($cloned, TRUE);

        return $imported;
    }

    /**
     * This method creates the tooltip script.
     * 
     * @author Depth S.A.
     * @since 4.0
     * 
     * @param JFormField $field The Joomla JField
     * @param string $guid Guid find in translations.
     * @return DOMElement
     */
    private function getInputScript($field, $guid) {
        $script_content = "js = jQuery.noConflict();

                    js('document').ready(function() {
                        js('#" . $field->id . "').tooltip({'trigger':'focus', 'title': \"" . addslashes(EText::_($guid, 2)) . "\"});
                    });";

        $script = $this->formHtml->createElement('script', $script_content);
        $script->setAttribute('type', 'text/javascript');

        return $script;
    }

    /**
     * This method creates the tooltip script.
     * 
     * @author Depth S.A.
     * @since 4.0
     * 
     * @param JFormField $field The Joomla JField
     * @return DOMElement
     */
    private function getMultiSelectScript($field, DOMElement $attribute) {

        $script_content = "js = jQuery.noConflict();
            
                            js('#" . $field->__get('id') . "').chosen().change(function(e, params) {
                                
                                if(params.selected != null){
                                    addToStructure(" . $attribute->getAttributeNS($this->catalog_uri, 'relid') . ", '" . FormUtils::serializeXpath($attribute->parentNode->getNodePath()) . "');
                                }else{
                                    removeFromStructure('" . FormUtils::serializeXpath($attribute->getNodePath()) . "');
                                }
                              
                            });";

        $script = $this->formHtml->createElement('script', $script_content);
        $script->setAttribute('type', 'text/javascript');

        return $script;
    }

    /**
     * Create the "ADD" bouton, if necessary.
     * 
     * @author Depth S.A.
     * @since 4.0
     * 
     * @param DOMElement $attribute The current attribute.
     * @return DOMElement
     */
    private function getAttributeAction(DOMElement $attribute) {
        $lowerbound = $attribute->getAttributeNS($this->catalog_uri, 'lowerbound');
        $upperbound = $attribute->getAttributeNS($this->catalog_uri, 'upperbound');
        $relid = $attribute->getAttributeNS($this->catalog_uri, 'relid');

        $debug = ' [oc: lb:' . $lowerbound . ' ub:' . $upperbound . ']';
        $action = $this->formHtml->createElement('div', 'attribute actions' . $debug);

        $aAdd = $this->formHtml->createElement('a');
        $iAdd = $this->formHtml->createElement('i');

        if (isset($_GET['relid'])) {
            $aAdd->setAttribute('id', 'remove-btn-' . FormUtils::serializeXpath($attribute->getNodePath()));
            $aAdd->setAttribute('class', 'btn btn-danger btn-mini remove-btn remove-btn-' . FormUtils::serializeXpath($this->removeIndex($attribute->getNodePath())));
            $aAdd->setAttribute('onclick', 'confirmField(this.id, \'' . $this->removeIndex(FormUtils::serializeXpath($attribute->getNodePath())) . '\',' . $relid . ', \'' . FormUtils::serializeXpath($attribute->parentNode->getNodePath()) . '\' ,' . $lowerbound . ',' . $upperbound . ')');

            $iAdd->setAttribute('class', 'icon-white icon-cancel-2');
        } else {
            $aAdd->setAttribute('id', 'add-btn-' . FormUtils::serializeXpath($attribute->getNodePath()));
            $aAdd->setAttribute('class', 'btn btn-success btn-mini add-btn add-btn-' . FormUtils::serializeXpath($this->removeIndex($attribute->getNodePath())));
            $aAdd->setAttribute('onclick', 'addField(this.id, \'' . $this->removeIndex(FormUtils::serializeXpath($attribute->getNodePath())) . '\',' . $relid . ', \'' . FormUtils::serializeXpath($attribute->parentNode->getNodePath()) . '\' ,' . $lowerbound . ',' . $upperbound . ')');

            $iAdd->setAttribute('class', 'icon-white icon-plus-2');
        }

        $aAdd->appendChild($iAdd);

        return $aAdd;
    }

    /**
     * Adds the "Preview" button to the File stereotype.
     * 
     * @author Depth S.A.
     * @since 4.0
     * 
     * @param DOMElement $attribute
     * @return DOMElement
     */
    private function getPreviewAction(DOMElement $attribute) {
        $a = $this->formHtml->createElement('a');
        $i = $this->formHtml->createElement('i');

        $a->setAttribute('id', 'preview-' . FormUtils::serializeXpath($attribute->firstChild->getNodePath()));
        $a->setAttribute('target', '_blank');
        $a->setAttribute('class', 'btn btn-mini preview-btn');
        $a->setAttribute('href', $attribute->nodeValue);
        $a->setAttribute('target', '_blank');

        $i->setAttribute('class', 'icon-white icon-eye-open');

        $a->appendChild($i);

        return $a;
    }

    /**
     * Adds the "Clear" button to the File stereotype.
     * 
     * @author Depth S.A.
     * @since 4.0
     * 
     * @param DOMElement $attribute The current attribute.
     * @return DOMElement
     */
    private function getEmptyFileAction(DOMElement $attribute) {
        $a = $this->formHtml->createElement('a');
        $i = $this->formHtml->createElement('i');

        $a->setAttribute('id', 'empty-btn-' . FormUtils::serializeXpath($attribute->firstChild->getNodePath()));
        $a->setAttribute('class', 'btn btn-danger btn-mini empty-btn empty-btn-' . FormUtils::serializeXpath($this->removeIndex($attribute->getNodePath())));
        $a->setAttribute('onclick', 'confirmEmptyFile(this.id)');

        $i->setAttribute('class', 'icon-white icon-cancel-2');

        $a->appendChild($i);

        return $a;
    }

    /**
     * Remove index from XPath
     * 
     * @param string $xpath
     * @return string
     */
    private function removeIndex($xpath) {
        return preg_replace('/[\[0-9\]*]/i', '', $xpath);
    }

}

?>