//
// This file was generated by the JavaTM Architecture for XML Binding(JAXB) Reference Implementation, vhudson-jaxb-ri-2.1-520 
// See <a href="http://java.sun.com/xml/jaxb">http://java.sun.com/xml/jaxb</a> 
// Any modifications to this file will be lost upon recompilation of the source schema. 
// Generated on: 2008.03.07 at 04:51:42 PM CET 
//


package net.opengis.gml.v320;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;


/**
 * A property with the content model of gml:RingPropertyType encapsulates a ring to represent a component of a surface boundary.
 * 
 * <p>Java class for RingPropertyType complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="RingPropertyType">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element ref="{http://www.opengis.net/gml}Ring"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "RingPropertyType", propOrder = {
    "ring"
})
public class RingPropertyType {

    @XmlElement(name = "Ring", required = true)
    protected RingType ring;

    /**
     * Gets the value of the ring property.
     * 
     * @return
     *     possible object is
     *     {@link RingType }
     *     
     */
    public RingType getRing() {
        return ring;
    }

    /**
     * Sets the value of the ring property.
     * 
     * @param value
     *     allowed object is
     *     {@link RingType }
     *     
     */
    public void setRing(RingType value) {
        this.ring = value;
    }

}
