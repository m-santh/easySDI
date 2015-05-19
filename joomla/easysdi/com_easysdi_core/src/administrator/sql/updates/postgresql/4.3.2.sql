INSERT INTO #__sdi_sys_rendertype (ordering, state, value) VALUES (9, 1, 'upload');
INSERT INTO #__sdi_sys_rendertype (ordering, state, value) VALUES (10, 1, 'url');
INSERT INTO #__sdi_sys_rendertype (ordering, state, value) VALUES (11, 1, 'upload and url');

INSERT INTO #__sdi_sys_rendertype_stereotype (stereotype_id, rendertype_id) VALUES (14, 9);
INSERT INTO #__sdi_sys_rendertype_stereotype (stereotype_id, rendertype_id) VALUES (14, 10);
INSERT INTO #__sdi_sys_rendertype_stereotype (stereotype_id, rendertype_id) VALUES (14, 11);

DELETE FROM #__sdi_sys_rendertype_stereotype WHERE id=20;