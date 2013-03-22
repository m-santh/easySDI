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
 * <p>Java class for GM03Comprehensive.Comprehensive.MD_AggregateInformation complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="GM03Comprehensive.Comprehensive.MD_AggregateInformation">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="associationType" type="{http://www.interlis.ch/INTERLIS2.2}GM03Comprehensive.Comprehensive.DS_AssociationTypeCode"/>
 *         &lt;element name="initiativeType" type="{http://www.interlis.ch/INTERLIS2.2}GM03Comprehensive.Comprehensive.DS_InitiativeTypeCode" minOccurs="0"/>
 *         &lt;element name="aggregateDataSetIdentifier" minOccurs="0">
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
@XmlType(name = "GM03Comprehensive.Comprehensive.MD_AggregateInformation", propOrder = {
    "associationType",
    "initiativeType",
    "aggregateDataSetIdentifier"
})
@XmlSeeAlso({
    ch.interlis.interlis2.GM03V18.GM03ComprehensiveComprehensive.GM03ComprehensiveComprehensiveMDAggregateInformation.class
})
public class GM03ComprehensiveComprehensiveMDAggregateInformation {

    @XmlElement(required = true)
    protected GM03ComprehensiveComprehensiveDSAssociationTypeCode associationType;
    protected GM03ComprehensiveComprehensiveDSInitiativeTypeCode initiativeType;
    protected GM03ComprehensiveComprehensiveMDAggregateInformation.AggregateDataSetIdentifier aggregateDataSetIdentifier;

    /**
     * Gets the value of the associationType property.
     * 
     * @return
     *     possible object is
     *     {@link GM03ComprehensiveComprehensiveDSAssociationTypeCode }
     *     
     */
    public GM03ComprehensiveComprehensiveDSAssociationTypeCode getAssociationType() {
        return associationType;
    }

    /**
     * Sets the value of the associationType property.
     * 
     * @param value
     *     allowed object is
     *     {@link GM03ComprehensiveComprehensiveDSAssociationTypeCode }
     *     
     */
    public void setAssociationType(GM03ComprehensiveComprehensiveDSAssociationTypeCode value) {
        this.associationType = value;
    }

    /**
     * Gets the value of the initiativeType property.
     * 
     * @return
     *     possible object is
     *     {@link GM03ComprehensiveComprehensiveDSInitiativeTypeCode }
     *     
     */
    public GM03ComprehensiveComprehensiveDSInitiativeTypeCode getInitiativeType() {
        return initiativeType;
    }

    /**
     * Sets the value of the initiativeType property.
     * 
     * @param value
     *     allowed object is
     *     {@link GM03ComprehensiveComprehensiveDSInitiativeTypeCode }
     *     
     */
    public void setInitiativeType(GM03ComprehensiveComprehensiveDSInitiativeTypeCode value) {
        this.initiativeType = value;
    }

    /**
     * Gets the value of the aggregateDataSetIdentifier property.
     * 
     * @return
     *     possible object is
     *     {@link GM03ComprehensiveComprehensiveMDAggregateInformation.AggregateDataSetIdentifier }
     *     
     */
    public GM03ComprehensiveComprehensiveMDAggregateInformation.AggregateDataSetIdentifier getAggregateDataSetIdentifier() {
        return aggregateDataSetIdentifier;
    }

    /**
     * Sets the value of the aggregateDataSetIdentifier property.
     * 
     * @param value
     *     allowed object is
     *     {@link GM03ComprehensiveComprehensiveMDAggregateInformation.AggregateDataSetIdentifier }
     *     
     */
    public void setAggregateDataSetIdentifier(GM03ComprehensiveComprehensiveMDAggregateInformation.AggregateDataSetIdentifier value) {
        this.aggregateDataSetIdentifier = value;
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
    public static class AggregateDataSetIdentifier {

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