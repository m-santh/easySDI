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
 * <p>Java class for ArcPoint complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="ArcPoint">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="C1" type="{http://www.w3.org/2001/XMLSchema}double"/>
 *         &lt;element name="C2" type="{http://www.w3.org/2001/XMLSchema}double"/>
 *         &lt;element name="C3" type="{http://www.w3.org/2001/XMLSchema}double" minOccurs="0"/>
 *         &lt;element name="A1" type="{http://www.w3.org/2001/XMLSchema}double"/>
 *         &lt;element name="A2" type="{http://www.w3.org/2001/XMLSchema}double"/>
 *         &lt;element name="R" type="{http://www.w3.org/2001/XMLSchema}double" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "ArcPoint", propOrder = {
    "c1",
    "c2",
    "c3",
    "a1",
    "a2",
    "r"
})
public class ArcPoint {

    @XmlElement(name = "C1")
    protected double c1;
    @XmlElement(name = "C2")
    protected double c2;
    @XmlElement(name = "C3")
    protected Double c3;
    @XmlElement(name = "A1")
    protected double a1;
    @XmlElement(name = "A2")
    protected double a2;
    @XmlElement(name = "R")
    protected Double r;

    /**
     * Gets the value of the c1 property.
     * 
     */
    public double getC1() {
        return c1;
    }

    /**
     * Sets the value of the c1 property.
     * 
     */
    public void setC1(double value) {
        this.c1 = value;
    }

    /**
     * Gets the value of the c2 property.
     * 
     */
    public double getC2() {
        return c2;
    }

    /**
     * Sets the value of the c2 property.
     * 
     */
    public void setC2(double value) {
        this.c2 = value;
    }

    /**
     * Gets the value of the c3 property.
     * 
     * @return
     *     possible object is
     *     {@link Double }
     *     
     */
    public Double getC3() {
        return c3;
    }

    /**
     * Sets the value of the c3 property.
     * 
     * @param value
     *     allowed object is
     *     {@link Double }
     *     
     */
    public void setC3(Double value) {
        this.c3 = value;
    }

    /**
     * Gets the value of the a1 property.
     * 
     */
    public double getA1() {
        return a1;
    }

    /**
     * Sets the value of the a1 property.
     * 
     */
    public void setA1(double value) {
        this.a1 = value;
    }

    /**
     * Gets the value of the a2 property.
     * 
     */
    public double getA2() {
        return a2;
    }

    /**
     * Sets the value of the a2 property.
     * 
     */
    public void setA2(double value) {
        this.a2 = value;
    }

    /**
     * Gets the value of the r property.
     * 
     * @return
     *     possible object is
     *     {@link Double }
     *     
     */
    public Double getR() {
        return r;
    }

    /**
     * Sets the value of the r property.
     * 
     * @param value
     *     allowed object is
     *     {@link Double }
     *     
     */
    public void setR(Double value) {
        this.r = value;
    }

}