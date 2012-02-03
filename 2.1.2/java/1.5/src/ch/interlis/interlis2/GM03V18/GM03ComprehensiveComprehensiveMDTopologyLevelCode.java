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
 * <p>Java class for GM03Comprehensive.Comprehensive.MD_TopologyLevelCode.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * <p>
 * <pre>
 * &lt;simpleType name="GM03Comprehensive.Comprehensive.MD_TopologyLevelCode">
 *   &lt;restriction base="{http://www.w3.org/2001/XMLSchema}string">
 *     &lt;enumeration value="geometryOnly"/>
 *     &lt;enumeration value="topology1D"/>
 *     &lt;enumeration value="planarGraph"/>
 *     &lt;enumeration value="fullPlanarGraph"/>
 *     &lt;enumeration value="surfaceGraph"/>
 *     &lt;enumeration value="fullSurfaceGraph"/>
 *     &lt;enumeration value="topology3D"/>
 *     &lt;enumeration value="fullTopology3D"/>
 *     &lt;enumeration value="abstract"/>
 *   &lt;/restriction>
 * &lt;/simpleType>
 * </pre>
 * 
 */
@XmlType(name = "GM03Comprehensive.Comprehensive.MD_TopologyLevelCode")
@XmlEnum
public enum GM03ComprehensiveComprehensiveMDTopologyLevelCode {

    @XmlEnumValue("geometryOnly")
    GEOMETRY_ONLY("geometryOnly"),
    @XmlEnumValue("topology1D")
    TOPOLOGY_1_D("topology1D"),
    @XmlEnumValue("planarGraph")
    PLANAR_GRAPH("planarGraph"),
    @XmlEnumValue("fullPlanarGraph")
    FULL_PLANAR_GRAPH("fullPlanarGraph"),
    @XmlEnumValue("surfaceGraph")
    SURFACE_GRAPH("surfaceGraph"),
    @XmlEnumValue("fullSurfaceGraph")
    FULL_SURFACE_GRAPH("fullSurfaceGraph"),
    @XmlEnumValue("topology3D")
    TOPOLOGY_3_D("topology3D"),
    @XmlEnumValue("fullTopology3D")
    FULL_TOPOLOGY_3_D("fullTopology3D"),
    @XmlEnumValue("abstract")
    ABSTRACT("abstract");
    private final String value;

    GM03ComprehensiveComprehensiveMDTopologyLevelCode(String v) {
        value = v;
    }

    public String value() {
        return value;
    }

    public static GM03ComprehensiveComprehensiveMDTopologyLevelCode fromValue(String v) {
        for (GM03ComprehensiveComprehensiveMDTopologyLevelCode c: GM03ComprehensiveComprehensiveMDTopologyLevelCode.values()) {
            if (c.value.equals(v)) {
                return c;
            }
        }
        throw new IllegalArgumentException(v);
    }

}
