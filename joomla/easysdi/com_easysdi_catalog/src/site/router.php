<?php

/**
 * @version     4.5.2
 * @package     com_easysdi_catalog
 * @copyright   Copyright (C) 2013-2019. All rights reserved.
 * @license     GNU General Public License version 3 or later; see LICENSE.txt
 * @author      EasySDI Community <contact@easysdi.org> - http://www.easysdi.org
 */
// No direct access
defined('_JEXEC') or die;

/**
 * @param	array	A named array
 * @return	array
 */
function Easysdi_catalogBuildRoute(&$query) {
    $segments = array();

    if (isset($query['task'])) {
        $segments[] = implode('/', explode('.', $query['task']));
        unset($query['task']);
    }
    if (isset($query['id'])) {
        $segments[] = $query['id'];
        unset($query['id']);
    }

    return $segments;
}

/**
 * @param	array	A named array
 * @param	array
 *
 * Formats:
 *
 * index.php?/easysdi_catalog/task/id/Itemid
 *
 * index.php?/easysdi_catalog/id/Itemid
 */
function Easysdi_catalogParseRoute($segments) {
    $vars = array();

    // view is always the first element of the array
    $count = count($segments);

    if ($count) {
        $count--;
        $segment = array_pop($segments);
        if (is_numeric($segment)) {
            $vars['id'] = $segment;
        } else {
            $count--;
            $vars['task'] = array_pop($segments) . '.' . $segment;
        }
    }

    if ($count) {
        $vars['task'] = implode('.', $segments);
    }
    return $vars;
}
