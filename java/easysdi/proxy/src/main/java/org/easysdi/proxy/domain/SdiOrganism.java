package org.easysdi.proxy.domain;
// Generated Jul 3, 2014 9:51:52 AM by Hibernate Tools 3.6.0

import java.util.Date;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import static javax.persistence.GenerationType.IDENTITY;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.OneToMany;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;

/**
 * SdiOrganism generated by hbm2java
 */
@Entity
@Cache(usage = CacheConcurrencyStrategy.READ_ONLY)
@FilterDef(name = "entityState")
@Filter(name = "entityState", condition = "State = 1")
public class SdiOrganism implements java.io.Serializable {

    private Integer id;
    private String guid;
    private int createdBy;
    private Date created;
    private Integer modifiedBy;
    private Date modified;
    private int ordering;
    private int state;
    private int checkedOut;
    private Date checkedOutTime;
    private String acronym;
    private String description;
    private String logo;
    private String name;
    private String website;
    private String perimeter;
    private int access;
    private int assetId;
    private String username;
    private String password;
    private Set<SdiCategory> sdiCategories = new HashSet<SdiCategory>(0);

    public SdiOrganism() {
    }

    public SdiOrganism(String guid, int createdBy, Date created, int ordering, int state, int checkedOut, Date checkedOutTime, String name, int access, int assetId) {
        this.guid = guid;
        this.createdBy = createdBy;
        this.created = created;
        this.ordering = ordering;
        this.state = state;
        this.checkedOut = checkedOut;
        this.checkedOutTime = checkedOutTime;
        this.name = name;
        this.access = access;
        this.assetId = assetId;
    }

    public SdiOrganism(String guid, int createdBy, Date created, Integer modifiedBy, Date modified, int ordering, int state, int checkedOut, Date checkedOutTime, String acronym, String description, String logo, String name, String website, String perimeter, int access, int assetId, String username, String password, Set sdiCategories) {
        this.guid = guid;
        this.createdBy = createdBy;
        this.created = created;
        this.modifiedBy = modifiedBy;
        this.modified = modified;
        this.ordering = ordering;
        this.state = state;
        this.checkedOut = checkedOut;
        this.checkedOutTime = checkedOutTime;
        this.acronym = acronym;
        this.description = description;
        this.logo = logo;
        this.name = name;
        this.website = website;
        this.perimeter = perimeter;
        this.access = access;
        this.assetId = assetId;
        this.username = username;
        this.password = password;
        this.sdiCategories = sdiCategories;
    }

    @Id
    @GeneratedValue(strategy = IDENTITY)

    @Column(name = "id", unique = true, nullable = false)
    public Integer getId() {
        return this.id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    @Column(name = "guid", nullable = false, length = 36)
    public String getGuid() {
        return this.guid;
    }

    public void setGuid(String guid) {
        this.guid = guid;
    }

    @Column(name = "created_by", nullable = false)
    public int getCreatedBy() {
        return this.createdBy;
    }

    public void setCreatedBy(int createdBy) {
        this.createdBy = createdBy;
    }

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "created", nullable = false, length = 19)
    public Date getCreated() {
        return this.created;
    }

    public void setCreated(Date created) {
        this.created = created;
    }

    @Column(name = "modified_by")
    public Integer getModifiedBy() {
        return this.modifiedBy;
    }

    public void setModifiedBy(Integer modifiedBy) {
        this.modifiedBy = modifiedBy;
    }

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "modified", length = 19)
    public Date getModified() {
        return this.modified;
    }

    public void setModified(Date modified) {
        this.modified = modified;
    }

    @Column(name = "ordering", nullable = false)
    public int getOrdering() {
        return this.ordering;
    }

    public void setOrdering(int ordering) {
        this.ordering = ordering;
    }

    @Column(name = "state", nullable = false)
    public int getState() {
        return this.state;
    }

    public void setState(int state) {
        this.state = state;
    }

    @Column(name = "checked_out", nullable = false)
    public int getCheckedOut() {
        return this.checkedOut;
    }

    public void setCheckedOut(int checkedOut) {
        this.checkedOut = checkedOut;
    }

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "checked_out_time", nullable = false, length = 19)
    public Date getCheckedOutTime() {
        return this.checkedOutTime;
    }

    public void setCheckedOutTime(Date checkedOutTime) {
        this.checkedOutTime = checkedOutTime;
    }

    @Column(name = "acronym", length = 150)
    public String getAcronym() {
        return this.acronym;
    }

    public void setAcronym(String acronym) {
        this.acronym = acronym;
    }

    @Column(name = "description", length = 500)
    public String getDescription() {
        return this.description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @Column(name = "logo", length = 500)
    public String getLogo() {
        return this.logo;
    }

    public void setLogo(String logo) {
        this.logo = logo;
    }

    @Column(name = "name", nullable = false)
    public String getName() {
        return this.name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Column(name = "website", length = 500)
    public String getWebsite() {
        return this.website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    @Column(name = "perimeter", length = 65535)
    public String getPerimeter() {
        return this.perimeter;
    }

    public void setPerimeter(String perimeter) {
        this.perimeter = perimeter;
    }

    @Column(name = "access", nullable = false)
    public int getAccess() {
        return this.access;
    }

    public void setAccess(int access) {
        this.access = access;
    }

    @Column(name = "asset_id", nullable = false)
    public int getAssetId() {
        return this.assetId;
    }

    public void setAssetId(int assetId) {
        this.assetId = assetId;
    }

    @Column(name = "username", length = 150)
    public String getUsername() {
        return this.username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    @Column(name = "password", length = 65)
    public String getPassword() {
        return this.password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    @OneToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "SdiOrganismCategory", joinColumns = {
        @JoinColumn(name = "organism_id")}, inverseJoinColumns = {
        @JoinColumn(name = "category_id")})
    @Filter(name = "entityState", condition = "State = 1")
    @Cache(usage = CacheConcurrencyStrategy.READ_ONLY)
    public Set<SdiCategory> getSdiCategories() {
        return this.sdiCategories;
    }

    public void setSdiCategories(Set<SdiCategory> sdiCategories) {
        this.sdiCategories = sdiCategories;
    }

}
