package org.easysdi.proxy.domain;

// Generated Apr 9, 2013 11:54:41 AM by Hibernate Tools 3.4.0.CR1

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import static javax.persistence.GenerationType.IDENTITY;
import javax.persistence.Id;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;

/**
 * SdiSysVersiontype generated by hbm2java
 */
@Entity
@Cache(usage=CacheConcurrencyStrategy.READ_ONLY)
@FilterDef(name="entityState")
@Filter(name = "entityState",condition="state = 1")
public class SdiSysVersiontype implements java.io.Serializable {

	private static final long serialVersionUID = 3958340153207687581L;
	private Integer Id;
	private int Ordering;
	private int State;
	private String Value;

	public SdiSysVersiontype() {
	}

	public SdiSysVersiontype(int Ordering, int State, String Value) {
		this.Ordering = Ordering;
		this.State = State;
		this.Value = Value;
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

	@Column(name = "ordering", nullable = false)
	public int getOrdering() {
		return this.Ordering;
	}

	public void setOrdering(int Ordering) {
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

}