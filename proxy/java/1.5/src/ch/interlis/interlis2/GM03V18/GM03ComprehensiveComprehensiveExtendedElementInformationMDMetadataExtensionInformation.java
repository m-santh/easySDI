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
 * <p>Java class for GM03Comprehensive.Comprehensive.extendedElementInformationMD_MetadataExtensionInformation complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="GM03Comprehensive.Comprehensive.extendedElementInformationMD_MetadataExtensionInformation">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="extendedElementInformation" type="{http://www.interlis.ch/INTERLIS2.2}RoleType"/>
 *         &lt;element name="MD_MetadataExtensionInformation" type="{http://www.interlis.ch/INTERLIS2.2}RoleType"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "GM03Comprehensive.Comprehensive.extendedElementInformationMD_MetadataExtensionInformation", propOrder = {
    "extendedElementInformation",
    "mdMetadataExtensionInformation"
})
@XmlSeeAlso({
    ch.interlis.interlis2.GM03V18.GM03ComprehensiveComprehensive.GM03ComprehensiveComprehensiveExtendedElementInformationMDMetadataExtensionInformation.class
})
public class GM03ComprehensiveComprehensiveExtendedElementInformationMDMetadataExtensionInformation {

    @XmlElement(required = true)
    protected RoleType extendedElementInformation;
    @XmlElement(name = "MD_MetadataExtensionInformation", required = true)
    protected RoleType mdMetadataExtensionInformation;

    /**
     * Gets the value of the extendedElementInformation property.
     * 
     * @return
     *     possible object is
     *     {@link RoleType }
     *     
     */
    public RoleType getExtendedElementInformation() {
        return extendedElementInformation;
    }

    /**
     * Sets the value of the extendedElementInformation property.
     * 
     * @param value
     *     allowed object is
     *     {@link RoleType }
     *     
     */
    public void setExtendedElementInformation(RoleType value) {
        this.extendedElementInformation = value;
    }

    /**
     * Gets the value of the mdMetadataExtensionInformation property.
     * 
     * @return
     *     possible object is
     *     {@link RoleType }
     *     
     */
    public RoleType getMDMetadataExtensionInformation() {
        return mdMetadataExtensionInformation;
    }

    /**
     * Sets the value of the mdMetadataExtensionInformation property.
     * 
     * @param value
     *     allowed object is
     *     {@link RoleType }
     *     
     */
    public void setMDMetadataExtensionInformation(RoleType value) {
        this.mdMetadataExtensionInformation = value;
    }

}