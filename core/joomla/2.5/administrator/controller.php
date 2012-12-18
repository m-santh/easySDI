<?php
/**
 * @version     3.0.0
  * @package     com_easysdi_user
 * @copyright   Copyright (C) 2012. All rights reserved.
 * @license     GNU General Public License version 3 or later; see LICENSE.txt
 * @author      EasySDI Community <contact@easysdi.org> - http://www.easysdi.org
 */


// No direct access
defined('_JEXEC') or die;

class Easysdi_coreController extends JController
{
	/**
	 * Method to display a view.
	 *
	 * @param	boolean			$cachable	If true, the view output will be cached
	 * @param	array			$urlparams	An array of safe url parameters and their variable types, for valid values see {@link JFilterInput::clean()}.
	 *
	 * @return	JController		This object to support chaining.
	 * @since	1.5
	 */
	public function display($cachable = false, $urlparams = false)
	{
		require_once JPATH_COMPONENT.DS.'helpers'.DS.'easysdi_core.php';

		//Check if others EasySDI components are installed and saved results in UserState
		$app 				= JFactory::getApplication();
		$db 				= JFactory::getDbo();
		$db->setQuery('SELECT COUNT(*) FROM #__extensions WHERE name = "com_easysdi_user"');
		$app->setUserState( 'com_easysdi_user-installed' ,$db->loadResult() == 0 ? false : true);
		$db->setQuery('SELECT COUNT(*) FROM #__extensions WHERE name = "com_easysdi_shop"');
		$app->setUserState( 'com_easysdi_shop-installed' ,$db->loadResult() == 0 ? false : true);
		$db->setQuery('SELECT COUNT(*) FROM #__extensions WHERE name = "com_easysdi_service"');
		$app->setUserState( 'com_easysdi_service-installed' ,$db->loadResult() == 0 ? false : true);
		$db->setQuery('SELECT COUNT(*) FROM #__extensions WHERE name = "com_easysdi_map"');
		$app->setUserState( 'com_easysdi_map-installed' ,$db->loadResult() == 0 ? false : true);
		
		$view		= JRequest::getCmd('view', 'easysdi');
		$layout 	= JRequest::getCmd('layout', 'edit');
		$id			= JRequest::getInt('id');
		JRequest::setVar('view', $view);
		
		
		// Load the submenu.
		Easysdi_coreHelper::addSubmenu(JRequest::getCmd('view', 'cores'));

		$view		= JRequest::getCmd('view', 'cores');
        JRequest::setVar('view', $view);

		parent::display();

		return $this;
	}
}
