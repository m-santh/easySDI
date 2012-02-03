<?php

/**
 * EasySDI, a solution to implement easily any spatial data infrastructure
 * Copyright (C) EasySDI Community * For more information : www.easysdi.org
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see http://www.gnu.org/licenses/gpl.html.
 */

// No direct access
defined('_JEXEC') or die('Restricted access');
 
/**
 * Map filter Table class
 */
class TableEasysdi_map_filter extends JTable
{
    /**
     * Primary Key
     *
     * @var int
     */
    var $id = null;
     
    /**
     * User id
     *
     * @var int
     */
    var $user_id = null;
    
    /**
     * User defined title
     *
     * @var string
     */
    var $title = null;
    
    /**
     * Plaintext description
     *
     * @var string
     */
    var $description = null;
    
    /**
     * Filter mode
     *
     * @var int
     */
    var $filter_mode = null;
    
    /**
     * JSON encoded filter data
     *
     * @var string
     */
    var $filter_data = null;
 
    /**
     * Constructor
     *
     * @param object Database connector object
     */
    function TableEasysdi_map_filter( &$db ) {
        parent::__construct('#__easysdi_map_filter', 'id', $db);
    }
}
?>