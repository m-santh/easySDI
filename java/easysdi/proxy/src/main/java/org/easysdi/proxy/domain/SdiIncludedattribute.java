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
 * SdiIncludedattribute generated by hbm2java
 */
@Entity
@Cache(usage=CacheConcurrencyStrategy.READ_ONLY)
public class SdiIncludedattribute implements java.io.Serializable {

	private static final long serialVersionUID = 8425643787861864337L;
	private Integer Id;
	private SdiFeaturetypePolicy sdiFeaturetypePolicy;
	private String Name;

	public SdiIncludedattribute() {
	}

	public SdiIncludedattribute(SdiFeaturetypePolicy sdiFeaturetypePolicy,
			String Name) {
		this.sdiFeaturetypePolicy = sdiFeaturetypePolicy;
		this.Name = Name;
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
	@JoinColumn(name = "featuretypepolicy_id", nullable = false)
        @Cache(usage = CacheConcurrencyStrategy.READ_ONLY)
	public SdiFeaturetypePolicy getSdiFeaturetypePolicy() {
		return this.sdiFeaturetypePolicy;
	}

	public void setSdiFeaturetypePolicy(
			SdiFeaturetypePolicy sdiFeaturetypePolicy) {
		this.sdiFeaturetypePolicy = sdiFeaturetypePolicy;
	}

	@Column(name = "name", nullable = false, length = 500)
	public String getName() {
		return this.Name;
	}

	public void setName(String Name) {
		this.Name = Name;
	}

}
