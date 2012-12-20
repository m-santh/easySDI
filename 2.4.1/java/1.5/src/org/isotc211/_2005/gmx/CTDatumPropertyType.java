//
// This file was generated by the JavaTM Architecture for XML Binding(JAXB) Reference Implementation, vhudson-jaxb-ri-2.1-520 
// See <a href="http://java.sun.com/xml/jaxb">http://java.sun.com/xml/jaxb</a> 
// Any modifications to this file will be lost upon recompilation of the source schema. 
// Generated on: 2008.03.07 at 04:51:42 PM CET 
//


package org.isotc211._2005.gmx;

import java.util.ArrayList;
import java.util.List;
import javax.xml.bind.JAXBElement;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElementRef;
import javax.xml.bind.annotation.XmlSchemaType;
import javax.xml.bind.annotation.XmlType;
import net.opengis.gml.v320.AbstractDatumType;
import net.opengis.gml.v320.EngineeringDatumType;
import net.opengis.gml.v320.GeodeticDatum2;
import net.opengis.gml.v320.ImageDatum2;
import net.opengis.gml.v320.TemporlDatum2;
import net.opengis.gml.v320.VerticalDatum2;


/**
 * <p>Java class for CT_Datum_PropertyType complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="CT_Datum_PropertyType">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence minOccurs="0">
 *         &lt;element ref="{http://www.opengis.net/gml}AbstractDatum"/>
 *       &lt;/sequence>
 *       &lt;attGroup ref="{http://www.isotc211.org/2005/gco}ObjectReference"/>
 *       &lt;attribute ref="{http://www.isotc211.org/2005/gco}nilReason"/>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "CT_Datum_PropertyType", propOrder = {
    "abstractDatum"
})
public class CTDatumPropertyType {

    @XmlElementRef(name = "AbstractDatum", namespace = "http://www.opengis.net/gml", type = JAXBElement.class)
    protected JAXBElement<? extends AbstractDatumType> abstractDatum;
    @XmlAttribute(namespace = "http://www.isotc211.org/2005/gco")
    protected List<String> nilReason;
    @XmlAttribute
    protected String uuidref;
    @XmlAttribute(namespace = "http://www.w3.org/1999/xlink")
    protected String type;
    @XmlAttribute(namespace = "http://www.w3.org/1999/xlink")
    @XmlSchemaType(name = "anyURI")
    protected String href;
    @XmlAttribute(namespace = "http://www.w3.org/1999/xlink")
    @XmlSchemaType(name = "anyURI")
    protected String role;
    @XmlAttribute(namespace = "http://www.w3.org/1999/xlink")
    @XmlSchemaType(name = "anyURI")
    protected String arcrole;
    @XmlAttribute(namespace = "http://www.w3.org/1999/xlink")
    protected String title;
    @XmlAttribute(namespace = "http://www.w3.org/1999/xlink")
    protected String show;
    @XmlAttribute(namespace = "http://www.w3.org/1999/xlink")
    protected String actuate;

    /**
     * Gets the value of the abstractDatum property.
     * 
     * @return
     *     possible object is
     *     {@link GeodeticDatum2 }
     *     {@link TemporlDatum2 }
     *     {@link JAXBElement }{@code <}{@link MLImageDatumType }{@code >}
     *     {@link JAXBElement }{@code <}{@link MLTemporalDatumType }{@code >}
     *     {@link ImageDatum2 }
     *     {@link JAXBElement }{@code <}{@link MLVerticalDatumType }{@code >}
     *     {@link JAXBElement }{@code <}{@link EngineeringDatumType }{@code >}
     *     {@link VerticalDatum2 }
     *     {@link JAXBElement }{@code <}{@link AbstractDatumType }{@code >}
     *     {@link JAXBElement }{@code <}{@link MLEngineeringDatumType }{@code >}
     *     {@link JAXBElement }{@code <}{@link MLGeodeticDatumType }{@code >}
     *     
     */
    public JAXBElement<? extends AbstractDatumType> getAbstractDatum() {
        return abstractDatum;
    }

    /**
     * Sets the value of the abstractDatum property.
     * 
     * @param value
     *     allowed object is
     *     {@link GeodeticDatum2 }
     *     {@link TemporlDatum2 }
     *     {@link JAXBElement }{@code <}{@link MLImageDatumType }{@code >}
     *     {@link JAXBElement }{@code <}{@link MLTemporalDatumType }{@code >}
     *     {@link ImageDatum2 }
     *     {@link JAXBElement }{@code <}{@link MLVerticalDatumType }{@code >}
     *     {@link JAXBElement }{@code <}{@link EngineeringDatumType }{@code >}
     *     {@link VerticalDatum2 }
     *     {@link JAXBElement }{@code <}{@link AbstractDatumType }{@code >}
     *     {@link JAXBElement }{@code <}{@link MLEngineeringDatumType }{@code >}
     *     {@link JAXBElement }{@code <}{@link MLGeodeticDatumType }{@code >}
     *     
     */
    public void setAbstractDatum(JAXBElement<? extends AbstractDatumType> value) {
        this.abstractDatum = ((JAXBElement<? extends AbstractDatumType> ) value);
    }

    /**
     * Gets the value of the nilReason property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the nilReason property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getNilReason().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link String }
     * 
     * 
     */
    public List<String> getNilReason() {
        if (nilReason == null) {
            nilReason = new ArrayList<String>();
        }
        return this.nilReason;
    }

    /**
     * Gets the value of the uuidref property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getUuidref() {
        return uuidref;
    }

    /**
     * Sets the value of the uuidref property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setUuidref(String value) {
        this.uuidref = value;
    }

    /**
     * Gets the value of the type property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getType() {
        if (type == null) {
            return "simple";
        } else {
            return type;
        }
    }

    /**
     * Sets the value of the type property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setType(String value) {
        this.type = value;
    }

    /**
     * Gets the value of the href property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getHref() {
        return href;
    }

    /**
     * Sets the value of the href property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setHref(String value) {
        this.href = value;
    }

    /**
     * Gets the value of the role property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getRole() {
        return role;
    }

    /**
     * Sets the value of the role property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setRole(String value) {
        this.role = value;
    }

    /**
     * Gets the value of the arcrole property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getArcrole() {
        return arcrole;
    }

    /**
     * Sets the value of the arcrole property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setArcrole(String value) {
        this.arcrole = value;
    }

    /**
     * Gets the value of the title property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getTitle() {
        return title;
    }

    /**
     * Sets the value of the title property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setTitle(String value) {
        this.title = value;
    }

    /**
     * Gets the value of the show property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getShow() {
        return show;
    }

    /**
     * Sets the value of the show property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setShow(String value) {
        this.show = value;
    }

    /**
     * Gets the value of the actuate property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getActuate() {
        return actuate;
    }

    /**
     * Sets the value of the actuate property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setActuate(String value) {
        this.actuate = value;
    }

}
