<?xml version="1.0" encoding="ISO-8859-1"?>
<!--
Script XSLT de g�n�ration des cotisations annuelles des membres de l'ASIT-VD sous Joomla!
Le r�sultat est fourni sous forme de fichier XML-FO pour une g�n�ration PDF
-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:fo="http://www.w3.org/1999/XSL/Format" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
	
	<xsl:decimal-format decimal-separator="." grouping-separator="'"/>
	
	<!-- D�finition des constantes globales -->
	<xsl:variable name="prefix_CHF" select="'Frs. '"/>
	<xsl:variable name="asit_name" select="'ASIT-VD'"/>
	<xsl:variable name="asit_service" select="'Coordination'"/>
	<xsl:variable name="asit_contact" select="'Xavier M�rour'"/>
	<xsl:variable name="asit_address" select='concat("Avenue de l","&apos;","Universit� 5")'/>
	<xsl:variable name="asit_location" select="'CH - 1014 Lausanne'"/>
	<xsl:variable name="asit_phone" select="'+41 21 316 7024'"/>
	<xsl:variable name="asit_fax" select="'+41 21 316 7030'"/>
	<xsl:variable name="asit_email" select="'xavier.merour@asit.vd.ch'"/>
	<xsl:variable name="asit_url" select="'www.asit.vd.ch'"/>
	<xsl:variable name="asit_ccp" select="'10-2429-7'"/>
	<xsl:variable name="fo:layout-master-set">
		<fo:layout-master-set>
			<fo:simple-page-master master-name="default-page" page-height="297mm" page-width="210mm" margin-left="0mm" margin-right="0mm" margin-bottom="0mm" margin-top="0mm" reference-orientation="0">
				<fo:region-body margin-top="0mm" margin-bottom="0mm" margin-left="0mm" margin-right="0mm" font-family="Arial" font-size="10pt"/>
			</fo:simple-page-master>
		</fo:layout-master-set>
	</xsl:variable>
	
	<!-- D�finition des variables globales -->
	<xsl:variable name="amount_base" select="0.00"/>
	<xsl:variable name="amount_proportional" select="0.00"/>
	<xsl:variable name="amount_min" select="100.00"/>
	<xsl:variable name="amount_max" select="0.00"/>
	<xsl:variable name="amount_subtotal" select="0.00"/>
	<xsl:variable name="amount_rebate" select="0.00"/>
	<xsl:variable name="amount_total" select="0.00"/>
	<xsl:variable name="amount_display" select="0.00"/>

	<!-- Template racine -->
	<xsl:template match="/">
		<fo:root>
			<xsl:copy-of select="$fo:layout-master-set"/>
			<fo:page-sequence master-reference="default-page" initial-page-number="1" format="1">
				<fo:flow flow-name="xsl-region-body">
					<xsl:for-each select="asit-vd">
						<xsl:variable name="invoice_date" select="parameters/@date"/>
						<xsl:variable name="invoice_period" select="parameters/@year"/>
						<xsl:variable name="invoice_rebate" select="parameters/@discount"/>
						<xsl:for-each select="account">
							<fo:block>

								<!-- En-t�te facture -->
								<fo:block-container height="30mm" width="170mm" top="10mm" left="20mm" position="absolute" border="1pt" border-style="solid" border-color="silver">
									<fo:block>
										<fo:block-container height="20mm" width="40mm" top="5mm" left="5mm" position="absolute">
											<fo:block>
												<fo:external-graphic src="file:C:\Program Files\Apache Software Foundation\Apache2.2\htdocs\joomla\administrator\components\com_easysdi\img\logo.gif" content-height="20mm" content-width="35mm"/>
											</fo:block>
										</fo:block-container>
										<fo:block-container height="20mm" width="40mm" top="6mm" left="55mm" position="absolute">
											<fo:block text-align="start" line-height="10pt" font-family="arial" font-size="8pt" font-weight="bold"><xsl:value-of select="$asit_name"/></fo:block> 
											<fo:block text-align="start" line-height="10pt" font-family="arial" font-size="8pt" font-weight="bold"><xsl:value-of select="$asit_service"/></fo:block> 
											<fo:block text-align="start" line-height="10pt" font-family="arial" font-size="8pt"><xsl:value-of select="$asit_contact"/></fo:block> 
											<fo:block text-align="start" line-height="10pt" font-family="arial" font-size="8pt"><xsl:value-of select="$asit_address"/></fo:block> 
											<fo:block text-align="start" line-height="10pt" font-family="arial" font-size="8pt"><xsl:value-of select="$asit_location"/></fo:block> 
										</fo:block-container>
										<fo:block-container height="20mm" width="20mm" top="6mm" left="110mm" position="absolute">
											<fo:block text-align="start" line-height="10pt" font-family="arial" font-size="8pt">T�l�phone</fo:block> 
											<fo:block text-align="start" line-height="10pt" font-family="arial" font-size="8pt">Fax</fo:block>
											<fo:block text-align="start" line-height="10pt" font-family="arial" font-size="8pt">Email</fo:block> 
											<fo:block text-align="start" line-height="10pt" font-family="arial" font-size="8pt">Internet</fo:block> 
											<fo:block text-align="start" line-height="10pt" font-family="arial" font-size="8pt">CCP</fo:block> 
										</fo:block-container>
										<fo:block-container height="20mm" width="50mm" top="6mm" left="125mm" position="absolute">
											<fo:block text-align="start" line-height="10pt" font-family="arial" font-size="8pt"><xsl:value-of select="$asit_phone"/></fo:block> 
											<fo:block text-align="start" line-height="10pt" font-family="arial" font-size="8pt"><xsl:value-of select="$asit_fax"/></fo:block> 
											<fo:block text-align="start" line-height="10pt" font-family="arial" font-size="8pt"><xsl:value-of select="$asit_email"/></fo:block> 
											<fo:block text-align="start" line-height="10pt" font-family="arial" font-size="8pt"><xsl:value-of select="$asit_url"/></fo:block> 
											<fo:block text-align="start" line-height="10pt" font-family="arial" font-size="8pt"><xsl:value-of select="$asit_ccp"/></fo:block> 
										</fo:block-container>
									</fo:block>
								</fo:block-container>

								<!-- Titre facture -->
								<fo:block-container height="20mm" width="100mm" top="55mm" left="20mm" position="absolute">
									<fo:block text-align="start" line-height="26pt" font-family="arial" font-size="24pt" font-weight="bold">
										<xsl:text>Cotisation </xsl:text>
										<xsl:value-of select="$invoice_period"/>
									</fo:block>
									<fo:block text-align="start" line-height="12pt" font-family="arial" font-size="10pt">
										<xsl:text>Membre n�</xsl:text>
										<xsl:value-of select="@migration"/>
									</fo:block> 
									<fo:block text-align="start" line-height="12pt" font-family="arial" font-size="10pt">
										<xsl:text>Emis � Lausanne, le </xsl:text><xsl:value-of select="$invoice_date"/>
									</fo:block>
									<xsl:if test="contact/lastname != ''">
										<fo:block text-align="start" line-height="12pt" font-family="arial" font-size="10pt">
											<xsl:text>Votre repr�sentant : </xsl:text>
											<xsl:choose>
												<xsl:when test="contact/title = '1'"><xsl:text>Madame </xsl:text></xsl:when>
												<xsl:when test="contact/title = '2'"><xsl:text>Monsieur </xsl:text></xsl:when>
												<xsl:when test="contact/title = '3'"><xsl:text>Mademoiselle </xsl:text></xsl:when>
												<xsl:when test="contact/title = '4'"><xsl:text>Ma�tre </xsl:text></xsl:when>
												<xsl:when test="contact/title = '5'"><xsl:text>Madame la Pr�sidente </xsl:text></xsl:when>
												<xsl:when test="contact/title = '6'"><xsl:text>Monsieur le Pr�sident </xsl:text></xsl:when>
												<xsl:when test="contact/title = '7'"><xsl:text>Madame la Syndic </xsl:text></xsl:when>
												<xsl:when test="contact/title = '8'"><xsl:text>Monsieur le Syndic </xsl:text></xsl:when>
											</xsl:choose>
											<xsl:value-of select="contact/lastname"/><xsl:text> </xsl:text><xsl:value-of select="contact/firstname"/>
										</fo:block> 
									</xsl:if>
								</fo:block-container>
								
								<!-- Adresse de facturation -->
								<fo:block-container height="30mm" width="70mm" top="55mm" left="120mm" position="absolute">
									<fo:block text-align="start" line-height="12pt" font-family="arial" font-size="10pt"><xsl:value-of select="billing/corporate1"/></fo:block> 
									<fo:block text-align="start" line-height="12pt" font-family="arial" font-size="10pt"><xsl:value-of select="billing/corporate2"/></fo:block> 
									<xsl:if test="billing/lastname != ''">
										<fo:block text-align="start" line-height="12pt" font-family="arial" font-size="10pt">
											<xsl:choose>
												<xsl:when test="billing/title = '1'"><xsl:text>Madame </xsl:text></xsl:when>
												<xsl:when test="billing/title = '2'"><xsl:text>Monsieur </xsl:text></xsl:when>
												<xsl:when test="billing/title = '3'"><xsl:text>Mademoiselle </xsl:text></xsl:when>
												<xsl:when test="billing/title = '4'"><xsl:text>Ma�tre </xsl:text></xsl:when>
												<xsl:when test="billing/title = '5'"><xsl:text>Madame la Pr�sidente </xsl:text></xsl:when>
												<xsl:when test="billing/title = '6'"><xsl:text>Monsieur le Pr�sident </xsl:text></xsl:when>
												<xsl:when test="billing/title = '7'"><xsl:text>Madame la Syndic </xsl:text></xsl:when>
												<xsl:when test="billing/title = '8'"><xsl:text>Monsieur le Syndic </xsl:text></xsl:when>
											</xsl:choose>
											<xsl:value-of select="billing/lastname"/><xsl:text> </xsl:text><xsl:value-of select="billing/firstname"/>
										</fo:block> 
									</xsl:if>
									<fo:block text-align="start" line-height="12pt" font-family="arial" font-size="10pt"><xsl:value-of select="billing/address1"/></fo:block> 
									<fo:block text-align="start" line-height="12pt" font-family="arial" font-size="10pt"><xsl:value-of select="billing/address2"/></fo:block> 
									<fo:block text-align="start" line-height="12pt" font-family="arial" font-size="10pt"><xsl:value-of select="billing/country"/><xsl:text> - </xsl:text><xsl:value-of select="billing/postalcode"/><xsl:text> </xsl:text><xsl:value-of select="billing/locality"/></fo:block> 
							  	</fo:block-container>
								
								<!-- Calcul des montants r�els -->
								<xsl:variable name="amount_base" select="number(detail/base)"/>
								<xsl:variable name="amount_proportional">
									<xsl:call-template name="calculateAmount">
										<xsl:with-param name="amountBase" select="number(detail/base)"/>
										<xsl:with-param name="categoryCode" select="detail/@category"/>
										<xsl:with-param name="memberCode" select="detail/member"/>
										<xsl:with-param name="employeeCode" select="detail/collaborator"/>
										<xsl:with-param name="activityCode" select="detail/activity"/>
										<xsl:with-param name="inhabitant" select="detail/inhabitant"/>
										<xsl:with-param name="subscriberElectricity" select="detail/electricity"/>
										<xsl:with-param name="subscriberGaz" select="detail/gas"/>
										<xsl:with-param name="subscriberHeat" select="detail/heating"/>
										<xsl:with-param name="subscriberTV" select="detail/telcom"/>
										<xsl:with-param name="subscriberOther" select="detail/network"/>
										<xsl:with-param name="flatrate" select="detail/contract"/>
										<xsl:with-param name="order" select="detail/command"/>
										<xsl:with-param name="estimate" select="detail/estimate"/>
									</xsl:call-template>
								</xsl:variable>

								<!-- Calcul des montants plancher/plafond -->
								<xsl:variable name="amount_effective">
									<xsl:call-template name="effectiveAmount">
										<xsl:with-param name="min" select="$amount_min"/>
										<xsl:with-param name="real" select="$amount_proportional"/>
										<xsl:with-param name="category" select="detail/@category"/>
									</xsl:call-template>
								</xsl:variable>

								<!-- Calcul des montants d�finitifs -->
								<xsl:variable name="amount_subtotal" select="floor($amount_effective * 20) div 20"/>
								<xsl:variable name="amount_rebate" select="ceiling(($amount_subtotal * number($invoice_rebate) div 100) * 20) div 20"/>
								<xsl:variable name="amount_total" select="$amount_subtotal - $amount_rebate"/>
								<xsl:variable name="amount_display">
									<xsl:call-template name="calculateDisplay">
										<xsl:with-param name="amount" select="format-number($amount_total,'0.00')"/>
									</xsl:call-template>
								</xsl:variable>

								<!-- D�tail facture -->
								<fo:block-container height="70mm" width="170mm" top="100mm" left="20mm" position="absolute" border="1pt" border-style="solid" border-color="silver" padding-left="3pt" padding-right="3pt">
									<fo:block>
										<fo:block-container height="60mm" width="150mm" top="2mm" left="2mm" position="absolute">
											<xsl:choose>
												<!-- Commune -->
												<xsl:when test="detail/@category = '1'">
													<xsl:call-template name="categoryTemplate">
														<xsl:with-param name="categoryCode" select="'commune'"/>
													</xsl:call-template>
													<xsl:call-template name="inhabitantTemplate">
														<xsl:with-param name="inhabitantCode" select="detail/inhabitant"/>
													</xsl:call-template>
													<xsl:call-template name="subscriberTemplate">
														<xsl:with-param name="subscriberElectricity" select="detail/electricity"/>
														<xsl:with-param name="subscriberGaz" select="detail/gas"/>
														<xsl:with-param name="subscriberHeat" select="detail/heating"/>
														<xsl:with-param name="subscriberTV" select="detail/telcom"/>
														<xsl:with-param name="subscriberOther" select="detail/network"/>
													</xsl:call-template>
												</xsl:when>
												<!-- Canton -->
												<xsl:when test="detail/@category = '2'">
													<xsl:call-template name="categoryTemplate">
														<xsl:with-param name="categoryCode" select="'canton'"/>
													</xsl:call-template>
													<xsl:call-template name="inhabitantTemplate">
														<xsl:with-param name="inhabitantCode" select="detail/inhabitant"/>
													</xsl:call-template>
												</xsl:when>
												<!-- Association communale -->
												<xsl:when test="detail/@category = '3'">
													<xsl:call-template name="categoryTemplate">
														<xsl:with-param name="categoryCode" select="'association communale'"/>
													</xsl:call-template>
													<xsl:call-template name="subscriberTemplate">
														<xsl:with-param name="subscriberElectricity" select="detail/electricity"/>
														<xsl:with-param name="subscriberGaz" select="detail/gas"/>
														<xsl:with-param name="subscriberHeat" select="detail/heating"/>
														<xsl:with-param name="subscriberTV" select="detail/telcom"/>
														<xsl:with-param name="subscriberOther" select="detail/network"/>
													</xsl:call-template>
												</xsl:when>
												<!-- Distributeur d'�nergie -->
												<xsl:when test="detail/@category = '4'">
													<xsl:call-template name="categoryTemplate">
														<xsl:with-param name="categoryCode" select="'distributeur'"/>
													</xsl:call-template>
													<xsl:call-template name="subscriberTemplate">
														<xsl:with-param name="subscriberElectricity" select="detail/electricity"/>
														<xsl:with-param name="subscriberGaz" select="detail/gas"/>
														<xsl:with-param name="subscriberHeat" select="detail/heating"/>
														<xsl:with-param name="subscriberTV" select="detail/telcom"/>
														<xsl:with-param name="subscriberOther" select="detail/network"/>
													</xsl:call-template>
												</xsl:when>
												<!-- Association professionnelle -->
												<xsl:when test="detail/@category = '5'">
													<xsl:call-template name="categoryTemplate">
														<xsl:with-param name="categoryCode" select="'association professionnelle'"/>
													</xsl:call-template>
													<xsl:call-template name="memberTemplate">
														<xsl:with-param name="memberCode" select="detail/member"/>
													</xsl:call-template>
													<xsl:call-template name="activityTemplate">
														<xsl:with-param name="activityCode" select="detail/activity"/>
													</xsl:call-template>
												</xsl:when>
												<!-- Priv� -->
												<xsl:when test="detail/@category = '6'">
													<xsl:call-template name="categoryTemplate">
														<xsl:with-param name="categoryCode" select="'priv�'"/>
													</xsl:call-template>
												</xsl:when>
												<!-- Bureau technique -->
												<xsl:when test="detail/@category = '7'">
													<xsl:call-template name="categoryTemplate">
														<xsl:with-param name="categoryCode" select="'bureau technique'"/>
													</xsl:call-template>
													<xsl:call-template name="employeeTemplate">
														<xsl:with-param name="employeeCode" select="detail/collaborator"/>
													</xsl:call-template>
													<xsl:call-template name="activityTemplate">
														<xsl:with-param name="activityCode" select="detail/activity"/>
													</xsl:call-template>
												</xsl:when>
												<!-- Ecole -->
												<xsl:when test="detail/@category = '8'">
													<xsl:call-template name="categoryTemplate">
														<xsl:with-param name="categoryCode" select="'�cole'"/>
													</xsl:call-template>
													<xsl:call-template name="fixTemplate"/>
												</xsl:when>
												<!-- Divers -->
												<xsl:when test="detail/@category = '9'">
													<xsl:call-template name="categoryTemplate">
														<xsl:with-param name="categoryCode" select="'hors cat�gorie'"/>
													</xsl:call-template>
													<xsl:call-template name="fixTemplate"/>
												</xsl:when>
												<!-- Simple client (non membre) -->
												<xsl:when test="detail/@category = '10'">
													<xsl:call-template name="categoryTemplate">
														<xsl:with-param name="categoryCode" select="'utilisateur non membre'"/>
													</xsl:call-template>
													<xsl:call-template name="requestTemplate">
														<xsl:with-param name="orderCode" select="detail/command"/>
														<xsl:with-param name="estimateCode" select="detail/estimate"/>
													</xsl:call-template>
												</xsl:when>
												<!-- Ami (pas de facture) -->
												<xsl:when test="detail/@category = '11'">
													<xsl:call-template name="categoryTemplate">
														<xsl:with-param name="categoryCode" select="'ami'"/>
													</xsl:call-template>
												</xsl:when>
												<!-- Transport public -->
												<xsl:when test="detail/@category = '12'">
													<xsl:call-template name="categoryTemplate">
														<xsl:with-param name="categoryCode" select="'transport public'"/>
													</xsl:call-template>
													<xsl:call-template name="fixTemplate"/>
												</xsl:when>
												<xsl:otherwise/>
											</xsl:choose>
										</fo:block-container>

										<!-- Affichage des montants r�els -->
										<fo:block-container height="60mm" width="150mm" top="2mm" left="2mm" position="absolute">
											<fo:block text-align="right" line-height="12pt" font-family="arial" font-size="10pt"><xsl:value-of select="$prefix_CHF"/><xsl:value-of select="format-number($amount_proportional,'0.00')"/></fo:block>
										</fo:block-container>

										<!-- Affichage des montants plancher/plafond -->
										<xsl:if test="$amount_proportional &lt; $amount_min">
											<fo:block-container height="20mm" width="150mm" top="40mm" left="2mm" position="absolute">
												<fo:block text-align="left" line-height="12pt" font-family="arial" font-size="10pt"><xsl:text>Contribution minimale de Frs. </xsl:text><xsl:value-of select="format-number($amount_min,'0.00')"/></fo:block> 
											</fo:block-container>
										</xsl:if>
										<xsl:if test="$amount_proportional &gt; $amount_effective">
											<fo:block-container height="20mm" width="150mm" top="40mm" left="2mm" position="absolute">
												<fo:block text-align="left" line-height="12pt" font-family="arial" font-size="10pt"><xsl:text>Contribution maximale de Frs. </xsl:text><xsl:value-of select="format-number($amount_effective,'0.00')"/></fo:block> 
											</fo:block-container>
										</xsl:if>
								
										<!-- Affichage des montants d�finitifs -->
										<fo:block-container height="20mm" width="150mm" top="50mm" left="2mm" position="absolute">
											<xsl:if test="$invoice_rebate &gt; 0">
												<fo:block text-align="left" line-height="12pt" font-family="arial" font-size="10pt"><xsl:text>Sous-total :</xsl:text></fo:block> 
												<fo:block text-align="left" line-height="12pt" font-family="arial" font-size="10pt"><xsl:text>Rabais (</xsl:text><xsl:value-of select="$invoice_rebate"/><xsl:text>%) :</xsl:text></fo:block> 
											</xsl:if>
											<fo:block text-align="left" line-height="12pt" font-family="arial" font-size="10pt" font-weight="bold"><xsl:text>Total :</xsl:text></fo:block> 
										</fo:block-container>
										<fo:block-container height="20mm" width="150mm" top="50mm" left="2mm" position="absolute">
											<xsl:if test="$invoice_rebate &gt; 0">
												<fo:block text-align="right" line-height="12pt" font-family="arial" font-size="10pt"><xsl:value-of select="$prefix_CHF"/><xsl:value-of select="format-number($amount_subtotal,'0.00')"/></fo:block> 
												<fo:block text-align="right" line-height="12pt" font-family="arial" font-size="10pt"><xsl:value-of select="$prefix_CHF"/><xsl:text>- </xsl:text><xsl:value-of select="format-number($amount_rebate,'0.00')"/></fo:block> 
											</xsl:if>
											<fo:block text-align="right" line-height="12pt" font-family="arial" font-size="10pt" font-weight="bold"><xsl:value-of select="$prefix_CHF"/><xsl:value-of select="format-number($amount_total,'0.00')"/></fo:block> 
										</fo:block-container>

									</fo:block>
								</fo:block-container>
								
								<!-- Message d�lai de paiement -->
								<fo:block-container height="10mm" width="170mm" top="180mm" left="20mm" position="absolute">
									<fo:block text-align="center" line-height="12pt" font-family="arial" font-size="10pt">Nous vous remercions pour votre paiement dans les 30 jours au moyen du bulletin de versement ci-dessous.</fo:block> 
								</fo:block-container>
								
								<!-- Remplissage bulletin de versement -->
								<fo:block-container height="20mm" width="40mm" top="205mm" left="3mm" position="absolute">
									<fo:block text-align="left" line-height="12pt" font-family="arial" font-size="10pt"><xsl:value-of select="$asit_name"/></fo:block> 
									<fo:block text-align="left" line-height="12pt" font-family="arial" font-size="10pt"><xsl:value-of select="$asit_address"/></fo:block> 
									<fo:block text-align="left" line-height="12pt" font-family="arial" font-size="10pt"><xsl:value-of select="$asit_location"/></fo:block> 
								</fo:block-container>
								<fo:block-container height="20mm" width="40mm" top="205mm" left="65mm" position="absolute">
									<fo:block text-align="left" line-height="12pt" font-family="arial" font-size="10pt"><xsl:value-of select="$asit_name"/></fo:block> 
									<fo:block text-align="left" line-height="12pt" font-family="arial" font-size="10pt"><xsl:value-of select="$asit_address"/></fo:block> 
									<fo:block text-align="left" line-height="12pt" font-family="arial" font-size="10pt"><xsl:value-of select="$asit_location"/></fo:block> 
								</fo:block-container>
								<fo:block-container height="20mm" width="40mm" top="205mm" left="125mm" position="absolute">
									<fo:block text-align="left" line-height="12pt" font-family="arial" font-size="10pt">
										<xsl:text>Cotisation </xsl:text>
										<xsl:value-of select="$invoice_period"/>
									</fo:block> 
									<fo:block text-align="left" line-height="12pt" font-family="arial" font-size="10pt">
										<xsl:text>Membre n�</xsl:text>
										<xsl:value-of select="@migration"/>
									</fo:block>
								</fo:block-container>
								<fo:block-container height="10mm" width="15mm" top="220mm" left="192mm" position="absolute">
									<fo:block text-align="left" line-height="6pt" font-family="arial" font-size="6pt">PTT 2.06</fo:block> 
								</fo:block-container>
								<fo:block-container height="10mm" width="20mm" top="236mm" left="25mm" position="absolute">
									<fo:block text-align="left" line-height="12pt" font-family="arial" font-size="10pt"><xsl:value-of select="$asit_ccp"/></fo:block> 
								</fo:block-container>
								<fo:block-container height="10mm" width="20mm" top="236mm" left="87mm" position="absolute">
									<fo:block text-align="left" line-height="12pt" font-family="arial" font-size="10pt"><xsl:value-of select="$asit_ccp"/></fo:block> 
								</fo:block-container>
								<fo:block-container height="5mm" width="5mm" top="246mm" left="3mm" position="absolute">
									<fo:block text-align="center" line-height="12pt" font-family="arial" font-size="10pt"><xsl:value-of select="substring($amount_display,1,1)"/></fo:block> 
								</fo:block-container>
								<fo:block-container height="5mm" width="5mm" top="246mm" left="9mm" position="absolute">
									<fo:block text-align="center" line-height="12pt" font-family="arial" font-size="10pt"><xsl:value-of select="substring($amount_display,2,1)"/></fo:block> 
								</fo:block-container>
								<fo:block-container height="5mm" width="5mm" top="246mm" left="14mm" position="absolute">
									<fo:block text-align="center" line-height="12pt" font-family="arial" font-size="10pt"><xsl:value-of select="substring($amount_display,3,1)"/></fo:block> 
								</fo:block-container>
								<fo:block-container height="5mm" width="5mm" top="246mm" left="19mm" position="absolute">
									<fo:block text-align="center" line-height="12pt" font-family="arial" font-size="10pt"><xsl:value-of select="substring($amount_display,4,1)"/></fo:block> 
								</fo:block-container>
								<fo:block-container height="5mm" width="5mm" top="246mm" left="24mm" position="absolute">
									<fo:block text-align="center" line-height="12pt" font-family="arial" font-size="10pt"><xsl:value-of select="substring($amount_display,5,1)"/></fo:block> 
								</fo:block-container>
								<fo:block-container height="5mm" width="5mm" top="246mm" left="30mm" position="absolute">
									<fo:block text-align="center" line-height="12pt" font-family="arial" font-size="10pt"><xsl:value-of select="substring($amount_display,6,1)"/></fo:block> 
								</fo:block-container>
								<fo:block-container height="5mm" width="5mm" top="246mm" left="35mm" position="absolute">
									<fo:block text-align="center" line-height="12pt" font-family="arial" font-size="10pt"><xsl:value-of select="substring($amount_display,7,1)"/></fo:block> 
								</fo:block-container>
								<fo:block-container height="5mm" width="5mm" top="246mm" left="46mm" position="absolute">
									<fo:block text-align="center" line-height="12pt" font-family="arial" font-size="10pt"><xsl:value-of select="substring($amount_display,9,1)"/></fo:block> 
								</fo:block-container>
								<fo:block-container height="5mm" width="5mm" top="246mm" left="51mm" position="absolute">
									<fo:block text-align="center" line-height="12pt" font-family="arial" font-size="10pt"><xsl:value-of select="substring($amount_display,10,1)"/></fo:block> 
								</fo:block-container>
								<fo:block-container height="5mm" width="5mm" top="246mm" left="67mm" position="absolute">
									<fo:block text-align="center" line-height="12pt" font-family="arial" font-size="10pt"><xsl:value-of select="substring($amount_display,1,1)"/></fo:block> 
								</fo:block-container>
								<fo:block-container height="5mm" width="5mm" top="246mm" left="72mm" position="absolute">
									<fo:block text-align="center" line-height="12pt" font-family="arial" font-size="10pt"><xsl:value-of select="substring($amount_display,2,1)"/></fo:block> 
								</fo:block-container>
								<fo:block-container height="5mm" width="5mm" top="246mm" left="77mm" position="absolute">
									<fo:block text-align="center" line-height="12pt" font-family="arial" font-size="10pt"><xsl:value-of select="substring($amount_display,3,1)"/></fo:block> 
								</fo:block-container>
								<fo:block-container height="5mm" width="5mm" top="246mm" left="82mm" position="absolute">
									<fo:block text-align="center" line-height="12pt" font-family="arial" font-size="10pt"><xsl:value-of select="substring($amount_display,4,1)"/></fo:block> 
								</fo:block-container>
								<fo:block-container height="5mm" width="5mm" top="246mm" left="88mm" position="absolute">
									<fo:block text-align="center" line-height="12pt" font-family="arial" font-size="10pt"><xsl:value-of select="substring($amount_display,5,1)"/></fo:block> 
								</fo:block-container>
								<fo:block-container height="5mm" width="5mm" top="246mm" left="93mm" position="absolute">
									<fo:block text-align="center" line-height="12pt" font-family="arial" font-size="10pt"><xsl:value-of select="substring($amount_display,6,1)"/></fo:block> 
								</fo:block-container>
								<fo:block-container height="5mm" width="5mm" top="246mm" left="99mm" position="absolute">
									<fo:block text-align="center" line-height="12pt" font-family="arial" font-size="10pt"><xsl:value-of select="substring($amount_display,7,1)"/></fo:block> 
								</fo:block-container>
								<fo:block-container height="5mm" width="5mm" top="246mm" left="109mm" position="absolute">
									<fo:block text-align="center" line-height="12pt" font-family="arial" font-size="10pt"><xsl:value-of select="substring($amount_display,9,1)"/></fo:block> 
								</fo:block-container>
								<fo:block-container height="5mm" width="5mm" top="246mm" left="114mm" position="absolute">
									<fo:block text-align="center" line-height="12pt" font-family="arial" font-size="10pt"><xsl:value-of select="substring($amount_display,10,1)"/></fo:block> 
								</fo:block-container>
								<fo:block-container height="30mm" width="50mm" top="259mm" left="3mm" position="absolute">
									<xsl:call-template name="address_member">
										<xsl:with-param name="titre" select="billing/title"/>
										<xsl:with-param name="nom" select="billing/lastname"/>
										<xsl:with-param name="pr�nom" select="billing/firstname"/>
										<xsl:with-param name="nom1" select="billing/corporate1"/>
										<xsl:with-param name="nom2" select="billing/corporate2"/>
										<xsl:with-param name="adresse1" select="billing/address1"/>
										<xsl:with-param name="adresse2" select="billing/address2"/>
										<xsl:with-param name="zip" select="billing/postalcode"/>
										<xsl:with-param name="localit�" select="billing/locality"/>
										<xsl:with-param name="pays" select="billing/country"/>
									</xsl:call-template>
								</fo:block-container>
								<fo:block-container height="30mm" width="70mm" top="245mm" left="125mm" position="absolute">
									<xsl:call-template name="address_member">
										<xsl:with-param name="titre" select="billing/title"/>
										<xsl:with-param name="nom" select="billing/lastname"/>
										<xsl:with-param name="pr�nom" select="billing/firstname"/>
										<xsl:with-param name="nom1" select="billing/corporate1"/>
										<xsl:with-param name="nom2" select="billing/corporate2"/>
										<xsl:with-param name="adresse1" select="billing/address1"/>
										<xsl:with-param name="adresse2" select="billing/address2"/>
										<xsl:with-param name="zip" select="billing/postalcode"/>
										<xsl:with-param name="localit�" select="billing/locality"/>
										<xsl:with-param name="pays" select="billing/country"/>
									</xsl:call-template>
								</fo:block-container>
								<fo:block-container height="10mm" width="30mm" top="279mm" left="185mm" position="absolute">
									<fo:block text-align="left" line-height="12pt" font-family="arial" font-size="12pt"><xsl:value-of select="$asit_ccp"/><xsl:text>></xsl:text></fo:block> 
								</fo:block-container>
								<fo:block-container height="10mm" width="30mm" top="287mm" left="185mm" position="absolute">
									<fo:block text-align="left" line-height="12pt" font-family="arial" font-size="12pt"><xsl:value-of select="$asit_ccp"/><xsl:text>></xsl:text></fo:block> 
								</fo:block-container>
							</fo:block>
							
							<!-- Saut de page pour feuille suivante -->
							<xsl:if test="position() &lt; last()">
								<fo:block break-after="page"/>
							</xsl:if>
						
						</xsl:for-each>
					</xsl:for-each>	
				</fo:flow>
			</fo:page-sequence>
		</fo:root>
	</xsl:template>

	<!-- Template pour cat�gorie -->
	<xsl:template name="categoryTemplate">
		<xsl:param name="categoryCode"/>
		<fo:block text-align="left" line-height="12pt" font-family="arial" font-size="10pt">
			<xsl:text>Montant selon cat�gorie (</xsl:text><xsl:value-of select="$categoryCode"/><xsl:text>) :</xsl:text>
		</fo:block>
	</xsl:template>

	<!-- Template pour forfait -->
	<xsl:template name="fixTemplate">
		<fo:block text-align="left" line-height="12pt" font-family="arial" font-size="10pt">
			<xsl:text>- forfait</xsl:text>
		</fo:block>
	</xsl:template>

	<!-- Template pour habitant -->
	<xsl:template name="inhabitantTemplate">
		<xsl:param name="inhabitantCode" select="0"/>
		<fo:block text-align="left" line-height="12pt" font-family="arial" font-size="10pt">
			<xsl:text>- </xsl:text><xsl:value-of select="$inhabitantCode"/><xsl:text> habitants � Frs. 0.18/hab.</xsl:text>
		</fo:block>
	</xsl:template>

	<!-- Template pour abonn�s -->
	<xsl:template name="subscriberTemplate">
		<xsl:param name="subscriberElectricity" select="0"/>
		<xsl:param name="subscriberGaz" select="0"/>
		<xsl:param name="subscriberHeat" select="0"/>
		<xsl:param name="subscriberTV" select="0"/>
		<xsl:param name="subscriberOther" select="0"/>
		<fo:block text-align="left" line-height="12pt" font-family="arial" font-size="10pt">
			<xsl:text>- </xsl:text><xsl:value-of select="$subscriberElectricity"/><xsl:text> abonn�(s) �lectricit� � Frs. 0.18/ab.</xsl:text>
		</fo:block>
		<fo:block text-align="left" line-height="12pt" font-family="arial" font-size="10pt">
			<xsl:text>- </xsl:text><xsl:value-of select="$subscriberGaz"/><xsl:text> abonn�(s) gaz � Frs. 0.18/ab.</xsl:text>
		</fo:block>
		<fo:block text-align="left" line-height="12pt" font-family="arial" font-size="10pt">
			<xsl:text>- </xsl:text><xsl:value-of select="$subscriberHeat"/><xsl:text> abonn�(s) chauffage � distance � Frs. 0.18/ab.</xsl:text>
		</fo:block>
		<fo:block text-align="left" line-height="12pt" font-family="arial" font-size="10pt">
			<xsl:text>- </xsl:text><xsl:value-of select="$subscriberTV"/><xsl:text> abonn�(s) t�l�r�seau � Frs. 0.10/ab.</xsl:text>
		</fo:block>
		<fo:block text-align="left" line-height="12pt" font-family="arial" font-size="10pt">
			<xsl:text>- </xsl:text><xsl:value-of select="$subscriberOther"/><xsl:text> abonn�(s) autre � Frs. 0.18/ab.</xsl:text>
		</fo:block>
	</xsl:template>

	<!-- Template pour requ�te -->
	<xsl:template name="requestTemplate">
		<xsl:param name="orderCode" select="0"/>
		<xsl:param name="estimateCode" select="0"/>
		<fo:block text-align="left" line-height="12pt" font-family="arial" font-size="10pt">
			<xsl:text>- </xsl:text><xsl:value-of select="$estimateCode"/><xsl:text> devis(s) � Frs. 10.-/devis.</xsl:text>
		</fo:block>
		<fo:block text-align="left" line-height="12pt" font-family="arial" font-size="10pt">
			<xsl:text>- </xsl:text><xsl:value-of select="$orderCode"/><xsl:text> commande(s) � Frs. 10.-/commande.</xsl:text>
		</fo:block>
	</xsl:template>

	<!-- Template pour employ� -->
	<xsl:template name="employeeTemplate">
		<xsl:param name="employeeCode"/>
		<fo:block text-align="left" line-height="12pt" font-family="arial" font-size="10pt">
			<xsl:choose>
				<!-- de 1 � 10 employ�s -->
				<xsl:when test="$employeeCode = '1'">
					<xsl:text>- de 1 � 10 employ�s</xsl:text>
				</xsl:when>
				<!-- de 11 � 25 employ�s -->
				<xsl:when test="$employeeCode = '2'">
					<xsl:text>- de 11 � 25 employ�s</xsl:text>
				</xsl:when>
				<!-- de 26 � 100 employ�s -->
				<xsl:when test="$employeeCode = '3'">
					<xsl:text>- de 26 � 100 employ�s</xsl:text>
				</xsl:when>
				<!-- plus de 100 employ�s -->
				<xsl:when test="$employeeCode = '4'">
					<xsl:text>- plus de 100 employ�s</xsl:text>
				</xsl:when>
				<!-- quantit� d'employ�s inconnue -->
				<xsl:otherwise>
					<xsl:text>- quantit� d'employ�s inconnue</xsl:text>
				</xsl:otherwise>
			</xsl:choose>
		</fo:block>
	</xsl:template>

	<!-- Template pour membre -->
	<xsl:template name="memberTemplate">
		<xsl:param name="memberCode"/>
		<fo:block text-align="left" line-height="12pt" font-family="arial" font-size="10pt">
			<xsl:choose>
				<!-- de 1 � 50 membres -->
				<xsl:when test="$memberCode = '1'">
					<xsl:text>- de 1 � 50 membres</xsl:text>
				</xsl:when>
				<!-- de 51 � 100 membres -->
				<xsl:when test="$memberCode = '2'">
					<xsl:text>- de 51 � 100 membres</xsl:text>
				</xsl:when>
				<!-- de 101 � 500 membres -->
				<xsl:when test="$memberCode = '3'">
					<xsl:text>- de 101 � 500 membres</xsl:text>
				</xsl:when>
				<!-- plus de 500 membres -->
				<xsl:when test="$memberCode = '4'">
					<xsl:text>- plus de 500 membres</xsl:text>
				</xsl:when>
				<!-- quantit� de membres inconnue -->
				<xsl:otherwise>
					<xsl:text>- quantit� de membres inconnue</xsl:text>
				</xsl:otherwise>
			</xsl:choose>
		</fo:block>
	</xsl:template>

	<!-- Template pour activit� -->
	<xsl:template name="activityTemplate">
		<xsl:param name="activityCode"/>
		<fo:block text-align="left" line-height="12pt" font-family="arial" font-size="10pt">
			<xsl:choose>
				<!-- activit� SIG principale -->
				<xsl:when test="$activityCode = '1'">
					<xsl:text>- activit� SIG principale</xsl:text>
				</xsl:when>
				<!-- activit� SIG annexe -->
				<xsl:when test="$activityCode = '2'">
					<xsl:text>- activit� SIG annexe</xsl:text>
				</xsl:when>
				<!-- activit� SIG inconnue -->
				<xsl:otherwise>
					<xsl:text>- activit� SIG inconnue</xsl:text>
				</xsl:otherwise>
			</xsl:choose>
		</fo:block>
	</xsl:template>

	<!-- Template pour calcul co�t proportionel
		(selon fiche "Mode de financement de l'ASIT-VD, 28.04.2004) -->
	<xsl:template name="calculateAmount">
		<xsl:param name="amountBase" select="0"/>
		<xsl:param name="categoryCode" select="0"/>
		<xsl:param name="memberCode" select="0"/>
		<xsl:param name="employeeCode" select="0"/>
		<xsl:param name="activityCode" select="0"/>
		<xsl:param name="inhabitant" select="0"/>
		<xsl:param name="subscriberElectricity" select="0"/>
		<xsl:param name="subscriberGaz" select="0"/>
		<xsl:param name="subscriberHeat" select="0"/>
		<xsl:param name="subscriberTV" select="0"/>
		<xsl:param name="subscriberOther" select="0"/>
		<xsl:param name="flatrate" select="0"/>
		<xsl:choose>
			<xsl:when test="$categoryCode = '1'">
				<xsl:value-of select="$inhabitant * 0.18 + $subscriberElectricity * 0.18 + $subscriberGaz * 0.18 + $subscriberHeat * 0.18 + $subscriberTV * 0.10 + $subscriberOther * 0.18"/>
			</xsl:when>
			<xsl:when test="$categoryCode = '2'">
				<xsl:value-of select="$inhabitant * 0.18"/>
			</xsl:when>
			<xsl:when test="$categoryCode = '3'">
				<xsl:value-of select="$subscriberElectricity * 0.18 + $subscriberGaz * 0.18 + $subscriberHeat * 0.18 + $subscriberTV * 0.10 + $subscriberOther * 0.18"/>
			</xsl:when>
			<xsl:when test="$categoryCode = '4'">
				<xsl:value-of select="$subscriberElectricity * 0.18 + $subscriberGaz * 0.18 + $subscriberHeat * 0.18 + $subscriberTV * 0.10 + $subscriberOther * 0.18"/>
			</xsl:when>
			<xsl:when test="$categoryCode = '5' and $memberCode = '1' and $activityCode = '2'">
				<xsl:value-of select="100.00"/>
			</xsl:when>
			<xsl:when test="$categoryCode = '5' and $memberCode = '2' and $activityCode = '2'">
				<xsl:value-of select="200.00"/>
			</xsl:when>
			<xsl:when test="$categoryCode = '5' and $memberCode = '3' and $activityCode = '2'">
				<xsl:value-of select="400.00"/>
			</xsl:when>
			<xsl:when test="$categoryCode = '5' and $memberCode = '4' and $activityCode = '2'">
				<xsl:value-of select="800.00"/>
			</xsl:when>
			<xsl:when test="$categoryCode = '5' and $memberCode = '1' and $activityCode = '1'">
				<xsl:value-of select="200.00"/>
			</xsl:when>
			<xsl:when test="$categoryCode = '5' and $memberCode = '2' and $activityCode = '1'">
				<xsl:value-of select="400.00"/>
			</xsl:when>
			<xsl:when test="$categoryCode = '5' and $memberCode = '3' and $activityCode = '1'">
				<xsl:value-of select="800.00"/>
			</xsl:when>
			<xsl:when test="$categoryCode = '5' and $memberCode = '4' and $activityCode = '1'">
				<xsl:value-of select="1600.00"/>
			</xsl:when>
			<xsl:when test="$categoryCode = '6'">
				<xsl:value-of select="100.00"/>
			</xsl:when>
			<xsl:when test="$categoryCode = '7' and $employeeCode = '1' and $activityCode = '2'">
				<xsl:value-of select="100.00"/>
			</xsl:when>
			<xsl:when test="$categoryCode = '7' and $employeeCode = '2' and $activityCode = '2'">
				<xsl:value-of select="200.00"/>
			</xsl:when>
			<xsl:when test="$categoryCode = '7' and $employeeCode = '3' and $activityCode = '2'">
				<xsl:value-of select="400.00"/>
			</xsl:when>
			<xsl:when test="$categoryCode = '7' and $employeeCode = '4' and $activityCode = '2'">
				<xsl:value-of select="800.00"/>
			</xsl:when>
			<xsl:when test="$categoryCode = '7' and $employeeCode = '1' and $activityCode = '1'">
				<xsl:value-of select="400.00"/>
			</xsl:when>
			<xsl:when test="$categoryCode = '7' and $employeeCode = '2' and $activityCode = '1'">
				<xsl:value-of select="800.00"/>
			</xsl:when>
			<xsl:when test="$categoryCode = '7' and $employeeCode = '3' and $activityCode = '1'">
				<xsl:value-of select="1600.00"/>
			</xsl:when>
			<xsl:when test="$categoryCode = '7' and $employeeCode = '4' and $activityCode = '1'">
				<xsl:value-of select="3200.00"/>
			</xsl:when>
			<xsl:when test="$categoryCode = '8'">
				<xsl:value-of select="$flatrate"/>
			</xsl:when>
			<xsl:when test="$categoryCode = '9'">
				<xsl:value-of select="$flatrate"/>
			</xsl:when>
			<xsl:when test="$categoryCode = '10'">
				<xsl:value-of select="NaN"/>
			</xsl:when>
			<xsl:when test="$categoryCode = '11'">
				<xsl:value-of select="0.00"/>
			</xsl:when>
			<xsl:when test="$categoryCode = '12'">
				<xsl:value-of select="$flatrate"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="NaN"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	
	<!-- Template pour calcul montants plancher et plafond
		(selon fiche "Mode de financement de l'ASIT-VD, 28.04.2004) -->
	<xsl:template name="effectiveAmount">
		<xsl:param name="min" select="0"/>
		<xsl:param name="real" select="0"/>
		<xsl:param name="category" select="0"/>
		<xsl:variable name="maxCommune" select="30000.00"/>
		<xsl:variable name="maxDistributeur" select="22000.00"/>
		<xsl:variable name="maxCanton" select="110000.00"/>
		<xsl:choose>
			<xsl:when test="$real &lt; $min and $category != '10'"><xsl:value-of select="$min"/></xsl:when>
			<xsl:otherwise>
				<xsl:choose>
					<xsl:when test="$category = '1'">
						<xsl:choose>
							<xsl:when test="$real &gt; $maxCommune"><xsl:value-of select="$maxCommune"/></xsl:when>
							<xsl:otherwise><xsl:value-of select="$real"/></xsl:otherwise>
						</xsl:choose>
					</xsl:when>
					<xsl:when test="$category = '2'">
						<xsl:choose>
							<xsl:when test="$real &gt; $maxCanton"><xsl:value-of select="$maxCanton"/></xsl:when>
							<xsl:otherwise><xsl:value-of select="$real"/></xsl:otherwise>
						</xsl:choose>
					</xsl:when>
					<xsl:when test="$category = '4'">
						<xsl:choose>
							<xsl:when test="$real &gt; $maxDistributeur"><xsl:value-of select="$maxDistributeur"/></xsl:when>
							<xsl:otherwise><xsl:value-of select="$real"/></xsl:otherwise>
						</xsl:choose>
					</xsl:when>
					<xsl:otherwise>
						<xsl:value-of select="$real"/>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	
	<!-- Template pour affichage montant (max. 1000000.00 dans bulletin de versement -->
	<xsl:template name="calculateDisplay">
		<xsl:param name="amount"/>
		<xsl:variable name="format_amount">
			<xsl:call-template name="stuffing">
				<xsl:with-param name="digit" select="'10'"/>
				<xsl:with-param name="result" select="$amount"/>
			</xsl:call-template>
		</xsl:variable>
		<xsl:value-of select="$format_amount"/>
	</xsl:template>

	<!-- Template pour le formatage du montant du bulletin de versement -->
	<xsl:template name="stuffing">
		<xsl:param name="digit" select="0"/>
		<xsl:param name="result" select="''"/>
		<xsl:choose>
			<xsl:when test="(string-length($result) &lt; $digit)">
				<xsl:call-template name="stuffing">
					<xsl:with-param name="digit" select="$digit"/>		
					<xsl:with-param name="result" select='concat(" ",$result)'/>
				</xsl:call-template>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select='$result'/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	
	<!-- Template pour affichage adresse membre dans bulletin de versement -->
	<xsl:template name="address_member">
		<xsl:param name="titre" select="''"/>
		<xsl:param name="nom" select="''"/>
		<xsl:param name="pr�nom" select="''"/>
		<xsl:param name="nom1" select="''"/>
		<xsl:param name="nom2" select="''"/>
		<xsl:param name="adresse1" select="''"/>
		<xsl:param name="adresse2" select="''"/>
		<xsl:param name="zip" select="''"/>
		<xsl:param name="localit�" select="''"/>
		<xsl:param name="pays" select="''"/>
		<xsl:choose>
			<xsl:when test="$nom1 = '' and $nom2 = ''">
				<fo:block text-align="left" line-height="12pt" font-family="arial" font-size="10pt"><xsl:value-of select="$titre"/></fo:block>
				<fo:block text-align="left" line-height="12pt" font-family="arial" font-size="10pt">
					<xsl:value-of select="$pr�nom"/><xsl:text> </xsl:text><xsl:value-of select="$nom"/>
				</fo:block> 
			</xsl:when>
			<xsl:otherwise>
				<fo:block text-align="left" line-height="12pt" font-family="arial" font-size="10pt"><xsl:value-of select="$nom1"/></fo:block> 
			</xsl:otherwise>
		</xsl:choose>
		<fo:block text-align="left" line-height="12pt" font-family="arial" font-size="10pt"><xsl:value-of select="$adresse1"/></fo:block> 
		<fo:block text-align="left" line-height="12pt" font-family="arial" font-size="10pt"><xsl:value-of select="$adresse2"/></fo:block> 
		<fo:block text-align="left" line-height="12pt" font-family="arial" font-size="10pt"><xsl:value-of select="$pays"/><xsl:text> - </xsl:text><xsl:value-of select="$zip"/><xsl:text> </xsl:text><xsl:value-of select="$localit�"/>
		</fo:block> 
	</xsl:template>
	
	
</xsl:stylesheet>