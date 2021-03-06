package org.easysdi.proxy.domain;

// Generated Apr 9, 2013 11:54:42 AM by Hibernate Tools 3.4.0.CR1

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.hibernate.Query;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

/**
 * Home object for domain model class SdiUser.
 * @see org.easysdi.proxy.domain.SdiUser
 * @author Hibernate Tools
 */

@Transactional
@Repository
public class SdiUserHome {

	private static final Log log = LogFactory.getLog(SdiUserHome.class);

	@Autowired
	private SessionFactory sessionFactory;

	public SdiUser findById(Integer id) {
		log.debug("getting SdiUser instance with id: " + id);
		try {
			SdiUser instance = (SdiUser) sessionFactory.getCurrentSession()
					.get(SdiUser.class, id);
			log.debug("get successful");
			return instance;
		} catch (RuntimeException re) {
			log.error("get failed", re);
			throw re;
		}
	}
	
	public SdiUser findByUserName(String username) {
		try {
			Session session = sessionFactory.getCurrentSession();
			session.enableFilter("entityState");
			Query query = session.createQuery("FROM SdiUser s WHERE s.users.username= :username");
			query.setParameter("username", username);
			SdiUser instance = (SdiUser) query.setCacheRegion("SdiUserQueryCache").setCacheable(true).uniqueResult();
			
			return instance;
		} catch (RuntimeException re) {
			log.error("get failed", re);
			throw re;
		}
	}
	
	public void save(SdiUser transientInstance) {
		log.debug("save SdiUser instance");
		try {
			sessionFactory.getCurrentSession().save(transientInstance);
			log.debug("save successful");
		} catch (RuntimeException re) {
			log.error("save failed", re);
			throw re;
		}
	}

	public void saveOrUpdate(SdiUser transientInstance) {
		log.debug("saveOrUpdate SdiUser instance");
		try {
			sessionFactory.getCurrentSession().saveOrUpdate(transientInstance);
			log.debug("saveOrUpdate successful");
		} catch (RuntimeException re) {
			log.error("saveOrUpdate failed", re);
			throw re;
		}
	}

	public void update(SdiUser transientInstance) {
		log.debug("update SdiUser instance");
		try {
			sessionFactory.getCurrentSession().update(transientInstance);
			log.debug("update successful");
		} catch (RuntimeException re) {
			log.error("update failed", re);
			throw re;
		}
	}

	public void delete(SdiUser transientInstance) {
		log.debug("delete SdiUser instance");
		try {
			sessionFactory.getCurrentSession().delete(transientInstance);
			log.debug("delete successful");
		} catch (RuntimeException re) {
			log.error("delete failed", re);
			throw re;
		}
	}

	public void merge(SdiUser transientInstance) {
		log.debug("merge SdiUser instance");
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
