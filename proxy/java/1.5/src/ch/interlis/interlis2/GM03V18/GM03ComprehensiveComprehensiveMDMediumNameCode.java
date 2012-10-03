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
 * <p>Java class for GM03Comprehensive.Comprehensive.MD_MediumNameCode.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * <p>
 * <pre>
 * &lt;simpleType name="GM03Comprehensive.Comprehensive.MD_MediumNameCode">
 *   &lt;restriction base="{http://www.w3.org/2001/XMLSchema}string">
 *     &lt;enumeration value="cdRom"/>
 *     &lt;enumeration value="dvd"/>
 *     &lt;enumeration value="dvdRom"/>
 *     &lt;enumeration value="a3halfInchFloppy"/>
 *     &lt;enumeration value="a5quarterInchFloppy"/>
 *     &lt;enumeration value="a7trackTape"/>
 *     &lt;enumeration value="a9trackTape"/>
 *     &lt;enumeration value="a3480Cartridge"/>
 *     &lt;enumeration value="a3490Cartridge"/>
 *     &lt;enumeration value="a3580Cartridge"/>
 *     &lt;enumeration value="a4mmCartridgeTape"/>
 *     &lt;enumeration value="a8mmCartridgeTape"/>
 *     &lt;enumeration value="a1quarterInchCartridgeTape"/>
 *     &lt;enumeration value="digitalLinearTape"/>
 *     &lt;enumeration value="onLine"/>
 *     &lt;enumeration value="satellite"/>
 *     &lt;enumeration value="telephoneLink"/>
 *     &lt;enumeration value="hardcopy"/>
 *     &lt;enumeration value="zip100"/>
 *     &lt;enumeration value="zip250"/>
 *     &lt;enumeration value="email"/>
 *     &lt;enumeration value="zip"/>
 *     &lt;enumeration value="jaz"/>
 *     &lt;enumeration value="other"/>
 *   &lt;/restriction>
 * &lt;/simpleType>
 * </pre>
 * 
 */
@XmlType(name = "GM03Comprehensive.Comprehensive.MD_MediumNameCode")
@XmlEnum
public enum GM03ComprehensiveComprehensiveMDMediumNameCode {

    @XmlEnumValue("cdRom")
    CD_ROM("cdRom"),
    @XmlEnumValue("dvd")
    DVD("dvd"),
    @XmlEnumValue("dvdRom")
    DVD_ROM("dvdRom"),
    @XmlEnumValue("a3halfInchFloppy")
    A_3_HALF_INCH_FLOPPY("a3halfInchFloppy"),
    @XmlEnumValue("a5quarterInchFloppy")
    A_5_QUARTER_INCH_FLOPPY("a5quarterInchFloppy"),
    @XmlEnumValue("a7trackTape")
    A_7_TRACK_TAPE("a7trackTape"),
    @XmlEnumValue("a9trackTape")
    A_9_TRACK_TAPE("a9trackTape"),
    @XmlEnumValue("a3480Cartridge")
    A_3480_CARTRIDGE("a3480Cartridge"),
    @XmlEnumValue("a3490Cartridge")
    A_3490_CARTRIDGE("a3490Cartridge"),
    @XmlEnumValue("a3580Cartridge")
    A_3580_CARTRIDGE("a3580Cartridge"),
    @XmlEnumValue("a4mmCartridgeTape")
    A_4_MM_CARTRIDGE_TAPE("a4mmCartridgeTape"),
    @XmlEnumValue("a8mmCartridgeTape")
    A_8_MM_CARTRIDGE_TAPE("a8mmCartridgeTape"),
    @XmlEnumValue("a1quarterInchCartridgeTape")
    A_1_QUARTER_INCH_CARTRIDGE_TAPE("a1quarterInchCartridgeTape"),
    @XmlEnumValue("digitalLinearTape")
    DIGITAL_LINEAR_TAPE("digitalLinearTape"),
    @XmlEnumValue("onLine")
    ON_LINE("onLine"),
    @XmlEnumValue("satellite")
    SATELLITE("satellite"),
    @XmlEnumValue("telephoneLink")
    TELEPHONE_LINK("telephoneLink"),
    @XmlEnumValue("hardcopy")
    HARDCOPY("hardcopy"),
    @XmlEnumValue("zip100")
    ZIP_100("zip100"),
    @XmlEnumValue("zip250")
    ZIP_250("zip250"),
    @XmlEnumValue("email")
    EMAIL("email"),
    @XmlEnumValue("zip")
    ZIP("zip"),
    @XmlEnumValue("jaz")
    JAZ("jaz"),
    @XmlEnumValue("other")
    OTHER("other");
    private final String value;

    GM03ComprehensiveComprehensiveMDMediumNameCode(String v) {
        value = v;
    }

    public String value() {
        return value;
    }

    public static GM03ComprehensiveComprehensiveMDMediumNameCode fromValue(String v) {
        for (GM03ComprehensiveComprehensiveMDMediumNameCode c: GM03ComprehensiveComprehensiveMDMediumNameCode.values()) {
            if (c.value.equals(v)) {
                return c;
            }
        }
        throw new IllegalArgumentException(v);
    }

}