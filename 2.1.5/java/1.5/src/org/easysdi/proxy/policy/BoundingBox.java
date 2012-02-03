//
// This file was generated by the JavaTM Architecture for XML Binding(JAXB) Reference Implementation, vhudson-jaxb-ri-2.1-520 
// See <a href="http://java.sun.com/xml/jaxb">http://java.sun.com/xml/jaxb</a> 
// Any modifications to this file will be lost upon recompilation of the source schema. 
// Generated on: 2008.06.16 at 03:41:04 PM CEST 
//

package org.easysdi.proxy.policy;

import java.io.Serializable;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

/**
 * <p>
 * Java class for anonymous complex type.
 * 
 * <p>
 * The following schema fragment specifies the expected content contained within
 * this class.
 * 
 * <pre>
 * &lt;complexType>
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;choice>
 *         &lt;element ref="{}From"/>
 *         &lt;element ref="{}Mask"/>
 *         &lt;element ref="{}To"/>
 *       &lt;/choice>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "", propOrder = {  })
@XmlRootElement(name = "BoundingBox")
public class BoundingBox implements Serializable {

	@XmlAttribute(name = "SRS")
	private String SRS;
	@XmlAttribute(name = "minx")
	protected String minx;
	@XmlAttribute(name = "miny")
	protected String miny;
	@XmlAttribute(name = "maxx")
	protected String maxx;
	@XmlAttribute(name = "maxy")
	protected String maxy;

	@Override
	public int hashCode() {
		int hashCode = 0;
		if (SRS != null)
			hashCode += SRS.hashCode();
		if (minx != null)
			hashCode += minx.hashCode();
		if (miny != null)
			hashCode += miny.hashCode();
		if (maxx != null)
			hashCode += maxx.hashCode();
		if (maxy != null)
			hashCode += maxy.hashCode();
		return hashCode;
	}

	/**
	 * Gets the value of the minx property.
	 * 
	 * @return possible object is {@link String }
	 * 
	 */
	public String getMinx() {
		return minx;
	}

	/**
	 * Sets the value of the minx property.
	 * 
	 * @param value
	 *            allowed object is {@link String }
	 * 
	 */
	public void setMinx(String value) {
		this.minx = value;
	}
	
	/**
	 * Gets the value of the miny property.
	 * 
	 * @return possible object is {@link String }
	 * 
	 */
	public String getMiny() {
		return miny;
	}

	/**
	 * Sets the value of the miny property.
	 * 
	 * @param value
	 *            allowed object is {@link String }
	 * 
	 */
	public void setMiny(String value) {
		this.miny = value;
	}

	/**
	 * Gets the value of the maxx property.
	 * 
	 * @return possible object is {@link String }
	 * 
	 */
	public String getMaxx() {
		return maxx;
	}

	/**
	 * Sets the value of the maxx property.
	 * 
	 * @param value
	 *            allowed object is {@link String }
	 * 
	 */
	public void setMaxx(String value) {
		this.maxx = value;
	}
	
	/**
	 * Gets the value of the maxy property.
	 * 
	 * @return possible object is {@link String }
	 * 
	 */
	public String getMaxy() {
		return maxy;
	}

	/**
	 * Sets the value of the maxy property.
	 * 
	 * @param value
	 *            allowed object is {@link String }
	 * 
	 */
	public void setMaxy(String value) {
		this.maxy = value;
	}
	
	/**
	 * Gets the value of the srs property.
	 * 
	 * @return possible object is {@link String }
	 * 
	 */
	public String getSRS() {
		return SRS;
	}

	/**
	 * Sets the value of the srs property.
	 * 
	 * @param value
	 *            allowed object is {@link String }
	 * 
	 */
	public void setSRS(String value) {
		this.SRS = value;
	}
	
}