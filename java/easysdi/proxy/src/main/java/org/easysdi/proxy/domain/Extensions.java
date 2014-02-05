package org.easysdi.proxy.domain;

// Generated Apr 9, 2013 11:54:41 AM by Hibernate Tools 3.4.0.CR1

import java.util.Date;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import static javax.persistence.GenerationType.IDENTITY;
import javax.persistence.Id;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;

/**
 * Extensions generated by hbm2java
 */
@Entity
@Cache(usage=CacheConcurrencyStrategy.READ_ONLY)
@FilterDef(name="entityState")
@Filter(name = "entityState",condition="enabled = 1")
public class Extensions implements java.io.Serializable {

	private static final long serialVersionUID = 3315743902678385090L;
	private Integer Extension_id;
	private String Name;
	private String Type;
	private String Element;
	private String Folder;
	private byte Client_id;
	private byte Enabled;
	private int Access;
	private byte Protected;
	private String Manifest_cache;
	private String Params;
	private String Custom_data;
	private String System_data;
	private int Checked_out;
	private Date Checked_out_time;
	private Integer Ordering;
	private Integer State;

	public Extensions() {
	}

	public Extensions(String Name, String Type, String Element, String Folder,
			byte Client_id, byte Enabled, int Access, byte Protected,
			String Manifest_cache, String Params, String Custom_data,
			String System_data, int Checked_out, Date Checked_out_time) {
		this.Name = Name;
		this.Type = Type;
		this.Element = Element;
		this.Folder = Folder;
		this.Client_id = Client_id;
		this.Enabled = Enabled;
		this.Access = Access;
		this.Protected = Protected;
		this.Manifest_cache = Manifest_cache;
		this.Params = Params;
		this.Custom_data = Custom_data;
		this.System_data = System_data;
		this.Checked_out = Checked_out;
		this.Checked_out_time = Checked_out_time;
	}

	public Extensions(String Name, String Type, String Element, String Folder,
			byte Client_id, byte Enabled, int Access, byte Protected,
			String Manifest_cache, String Params, String Custom_data,
			String System_data, int Checked_out, Date Checked_out_time,
			Integer Ordering, Integer State) {
		this.Name = Name;
		this.Type = Type;
		this.Element = Element;
		this.Folder = Folder;
		this.Client_id = Client_id;
		this.Enabled = Enabled;
		this.Access = Access;
		this.Protected = Protected;
		this.Manifest_cache = Manifest_cache;
		this.Params = Params;
		this.Custom_data = Custom_data;
		this.System_data = System_data;
		this.Checked_out = Checked_out;
		this.Checked_out_time = Checked_out_time;
		this.Ordering = Ordering;
		this.State = State;
	}

	@Id
	@GeneratedValue(strategy = IDENTITY)
	@Column(name = "extension_id", unique = true, nullable = false)
	public Integer getExtension_id() {
		return this.Extension_id;
	}

	public void setExtension_id(Integer Extension_id) {
		this.Extension_id = Extension_id;
	}

	@Column(name = "name", nullable = false, length = 100)
	public String getName() {
		return this.Name;
	}

	public void setName(String Name) {
		this.Name = Name;
	}

	@Column(name = "type", nullable = false, length = 20)
	public String getType() {
		return this.Type;
	}

	public void setType(String Type) {
		this.Type = Type;
	}

	@Column(name = "element", nullable = false, length = 100)
	public String getElement() {
		return this.Element;
	}

	public void setElement(String Element) {
		this.Element = Element;
	}

	@Column(name = "folder", nullable = false, length = 100)
	public String getFolder() {
		return this.Folder;
	}

	public void setFolder(String Folder) {
		this.Folder = Folder;
	}

	@Column(name = "client_id", nullable = false)
	public byte getClient_id() {
		return this.Client_id;
	}

	public void setClient_id(byte Client_id) {
		this.Client_id = Client_id;
	}

	@Column(name = "enabled", nullable = false)
	public byte getEnabled() {
		return this.Enabled;
	}

	public void setEnabled(byte Enabled) {
		this.Enabled = Enabled;
	}

	@Column(name = "access", nullable = false)
	public int getAccess() {
		return this.Access;
	}

	public void setAccess(int Access) {
		this.Access = Access;
	}

	@Column(name = "protected", nullable = false)
	public byte getProtected() {
		return this.Protected;
	}

	public void setProtected(byte Protected) {
		this.Protected = Protected;
	}

	@Column(name = "manifest_cache", nullable = false, length = 65535)
	public String getManifest_cache() {
		return this.Manifest_cache;
	}

	public void setManifest_cache(String Manifest_cache) {
		this.Manifest_cache = Manifest_cache;
	}

	@Column(name = "params", nullable = false, length = 65535)
	public String getParams() {
		return this.Params;
	}

	public void setParams(String Params) {
		this.Params = Params;
	}

	@Column(name = "custom_data", nullable = false, length = 65535)
	public String getCustom_data() {
		return this.Custom_data;
	}

	public void setCustom_data(String Custom_data) {
		this.Custom_data = Custom_data;
	}

	@Column(name = "system_data", nullable = false, length = 65535)
	public String getSystem_data() {
		return this.System_data;
	}

	public void setSystem_data(String System_data) {
		this.System_data = System_data;
	}

	@Column(name = "checked_out", nullable = false)
	public int getChecked_out() {
		return this.Checked_out;
	}

	public void setChecked_out(int Checked_out) {
		this.Checked_out = Checked_out;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "checked_out_time", nullable = false, length = 19)
	public Date getChecked_out_time() {
		return this.Checked_out_time;
	}

	public void setChecked_out_time(Date Checked_out_time) {
		this.Checked_out_time = Checked_out_time;
	}

	@Column(name = "ordering")
	public Integer getOrdering() {
		return this.Ordering;
	}

	public void setOrdering(Integer Ordering) {
		this.Ordering = Ordering;
	}

	@Column(name = "state")
	public Integer getState() {
		return this.State;
	}

	public void setState(Integer State) {
		this.State = State;
	}

}