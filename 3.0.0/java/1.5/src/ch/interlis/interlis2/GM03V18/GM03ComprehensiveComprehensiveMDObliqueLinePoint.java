//
// This file was generated by the JavaTM Architecture for XML Binding(JAXB) Reference Implementation, vhudson-jaxb-ri-2.1-520 
// See <a href="http://java.sun.com/xml/jaxb">http://java.sun.com/xml/jaxb</a> 
// Any modifications to this file will be lost upon recompilation of the source schema. 
// Generated on: 2008.03.13 at 04:39:39 PM CET 
//


package ch.interlis.interlis2.GM03V18;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlSeeAlso;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for GM03Comprehensive.Comprehensive.MD_ObliqueLinePoint complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="GM03Comprehensive.Comprehensive.MD_ObliqueLinePoint">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="azimuthLineLatitude" type="{http://www.interlis.ch/INTERLIS2.2}GM03Core.Core.Real"/>
 *         &lt;element name="azimuthLineLongitude" type="{http://www.interlis.ch/INTERLIS2.2}GM03Core.Core.Real"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "GM03Comprehensive.Comprehensive.MD_ObliqueLinePoint", propOrder = {
    "azimuthLineLatitude",
    "azimuthLineLongitude"
})
@XmlSeeAlso({
    ch.interlis.interlis2.GM03V18.GM03ComprehensiveComprehensive.GM03ComprehensiveComprehensiveMDObliqueLinePoint.class
})
public class GM03ComprehensiveComprehensiveMDObliqueLinePoint {

    protected double azimuthLineLatitude;
    protected double azimuthLineLongitude;

    /**
     * Gets the value of the azimuthLineLatitude property.
     * 
     */
    public double getAzimuthLineLatitude() {
        return azimuthLineLatitude;
    }

    /**
     * Sets the value of the azimuthLineLatitude property.
     * 
     */
    public void setAzimuthLineLatitude(double value) {
        this.azimuthLineLatitude = value;
    }

    /**
     * Gets the value of the azimuthLineLongitude property.
     * 
     */
    public double getAzimuthLineLongitude() {
        return azimuthLineLongitude;
    }

    /**
     * Sets the value of the azimuthLineLongitude property.
     * 
     */
    public void setAzimuthLineLongitude(double value) {
        this.azimuthLineLongitude = value;
    }

}