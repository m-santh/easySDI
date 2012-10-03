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
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlSeeAlso;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for GM03Comprehensive.Comprehensive.MD_ExtendedElementInformation complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="GM03Comprehensive.Comprehensive.MD_ExtendedElementInformation">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="name" type="{http://www.interlis.ch/INTERLIS2.2}GM03Core.Core.CharacterString"/>
 *         &lt;element name="shortName" type="{http://www.interlis.ch/INTERLIS2.2}GM03Core.Core.CharacterString" minOccurs="0"/>
 *         &lt;element name="domainCode" type="{http://www.interlis.ch/INTERLIS2.2}GM03Core.Core.Integer" minOccurs="0"/>
 *         &lt;element name="definition" type="{http://www.interlis.ch/INTERLIS2.2}GM03Core.Core.CharacterString"/>
 *         &lt;element name="obligation" type="{http://www.interlis.ch/INTERLIS2.2}GM03Comprehensive.Comprehensive.MD_ObligationCode" minOccurs="0"/>
 *         &lt;element name="condition" type="{http://www.interlis.ch/INTERLIS2.2}GM03Core.Core.CharacterString" minOccurs="0"/>
 *         &lt;element name="dataType" type="{http://www.interlis.ch/INTERLIS2.2}GM03Comprehensive.Comprehensive.MD_DatatypeCode"/>
 *         &lt;element name="maximumOccurence" type="{http://www.interlis.ch/INTERLIS2.2}GM03Core.Core.CharacterString" minOccurs="0"/>
 *         &lt;element name="domainValue" type="{http://www.interlis.ch/INTERLIS2.2}GM03Core.Core.CharacterString" minOccurs="0"/>
 *         &lt;element name="parentEntity">
 *           &lt;complexType>
 *             &lt;complexContent>
 *               &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *                 &lt;sequence>
 *                   &lt;element name="GM03Core.Core.CharacterString_" type="{http://www.interlis.ch/INTERLIS2.2}GM03Core.Core.CharacterString_" maxOccurs="unbounded"/>
 *                 &lt;/sequence>
 *               &lt;/restriction>
 *             &lt;/complexContent>
 *           &lt;/complexType>
 *         &lt;/element>
 *         &lt;element name="rule" type="{http://www.interlis.ch/INTERLIS2.2}GM03Core.Core.CharacterString"/>
 *         &lt;element name="rationale" minOccurs="0">
 *           &lt;complexType>
 *             &lt;complexContent>
 *               &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *                 &lt;sequence>
 *                   &lt;element name="GM03Core.Core.CharacterString_" type="{http://www.interlis.ch/INTERLIS2.2}GM03Core.Core.CharacterString_" maxOccurs="unbounded"/>
 *                 &lt;/sequence>
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
@XmlType(name = "GM03Comprehensive.Comprehensive.MD_ExtendedElementInformation", propOrder = {
    "name",
    "shortName",
    "domainCode",
    "definition",
    "obligation",
    "condition",
    "dataType",
    "maximumOccurence",
    "domainValue",
    "parentEntity",
    "rule",
    "rationale"
})
@XmlSeeAlso({
    ch.interlis.interlis2.GM03V18.GM03ComprehensiveComprehensive.GM03ComprehensiveComprehensiveMDExtendedElementInformation.class
})
public class GM03ComprehensiveComprehensiveMDExtendedElementInformation {

    @XmlElement(required = true)
    protected String name;
    protected String shortName;
    protected Double domainCode;
    @XmlElement(required = true)
    protected String definition;
    protected GM03ComprehensiveComprehensiveMDObligationCode obligation;
    protected String condition;
    @XmlElement(required = true)
    protected GM03ComprehensiveComprehensiveMDDatatypeCode dataType;
    protected String maximumOccurence;
    protected String domainValue;
    @XmlElement(required = true)
    protected GM03ComprehensiveComprehensiveMDExtendedElementInformation.ParentEntity parentEntity;
    @XmlElement(required = true)
    protected String rule;
    protected GM03ComprehensiveComprehensiveMDExtendedElementInformation.Rationale rationale;

    /**
     * Gets the value of the name property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the value of the name property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setName(String value) {
        this.name = value;
    }

    /**
     * Gets the value of the shortName property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getShortName() {
        return shortName;
    }

    /**
     * Sets the value of the shortName property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setShortName(String value) {
        this.shortName = value;
    }

    /**
     * Gets the value of the domainCode property.
     * 
     * @return
     *     possible object is
     *     {@link Double }
     *     
     */
    public Double getDomainCode() {
        return domainCode;
    }

