//
// This file was generated by the JavaTM Architecture for XML Binding(JAXB) Reference Implementation, v2.0-b26-ea3 
// See <a href="http://java.sun.com/xml/jaxb">http://java.sun.com/xml/jaxb</a> 
// Any modifications to this file will be lost upon recompilation of the source schema. 
// Generated on: 2011.10.20 at 10:32:26 AM CEST 
//


package org.easysdi.proxy.policy;

import javax.xml.bind.annotation.AccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;
import org.easysdi.proxy.policy.Attributes;


/**
 * <p>Java class for Attributes element declaration.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;element name="Attributes">
 *   &lt;complexType>
 *     &lt;complexContent>
 *       &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *         &lt;attribute name="All" use="required" type="{http://www.w3.org/2001/XMLSchema}boolean" />
 *       &lt;/restriction>
 *     &lt;/complexContent>
 *   &lt;/complexType>
 * &lt;/element>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(AccessType.FIELD)
@XmlType(name = "")
@XmlRootElement(name = "Attributes")
public class Attributes {

    @XmlAttribute(name = "All", required = true)
    protected boolean all;

    /**
     * Gets the value of the all property.
     * 
     */
    public boolean isAll() {
        return all;
    }

    /**
     * Sets the value of the all property.
     * 
     */
    public void setAll(boolean value) {
        this.all = value;
    }

}
