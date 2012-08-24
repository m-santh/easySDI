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

jimport('joomla.application.component.controller');

/**
 * User controller class.
 */
class Easysdi_coreControllerUser extends JController
{

    function __construct() {
        $this->view_list = 'users';
        parent::__construct();
    }

}