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
 * attribute Table class
 */
class Easysdi_catalogTabletranslation extends sdiTable {

    /**
     * Constructor
     *
     * @param JDatabase A database connector object
     */
    public function __construct(&$db) {
        parent::__construct('#__sdi_translation', 'id', $db);
    }

    /**
     * Method to provide a shortcut to binding, checking and storing a JTable
     * instance to the database table.  The method will check a row in once the
     * data has been stored and if an ordering filter is present will attempt to
     * reorder the table rows based on the filter.  The ordering filter is an instance
     * property name.  The rows that will be reordered are those whose value matches
     * the JTable instance for the property specified.
     *
     * @param   mixed   $src             An associative array or object to bind to the JTable instance.
     * @param   string  $orderingFilter  Filter for the order updating
     * @param   mixed   $ignore          An optional array or space separated list of properties
     *                                   to ignore while binding.
     *
     * @return  boolean  True on success.
     *
     * @link	http://docs.joomla.org/JTable/save
     * @since   11.1
     */
    public function saveAll($src, $orderingFilter = '', $ignore = '') {
       
        if (isset($src['text1']) && is_array($src['text1'])) {
            $label = $src['text1'];
            foreach($label as $key => $value) {
                $language_id = $key;
                $element_guid = $src['guid'];
                $keys = array ();
                $keys ['element_guid'] = $element_guid;
                $keys ['language_id'] = $language_id;
                if($this->load($keys)){
                    //Update
                    $this->text1 = $value;
                }else{
                    //Create
                    $this->element_guid = $element_guid;
                    $this->language_id = $language_id;
                    $this->text1 = $value;
                }
                if (isset($src['text2']) && is_array($src['text2'])) {
                    foreach($src['text2'] as $k => $v) {
                        if($k == $key){
                             $this->text2 = $v;
                             break;
                        }
                    }
                }
                
                if (!$this->store())
		{
                     $this->setError('Can t store');
                    return false;
		}
                $this->reset();
                $this->id = null;
            }
        }
        
        return true;

    }
    
    /**
       * Method to load all row from the database by element_guid key 
	 *
	 * @param   string   $element_guid   The element guid value for which we want to load translation
	 * @param   boolean  $reset  True to reset the default values before loading the new row.
	 *
	 * @return  array  Label and information text for all languages. False if no row found.
	 *
	  * @throws  RuntimeException
	 * @throws  UnexpectedValueException
	 */
	public function loadAll($element_guid = null, $reset = true)
	{
		if (empty($element_guid))
		{
			return false;
		}
		
		if ($reset)
		{
			$this->reset();
		}

		// Initialise the query.
		$query = $this->_db->getQuery(true)
			->select('*')
			->from($this->_tbl);
		$query->where($this->_db->quoteName('element_guid') . ' = ' . $this->_db->quote($element_guid));
		
		$this->_db->setQuery($query);

		$rows = $this->_db->loadAssocList();

		// Check that we have a result.
		if (!is_array($rows))
		{
			return false;
		}

                $result = array();
		// Bind the object with the row and return.
                foreach ($rows as $row){
                   $result['text1'] [$row['language_id']] = $row['text1'];
                   $result['text2'] [$row['language_id']] = $row['text2'];
                }
                
                return $result;
	}
        
        /**
	 * Delete all translation entries for a given element
	 *
	 * @param   string  $element_guid  Element guid.
	 *
	 * @return  boolean  True on success.
	 *
	 * @throws  UnexpectedValueException
	 */
	public function deleteAll($element_guid = null)
	{
		
		// If no primary key is given, return false.
		if ($element_guid === null)
		{
			throw new UnexpectedValueException('Null primary key not allowed.');
		}

		

		// Delete the row by primary key.
		$query = $this->_db->getQuery(true)
			->delete($this->_tbl)
			->where('element_guid = ' . $this->_db->quote($element_guid));
		$this->_db->setQuery($query);

		// Check for a database error.
		$this->_db->execute();

		return true;
	}
        

}