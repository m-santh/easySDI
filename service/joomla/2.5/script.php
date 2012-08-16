<?php
/**
 * @version     3.0.0
 * @package     com_easysdi_service
 * @copyright   Copyright (C) 2012. All rights reserved.
 * @license     GNU General Public License version 3 or later; see LICENSE.txt
 * @author      EasySDI Community <contact@easysdi.org> - http://www.easysdi.org
 */

// No direct access to this file
defined('_JEXEC') or die('Restricted access');
 
class com_easysdi_serviceInstallerScript
{
	/*
	 * $parent is the class calling this method.
	 * $type is the type of change (install, update or discover_install, not uninstall).
	 * preflight runs before anything else and while the extracted files are in the uploaded temp folder.
	 * If preflight returns false, Joomla will abort the update and undo everything already done.
	 */
	function preflight( $type, $parent ) {
		//Check if com_easysdi_core is installed
		$db = JFactory::getDbo();
		$db->setQuery('SELECT COUNT(*) FROM #__extensions WHERE name = "com_easysdi_core"');
		$install = $db->loadResult();
		
		if($install == 0){
			JError::raiseWarning(null, JText::_('COM_EASYSDI_SERVICE_INSTALL_SCRIPT_CORE_ERROR'));
			return false;
		}
		
		// Installing component manifest file version
		$this->release = $parent->get( "manifest" )->version;
		
		// Show the essential information at the install/update back-end
		echo '<p>EasySDI component Service [com_easysdi_service]';
		echo '<br />'.JText::_('COM_EASYSDI_SERVICE_INSTALL_SCRIPT_MANIFEST_VERSION') . $this->release;
	}
 
	/*
	 * $parent is the class calling this method.
	 * install runs after the database scripts are executed.
	 * If the extension is new, the install method is run.
	 * If install returns false, Joomla will abort the install and undo everything already done.
	 */
	function install( $parent ) {
		// You can have the backend jump directly to the newly installed component configuration page
		// $parent->getParent()->setRedirectURL('index.php?option=com_democompupdate');
	}
 
	/*
	 * $parent is the class calling this method.
	 * update runs after the database scripts are executed.
	 * If the extension exists, then the update method is run.
	 * If this returns false, Joomla will abort the update and undo everything already done.
	 */
	function update( $parent ) {
		// You can have the backend jump directly to the newly updated component configuration page
		// $parent->getParent()->setRedirectURL('index.php?option=com_democompupdate');
	}
 
	/*
	 * $parent is the class calling this method.
	 * $type is the type of change (install, update or discover_install, not uninstall).
	 * postflight is run after the extension is registered in the database.
	 */
	function postflight( $type, $parent ) {
		if($type == 'install'){
			JTable::addIncludePath(JPATH_ADMINISTRATOR.DS."..".DS."libraries".DS."joomla".DS."database".DS."table");
				
			//Create a default EasySDI Service Category
			$row 					=& JTable::getInstance('category');
			$row->parent_id 		= 1;
			$row->level				= 1;
			$row->path 				= 'uncategorised';
			$row->extension 		= 'com_easysdi_service';
			$row->title 			= 'Uncategorised';
			$row->alias 			= 'uncategorised';
			$row->published 		= 1;
			$row->access 			= 1;
			$row->params  			= '{"category_layout":"","image":""}';
			$row->metadata 			= '{"author":"","robots":""}';
			if(!$row->store(true))
			{
				JError::raiseWarning(null, JText::_('COM_EASYSDI_SERVICE_POSTFLIGHT_SCRIPT_CATEGORY_ERROR'));
				return false;
			}
			//$row->moveByReference(0, 'last-child', $row->id);
			
			$db = JFactory::getDbo();
			$db->setQuery("DELETE FROM `#__menu` WHERE title = 'com_easysdi_service'");
			$db->query();
		}
	}

	/*
	 * $parent is the class calling this method
	 * uninstall runs before any other action is taken (file removal or database processing).
	 */
	function uninstall( $parent ) {
		
	}
 
	/*
	 * get a variable from the manifest file (actually, from the manifest cache).
	 */
	function getParam( $name ) {
		$db = JFactory::getDbo();
		$db->setQuery('SELECT manifest_cache FROM #__extensions WHERE name = "com_easysdi_service"');
		$manifest = json_decode( $db->loadResult(), true );
		return $manifest[ $name ];
	}
 
	/*
	 * sets parameter values in the component's row of the extension table
	 */
	function setParams($param_array) {
		if ( count($param_array) > 0 ) {
			// read the existing component value(s)
			$db = JFactory::getDbo();
			$db->setQuery('SELECT params FROM #__extensions WHERE name = "com_easysdi_service"');
			$params = json_decode( $db->loadResult(), true );
			// add the new variable(s) to the existing one(s)
			foreach ( $param_array as $name => $value ) {
				$params[ (string) $name ] = (string) $value;
			}
			// store the combined new and existing values back as a JSON string
			$paramsString = json_encode( $params );
			$db->setQuery('UPDATE #__extensions SET params = ' .
				$db->quote( $paramsString ) .
				' WHERE name = "com_easysdi_service"' );
				$db->query();
		}
	}
}
