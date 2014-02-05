package org.easysdi.proxy.domain;

// Generated Apr 9, 2013 11:54:41 AM by Hibernate Tools 3.4.0.CR1

import java.util.HashSet;
import java.util.Set;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import static javax.persistence.GenerationType.IDENTITY;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;

/**
 * SdiSysServiceoperation generated by hbm2java
 */
@Entity
@Cache(usage=CacheConcurrencyStrategy.READ_ONLY)
@FilterDef(name="entityState")
@Filter(name = "entityState",condition="State = 1")
public class SdiSysServiceoperation implements java.io.Serializable {

	private static final long serialVersionUID = -2935809518613999621L;
	private Integer Id;
	private Integer Ordering;
	private int State;
	private String Value;
	private Set<SdiAllowedoperation> sdiAllowedoperations = new HashSet<SdiAllowedoperation>(
			0);
	private Set<SdiSysOperationcompliance> sdiSysOperationcompliances = new HashSet<SdiSysOperationcompliance>(
			0);

	public SdiSysServiceoperation() {
	}

	public SdiSysServiceoperation(int State, String Value) {
		this.State = State;
		this.Value = Value;
	}

	public SdiSysServiceoperation(Integer Ordering, int State, String Value,
			Set<SdiAllowedoperation> sdiAllowedoperations,
			Set<SdiSysOperationcompliance> sdiSysOperationcompliances) {
		this.Ordering = Ordering;
		this.State = State;
		this.Value = Value;
		this.sdiAllowedoperations = sdiAllowedoperations;
		this.sdiSysOperationcompliances = sdiSysOperationcompliances;
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

	@OneToMany(fetch = FetchType.LAZY, mappedBy = "sdiSysServiceoperation")
	public Set<SdiAllowedoperation> getSdiAllowedoperations() {
		return this.sdiAllowedoperations;
	}

	public void setSdiAllowedoperations(
			Set<SdiAllowedoperation> sdiAllowedoperations) {
		this.sdiAllowedoperations = sdiAllowedoperations;
	}

	@OneToMany(fetch = FetchType.LAZY, mappedBy = "sdiSysServiceoperation")
	public Set<SdiSysOperationcompliance> getSdiSysOperationcompliances() {
		return this.sdiSysOperationcompliances;
	}

	public void setSdiSysOperationcompliances(
			Set<SdiSysOperationcompliance> sdiSysOperationcompliances) {
		this.sdiSysOperationcompliances = sdiSysOperationcompliances;
	}

}