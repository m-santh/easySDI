ALTER TABLE #__sdi_order_diffusion ADD storage_id bigint NULL AFTER completed;
ALTER TABLE ONLY #__sdi_order_diffusion
    ADD CONSTRAINT #__sdi_order_diffusion_fk4 FOREIGN KEY (storage_id) REFERENCES #__sdi_sys_extractstorage(id) MATCH FULL;

ALTER TABLE #__sdi_order_diffusion ADD displayName character varying(75) NULL AFTER size;

UPDATE  #__sdi_language SET datatable='Arabic' WHERE code='ar-DZ';
UPDATE  #__sdi_language SET datatable='Bulgarian' WHERE code='bg-BG';
UPDATE  #__sdi_language SET datatable='Catalan' WHERE code='ca-ES';
UPDATE  #__sdi_language SET datatable='Czech' WHERE code='cs-CZ';
UPDATE  #__sdi_language SET datatable='Danish' WHERE code='da-DK';
UPDATE  #__sdi_language SET datatable='German' WHERE code='de-DE';
UPDATE  #__sdi_language SET datatable='Greek' WHERE code='el-GR';
UPDATE  #__sdi_language SET datatable='English' WHERE code='en-GB';
UPDATE  #__sdi_language SET datatable='English' WHERE code='en-US';
UPDATE  #__sdi_language SET datatable='Spanish' WHERE code='es-ES';
UPDATE  #__sdi_language SET datatable='Estonian' WHERE code='et-EE';
UPDATE  #__sdi_language SET datatable='Spanish' WHERE code='eu-ES';
UPDATE  #__sdi_language SET datatable='Finnish' WHERE code='fi-FI';
UPDATE  #__sdi_language SET datatable='French' WHERE code='fr-FR';
UPDATE  #__sdi_language SET datatable='Irish' WHERE code='ga-IE';
UPDATE  #__sdi_language SET datatable='Croatian' WHERE code='hr-HR';
UPDATE  #__sdi_language SET datatable='Hungarian' WHERE code='hu-HU';
UPDATE  #__sdi_language SET datatable='Italian' WHERE code='it-IT';
UPDATE  #__sdi_language SET datatable='Lithuanian' WHERE code='lt-LT';
UPDATE  #__sdi_language SET datatable='Latvian' WHERE code='lv-LV';
UPDATE  #__sdi_language SET datatable='Dutch' WHERE code='nl-NL';
UPDATE  #__sdi_language SET datatable='Norwegian' WHERE code='no-NO';
UPDATE  #__sdi_language SET datatable='Polish' WHERE code='pl-PL';
UPDATE  #__sdi_language SET datatable='Portuguese' WHERE code='pt-PT';
UPDATE  #__sdi_language SET datatable='Romanian' WHERE code='ro-RO';
UPDATE  #__sdi_language SET datatable='Russian' WHERE code='ru-RU';
UPDATE  #__sdi_language SET datatable='Slovak' WHERE code='sk-SK';
UPDATE  #__sdi_language SET datatable='Swedish' WHERE code='sv-SE';
UPDATE  #__sdi_language SET datatable='Turkish' WHERE code='tr-TR';
UPDATE  #__sdi_language SET datatable='Ukranian' WHERE code='uk-UA';
UPDATE  #__sdi_language SET datatable='Chinese' WHERE code='zh-CN';

ALTER TABLE #__sdi_perimeter ADD COLUMN maplayer_id integer NULL;
ALTER TABLE #__sdi_perimeter ADD COLUMN featuretypefieldlevel character varying(255) NULL;

ALTER TABLE #__sdi_order ADD COLUMN "level" VARCHAR(100) NULL;