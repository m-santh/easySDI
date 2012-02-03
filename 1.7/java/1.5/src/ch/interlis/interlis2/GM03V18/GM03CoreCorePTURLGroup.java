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
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for GM03Core.Core.PT_URLGroup complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="GM03Core.Core.PT_URLGroup">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="language" type="{http://www.interlis.ch/INTERLIS2.2}CodeISO.LanguageCodeISO" minOccurs="0"/>
 *         &lt;element name="country" type="{http://www.interlis.ch/INTERLIS2.2}CodeISO.CountryCodeISO" minOccurs="0"/>
 *         &lt;element name="characterSetCode" type="{http://www.interlis.ch/INTERLIS2.2}GM03Core.Core.MD_CharacterSetCode" minOccurs="0"/>
 *         &lt;element name="plainURL" type="{http://www.interlis.ch/INTERLIS2.2}GM03Core.Core.URL"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "GM03Core.Core.PT_URLGroup", propOrder = {
    "language",
    "country",
    "characterSetCode",
    "plainURL"
})
public class GM03CoreCorePTURLGroup {

    protected CodeISOLanguageCodeISO language;
    protected CodeISOCountryCodeISO country;
    protected GM03CoreCoreMDCharacterSetCode characterSetCode;
    @XmlElement(required = true)
    protected GM03CoreCoreURL2 plainURL;

    /**
     * Gets the value of the language property.
     * 
     * @return
     *     possible object is
     *     {@link CodeISOLanguageCodeISO }
     *     
     */
    public CodeISOLanguageCodeISO getLanguage() {
        return language;
    }

    /**
     * Sets the value of the language property.
     * 
     * @param value
     *     allowed object is
     *     {@link CodeISOLanguageCodeISO }
     *     
     */
    public void setLanguage(CodeISOLanguageCodeISO value) {
        this.language = value;
    }

    /**
     * Gets the value of the country property.
     * 
     * @return
     *     possible object is
     *     {@link CodeISOCountryCodeISO }
     *     
     */
    public CodeISOCountryCodeISO getCountry() {
        return country;
    }

    /**
     * Sets the value of the country property.
     * 
     * @param value
     *     allowed object is
     *     {@link CodeISOCountryCodeISO }
     *     
     */
    public void setCountry(CodeISOCountryCodeISO value) {
        this.country = value;
    }

    /**
     * Gets the value of the characterSetCode property.
     * 
     * @return
     *     possible object is
     *     {@link GM03CoreCoreMDCharacterSetCode }
     *     
     */
    public GM03CoreCoreMDCharacterSetCode getCharacterSetCode() {
        return characterSetCode;
    }

    /**
     * Sets the value of the characterSetCode property.
     * 
     * @param value
     *     allowed object is
     *     {@link GM03CoreCoreMDCharacterSetCode }
     *     
     */
    public void setCharacterSetCode(GM03CoreCoreMDCharacterSetCode value) {
        this.characterSetCode = value;
    }

    /**
     * Gets the value of the plainURL property.
     * 
     * @return
     *     possible object is
     *     {@link GM03CoreCoreURL2 }
     *     
     */
    public GM03CoreCoreURL2 getPlainURL() {
        return plainURL;
    }

    /**
     * Sets the value of the plainURL property.
     * 
     * @param value
     *     allowed object is
     *     {@link GM03CoreCoreURL2 }
     *     
     */
    public void setPlainURL(GM03CoreCoreURL2 value) {
        this.plainURL = value;
    }

}