//
// This file was generated by the JavaTM Architecture for XML Binding(JAXB) Reference Implementation, v2.0-b26-ea3 
// See <a href="http://java.sun.com/xml/jaxb">http://java.sun.com/xml/jaxb</a> 
// Any modifications to this file will be lost upon recompilation of the source schema. 
// Generated on: 2011.10.20 at 10:32:26 AM CEST 
//


package org.easysdi.proxy.policy;

import javax.xml.bind.annotation.AccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;
import org.easysdi.proxy.policy.FeatureTypes;
import org.easysdi.proxy.policy.Layers;
import org.easysdi.proxy.policy.Metadata;
import org.easysdi.proxy.policy.Server;


/**
 * <p>Java class for Server element declaration.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;element name="Server">
 *   &lt;complexType>
 *     &lt;complexContent>
 *       &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *         &lt;sequence>
 *           &lt;element ref="{}url"/>
 *           &lt;sequence minOccurs="0">
 *             &lt;element ref="{}Prefix"/>
 *             &lt;element ref="{}Namespace"/>
 *           &lt;/sequence>
 *           &lt;element ref="{}Metadata" minOccurs="0"/>
 *           &lt;element ref="{}Layers" minOccurs="0"/>
 *           &lt;element ref="{}FeatureTypes" minOccurs="0"/>
 *         &lt;/sequence>
 *       &lt;/restriction>
 *     &lt;/complexContent>
 *   &lt;/complexType>
 * &lt;/element>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(AccessType.FIELD)
@XmlType(name = "", propOrder = {
    "url",
    "prefix",
    "namespace",
    "metadata",
    "layers",
    "featureTypes"
})
@XmlRootElement(name = "Server")
public class Server {

    protected String url;
    @XmlElement(name = "Prefix")
    protected String prefix;
    @XmlElement(name = "Namespace")
    protected String namespace;
    @XmlElement(name = "Metadata")
    protected Metadata metadata;
    @XmlElement(name = "Layers")
    protected Layers layers;
    @XmlElement(name = "FeatureTypes")
    protected FeatureTypes featureTypes;

    /**
     * Gets the value of the url property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getUrl() {
        return url;
    }

    /**
     * Sets the value of the url property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setUrl(String value) {
        this.url = value;
    }

    /**
     * Gets the value of the prefix property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getPrefix() {
        return prefix;
    }

    /**
     * Sets the value of the prefix property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setPrefix(String value) {
        this.prefix = value;
    }

    /**
     * Gets the value of the namespace property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getNamespace() {
        return namespace;
    }

    /**
     * Sets the value of the namespace property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setNamespace(String value) {
        this.namespace = value;
    }

    /**
     * Gets the value of the metadata property.
     * 
     * @return
     *     possible object is
     *     {@link Metadata }
     *     
     */
    public Metadata getMetadata() {
        return metadata;
    }

    /**
     * Sets the value of the metadata property.
     * 
     * @param value
     *     allowed object is
     *     {@link Metadata }
     *     
     */
    public void setMetadata(Metadata value) {
        this.metadata = value;
    }

    /**
     * Gets the value of the layers property.
     * 
     * @return
     *     possible object is
     *     {@link Layers }
     *     
     */
    public Layers getLayers() {
        return layers;
    }

    /**
     * Sets the value of the layers property.
     * 
     * @param value
     *     allowed object is
     *     {@link Layers }
     *     
     */
    public void setLayers(Layers value) {
        this.layers = value;
    }

    /**
     * Gets the value of the featureTypes property.
     * 
     * @return
     *     possible object is
     *     {@link FeatureTypes }
     *     
     */
    public FeatureTypes getFeatureTypes() {
        return featureTypes;
    }

    /**
     * Sets the value of the featureTypes property.
     * 
     * @param value
     *     allowed object is
     *     {@link FeatureTypes }
     *     
     */
    public void setFeatureTypes(FeatureTypes value) {
        this.featureTypes = value;
    }

}