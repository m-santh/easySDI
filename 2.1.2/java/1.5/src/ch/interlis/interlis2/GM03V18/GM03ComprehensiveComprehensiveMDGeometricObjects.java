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
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlSeeAlso;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for GM03Comprehensive.Comprehensive.MD_GeometricObjects complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="GM03Comprehensive.Comprehensive.MD_GeometricObjects">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="geometricObjectType" type="{http://www.interlis.ch/INTERLIS2.2}GM03Comprehensive.Comprehensive.MD_GeometricObjectTypeCode"/>
 *         &lt;element name="geometricObjectCount" type="{http://www.interlis.ch/INTERLIS2.2}GM03Core.Core.Integer" minOccurs="0"/>
 *         &lt;element name="MD_VectorSpatialRepresentation" minOccurs="0">
 *           &lt;complexType>
 *             &lt;complexContent>
 *               &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *                 &lt;attribute name="REF" type="{http://www.interlis.ch/INTERLIS2.2}IliID" />
 *                 &lt;attribute name="EXTREF" type="{http://www.interlis.ch/INTERLIS2.2}IliID" />
 *                 &lt;attribute name="BID" type="{http://www.interlis.ch/INTERLIS2.2}IliID" />
 *                 &lt;attribute name="NEXT_TID" type="{http://www.interlis.ch/INTERLIS2.2}IliID" />
 *               &lt;/restriction>
 *             &lt;/complexContent>
 *           &lt;/complexType>
 *         &lt;/element>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "GM03Comprehensive.Comprehensive.MD_GeometricObjects", propOrder = {
    "geometricObjectType",
    "geometricObjectCount",
    "mdVectorSpatialRepresentation"
})
@XmlSeeAlso({
    ch.interlis.interlis2.GM03V18.GM03ComprehensiveComprehensive.GM03ComprehensiveComprehensiveMDGeometricObjects.class
})
public class GM03ComprehensiveComprehensiveMDGeometricObjects {

    @XmlElement(required = true)
    protected GM03ComprehensiveComprehensiveMDGeometricObjectTypeCode geometricObjectType;
    protected Double geometricObjectCount;
    @XmlElement(name = "MD_VectorSpatialRepresentation")
    protected GM03ComprehensiveComprehensiveMDGeometricObjects.MDVectorSpatialRepresentation mdVectorSpatialRepresentation;

    /**
     * Gets the value of the geometricObjectType property.
     * 
     * @return
     *     possible object is
     *     {@link GM03ComprehensiveComprehensiveMDGeometricObjectTypeCode }
     *     
     */
    public GM03ComprehensiveComprehensiveMDGeometricObjectTypeCode getGeometricObjectType() {
        return geometricObjectType;
    }

    /**
     * Sets the value of the geometricObjectType property.
     * 
     * @param value
     *     allowed object is
     *     {@link GM03ComprehensiveComprehensiveMDGeometricObjectTypeCode }
     *     
     */
    public void setGeometricObjectType(GM03ComprehensiveComprehensiveMDGeometricObjectTypeCode value) {
        this.geometricObjectType = value;
    }

    /**
     * Gets the value of the geometricObjectCount property.
     * 
     * @return
     *     possible object is
     *     {@link Double }
     *     
     */
    public Double getGeometricObjectCount() {
        return geometricObjectCount;
    }

    /**
     * Sets the value of the geometricObjectCount property.
     * 
     * @param value
     *     allowed object is
     *     {@link Double }
     *     
     */
    public void setGeometricObjectCount(Double value) {
        this.geometricObjectCount = value;
    }

    /**
     * Gets the value of the mdVectorSpatialRepresentation property.
     * 
     * @return
     *     possible object is
     *     {@link GM03ComprehensiveComprehensiveMDGeometricObjects.MDVectorSpatialRepresentation }
     *     
     */
    public GM03ComprehensiveComprehensiveMDGeometricObjects.MDVectorSpatialRepresentation getMDVectorSpatialRepresentation() {
        return mdVectorSpatialRepresentation;
    }

    /**
     * Sets the value of the mdVectorSpatialRepresentation property.
     * 
     * @param value
     *     allowed object is
     *     {@link GM03ComprehensiveComprehensiveMDGeometricObjects.MDVectorSpatialRepresentation }
     *     
     */
    public void setMDVectorSpatialRepresentation(GM03ComprehensiveComprehensiveMDGeometricObjects.MDVectorSpatialRepresentation value) {
        this.mdVectorSpatialRepresentation = value;
    }


    /**
     * <p>Java class for anonymous complex type.
     * 
     * <p>The following schema fragment specifies the expected content contained within this class.
     * 
     * <pre>
     * &lt;complexType>
     *   &lt;complexContent>
     *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
     *       &lt;attribute name="REF" type="{http://www.interlis.ch/INTERLIS2.2}IliID" />
     *       &lt;attribute name="EXTREF" type="{http://www.interlis.ch/INTERLIS2.2}IliID" />
     *       &lt;attribute name="BID" type="{http://www.interlis.ch/INTERLIS2.2}IliID" />
     *       &lt;attribute name="NEXT_TID" type="{http://www.interlis.ch/INTERLIS2.2}IliID" />
     *     &lt;/restriction>
     *   &lt;/complexContent>
     * &lt;/complexType>
     * </pre>
     * 
     * 
     */
    @XmlAccessorType(XmlAccessType.FIELD)
    @XmlType(name = "")
    public static class MDVectorSpatialRepresentation {

        @XmlAttribute(name = "REF")
        protected String ref;
        @XmlAttribute(name = "EXTREF")
        protected String extref;
        @XmlAttribute(name = "BID")
        protected String bid;
        @XmlAttribute(name = "NEXT_TID")
        protected String nexttid;

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

}