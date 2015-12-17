<?php
/*------------------------------------------------------------------------
# easysdi_processing.php - Easysdi_processing Component
# ------------------------------------------------------------------------
# author    Thomas Portier
# copyright Copyright (C) 2015. All Rights Reserved
# license   Depth France
# website   www.depth.fr
-------------------------------------------------------------------------*/

// No direct access to this file
defined('_JEXEC') or die('Restricted access');

// Added for Joomla 3.0
if(!defined('DS')){
	define('DS',DIRECTORY_SEPARATOR);
};

require_once JPATH_ADMINISTRATOR . '/components/com_easysdi_core/libraries/easysdi/factory/sdifactory.php';

// Set the component css/js
$document = JFactory::getDocument();
$document->addStyleSheet('components/com_easysdi_processing/assets/css/main.css');

$user=sdiFactory::getSdiUser();
if(!$user->isEasySDI) {
    return JError::raiseWarning(403, JText::_('JERROR_ALERTNOAUTHOR'));
}

// Require helper file
JLoader::register('Easysdi_processingHelper',           JPATH_ADMINISTRATOR . '/components/com_easysdi_processing/helpers/easysdi_processing.php');
JLoader::register('Easysdi_processingParamsHelper',     JPATH_ADMINISTRATOR . '/components/com_easysdi_processing/helpers/easysdi_processing_params.php');
JLoader::register('Easysdi_processingStatusHelper',     JPATH_ADMINISTRATOR . '/components/com_easysdi_processing/helpers/easysdi_processing_status.php');



// import joomla controller library
jimport('joomla.application.component.controller');

// Get an instance of the controller prefixed by Cadastre
$controller = JControllerLegacy::getInstance('Easysdi_processing');

// Perform the request task
$controller->execute(JRequest::getCmd('task'));

// Redirect if set by the controller
$controller->redirect();
?>