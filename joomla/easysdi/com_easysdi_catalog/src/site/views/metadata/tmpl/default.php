<?php
/**
 * @version     4.0.0
 * @package     com_easysdi_catalog
 * @copyright   Copyright (C) 2013. All rights reserved.
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 * @author      EasySDI Community <contact@easysdi.org§> - http://www.easysdi.org
 */
// no direct access
defined('_JEXEC') or die;

JHtml::_('behavior.keepalive');
JHtml::_('behavior.tooltip');
JHtml::_('behavior.formvalidation');
JHtml::_('formbehavior.chosen', 'select');

//Load admin language file
$lang = JFactory::getLanguage();
$lang->load('com_easysdi_catalog', JPATH_ADMINISTRATOR);
?>

<style>

    .inner-fds{
        padding-left:15px;
        border-left: 1px solid #BDBDBD;
    }

    .collapse-btn, .neutral-btn{
        cursor: pointer;
        margin-right: 10px;
    }

    .neutral-btn{
        margin-right: 10px;
    }

    .add-btn, .remove-btn{
        cursor: pointer;
        margin-left: 10px;
    }

    legend{
        font-size: 12px;
    }

</style>

<script type="text/javascript">
    js = jQuery.noConflict();

    js('document').ready(function() {

<?php foreach ($this->validators as $validator) { 
    
     echo $validator;
    
} ?>


        js('#btn_toogle_all').click(function() {
            var btn = js(this);

            if (btn.attr('action') == 'open') {
                btn.text('Tout fermer');
                js('.inner-fds').show();
                js('.collapse-btn').attr({'src': '/joomla/administrator/components/com_easysdi_catalog/assets/images/collapse_top.png'});
                btn.attr({'action': 'close'});
            } else {
                btn.text('Tout ouvrir');
                js('.inner-fds').hide();
                js('.collapse-btn').attr({'src': '/joomla/administrator/components/com_easysdi_catalog/assets/images/expand.png'});
                btn.attr({'action': 'open'});
            }


        });

    });

    function collapse(id) {

        var uuid = getUuid('collapse-btn-', id);
        var current_div = js('#inner-fds-' + uuid);
        var current_btn = js('#' + id);

        current_div.toggle('fast', function() {
            if (current_div.css('display') == 'none') {
                current_btn.attr({'src': '/joomla/administrator/components/com_easysdi_catalog/assets/images/expand.png'});
            } else {
                current_btn.attr({'src': '/joomla/administrator/components/com_easysdi_catalog/assets/images/collapse_top.png'});
            }
        });
    }

    function addFieldset(id, idwi, lowerbound, upperbound) {
        var uuid = getUuid('add-btn-', id);

        js.get('http://localhost/joomla/index.php/ajax?uuid=' + uuid, function(data) {
            js('.outer-fds-' + idwi).last().after(data);

            var occurance = getOccuranceCount('.outer-fds-' + idwi);

            if (upperbound > occurance) {
                js('.add-btn-' + idwi).show();
            }

            if (occurance > lowerbound) {
                js('.remove-btn-' + idwi).show();
            }

            if (upperbound == occurance) {
                js('.add-btn-' + idwi).hide();
            }
        });


    }

    function removeFieldset(id, idwi, lowerbound, upperbound) {
        var uuid = getUuid('remove-btn-', id);

        var toRemove = js('#outer-fds-' + uuid);

        toRemove.remove();

        var occurance = getOccuranceCount('.outer-fds-' + idwi);

        if (lowerbound == occurance) {
            js('.remove-btn-' + idwi).hide();
        }

        if (upperbound > occurance) {
            js('.add-btn-' + idwi).show();
        }
    }

    /**
     * 
     * @param {string} prefix
     * @param {string} string
     * @returns {array}
     */
    function getUuid(prefix, string) {
        string = string.replace(prefix, '');
        return string;
    }

    function getOccuranceCount(className) {
        var nbr = js(className).length;
        return nbr - 1;
    }

</script>

<div class="metadata-edit front-end-edit">
    <button id="btn_toogle_all" action="open" class="btn">Tout ouvrir</button>
    <h2><?php echo JText::_('COM_EASYSDI_CATALOGE_TITLE_EDIT_METADATA') . ' ' . $this->item->guid; ?></h2>

    <form id="form-metadata" action="<?php echo JRoute::_('index.php?option=com_easysdi_catalog&task=metadata.save'); ?>" method="post" class="form-validate form-horizontal" enctype="multipart/form-data">
        <?php foreach ($this->form->getFieldset('hidden') as $field): ?>
            <?php echo $field->input; ?>
        <?php endforeach; ?>
        <div class ="well">

            <?php //echo htmlspecialchars($this->item->csw);   ?>

            <?php echo $this->formHtml; ?>

        </div>

        <div>
            <button type="submit" class="validate"><span><?php echo JText::_('JSUBMIT'); ?></span></button>
                    <?php echo JText::_('or'); ?>
            <a href="<?php echo JRoute::_('index.php?option=com_easysdi_catalog&task=metadata.cancel'); ?>" title="<?php echo JText::_('JCANCEL'); ?>"><?php echo JText::_('JCANCEL'); ?></a>

            <input type="hidden" name="option" value="com_easysdi_catalog" />
            <input type="hidden" name="task" value="metadata.save" />
            <?php echo JHtml::_('form.token'); ?>
        </div>
    </form>
</div>
