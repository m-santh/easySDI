//
// This file was generated by the JavaTM Architecture for XML Binding(JAXB) Reference Implementation, vhudson-jaxb-ri-2.1-520 
// See <a href="http://java.sun.com/xml/jaxb">http://java.sun.com/xml/jaxb</a> 
// Any modifications to this file will be lost upon recompilation of the source schema. 
// Generated on: 2008.03.13 at 04:39:39 PM CET 
//


package ch.interlis.interlis2.GM03V18;

import java.util.ArrayList;
import java.util.List;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlSeeAlso;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for GM03Comprehensive.Comprehensive.MD_Georectified complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="GM03Comprehensive.Comprehensive.MD_Georectified">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="numberOfDimensions" type="{http://www.interlis.ch/INTERLIS2.2}GM03Core.Core.Integer"/>
 *         &lt;element name="cellGeometry" type="{http://www.interlis.ch/INTERLIS2.2}GM03Comprehensive.Comprehensive.MD_CellGeometryCode"/>
 *         &lt;element name="transformationParameterAvailability" type="{http://www.interlis.ch/INTERLIS2.2}GM03Core.Core.Boolean"/>
 *         &lt;element name="checkPointAvailability" type="{http://www.interlis.ch/INTERLIS2.2}GM03Core.Core.Boolean"/>
 *         &lt;element name="checkPointDescription" type="{http://www.interlis.ch/INTERLIS2.2}GM03Core.Core.CharacterString" minOccurs="0"/>
 *         &lt;element name="cornerPoints" minOccurs="0">
 *           &lt;complexType>
 *             &lt;complexContent>
 *               &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *                 &lt;sequence>
 *                   &lt;element name="GM03Core.Core.GM_Point_" type="{http://www.interlis.ch/INTERLIS2.2}GM03Core.Core.GM_Point_" maxOccurs="unbounded"/>
 *                 &lt;/sequence>
 *               &lt;/restriction>
 *             &lt;/complexContent>
 *           &lt;/complexType>
 *         &lt;/element>
 *         &lt;element name="centerPoint" type="{http://www.interlis.ch/INTERLIS2.2}GM03Core.Core.GM_Point" minOccurs="0"/>
 *         &lt;element name="pointInPixel" type="{http://www.interlis.ch/INTERLIS2.2}GM03Comprehensive.Comprehensive.MD_PixelOrientationCode"/>
 *         &lt;element name="transformationDimensionDescription" type="{http://www.interlis.ch/INTERLIS2.2}GM03Core.Core.CharacterString" minOccurs="0"/>
 *         &lt;element name="transformationDimensionMapping" minOccurs="0">
 *           &lt;complexType>
 *             &lt;complexContent>
 *               &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *                 &lt;sequence>
 *                   &lt;element name="GM03Core.Core.CharacterString_" type="{http://www.interlis.ch/INTERLIS2.2}GM03Core.Core.CharacterString_" maxOccurs="2"/>
 *                 &lt;/sequence>
 *               &lt;/restriction>
 *             &lt;/complexContent>
 *           &lt;/complexType>
 *         &lt;/element>
 *         &lt;element name="MD_Metadata" minOccurs="0">
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
@XmlType(name = "GM03Comprehensive.Comprehensive.MD_Georectified", propOrder = {
    "numberOfDimensions",
    "cellGeometry",
    "transformationParameterAvailability",
    "checkPointAvailability",
    "checkPointDescription",
    "cornerPoints",
    "centerPoint",
    "pointInPixel",
    "transformationDimensionDescription",
    "transformationDimensionMapping",
    "mdMetadata"
})
@XmlSeeAlso({
    ch.interlis.interlis2.GM03V18.GM03ComprehensiveComprehensive.GM03ComprehensiveComprehensiveMDGeorectified.class
})
public class GM03ComprehensiveComprehensiveMDGeorectified {

    protected double numberOfDimensions;
    @XmlElement(required = true)
    protected GM03ComprehensiveComprehensiveMDCellGeometryCode cellGeometry;
    @XmlElement(required = true)
    protected GM03CoreCoreBoolean transformationParameterAvailability;
    @XmlElement(required = true)
    protected GM03CoreCoreBoolean checkPointAvailability;
    protected String checkPointDescription;
    protected GM03ComprehensiveComprehensiveMDGeorectified.CornerPoints cornerPoints;
    protected GM03CoreCoreGMPoint centerPoint;
    @XmlElement(required = true)
    protected GM03ComprehensiveComprehensiveMDPixelOrientationCode pointInPixel;
    protected String transformationDimensionDescription;
    protected GM03ComprehensiveComprehensiveMDGeorectified.TransformationDimensionMapping transformationDimensionMapping;
    @XmlElement(name = "MD_Metadata")
    protected GM03ComprehensiveComprehensiveMDGeorectified.MDMetadata mdMetadata;

    /**
     * Gets the value of the numberOfDimensions property.
     * 
     */
    public double getNumberOfDimensions() {
        return numberOfDimensions;
    }

