<?php
/**
* @version     4.5.2
* @package     com_easysdi_processing
* @copyright   Copyright (C) 2013-2019. All rights reserved.
* @license     GNU General Public License version 3 or later; see LICENSE.txt
* @author      EasySDI Community <contact@easysdi.org> - http://www.easysdi.org
*/
// no direct access
defined('_JEXEC') or die;

JHtml::addIncludePath(JPATH_COMPONENT . '/helpers/html');
JHtml::_('behavior.tooltip');
JHtml::_('behavior.formvalidation');
JHtml::_('formbehavior.chosen', 'select');
JHtml::_('behavior.keepalive');

// Import CSS
$document = JFactory::getDocument();
$document->addScript(Juri::root(true) . '/components/com_easysdi_core/libraries/easysdi/view/view.js?v=' . sdiFactory::getSdiFullVersion());
$document->addScript(Juri::root(true) . '/components/com_easysdi_processing/assets/js/params_editor.js?v=' . sdiFactory::getSdiFullVersion());
?>
<script type="text/javascript">
    js = jQuery.noConflict();
     js(document).ready(function(){
        enableAccessScope();
    });
    Joomla.submitbutton = function(task)
    {
        if(task == 'processing.cancel'){
            Joomla.submitform(task, document.getElementById('processing-form'));
        }
        else{

            if (task != 'processing.cancel' && document.formvalidator.isValid(document.id('processing-form'))) {

                Joomla.submitform(task, document.getElementById('processing-form'));
            }
            else {
                alert('<?php echo $this->escape(JText::_('JGLOBAL_VALIDATION_FORM_FAILED')); ?>');
            }
        }
    }
</script>

<form action="<?php echo JRoute::_('index.php?option=com_easysdi_processing&layout=edit&id=' . (int) $this->item->id); ?>" method="post" enctype="multipart/form-data" name="adminForm" id="processing-form" class="form-validate">
   <div class="row-fluid">
        <div class="span10 form-horizontal">
            <ul class="nav nav-tabs">
                <li class="active"><a href="#details" data-toggle="tab"><?php echo empty($this->item->id) ? JText::_('COM_EASYSDI_PROCESSING_TAB_NEW') : JText::sprintf('COM_EASYSDI_PROCESSING_TAB_EDIT', $this->item->id); ?></a></li>
                <li><a href="#params-tab" data-toggle="tab"><?php echo JText::_('COM_EASYSDI_PROCESSING_TAB_PARAMS'); ?></a></li>
                <li><a href="#publishing" data-toggle="tab"><?php echo JText::_('COM_EASYSDI_PROCESSING_TAB_PUBLISHING'); ?></a></li>
                <?php if (JFactory::getUser()->authorise('core.admin', 'easysdi_processing')): ?>
                    <!--<li><a href="#permissions" data-toggle="tab"><?php echo JText::_('COM_EASYSDI_PROCESSING_TAB_RULES'); ?></a></li>-->
                <?php endif ?>
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
                </div>

                <div class="tab-pane" id="params-tab">
                    <?php foreach ($this->form->getFieldset('params-tab') as $field): ?>
                        <div class="control-group" id="<?php echo $field->fieldname; ?>">
                            <div class="control-label"><?php echo $field->label; ?></div>
                            <div class="controls"><?php echo $field->input; ?></div>
                        </div>
                    <?php endforeach; ?>
                </div>

                <div class="tab-pane" id="publishing">
                    <?php foreach ($this->form->getFieldset('publishing') as $field): ?>
                        <div class="control-group" id="<?php echo $field->fieldname; ?>">
                            <div class="control-label"><?php echo $field->label; ?></div>
                            <div class="controls"><?php echo $field->input; ?></div>
                        </div>
                    <?php endforeach; ?>
                </div>

                <!--<?php if (JFactory::getUser()->authorise('core.admin', 'easysdi_shop')): ?>
                    <div class="tab-pane" id="permissions">
                        <fieldset>
                            <?php echo $this->form->getInput('rules'); ?>
                        </fieldset>
                    </div>
                <?php endif; ?>-->
            </div>
        </div>

        <div class="clr"></div>

        <?php foreach ($this->form->getFieldset('hidden') as $field): ?>
            <?php echo $field->input; ?>
        <?php endforeach; ?>

        <input type="hidden" name="task" value="" />
        <?php echo JHtml::_('form.token'); ?>

        <!-- Begin Sidebar -->
        <div class="span2">
            <h4><?php echo JText::_('JDETAILS'); ?></h4>
            <hr />
            <fieldset class="form-vertical">
                <div class="control-group">
                    <?php if (JFactory::getUser()->authorise('core.edit.state', 'easysdi_shop')): ?>
                        <div class="control-label">
                            <?php echo $this->form->getLabel('state'); ?>
                        </div>
                        <div class="controls">
                            <?php echo $this->form->getInput('state'); ?>
                        </div>
                    <?php endif; ?>
                </div>

                <div class="control-group">
                    <div class="control-label">
                        <?php echo $this->form->getLabel('access'); ?>
                    </div>
                    <div class="controls">
                        <?php echo $this->form->getInput('access'); ?>
                    </div>
                </div>
            </fieldset>
        </div>
        <!-- End Sidebar -->
    </div>
</form>