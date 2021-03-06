package org.easysdi.proxy.domain;

// Generated Apr 9, 2013 11:54:42 AM by Hibernate Tools 3.4.0.CR1

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.hibernate.Query;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

/**
 * Home object for domain model class Extensions.
 * @see org.easysdi.proxy.domain.Extensions
 * @author Hibernate Tools
 */

@Transactional
@Repository
public class ExtensionsHome {

	private static final Log log = LogFactory.getLog(ExtensionsHome.class);

	@Autowired
	private SessionFactory sessionFactory;

	public Extensions findById(Integer id) {
		log.debug("getting Extensions instance with id: " + id);
		try {
			Extensions instance = (Extensions) sessionFactory
					.getCurrentSession().get(Extensions.class, id);
			log.debug("get successful");
			return instance;
		} catch (RuntimeException re) {
			log.error("get failed", re);
			throw re;
		}
	}
	
	public Extensions findByName(String name) {
		try {
			Query query = sessionFactory.getCurrentSession().createQuery("from Extensions where name= :name");
			query.setParameter("name", name);
			Extensions instance = (Extensions) query.setCacheRegion("ExtensionsQueryCache").setCacheable(true).uniqueResult();
			return instance;
		} catch (RuntimeException re) {
			throw re;
		}
	}

	public void save(Extensions transientInstance) {
		log.debug("save Extensions instance");
		try {
			sessionFactory.getCurrentSession().save(transientInstance);
			log.debug("save successful");
		} catch (RuntimeException re) {
			log.error("save failed", re);
			throw re;
		}
	}

	public void saveOrUpdate(Extensions transientInstance) {
		log.debug("saveOrUpdate Extensions instance");
		try {
			sessionFactory.getCurrentSession().saveOrUpdate(transientInstance);
			log.debug("saveOrUpdate successful");
		} catch (RuntimeException re) {
			log.error("saveOrUpdate failed", re);
			throw re;
		}
	}

	public void update(Extensions transientInstance) {
		log.debug("update Extensions instance");
		try {
			sessionFactory.getCurrentSession().update(transientInstance);
			log.debug("update successful");
		} catch (RuntimeException re) {
			log.error("update failed", re);
			throw re;
		}
	}

	public void delete(Extensions transientInstance) {
		log.debug("delete Extensions instance");
		try {
			sessionFactory.getCurrentSession().delete(transientInstance);
			log.debug("delete successful");
		} catch (RuntimeException re) {
			log.error("delete failed", re);
			throw re;
		}
	}

	public void merge(Extensions transientInstance) {
		log.debug("merge Extensions instance");
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