    /**
     * Sets the value of the numberOfDimensions property.
     * 
     */
    public void setNumberOfDimensions(double value) {
        this.numberOfDimensions = value;
    }

    /**
     * Gets the value of the cellGeometry property.
     * 
     * @return
     *     possible object is
     *     {@link GM03ComprehensiveComprehensiveMDCellGeometryCode }
     *     
     */
    public GM03ComprehensiveComprehensiveMDCellGeometryCode getCellGeometry() {
        return cellGeometry;
    }

    /**
     * Sets the value of the cellGeometry property.
     * 
     * @param value
     *     allowed object is
     *     {@link GM03ComprehensiveComprehensiveMDCellGeometryCode }
     *     
     */
    public void setCellGeometry(GM03ComprehensiveComprehensiveMDCellGeometryCode value) {
        this.cellGeometry = value;
    }

    /**
     * Gets the value of the transformationParameterAvailability property.
     * 
     * @return
     *     possible object is
     *     {@link GM03CoreCoreBoolean }
     *     
     */
    public GM03CoreCoreBoolean getTransformationParameterAvailability() {
        return transformationParameterAvailability;
    }

    /**
     * Sets the value of the transformationParameterAvailability property.
     * 
     * @param value
     *     allowed object is
     *     {@link GM03CoreCoreBoolean }
     *     
     */
    public void setTransformationParameterAvailability(GM03CoreCoreBoolean value) {
        this.transformationParameterAvailability = value;
    }

    /**
     * Gets the value of the checkPointAvailability property.
     * 
     * @return
     *     possible object is
     *     {@link GM03CoreCoreBoolean }
     *     
     */
    public GM03CoreCoreBoolean getCheckPointAvailability() {
        return checkPointAvailability;
    }

    /**
     * Sets the value of the checkPointAvailability property.
     * 
     * @param value
     *     allowed object is
     *     {@link GM03CoreCoreBoolean }
     *     
     */
    public void setCheckPointAvailability(GM03CoreCoreBoolean value) {
        this.checkPointAvailability = value;
    }

    /**
     * Gets the value of the checkPointDescription property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getCheckPointDescription() {
        return checkPointDescription;
    }

    /**
     * Sets the value of the checkPointDescription property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setCheckPointDescription(String value) {
        this.checkPointDescription = value;
    }

    /**
     * Gets the value of the cornerPoints property.
     * 
     * @return
     *     possible object is
     *     {@link GM03ComprehensiveComprehensiveMDGeorectified.CornerPoints }
     *     
     */
    public GM03ComprehensiveComprehensiveMDGeorectified.CornerPoints getCornerPoints() {
        return cornerPoints;
    }

    /**
     * Sets the value of the cornerPoints property.
     * 
     * @param value
     *     allowed object is
     *     {@link GM03ComprehensiveComprehensiveMDGeorectified.CornerPoints }
     *     
     */
    public void setCornerPoints(GM03ComprehensiveComprehensiveMDGeorectified.CornerPoints value) {
        this.cornerPoints = value;
    }

    /**
     * Gets the value of the centerPoint property.
     * 
     * @return
     *     possible object is
     *     {@link GM03CoreCoreGMPoint }
     *     
     */
    public GM03CoreCoreGMPoint getCenterPoint() {
        return centerPoint;
    }

    /**
     * Sets the value of the centerPoint property.
     * 
     * @param value
     *     allowed object is
     *     {@link GM03CoreCoreGMPoint }
     *     
     */
    public void setCenterPoint(GM03CoreCoreGMPoint value) {
        this.centerPoint = value;
    }

    /**
     * Gets the value of the pointInPixel property.
     * 
     * @return
     *     possible object is
     *     {@link GM03ComprehensiveComprehensiveMDPixelOrientationCode }
     *     
     */
    public GM03ComprehensiveComprehensiveMDPixelOrientationCode getPointInPixel() {
        return pointInPixel;
    }

    /**
     * Sets the value of the pointInPixel property.
     * 
     * @param value
     *     allowed object is
     *     {@link GM03ComprehensiveComprehensiveMDPixelOrientationCode }
     *     
     */
    public void setPointInPixel(GM03ComprehensiveComprehensiveMDPixelOrientationCode value) {
        this.pointInPixel = value;
    }

    /**
     * Gets the value of the transformationDimensionDescription property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getTransformationDimensionDescription() {
        return transformationDimensionDescription;
    }

    /**
     * Sets the value of the transformationDimensionDescription property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setTransformationDimensionDescription(String value) {
        this.transformationDimensionDescription = value;
    }

    /**
     * Gets the value of the transformationDimensionMapping property.
     * 
     * @return
     *     possible object is
     *     {@link GM03ComprehensiveComprehensiveMDGeorectified.TransformationDimensionMapping }
     *     
     */
    public GM03ComprehensiveComprehensiveMDGeorectified.TransformationDimensionMapping getTransformationDimensionMapping() {
        return transformationDimensionMapping;
    }

