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
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlSeeAlso;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for GM03Core.Core.MD_Metadata complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="GM03Core.Core.MD_Metadata">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="fileIdentifier" type="{http://www.interlis.ch/INTERLIS2.2}GM03Core.Core.CharacterString" minOccurs="0"/>
 *         &lt;element name="language" type="{http://www.interlis.ch/INTERLIS2.2}CodeISO.LanguageCodeISO" minOccurs="0"/>
 *         &lt;element name="characterSet" type="{http://www.interlis.ch/INTERLIS2.2}GM03Core.Core.MD_CharacterSetCode" minOccurs="0"/>
 *         &lt;element name="dateStamp" type="{http://www.interlis.ch/INTERLIS2.2}GM03Core.Core.Date"/>
 *         &lt;element name="metadataStandardName" type="{http://www.interlis.ch/INTERLIS2.2}GM03Core.Core.CharacterString" minOccurs="0"/>
 *         &lt;element name="metadataStandardVersion" type="{http://www.interlis.ch/INTERLIS2.2}GM03Core.Core.CharacterString" minOccurs="0"/>
 *         &lt;element name="hierarchyLevel" minOccurs="0">
 *           &lt;complexType>
 *             &lt;complexContent>
 *               &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *                 &lt;sequence>
 *                   &lt;element name="GM03Core.Core.MD_ScopeCode_" type="{http://www.interlis.ch/INTERLIS2.2}GM03Core.Core.MD_ScopeCode_" maxOccurs="unbounded"/>
 *                 &lt;/sequence>
 *               &lt;/restriction>
 *             &lt;/complexContent>
 *           &lt;/complexType>
 *         &lt;/element>
 *         &lt;element name="hierarchyLevelName" minOccurs="0">
 *           &lt;complexType>
 *             &lt;complexContent>
 *               &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *                 &lt;sequence>
 *                   &lt;element name="GM03Core.Core.CharacterString_" type="{http://www.interlis.ch/INTERLIS2.2}GM03Core.Core.CharacterString_" maxOccurs="unbounded"/>
 *                 &lt;/sequence>
 *               &lt;/restriction>
 *             &lt;/complexContent>
 *           &lt;/complexType>
 *         &lt;/element>
 *         &lt;element name="dataSetURI" type="{http://www.interlis.ch/INTERLIS2.2}GM03Core.Core.URL" minOccurs="0"/>
 *         &lt;element name="metadataMaintenance" minOccurs="0">
 *           &lt;complexType>
 *             &lt;complexContent>
 *               &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *                 &lt;attribute name="REF" type="{http://www.interlis.ch/INTERLIS2.2}IliID" />
 *                 &lt;attribute name="EXTREF" type="{http://www.interlis.ch/INTERLIS2.2}IliID" />
 *                 &lt;attribute name="BID" type="{http://www.interlis.ch/INTERLIS2.2}IliID" />
 *                 &lt;attribute name="NEXT_TID" type="{http://www.interlis.ch/INTERLIS2.2}IliID" />
 *               &lt;/restriction>
 *             &lt;/complexContent>
 *           &lt;/complexType>
 *         &lt;/element>
 *         &lt;element name="parentIdentifier" minOccurs="0">
 *           &lt;complexType>
 *             &lt;complexContent>
 *               &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *                 &lt;attribute name="REF" type="{http://www.interlis.ch/INTERLIS2.2}IliID" />
 *                 &lt;attribute name="EXTREF" type="{http://www.interlis.ch/INTERLIS2.2}IliID" />
 *                 &lt;attribute name="BID" type="{http://www.interlis.ch/INTERLIS2.2}IliID" />
 *                 &lt;attribute name="NEXT_TID" type="{http://www.interlis.ch/INTERLIS2.2}IliID" />
 *               &lt;/restriction>
 *             &lt;/complexContent>
 *           &lt;/complexType>
 *         &lt;/element>
 *         &lt;element name="distributionInfo" minOccurs="0">
 *           &lt;complexType>
 *             &lt;complexContent>
 *               &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *                 &lt;attribute name="REF" type="{http://www.interlis.ch/INTERLIS2.2}IliID" />
 *                 &lt;attribute name="EXTREF" type="{http://www.interlis.ch/INTERLIS2.2}IliID" />
 *                 &lt;attribute name="BID" type="{http://www.interlis.ch/INTERLIS2.2}IliID" />
 *                 &lt;attribute name="NEXT_TID" type="{http://www.interlis.ch/INTERLIS2.2}IliID" />
 *               &lt;/restriction>
 *             &lt;/complexContent>
 *           &lt;/complexType>
 *         &lt;/element>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "GM03Core.Core.MD_Metadata", propOrder = {
    "fileIdentifier",
    "language",
    "characterSet",
    "dateStamp",
    "metadataStandardName",
    "metadataStandardVersion",
    "hierarchyLevel",
    "hierarchyLevelName",
    "dataSetURI",
    "metadataMaintenance",
    "parentIdentifier",
    "distributionInfo"
})
@XmlSeeAlso({
    ch.interlis.interlis2.GM03V18.GM03ComprehensiveComprehensive.GM03CoreCoreMDMetadata.class,
    ch.interlis.interlis2.GM03V18.GM03CoreCore.GM03CoreCoreMDMetadata.class
})
@XmlRootElement(name = "GM03CoreCoreMDMetadata")
public class GM03CoreCoreMDMetadata {

