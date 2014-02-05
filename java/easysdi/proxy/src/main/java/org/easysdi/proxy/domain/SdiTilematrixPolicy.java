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
 * SdiTilematrixPolicy generated by hbm2java
 */
@Entity
@Cache(usage=CacheConcurrencyStrategy.READ_ONLY)
public class SdiTilematrixPolicy implements java.io.Serializable {

	private static final long serialVersionUID = 5529512592191571964L;
	private Integer Id;
	private SdiTilematrixsetPolicy sdiTilematrixsetPolicy;
	private String Identifier;
	private Integer Tileminrow;
	private Integer Tilemaxrow;
	private Integer Tilemincol;
	private Integer Tilemaxcol;
	private boolean Anytile;

	public SdiTilematrixPolicy() {
	}

	public SdiTilematrixPolicy(SdiTilematrixsetPolicy sdiTilematrixsetPolicy,
			String Identifier, boolean Anytile) {
		this.sdiTilematrixsetPolicy = sdiTilematrixsetPolicy;
		this.Identifier = Identifier;
		this.Anytile = Anytile;
	}

	public SdiTilematrixPolicy(SdiTilematrixsetPolicy sdiTilematrixsetPolicy,
			String Identifier, Integer Tileminrow, Integer Tilemaxrow,
			Integer Tilemincol, Integer Tilemaxcol, boolean Anytile) {
		this.sdiTilematrixsetPolicy = sdiTilematrixsetPolicy;
		this.Identifier = Identifier;
		this.Tileminrow = Tileminrow;
		this.Tilemaxrow = Tilemaxrow;
		this.Tilemincol = Tilemincol;
		this.Tilemaxcol = Tilemaxcol;
		this.Anytile = Anytile;
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
	@JoinColumn(name = "tilematrixsetpolicy_id", nullable = false)
	public SdiTilematrixsetPolicy getSdiTilematrixsetPolicy() {
		return this.sdiTilematrixsetPolicy;
	}

	public void setSdiTilematrixsetPolicy(
			SdiTilematrixsetPolicy sdiTilematrixsetPolicy) {
		this.sdiTilematrixsetPolicy = sdiTilematrixsetPolicy;
	}

	@Column(name = "identifier", nullable = false)
	public String getIdentifier() {
		return this.Identifier;
	}

	public void setIdentifier(String Identifier) {
		this.Identifier = Identifier;
	}

	@Column(name = "tileminrow")
	public Integer getTileminrow() {
		return this.Tileminrow;
	}

	public void setTileminrow(Integer Tileminrow) {
		this.Tileminrow = Tileminrow;
	}

	@Column(name = "tilemaxrow")
	public Integer getTilemaxrow() {
		return this.Tilemaxrow;
	}

	public void setTilemaxrow(Integer Tilemaxrow) {
		this.Tilemaxrow = Tilemaxrow;
	}

	@Column(name = "tilemincol")
	public Integer getTilemincol() {
		return this.Tilemincol;
	}

	public void setTilemincol(Integer Tilemincol) {
		this.Tilemincol = Tilemincol;
	}

	@Column(name = "tilemaxcol")
	public Integer getTilemaxcol() {
		return this.Tilemaxcol;
	}

	public void setTilemaxcol(Integer Tilemaxcol) {
		this.Tilemaxcol = Tilemaxcol;
	}

	@Column(name = "anytile", nullable = false)
	public boolean isAnytile() {
		return this.Anytile;
	}

	public void setAnytile(boolean Anytile) {
		this.Anytile = Anytile;
	}

}