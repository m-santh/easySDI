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
 * <p>Java class for GM03Comprehensive.Comprehensive.MD_MaintenanceInformationcontact complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="GM03Comprehensive.Comprehensive.MD_MaintenanceInformationcontact">
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
 *         &lt;element name="contact" type="{http://www.interlis.ch/INTERLIS2.2}RoleType"/>
 *         &lt;element name="MD_MaintenanceInformation" type="{http://www.interlis.ch/INTERLIS2.2}RoleType"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "GM03Comprehensive.Comprehensive.MD_MaintenanceInformationcontact", propOrder = {
    "role",
    "contact",
    "mdMaintenanceInformation"
})
@XmlSeeAlso({
    ch.interlis.interlis2.GM03V18.GM03ComprehensiveComprehensive.GM03ComprehensiveComprehensiveMDMaintenanceInformationcontact.class
})
public class GM03ComprehensiveComprehensiveMDMaintenanceInformationcontact {

    @XmlElement(required = true)
    protected GM03ComprehensiveComprehensiveMDMaintenanceInformationcontact.Role role;
    @XmlElement(required = true)
    protected RoleType contact;
    @XmlElement(name = "MD_MaintenanceInformation", required = true)
    protected RoleType mdMaintenanceInformation;

    /**
     * Gets the value of the role property.
     * 
     * @return
     *     possible object is
     *     {@link GM03ComprehensiveComprehensiveMDMaintenanceInformationcontact.Role }
     *     
     */
    public GM03ComprehensiveComprehensiveMDMaintenanceInformationcontact.Role getRole() {
        return role;
    }

    /**
     * Sets the value of the role property.
     * 
     * @param value
     *     allowed object is
     *     {@link GM03ComprehensiveComprehensiveMDMaintenanceInformationcontact.Role }
     *     
     */
    public void setRole(GM03ComprehensiveComprehensiveMDMaintenanceInformationcontact.Role value) {
        this.role = value;
    }

    /**
     * Gets the value of the contact property.
     * 
     * @return
     *     possible object is
     *     {@link RoleType }
     *     
     */
    public RoleType getContact() {
        return contact;
    }

    /**
     * Sets the value of the contact property.
     * 
     * @param value
     *     allowed object is
     *     {@link RoleType }
     *     
     */
    public void setContact(RoleType value) {
        this.contact = value;
    }

    /**
     * Gets the value of the mdMaintenanceInformation property.
     * 
     * @return
     *     possible object is
     *     {@link RoleType }
     *     
     */
    public RoleType getMDMaintenanceInformation() {
        return mdMaintenanceInformation;
    }

    /**
     * Sets the value of the mdMaintenanceInformation property.
     * 
     * @param value
     *     allowed object is
     *     {@link RoleType }
     *     
     */
    public void setMDMaintenanceInformation(RoleType value) {
        this.mdMaintenanceInformation = value;
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