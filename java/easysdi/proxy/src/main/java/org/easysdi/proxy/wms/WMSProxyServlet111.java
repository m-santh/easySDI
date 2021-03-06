/**
 * EasySDI, a solution to implement easily any spatial data infrastructure
 * Copyright (C) EasySDI Community
 * For more information : www.easysdi.org
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
package org.easysdi.proxy.wms;

import org.easysdi.proxy.core.ProxyServletRequest;
import org.easysdi.proxy.domain.SdiPolicy;
import org.easysdi.proxy.domain.SdiVirtualservice;
import org.easysdi.proxy.wms.v111.WMSExceptionReport111;
import org.easysdi.proxy.wms.v111.WMSProxyResponseBuilder111;
import org.springframework.context.ApplicationContext;

/**
 * @author DEPTH SA
 *
 */
public class WMSProxyServlet111 extends WMSProxyServlet {

	/**
	 * 
	 */
	private static final long serialVersionUID = -4934729929697691603L;

	/**
	 * 
	 */
	public WMSProxyServlet111(ProxyServletRequest proxyRequest, SdiVirtualservice virtualService, SdiPolicy policy, ApplicationContext context) {
		super(proxyRequest, virtualService, policy, context);
		docBuilder = new WMSProxyResponseBuilder111(this);
		owsExceptionReport = new WMSExceptionReport111 ();
	}

}
