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
 * <p>Java class for GM03Core.Core.descriptiveKeywordsMD_Identification complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="GM03Core.Core.descriptiveKeywordsMD_Identification">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="descriptiveKeywords" type="{http://www.interlis.ch/INTERLIS2.2}RoleType"/>
 *         &lt;element name="MD_Identification" type="{http://www.interlis.ch/INTERLIS2.2}RoleType"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "GM03Core.Core.descriptiveKeywordsMD_Identification", propOrder = {
    "descriptiveKeywords",
    "mdIdentification"
})
@XmlSeeAlso({
    ch.interlis.interlis2.GM03V18.GM03ComprehensiveComprehensive.GM03CoreCoreDescriptiveKeywordsMDIdentification.class,
    ch.interlis.interlis2.GM03V18.GM03CoreCore.GM03CoreCoreDescriptiveKeywordsMDIdentification.class
})
public class GM03CoreCoreDescriptiveKeywordsMDIdentification {

    @XmlElement(required = true)
    protected RoleType descriptiveKeywords;
    @XmlElement(name = "MD_Identification", required = true)
    protected RoleType mdIdentification;

    /**
     * Gets the value of the descriptiveKeywords property.
     * 
     * @return
     *     possible object is
     *     {@link RoleType }
     *     
     */
    public RoleType getDescriptiveKeywords() {
        return descriptiveKeywords;
    }

    /**
     * Sets the value of the descriptiveKeywords property.
     * 
     * @param value
     *     allowed object is
     *     {@link RoleType }
     *     
     */
    public void setDescriptiveKeywords(RoleType value) {
        this.descriptiveKeywords = value;
    }

    /**
     * Gets the value of the mdIdentification property.
     * 
     * @return
     *     possible object is
     *     {@link RoleType }
     *     
     */
    public RoleType getMDIdentification() {
        return mdIdentification;
    }

    /**
     * Sets the value of the mdIdentification property.
     * 
     * @param value
     *     allowed object is
     *     {@link RoleType }
     *     
     */
    public void setMDIdentification(RoleType value) {
        this.mdIdentification = value;
    }

}
