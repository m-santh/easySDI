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
 * <p>Java class for GM03Comprehensive.Comprehensive.CI_CitationcitedResponsibleParty complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="GM03Comprehensive.Comprehensive.CI_CitationcitedResponsibleParty">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="role">
 *           &lt;complexType>
 *             &lt;complexContent>
 *               &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *                 &lt;sequence>
 *                   &lt;element name="GM03Core.Core.CI_RoleCode_" type="{http://www.interlis.ch/INTERLIS2.2}GM03Core.Core.CI_RoleCode_" maxOccurs="unbounded"/>
 *                 &lt;/sequence>
 *               &lt;/restriction>
 *             &lt;/complexContent>
 *           &lt;/complexType>
 *         &lt;/element>
 *         &lt;element name="citedResponsibleParty" type="{http://www.interlis.ch/INTERLIS2.2}RoleType"/>
 *         &lt;element name="CI_Citation" type="{http://www.interlis.ch/INTERLIS2.2}RoleType"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "GM03Comprehensive.Comprehensive.CI_CitationcitedResponsibleParty", propOrder = {
    "role",
    "citedResponsibleParty",
    "ciCitation"
})
@XmlSeeAlso({
    ch.interlis.interlis2.GM03V18.GM03ComprehensiveComprehensive.GM03ComprehensiveComprehensiveCICitationcitedResponsibleParty.class
})
public class GM03ComprehensiveComprehensiveCICitationcitedResponsibleParty {

    @XmlElement(required = true)
    protected GM03ComprehensiveComprehensiveCICitationcitedResponsibleParty.Role role;
    @XmlElement(required = true)
    protected RoleType citedResponsibleParty;
    @XmlElement(name = "CI_Citation", required = true)
    protected RoleType ciCitation;

    /**
     * Gets the value of the role property.
     * 
     * @return
     *     possible object is
     *     {@link GM03ComprehensiveComprehensiveCICitationcitedResponsibleParty.Role }
     *     
     */
    public GM03ComprehensiveComprehensiveCICitationcitedResponsibleParty.Role getRole() {
        return role;
    }

    /**
     * Sets the value of the role property.
     * 
     * @param value
     *     allowed object is
     *     {@link GM03ComprehensiveComprehensiveCICitationcitedResponsibleParty.Role }
     *     
     */
    public void setRole(GM03ComprehensiveComprehensiveCICitationcitedResponsibleParty.Role value) {
        this.role = value;
    }

    /**
     * Gets the value of the citedResponsibleParty property.
     * 
     * @return
     *     possible object is
     *     {@link RoleType }
     *     
     */
    public RoleType getCitedResponsibleParty() {
        return citedResponsibleParty;
    }

    /**
     * Sets the value of the citedResponsibleParty property.
     * 
     * @param value
     *     allowed object is
     *     {@link RoleType }
     *     
     */
    public void setCitedResponsibleParty(RoleType value) {
        this.citedResponsibleParty = value;
    }

    /**
     * Gets the value of the ciCitation property.
     * 
     * @return
     *     possible object is
     *     {@link RoleType }
     *     
     */
    public RoleType getCICitation() {
        return ciCitation;
    }

    /**
     * Sets the value of the ciCitation property.
     * 
     * @param value
     *     allowed object is
     *     {@link RoleType }
     *     
     */
    public void setCICitation(RoleType value) {
        this.ciCitation = value;
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
     *         &lt;element name="GM03Core.Core.CI_RoleCode_" type="{http://www.interlis.ch/INTERLIS2.2}GM03Core.Core.CI_RoleCode_" maxOccurs="unbounded"/>
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
        "gm03CoreCoreCIRoleCode"
    })
    public static class Role {

        @XmlElement(name = "GM03Core.Core.CI_RoleCode_", required = true)
        protected List<GM03CoreCoreCIRoleCode2> gm03CoreCoreCIRoleCode;

        /**
         * Gets the value of the gm03CoreCoreCIRoleCode property.
         * 
         * <p>
         * This accessor method returns a reference to the live list,
         * not a snapshot. Therefore any modification you make to the
         * returned list will be present inside the JAXB object.
         * This is why there is not a <CODE>set</CODE> method for the gm03CoreCoreCIRoleCode property.
         * 
         * <p>
         * For example, to add a new item, do as follows:
         * <pre>
         *    getGM03CoreCoreCIRoleCode().add(newItem);
         * </pre>
         * 
         * 
         * <p>
         * Objects of the following type(s) are allowed in the list
         * {@link GM03CoreCoreCIRoleCode2 }
         * 
         * 
         */
        public List<GM03CoreCoreCIRoleCode2> getGM03CoreCoreCIRoleCode() {
            if (gm03CoreCoreCIRoleCode == null) {
                gm03CoreCoreCIRoleCode = new ArrayList<GM03CoreCoreCIRoleCode2>();
            }
            return this.gm03CoreCoreCIRoleCode;
        }

    }

}