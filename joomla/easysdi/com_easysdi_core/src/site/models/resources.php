<?php

/**
 * @version     4.0.0
 * @package     com_easysdi_core
 * @copyright   Copyright (C) 2013. All rights reserved.
 * @license     GNU General Public License version 3 or later; see LICENSE.txt
 * @author      EasySDI Community <contact@easysdi.org> - http://www.easysdi.org
 */
defined('_JEXEC') or die;

jimport('joomla.application.component.modellist');

/**
 * Methods supporting a list of Easysdi_core records.
 */
class Easysdi_coreModelResources extends JModelList {

    /**
     * Constructor.
     *
     * @param    array    An optional associative array of configuration settings.
     * @see        JController
     * @since    1.6
     */
    public function __construct($config = array()) {
        parent::__construct($config);
    }

    /**
     * Method to auto-populate the model state.
     *
     * Note. Calling getState in this method will result in recursion.
     *
     * @since	1.6
     */
    protected function populateState($ordering = null, $direction = null) {

        // Initialise variables.
        $app = JFactory::getApplication();

        // List state information
        $limit = $app->getUserStateFromRequest('global.list.limit', 'limit', $app->getCfg('list_limit'));
        $this->setState('list.limit', $limit);

        $limitstart = JFactory::getApplication()->input->getInt('limitstart', 0);
        $this->setState('list.start', $limitstart);

        // Load the filter state.
        $search = $app->getUserStateFromRequest($this->context . '.filter.search', 'filter_search');
        $this->setState('filter.search', $search);
        
        $search = $app->getUserStateFromRequest($this->context . '.filter.status', 'filter_status');
        $this->setState('filter.status', $search);
        
        $search = $app->getUserStateFromRequest($this->context . '.filter.resourcetype', 'filter_resourcetype');
        $this->setState('filter.resourcetype', $search);


        if (empty($ordering)) {
            $ordering = 'a.ordering';
        }

        // List state information.
        parent::populateState($ordering, $direction);
    }

    /**
     * Build an SQL query to load the list data.
     *
     * @return	JDatabaseQuery
     * @since	1.6
     */
    protected function getListQuery() {
        // Create a new query object.
        $lang = JFactory::getLanguage();
        $db = $this->getDbo();
        $query = $db->getQuery(true);

        // Select the required fields from the table.
        $query->select(
                $this->getState(
                        'list.select', 'a.*'
                )
        );

        $query->from('`#__sdi_resource` AS a');

        // Join over the users for the checked out user.
        $query->select('uc.name AS editor');
        $query->join('LEFT', '#__users AS uc ON uc.id=a.checked_out');

        // Join over the created by field 'created_by'
        $query->select('created_by.name AS created_by');
        $query->join('LEFT', '#__users AS created_by ON created_by.id = a.created_by');

        // Join over the foreign key 'resourcetype_id'
        $query->select('trans.text1 AS resourcetype_name, rt.versioning as versioning, rt.view as supportview, rt.diffusion as supportdiffusion, rt.meta as supportmetadata');
        $query->join('LEFT', '#__sdi_resourcetype AS rt ON rt.id = a.resourcetype_id');
        $query->join('LEFT', '#__sdi_translation AS trans ON trans.element_guid = rt.guid');
        $query->join('LEFT', '#__sdi_language AS lang ON lang.id = trans.language_id');
        $query->where('lang.code = "' . $lang->getTag() . '"');
        $query->where('rt.predefined = 0');
        
        //join over resourcetypelink to know if some relations are possible
        $query->select('rtl.state as supportrelation');
        $query->join('LEFT', '(SELECT n.parent_id, state FROM #__sdi_resourcetypelink n GROUP BY n.parent_id) rtl ON rtl.parent_id = rt.id');
        
        
        // Filter by resource type
        $resourcetype = $this->getState('filter.resourcetype');
        if (is_numeric($resourcetype)) {
        	$query->where('a.resourcetype_id = ' . (int) $resourcetype);
        }

        // Filter by search in title
        $search = $this->getState('filter.search');
        if (!empty($search)) {
            if (stripos($search, 'id:') === 0) {
                $query->where('a.id = ' . (int) substr($search, 3));
            } else {
                $search = $db->Quote('%' . $db->escape($search, true) . '%');
                 $query->where('( a.name LIKE '.$search.' )');
            }
        }
        
        $query->order('a.name');
        
        return $query;
    }

}