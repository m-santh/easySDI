<?php

/**
 * @version     4.3.2
 * @package     com_easysdi_shop
 * @copyright   Copyright (C) 2013-2015. All rights reserved.
 * @license     GNU General Public License version 3 or later; see LICENSE.txt
 * @author      EasySDI Community <contact@easysdi.org> - http://www.easysdi.org
 */
defined('_JEXEC') or die;

jimport('joomla.application.component.modellist');

require_once JPATH_SITE . '/components/com_easysdi_map/helpers/easysdi_map.php';

/**
 * Methods supporting a list of Easysdi_shop records.
 */
class Easysdi_shopModelOrders extends JModelList {
    
    /**
     * Constructor.
     *
     * @param    array    An optional associative array of configuration settings.
     * @see        JController
     * @since    1.6
     */
    public function __construct($config = array()) {
        parent::__construct($config);
        
        //Before displaying list, delete old orders' files (according to clean up order delay )
        $this->cleanUpHistoricOrders();
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
        
        $filter_ctx= (JFactory::getApplication()->input->get('layout') == 'validation') ? 'validation' : 'order';
        $this->context .= '.'.$filter_ctx;
        
        // Load the filter state.
        $search = $app->getUserStateFromRequest($this->context . '.filter.organism', 'filter_organism');
        $this->setState('filter.organism', $search);
        
        $search = $app->getUserStateFromRequest($this->context . '.filter.search', 'filter_search');
        $this->setState('filter.search', $search);
        
        $search = $app->getUserStateFromRequest($this->context . '.filter.status', 'filter_status', (JFactory::getApplication()->input->get('layout') == 'validation') ? 1 : null);
        $this->setState('filter.status', $search);
        
        $search = $app->getUserStateFromRequest($this->context . '.filter.type', 'filter_type');
        $this->setState('filter.type', $search);
                
        // List state information
        $limit = $app->getUserStateFromRequest('global.list.limit', 'limit', $app->getCfg('list_limit'));
        $this->setState('list.limit', $limit);

        $limitstart = JFactory::getApplication()->input->getInt('limitstart', 0);
        $this->setState('list.start', $limitstart);
        
        $this->setState('layout.validation', (JFactory::getApplication()->input->get('layout') == 'validation'));


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
        $user = sdiFactory::getSdiUser();
        // Create a new query object.
        $db = $this->getDbo();
        $query = $db->getQuery(true);

        // Select the required fields from the table.
        $query->select(
                $this->getState(
                        'list.select', 'DISTINCT a.*'
                )
        );
        
        $query->from('#__sdi_order AS a');

//        // Join over the users for the checked out user.
//        $query->select('uc.name AS editor');
//        $query->join('LEFT', '#__users AS uc ON uc.id=a.checked_out');
//
//        // Join over the created by field 'created_by'
        $query->select('created_by.name AS created_by_name');
        $query->join('LEFT', '#__users AS created_by ON created_by.id = a.created_by');

        //Join over the order state value
        $query->select('state.value AS orderstate');
        $query->innerjoin('#__sdi_sys_orderstate AS state ON state.id = a.orderstate_id');

        //Join over the order type value
        $query->select('type.value AS ordertype');
        $query->innerjoin('#__sdi_sys_ordertype AS type ON type.id = a.ordertype_id');
        
        
        
        // Filter by type
        $type = $this->getState('layout.validation') ? Easysdi_shopHelper::ORDERTYPE_ORDER : $this->getState('filter.type');
        if (is_numeric($type)) {
        	$query->where('a.ordertype_id = ' . (int) $type);
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
        
        if($this->getState('layout.validation')){
            $query->join('LEFT', '#__sdi_user_role_organism uro ON uro.organism_id=a.thirdparty_id')
                    ->where('uro.user_id='.(int)$user->id)
                    ->where('uro.role_id IN ('.sdiUser::validationmanager.','.sdiUser::organismmanager.')');
            
            $tpOrganism = $this->getState('filter.organism');
            if($tpOrganism > 0)
                $query->where('a.thirdparty_id='.(int)$tpOrganism);
            
            // Filter by state
            $status = $this->getState('filter.status');
            if (is_numeric($status)) {
                if($status == 1) // get orders to check
                    $query->where('a.orderstate_id = 8');
                else // get orders checked
                    $query->where('a.orderstate_id IN (1, 2, 3, 4, 5, 6, 9, 10)');
            }
        }
        else{
            //Only order which belong to the current user
            $organism = $this->getState('filter.organism');
            $organisms = $organism>0 ? array($organism) : $user->getOrganisms(array(sdiUser::organismmanager), true);
            if(count($organisms)==0){
                $organisms = array(-1);
            }
            $query->innerJoin('#__sdi_user_role_organism uro ON uro.user_id=a.user_id')
                    ->where('uro.role_id='.sdiUser::member.' AND (a.user_id='.(int)$user->id.' OR uro.organism_id IN ('.implode(',', $organisms).'))');
            
            
            // Filter by state
            $status = $this->getState('filter.status');
            if (is_numeric($status)) {
                $query->where('a.orderstate_id = '.$status);
            }
        }
        
        
        
        //Don't include historized item
        $query->where('a.orderstate_id <> 2');
        
        $query->order('a.created DESC');

        return $query;
    }

    function getOrderState() {
        //Load all status value except historized (only used by EasySDI administrator in back-end)
        $db = JFactory::getDbo();
        $query = $db->getQuery(true)
                ->select('s.value, s.id ')
                ->from('#__sdi_sys_orderstate s')
                ->where('s.id <> 2')
                ->order('id desc');
        $db->setQuery($query);
        return $db->loadObjectList();
    }
    
    function getOrderType() {
        //Load all status value
        $db = JFactory::getDbo();
        $query = $db->getQuery(true)
                ->select('t.value, t.id ')
                ->from('#__sdi_sys_ordertype t')
                ->where('t.value <> '.$db->quote('draft'));
        $db->setQuery($query);
        return $db->loadObjectList();
    }
    
    /**
     * Delete orders files if they are older than the "clean up order delay" 
     * defined in admin     
     */
    function cleanUpHistoricOrders() {
        $app = JFactory::getApplication();
        $cleanuporderdelay = $app->getParams('com_easysdi_shop')->get('cleanuporderdelay');
        
         if (is_numeric($cleanuporderdelay))
         {
            // Get UTC for now.
            $dNow = new JDate;
            $dStart = clone $dNow;
            $dStart->modify('-'.$cleanuporderdelay.' day');


            //Get all the terminated orders to delete associated files if delay has passed
            $db = JFactory::getDbo();
            $query = $db->getQuery(true);
            $query->select('d.id, d.order_id, o.alias ');
            $query->from($db->quoteName('#__sdi_order','o'));
            $query->join('INNER',$db->quoteName('#__sdi_order_diffusion','d'). ' ON (' . $db->quoteName('d.order_id') . ' = ' . $db->quoteName('o.id') . ')');
            $query->where('o.completed < ' . $db->quote($dStart->format('Y-m-d H:i:s')));
            $query->where('d.productstate_id = 1');
            $query->where('(o.orderstate_id = 3 OR o.orderstate_id = 1)');
            $db->setQuery($query);            
            $orderstohistorize = $db->loadObjectList();
            
            foreach ($orderstohistorize as $ordertohistorize) {
               //Suppression du répertoire de stockage de la commande
               $folder = $app->getParams('com_easysdi_shop')->get('orderresponseFolder');
               $requestDir = JPATH_BASE. '/' .$folder . '/' . $ordertohistorize->order_id; 
               //recursieve delete
               require_once JPATH_SITE . '/components/com_easysdi_shop/helpers/easysdi_shop.php';
               Easysdi_shopHelper::rrmdir($requestDir);
               
               //Change status of the order_diffusion to mark them deleted
               //And clean the file name field
                $query = $db->getQuery(true);
                $query->update('#__sdi_order_diffusion');
                $query->set('productstate_id = 7');
                $query->set($db->quoteName('file') . ' = NULL');
                $query->where('order_id = ' . $ordertohistorize->order_id);
                $db->setQuery($query);
                $s = $query->__toString();
                $db->execute();
            }
         }
    }
}
