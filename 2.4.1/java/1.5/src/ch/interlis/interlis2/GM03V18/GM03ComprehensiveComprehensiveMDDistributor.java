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
 * <p>Java class for GM03Comprehensive.Comprehensive.MD_Distributor complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="GM03Comprehensive.Comprehensive.MD_Distributor">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="distributorContact">
 *           &lt;complexType>
 *             &lt;complexContent>
 *               &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *                 &lt;sequence>
 *                   &lt;element name="GM03Comprehensive.Comprehensive.MD_DistributordistributorContact" type="{http://www.interlis.ch/INTERLIS2.2}GM03Comprehensive.Comprehensive.MD_DistributordistributorContact"/>
 *                 &lt;/sequence>
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
@XmlType(name = "GM03Comprehensive.Comprehensive.MD_Distributor", propOrder = {
    "distributorContact"
})
@XmlSeeAlso({
    ch.interlis.interlis2.GM03V18.GM03ComprehensiveComprehensive.GM03ComprehensiveComprehensiveMDDistributor.class
})
public class GM03ComprehensiveComprehensiveMDDistributor {

    @XmlElement(required = true)
    protected GM03ComprehensiveComprehensiveMDDistributor.DistributorContact distributorContact;

    /**
     * Gets the value of the distributorContact property.
     * 
     * @return
     *     possible object is
     *     {@link GM03ComprehensiveComprehensiveMDDistributor.DistributorContact }
     *     
     */
    public GM03ComprehensiveComprehensiveMDDistributor.DistributorContact getDistributorContact() {
        return distributorContact;
    }

    /**
     * Sets the value of the distributorContact property.
     * 
     * @param value
     *     allowed object is
     *     {@link GM03ComprehensiveComprehensiveMDDistributor.DistributorContact }
     *     
     */
    public void setDistributorContact(GM03ComprehensiveComprehensiveMDDistributor.DistributorContact value) {
        this.distributorContact = value;
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
     *         &lt;element name="GM03Comprehensive.Comprehensive.MD_DistributordistributorContact" type="{http://www.interlis.ch/INTERLIS2.2}GM03Comprehensive.Comprehensive.MD_DistributordistributorContact"/>
     *       &lt;/sequence>
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
    @XmlType(name = "", propOrder = {
        "gm03ComprehensiveComprehensiveMDDistributordistributorContact"
    })
    public static class DistributorContact {

        @XmlElement(name = "GM03Comprehensive.Comprehensive.MD_DistributordistributorContact", required = true)
        protected GM03ComprehensiveComprehensiveMDDistributordistributorContact gm03ComprehensiveComprehensiveMDDistributordistributorContact;
        @XmlAttribute(name = "REF")
        protected String ref;
        @XmlAttribute(name = "EXTREF")
        protected String extref;
        @XmlAttribute(name = "BID")
        protected String bid;
        @XmlAttribute(name = "NEXT_TID")
        protected String nexttid;

        /**
         * Gets the value of the gm03ComprehensiveComprehensiveMDDistributordistributorContact property.
         * 
         * @return
         *     possible object is
         *     {@link GM03ComprehensiveComprehensiveMDDistributordistributorContact }
         *     
         */
        public GM03ComprehensiveComprehensiveMDDistributordistributorContact getGM03ComprehensiveComprehensiveMDDistributordistributorContact() {
            return gm03ComprehensiveComprehensiveMDDistributordistributorContact;
        }

        /**
         * Sets the value of the gm03ComprehensiveComprehensiveMDDistributordistributorContact property.
         * 
         * @param value
         *     allowed object is
         *     {@link GM03ComprehensiveComprehensiveMDDistributordistributorContact }
         *     
         */
        public void setGM03ComprehensiveComprehensiveMDDistributordistributorContact(GM03ComprehensiveComprehensiveMDDistributordistributorContact value) {
            this.gm03ComprehensiveComprehensiveMDDistributordistributorContact = value;
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

}
