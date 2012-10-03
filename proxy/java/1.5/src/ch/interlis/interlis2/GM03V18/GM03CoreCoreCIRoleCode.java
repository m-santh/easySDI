//
// This file was generated by the JavaTM Architecture for XML Binding(JAXB) Reference Implementation, vhudson-jaxb-ri-2.1-520 
// See <a href="http://java.sun.com/xml/jaxb">http://java.sun.com/xml/jaxb</a> 
// Any modifications to this file will be lost upon recompilation of the source schema. 
// Generated on: 2008.03.13 at 04:39:39 PM CET 
//


package ch.interlis.interlis2.GM03V18;

import javax.xml.bind.annotation.XmlEnum;
import javax.xml.bind.annotation.XmlEnumValue;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for GM03Core.Core.CI_RoleCode.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * <p>
 * <pre>
 * &lt;simpleType name="GM03Core.Core.CI_RoleCode">
 *   &lt;restriction base="{http://www.w3.org/2001/XMLSchema}string">
 *     &lt;enumeration value="resourceProvider"/>
 *     &lt;enumeration value="custodian"/>
 *     &lt;enumeration value="owner"/>
 *     &lt;enumeration value="user"/>
 *     &lt;enumeration value="distributor"/>
 *     &lt;enumeration value="originator"/>
 *     &lt;enumeration value="pointOfContact"/>
 *     &lt;enumeration value="principalInvestigator"/>
 *     &lt;enumeration value="processor"/>
 *     &lt;enumeration value="publisher"/>
 *     &lt;enumeration value="author"/>
 *     &lt;enumeration value="editor"/>
 *     &lt;enumeration value="partner"/>
 *   &lt;/restriction>
 * &lt;/simpleType>
 * </pre>
 * 
 */
@XmlType(name = "GM03Core.Core.CI_RoleCode")
@XmlEnum
public enum GM03CoreCoreCIRoleCode {

    @XmlEnumValue("resourceProvider")
    RESOURCE_PROVIDER("resourceProvider"),
    @XmlEnumValue("custodian")
    CUSTODIAN("custodian"),
    @XmlEnumValue("owner")
    OWNER("owner"),
    @XmlEnumValue("user")
    USER("user"),
    @XmlEnumValue("distributor")
    DISTRIBUTOR("distributor"),
    @XmlEnumValue("originator")
    ORIGINATOR("originator"),
    @XmlEnumValue("pointOfContact")
    POINT_OF_CONTACT("pointOfContact"),
    @XmlEnumValue("principalInvestigator")
    PRINCIPAL_INVESTIGATOR("principalInvestigator"),
    @XmlEnumValue("processor")
    PROCESSOR("processor"),
    @XmlEnumValue("publisher")
    PUBLISHER("publisher"),
    @XmlEnumValue("author")
    AUTHOR("author"),
    @XmlEnumValue("editor")
    EDITOR("editor"),
    @XmlEnumValue("partner")
    PARTNER("partner");
    private final String value;

    GM03CoreCoreCIRoleCode(String v) {
        value = v;
    }

    public String value() {
        return value;
    }

    public static GM03CoreCoreCIRoleCode fromValue(String v) {
        for (GM03CoreCoreCIRoleCode c: GM03CoreCoreCIRoleCode.values()) {
            if (c.value.equals(v)) {
                return c;
            }
        }
        throw new IllegalArgumentException(v);
    }

}