    protected String fileIdentifier;
    protected CodeISOLanguageCodeISO language;
    protected GM03CoreCoreMDCharacterSetCode characterSet;
    @XmlElement(required = true)
    protected GM03CoreCoreDate dateStamp;
    protected String metadataStandardName;
    protected String metadataStandardVersion;
    protected GM03CoreCoreMDMetadata.HierarchyLevel hierarchyLevel;
    protected GM03CoreCoreMDMetadata.HierarchyLevelName hierarchyLevelName;
    protected GM03CoreCoreURL2 dataSetURI;
    protected GM03CoreCoreMDMetadata.MetadataMaintenance metadataMaintenance;
    protected GM03CoreCoreMDMetadata.ParentIdentifier parentIdentifier;
    protected GM03CoreCoreMDMetadata.DistributionInfo distributionInfo;

    /**
     * Gets the value of the fileIdentifier property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getFileIdentifier() {
        return fileIdentifier;
    }

    /**
     * Sets the value of the fileIdentifier property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setFileIdentifier(String value) {
        this.fileIdentifier = value;
    }

    /**
     * Gets the value of the language property.
     * 
     * @return
     *     possible object is
     *     {@link CodeISOLanguageCodeISO }
     *     
     */
    public CodeISOLanguageCodeISO getLanguage() {
        return language;
    }

    /**
     * Sets the value of the language property.
     * 
     * @param value
     *     allowed object is
     *     {@link CodeISOLanguageCodeISO }
     *     
     */
    public void setLanguage(CodeISOLanguageCodeISO value) {
        this.language = value;
    }

    /**
     * Gets the value of the characterSet property.
     * 
     * @return
     *     possible object is
     *     {@link GM03CoreCoreMDCharacterSetCode }
     *     
     */
    public GM03CoreCoreMDCharacterSetCode getCharacterSet() {
        return characterSet;
    }

    /**
     * Sets the value of the characterSet property.
     * 
     * @param value
     *     allowed object is
     *     {@link GM03CoreCoreMDCharacterSetCode }
     *     
     */
    public void setCharacterSet(GM03CoreCoreMDCharacterSetCode value) {
        this.characterSet = value;
    }

    /**
     * Gets the value of the dateStamp property.
     * 
     * @return
     *     possible object is
     *     {@link GM03CoreCoreDate }
     *     
     */
    public GM03CoreCoreDate getDateStamp() {
        return dateStamp;
    }

