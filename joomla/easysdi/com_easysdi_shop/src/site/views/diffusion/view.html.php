<?php

/**
 * @version     4.0.0
 * @package     com_easysdi_shop
 * @copyright   Copyright (C) 2013. All rights reserved.
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 * @author      EasySDI Community <contact@easysdi.org> - http://www.easysdi.org
 */
// No direct access
defined('_JEXEC') or die;

jimport('joomla.application.component.view');
require_once JPATH_ADMINISTRATOR . '/components/com_easysdi_core/libraries/easysdi/factory/sdimultilingual.php';

/**
 * View to edit
 */
class Easysdi_shopViewDiffusion extends JViewLegacy {

    protected $state;
    protected $item;
    protected $form;
    protected $params;
    protected $user;
    protected $properties;
    protected $propertyvalues;

    /**
     * Display the view
     */
    public function display($tpl = null) {

        $app = JFactory::getApplication();
        $user = JFactory::getUser();

        $this->state = $this->get('State');
        $this->item = $this->get('Data');
        $this->params = $app->getParams('com_easysdi_shop');
        $this->form = $this->get('Form');

        $this->user = null;

        try {
            $this->user = sdiFactory::getSdiUser();
            if (!empty($this->item->id)) {
                if (!$this->user->authorizeOnVersion($this->item->version_id, sdiUser::diffusionmanager)) {
                    JFactory::getApplication()->enqueueMessage(JText::_('JERROR_ALERTNOAUTHOR'), 'error');
                    JFactory::getApplication()->redirect(JRoute::_('index.php?option=com_easysdi_core&view=resources', false));
                    return false;
                }
            }
        } catch (Exception $e) {
            JFactory::getApplication()->enqueueMessage(JText::_('JERROR_ALERTNOAUTHOR'), 'error');
            JFactory::getApplication()->redirect(JRoute::_('index.php?option=com_easysdi_core&view=resources', false));
            return false;
        }


        $db = JFactory::getDbo();
        $query = $db->getQuery(true);
        $query->select('*')
                ->from('#__sdi_property')
                ->where('state = 1');
        $db->setQuery($query);
        $this->properties = $db->loadObjectList();

        $query = $db->getQuery(true);
        $query->select('*')
                ->from('#__sdi_propertyvalue')
                ->where('state = 1');
        $db->setQuery($query);
        $this->propertyvalues = $db->loadObjectList();

        $organisms = $this->user->getDiffusionManagerOrganisms();
        $query = $db->getQuery(true);
//        $query =  "SELECT p.id, p.name FROM #__sdi_perimeter p WHERE p.state=1 AND p.perimetertype_id IN (1,3)";
//        $query .= ' AND (p.accessscope_id = 1 ';
//        $query .= 'OR (p.accessscope_id = 2 AND (SELECT COUNT(*) FROM #__sdi_accessscope a WHERE a.organism_id = '.$organisms[0]->id.' AND a.entity_guid = p.guid ) = 1)';
//        $query .= 'OR (p.accessscope_id = 3 AND (SELECT COUNT(*) FROM #__sdi_accessscope a WHERE a.user_id = '.$this->user->id.' AND a.entity_guid = p.guid ) = 1)';
//        $query .= ')';
        $query->select('p.id, p.name')
                ->from('#__sdi_perimeter p')
                ->where('p.state = 1')
                ->where("p.perimetertype_id IN (1,3)")
                ->where("(p.accessscope_id = 1 OR (p.accessscope_id = 2 AND (SELECT COUNT(*) FROM #__sdi_accessscope a WHERE a.organism_id = " . $organisms[0]->id . " AND a.entity_guid = p.guid ) = 1) OR (p.accessscope_id = 3 AND (SELECT COUNT(*) FROM #__sdi_accessscope a WHERE a.user_id = " . $this->user->id . " AND a.entity_guid = p.guid ) = 1))");
        $db->setQuery($query);
        $this->orderperimeters = $db->loadObjectList();



        // Check for errors.
        if (count($errors = $this->get('Errors'))) {
            throw new Exception(implode("\n", $errors));
        }



        $this->_prepareDocument();

        parent::display($tpl);
    }

    /**
     * Prepares the document
     */
    protected function _prepareDocument() {
        $app = JFactory::getApplication();
        $menus = $app->getMenu();
        $title = null;

        // Because the application sets a default page title,
        // we need to get it from the menu item itself
        $menu = $menus->getActive();
        if ($menu) {
            $this->params->def('page_heading', $this->params->get('page_title', $menu->title));
        } else {
            $this->params->def('page_heading', JText::_('com_easysdi_shop_DEFAULT_PAGE_TITLE'));
        }
        $title = $this->params->get('page_title', '');
        if (empty($title)) {
            $title = $app->getCfg('sitename');
        } elseif ($app->getCfg('sitename_pagetitles', 0) == 1) {
            $title = JText::sprintf('JPAGETITLE', $app->getCfg('sitename'), $title);
        } elseif ($app->getCfg('sitename_pagetitles', 0) == 2) {
            $title = JText::sprintf('JPAGETITLE', $title, $app->getCfg('sitename'));
        }
        $this->document->setTitle($title);

        if ($this->params->get('menu-meta_description')) {
            $this->document->setDescription($this->params->get('menu-meta_description'));
        }

        if ($this->params->get('menu-meta_keywords')) {
            $this->document->setMetadata('keywords', $this->params->get('menu-meta_keywords'));
        }

        if ($this->params->get('robots')) {
            $this->document->setMetadata('robots', $this->params->get('robots'));
        }
    }

    function getToolbar() {
        //load the JToolBar library and create a toolbar
        jimport('joomla.html.toolbar');
        $bar = new JToolBar('toolbar');
        //and make whatever calls you require
        $bar->appendButton('Standard', 'save', JText::_('JSave'), 'diffusion.save', false);
        $bar->appendButton('Separator');
        $bar->appendButton('Standard', 'cancel', JText::_('JCancel'), 'diffusion.cancel', false);
        //generate the html and return
        return $bar->render();
    }

}
