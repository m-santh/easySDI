//
// This file was generated by the JavaTM Architecture for XML Binding(JAXB) Reference Implementation, vhudson-jaxb-ri-2.1-520 
// See <a href="http://java.sun.com/xml/jaxb">http://java.sun.com/xml/jaxb</a> 
// Any modifications to this file will be lost upon recompilation of the source schema. 
// Generated on: 2008.03.07 at 04:51:42 PM CET 
//


package net.opengis.gml.v320;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlSeeAlso;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for AbstractGeneralTransformationType complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="AbstractGeneralTransformationType">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.opengis.net/gml}AbstractCoordinateOperationType">
 *       &lt;sequence>
 *         &lt;element ref="{http://www.opengis.net/gml}metaDataProperty" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element ref="{http://www.opengis.net/gml}description" minOccurs="0"/>
 *         &lt;element ref="{http://www.opengis.net/gml}descriptionReference" minOccurs="0"/>
 *         &lt;element ref="{http://www.opengis.net/gml}identifier"/>
 *         &lt;element ref="{http://www.opengis.net/gml}name" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element ref="{http://www.opengis.net/gml}remarks" minOccurs="0"/>
 *         &lt;element ref="{http://www.opengis.net/gml}domainOfValidity" minOccurs="0"/>
 *         &lt;element ref="{http://www.opengis.net/gml}scope" maxOccurs="unbounded"/>
 *         &lt;element ref="{http://www.opengis.net/gml}operationVersion"/>
 *         &lt;element ref="{http://www.opengis.net/gml}coordinateOperationAccuracy" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element ref="{http://www.opengis.net/gml}sourceCRS"/>
 *         &lt;element ref="{http://www.opengis.net/gml}targetCRS"/>
 *       &lt;/sequence>
 *       &lt;attribute ref="{http://www.opengis.net/gml}id use="required""/>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "AbstractGeneralTransformationType")
@XmlSeeAlso({
    TransformationType.class
})
public abstract class AbstractGeneralTransformationType
    extends AbstractCoordinateOperationType
{


}