    /**
     * Sets the value of the dateStamp property.
     * 
     * @param value
     *     allowed object is
     *     {@link GM03CoreCoreDate }
     *     
     */
    public void setDateStamp(GM03CoreCoreDate value) {
        this.dateStamp = value;
    }

    /**
     * Gets the value of the metadataStandardName property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getMetadataStandardName() {
        return metadataStandardName;
    }

    /**
     * Sets the value of the metadataStandardName property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setMetadataStandardName(String value) {
        this.metadataStandardName = value;
    }

    /**
     * Gets the value of the metadataStandardVersion property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getMetadataStandardVersion() {
        return metadataStandardVersion;
    }

    /**
     * Sets the value of the metadataStandardVersion property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setMetadataStandardVersion(String value) {
        this.metadataStandardVersion = value;
    }

    /**
     * Gets the value of the hierarchyLevel property.
     * 
     * @return
     *     possible object is
     *     {@link GM03CoreCoreMDMetadata.HierarchyLevel }
     *     
     */
    public GM03CoreCoreMDMetadata.HierarchyLevel getHierarchyLevel() {
        return hierarchyLevel;
    }

    /**
     * Sets the value of the hierarchyLevel property.
     * 
     * @param value
     *     allowed object is
     *     {@link GM03CoreCoreMDMetadata.HierarchyLevel }
     *     
     */
    public void setHierarchyLevel(GM03CoreCoreMDMetadata.HierarchyLevel value) {
        this.hierarchyLevel = value;
    }

    /**
     * Gets the value of the hierarchyLevelName property.
     * 
     * @return
     *     possible object is
     *     {@link GM03CoreCoreMDMetadata.HierarchyLevelName }
     *     
     */
    public GM03CoreCoreMDMetadata.HierarchyLevelName getHierarchyLevelName() {
        return hierarchyLevelName;
    }

    /**
     * Sets the value of the hierarchyLevelName property.
     * 
     * @param value
     *     allowed object is
     *     {@link GM03CoreCoreMDMetadata.HierarchyLevelName }
     *     
     */
    public void setHierarchyLevelName(GM03CoreCoreMDMetadata.HierarchyLevelName value) {
        this.hierarchyLevelName = value;
    }

    /**
     * Gets the value of the dataSetURI property.
     * 
     * @return
     *     possible object is
     *     {@link GM03CoreCoreURL2 }
     *     
     */
    public GM03CoreCoreURL2 getDataSetURI() {
        return dataSetURI;
    }

    /**
     * Sets the value of the dataSetURI property.
     * 
     * @param value
     *     allowed object is
     *     {@link GM03CoreCoreURL2 }
     *     
     */
    public void setDataSetURI(GM03CoreCoreURL2 value) {
        this.dataSetURI = value;
    }

    /**
     * Gets the value of the metadataMaintenance property.
     * 
     * @return
     *     possible object is
     *     {@link GM03CoreCoreMDMetadata.MetadataMaintenance }
     *     
     */
    public GM03CoreCoreMDMetadata.MetadataMaintenance getMetadataMaintenance() {
        return metadataMaintenance;
    }

    /**
     * Sets the value of the metadataMaintenance property.
     * 
     * @param value
     *     allowed object is
     *     {@link GM03CoreCoreMDMetadata.MetadataMaintenance }
     *     
     */
    public void setMetadataMaintenance(GM03CoreCoreMDMetadata.MetadataMaintenance value) {
        this.metadataMaintenance = value;
    }

    /**
     * Gets the value of the parentIdentifier property.
     * 
     * @return
     *     possible object is
     *     {@link GM03CoreCoreMDMetadata.ParentIdentifier }
     *     
     */
    public GM03CoreCoreMDMetadata.ParentIdentifier getParentIdentifier() {
        return parentIdentifier;
    }