    /**
     * Sets the value of the transformationDimensionMapping property.
     * 
     * @param value
     *     allowed object is
     *     {@link GM03ComprehensiveComprehensiveMDGeorectified.TransformationDimensionMapping }
     *     
     */
    public void setTransformationDimensionMapping(GM03ComprehensiveComprehensiveMDGeorectified.TransformationDimensionMapping value) {
        this.transformationDimensionMapping = value;
    }

    /**
     * Gets the value of the mdMetadata property.
     * 
     * @return
     *     possible object is
     *     {@link GM03ComprehensiveComprehensiveMDGeorectified.MDMetadata }
     *     
     */
    public GM03ComprehensiveComprehensiveMDGeorectified.MDMetadata getMDMetadata() {
        return mdMetadata;
    }

    /**
     * Sets the value of the mdMetadata property.
     * 
     * @param value
     *     allowed object is
     *     {@link GM03ComprehensiveComprehensiveMDGeorectified.MDMetadata }
     *     
     */
    public void setMDMetadata(GM03ComprehensiveComprehensiveMDGeorectified.MDMetadata value) {
        this.mdMetadata = value;
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
     *       &lt;sequence>
     *         &lt;element name="GM03Core.Core.GM_Point_" type="{http://www.interlis.ch/INTERLIS2.2}GM03Core.Core.GM_Point_" maxOccurs="unbounded"/>
     *       &lt;/sequence>
     *     &lt;/restriction>
     *   &lt;/complexContent>
     * &lt;/complexType>
     * </pre>
     * 
     * 
     */
    @XmlAccessorType(XmlAccessType.FIELD)
    @XmlType(name = "", propOrder = {
        "gm03CoreCoreGMPoint"
    })
    public static class CornerPoints {

        @XmlElement(name = "GM03Core.Core.GM_Point_", required = true)
        protected List<GM03CoreCoreGMPOINT2> gm03CoreCoreGMPoint;

        /**
         * Gets the value of the gm03CoreCoreGMPoint property.
         * 
         * <p>
         * This accessor method returns a reference to the live list,
         * not a snapshot. Therefore any modification you make to the
         * returned list will be present inside the JAXB object.
         * This is why there is not a <CODE>set</CODE> method for the gm03CoreCoreGMPoint property.
         * 
         * <p>
         * For example, to add a new item, do as follows:
         * <pre>
         *    getGM03CoreCoreGMPoint().add(newItem);
         * </pre>
         * 
         * 
         * <p>
         * Objects of the following type(s) are allowed in the list
         * {@link GM03CoreCoreGMPOINT2 }
         * 
         * 
         */
        public List<GM03CoreCoreGMPOINT2> getGM03CoreCoreGMPoint() {
            if (gm03CoreCoreGMPoint == null) {
                gm03CoreCoreGMPoint = new ArrayList<GM03CoreCoreGMPOINT2>();
            }
            return this.gm03CoreCoreGMPoint;
        }

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
    public static class MDMetadata {

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


    /**
     * <p>Java class for anonymous complex type.
     * 
     * <p>The following schema fragment specifies the expected content contained within this class.
     * 
     * <pre>
     * &lt;complexType>
     *   &lt;complexContent>
     *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
     *       &lt;sequence>
     *         &lt;element name="GM03Core.Core.CharacterString_" type="{http://www.interlis.ch/INTERLIS2.2}GM03Core.Core.CharacterString_" maxOccurs="2"/>
     *       &lt;/sequence>
     *     &lt;/restriction>
     *   &lt;/complexContent>
     * &lt;/complexType>
     * </pre>
     * 
     * 
     */
    @XmlAccessorType(XmlAccessType.FIELD)
    @XmlType(name = "", propOrder = {
        "gm03CoreCoreCharacterString"
    })
    public static class TransformationDimensionMapping {

        @XmlElement(name = "GM03Core.Core.CharacterString_", required = true)
        protected List<GM03CoreCoreCharacterString> gm03CoreCoreCharacterString;

        /**
         * Gets the value of the gm03CoreCoreCharacterString property.
         * 
         * <p>
         * This accessor method returns a reference to the live list,
         * not a snapshot. Therefore any modification you make to the
         * returned list will be present inside the JAXB object.
         * This is why there is not a <CODE>set</CODE> method for the gm03CoreCoreCharacterString property.
         * 
         * <p>
         * For example, to add a new item, do as follows:
         * <pre>
         *    getGM03CoreCoreCharacterString().add(newItem);
         * </pre>
         * 
         * 
         * <p>
         * Objects of the following type(s) are allowed in the list
         * {@link GM03CoreCoreCharacterString }
         * 
         * 
         */
        public List<GM03CoreCoreCharacterString> getGM03CoreCoreCharacterString() {
            if (gm03CoreCoreCharacterString == null) {
                gm03CoreCoreCharacterString = new ArrayList<GM03CoreCoreCharacterString>();
            }
            return this.gm03CoreCoreCharacterString;
        }

    }

}