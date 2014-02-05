<?php
/**
 * @version     4.0.0
 * @package     plg_getordersaresptime
 * @copyright   Copyright (C) 2013. All rights reserved.
 * @license     GNU General Public License version 3 or later; see LICENSE.txt
 * @author      EasySDI Community <contact@easysdi.org> - http://www.easysdi.org
 */

defined('_JEXEC') or die;

class PlgEasysdi_admin_infoGetordersaresptime extends JPlugin {

    protected $autoloadLanguage = true;

    public function onGetAdminInfos($context) {
        
        $db = JFactory::getDbo();
        $query = $db->getQuery(true);
        /*TODO*/
        $query->select('AVG(TIME_TO_SEC(TIMEDIFF(completed,sent))) as sec');
        $query->from('#__sdi_order');
        $query->where('orderstate_id < 4 ');
        $db->setQuery($query);
        $rows = $db->loadObjectList();
        //Convert the stdClass object in an array
        $values = get_object_vars($rows[0]);
        $values = $values['sec'];
        if(is_null($values)){
                $val = '--';
                $txt = '';
        }else{
            if($values < 60){
                //seconds
                $val = round($values,1);
                $txt = JText::_('PLG_EASYSDI_ADMIN_INFO_GETORDERSARESPTIME_SECONDS');
            }elseif($values < 3600){
                //minutes
                $val = round($values/60,1);
                $txt = JText::_('PLG_EASYSDI_ADMIN_INFO_GETORDERSARESPTIME_MINUTES');
            }elseif($values < 86400){
                //hours
                $val = round($values/3600,1);
                $txt = JText::_('PLG_EASYSDI_ADMIN_INFO_GETORDERSARESPTIME_HOURS');
            }else{
                //days
                $val = round($values/86400,1);
                $txt = JText::_('PLG_EASYSDI_ADMIN_INFO_GETORDERSARESPTIME_DAYS');
            }    
        }
        //Create the return array with all the infos
        return array(
            'info' => $val,
            /*TODO*/
            'text' => $txt . ' : ' . JText::_('PLG_EASYSDI_ADMIN_INFO_GETORDERSARESPTIME_PHRASE')
        );
    }
}