<?php
/**
 * @version     4.0.0
 * @package     plg_getorganisms
 * @copyright   Copyright (C) 2013. All rights reserved.
 * @license     GNU General Public License version 3 or later; see LICENSE.txt
 * @author      EasySDI Community <contact@easysdi.org> - http://www.easysdi.org
 */

defined('_JEXEC') or die;

class PlgEasysdi_admin_infoGetorganisms extends JPlugin {

    protected $autoloadLanguage = true;

    public function onGetAdminInfos($context) {

        $db = JFactory::getDbo();
        $query = $db->getQuery(true);
        $query->select('COUNT(*)');
        $query->from('#__sdi_organism');
        $db->setQuery($query);
        $rows = $db->loadObjectList();
        //Convert the stdClass object in an array
        $values = get_object_vars($rows[0]);
        $values = $values['COUNT(*)'];
        //Create the return array with all the infos
        return array(
            'info' => $values,
            'text' => JText::plural('PLG_EASYSDI_ADMIN_INFO_GETORGANISMS_ORGANISMS',$values)
        );
    }
}