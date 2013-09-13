<?php

// No direct access
defined('_JEXEC') or die;

require_once(JPATH_COMPONENT_ADMINISTRATOR.'/helpers/WmsPhysicalService.php');

class WmsWebservice {
	/*
	 * Entry point of the class
	 * 
	 * @param Array Usually the $_GET, or any associative array
	 * @param Boolean Set to true to force a return value, results are echoed otherwise
	*/
	public static function request ($params) {
		switch ($params['method']) {
			case 'getWmsLayerForm':
				echo WmsWebservice::getWmsLayerForm($params);
				break;
			case 'setWmsLayerSettings':
				if (WmsWebservice::setWmsLayerSettings($params)) {
					echo 'OK';
				}
				break;
			case 'deleteWmsLayer':
				if (WmsWebservice::deleteWmsLayer($params)) {
					echo 'OK';
				}
				break;
			default:
				echo 'Unknown method.';
				break;
		}
		die();
	}
	
	private static function getWmsLayerForm ($raw_GET) {
		$physicalServiceID = $raw_GET['physicalServiceID'];
		$virtualServiceID = $raw_GET['virtualServiceID'];
		$policyID = ('' == $raw_GET['policyID'])?0:$raw_GET['policyID'];
		$layerID = $raw_GET['layerID'];
		
		$layerObj = WmsWebservice::getWmsLayerSettings(
			$virtualServiceID,
			$physicalServiceID,
			$policyID,
			$layerID
		);
		
		$db = JFactory::getDbo();
		$db->setQuery('
			SELECT *
			FROM #__sdi_sys_spatialoperator
			WHERE state = 1
			ORDER BY ordering;
		');
		
		try {
			$db->execute();
			$resultset = $db->loadObjectList();
		}
		catch (JDatabaseException $e) {
			$je = new JException($e->getMessage());
			$this->setError($je);
			return false;
		}
		
		$html = '
		<div class="well">
	    	<div class="control-group inline">
				<label class="control-label" for="minimumscale">' . JText::_('COM_EASYSDI_SERVICE_WMS_LAYER_MINIMUM_SCALE') . '</label>
				<div class="controls">
					<input type="text" name="minimumscale" value="' .  $layerObj->minimumScale . '" />
				</div>
			</div>
	  		<div class="control-group">
				<label class="control-label" for="maximumscale">' . JText::_('COM_EASYSDI_SERVICE_WMS_LAYER_MAXIMUM_SCALE') . '</label>
				<div class="controls">
					<input type="text" name="maximumscale" value="' . $layerObj->maximumScale . '" />
				</div>
			</div>
			<div class="control-group">
				<label class="control-label" for="geographicfilter">' . JText::_('COM_EASYSDI_SERVICE_WMS_LAYER_FILTER') . '</label>
				<div class="controls">
					<textarea name="geographicfilter" rows="8" class="input-xlarge">' . $layerObj->geographicFilter . '</textarea>
				</div>
			</div>
		</div>

			<input type="hidden" name="psID" value="' . $physicalServiceID . '"/>
			<input type="hidden" name="vsID" value="' . $virtualServiceID . '"/>
			<input type="hidden" name="policyID" value="' . $policyID . '"/>
			<input type="hidden" name="layerID" value="' . $layerID . '"/>
		';
		return $html;
	}
	
	private static function getWmsLayerSettings ($virtualServiceID, $physicalServiceID, $policyID, $layerID) {
		$db = JFactory::getDbo();
		
		$db->setQuery('
			SELECT resourceurl
			FROM #__sdi_physicalservice 
			WHERE id = ' . $physicalServiceID . ';
		');
		
		try {
			$url = $db->loadResult();
		}
		catch (JDatabaseException $e) {
			$je = new JException($e->getMessage());
			$this->setError($je);
			return false;
		}
		
		$db->setQuery('
			SELECT wlp.*, wsp.*, wlp.id AS wmslayerpolicy_id
			FROM #__sdi_wmslayer_policy wlp
			JOIN #__sdi_physicalservice_policy pp
			ON wlp.physicalservicepolicy_id = pp.id
			JOIN #__sdi_wms_spatialpolicy wsp
			ON wlp.spatialpolicy_id = wsp.id
			WHERE pp.physicalservice_id = ' . $physicalServiceID . '
			AND pp.policy_id = ' . $policyID . '
			AND wlp.name = \'' . $layerID . '\';
		');
		
		try {
			$db->execute();
			$wmslayerpolicy = $db->loadObject();
		}
		catch (JDatabaseException $e) {
			$je = new JException($e->getMessage());
			$this->setError($je);
			return false;
		}
		
		//preparing the object to be returned
		$data = Array();
		if (isset($wmslayerpolicy)) {
			$data[$layerID] = Array(
				'enabled' => $wmslayerpolicy->enabled,
				'geographicFilter' => $wmslayerpolicy->geographicfilter,
				'maximumScale' => $wmslayerpolicy->maximumscale,
				'minimumScale' => $wmslayerpolicy->minimumscale,
			);
		}
		
		$wmsObj = new WmsPhysicalService($physicalServiceID, $url);
		$wmsObj->getCapabilities(self::getXmlFromCache($physicalServiceID, $virtualServiceID));
		$wmsObj->populate();
		$wmsObj->loadData($data);
		$layerObj = $wmsObj->getLayerByName($layerID);
		return $layerObj;
	}
	
	private static function setWmsLayerSettings ($raw_GET) {
		$physicalServiceID = $raw_GET['psID'];
		$policyID = $raw_GET['policyID'];
		$layerID = $raw_GET['layerID'];
		$raw_GET['maxX'] = ('' != $raw_GET['maxX'])?$raw_GET['maxX']:'null';
		$raw_GET['maxY'] = ('' != $raw_GET['maxY'])?$raw_GET['maxY']:'null';
		$raw_GET['minX'] = ('' != $raw_GET['minX'])?$raw_GET['minX']:'null';
		$raw_GET['minY'] = ('' != $raw_GET['minY'])?$raw_GET['minY']:'null';
		$raw_GET['minimumscale'] = ('' != $raw_GET['minimumscale'])?$raw_GET['minimumscale']:'null';
		$raw_GET['maximumscale'] = ('' != $raw_GET['maximumscale'])?$raw_GET['maximumscale']:'null';
		$db = JFactory::getDbo();
		
		try{
			//save Spatial Policy
			$db->setQuery('
				SELECT sp.id
				FROM #__sdi_wms_spatialpolicy sp
				JOIN #__sdi_wmslayer_policy wlp
				ON sp.id = wlp.spatialpolicy_id
				JOIN #__sdi_physicalservice_policy psp
				ON psp.id = wlp.physicalservicepolicy_id
				WHERE psp.physicalservice_id = ' . $physicalServiceID . '
				AND psp.policy_id = ' . $policyID . '
				AND wlp.name = \'' . $layerID . '\';
			');
			$db->execute();
			$num_result = $db->getNumRows();
			$spatial_policy_id = $db->loadResult();
		
			$query = $db->getQuery(true);
			if (0 == $num_result) {
				$query->insert('#__sdi_wms_spatialpolicy')->columns('
					geographicfilter, maxx, maxy, minx, miny, minimumscale, maximumscale, srssource
				')->values('
					\'' . $raw_GET['geographicfilter'] . '\', ' . $raw_GET['maxX'] . ', ' . $raw_GET['maxY'] . ', ' . $raw_GET['minX'] . ', ' . $raw_GET['minY'] . ', ' . $raw_GET['minimumscale'] . ', ' . $raw_GET['maximumscale'] . ', \'' . $raw_GET['srs'] . '\'
				');
			}
			else {
				$query->update('#__sdi_wms_spatialpolicy')->set(Array(
					'geographicfilter = \'' . $raw_GET['geographicfilter'] . '\'',
					'maxx = ' . $raw_GET['maxX'],
					'maxy = ' . $raw_GET['maxY'],
					'minx = ' . $raw_GET['minX'],
					'miny = ' . $raw_GET['minY'],
					'minimumscale = ' . $raw_GET['minimumscale'],
					'maximumscale = ' . $raw_GET['maximumscale'],
					'srssource = \'' . $raw_GET['srs'] . '\'',
				))->where(Array(
					'id = \'' . $spatial_policy_id . '\'',
				));
			}
			$db->setQuery($query);
			$db->execute();
			if (0 == $num_result) {
				$spatial_policy_id = $db->insertid();
			}
		
			//save Wms Layer Policy
			$db->setQuery('
				SELECT wlp.id
				FROM #__sdi_wmslayer_policy wlp
				JOIN #__sdi_physicalservice_policy psp
				ON psp.id = wlp.physicalservicepolicy_id
				WHERE psp.physicalservice_id = ' . $physicalServiceID . '
				AND psp.policy_id = ' . $policyID . '
				AND wlp.name = \'' . $layerID . '\';
			');
			$db->execute();
			$num_result = $db->getNumRows();
			$wmslayerpolicy_id = $db->loadResult();
		
			
			if (0 != $num_result) {//Update the spatialpolicy_id in the wmslayer object
				$query = $db->getQuery(true);
				$query->update('#__sdi_wmslayer_policy')->set(Array(
					'spatialpolicy_id = \'' . $spatial_policy_id . '\'',
					'inheritedspatialpolicy = 0',
				))->where(Array(
					'id = \'' . $wmslayerpolicy_id . '\'',
				));
				$db->setQuery($query);
				$db->execute();
			}
			
		        
			JTable::addIncludePath(JPATH_ADMINISTRATOR.'/components/com_easysdi_service/tables');
	        $dispatcher = JEventDispatcher::getInstance();
	        // Include the content plugins for the on save events.
	        JPluginHelper::importPlugin('content');
	        $table = JTable::getInstance("policy", "Easysdi_serviceTable", array());
	        $table->load($policyID);
	        // Trigger the onContentAfterSave event.
	        $dispatcher->trigger('onContentAfterSave', array('com_easysdi_service.policy', $table, false));
			return true;
		}
		catch (JDatabaseException $e) {
			$je = new JException($e->getMessage());
			$this->setError($je);
			return false;
		}
		
	}
	
	/*
	 * Save all layers of a given virtual service
	 * 
	 * @param Int virtual service ID
	 * @param Int policy ID
	*/
	public static function saveAllLayers($virtualServiceID, $policyID) {
		$db = JFactory::getDbo();
		$db->setQuery('
			SELECT ps.id, ps.resourceurl AS url, psp.id AS psp_id
			FROM #__sdi_virtualservice vs
			JOIN #__sdi_virtual_physical vp
			ON vs.id = vp.virtualservice_id
			JOIN #__sdi_physicalservice ps
			ON ps.id = vp.physicalservice_id
			JOIN #__sdi_physicalservice_policy psp
			ON ps.id = psp.physicalservice_id
			WHERE vs.id = ' . $virtualServiceID . '
			AND psp.policy_id = ' . $policyID . ';
		');
		
		try {
			$db->execute();
			$resultset = $db->loadObjectList();
		}
		catch (JDatabaseException $e) {
			$je = new JException($e->getMessage());
			$this->setError($je);
			return false;
		}
		
		foreach ($resultset as $result) {
			$physicalServiceID = $result->id;
			$wmsObj = new WmsPhysicalService($result->id, $result->url);
			$wmsObj->getCapabilities();
			$wmsObj->populate();
			$layerList = $wmsObj->getLayerList();
			
			foreach ($layerList as $layer) {
				//we check if the layer already exists
				$db->setQuery('
					SELECT wlp.id
					FROM #__sdi_wmslayer_policy wlp
					JOIN #__sdi_physicalservice_policy psp
					ON psp.id = wlp.physicalservicepolicy_id
					WHERE psp.physicalservice_id = ' . $physicalServiceID . '
					AND psp.policy_id = ' . $policyID . '
					AND wlp.name = \'' . $layer->name . '\';
				');
				
				try {
					$db->execute();
					$layer_exists = (0 == $db->getNumRows())?false:true;
				}
				catch (JDatabaseException $e) {
					$je = new JException($e->getMessage());
					$this->setError($je);
					return false;
				}
				
				if ($layer_exists) {
					//if the layer already exists, we do nothing and we skip to the next layer
					continue;
				}
				else {
					//we retrieve the physicalservice_policy id to link the layer policy with
					$db->setQuery('
						SELECT id
						FROM #__sdi_physicalservice_policy
						WHERE physicalservice_id = ' . $physicalServiceID . '
						AND policy_id = ' . $policyID . ';
					');
					
					try {
						$db->execute();
						$physicalservice_policy_id = $db->loadResult();
					}
					catch (JDatabaseException $e) {
						$je = new JException($e->getMessage());
						$this->setError($je);
						return false;
					}
					
					//we save the layer policy
					$query = $db->getQuery(true);
					$query->insert('#__sdi_wmslayer_policy')->columns('
						name, description, physicalservicepolicy_id
					')->values('
						\'' . $layer->name . '\', \'' . $db->escape($layer->description) . '\', \'' . $physicalservice_policy_id . '\'
					');
					
					$db->setQuery($query);
					
					try {
						$db->execute();
					}
					catch (JDatabaseException $e) {
						$je = new JException($e->getMessage());
						$this->setError($je);
						return false;
					}
				}
				echo '<hr />';
			}
		}
		return true;
	}
	
	private static function deleteWmsLayer ($raw_GET) {
		$physicalServiceID = $raw_GET['physicalServiceID'];
		$policyID = $raw_GET['policyID'];
		$layerID = $raw_GET['layerID'];
		
		$db = JFactory::getDbo();
		
		$db->setQuery('
			SELECT wp.spatialpolicy_id
			FROM #__sdi_wmslayer_policy wp
			JOIN #__sdi_physicalservice_policy pp
			ON wp.physicalservicepolicy_id = pp.id
			WHERE pp.physicalservice_id = ' . $physicalServiceID . '
			AND pp.policy_id = ' . $policyID . '
			AND wp.name = \'' . $layerID . '\';
		');

		try {
			$db->execute();
			$pk = $db->loadResult();
		}
		catch (JDatabaseException $e) {
			$je = new JException($e->getMessage());
			$this->setError($je);
			return false;
		}
		
		if (is_numeric($pk) && 0 < $pk) {
			try {
				$query = $db->getQuery(true);
				$query->update('#__sdi_wmslayer_policy')->set(Array(
						'spatialpolicy_id = NULL',
						'inheritedspatialpolicy = 1',
				))->where(Array(
						'spatialpolicy_id = \'' . $pk . '\'',
				));
				$db->setQuery($query);
				$db->execute();
// 				$db->setQuery("UPDATE #__sdi_wmslayer_policy SET spatialpolicy_id = NULL AND inheritedspatialpolicy = 1 WHERE spatialpolicy_id = ".$pk);
// 				$db->execute();
				
				$query = $db->getQuery(true);
				$query->delete('#__sdi_wms_spatialpolicy')->where('id = ' . $pk);
				
				$db->setQuery($query);
				$db->execute();
				
				
			}
			catch (JDatabaseException $e) {
				$je = new JException($e->getMessage());
				$this->setError($je);
				return false;
			}
		}
	}
	
	private static function getXmlFromCache ($physicalServiceID, $virtualServiceID) {
		$db = JFactory::getDbo();
		
		$db->setQuery('
			SELECT pssc.capabilities
			FROM #__sdi_virtualservice vs
			JOIN #__sdi_virtual_physical vp
			ON vs.id = vp.virtualservice_id
			JOIN #__sdi_physicalservice ps
			ON ps.id = vp.physicalservice_id
			JOIN #__sdi_physicalservice_servicecompliance pssc
			ON ps.id = pssc.service_id
			JOIN #__sdi_virtualservice_servicecompliance vssc
			ON vs.id = vssc.service_id
			JOIN #__sdi_sys_servicecompliance sc
			ON sc.id = vssc.servicecompliance_id
			JOIN #__sdi_sys_serviceversion sv
			ON sv.id = sc.serviceversion_id
			WHERE ps.id = ' . $physicalServiceID . '
			AND vs.id = ' . $virtualServiceID . '
			ORDER BY sv.ordering DESC
			LIMIT 0,1;
		');
		try {
			$db->execute();
			return $db->loadResult();
		}
		catch (JDatabaseException $e) {
			$je = new JException($e->getMessage());
			$this->setError($je);
			return null;
		}
	}
	
}
