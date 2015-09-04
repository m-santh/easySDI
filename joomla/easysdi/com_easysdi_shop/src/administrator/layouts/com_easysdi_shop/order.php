<?php
/**
 * @version     4.3.2
 * @package     com_easysdi_shop
 * @copyright   Copyright (C) 2013-2015. All rights reserved.
 * @license     GNU General Public License version 3 or later; see LICENSE.txt
 * @author      EasySDI Community <contact@easysdi.org> - http://www.easysdi.org
 */
$item = $displayData['item'];
$form = $displayData['form'];
$viewType = $displayData['viewType'];
$authorizeddiffusion = isset($displayData['authorizeddiffusion']) ? $displayData['authorizeddiffusion'] : array();
$managedOrganismsDiffusion = isset($displayData['managedOrganismsDiffusion']) ? $displayData['managedOrganismsDiffusion'] : array();

$app = JFactory::getApplication();
$doc = JFactory::getDocument();

$cleanuporderdelay = $app->getParams('com_easysdi_shop')->get('cleanuporderdelay');

$showPricing = isset($item->basket->pricing) && $item->basket->pricing->isActivated;

// show the action column only if: 1) the order type is an order and the view is for the client OR 2) the view is for provider
$showActions = ($item->ordertype_id == Easysdi_shopHelper::ORDERTYPE_ORDER && $viewType == Easysdi_shopHelper::ORDERVIEW_ORDER) ||
        $viewType == Easysdi_shopHelper::ORDERVIEW_REQUEST;

$hasThirdParty = isset($item->basket->thirdparty) && $item->basket->thirdparty != 0;

