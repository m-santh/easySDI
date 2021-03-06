package org.easysdi.proxy.domain;

// Generated Apr 9, 2013 11:54:41 AM by Hibernate Tools 3.4.0.CR1

import static javax.persistence.GenerationType.IDENTITY;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * SdiAllowedoperation generated by hbm2java
 */
@Entity
@Cache(usage=CacheConcurrencyStrategy.READ_ONLY)
public class SdiAllowedoperation implements java.io.Serializable {

	private static final long serialVersionUID = 7959173122659912495L;
	private Integer Id;
	private SdiSysServiceoperation sdiSysServiceoperation;
	private SdiPolicy sdiPolicy;

	public SdiAllowedoperation() {
	}

	public SdiAllowedoperation(SdiSysServiceoperation sdiSysServiceoperation,
			SdiPolicy sdiPolicy) {
		this.sdiSysServiceoperation = sdiSysServiceoperation;
		this.sdiPolicy = sdiPolicy;
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

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "serviceoperation_id", nullable = false)
	public SdiSysServiceoperation getSdiSysServiceoperation() {
		return this.sdiSysServiceoperation;
	}

	public void setSdiSysServiceoperation(
			SdiSysServiceoperation sdiSysServiceoperation) {
		this.sdiSysServiceoperation = sdiSysServiceoperation;
	}

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "policy_id", nullable = false)
	public SdiPolicy getSdiPolicy() {
		return this.sdiPolicy;
	}

	public void setSdiPolicy(SdiPolicy sdiPolicy) {
		this.sdiPolicy = sdiPolicy;
	}

}
