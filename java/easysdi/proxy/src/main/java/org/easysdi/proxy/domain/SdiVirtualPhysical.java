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
 * SdiVirtualPhysical generated by hbm2java
 */
@Entity
@Cache(usage=CacheConcurrencyStrategy.READ_ONLY)
public class SdiVirtualPhysical implements java.io.Serializable {

	private static final long serialVersionUID = 3417408691354285312L;
	private Integer Id;
	private SdiVirtualservice sdiVirtualservice;
	private SdiPhysicalservice sdiPhysicalservice;

	public SdiVirtualPhysical() {
	}

	public SdiVirtualPhysical(SdiVirtualservice sdiVirtualservice,
			SdiPhysicalservice sdiPhysicalservice) {
		this.sdiVirtualservice = sdiVirtualservice;
		this.sdiPhysicalservice = sdiPhysicalservice;
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
	@JoinColumn(name = "virtualservice_id", nullable = false)
	public SdiVirtualservice getSdiVirtualservice() {
		return this.sdiVirtualservice;
	}

	public void setSdiVirtualservice(SdiVirtualservice sdiVirtualservice) {
		this.sdiVirtualservice = sdiVirtualservice;
	}

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "physicalservice_id", nullable = false)
	public SdiPhysicalservice getSdiPhysicalservice() {
		return this.sdiPhysicalservice;
	}

	public void setSdiPhysicalservice(SdiPhysicalservice sdiPhysicalservice) {
		this.sdiPhysicalservice = sdiPhysicalservice;
	}

}