    /**
     * Sets the value of the parentIdentifier property.
     * 
     * @param value
     *     allowed object is
     *     {@link GM03CoreCoreMDMetadata.ParentIdentifier }
     *     
     */
    public void setParentIdentifier(GM03CoreCoreMDMetadata.ParentIdentifier value) {
        this.parentIdentifier = value;
    }

    /**
     * Gets the value of the distributionInfo property.
     * 
     * @return
     *     possible object is
     *     {@link GM03CoreCoreMDMetadata.DistributionInfo }
     *     
     */
    public GM03CoreCoreMDMetadata.DistributionInfo getDistributionInfo() {
        return distributionInfo;
    }

    /**
     * Sets the value of the distributionInfo property.
     * 
     * @param value
     *     allowed object is
     *     {@link GM03CoreCoreMDMetadata.DistributionInfo }
     *     
     */
    public void setDistributionInfo(GM03CoreCoreMDMetadata.DistributionInfo value) {
        this.distributionInfo = value;
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
     *       &lt;attribute name="REF" type="{http://www.interlis.ch/INTERLIS2.2}IliID" />
     *       &lt;attribute name="EXTREF" type="{http://www.interlis.ch/INTERLIS2.2}IliID" />
     *       &lt;attribute name="BID" type="{http://www.interlis.ch/INTERLIS2.2}IliID" />
     *       &lt;attribute name="NEXT_TID" type="{http://www.interlis.ch/INTERLIS2.2}IliID" />
     *     &lt;/restriction>
     *   &lt;/complexContent>
     * &lt;/complexType>
     * </pre>
     * 
     * 
     */
    @XmlAccessorType(XmlAccessType.FIELD)
    @XmlType(name = "")
    public static class DistributionInfo {

        @XmlAttribute(name = "REF")
        protected String ref;
        @XmlAttribute(name = "EXTREF")
        protected String extref;
        @XmlAttribute(name = "BID")
        protected String bid;
        @XmlAttribute(name = "NEXT_TID")
        protected String nexttid;

        /**
         * Gets the value of the ref property.
         * 
         * @return
         *     possible object is
         *     {@link String }
         *     
         */
        public String getREF() {
            return ref;
        }

        /**
         * Sets the value of the ref property.
         * 
         * @param value
         *     allowed object is
         *     {@link String }
         *     
         */
        public void setREF(String value) {
            this.ref = value;
        }

        /**
         * Gets the value of the extref property.
         * 
         * @return
         *     possible object is
         *     {@link String }
         *     
         */
        public String getEXTREF() {
            return extref;
        }

        /**
         * Sets the value of the extref property.
         * 
         * @param value
         *     allowed object is
         *     {@link String }
         *     
         */
        public void setEXTREF(String value) {
            this.extref = value;
        }

        /**
         * Gets the value of the bid property.
         * 
         * @return
         *     possible object is
         *     {@link String }
         *     
         */
        public String getBID() {
            return bid;
        }

        /**
         * Sets the value of the bid property.
         * 
         * @param value
         *     allowed object is
         *     {@link String }
         *     
         */
        public void setBID(String value) {
            this.bid = value;
        }

        /**
         * Gets the value of the nexttid property.
         * 
         * @return
         *     possible object is
         *     {@link String }
         *     
         */
        public String getNEXTTID() {
            return nexttid;
        }

        /**
         * Sets the value of the nexttid property.
         * 
         * @param value
         *     allowed object is
         *     {@link String }
         *     
         */
        public void setNEXTTID(String value) {
            this.nexttid = value;
        }

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
     *         &lt;element name="GM03Core.Core.MD_ScopeCode_" type="{http://www.interlis.ch/INTERLIS2.2}GM03Core.Core.MD_ScopeCode_" maxOccurs="unbounded"/>
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
        "gm03CoreCoreMDScopeCode"
    })
    public static class HierarchyLevel {

