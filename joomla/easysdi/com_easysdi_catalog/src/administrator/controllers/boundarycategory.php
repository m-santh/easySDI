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

jimport('joomla.application.component.controllerform');

/**
 * Boundarycategory controller class.
 */
class Easysdi_catalogControllerBoundarycategory extends JControllerForm
{

    function __construct() {
        $this->view_list = 'boundariescategory';
        parent::__construct();
    }

}