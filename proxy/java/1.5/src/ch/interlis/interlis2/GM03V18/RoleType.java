//
// This file was generated by the JavaTM Architecture for XML Binding(JAXB) Reference Implementation, vhudson-jaxb-ri-2.1-520 
// See <a href="http://java.sun.com/xml/jaxb">http://java.sun.com/xml/jaxb</a> 
// Any modifications to this file will be lost upon recompilation of the source schema. 
// Generated on: 2008.03.13 at 04:39:39 PM CET 
//


package ch.interlis.interlis2.GM03V18;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlType;
import javax.xml.bind.annotation.XmlValue;


/**
 * <p>Java class for RoleType complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="RoleType">
 *   &lt;simpleContent>
 *     &lt;extension base="&lt;http://www.w3.org/2001/XMLSchema>string">
 *       &lt;attribute name="REF" type="{http://www.interlis.ch/INTERLIS2.2}IliID" />
 *       &lt;attribute name="EXTREF" type="{http://www.interlis.ch/INTERLIS2.2}IliID" />
 *       &lt;attribute name="BID" type="{http://www.interlis.ch/INTERLIS2.2}IliID" />
 *       &lt;attribute name="NEXT_TID" type="{http://www.interlis.ch/INTERLIS2.2}IliID" />
 *     &lt;/extension>
 *   &lt;/simpleContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "RoleType", propOrder = {
    "value"
})
public class RoleType {

    @XmlValue
    protected String value;
    @XmlAttribute(name = "REF")
    protected String ref;
    @XmlAttribute(name = "EXTREF")
    protected String extref;
    @XmlAttribute(name = "BID")
    protected String bid;
    @XmlAttribute(name = "NEXT_TID")
    protected String nexttid;

    /**
     * Gets the value of the value property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getValue() {
        return value;
    }

    /**
     * Sets the value of the value property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setValue(String value) {
        this.value = value;
    }

    /**
     * Gets the value of the ref property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getREF() {
        return ref;
    }

    /**
     * Sets the value of the ref property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setREF(String value) {
        this.ref = value;
    }

    /**
     * Gets the value of the extref property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getEXTREF() {
        return extref;
    }

    /**
     * Sets the value of the extref property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setEXTREF(String value) {
        this.extref = value;
    }

    /**
     * Gets the value of the bid property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getBID() {
        return bid;
    }

    /**
     * Sets the value of the bid property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setBID(String value) {
        this.bid = value;
    }

    /**
     * Gets the value of the nexttid property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getNEXTTID() {
        return nexttid;
    }

    /**
     * Sets the value of the nexttid property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setNEXTTID(String value) {
        this.nexttid = value;
    }

}