    /**
     * Sets the value of the domainCode property.
     * 
     * @param value
     *     allowed object is
     *     {@link Double }
     *     
     */
    public void setDomainCode(Double value) {
        this.domainCode = value;
    }

    /**
     * Gets the value of the definition property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getDefinition() {
        return definition;
    }

    /**
     * Sets the value of the definition property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setDefinition(String value) {
        this.definition = value;
    }

    /**
     * Gets the value of the obligation property.
     * 
     * @return
     *     possible object is
     *     {@link GM03ComprehensiveComprehensiveMDObligationCode }
     *     
     */
    public GM03ComprehensiveComprehensiveMDObligationCode getObligation() {
        return obligation;
    }

    /**
     * Sets the value of the obligation property.
     * 
     * @param value
     *     allowed object is
     *     {@link GM03ComprehensiveComprehensiveMDObligationCode }
     *     
     */
    public void setObligation(GM03ComprehensiveComprehensiveMDObligationCode value) {
        this.obligation = value;
    }

    /**
     * Gets the value of the condition property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getCondition() {
        return condition;
    }

    /**
     * Sets the value of the condition property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setCondition(String value) {
        this.condition = value;
    }

    /**
     * Gets the value of the dataType property.
     * 
     * @return
     *     possible object is
     *     {@link GM03ComprehensiveComprehensiveMDDatatypeCode }
     *     
     */
    public GM03ComprehensiveComprehensiveMDDatatypeCode getDataType() {
        return dataType;
    }

    /**
     * Sets the value of the dataType property.
     * 
     * @param value
     *     allowed object is
     *     {@link GM03ComprehensiveComprehensiveMDDatatypeCode }
     *     
     */
    public void setDataType(GM03ComprehensiveComprehensiveMDDatatypeCode value) {
        this.dataType = value;
    }

    /**
     * Gets the value of the maximumOccurence property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getMaximumOccurence() {
        return maximumOccurence;
    }

    /**
     * Sets the value of the maximumOccurence property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setMaximumOccurence(String value) {
        this.maximumOccurence = value;
    }

    /**
     * Gets the value of the domainValue property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getDomainValue() {
        return domainValue;
    }

    /**
     * Sets the value of the domainValue property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setDomainValue(String value) {
        this.domainValue = value;
    }

    /**
     * Gets the value of the parentEntity property.
     * 
     * @return
     *     possible object is
     *     {@link GM03ComprehensiveComprehensiveMDExtendedElementInformation.ParentEntity }
     *     
     */
    public GM03ComprehensiveComprehensiveMDExtendedElementInformation.ParentEntity getParentEntity() {
        return parentEntity;
    }

    /**
     * Sets the value of the parentEntity property.
     * 
     * @param value
     *     allowed object is
     *     {@link GM03ComprehensiveComprehensiveMDExtendedElementInformation.ParentEntity }
     *     
     */
    public void setParentEntity(GM03ComprehensiveComprehensiveMDExtendedElementInformation.ParentEntity value) {
        this.parentEntity = value;
    }

    /**
     * Gets the value of the rule property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getRule() {
        return rule;
    }

    /**
     * Sets the value of the rule property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setRule(String value) {
        this.rule = value;
    }

    /**
     * Gets the value of the rationale property.
     * 
     * @return
     *     possible object is
     *     {@link GM03ComprehensiveComprehensiveMDExtendedElementInformation.Rationale }
     *     
     */
    public GM03ComprehensiveComprehensiveMDExtendedElementInformation.Rationale getRationale() {
        return rationale;
    }

    /**
     * Sets the value of the rationale property.
     * 
     * @param value
     *     allowed object is
     *     {@link GM03ComprehensiveComprehensiveMDExtendedElementInformation.Rationale }
     *     
     */
    public void setRationale(GM03ComprehensiveComprehensiveMDExtendedElementInformation.Rationale value) {
        this.rationale = value;
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
     *         &lt;element name="GM03Core.Core.CharacterString_" type="{http://www.interlis.ch/INTERLIS2.2}GM03Core.Core.CharacterString_" maxOccurs="unbounded"/>
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
    public static class ParentEntity {

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
     *         &lt;element name="GM03Core.Core.CharacterString_" type="{http://www.interlis.ch/INTERLIS2.2}GM03Core.Core.CharacterString_" maxOccurs="unbounded"/>
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
    public static class Rationale {

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