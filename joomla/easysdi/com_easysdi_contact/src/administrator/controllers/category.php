<?php
/**
 * @version     4.5.2
 * @package     com_easysdi_contact
 * @copyright   Copyright (C) 2013-2019. All rights reserved.
 * @license     GNU General Public License version 3 or later; see LICENSE.txt
 * @author      EasySDI Community <contact@easysdi.org> - http://www.easysdi.org
 */

// No direct access
defined('_JEXEC') or die;

jimport('joomla.application.component.controllerform');

/**
 * Organism controller class.
 */
class Easysdi_contactControllerCategory extends JControllerForm
{

    function __construct() {
        $this->view_list = 'categories';
        parent::__construct();
    }

}