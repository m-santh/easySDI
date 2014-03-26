<?php
/**
 * @version     4.0.0
 * @package     com_easysdi_map
 * @copyright   Copyright (C) 2013. All rights reserved.
 * @license     GNU General Public License version 3 or later; see LICENSE.txt
 * @author      EasySDI Community <contact@easysdi.org> - http://www.easysdi.org
 */
// no direct access
defined('_JEXEC') or die;

JHtml::_('behavior.keepalive');
JHtml::_('behavior.tooltip');
JHtml::_('behavior.formvalidation');
JHtml::_('formbehavior.chosen', 'select');

$document = JFactory::getDocument();
$document->addScript('administrator/components/com_easysdi_core/libraries/easysdi/view/view.js')
?>


<script type="text/javascript">
    js = jQuery.noConflict();
    js(document).ready(function() {
        enableAccessScope();

    });




    Joomla.submitbutton = function(task)
    {
        if (task == 'visualization.cancel') {
            Joomla.submitform(task, document.getElementById('adminForm'));
        }
        else {

            if (task != 'visualization.cancel' && document.formvalidator.isValid(document.id('adminForm'))) {

                Joomla.submitform(task, document.getElementById('adminForm'));
            }
            else {
                alert('<?php echo $this->escape(JText::_('JGLOBAL_VALIDATION_FORM_FAILED')); ?>');
            }
        }
    }
</script>

<div class="group-edit front-end-edit">
    <?php if (!empty($this->item->id)): ?>
        <h1><?php echo JText::_('COM_EASYSDI_MAP_TITLE_EDIT_VISUALIZATION'); ?></h1>
    <?php else: ?>
        <h1><?php echo JText::_('COM_EASYSDI_MAP_TITLE_NEW_VISUALIZATION'); ?></h1>
    <?php endif; ?>

    <form class="form-horizontal form-inline form-validate" action="<?php echo JRoute::_('index.php?option=com_easysdi_map&task=visualization.save'); ?>" method="post" id="adminForm" name="adminForm" enctype="multipart/form-data">

        <div class="row-fluid">
            <div >
                <ul class="nav nav-tabs">
                    <li class="active"><a href="#details" data-toggle="tab"><?php echo JText::_('COM_EASYSDI_MAP_TAB_DETAILS'); ?></a></li>
                    <li><a href="#publishing" data-toggle="tab"><?php echo JText::_('COM_EASYSDI_MAP_TAB_PUBLISHING'); ?></a></li>
                </ul>

                <div class="tab-content">
                    <!-- Begin Tabs -->
                    <div class="tab-pane active" id="details">
                        <?php foreach ($this->form->getFieldset('details') as $field): ?>
                            <div class="control-group" id="<?php echo $field->fieldname; ?>">
                                <div class="control-label"><?php echo $field->label; ?></div>
                                <div class="controls"><?php echo $field->input; ?></div>
                            </div>
                        <?php endforeach; ?>

                        <fieldset id ="fieldset_view">
                            <legend><?php echo JText::_('COM_EASYSDI_MAP_FORM_FIELDSET_LEGEND_VIEW'); ?></legend>
                            <div class="control-group" id="maplayer_id">
                                <div class="control-label">
                                    <label id="jform_maplayer_id-lbl" for="jform_maplayer_id" class="hasTip" title="<?php echo JText::_('COM_EASYSDI_MAP_FORM_LBL_VISUALIZATION_MAPLAYER_ID'); ?>::<?php echo JText::_('COM_EASYSDI_MAP_FORM_DESC_VISUALIZATION_MAPLAYER_ID'); ?>"><?php echo JText::_('COM_EASYSDI_MAP_FORM_LBL_VISUALIZATION_MAPLAYER_ID'); ?></label>
                                </div>
                                <div class="controls">
                                    <select id="jform_maplayer_id" name="jform[maplayer_id]" class="inputbox" size="1" >
                                        <option value="" ></option>
                                        <?php foreach ($this->authorizedLayers as $maplayer) : ?>
                                            <option value="<?php echo $maplayer->id; ?>" <?php
                                            if (isset($this->item->maplayer_id) && $this->item->maplayer_id == $maplayer->id) : echo 'selected="selected"';
                                            endif;
                                            ?>>
                                            <?php echo $maplayer->name; ?>
                                            </option>
                                        <?php endforeach; ?>
                                    </select>
                                </div>
                            </div>
                        </fieldset>
                    </div>

                    <div class="tab-pane" id="publishing">
                        <?php foreach ($this->form->getFieldset('publishing') as $field): ?>
                            <div class="control-group" id="<?php echo $field->fieldname; ?>">
                                <div class="control-label"><?php echo $field->label; ?></div>
                                <div class="controls"><?php echo $field->input; ?></div>
                            </div>
                        <?php endforeach; ?>
                        <?php if (!empty($this->item->modified_by)) : ?>
                            <?php foreach ($this->form->getFieldset('publishing_update') as $field): ?>
                                <div class="control-group" id="<?php echo $field->fieldname; ?>">
                                    <div class="control-label"><?php echo $field->label; ?></div>
                                    <div class="controls"><?php echo $field->input; ?></div>
                                </div>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>

        <?php foreach ($this->form->getFieldset('hidden') as $field): ?>
            <?php echo $field->input; ?>
        <?php endforeach; ?>  

        <input type = "hidden" name = "task" value = "" />
        <input type = "hidden" name = "option" value = "com_easysdi_map" />
        <?php echo JHtml::_('form.token'); ?>
    </form>

    <?php echo $this->getToolbar(); ?>
</div>
