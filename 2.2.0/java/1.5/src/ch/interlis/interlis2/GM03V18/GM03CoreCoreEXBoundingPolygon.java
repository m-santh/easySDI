//
// This file was generated by the JavaTM Architecture for XML Binding(JAXB) Reference Implementation, vhudson-jaxb-ri-2.1-520 
// See <a href="http://java.sun.com/xml/jaxb">http://java.sun.com/xml/jaxb</a> 
// Any modifications to this file will be lost upon recompilation of the source schema. 
// Generated on: 2008.03.13 at 04:39:39 PM CET 
//


package ch.interlis.interlis2.GM03V18;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlSeeAlso;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for GM03Core.Core.EX_BoundingPolygon complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="GM03Core.Core.EX_BoundingPolygon">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="extentTypeCode" type="{http://www.interlis.ch/INTERLIS2.2}GM03Core.Core.Boolean" minOccurs="0"/>
 *         &lt;element name="polygon" type="{http://www.interlis.ch/INTERLIS2.2}GM03Core.Core.GM_Object"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "GM03Core.Core.EX_BoundingPolygon", propOrder = {
    "extentTypeCode",
    "polygon"
})
@XmlSeeAlso({
    ch.interlis.interlis2.GM03V18.GM03ComprehensiveComprehensive.GM03CoreCoreEXBoundingPolygon.class,
    ch.interlis.interlis2.GM03V18.GM03CoreCore.GM03CoreCoreEXBoundingPolygon.class
})
public class GM03CoreCoreEXBoundingPolygon {

    protected GM03CoreCoreBoolean extentTypeCode;
    @XmlElement(required = true)
    protected GM03CoreCoreGMObject polygon;

    /**
     * Gets the value of the extentTypeCode property.
     * 
     * @return
     *     possible object is
     *     {@link GM03CoreCoreBoolean }
     *     
     */
    public GM03CoreCoreBoolean getExtentTypeCode() {
        return extentTypeCode;
    }

    /**
     * Sets the value of the extentTypeCode property.
     * 
     * @param value
     *     allowed object is
     *     {@link GM03CoreCoreBoolean }
     *     
     */
    public void setExtentTypeCode(GM03CoreCoreBoolean value) {
        this.extentTypeCode = value;
    }

    /**
     * Gets the value of the polygon property.
     * 
     * @return
     *     possible object is
     *     {@link GM03CoreCoreGMObject }
     *     
     */
    public GM03CoreCoreGMObject getPolygon() {
        return polygon;
    }

    /**
     * Sets the value of the polygon property.
     * 
     * @param value
     *     allowed object is
     *     {@link GM03CoreCoreGMObject }
     *     
     */
    public void setPolygon(GM03CoreCoreGMObject value) {
        this.polygon = value;
    }

}