package org.easysdi.proxy.domain;

// Generated Apr 9, 2013 11:54:42 AM by Hibernate Tools 3.4.0.CR1

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

/**
 * Home object for domain model class SdiSysSpatialoperator.
 * @see org.easysdi.proxy.domain.SdiSysSpatialoperator
 * @author Hibernate Tools
 */

@Transactional
@Repository
public class SdiSysSpatialoperatorHome {

	private static final Log log = LogFactory
			.getLog(SdiSysSpatialoperatorHome.class);

	@Autowired
	private SessionFactory sessionFactory;

	public SdiSysSpatialoperator findById(Integer id) {
		log.debug("getting SdiSysSpatialoperator instance with id: " + id);
		try {
			SdiSysSpatialoperator instance = (SdiSysSpatialoperator) sessionFactory
					.getCurrentSession().get(SdiSysSpatialoperator.class, id);
			log.debug("get successful");
			return instance;
		} catch (RuntimeException re) {
			log.error("get failed", re);
			throw re;
		}
	}

	public void save(SdiSysSpatialoperator transientInstance) {
		log.debug("save SdiSysSpatialoperator instance");
		try {
			sessionFactory.getCurrentSession().save(transientInstance);
			log.debug("save successful");
		} catch (RuntimeException re) {
			log.error("save failed", re);
			throw re;
		}
	}

	public void saveOrUpdate(SdiSysSpatialoperator transientInstance) {
		log.debug("saveOrUpdate SdiSysSpatialoperator instance");
		try {
			sessionFactory.getCurrentSession().saveOrUpdate(transientInstance);
			log.debug("saveOrUpdate successful");
		} catch (RuntimeException re) {
			log.error("saveOrUpdate failed", re);
			throw re;
		}
	}

	public void update(SdiSysSpatialoperator transientInstance) {
		log.debug("update SdiSysSpatialoperator instance");
		try {
			sessionFactory.getCurrentSession().update(transientInstance);
			log.debug("update successful");
		} catch (RuntimeException re) {
			log.error("update failed", re);
			throw re;
		}
	}

	public void delete(SdiSysSpatialoperator transientInstance) {
		log.debug("delete SdiSysSpatialoperator instance");
		try {
			sessionFactory.getCurrentSession().delete(transientInstance);
			log.debug("delete successful");
		} catch (RuntimeException re) {
			log.error("delete failed", re);
			throw re;
		}
	}

	public void merge(SdiSysSpatialoperator transientInstance) {
		log.debug("merge SdiSysSpatialoperator instance");
		try {
			sessionFactory.getCurrentSession().merge(transientInstance);
			log.debug("merge successful");
		} catch (RuntimeException re) {
			log.error("merge failed", re);
			throw re;
		}
	}

	public SessionFactory getSessionFactory() {
		return sessionFactory;
	}

	public void setSessionFactory(SessionFactory sessionFactory) {
		this.sessionFactory = sessionFactory;
	}

}
