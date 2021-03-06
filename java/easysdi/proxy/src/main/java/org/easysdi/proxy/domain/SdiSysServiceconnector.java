package org.easysdi.proxy.domain;

// Generated Apr 9, 2013 11:54:41 AM by Hibernate Tools 3.4.0.CR1

import java.util.HashSet;
import java.util.Set;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;

import static javax.persistence.GenerationType.IDENTITY;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;

/**
 * SdiSysServiceconnector generated by hbm2java
 */
@Entity
@Cache(usage=CacheConcurrencyStrategy.READ_ONLY)
@FilterDef(name="entityState")
@Filter(name = "entityState",condition="state = 1")
public class SdiSysServiceconnector implements java.io.Serializable {

	private static final long serialVersionUID = 4865294466923946520L;
	private Integer Id;
	private Integer Ordering;
	private int State;
	private String Value;
	private Set<SdiPhysicalservice> sdiPhysicalservices = new HashSet<SdiPhysicalservice>(
			0);
	private Set<SdiVirtualservice> sdiVirtualservices = new HashSet<SdiVirtualservice>(
			0);
	private Set<SdiSysAuthenticationconnector> sdiSysAuthenticationcons = new HashSet<SdiSysAuthenticationconnector>(
			0);
	private Set<SdiSysServicecompliance> sdiSysServicecompliances = new HashSet<SdiSysServicecompliance>(
			0);

	public SdiSysServiceconnector() {
	}

	public SdiSysServiceconnector(int State, String Value) {
		this.State = State;
		this.Value = Value;
	}

	public SdiSysServiceconnector(
			Integer Ordering,
			int State,
			String Value,
			Set<SdiPhysicalservice> sdiPhysicalservices,
			Set<SdiVirtualservice> sdiVirtualservices,
			Set<SdiSysAuthenticationconnector> sdiSysAuthenticationcons,
			Set<SdiSysServicecompliance> sdiSysServicecompliances) {
		this.Ordering = Ordering;
		this.State = State;
		this.Value = Value;
		this.sdiPhysicalservices = sdiPhysicalservices;
		this.sdiVirtualservices = sdiVirtualservices;
		this.sdiSysAuthenticationcons = sdiSysAuthenticationcons;
		this.sdiSysServicecompliances = sdiSysServicecompliances;
	}

	@Id
	@GeneratedValue(strategy = IDENTITY)
	@Column(name = "id", unique = true, nullable = false)
	public Integer getId() {
		return this.Id;
	}

	public void setId(Integer Id) {
		this.Id = Id;
	}

	@Column(name = "ordering")
	public Integer getOrdering() {
		return this.Ordering;
	}

	public void setOrdering(Integer Ordering) {
		this.Ordering = Ordering;
	}

	@Column(name = "state", nullable = false)
	public int getState() {
		return this.State;
	}

	public void setState(int State) {
		this.State = State;
	}

	@Column(name = "value", nullable = false, length = 150)
	public String getValue() {
		return this.Value;
	}

	public void setValue(String Value) {
		this.Value = Value;
	}

	@OneToMany(fetch = FetchType.LAZY, mappedBy = "sdiSysServiceconnector")
	public Set<SdiPhysicalservice> getSdiPhysicalservices() {
		return this.sdiPhysicalservices;
	}

	public void setSdiPhysicalservices(
			Set<SdiPhysicalservice> sdiPhysicalservices) {
		this.sdiPhysicalservices = sdiPhysicalservices;
	}

	@OneToMany(fetch = FetchType.LAZY, mappedBy = "sdiSysServiceconnector")
	public Set<SdiVirtualservice> getSdiVirtualservices() {
		return this.sdiVirtualservices;
	}

	public void setSdiVirtualservices(Set<SdiVirtualservice> sdiVirtualservices) {
		this.sdiVirtualservices = sdiVirtualservices;
	}

	@OneToMany(fetch = FetchType.LAZY)
	@JoinTable(name = "SdiSysServiceconAuthenticationcon", joinColumns = {@JoinColumn(name = "authenticationconnector_id")}, inverseJoinColumns = {@JoinColumn (name = "serviceconnector_id")})
	public Set<SdiSysAuthenticationconnector> getSdiSysAuthenticationcons() {
		return this.sdiSysAuthenticationcons;
	}

	public void setSdiSysAuthenticationcons(
			Set<SdiSysAuthenticationconnector> sdiSysAuthenticationcons) {
		this.sdiSysAuthenticationcons = sdiSysAuthenticationcons;
	}

	@OneToMany(fetch = FetchType.LAZY, mappedBy = "sdiSysServiceconnector")
	public Set<SdiSysServicecompliance> getSdiSysServicecompliances() {
		return this.sdiSysServicecompliances;
	}

	public void setSdiSysServicecompliances(
			Set<SdiSysServicecompliance> sdiSysServicecompliances) {
		this.sdiSysServicecompliances = sdiSysServicecompliances;
	}

}
