<?php

/**
 * @version     4.0.0
 * @package     com_easysdi_catalog
 * @copyright   Copyright (C) 2013. All rights reserved.
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 * @author      EasySDI Community <contact@easysdi.org§> - http://www.easysdi.org
 */
// No direct access
defined('_JEXEC') or die;

require_once JPATH_ADMINISTRATOR . '/components/com_easysdi_core/libraries/easysdi/database/sditable.php';

/**
 * importref Table class
 */
class Easysdi_catalogTablerelationprofile extends JTable {

    /**
     * Constructor
     *
     * @param JDatabase A database connector object
     */
    public function __construct(&$db) {
        parent::__construct('#__sdi_relation_profile', 'id', $db);
    }

    
   
    /**
     * Delete all the entries for the specified relation id
     * 
     * @param integer $relation_id  : relation identifier (fk on #__sdi_user)
     * 
     * @return boolean           True if successful. False if user not found or on error (internal error state set in that case).
     */
    public function deleteByRelationId($relation_id) {
        if (is_null($relation_id))
            return false;

        //Select the user attribution
        $query = $this->_db->getQuery(true);
        $query->select('id');
        $query->from($this->_tbl);
        $query->where($this->_db->quoteName('relation_id') . ' = ' . (int) $relation_id);

        $this->_db->setQuery($query);

        try {
            $ids = $this->_db->loadAssocList();
        } catch (JDatabaseException $e) {
            $je = new JException($e->getMessage());
            $this->setError($je);
            return false;
        }

        // Legacy error handling switch based on the JError::$legacy switch.
        // @deprecated  12.1
        if (JError::$legacy && $this->_db->getErrorNum()) {
            $e = new JException($this->_db->getErrorMsg());
            $this->setError($e);
            return false;
        }

        //Delete 
        foreach ($ids as $id) {
            try {
                $this->delete($id['id']);
            } catch (JDatabaseException $e) {
                $je = new JException($e->getMessage());
                $this->setError($je);
                return false;
            }
        }
        return true;
    }

    public function loadByRelationID($id = null, $reset = true) {
        if ($reset) {
            $this->reset();
        }

        // Initialise the query.
        $query = $this->_db->getQuery(true);
        $query->select('profile_id');
        $query->from($this->_tbl);
        $query->where($this->_db->quoteName('relation_id') . ' = ' . (int) $id);
        $this->_db->setQuery($query);

        try {
            $rows = $this->_db->loadColumn();
        } catch (JDatabaseException $e) {
            $je = new JException($e->getMessage());
            $this->setError($je);
            return false;
        }

        // Legacy error handling switch based on the JError::$legacy switch.
        // @deprecated  12.1
        if (JError::$legacy && $this->_db->getErrorNum()) {
            $e = new JException($this->_db->getErrorMsg());
            $this->setError($e);
            return false;
        }

        // Check that we have a result.
        if (empty($rows)) {
            $e = new JException(JText::_('JLIB_DATABASE_ERROR_EMPTY_ROW_RETURNED'));
            $this->setError($e);
            return false;
        }

        // Bind the object with the row and return.
        return $rows;
    }

}
