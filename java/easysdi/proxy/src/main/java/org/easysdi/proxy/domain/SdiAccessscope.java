package org.easysdi.proxy.domain;

// Generated Oct 4, 2013 10:19:58 AM by Hibernate Tools 3.4.0.CR1

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import static javax.persistence.GenerationType.IDENTITY;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * SdiAccessscope generated by hbm2java
 */
@Entity
@Cache(usage=CacheConcurrencyStrategy.READ_ONLY)
public class SdiAccessscope implements java.io.Serializable {

	private Integer Id;
	private SdiUser sdiUser;
	private SdiOrganism sdiOrganism;
	private String Entity_guid;

	public SdiAccessscope() {
	}

	public SdiAccessscope(String Entity_guid) {
		this.Entity_guid = Entity_guid;
	}

	public SdiAccessscope(SdiUser sdiUser,
			SdiOrganism sdiOrganism, String Entity_guid) {
		this.sdiUser = sdiUser;
		this.sdiOrganism = sdiOrganism;
		this.Entity_guid = Entity_guid;
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
	@JoinColumn(name = "user_id")
	public SdiUser getSdiUser() {
		return this.sdiUser;
	}

	public void setSdiUser(SdiUser sdiUser) {
		this.sdiUser = sdiUser;
	}

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "organism_id")
	public SdiOrganism getSdiOrganism() {
		return this.sdiOrganism;
	}

	public void setSdiOrganism(SdiOrganism sdiOrganism) {
		this.sdiOrganism = sdiOrganism;
	}

	@Column(name = "entity_guid", nullable = false, length = 36)
	public String getEntity_guid() {
		return this.Entity_guid;
	}

	public void setEntity_guid(String Entity_guid) {
		this.Entity_guid = Entity_guid;
	}

}