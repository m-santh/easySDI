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
 * <p>Java class for GM03Core.Core.CI_OnLineFunctionCode.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * <p>
 * <pre>
 * &lt;simpleType name="GM03Core.Core.CI_OnLineFunctionCode">
 *   &lt;restriction base="{http://www.w3.org/2001/XMLSchema}string">
 *     &lt;enumeration value="download"/>
 *     &lt;enumeration value="information"/>
 *     &lt;enumeration value="offlineAccess"/>
 *     &lt;enumeration value="order"/>
 *     &lt;enumeration value="search"/>
 *   &lt;/restriction>
 * &lt;/simpleType>
 * </pre>
 * 
 */
@XmlType(name = "GM03Core.Core.CI_OnLineFunctionCode")
@XmlEnum
public enum GM03CoreCoreCIOnLineFunctionCode {

    @XmlEnumValue("download")
    DOWNLOAD("download"),
    @XmlEnumValue("information")
    INFORMATION("information"),
    @XmlEnumValue("offlineAccess")
    OFFLINE_ACCESS("offlineAccess"),
    @XmlEnumValue("order")
    ORDER("order"),
    @XmlEnumValue("search")
    SEARCH("search");
    private final String value;

    GM03CoreCoreCIOnLineFunctionCode(String v) {
        value = v;
    }

    public String value() {
        return value;
    }

    public static GM03CoreCoreCIOnLineFunctionCode fromValue(String v) {
        for (GM03CoreCoreCIOnLineFunctionCode c: GM03CoreCoreCIOnLineFunctionCode.values()) {
            if (c.value.equals(v)) {
                return c;
            }
        }
        throw new IllegalArgumentException(v);
    }

}