if (!$showPricing) {
    $doc->addStyleDeclaration('   .price_column{ display : none; }');
}
if (!$showActions) {
    $doc->addStyleDeclaration('   .action_column{ display : none; }');
}
?>
<div>

    <?php
    if ($item->basket->extent->id == 1 || $item->basket->extent->id == 2):
        echo $form->getInput('perimeter', null, $item->basket->extent->features);
    else :
        foreach ($item->basket->perimeters as $perimeter):
            if ($perimeter->id == $item->basket->extent->id):
                echo $form->getInput('wfsfeaturetypefieldid', null, $perimeter->featuretypefieldid);
                echo $form->getInput('wfsfeaturetypename', null, $perimeter->featuretypename);
                echo $form->getInput('wfsurl', null, $perimeter->wfsurl);
                echo $form->getInput('wfsnamespace', null, $perimeter->namespace);
                echo $form->getInput('wfsprefix', null, $perimeter->prefix);
                echo $form->getInput('wfsfeaturetypefieldgeometry', null, $perimeter->featuretypefieldgeometry);
                break;
            endif;
        endforeach;
        ?>
        <?php echo $form->getInput('wfsperimeter', null, json_encode($item->basket->extent->features)); ?>
    <?php endif; ?>

    <div class="row-fluid ">
        <h2 id="sdi-order-recap-type-and-name"><?php echo JText::_($item->ordertype) . ' : ' . $item->id . ' - ' . $item->basket->name; ?></h2>
        <div id="sdi-order-recap-created" class="row-fluid" >
            <div class="span4 order-edit-label" >
                <?php echo JText::_('COM_EASYSDI_SHOP_FORM_LBL_ORDER_CREATED'); ?>
            </div>
            <div class="span8 order-edit-value" >
                <?php echo JHtml::date($item->created, JText::_('DATE_FORMAT_LC2')); ?>
            </div>
        </div>

        <?php
        if ($item->orderstate_id == Easysdi_shopHelper::ORDERSTATE_ARCHIVED ||
                $item->orderstate_id == Easysdi_shopHelper::ORDERSTATE_HISTORIZED ||
                $item->orderstate_id == Easysdi_shopHelper::ORDERSTATE_FINISH):
            ?>
            <div id="sdi-order-recap-completed" class="row-fluid" >
                <div class="span4 order-edit-label" >
                    <?php echo JText::_('COM_EASYSDI_SHOP_ORDER_COMPLETED'); ?>
                </div>
                <div class="span8 order-edit-value" >
                    <?php echo JHtml::date($item->completed, JText::_('DATE_FORMAT_LC2')); ?>
                </div>
            </div>
        <?php endif; ?>

        <div id="sdi-order-recap-orderstate" class="row-fluid">
            <div class="span4 order-edit-label" >
                <?php echo JText::_('COM_EASYSDI_SHOP_FORM_LBL_ORDER_ORDERSTATE_ID'); ?>
            </div>
            <div class="span8 order-edit-value" >
                <?php echo Easysdi_shopHelper::getOrderStatusLabel($item, $item->basket); ?>
            </div>
        </div>

        <?php if (!is_null($item->validated) && strlen($item->validated_reason) > 0): ?>
            <div id="sdi-order-recap-validated-reason" class="row-fluid">
                <div class="span4 order-edit-label" >
                    <?php echo JText::_('COM_EASYSDI_SHOP_FORM_LBL_ORDER_VALIDATED_REASON'); ?>
                </div>
                <div class="span8 order-edit-value" >
                    <span class="<?php echo $item->orderstate_id == Easysdi_shopHelper::ORDERSTATE_REJECTED_SUPPLIER || $item->orderstate_id == Easysdi_shopHelper::ORDERSTATE_REJECTED ? 'text-error' : ''; ?>">
                        <?php echo nl2br($item->validated_reason); ?>
                    </span>
                </div>
            </div>
        <?php endif; ?>

        <div id="sdi-order-recap-ordertype" class="row-fluid">
            <div class="span4 order-edit-label" >
                <?php echo JText::_('COM_EASYSDI_SHOP_FORM_LBL_ORDER_ORDERTYPE_ID'); ?>
            </div>
            <div class="span8 order-edit-value" >
                <?php echo JText::_($item->ordertype); ?>
            </div>
        </div>
    </div>


    <!-- client's and thirdparty's informations -->
    <div class="row-fluid ">
        <!-- client -->
        <div id="sdi-order-recap-clientblock" class="<?php echo $hasThirdParty ? 'span6' : 'span12' ?>" >
            <h3><?php echo JText::_('COM_EASYSDI_SHOP_ORDER_CLIENT_TITLE'); ?></h3>
            <div id="sdi-order-recap-cloent-name" class="row-fluid">
                <div class="span4 order-edit-label" >
                    <?php echo JText::_('COM_EASYSDI_SHOP_ORDER_CLIENT_NAME'); ?>
                </div>
                <div class="span8 order-edit-value" >
                    <span title="<?php echo JText::_('COM_EASYSDI_SHOP_ORDER_CLIENT_ORGANISM') . ' : ' . $item->basket->sdiUser->getMemberOrganisms()[0]->name ?>" class="hasTip">
                        <?php echo $item->basket->sdiUser->name; ?>
                    </span>
                </div>
            </div>
            <div id="sdi-order-recap-client-organism" class="row-fluid">
                <div class="span4 order-edit-label" >
                    <?php echo JText::_('COM_EASYSDI_SHOP_ORDER_CLIENT_ORGANISM'); ?>
                </div>
                <div class="span8 order-edit-value" >
                    <span title="<?php echo JText::_('COM_EASYSDI_SHOP_ORDER_CLIENT_NAME') . ' : ' . $item->basket->sdiUser->name; ?>" class="hasTip">
                        <?php echo $item->basket->sdiUser->getMemberOrganisms()[0]->name; ?>
                    </span>
                </div>
            </div>            
        </div>
        <?php if ($hasThirdParty): ?>
            <!-- thirdparty -->
            <div id="sdi-order-recap-thirdpartyblock" class="span6 sdi-order-thirdpartyblock tripadty-id-<?php echo $item->basket->thirdparty; ?> " >
                <h3><?php echo JText::_('COM_EASYSDI_SHOP_ORDER_THIRDPARTY_TITLE'); ?></h3>
                <div id="sdi-order-recap-thirdparty-organism" class="row-fluid">
                    <div class="span4 order-edit-label" >
                        <?php echo JText::_('COM_EASYSDI_SHOP_ORDER_THIRDPARTY_ORGANISM'); ?>
                    </div>
                    <div class="span8 order-edit-value" >
                        <?php echo $item->basket->thirdorganism; ?>
                    </div>
                </div>
                <div id="sdi-order-recap-thirdparty-contact" class="row-fluid">
                    <div class="span4 order-edit-label" >
                        <?php echo JText::_('COM_EASYSDI_SHOP_ORDER_THIRDPARTY_MANDATE_CONTACT'); ?>
                    </div>
                    <div class="span8 order-edit-value" >
                        <?php echo $item->basket->mandate_contact; ?>
                    </div>
                </div>
                <div id="sdi-order-recap-thirdparty-mail" class="row-fluid">
                    <div class="span4 order-edit-label" >
                        <?php echo JText::_('COM_EASYSDI_SHOP_ORDER_THIRDPARTY_MANDATE_EMAIL'); ?>
                    </div>
                    <div class="span8 order-edit-value" >
                        <?php echo $item->basket->mandate_email; ?>
                    </div>
                </div>
                <div id="sdi-order-recap-thirdparty-mandateref" class="row-fluid">
                    <div class="span4 order-edit-label" >
                        <?php echo JText::_('COM_EASYSDI_SHOP_ORDER_THIRDPARTY_MANDATE_REF'); ?>
                    </div>
                    <div class="span8 order-edit-value" >
                        <?php echo $item->basket->mandate_ref; ?>
                    </div>
                </div>
            </div>
        <?php endif; ?>
    </div>


    <!-- order perimter -->
    <?php Easysdi_shopHelper::getHTMLOrderPerimeter($item, $viewType == Easysdi_shopHelper::ORDERVIEW_REQUEST); ?>


    <!-- order products -->
    <div class="row-fluid shop-product">
        <h2><?php
    switch ($viewType) {
        case Easysdi_shopHelper::ORDERVIEW_ORDER:
            echo JText::_('COM_EASYSDI_SHOP_ORDER_EXTRACTION_NAME_VIEW_ORDER');
            break;
        case Easysdi_shopHelper::ORDERVIEW_REQUEST:
            echo JText::_('COM_EASYSDI_SHOP_ORDER_EXTRACTION_NAME_VIEW_REQUEST');
            break;
        case Easysdi_shopHelper::ORDERVIEW_VALIDATION:
            echo JText::_('COM_EASYSDI_SHOP_ORDER_EXTRACTION_NAME_VIEW_VALID');
            break;
    }
    ?></h2>

        <?php foreach ($item->basket->extractions as $supplier_id => $supplier): ?>
            <?php
            //To only display a supplier if user has product inside
            $hasEditModeProducts = false;
            foreach ($supplier->items as $productItem) {
                if (in_array($productItem->id, $authorizeddiffusion)) {
                    $hasEditModeProducts = true;
                    break;
                }
            }

            //Show All products, except in case of Request view (only products with extraction rights)
            if (
                    $viewType == Easysdi_shopHelper::ORDERVIEW_ORDER || $viewType == Easysdi_shopHelper::ORDERVIEW_VALIDATION ||
                    $viewType == Easysdi_shopHelper::ORDERVIEW_REQUEST && ($hasEditModeProducts || in_array($supplier_id, $managedOrganismsDiffusion))
            ) :
                ?>

                <table class="table table-striped" rel="<?php echo $supplier_id; ?>">
                    <thead>
                        <tr>
                            <td class="product_column" ><h4><?php echo JText::plural('COM_EASYSDI_SHOP_BASKET_DATA_SUPPLIER', count($supplier->items)) . ' : ' . $supplier->name; ?></h4></td>
                            <td class="price_column"><h4><?php echo JText::_('COM_EASYSDI_SHOP_PRICES_TTC'); ?></h4></td>
                            <td class="action_column action_column_recap">&nbsp;</td>
                        </tr>
                    </thead>
                    <tbody>
                        <?php
                        foreach ($supplier->items as $productItem):
                            $editMode = $viewType == Easysdi_shopHelper::ORDERVIEW_REQUEST ? in_array($productItem->id, $authorizeddiffusion) : false;

                            $textColorClass = ' ';
                            $isCompleted = false;
                            $isRejected = false;
                            switch ($productItem->productstate_id) {
                                case Easysdi_shopHelper::PRODUCTSTATE_AVAILABLE:
                                case Easysdi_shopHelper::PRODUCTSTATE_DELETED:
                                    $textColorClass = ' text-success ';
                                    $isCompleted = true;
                                    break;
                                case Easysdi_shopHelper::PRODUCTSTATE_REJECTED_SUPPLIER:
                                case Easysdi_shopHelper::PRODUCTSTATE_REJECTED_TP:
                                    $textColorClass = ' text-error ';
                                    $isRejected = true;
                                    break;
                            }
                            ?>
                            <tr rel="<?php echo $productItem->id; ?>">
                                <td class="product_column">
                                    <input type = "hidden" name = "jform[diffusion][]" value = "<?php echo $productItem->id; ?>" />
                                    <a href="<?php echo JRoute::_('index.php?option=com_easysdi_catalog&view=sheet&guid=' . $productItem->metadataguid); ?>"><?php echo $productItem->name; ?></a><br/>

                                    <div class="shop-basket-product-details">

                                        <ul class="product_properties">
                                            <?php foreach ($productItem->properties as $property): ?>
                                                <li id="shop-basket-property-id-<?php echo $property->id; ?>"><span class="shop-basket-property-name"><?php echo $property->name; ?> :</span> 
                                                    <?php
                                                    $c = count($property->values);
                                                    $i = 0;
                                                    foreach ($property->values as $value):
                                                        ?>

                                                        <span class="shop-basket-property-value"><?php
                                    echo empty($value->value) ? $value->name : $value->value;
                                                        ?></span><?php
                                                            $i++;
                                                            if ($i < $c)
                                                                echo ', ';
                                                        endforeach;
                                                        ?>
                                                </li>
                                            <?php endforeach; ?>
                                        </ul>

                                        <?php
                                        if ($viewType == Easysdi_shopHelper::ORDERVIEW_REQUEST && $productItem->productstate_id == Easysdi_shopHelper::PRODUCTSTATE_SENT) :
                                            //product needs a response and view is Request 
                                            ?>

                                            <div class="shop-basket-product-fileupload"><i class="icon icon-paperclip"> </i> <input type="file" name="jform[file][<?php echo $productItem->id; ?>][]" id="file_<?php echo $productItem->id; ?>" <?php if (!$editMode): ?>disabled="disabled"<?php endif; ?>></div>                                                                             
                                            <div class="shop-basket-product-remark-field"><i class="icon icon-comment"> </i>
                                                <textarea class="sdi-provider-remark-field" id="remark_<?php echo $productItem->id; ?>" name="jform[remark][<?php echo $productItem->id; ?>]" rows="4" placeholder="<?php echo JText::_('COM_EASYSDI_SHOP_ORDER_REMARK_PLACEHOLDER'); ?>" <?php if (!$editMode): ?>readonly="readonly"<?php endif; ?>></textarea>
                                            </div>
                                            <?php
                                        elseif ($isCompleted || $isRejected) :
                                            // product has a response
                                            ?>
                                            <span class="<?php echo $textColorClass; ?> shop-basket-product-completed-date"><i class="icon icon-checkmark"> </i> <?php echo JText::sprintf('COM_EASYSDI_SHOP_ORDER_PRODUCT_COMPLETED_ON', JHtml::date($productItem->completed, JText::_('DATE_FORMAT_LC2'))); ?></span><br/>
                                            <?php if (isset($productItem->remark) && strlen($productItem->remark) > 0) : ?>
                                                <span class="<?php echo $textColorClass; ?> shop-basket-product-remark"><i class="icon icon-comment"> </i> <?php echo JText::_('COM_EASYSDI_SHOP_ORDER_PRODUCT_REMARK'); ?></span><span class="shop-basket-product-remark-content"><?php echo $productItem->remark; ?></span>
                                                <?php
                                            endif;
                                        endif;
                                        ?>

                                    </div>

                                </td>
                                <td class="price_column">

                                    <?php
                                    $product = $item->basket->pricing->suppliers[$supplier_id]->products[$productItem->id];

                                    if ($viewType == Easysdi_shopHelper::ORDERVIEW_REQUEST && $productItem->productstate_id == Easysdi_shopHelper::PRODUCTSTATE_SENT) :
                                        if ($product->cfg_pricing_type == Easysdi_shopHelper::PRICING_FREE):
                                            ?>
                                            <input type="text" id="disabled_fee_<?php echo $productItem->id; ?>" name="jform[disabled_fee][<?php echo $productItem->id; ?>]" value="0" placeholder="0" readonly="readonly" class="input-small hasTip" title="<?php echo JText::_('COM_EASYSDI_SHOP_BASKET_PRODUCT_FREE'); ?>"/>
                                        <?php else: ?>
                                            <input type="text" id="fee_<?php echo $productItem->id; ?>" name="jform[fee][<?php echo $productItem->id; ?>]" placeholder="<?php echo JText::_('COM_EASYSDI_SHOP_ORDER_PRICE_FIELD_PLACEHOLDER'); ?>" <?php if (!$editMode): ?>readonly="readonly"<?php endif; ?>/>
                                        <?php
                                        endif;
                                    else :

                                        if ($product->cfg_pricing_type == Easysdi_shopHelper::PRICING_FREE):
                                            echo JText::_('COM_EASYSDI_SHOP_BASKET_PRODUCT_FREE');
                                        else:
                                            $productPrice = isset($product->cal_total_amount_ti) ? $product->cal_total_amount_ti : '-';

                                            echo Easysdi_shopHelper::priceFormatter($productPrice);

                                            $rebate = false;
                                            $as = '';
                                            $discount = '';
                                            if ($product->cfg_pct_category_profile_discount > 0 || $product->cfg_pct_category_supplier_discount > 0) {
                                                $rebate = true;
                                                if ($product->cfg_pct_category_supplier_discount > $product->cfg_pct_category_profile_discount) {
                                                    $as = $product->ind_lbl_category_supplier_discount;
                                                    $discount = $product->cfg_pct_category_supplier_discount;
                                                } else {
                                                    $as = $product->ind_lbl_category_profile_discount;
                                                    $discount = $product->cfg_pct_category_profile_discount;
                                                }
                                            }
                                            ?>
                                            <i class="icon-white icon-info hasTooltip" 
                                               title="<?php echo JText::sprintf('COM_EASYSDI_SHOP_BASKET_TOOLTIP_REBATE_INFO', $as, $discount); ?>"
                                               style="<?php if (!$rebate): ?>display:none;<?php endif; ?>">
                                            </i>

                                        <?php endif; ?>

                                    <?php
                                    endif;
                                    ?>
                                </td>


                                <td class="action_column action_column_recap">
                                    <?php
                                    if ($viewType == Easysdi_shopHelper::ORDERVIEW_REQUEST && $productItem->productstate_id == Easysdi_shopHelper::PRODUCTSTATE_SENT) :
                                        // product need a response
                                        ?>
                                        <button class="btn btn-success sdi-btn-upload-order-response" onclick="Joomla.submitbutton('request.save')" <?php if (!$editMode): ?>disabled="disabled"<?php endif; ?>>
                                            <span class="icon icon-upload"></span>
                                            Envoyer</button>
                                        <button class="btn btn-danger btn-mini sdi-btn-cancel-order-response" onclick="" <?php if (!$editMode): ?>disabled="disabled"<?php endif; ?>>
                                            Annuler</button>

                                        <!--
                                        <i class="icon icon-paperclip"> </i> <input type="file" name="jform[file][<?php echo $productItem->id; ?>][]" id="file_<?php echo $productItem->id; ?>" <?php if (!$editMode): ?>disabled="disabled"<?php endif; ?>><br/>
                                        -->
                                        <?php
                                    elseif ($productItem->productstate_id == Easysdi_shopHelper::PRODUCTSTATE_AVAILABLE && !empty($productItem->file)) :
                                        // file is downloadable

                                        $cmplDate = new JDate($productItem->completed);
                                        $cmplDate->modify('+' . $cleanuporderdelay . ' days');
                                        ?>
                                        <?php
                                        if ($viewType == Easysdi_shopHelper::ORDERVIEW_REQUEST):
                                            //link for provider
                                            ?>
                                            <a target="RAW" href="index.php?option=com_easysdi_shop&task=order.download&id=<?php echo $productItem->id; ?>&order=<?php echo $item->id; ?>" class="hasTip" onClick="" title="<?php echo $productItem->file . ' (' . Easysdi_shopHelper::getHumanReadableFilesize($productItem->size) . ')'; ?>">
                                                <?php echo JText::_('COM_EASYSDI_SHOP_ORDER_CHECK_FILE'); ?>
                                            </a>

                                            <?php
                                        else:
                                            //link for client
                                            ?>
                                            <a target="RAW" href="index.php?option=com_easysdi_shop&task=order.download&id=<?php echo $productItem->id; ?>&order=<?php echo $item->id; ?>" class="btn btn-success hasTip" onClick="" title="<?php echo $productItem->file . ' (' . Easysdi_shopHelper::getHumanReadableFilesize($productItem->size) . ')'; ?>">
                                                <i class="icon-white icon-download"> </i> <?php echo JText::_('COM_EASYSDI_SHOP_ORDER_DOWLOAD_BTN'); ?>
                                            </a>
                                        <?php endif; ?>


                                        <br/>
                                        <small class="sdi-product-download-timeleft"><?php echo JText::sprintf('COM_EASYSDI_SHOP_ORDER_DOWLOAD_TIME_LEFT', JHtml::date($cmplDate, JText::_('DATE_FORMAT_LC3'))); ?></small>                                    

                                        <?php
                                    elseif (!$isCompleted && !$isRejected) :
                                        //file is not ready yet
                                        ?>
                                        <button class="btn disabled" disabled="disabled" onclick="">
                                            <i class="icon-white icon-download"> </i> <?php echo JText::_('COM_EASYSDI_SHOP_ORDER_DOWLOAD_BTN'); ?>
                                        </button><br/>
                                        <small class="sdi-product-download-timeleft"><?php echo JText::_('COM_EASYSDI_SHOP_ORDER_DOWLOAD_AWAIT'); ?></small>
                                        <?php
                                    elseif ($productItem->productstate_id == Easysdi_shopHelper::PRODUCTSTATE_DELETED) :
                                        //file has been removed (retention passed)
                                        ?>
                                        <button class="btn disabled hide" disabled="disabled" onclick="">
                                            <i class="icon-white icon-download"> </i> <?php echo JText::_('COM_EASYSDI_SHOP_ORDER_DOWLOAD_BTN'); ?>
                                        </button><br/>
                                        <small class="sdi-product-download-timeleft"><?php echo JText::plural('COM_EASYSDI_SHOP_ORDER_DOWLOAD_RETENTION_EXCEEDED', $cleanuporderdelay); ?></small>
                                    <?php endif; ?>                                    
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td class="price_title_column price_title_fixed_fees"><?php echo JText::_('COM_EASYSDI_SHOP_BASKET_TAX'); ?></td>
                            <td class="price_column supplier_cal_fee_ti"><?php echo isset($item->basket->pricing->suppliers[$supplier_id]->cal_fee_ti) ? Easysdi_shopHelper::priceFormatter($item->basket->pricing->suppliers[$supplier_id]->cal_fee_ti) : '-'; ?></td>
                            <td class="action_column action_column_recap">&nbsp;</td>
                        </tr>
                        <tr style="<?php if ($viewType == Easysdi_shopHelper::ORDERVIEW_REQUEST): ?>display:none;<?php endif; ?>">
                            <td class="price_title_column price_title_provider_total"><?php echo JText::_('COM_EASYSDI_SHOP_BASKET_SUPPLIER_SUBTOTAL'); ?></td>
                            <td class="price_column supplier_cal_total_amount_ti"><?php echo isset($item->basket->pricing->suppliers[$supplier_id]->cal_total_amount_ti) ? Easysdi_shopHelper::priceFormatter($item->basket->pricing->suppliers[$supplier_id]->cal_total_amount_ti) : '-'; ?></td>
                            <td class="action_column action_column_recap">&nbsp;</td>
                        </tr>
                        <tr style="<?php if ($viewType == Easysdi_shopHelper::ORDERVIEW_REQUEST): ?>display:none;<?php endif; ?>">
                            <td class="price_title_column price_title_provider_discount"><?php echo JText::_('COM_EASYSDI_SHOP_BASKET_SUPPLIER_REBATE'); ?></td>
                            <td class="price_column supplier_cal_total_rebate_ti"><?php echo isset($item->basket->pricing->suppliers[$supplier_id]->cal_total_rebate_ti) ? Easysdi_shopHelper::priceFormatter($item->basket->pricing->suppliers[$supplier_id]->cal_total_rebate_ti) : '-'; ?></td>
                            <td class="action_column action_column_recap">&nbsp;</td>
                        </tr>
                    </tfoot>
                </table>
            <?php endif; ?>
        <?php endforeach; ?>
        <!-- TOTAL -->
        <table class="table table-striped" id='pricingTotal-table' style="<?php if (!$showPricing || $viewType == Easysdi_shopHelper::ORDERVIEW_REQUEST): ?>display:none;<?php endif; ?>">
            <thead>
                <tr>
                    <td><h4><?php echo JText::_('COM_EASYSDI_SHOP_BASKET_PLATFORM'); ?></h4></td>
                    <td class="price_column">&nbsp;</td>
                    <td class="action_column action_column_recap">&nbsp;</td>
                </tr>
            </thead>
            <tbody></tbody>
            <tfoot>
                <tr>
                    <td><?php echo JText::_('COM_EASYSDI_SHOP_BASKET_FEE'); ?></td>
                    <td class="price_column">
                        <span class="pricingFeeTI"><?php echo isset($item->basket->pricing->cal_fee_ti) ? Easysdi_shopHelper::priceFormatter($item->basket->pricing->cal_fee_ti) : '-'; ?></span>
                    </td>
                    <td class="action_column action_column_recap">&nbsp;</td>
                </tr>
                <tr>
                    <td><?php echo JText::_('COM_EASYSDI_SHOP_BASKET_TOTAL'); ?></td>
                    <td class="price_column">
                        <span class="pricingTotalAmountTI"><?php echo!isset($item->basket->pricing->cal_total_amount_ti) ? '-' : Easysdi_shopHelper::priceFormatter($item->basket->pricing->cal_total_amount_ti); ?></span>
                    </td>
                    <td class="action_column action_column_recap">&nbsp;</td>
                </tr>
            </tfoot>
        </table>
        <!-- ENDOF TOTAL -->
    </div>
</div>