        @XmlElement(name = "GM03Core.Core.MD_ScopeCode_", required = true)
        protected List<GM03CoreCoreMDScopeCode2> gm03CoreCoreMDScopeCode;

        /**
         * Gets the value of the gm03CoreCoreMDScopeCode property.
         * 
         * <p>
         * This accessor method returns a reference to the live list,
         * not a snapshot. Therefore any modification you make to the
         * returned list will be present inside the JAXB object.
         * This is why there is not a <CODE>set</CODE> method for the gm03CoreCoreMDScopeCode property.
         * 
         * <p>
         * For example, to add a new item, do as follows:
         * <pre>
         *    getGM03CoreCoreMDScopeCode().add(newItem);
         * </pre>
         * 
         * 
         * <p>
         * Objects of the following type(s) are allowed in the list
         * {@link GM03CoreCoreMDScopeCode2 }
         * 
         * 
         */
        public List<GM03CoreCoreMDScopeCode2> getGM03CoreCoreMDScopeCode() {
            if (gm03CoreCoreMDScopeCode == null) {
                gm03CoreCoreMDScopeCode = new ArrayList<GM03CoreCoreMDScopeCode2>();
            }
            return this.gm03CoreCoreMDScopeCode;
        }

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
     *         &lt;element name="GM03Core.Core.CharacterString_" type="{http://www.interlis.ch/INTERLIS2.2}GM03Core.Core.CharacterString_" maxOccurs="unbounded"/>
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
        "gm03CoreCoreCharacterString"
    })
    public static class HierarchyLevelName {

        @XmlElement(name = "GM03Core.Core.CharacterString_", required = true)
        protected List<GM03CoreCoreCharacterString> gm03CoreCoreCharacterString;

        /**
         * Gets the value of the gm03CoreCoreCharacterString property.
         * 
         * <p>
         * This accessor method returns a reference to the live list,
         * not a snapshot. Therefore any modification you make to the
         * returned list will be present inside the JAXB object.
         * This is why there is not a <CODE>set</CODE> method for the gm03CoreCoreCharacterString property.
         * 
         * <p>
         * For example, to add a new item, do as follows:
         * <pre>
         *    getGM03CoreCoreCharacterString().add(newItem);
         * </pre>
         * 
         * 
         * <p>
         * Objects of the following type(s) are allowed in the list
         * {@link GM03CoreCoreCharacterString }
         * 
         * 
         */
        public List<GM03CoreCoreCharacterString> getGM03CoreCoreCharacterString() {
            if (gm03CoreCoreCharacterString == null) {
                gm03CoreCoreCharacterString = new ArrayList<GM03CoreCoreCharacterString>();
            }
            return this.gm03CoreCoreCharacterString;
        }

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
     *       &lt;attribute name="REF" type="{http://www.interlis.ch/INTERLIS2.2}IliID" />
     *       &lt;attribute name="EXTREF" type="{http://www.interlis.ch/INTERLIS2.2}IliID" />
     *       &lt;attribute name="BID" type="{http://www.interlis.ch/INTERLIS2.2}IliID" />
     *       &lt;attribute name="NEXT_TID" type="{http://www.interlis.ch/INTERLIS2.2}IliID" />
     *     &lt;/restriction>
     *   &lt;/complexContent>
     * &lt;/complexType>
     * </pre>
     * 
     * 
     */
    @XmlAccessorType(XmlAccessType.FIELD)
    @XmlType(name = "")
    public static class MetadataMaintenance {

        @XmlAttribute(name = "REF")
        protected String ref;
        @XmlAttribute(name = "EXTREF")
        protected String extref;
        @XmlAttribute(name = "BID")
        protected String bid;
        @XmlAttribute(name = "NEXT_TID")
        protected String nexttid;

        /**
         * Gets the value of the ref property.
         * 
         * @return
         *     possible object is
         *     {@link String }
         *     
         */
        public String getREF() {
            return ref;
        }

        /**
         * Sets the value of the ref property.
         * 
         * @param value
         *     allowed object is
         *     {@link String }
         *     
         */
        public void setREF(String value) {
            this.ref = value;
        }

        /**
         * Gets the value of the extref property.
         * 
         * @return
         *     possible object is
         *     {@link String }
         *     
         */
        public String getEXTREF() {
            return extref;
        }

        /**
         * Sets the value of the extref property.
         * 
         * @param value
         *     allowed object is
         *     {@link String }
         *     
         */
        public void setEXTREF(String value) {
            this.extref = value;
        }

        /**
         * Gets the value of the bid property.
         * 
         * @return
         *     possible object is
         *     {@link String }
         *     
         */
        public String getBID() {
            return bid;
        }

        /**
         * Sets the value of the bid property.
         * 
         * @param value
         *     allowed object is
         *     {@link String }
         *     
         */
        public void setBID(String value) {
            this.bid = value;
        }

        /**
         * Gets the value of the nexttid property.
         * 
         * @return
         *     possible object is
         *     {@link String }
         *     
         */
        public String getNEXTTID() {
            return nexttid;
        }

        /**
         * Sets the value of the nexttid property.
         * 
         * @param value
         *     allowed object is
         *     {@link String }
         *     
         */
        public void setNEXTTID(String value) {
            this.nexttid = value;
        }

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
     *       &lt;attribute name="REF" type="{http://www.interlis.ch/INTERLIS2.2}IliID" />
     *       &lt;attribute name="EXTREF" type="{http://www.interlis.ch/INTERLIS2.2}IliID" />
     *       &lt;attribute name="BID" type="{http://www.interlis.ch/INTERLIS2.2}IliID" />
     *       &lt;attribute name="NEXT_TID" type="{http://www.interlis.ch/INTERLIS2.2}IliID" />
     *     &lt;/restriction>
     *   &lt;/complexContent>
     * &lt;/complexType>
     * </pre>
     * 
     * 
     */
    @XmlAccessorType(XmlAccessType.FIELD)
    @XmlType(name = "")
    public static class ParentIdentifier {

        @XmlAttribute(name = "REF")
        protected String ref;
        @XmlAttribute(name = "EXTREF")
        protected String extref;
        @XmlAttribute(name = "BID")
        protected String bid;
        @XmlAttribute(name = "NEXT_TID")
        protected String nexttid;

        /**
         * Gets the value of the ref property.
         * 
         * @return
         *     possible object is
         *     {@link String }
         *     
         */
        public String getREF() {
            return ref;
        }

        /**
         * Sets the value of the ref property.
         * 
         * @param value
         *     allowed object is
         *     {@link String }
         *     
         */
        public void setREF(String value) {
            this.ref = value;
        }

        /**
         * Gets the value of the extref property.
         * 
         * @return
         *     possible object is
         *     {@link String }
         *     
         */
        public String getEXTREF() {
            return extref;
        }

        /**
         * Sets the value of the extref property.
         * 
         * @param value
         *     allowed object is
         *     {@link String }
         *     
         */
        public void setEXTREF(String value) {
            this.extref = value;
        }

        /**
         * Gets the value of the bid property.
         * 
         * @return
         *     possible object is
         *     {@link String }
         *     
         */
        public String getBID() {
            return bid;
        }

        /**
         * Sets the value of the bid property.
         * 
         * @param value
         *     allowed object is
         *     {@link String }
         *     
         */
        public void setBID(String value) {
            this.bid = value;
        }

        /**
         * Gets the value of the nexttid property.
         * 
         * @return
         *     possible object is
         *     {@link String }
         *     
         */
        public String getNEXTTID() {
            return nexttid;
        }

        /**
         * Sets the value of the nexttid property.
         * 
         * @param value
         *     allowed object is
         *     {@link String }
         *     
         */
        public void setNEXTTID(String value) {
            this.nexttid = value;
        }

    }

}