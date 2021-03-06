// i18next, v1.9.0
// Copyright (c)2015 Jan Mühlemann (jamuhl).
// Distributed under MIT license
// http://i18next.com
(function(root) {

    // add indexOf to non ECMA-262 standard compliant browsers
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
            "use strict";
            if (this == null) {
                throw new TypeError();
            }
            var t = Object(this);
            var len = t.length >>> 0;
            if (len === 0) {
                return -1;
            }
            var n = 0;
            if (arguments.length > 0) {
                n = Number(arguments[1]);
                if (n != n) { // shortcut for verifying if it's NaN
                    n = 0;
                } else if (n != 0 && n != Infinity && n != -Infinity) {
                    n = (n > 0 || -1) * Math.floor(Math.abs(n));
                }
            }
            if (n >= len) {
                return -1;
            }
            var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
            for (; k < len; k++) {
                if (k in t && t[k] === searchElement) {
                    return k;
                }
            }
            return -1;
        }
    }
    
    // add lastIndexOf to non ECMA-262 standard compliant browsers
    if (!Array.prototype.lastIndexOf) {
        Array.prototype.lastIndexOf = function(searchElement /*, fromIndex*/) {
            "use strict";
            if (this == null) {
                throw new TypeError();
            }
            var t = Object(this);
            var len = t.length >>> 0;
            if (len === 0) {
                return -1;
            }
            var n = len;
            if (arguments.length > 1) {
                n = Number(arguments[1]);
                if (n != n) {
                    n = 0;
                } else if (n != 0 && n != (1 / 0) && n != -(1 / 0)) {
                    n = (n > 0 || -1) * Math.floor(Math.abs(n));
                }
            }
            var k = n >= 0 ? Math.min(n, len - 1) : len - Math.abs(n);
            for (; k >= 0; k--) {
                if (k in t && t[k] === searchElement) {
                    return k;
                }
            }
            return -1;
        };
    }
    
    // Add string trim for IE8.
    if (typeof String.prototype.trim !== 'function') {
        String.prototype.trim = function() {
            return this.replace(/^\s+|\s+$/g, ''); 
        }
    }

    var $ = root.jQuery || root.Zepto
      , i18n = {}
      , resStore = {}
      , currentLng
      , replacementCounter = 0
      , languages = []
      , initialized = false
      , sync = {}
      , conflictReference = null;



    // Export the i18next object for **CommonJS**. 
    // If we're not in CommonJS, add `i18n` to the
    // global object or to jquery.
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = i18n;
    } else {
        if ($) {
            $.i18n = $.i18n || i18n;
        }
        
        if (root.i18n) {
        	conflictReference = root.i18n;
        }
        root.i18n = i18n;
    }
    sync = {
    
        load: function(lngs, options, cb) {
            if (options.useLocalStorage) {
                sync._loadLocal(lngs, options, function(err, store) {
                    var missingLngs = [];
                    for (var i = 0, len = lngs.length; i < len; i++) {
                        if (!store[lngs[i]]) missingLngs.push(lngs[i]);
                    }
    
                    if (missingLngs.length > 0) {
                        sync._fetch(missingLngs, options, function(err, fetched) {
                            f.extend(store, fetched);
                            sync._storeLocal(fetched);
    
                            cb(null, store);
                        });
                    } else {
                        cb(null, store);
                    }
                });
            } else {
                sync._fetch(lngs, options, function(err, store){
                    cb(null, store);
                });
            }
        },
    
        _loadLocal: function(lngs, options, cb) {
            var store = {}
              , nowMS = new Date().getTime();
    
            if(window.localStorage) {
    
                var todo = lngs.length;
    
                f.each(lngs, function(key, lng) {
                    var local = f.localStorage.getItem('res_' + lng);
    
                    if (local) {
                        local = JSON.parse(local);
    
                        if (local.i18nStamp && local.i18nStamp + options.localStorageExpirationTime > nowMS) {
                            store[lng] = local;
                        }
                    }
    
                    todo--; // wait for all done befor callback
                    if (todo === 0) cb(null, store);
                });
            }
        },
    
        _storeLocal: function(store) {
            if(window.localStorage) {
                for (var m in store) {
                    store[m].i18nStamp = new Date().getTime();
                    f.localStorage.setItem('res_' + m, JSON.stringify(store[m]));
                }
            }
            return;
        },
    
        _fetch: function(lngs, options, cb) {
            var ns = options.ns
              , store = {};
            
            if (!options.dynamicLoad) {
                var todo = ns.namespaces.length * lngs.length
                  , errors;
    
                // load each file individual
                f.each(ns.namespaces, function(nsIndex, nsValue) {
                    f.each(lngs, function(lngIndex, lngValue) {
                        
                        // Call this once our translation has returned.
                        var loadComplete = function(err, data) {
                            if (err) {
                                errors = errors || [];
                                errors.push(err);
                            }
                            store[lngValue] = store[lngValue] || {};
                            store[lngValue][nsValue] = data;
    
                            todo--; // wait for all done befor callback
                            if (todo === 0) cb(errors, store);
                        };
                        
                        if(typeof options.customLoad == 'function'){
                            // Use the specified custom callback.
                            options.customLoad(lngValue, nsValue, options, loadComplete);
                        } else {
                            //~ // Use our inbuilt sync.
                            sync._fetchOne(lngValue, nsValue, options, loadComplete);
                        }
                    });
                });
            } else {
                // Call this once our translation has returned.
                var loadComplete = function(err, data) {
                    cb(null, data);
                };
    
                if(typeof options.customLoad == 'function'){
                    // Use the specified custom callback.
                    options.customLoad(lngs, ns.namespaces, options, loadComplete);
                } else {
                    var url = applyReplacement(options.resGetPath, { lng: lngs.join('+'), ns: ns.namespaces.join('+') });
                    // load all needed stuff once
                    f.ajax({
                        url: url,
                        cache: options.cache,
                        success: function(data, status, xhr) {
                            f.log('loaded: ' + url);
                            loadComplete(null, data);
                        },
                        error : function(xhr, status, error) {
                            f.log('failed loading: ' + url);
                            loadComplete('failed loading resource.json error: ' + error);
                        },
                        dataType: "json",
                        async : options.getAsync,
                        timeout: options.ajaxTimeout
                    });
                }    
            }
        },
    
        _fetchOne: function(lng, ns, options, done) {
            var url = applyReplacement(options.resGetPath, { lng: lng, ns: ns });
            f.ajax({
                url: url,
                cache: options.cache,
                success: function(data, status, xhr) {
                    f.log('loaded: ' + url);
                    done(null, data);
                },
                error : function(xhr, status, error) {
                    if ((status && status == 200) || (xhr && xhr.status && xhr.status == 200)) {
                        // file loaded but invalid json, stop waste time !
                        f.error('There is a typo in: ' + url);
                    } else if ((status && status == 404) || (xhr && xhr.status && xhr.status == 404)) {
                        f.log('Does not exist: ' + url);
                    } else {
                        var theStatus = status ? status : ((xhr && xhr.status) ? xhr.status : null);
                        f.log(theStatus + ' when loading ' + url);
                    }
                    
                    done(error, {});
                },
                dataType: "json",
                async : options.getAsync,
                timeout: options.ajaxTimeout
            });
        },
    
        postMissing: function(lng, ns, key, defaultValue, lngs) {
            var payload = {};
            payload[key] = defaultValue;
    
            var urls = [];
    
            if (o.sendMissingTo === 'fallback' && o.fallbackLng[0] !== false) {
                for (var i = 0; i < o.fallbackLng.length; i++) {
                    urls.push({lng: o.fallbackLng[i], url: applyReplacement(o.resPostPath, { lng: o.fallbackLng[i], ns: ns })});
                }
            } else if (o.sendMissingTo === 'current' || (o.sendMissingTo === 'fallback' && o.fallbackLng[0] === false) ) {
                urls.push({lng: lng, url: applyReplacement(o.resPostPath, { lng: lng, ns: ns })});
            } else if (o.sendMissingTo === 'all') {
                for (var i = 0, l = lngs.length; i < l; i++) {
                    urls.push({lng: lngs[i], url: applyReplacement(o.resPostPath, { lng: lngs[i], ns: ns })});
                }
            }
    
            for (var y = 0, len = urls.length; y < len; y++) {
                var item = urls[y];
                f.ajax({
                    url: item.url,
                    type: o.sendType,
                    data: payload,
                    success: function(data, status, xhr) {
                        f.log('posted missing key \'' + key + '\' to: ' + item.url);
    
                        // add key to resStore
                        var keys = key.split('.');
                        var x = 0;
                        var value = resStore[item.lng][ns];
                        while (keys[x]) {
                            if (x === keys.length - 1) {
                                value = value[keys[x]] = defaultValue;
                            } else {
                                value = value[keys[x]] = value[keys[x]] || {};
                            }
                            x++;
                        }
                    },
                    error : function(xhr, status, error) {
                        f.log('failed posting missing key \'' + key + '\' to: ' + item.url);
                    },
                    dataType: "json",
                    async : o.postAsync,
                    timeout: o.ajaxTimeout
                });
            }
        },
    
        reload: reload
    };
    // defaults
    var o = {
        lng: undefined,
        load: 'all',
        preload: [],
        lowerCaseLng: false,
        returnObjectTrees: false,
        fallbackLng: ['dev'],
        fallbackNS: [],
        detectLngQS: 'setLng',
        detectLngFromLocalStorage: false,
        ns: {
            namespaces: ['translation'],
            defaultNs: 'translation'
        },
        fallbackOnNull: true,
        fallbackOnEmpty: false,
        fallbackToDefaultNS: false,
        showKeyIfEmpty: false,
        nsseparator: ':',
        keyseparator: '.',
        selectorAttr: 'data-i18n',
        debug: false,
    
        resGetPath: 'locales/__lng__/__ns__.json',
        resPostPath: 'locales/add/__lng__/__ns__',
    
        getAsync: true,
        postAsync: true,
    
        resStore: undefined,
        useLocalStorage: false,
        localStorageExpirationTime: 7*24*60*60*1000,
    
        dynamicLoad: false,
        sendMissing: false,
        sendMissingTo: 'fallback', // current | all
        sendType: 'POST',
    
        interpolationPrefix: '__',
        interpolationSuffix: '__',
        defaultVariables: false,
        reusePrefix: '$t(',
        reuseSuffix: ')',
        pluralSuffix: '_plural',
        pluralNotFound: ['plural_not_found', Math.random()].join(''),
        contextNotFound: ['context_not_found', Math.random()].join(''),
        escapeInterpolation: false,
        indefiniteSuffix: '_indefinite',
        indefiniteNotFound: ['indefinite_not_found', Math.random()].join(''),
    
        setJqueryExt: true,
        defaultValueFromContent: true,
        useDataAttrOptions: false,
        cookieExpirationTime: undefined,
        useCookie: true,
        cookieName: 'i18next',
        cookieDomain: undefined,
    
        objectTreeKeyHandler: undefined,
        postProcess: undefined,
        parseMissingKey: undefined,
        missingKeyHandler: sync.postMissing,
        ajaxTimeout: 0,
    
        shortcutFunction: 'sprintf' // or: defaultValue
    };
    function _extend(target, source) {
        if (!source || typeof source === 'function') {
            return target;
        }
    
        for (var attr in source) { target[attr] = source[attr]; }
        return target;
    }
    
    function _deepExtend(target, source) {
        for (var prop in source)
            if (prop in target)
                _deepExtend(target[prop], source[prop]);
            else
                target[prop] = source[prop];
        return target;
    }
    
    function _each(object, callback, args) {
        var name, i = 0,
            length = object.length,
            isObj = length === undefined || Object.prototype.toString.apply(object) !== '[object Array]' || typeof object === "function";
    
        if (args) {
            if (isObj) {
                for (name in object) {
                    if (callback.apply(object[name], args) === false) {
                        break;
                    }
                }
            } else {
                for ( ; i < length; ) {
                    if (callback.apply(object[i++], args) === false) {
                        break;
                    }
                }
            }
    
        // A special, fast, case for the most common use of each
        } else {
            if (isObj) {
                for (name in object) {
                    if (callback.call(object[name], name, object[name]) === false) {
                        break;
                    }
                }
            } else {
                for ( ; i < length; ) {
                    if (callback.call(object[i], i, object[i++]) === false) {
                        break;
                    }
                }
            }
        }
    
        return object;
    }
    
    var _entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
    };
    
    function _escape(data) {
        if (typeof data === 'string') {
            return data.replace(/[&<>"'\/]/g, function (s) {
                return _entityMap[s];
            });
        }else{
            return data;
        }
    }
    
    function _ajax(options) {
    
        // v0.5.0 of https://github.com/goloroden/http.js
        var getXhr = function (callback) {
            // Use the native XHR object if the browser supports it.
            if (window.XMLHttpRequest) {
                return callback(null, new XMLHttpRequest());
            } else if (window.ActiveXObject) {
                // In Internet Explorer check for ActiveX versions of the XHR object.
                try {
                    return callback(null, new ActiveXObject("Msxml2.XMLHTTP"));
                } catch (e) {
                    return callback(null, new ActiveXObject("Microsoft.XMLHTTP"));
                }
            }
    
            // If no XHR support was found, throw an error.
            return callback(new Error());
        };
    
        var encodeUsingUrlEncoding = function (data) {
            if(typeof data === 'string') {
                return data;
            }
    
            var result = [];
            for(var dataItem in data) {
                if(data.hasOwnProperty(dataItem)) {
                    result.push(encodeURIComponent(dataItem) + '=' + encodeURIComponent(data[dataItem]));
                }
            }
    
            return result.join('&');
        };
    
        var utf8 = function (text) {
            text = text.replace(/\r\n/g, '\n');
            var result = '';
    
            for(var i = 0; i < text.length; i++) {
                var c = text.charCodeAt(i);
    
                if(c < 128) {
                        result += String.fromCharCode(c);
                } else if((c > 127) && (c < 2048)) {
                        result += String.fromCharCode((c >> 6) | 192);
                        result += String.fromCharCode((c & 63) | 128);
                } else {
                        result += String.fromCharCode((c >> 12) | 224);
                        result += String.fromCharCode(((c >> 6) & 63) | 128);
                        result += String.fromCharCode((c & 63) | 128);
                }
            }
    
            return result;
        };
    
        var base64 = function (text) {
            var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    
            text = utf8(text);
            var result = '',
                    chr1, chr2, chr3,
                    enc1, enc2, enc3, enc4,
                    i = 0;
    
            do {
                chr1 = text.charCodeAt(i++);
                chr2 = text.charCodeAt(i++);
                chr3 = text.charCodeAt(i++);
    
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
    
                if(isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if(isNaN(chr3)) {
                    enc4 = 64;
                }
    
                result +=
                    keyStr.charAt(enc1) +
                    keyStr.charAt(enc2) +
                    keyStr.charAt(enc3) +
                    keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = '';
                enc1 = enc2 = enc3 = enc4 = '';
            } while(i < text.length);
    
            return result;
        };
    
        var mergeHeaders = function () {
            // Use the first header object as base.
            var result = arguments[0];
    
            // Iterate through the remaining header objects and add them.
            for(var i = 1; i < arguments.length; i++) {
                var currentHeaders = arguments[i];
                for(var header in currentHeaders) {
                    if(currentHeaders.hasOwnProperty(header)) {
                        result[header] = currentHeaders[header];
                    }
                }
            }
    
            // Return the merged headers.
            return result;
        };
    
        var ajax = function (method, url, options, callback) {
            // Adjust parameters.
            if(typeof options === 'function') {
                callback = options;
                options = {};
            }
    
            // Set default parameter values.
            options.cache = options.cache || false;
            options.data = options.data || {};
            options.headers = options.headers || {};
            options.jsonp = options.jsonp || false;
            options.async = options.async === undefined ? true : options.async;
    
            // Merge the various header objects.
            var headers = mergeHeaders({
                'accept': '*/*',
                'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
            }, ajax.headers, options.headers);
    
            // Encode the data according to the content-type.
            var payload;
            if (headers['content-type'] === 'application/json') {
                payload = JSON.stringify(options.data);
            } else {
                payload = encodeUsingUrlEncoding(options.data);
            }
    
            // Specially prepare GET requests: Setup the query string, handle caching and make a JSONP call
            // if neccessary.
            if(method === 'GET') {
                // Setup the query string.
                var queryString = [];
                if(payload) {
                    queryString.push(payload);
                    payload = null;
                }
    
                // Handle caching.
                if(!options.cache) {
                    queryString.push('_=' + (new Date()).getTime());
                }
    
                // If neccessary prepare the query string for a JSONP call.
                if(options.jsonp) {
                    queryString.push('callback=' + options.jsonp);
                    queryString.push('jsonp=' + options.jsonp);
                }
    
                // Merge the query string and attach it to the url.
                queryString = queryString.join('&');
                if (queryString.length > 1) {
                    if (url.indexOf('?') > -1) {
                        url += '&' + queryString;
                    } else {
                        url += '?' + queryString;
                    }
                }
    
                // Make a JSONP call if neccessary.
                if(options.jsonp) {
                    var head = document.getElementsByTagName('head')[0];
                    var script = document.createElement('script');
                    script.type = 'text/javascript';
                    script.src = url;
                    head.appendChild(script);
                    return;
                }
            }
    
            // Since we got here, it is no JSONP request, so make a normal XHR request.
            getXhr(function (err, xhr) {
                if(err) return callback(err);
    
                // Open the request.
                xhr.open(method, url, options.async);
    
                // Set the request headers.
                for(var header in headers) {
                    if(headers.hasOwnProperty(header)) {
                        xhr.setRequestHeader(header, headers[header]);
                    }
                }
    
                // Handle the request events.
                xhr.onreadystatechange = function () {
                    if(xhr.readyState === 4) {
                        var data = xhr.responseText || '';
    
                        // If no callback is given, return.
                        if(!callback) {
                            return;
                        }
    
                        // Return an object that provides access to the data as text and JSON.
                        callback(xhr.status, {
                            text: function () {
                                return data;
                            },
    
                            json: function () {
                                try {
                                    return JSON.parse(data)
                                } catch (e) {
                                    f.error('Can not parse JSON. URL: ' + url);
                                    return {};
                                }
                            }
                        });
                    }
                };
    
                // Actually send the XHR request.
                xhr.send(payload);
            });
        };
    
        // Define the external interface.
        var http = {
            authBasic: function (username, password) {
                ajax.headers['Authorization'] = 'Basic ' + base64(username + ':' + password);
            },
    
            connect: function (url, options, callback) {
                return ajax('CONNECT', url, options, callback);
            },
    
            del: function (url, options, callback) {
                return ajax('DELETE', url, options, callback);
            },
    
            get: function (url, options, callback) {
                return ajax('GET', url, options, callback);
            },
    
            head: function (url, options, callback) {
                return ajax('HEAD', url, options, callback);
            },
    
            headers: function (headers) {
                ajax.headers = headers || {};
            },
    
            isAllowed: function (url, verb, callback) {
                this.options(url, function (status, data) {
                    callback(data.text().indexOf(verb) !== -1);
                });
            },
    
            options: function (url, options, callback) {
                return ajax('OPTIONS', url, options, callback);
            },
    
            patch: function (url, options, callback) {
                return ajax('PATCH', url, options, callback);
            },
    
            post: function (url, options, callback) {
                return ajax('POST', url, options, callback);
            },
    
            put: function (url, options, callback) {
                return ajax('PUT', url, options, callback);
            },
    
            trace: function (url, options, callback) {
                return ajax('TRACE', url, options, callback);
            }
        };
    
    
        var methode = options.type ? options.type.toLowerCase() : 'get';
    
        http[methode](options.url, options, function (status, data) {
            // file: protocol always gives status code 0, so check for data
            if (status === 200 || (status === 0 && data.text())) {
                options.success(data.json(), status, null);
            } else {
                options.error(data.text(), status, null);
            }
        });
    }
    
    var _cookie = {
        create: function(name,value,minutes,domain) {
            var expires;
            if (minutes) {
                var date = new Date();
                date.setTime(date.getTime()+(minutes*60*1000));
                expires = "; expires="+date.toGMTString();
            }
            else expires = "";
            domain = (domain)? "domain="+domain+";" : "";
            document.cookie = name+"="+value+expires+";"+domain+"path=/";
        },
    
        read: function(name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for(var i=0;i < ca.length;i++) {
                var c = ca[i];
                while (c.charAt(0)==' ') c = c.substring(1,c.length);
                if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
            }
            return null;
        },
    
        remove: function(name) {
            this.create(name,"",-1);
        }
    };
    
    var cookie_noop = {
        create: function(name,value,minutes,domain) {},
        read: function(name) { return null; },
        remove: function(name) {}
    };
    
    
    
    // move dependent functions to a container so that
    // they can be overriden easier in no jquery environment (node.js)
    var f = {
        extend: $ ? $.extend : _extend,
        deepExtend: _deepExtend,
        each: $ ? $.each : _each,
        ajax: $ ? $.ajax : (typeof document !== 'undefined' ? _ajax : function() {}),
        cookie: typeof document !== 'undefined' ? _cookie : cookie_noop,
        detectLanguage: detectLanguage,
        escape: _escape,
        log: function(str) {
            if (o.debug && typeof console !== "undefined") console.log(str);
        },
        error: function(str) {
            if (typeof console !== "undefined") console.error(str);
        },
        getCountyIndexOfLng: function(lng) {
            var lng_index = 0;
            if (lng === 'nb-NO' || lng === 'nn-NO' || lng === 'nb-no' || lng === 'nn-no') lng_index = 1;
            return lng_index;
        },
        toLanguages: function(lng) {
            var log = this.log;
    
            function applyCase(l) {
                var ret = l;
    
                if (typeof l === 'string' && l.indexOf('-') > -1) {
                    var parts = l.split('-');
    
                    ret = o.lowerCaseLng ?
                        parts[0].toLowerCase() +  '-' + parts[1].toLowerCase() :
                        parts[0].toLowerCase() +  '-' + parts[1].toUpperCase();
                } else {
                    ret = o.lowerCaseLng ? l.toLowerCase() : l;
                }
    
                return ret;
            }
    
            var languages = [];
            var whitelist = o.lngWhitelist || false;
            var addLanguage = function(language){
              //reject langs not whitelisted
              if(!whitelist || whitelist.indexOf(language) > -1){
                languages.push(language);
              }else{
                log('rejecting non-whitelisted language: ' + language);
              }
            };
            if (typeof lng === 'string' && lng.indexOf('-') > -1) {
                var parts = lng.split('-');
    
                if (o.load !== 'unspecific') addLanguage(applyCase(lng));
                if (o.load !== 'current') addLanguage(applyCase(parts[this.getCountyIndexOfLng(lng)]));
            } else {
                addLanguage(applyCase(lng));
            }
    
            for (var i = 0; i < o.fallbackLng.length; i++) {
                if (languages.indexOf(o.fallbackLng[i]) === -1 && o.fallbackLng[i]) languages.push(applyCase(o.fallbackLng[i]));
            }
            return languages;
        },
        regexEscape: function(str) {
            return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        },
        regexReplacementEscape: function(strOrFn) {
            if (typeof strOrFn === 'string') {
                return strOrFn.replace(/\$/g, "$$$$");
            } else {
                return strOrFn;
            }
        },
        localStorage: {
            setItem: function(key, value) {
                if (window.localStorage) {
                    try {
                        window.localStorage.setItem(key, value);
                    } catch (e) {
                        f.log('failed to set value for key "' + key + '" to localStorage.');
                    }
                }
            },
            getItem: function(key, value) {
                if (window.localStorage) {
                    try {
                        return window.localStorage.getItem(key, value);
                    } catch (e) {
                        f.log('failed to get value for key "' + key + '" from localStorage.');
                        return undefined;
                    }
                }
            }
        }
    };
    function init(options, cb) {
    
        if (typeof options === 'function') {
            cb = options;
            options = {};
        }
        options = options || {};
    
        // override defaults with passed in options
        f.extend(o, options);
        delete o.fixLng; /* passed in each time */
    
        // override functions: .log(), .detectLanguage(), etc
        if (o.functions) {
            delete o.functions;
            f.extend(f, options.functions);
        }
    
        // create namespace object if namespace is passed in as string
        if (typeof o.ns == 'string') {
            o.ns = { namespaces: [o.ns], defaultNs: o.ns};
        }
    
        // fallback namespaces
        if (typeof o.fallbackNS == 'string') {
            o.fallbackNS = [o.fallbackNS];
        }
    
        // fallback languages
        if (typeof o.fallbackLng == 'string' || typeof o.fallbackLng == 'boolean') {
            o.fallbackLng = [o.fallbackLng];
        }
    
        // escape prefix/suffix
        o.interpolationPrefixEscaped = f.regexEscape(o.interpolationPrefix);
        o.interpolationSuffixEscaped = f.regexEscape(o.interpolationSuffix);
    
        if (!o.lng) o.lng = f.detectLanguage();
    
        languages = f.toLanguages(o.lng);
        currentLng = languages[0];
        f.log('currentLng set to: ' + currentLng);
    
        if (o.useCookie && f.cookie.read(o.cookieName) !== currentLng){ //cookie is unset or invalid
            f.cookie.create(o.cookieName, currentLng, o.cookieExpirationTime, o.cookieDomain);
        }
        if (o.detectLngFromLocalStorage && typeof document !== 'undefined' && window.localStorage) {
            f.localStorage.setItem('i18next_lng', currentLng);
        }
    
        var lngTranslate = translate;
        if (options.fixLng) {
            lngTranslate = function(key, options) {
                options = options || {};
                options.lng = options.lng || lngTranslate.lng;
                return translate(key, options);
            };
            lngTranslate.lng = currentLng;
        }
    
        pluralExtensions.setCurrentLng(currentLng);
    
        // add JQuery extensions
        if ($ && o.setJqueryExt) addJqueryFunct();
    
        // jQuery deferred
        var deferred;
        if ($ && $.Deferred) {
            deferred = $.Deferred();
        }
    
        // return immidiatly if res are passed in
        if (o.resStore) {
            resStore = o.resStore;
            initialized = true;
            if (cb) cb(lngTranslate);
            if (deferred) deferred.resolve(lngTranslate);
            if (deferred) return deferred.promise();
            return;
        }
    
        // languages to load
        var lngsToLoad = f.toLanguages(o.lng);
        if (typeof o.preload === 'string') o.preload = [o.preload];
        for (var i = 0, l = o.preload.length; i < l; i++) {
            var pres = f.toLanguages(o.preload[i]);
            for (var y = 0, len = pres.length; y < len; y++) {
                if (lngsToLoad.indexOf(pres[y]) < 0) {
                    lngsToLoad.push(pres[y]);
                }
            }
        }
    
        // else load them
        i18n.sync.load(lngsToLoad, o, function(err, store) {
            resStore = store;
            initialized = true;
    
            if (cb) cb(lngTranslate);
            if (deferred) deferred.resolve(lngTranslate);
        });
    
        if (deferred) return deferred.promise();
    }
    
    function isInitialized() {
        return initialized;
    }
    function preload(lngs, cb) {
        if (typeof lngs === 'string') lngs = [lngs];
        for (var i = 0, l = lngs.length; i < l; i++) {
            if (o.preload.indexOf(lngs[i]) < 0) {
                o.preload.push(lngs[i]);
            }
        }
        return init(cb);
    }
    
    function addResourceBundle(lng, ns, resources, deep) {
        if (typeof ns !== 'string') {
            resources = ns;
            ns = o.ns.defaultNs;
        } else if (o.ns.namespaces.indexOf(ns) < 0) {
            o.ns.namespaces.push(ns);
        }
    
        resStore[lng] = resStore[lng] || {};
        resStore[lng][ns] = resStore[lng][ns] || {};
    
        if (deep) {
            f.deepExtend(resStore[lng][ns], resources);
        } else {
            f.extend(resStore[lng][ns], resources);
        }
        if (o.useLocalStorage) {
            sync._storeLocal(resStore);
        }
    }
    
    function hasResourceBundle(lng, ns) {
        if (typeof ns !== 'string') {
            ns = o.ns.defaultNs;
        }
    
        resStore[lng] = resStore[lng] || {};
        var res = resStore[lng][ns] || {};
    
        var hasValues = false;
        for(var prop in res) {
            if (res.hasOwnProperty(prop)) {
                hasValues = true;
            }
        }
    
        return hasValues;
    }
    
    function getResourceBundle(lng, ns) {
        if (typeof ns !== 'string') {
            ns = o.ns.defaultNs;
        }
    
        resStore[lng] = resStore[lng] || {};
        return f.extend({}, resStore[lng][ns]);
    }
    
    function removeResourceBundle(lng, ns) {
        if (typeof ns !== 'string') {
            ns = o.ns.defaultNs;
        }
    
        resStore[lng] = resStore[lng] || {};
        resStore[lng][ns] = {};
        if (o.useLocalStorage) {
            sync._storeLocal(resStore);
        }
    }
    
    function addResource(lng, ns, key, value) {
        if (typeof ns !== 'string') {
            resource = ns;
            ns = o.ns.defaultNs;
        } else if (o.ns.namespaces.indexOf(ns) < 0) {
            o.ns.namespaces.push(ns);
        }
    
        resStore[lng] = resStore[lng] || {};
        resStore[lng][ns] = resStore[lng][ns] || {};
    
        var keys = key.split(o.keyseparator);
        var x = 0;
        var node = resStore[lng][ns];
        var origRef = node;
    
        while (keys[x]) {
            if (x == keys.length - 1)
                node[keys[x]] = value;
            else {
                if (node[keys[x]] == null)
                    node[keys[x]] = {};
    
                node = node[keys[x]];
            }
            x++;
        }
        if (o.useLocalStorage) {
            sync._storeLocal(resStore);
        }
    }
    
    function addResources(lng, ns, resources) {
        if (typeof ns !== 'string') {
            resource = ns;
            ns = o.ns.defaultNs;
        } else if (o.ns.namespaces.indexOf(ns) < 0) {
            o.ns.namespaces.push(ns);
        }
    
        for (var m in resources) {
            if (typeof resources[m] === 'string') addResource(lng, ns, m, resources[m]);
        }
    }
    
    function setDefaultNamespace(ns) {
        o.ns.defaultNs = ns;
    }
    
    function loadNamespace(namespace, cb) {
        loadNamespaces([namespace], cb);
    }
    
    function loadNamespaces(namespaces, cb) {
        var opts = {
            dynamicLoad: o.dynamicLoad,
            resGetPath: o.resGetPath,
            getAsync: o.getAsync,
            customLoad: o.customLoad,
            ns: { namespaces: namespaces, defaultNs: ''} /* new namespaces to load */
        };
    
        // languages to load
        var lngsToLoad = f.toLanguages(o.lng);
        if (typeof o.preload === 'string') o.preload = [o.preload];
        for (var i = 0, l = o.preload.length; i < l; i++) {
            var pres = f.toLanguages(o.preload[i]);
            for (var y = 0, len = pres.length; y < len; y++) {
                if (lngsToLoad.indexOf(pres[y]) < 0) {
                    lngsToLoad.push(pres[y]);
                }
            }
        }
    
        // check if we have to load
        var lngNeedLoad = [];
        for (var a = 0, lenA = lngsToLoad.length; a < lenA; a++) {
            var needLoad = false;
            var resSet = resStore[lngsToLoad[a]];
            if (resSet) {
                for (var b = 0, lenB = namespaces.length; b < lenB; b++) {
                    if (!resSet[namespaces[b]]) needLoad = true;
                }
            } else {
                needLoad = true;
            }
    
            if (needLoad) lngNeedLoad.push(lngsToLoad[a]);
        }
    
        if (lngNeedLoad.length) {
            i18n.sync._fetch(lngNeedLoad, opts, function(err, store) {
                var todo = namespaces.length * lngNeedLoad.length;
    
                // load each file individual
                f.each(namespaces, function(nsIndex, nsValue) {
    
                    // append namespace to namespace array
                    if (o.ns.namespaces.indexOf(nsValue) < 0) {
                        o.ns.namespaces.push(nsValue);
                    }
    
                    f.each(lngNeedLoad, function(lngIndex, lngValue) {
                        resStore[lngValue] = resStore[lngValue] || {};
                        resStore[lngValue][nsValue] = store[lngValue][nsValue];
    
                        todo--; // wait for all done befor callback
                        if (todo === 0 && cb) {
                            if (o.useLocalStorage) i18n.sync._storeLocal(resStore);
                            cb();
                        }
                    });
                });
            });
        } else {
            if (cb) cb();
        }
    }
    
    function setLng(lng, options, cb) {
        if (typeof options === 'function') {
            cb = options;
            options = {};
        } else if (!options) {
            options = {};
        }
    
        options.lng = lng;
        return init(options, cb);
    }
    
    function lng() {
        return currentLng;
    }
    
    function reload(cb) {
        resStore = {};
        setLng(currentLng, cb);
    }
    
    function noConflict() {
        
        window.i18next = window.i18n;
    
        if (conflictReference) {
            window.i18n = conflictReference;
        } else {
            delete window.i18n;
        }
    }
    function addJqueryFunct() {
        // $.t shortcut
        $.t = $.t || translate;
    
        function parse(ele, key, options) {
            if (key.length === 0) return;
    
            var attr = 'text';
    
            if (key.indexOf('[') === 0) {
                var parts = key.split(']');
                key = parts[1];
                attr = parts[0].substr(1, parts[0].length-1);
            }
    
            if (key.indexOf(';') === key.length-1) {
                key = key.substr(0, key.length-2);
            }
    
            var optionsToUse;
            if (attr === 'html') {
                optionsToUse = o.defaultValueFromContent ? $.extend({ defaultValue: ele.html() }, options) : options;
                ele.html($.t(key, optionsToUse));
            } else if (attr === 'text') {
                optionsToUse = o.defaultValueFromContent ? $.extend({ defaultValue: ele.text() }, options) : options;
                ele.text($.t(key, optionsToUse));
            } else if (attr === 'prepend') {
                optionsToUse = o.defaultValueFromContent ? $.extend({ defaultValue: ele.html() }, options) : options;
                ele.prepend($.t(key, optionsToUse));
            } else if (attr === 'append') {
                optionsToUse = o.defaultValueFromContent ? $.extend({ defaultValue: ele.html() }, options) : options;
                ele.append($.t(key, optionsToUse));
            } else if (attr.indexOf("data-") === 0) {
                var dataAttr = attr.substr(("data-").length);
                optionsToUse = o.defaultValueFromContent ? $.extend({ defaultValue: ele.data(dataAttr) }, options) : options;
                var translated = $.t(key, optionsToUse);
                //we change into the data cache
                ele.data(dataAttr, translated);
                //we change into the dom
                ele.attr(attr, translated);
            } else {
                optionsToUse = o.defaultValueFromContent ? $.extend({ defaultValue: ele.attr(attr) }, options) : options;
                ele.attr(attr, $.t(key, optionsToUse));
            }
        }
    
        function localize(ele, options) {
            var key = ele.attr(o.selectorAttr);
            if (!key && typeof key !== 'undefined' && key !== false) key = ele.text() || ele.val();
            if (!key) return;
    
            var target = ele
              , targetSelector = ele.data("i18n-target");
            if (targetSelector) {
                target = ele.find(targetSelector) || ele;
            }
    
            if (!options && o.useDataAttrOptions === true) {
                options = ele.data("i18n-options");
            }
            options = options || {};
    
            if (key.indexOf(';') >= 0) {
                var keys = key.split(';');
    
                $.each(keys, function(m, k) {
                    if (k !== '') parse(target, k, options);
                });
    
            } else {
                parse(target, key, options);
            }
    
            if (o.useDataAttrOptions === true) ele.data("i18n-options", options);
        }
    
        // fn
        $.fn.i18n = function (options) {
            return this.each(function() {
                // localize element itself
                localize($(this), options);
    
                // localize childs
                var elements =  $(this).find('[' + o.selectorAttr + ']');
                elements.each(function() { 
                    localize($(this), options);
                });
            });
        };
    }
    function applyReplacement(str, replacementHash, nestedKey, options) {
        if (!str) return str;
    
        options = options || replacementHash; // first call uses replacement hash combined with options
        if (str.indexOf(options.interpolationPrefix || o.interpolationPrefix) < 0) return str;
    
        var prefix = options.interpolationPrefix ? f.regexEscape(options.interpolationPrefix) : o.interpolationPrefixEscaped
          , suffix = options.interpolationSuffix ? f.regexEscape(options.interpolationSuffix) : o.interpolationSuffixEscaped
          , unEscapingSuffix = 'HTML'+suffix;
    
        var hash = replacementHash.replace && typeof replacementHash.replace === 'object' ? replacementHash.replace : replacementHash;
        f.each(hash, function(key, value) {
            var nextKey = nestedKey ? nestedKey + o.keyseparator + key : key;
            if (typeof value === 'object' && value !== null) {
                str = applyReplacement(str, value, nextKey, options);
            } else {
                if (options.escapeInterpolation || o.escapeInterpolation) {
                    str = str.replace(new RegExp([prefix, nextKey, unEscapingSuffix].join(''), 'g'), f.regexReplacementEscape(value));
                    str = str.replace(new RegExp([prefix, nextKey, suffix].join(''), 'g'), f.regexReplacementEscape(f.escape(value)));
                } else {
                    str = str.replace(new RegExp([prefix, nextKey, suffix].join(''), 'g'), f.regexReplacementEscape(value));
                }
                // str = options.escapeInterpolation;
            }
        });
        return str;
    }
    
    // append it to functions
    f.applyReplacement = applyReplacement;
    
    function applyReuse(translated, options) {
        var comma = ',';
        var options_open = '{';
        var options_close = '}';
    
        var opts = f.extend({}, options);
        delete opts.postProcess;
    
        while (translated.indexOf(o.reusePrefix) != -1) {
            replacementCounter++;
            if (replacementCounter > o.maxRecursion) { break; } // safety net for too much recursion
            var index_of_opening = translated.lastIndexOf(o.reusePrefix);
            var index_of_end_of_closing = translated.indexOf(o.reuseSuffix, index_of_opening) + o.reuseSuffix.length;
            var token = translated.substring(index_of_opening, index_of_end_of_closing);
            var token_without_symbols = token.replace(o.reusePrefix, '').replace(o.reuseSuffix, '');
    
            if (index_of_end_of_closing <= index_of_opening) {
                f.error('there is an missing closing in following translation value', translated);
                return '';
            }
    
            if (token_without_symbols.indexOf(comma) != -1) {
                var index_of_token_end_of_closing = token_without_symbols.indexOf(comma);
                if (token_without_symbols.indexOf(options_open, index_of_token_end_of_closing) != -1 && token_without_symbols.indexOf(options_close, index_of_token_end_of_closing) != -1) {
                    var index_of_opts_opening = token_without_symbols.indexOf(options_open, index_of_token_end_of_closing);
                    var index_of_opts_end_of_closing = token_without_symbols.indexOf(options_close, index_of_opts_opening) + options_close.length;
                    try {
                        opts = f.extend(opts, JSON.parse(token_without_symbols.substring(index_of_opts_opening, index_of_opts_end_of_closing)));
                        token_without_symbols = token_without_symbols.substring(0, index_of_token_end_of_closing);
                    } catch (e) {
                    }
                }
            }
    
            var translated_token = _translate(token_without_symbols, opts);
            translated = translated.replace(token, f.regexReplacementEscape(translated_token));
        }
        return translated;
    }
    
    function hasContext(options) {
        return (options.context && (typeof options.context == 'string' || typeof options.context == 'number'));
    }
    
    function needsPlural(options, lng) {
        return (options.count !== undefined && typeof options.count != 'string'/* && pluralExtensions.needsPlural(lng, options.count)*/);
    }
    
    function needsIndefiniteArticle(options) {
        return (options.indefinite_article !== undefined && typeof options.indefinite_article != 'string' && options.indefinite_article);
    }
    
    function exists(key, options) {
        options = options || {};
    
        var notFound = _getDefaultValue(key, options)
            , found = _find(key, options);
    
        return found !== undefined || found === notFound;
    }
    
    function translate(key, options) {
        options = options || {};
    
        if (!initialized) {
            f.log('i18next not finished initialization. you might have called t function before loading resources finished.')
            return options.defaultValue || '';
        };
        replacementCounter = 0;
        return _translate.apply(null, arguments);
    }
    
    function _getDefaultValue(key, options) {
        return (options.defaultValue !== undefined) ? options.defaultValue : key;
    }
    
    function _injectSprintfProcessor() {
    
        var values = [];
    
        // mh: build array from second argument onwards
        for (var i = 1; i < arguments.length; i++) {
            values.push(arguments[i]);
        }
    
        return {
            postProcess: 'sprintf',
            sprintf:     values
        };
    }
    
    function _translate(potentialKeys, options) {
        if (options && typeof options !== 'object') {
            if (o.shortcutFunction === 'sprintf') {
                // mh: gettext like sprintf syntax found, automatically create sprintf processor
                options = _injectSprintfProcessor.apply(null, arguments);
            } else if (o.shortcutFunction === 'defaultValue') {
                options = {
                    defaultValue: options
                }
            }
        } else {
            options = options || {};
        }
    
        if (typeof o.defaultVariables === 'object') {
            options = f.extend({}, o.defaultVariables, options);
        }
    
        if (potentialKeys === undefined || potentialKeys === null || potentialKeys === '') return '';
    
        if (typeof potentialKeys === 'number') {
            potentialKeys = String(potentialKeys);
        }
    
        if (typeof potentialKeys === 'string') {
            potentialKeys = [potentialKeys];
        }
    
        var key = potentialKeys[0];
    
        if (potentialKeys.length > 1) {
            for (var i = 0; i < potentialKeys.length; i++) {
                key = potentialKeys[i];
                if (exists(key, options)) {
                    break;
                }
            }
        }
    
        var notFound = _getDefaultValue(key, options)
            , found = _find(key, options)
            , lngs = options.lng ? f.toLanguages(options.lng, options.fallbackLng) : languages
            , ns = options.ns || o.ns.defaultNs
            , parts;
    
        // split ns and key
        if (key.indexOf(o.nsseparator) > -1) {
            parts = key.split(o.nsseparator);
            ns = parts[0];
            key = parts[1];
        }
    
        if (found === undefined && o.sendMissing && typeof o.missingKeyHandler === 'function') {
            if (options.lng) {
                o.missingKeyHandler(lngs[0], ns, key, notFound, lngs);
            } else {
                o.missingKeyHandler(o.lng, ns, key, notFound, lngs);
            }
        }
    
        var postProcessorsToApply;
        if (typeof o.postProcess === 'string' && o.postProcess !== '') {
            postProcessorsToApply = [o.postProcess];
        } else if (typeof o.postProcess === 'array' || typeof o.postProcess === 'object') {
            postProcessorsToApply = o.postProcess;
        } else {
            postProcessorsToApply = [];
        }
    
        if (typeof options.postProcess === 'string' && options.postProcess !== '') {
            postProcessorsToApply = postProcessorsToApply.concat([options.postProcess]);
        } else if (typeof options.postProcess === 'array' || typeof options.postProcess === 'object') {
            postProcessorsToApply = postProcessorsToApply.concat(options.postProcess);
        }
    
        if (found !== undefined && postProcessorsToApply.length) {
            postProcessorsToApply.forEach(function(postProcessor) {
                if (postProcessors[postProcessor]) {
                    found = postProcessors[postProcessor](found, key, options);
                }
            });
        }
    
        // process notFound if function exists
        var splitNotFound = notFound;
        if (notFound.indexOf(o.nsseparator) > -1) {
            parts = notFound.split(o.nsseparator);
            splitNotFound = parts[1];
        }
        if (splitNotFound === key && o.parseMissingKey) {
            notFound = o.parseMissingKey(notFound);
        }
    
        if (found === undefined) {
            notFound = applyReplacement(notFound, options);
            notFound = applyReuse(notFound, options);
    
            if (postProcessorsToApply.length) {
                var val = _getDefaultValue(key, options);
                postProcessorsToApply.forEach(function(postProcessor) {
                    if (postProcessors[postProcessor]) {
                        found = postProcessors[postProcessor](val, key, options);
                    }
                });
            }
        }
    
        return (found !== undefined) ? found : notFound;
    }
    
    function _find(key, options) {
        options = options || {};
    
        var optionWithoutCount, translated
            , notFound = _getDefaultValue(key, options)
            , lngs = languages;
    
        if (!resStore) { return notFound; } // no resStore to translate from
    
        // CI mode
        if (lngs[0].toLowerCase() === 'cimode') return notFound;
    
        // passed in lng
        if (options.lngs) lngs = options.lngs;
        if (options.lng) {
            lngs = f.toLanguages(options.lng, options.fallbackLng);
    
            if (!resStore[lngs[0]]) {
                var oldAsync = o.getAsync;
                o.getAsync = false;
    
                i18n.sync.load(lngs, o, function(err, store) {
                    f.extend(resStore, store);
                    o.getAsync = oldAsync;
                });
            }
        }
    
        var ns = options.ns || o.ns.defaultNs;
        if (key.indexOf(o.nsseparator) > -1) {
            var parts = key.split(o.nsseparator);
            ns = parts[0];
            key = parts[1];
        }
    
        if (hasContext(options)) {
            optionWithoutCount = f.extend({}, options);
            delete optionWithoutCount.context;
            optionWithoutCount.defaultValue = o.contextNotFound;
    
            var contextKey = ns + o.nsseparator + key + '_' + options.context;
    
            translated = translate(contextKey, optionWithoutCount);
            if (translated != o.contextNotFound) {
                return applyReplacement(translated, { context: options.context }); // apply replacement for context only
            } // else continue translation with original/nonContext key
        }
    
        if (needsPlural(options, lngs[0])) {
            optionWithoutCount = f.extend({ lngs: [lngs[0]]}, options);
            delete optionWithoutCount.count;
            optionWithoutCount._origLng = optionWithoutCount._origLng || optionWithoutCount.lng || lngs[0];
            delete optionWithoutCount.lng;
            optionWithoutCount.defaultValue = o.pluralNotFound;
    
            var pluralKey;
            if (!pluralExtensions.needsPlural(lngs[0], options.count)) {
                pluralKey = ns + o.nsseparator + key;
            } else {
                pluralKey = ns + o.nsseparator + key + o.pluralSuffix;
                var pluralExtension = pluralExtensions.get(lngs[0], options.count);
                if (pluralExtension >= 0) {
                    pluralKey = pluralKey + '_' + pluralExtension;
                } else if (pluralExtension === 1) {
                    pluralKey = ns + o.nsseparator + key; // singular
                }
            }
    
            translated = translate(pluralKey, optionWithoutCount);
    
            if (translated != o.pluralNotFound) {
                return applyReplacement(translated, {
                    count: options.count,
                    interpolationPrefix: options.interpolationPrefix,
                    interpolationSuffix: options.interpolationSuffix
                }); // apply replacement for count only
            } else if (lngs.length > 1) {
                // remove failed lng
                var clone = lngs.slice();
                clone.shift();
                options = f.extend(options, { lngs: clone });
                options._origLng = optionWithoutCount._origLng;
                delete options.lng;
                // retry with fallbacks
                translated = translate(ns + o.nsseparator + key, options);
                if (translated != o.pluralNotFound) return translated;
            } else {
                optionWithoutCount.lng = optionWithoutCount._origLng;
                delete optionWithoutCount._origLng;
                translated = translate(ns + o.nsseparator + key, optionWithoutCount);
    
                return applyReplacement(translated, {
                    count: options.count,
                    interpolationPrefix: options.interpolationPrefix,
                    interpolationSuffix: options.interpolationSuffix
                });
            }
        }
    
        if (needsIndefiniteArticle(options)) {
            var optionsWithoutIndef = f.extend({}, options);
            delete optionsWithoutIndef.indefinite_article;
            optionsWithoutIndef.defaultValue = o.indefiniteNotFound;
            // If we don't have a count, we want the indefinite, if we do have a count, and needsPlural is false
            var indefiniteKey = ns + o.nsseparator + key + (((options.count && !needsPlural(options, lngs[0])) || !options.count) ? o.indefiniteSuffix : "");
            translated = translate(indefiniteKey, optionsWithoutIndef);
            if (translated != o.indefiniteNotFound) {
                return translated;
            }
        }
    
        var found;
        var keys = key.split(o.keyseparator);
        for (var i = 0, len = lngs.length; i < len; i++ ) {
            if (found !== undefined) break;
    
            var l = lngs[i];
    
            var x = 0;
            var value = resStore[l] && resStore[l][ns];
            while (keys[x]) {
                value = value && value[keys[x]];
                x++;
            }
            if (value !== undefined && (!o.showKeyIfEmpty || value !== '')) {
                var valueType = Object.prototype.toString.apply(value);
                if (typeof value === 'string') {
                    value = applyReplacement(value, options);
                    value = applyReuse(value, options);
                } else if (valueType === '[object Array]' && !o.returnObjectTrees && !options.returnObjectTrees) {
                    value = value.join('\n');
                    value = applyReplacement(value, options);
                    value = applyReuse(value, options);
                } else if (value === null && o.fallbackOnNull === true) {
                    value = undefined;
                } else if (value !== null) {
                    if (!o.returnObjectTrees && !options.returnObjectTrees) {
                        if (o.objectTreeKeyHandler && typeof o.objectTreeKeyHandler == 'function') {
                            value = o.objectTreeKeyHandler(key, value, l, ns, options);
                        } else {
                            value = 'key \'' + ns + ':' + key + ' (' + l + ')\' ' +
                                'returned an object instead of string.';
                            f.log(value);
                        }
                    } else if (valueType !== '[object Number]' && valueType !== '[object Function]' && valueType !== '[object RegExp]') {
                        var copy = (valueType === '[object Array]') ? [] : {}; // apply child translation on a copy
                        f.each(value, function(m) {
                            copy[m] = _translate(ns + o.nsseparator + key + o.keyseparator + m, options);
                        });
                        value = copy;
                    }
                }
    
                if (typeof value === 'string' && value.trim() === '' && o.fallbackOnEmpty === true)
                    value = undefined;
    
                found = value;
            }
        }
    
        if (found === undefined && !options.isFallbackLookup && (o.fallbackToDefaultNS === true || (o.fallbackNS && o.fallbackNS.length > 0))) {
            // set flag for fallback lookup - avoid recursion
            options.isFallbackLookup = true;
    
            if (o.fallbackNS.length) {
    
                for (var y = 0, lenY = o.fallbackNS.length; y < lenY; y++) {
                    found = _find(o.fallbackNS[y] + o.nsseparator + key, options);
    
                    if (found || (found==="" && o.fallbackOnEmpty === false)) {
                        /* compare value without namespace */
                        var foundValue = found.indexOf(o.nsseparator) > -1 ? found.split(o.nsseparator)[1] : found
                          , notFoundValue = notFound.indexOf(o.nsseparator) > -1 ? notFound.split(o.nsseparator)[1] : notFound;
    
                        if (foundValue !== notFoundValue) break;
                    }
                }
            } else {
                options.ns = o.ns.defaultNs;
                found = _find(key, options); // fallback to default NS
            }
            options.isFallbackLookup = false;
        }
    
        return found;
    }
    function detectLanguage() {
        var detectedLng;
        var whitelist = o.lngWhitelist || [];
        var userLngChoices = [];
    
        // get from qs
        var qsParm = [];
        if (typeof window !== 'undefined') {
            (function() {
                var query = window.location.search.substring(1);
                var params = query.split('&');
                for (var i=0; i<params.length; i++) {
                    var pos = params[i].indexOf('=');
                    if (pos > 0) {
                        var key = params[i].substring(0,pos);
                        if (key == o.detectLngQS) {
                            userLngChoices.push(params[i].substring(pos+1));
                        }
                    }
                }
            })();
        }
    
        // get from cookie
        if (o.useCookie && typeof document !== 'undefined') {
            var c = f.cookie.read(o.cookieName);
            if (c) userLngChoices.push(c);
        }
    
        // get from localStorage
        if (o.detectLngFromLocalStorage && typeof window !== 'undefined' && window.localStorage) {
            var lang = f.localStorage.getItem('i18next_lng');
            if (lang) {
                userLngChoices.push(lang);
            }
        }
    
        // get from navigator
        if (typeof navigator !== 'undefined') {
            if (navigator.languages) { // chrome only; not an array, so can't use .push.apply instead of iterating
                for (var i=0;i<navigator.languages.length;i++) {
                    userLngChoices.push(navigator.languages[i]);
                }
            }
            if (navigator.userLanguage) {
                userLngChoices.push(navigator.userLanguage);
            }
            if (navigator.language) {
                userLngChoices.push(navigator.language);
            }
        }
    
        (function() {
            for (var i=0;i<userLngChoices.length;i++) {
                var lng = userLngChoices[i];
    
                if (lng.indexOf('-') > -1) {
                    var parts = lng.split('-');
                    lng = o.lowerCaseLng ?
                        parts[0].toLowerCase() +  '-' + parts[1].toLowerCase() :
                        parts[0].toLowerCase() +  '-' + parts[1].toUpperCase();
                }
    
                if (whitelist.length === 0 || whitelist.indexOf(lng) > -1) {
                    detectedLng = lng;
                    break;
                }
            }
        })();
    
        //fallback
        if (!detectedLng){
          detectedLng = o.fallbackLng[0];
        }
        
        return detectedLng;
    }
    // definition http://translate.sourceforge.net/wiki/l10n/pluralforms
    
    /* [code, name, numbers, pluralsType] */
    var _rules = [
        ["ach", "Acholi", [1,2], 1],
        ["af", "Afrikaans",[1,2], 2],
        ["ak", "Akan", [1,2], 1],
        ["am", "Amharic", [1,2], 1],
        ["an", "Aragonese",[1,2], 2],
        ["ar", "Arabic", [0,1,2,3,11,100],5],
        ["arn", "Mapudungun",[1,2], 1],
        ["ast", "Asturian", [1,2], 2],
        ["ay", "Aymará", [1], 3],
        ["az", "Azerbaijani",[1,2],2],
        ["be", "Belarusian",[1,2,5],4],
        ["bg", "Bulgarian",[1,2], 2],
        ["bn", "Bengali", [1,2], 2],
        ["bo", "Tibetan", [1], 3],
        ["br", "Breton", [1,2], 1],
        ["bs", "Bosnian", [1,2,5],4],
        ["ca", "Catalan", [1,2], 2],
        ["cgg", "Chiga", [1], 3],
        ["cs", "Czech", [1,2,5],6],
        ["csb", "Kashubian",[1,2,5],7],
        ["cy", "Welsh", [1,2,3,8],8],
        ["da", "Danish", [1,2], 2],
        ["de", "German", [1,2], 2],
        ["dev", "Development Fallback", [1,2], 2],
        ["dz", "Dzongkha", [1], 3],
        ["el", "Greek", [1,2], 2],
        ["en", "English", [1,2], 2],
        ["eo", "Esperanto",[1,2], 2],
        ["es", "Spanish", [1,2], 2],
        ["es_ar","Argentinean Spanish", [1,2], 2],
        ["et", "Estonian", [1,2], 2],
        ["eu", "Basque", [1,2], 2],
        ["fa", "Persian", [1], 3],
        ["fi", "Finnish", [1,2], 2],
        ["fil", "Filipino", [1,2], 1],
        ["fo", "Faroese", [1,2], 2],
        ["fr", "French", [1,2], 9],
        ["fur", "Friulian", [1,2], 2],
        ["fy", "Frisian", [1,2], 2],
        ["ga", "Irish", [1,2,3,7,11],10],
        ["gd", "Scottish Gaelic",[1,2,3,20],11],
        ["gl", "Galician", [1,2], 2],
        ["gu", "Gujarati", [1,2], 2],
        ["gun", "Gun", [1,2], 1],
        ["ha", "Hausa", [1,2], 2],
        ["he", "Hebrew", [1,2], 2],
        ["hi", "Hindi", [1,2], 2],
        ["hr", "Croatian", [1,2,5],4],
        ["hu", "Hungarian",[1,2], 2],
        ["hy", "Armenian", [1,2], 2],
        ["ia", "Interlingua",[1,2],2],
        ["id", "Indonesian",[1], 3],
        ["is", "Icelandic",[1,2], 12],
        ["it", "Italian", [1,2], 2],
        ["ja", "Japanese", [1], 3],
        ["jbo", "Lojban", [1], 3],
        ["jv", "Javanese", [0,1], 13],
        ["ka", "Georgian", [1], 3],
        ["kk", "Kazakh", [1], 3],
        ["km", "Khmer", [1], 3],
        ["kn", "Kannada", [1,2], 2],
        ["ko", "Korean", [1], 3],
        ["ku", "Kurdish", [1,2], 2],
        ["kw", "Cornish", [1,2,3,4],14],
        ["ky", "Kyrgyz", [1], 3],
        ["lb", "Letzeburgesch",[1,2],2],
        ["ln", "Lingala", [1,2], 1],
        ["lo", "Lao", [1], 3],
        ["lt", "Lithuanian",[1,2,10],15],
        ["lv", "Latvian", [1,2,0],16],
        ["mai", "Maithili", [1,2], 2],
        ["mfe", "Mauritian Creole",[1,2],1],
        ["mg", "Malagasy", [1,2], 1],
        ["mi", "Maori", [1,2], 1],
        ["mk", "Macedonian",[1,2],17],
        ["ml", "Malayalam",[1,2], 2],
        ["mn", "Mongolian",[1,2], 2],
        ["mnk", "Mandinka", [0,1,2],18],
        ["mr", "Marathi", [1,2], 2],
        ["ms", "Malay", [1], 3],
        ["mt", "Maltese", [1,2,11,20],19],
        ["nah", "Nahuatl", [1,2], 2],
        ["nap", "Neapolitan",[1,2], 2],
        ["nb", "Norwegian Bokmal",[1,2],2],
        ["ne", "Nepali", [1,2], 2],
        ["nl", "Dutch", [1,2], 2],
        ["nn", "Norwegian Nynorsk",[1,2],2],
        ["no", "Norwegian",[1,2], 2],
        ["nso", "Northern Sotho",[1,2],2],
        ["oc", "Occitan", [1,2], 1],
        ["or", "Oriya", [2,1], 2],
        ["pa", "Punjabi", [1,2], 2],
        ["pap", "Papiamento",[1,2], 2],
        ["pl", "Polish", [1,2,5],7],
        ["pms", "Piemontese",[1,2], 2],
        ["ps", "Pashto", [1,2], 2],
        ["pt", "Portuguese",[1,2], 2],
        ["pt_br","Brazilian Portuguese",[1,2], 2],
        ["rm", "Romansh", [1,2], 2],
        ["ro", "Romanian", [1,2,20],20],
        ["ru", "Russian", [1,2,5],4],
        ["sah", "Yakut", [1], 3],
        ["sco", "Scots", [1,2], 2],
        ["se", "Northern Sami",[1,2], 2],
        ["si", "Sinhala", [1,2], 2],
        ["sk", "Slovak", [1,2,5],6],
        ["sl", "Slovenian",[5,1,2,3],21],
        ["so", "Somali", [1,2], 2],
        ["son", "Songhay", [1,2], 2],
        ["sq", "Albanian", [1,2], 2],
        ["sr", "Serbian", [1,2,5],4],
        ["su", "Sundanese",[1], 3],
        ["sv", "Swedish", [1,2], 2],
        ["sw", "Swahili", [1,2], 2],
        ["ta", "Tamil", [1,2], 2],
        ["te", "Telugu", [1,2], 2],
        ["tg", "Tajik", [1,2], 1],
        ["th", "Thai", [1], 3],
        ["ti", "Tigrinya", [1,2], 1],
        ["tk", "Turkmen", [1,2], 2],
        ["tr", "Turkish", [1,2], 1],
        ["tt", "Tatar", [1], 3],
        ["ug", "Uyghur", [1], 3],
        ["uk", "Ukrainian",[1,2,5],4],
        ["ur", "Urdu", [1,2], 2],
        ["uz", "Uzbek", [1,2], 1],
        ["vi", "Vietnamese",[1], 3],
        ["wa", "Walloon", [1,2], 1],
        ["wo", "Wolof", [1], 3],
        ["yo", "Yoruba", [1,2], 2],
        ["zh", "Chinese", [1], 3]
    ];
    
    var _rulesPluralsTypes = {
        1: function(n) {return Number(n > 1);},
        2: function(n) {return Number(n != 1);},
        3: function(n) {return 0;},
        4: function(n) {return Number(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2);},
        5: function(n) {return Number(n===0 ? 0 : n==1 ? 1 : n==2 ? 2 : n%100>=3 && n%100<=10 ? 3 : n%100>=11 ? 4 : 5);},
        6: function(n) {return Number((n==1) ? 0 : (n>=2 && n<=4) ? 1 : 2);},
        7: function(n) {return Number(n==1 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2);},
        8: function(n) {return Number((n==1) ? 0 : (n==2) ? 1 : (n != 8 && n != 11) ? 2 : 3);},
        9: function(n) {return Number(n >= 2);},
        10: function(n) {return Number(n==1 ? 0 : n==2 ? 1 : n<7 ? 2 : n<11 ? 3 : 4) ;},
        11: function(n) {return Number((n==1 || n==11) ? 0 : (n==2 || n==12) ? 1 : (n > 2 && n < 20) ? 2 : 3);},
        12: function(n) {return Number(n%10!=1 || n%100==11);},
        13: function(n) {return Number(n !== 0);},
        14: function(n) {return Number((n==1) ? 0 : (n==2) ? 1 : (n == 3) ? 2 : 3);},
        15: function(n) {return Number(n%10==1 && n%100!=11 ? 0 : n%10>=2 && (n%100<10 || n%100>=20) ? 1 : 2);},
        16: function(n) {return Number(n%10==1 && n%100!=11 ? 0 : n !== 0 ? 1 : 2);},
        17: function(n) {return Number(n==1 || n%10==1 ? 0 : 1);},
        18: function(n) {return Number(0 ? 0 : n==1 ? 1 : 2);},
        19: function(n) {return Number(n==1 ? 0 : n===0 || ( n%100>1 && n%100<11) ? 1 : (n%100>10 && n%100<20 ) ? 2 : 3);},
        20: function(n) {return Number(n==1 ? 0 : (n===0 || (n%100 > 0 && n%100 < 20)) ? 1 : 2);},
        21: function(n) {return Number(n%100==1 ? 1 : n%100==2 ? 2 : n%100==3 || n%100==4 ? 3 : 0); }
    };
    
    var pluralExtensions = {
    
        rules: (function () {
            var l, rules = {};
            for (l=_rules.length; l-- ;) {
                rules[_rules[l][0]] = {
                    name: _rules[l][1],
                    numbers: _rules[l][2],
                    plurals: _rulesPluralsTypes[_rules[l][3]]
                }
            }
            return rules;
        }()),
    
        // you can add your own pluralExtensions
        addRule: function(lng, obj) {
            pluralExtensions.rules[lng] = obj;
        },
    
        setCurrentLng: function(lng) {
            if (!pluralExtensions.currentRule || pluralExtensions.currentRule.lng !== lng) {
                var parts = lng.split('-');
    
                pluralExtensions.currentRule = {
                    lng: lng,
                    rule: pluralExtensions.rules[parts[0]]
                };
            }
        },
    
        needsPlural: function(lng, count) {
            var parts = lng.split('-');
    
            var ext;
            if (pluralExtensions.currentRule && pluralExtensions.currentRule.lng === lng) {
                ext = pluralExtensions.currentRule.rule; 
            } else {
                ext = pluralExtensions.rules[parts[f.getCountyIndexOfLng(lng)]];
            }
    
            if (ext && ext.numbers.length <= 1) {
                return false;
            } else {
                return this.get(lng, count) !== 1;
            }
        },
    
        get: function(lng, count) {
            var parts = lng.split('-');
    
            function getResult(l, c) {
                var ext;
                if (pluralExtensions.currentRule && pluralExtensions.currentRule.lng === lng) {
                    ext = pluralExtensions.currentRule.rule; 
                } else {
                    ext = pluralExtensions.rules[l];
                }
                if (ext) {
                    var i;
                    if (ext.noAbs) {
                        i = ext.plurals(c);
                    } else {
                        i = ext.plurals(Math.abs(c));
                    }
                    
                    var number = ext.numbers[i];
                    if (ext.numbers.length === 2 && ext.numbers[0] === 1) {
                        if (number === 2) { 
                            number = -1; // regular plural
                        } else if (number === 1) {
                            number = 1; // singular
                        }
                    }//console.log(count + '-' + number);
                    return number;
                } else {
                    return c === 1 ? '1' : '-1';
                }
            }
                        
            return getResult(parts[f.getCountyIndexOfLng(lng)], count);
        }
    
    };
    var postProcessors = {};
    var addPostProcessor = function(name, fc) {
        postProcessors[name] = fc;
    };
    // sprintf support
    var sprintf = (function() {
        function get_type(variable) {
            return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();
        }
        function str_repeat(input, multiplier) {
            for (var output = []; multiplier > 0; output[--multiplier] = input) {/* do nothing */}
            return output.join('');
        }
    
        var str_format = function() {
            if (!str_format.cache.hasOwnProperty(arguments[0])) {
                str_format.cache[arguments[0]] = str_format.parse(arguments[0]);
            }
            return str_format.format.call(null, str_format.cache[arguments[0]], arguments);
        };
    
        str_format.format = function(parse_tree, argv) {
            var cursor = 1, tree_length = parse_tree.length, node_type = '', arg, output = [], i, k, match, pad, pad_character, pad_length;
            for (i = 0; i < tree_length; i++) {
                node_type = get_type(parse_tree[i]);
                if (node_type === 'string') {
                    output.push(parse_tree[i]);
                }
                else if (node_type === 'array') {
                    match = parse_tree[i]; // convenience purposes only
                    if (match[2]) { // keyword argument
                        arg = argv[cursor];
                        for (k = 0; k < match[2].length; k++) {
                            if (!arg.hasOwnProperty(match[2][k])) {
                                throw(sprintf('[sprintf] property "%s" does not exist', match[2][k]));
                            }
                            arg = arg[match[2][k]];
                        }
                    }
                    else if (match[1]) { // positional argument (explicit)
                        arg = argv[match[1]];
                    }
                    else { // positional argument (implicit)
                        arg = argv[cursor++];
                    }
    
                    if (/[^s]/.test(match[8]) && (get_type(arg) != 'number')) {
                        throw(sprintf('[sprintf] expecting number but found %s', get_type(arg)));
                    }
                    switch (match[8]) {
                        case 'b': arg = arg.toString(2); break;
                        case 'c': arg = String.fromCharCode(arg); break;
                        case 'd': arg = parseInt(arg, 10); break;
                        case 'e': arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential(); break;
                        case 'f': arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg); break;
                        case 'o': arg = arg.toString(8); break;
                        case 's': arg = ((arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg); break;
                        case 'u': arg = Math.abs(arg); break;
                        case 'x': arg = arg.toString(16); break;
                        case 'X': arg = arg.toString(16).toUpperCase(); break;
                    }
                    arg = (/[def]/.test(match[8]) && match[3] && arg >= 0 ? '+'+ arg : arg);
                    pad_character = match[4] ? match[4] == '0' ? '0' : match[4].charAt(1) : ' ';
                    pad_length = match[6] - String(arg).length;
                    pad = match[6] ? str_repeat(pad_character, pad_length) : '';
                    output.push(match[5] ? arg + pad : pad + arg);
                }
            }
            return output.join('');
        };
    
        str_format.cache = {};
    
        str_format.parse = function(fmt) {
            var _fmt = fmt, match = [], parse_tree = [], arg_names = 0;
            while (_fmt) {
                if ((match = /^[^\x25]+/.exec(_fmt)) !== null) {
                    parse_tree.push(match[0]);
                }
                else if ((match = /^\x25{2}/.exec(_fmt)) !== null) {
                    parse_tree.push('%');
                }
                else if ((match = /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(_fmt)) !== null) {
                    if (match[2]) {
                        arg_names |= 1;
                        var field_list = [], replacement_field = match[2], field_match = [];
                        if ((field_match = /^([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
                            field_list.push(field_match[1]);
                            while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {
                                if ((field_match = /^\.([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
                                    field_list.push(field_match[1]);
                                }
                                else if ((field_match = /^\[(\d+)\]/.exec(replacement_field)) !== null) {
                                    field_list.push(field_match[1]);
                                }
                                else {
                                    throw('[sprintf] huh?');
                                }
                            }
                        }
                        else {
                            throw('[sprintf] huh?');
                        }
                        match[2] = field_list;
                    }
                    else {
                        arg_names |= 2;
                    }
                    if (arg_names === 3) {
                        throw('[sprintf] mixing positional and named placeholders is not (yet) supported');
                    }
                    parse_tree.push(match);
                }
                else {
                    throw('[sprintf] huh?');
                }
                _fmt = _fmt.substring(match[0].length);
            }
            return parse_tree;
        };
    
        return str_format;
    })();
    
    var vsprintf = function(fmt, argv) {
        argv.unshift(fmt);
        return sprintf.apply(null, argv);
    };
    
    addPostProcessor("sprintf", function(val, key, opts) {
        if (!opts.sprintf) return val;
    
        if (Object.prototype.toString.apply(opts.sprintf) === '[object Array]') {
            return vsprintf(val, opts.sprintf);
        } else if (typeof opts.sprintf === 'object') {
            return sprintf(val, opts.sprintf);
        }
    
        return val;
    });
    // public api interface
    i18n.init = init;
    i18n.isInitialized = isInitialized;
    i18n.setLng = setLng;
    i18n.preload = preload;
    i18n.addResourceBundle = addResourceBundle;
    i18n.hasResourceBundle = hasResourceBundle;
    i18n.getResourceBundle = getResourceBundle;
    i18n.addResource = addResource;
    i18n.addResources = addResources;
    i18n.removeResourceBundle = removeResourceBundle;
    i18n.loadNamespace = loadNamespace;
    i18n.loadNamespaces = loadNamespaces;
    i18n.setDefaultNamespace = setDefaultNamespace;
    i18n.t = translate;
    i18n.translate = translate;
    i18n.exists = exists;
    i18n.detectLanguage = f.detectLanguage;
    i18n.pluralExtensions = pluralExtensions;
    i18n.sync = sync;
    i18n.functions = f;
    i18n.lng = lng;
    i18n.addPostProcessor = addPostProcessor;
    i18n.applyReplacement = f.applyReplacement;
    i18n.options = o;
    i18n.noConflict = noConflict;

})(typeof exports === 'undefined' ? window : exports);
/*
 * Google layer using Google Maps API
 */

/* global google: true */

L.Google = L.Class.extend({
    includes: L.Mixin.Events,

    options: {
        minZoom: 0,
        maxZoom: 18,
        tileSize: 256,
        subdomains: 'abc',
        errorTileUrl: '',
        attribution: '',
        opacity: 1,
        continuousWorld: false,
        noWrap: false,
        mapOptions: {
            backgroundColor: '#dddddd'
        }
    },

    // Possible types: SATELLITE, ROADMAP, HYBRID, TERRAIN
    initialize: function (type, options) {
        L.Util.setOptions(this, options);

        if (typeof (google) == 'undefined') {
            return false;
        }

        this._ready = google.maps.Map !== undefined;
        if (!this._ready) L.Google.asyncWait.push(this);

        this._type = type || 'SATELLITE';
    },

    onAdd: function (map, insertAtTheBottom) {
        this._map = map;
        this._insertAtTheBottom = insertAtTheBottom;

        // create a container div for tiles
        this._initContainer();
        this._initMapObject();

        // set up events
        map.on('viewreset', this._resetCallback, this);

        this._limitedUpdate = L.Util.limitExecByInterval(this._update, 150, this);
        map.on('move', this._update, this);

        map.on('zoomanim', this._handleZoomAnim, this);

        //20px instead of 1em to avoid a slight overlap with google's attribution
        map._controlCorners.bottomright.style.marginBottom = '20px';

        this._reset();
        this._update();
    },

    onRemove: function (map) {
        map._container.removeChild(this._container);

        map.off('viewreset', this._resetCallback, this);

        map.off('move', this._update, this);

        map.off('zoomanim', this._handleZoomAnim, this);

        map._controlCorners.bottomright.style.marginBottom = '0em';
    },

    getAttribution: function () {
        return this.options.attribution;
    },

    setOpacity: function (opacity) {
        this.options.opacity = opacity;
        if (opacity < 1) {
            L.DomUtil.setOpacity(this._container, opacity);
        }
    },

    setElementSize: function (e, size) {
        e.style.width = size.x + 'px';
        e.style.height = size.y + 'px';
    },

    _initContainer: function () {
        var tilePane = this._map._container,
            first = tilePane.firstChild;

        if (!this._container) {
            this._container = L.DomUtil.create('div', 'leaflet-google-layer leaflet-top leaflet-left');
            this._container.id = '_GMapContainer_' + L.Util.stamp(this);
            this._container.style.zIndex = 'auto';
        }

        tilePane.insertBefore(this._container, first);

        this.setOpacity(this.options.opacity);
        this.setElementSize(this._container, this._map.getSize());
    },

    _initMapObject: function () {
        if (!this._ready) return;
        this._google_center = new google.maps.LatLng(0, 0);
        var map = new google.maps.Map(this._container, {
            center: this._google_center,
            zoom: 0,
            tilt: 0,
            mapTypeId: google.maps.MapTypeId[this._type],
            disableDefaultUI: true,
            keyboardShortcuts: false,
            draggable: false,
            disableDoubleClickZoom: true,
            scrollwheel: false,
            streetViewControl: false,
            styles: this.options.mapOptions.styles,
            backgroundColor: this.options.mapOptions.backgroundColor
        });

        var _this = this;
        this._reposition = google.maps.event.addListenerOnce(map, 'center_changed',
            function () {
                _this.onReposition();
            });
        this._google = map;

        google.maps.event.addListenerOnce(map, 'idle',
            function () {
                _this._checkZoomLevels();
            });
        //Reporting that map-object was initialized.
        this.fire('MapObjectInitialized', {
            mapObject: map
        });
    },

    _checkZoomLevels: function () {
        //setting the zoom level on the Google map may result in a different zoom level than the one requested
        //(it won't go beyond the level for which they have data).
        // verify and make sure the zoom levels on both Leaflet and Google maps are consistent
        if (this._google.getZoom() !== this._map.getZoom()) {
            //zoom levels are out of sync. Set the leaflet zoom level to match the google one
            this._map.setZoom(this._google.getZoom());
        }
    },

    _resetCallback: function (e) {
        this._reset(e.hard);
    },

    _reset: function (clearOldContainer) {
        this._initContainer();
    },

    _update: function (e) {
        if (!this._google) return;
        this._resize();

        var center = this._map.getCenter();
        var _center = new google.maps.LatLng(center.lat, center.lng);

        this._google.setCenter(_center);
        this._google.setZoom(Math.round(this._map.getZoom()));

        this._checkZoomLevels();
    },

    _resize: function () {
        var size = this._map.getSize();
        if (this._container.style.width === size.x &&
            this._container.style.height === size.y)
            return;
        this.setElementSize(this._container, size);
        this.onReposition();
    },


    _handleZoomAnim: function (e) {
        var center = e.center;
        var _center = new google.maps.LatLng(center.lat, center.lng);

        this._google.setCenter(_center);
        this._google.setZoom(Math.round(e.zoom));
    },


    onReposition: function () {
        if (!this._google) return;
        google.maps.event.trigger(this._google, 'resize');
    }
});

L.Google.asyncWait = [];
L.Google.asyncInitialize = function () {
    var i;
    for (i = 0; i < L.Google.asyncWait.length; i++) {
        var o = L.Google.asyncWait[i];
        o._ready = true;
        if (o._container) {
            o._initMapObject();
            o._update();
        }
    }
    L.Google.asyncWait = [];
};
/* global console: true */
L.BingLayer = L.TileLayer.extend({
	options: {
		subdomains: [0, 1, 2, 3],
		type: 'Aerial',
		attribution: 'Bing',
		culture: ''
	},

	initialize: function(key, options) {
		L.Util.setOptions(this, options);

		this._key = key;
		this._url = null;
		this.meta = {};
		this.loadMetadata();
	},

	tile2quad: function(x, y, z) {
		var quad = '';
		for (var i = z; i > 0; i--) {
			var digit = 0;
			var mask = 1 << (i - 1);
			if ((x & mask) !== 0) digit += 1;
			if ((y & mask) !== 0) digit += 2;
			quad = quad + digit;
		}
		return quad;
	},

	getTileUrl: function(p, z) {
		var zoom = this._getZoomForUrl();
		var subdomains = this.options.subdomains,
			s = this.options.subdomains[Math.abs((p.x + p.y) % subdomains.length)];
		return this._url.replace('{subdomain}', s)
				.replace('{quadkey}', this.tile2quad(p.x, p.y, zoom))
				.replace('{culture}', this.options.culture);
	},

	loadMetadata: function() {
		var _this = this;
		var cbid = '_bing_metadata_' + L.Util.stamp(this);
		window[cbid] = function (meta) {
			_this.meta = meta;
			window[cbid] = undefined;
			var e = document.getElementById(cbid);
			e.parentNode.removeChild(e);
			if (meta.errorDetails) {
				if (window.console) console.log('Leaflet Bing Plugin Error - Got metadata: ' + meta.errorDetails);
				return;
			}
			_this.initMetadata();
		};
		var url = document.location.protocol + '//dev.virtualearth.net/REST/v1/Imagery/Metadata/' + this.options.type + '?include=ImageryProviders&jsonp=' + cbid +
		          '&key=' + this._key + '&UriScheme=' + document.location.protocol.slice(0, -1);
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = url;
		script.id = cbid;
		document.getElementsByTagName('head')[0].appendChild(script);
	},

	initMetadata: function() {
		var r = this.meta.resourceSets[0].resources[0];
		this.options.subdomains = r.imageUrlSubdomains;
		this._url = r.imageUrl;
		this._providers = [];
		if (r.imageryProviders) {
			for (var i = 0; i < r.imageryProviders.length; i++) {
				var p = r.imageryProviders[i];
				for (var j = 0; j < p.coverageAreas.length; j++) {
					var c = p.coverageAreas[j];
					var coverage = {zoomMin: c.zoomMin, zoomMax: c.zoomMax, active: false};
					var bounds = new L.LatLngBounds(
							new L.LatLng(c.bbox[0]+0.01, c.bbox[1]+0.01),
							new L.LatLng(c.bbox[2]-0.01, c.bbox[3]-0.01)
					);
					coverage.bounds = bounds;
					coverage.attrib = p.attribution;
					this._providers.push(coverage);
				}
			}
		}
		this._update();
	},

	_update: function() {
		if (this._url === null || !this._map) return;
		this._update_attribution();
		L.TileLayer.prototype._update.apply(this, []);
	},

	_update_attribution: function() {
		var bounds = this._map.getBounds();
		var zoom = this._map.getZoom();
		for (var i = 0; i < this._providers.length; i++) {
			var p = this._providers[i];
			if ((zoom <= p.zoomMax && zoom >= p.zoomMin) &&
					bounds.intersects(p.bounds)) {
				if (!p.active && this._map.attributionControl)
					this._map.attributionControl.addAttribution(p.attrib);
				p.active = true;
			} else {
				if (p.active && this._map.attributionControl)
					this._map.attributionControl.removeAttribution(p.attrib);
				p.active = false;
			}
		}
	},

	onRemove: function(map) {
		for (var i = 0; i < this._providers.length; i++) {
			var p = this._providers[i];
			if (p.active && this._map.attributionControl) {
				this._map.attributionControl.removeAttribution(p.attrib);
				p.active = false;
			}
		}
        	L.TileLayer.prototype.onRemove.apply(this, [map]);
	}
});

L.bingLayer = function (key, options) {
    return new L.BingLayer(key, options);
};

(function(f) { if (typeof exports === "object" && typeof module !== "undefined") { module.exports = f() } else if (typeof define === "function" && define.amd) { define([], f) } else { var g; if (typeof window !== "undefined") { g = window } else if (typeof global !== "undefined") { g = global } else if (typeof self !== "undefined") { g = self } else { g = this }(g.L || (g.L = {})).NonTiledLayer = f() } })(function() {
    var define, module, exports;
    return (function e(t, n, r) {
        function s(o, u) {
            if (!n[o]) {
                if (!t[o]) { var a = typeof require == "function" && require; if (!u && a) return a(o, !0); if (i) return i(o, !0); var f = new Error("Cannot find module '" + o + "'"); throw f.code = "MODULE_NOT_FOUND", f }
                var l = n[o] = { exports: {} };
                t[o][0].call(l.exports, function(e) { var n = t[o][1][e]; return s(n ? n : e) }, l, l.exports, e, t, n, r)
            }
            return n[o].exports
        }
        var i = typeof require == "function" && require;
        for (var o = 0; o < r.length; o++) s(r[o]);
        return s
    })({
        1: [function(require, module, exports) {
            (function(global) {
                /*
                 * L.NonTiledLayer.WMS is used for putting WMS non tiled layers on the map.
                 */
                "use strict";

                var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);

                L.NonTiledLayer.WMS = L.NonTiledLayer.extend({

                    defaultWmsParams: {
                        service: 'WMS',
                        request: 'GetMap',
                        version: '1.1.1',
                        layers: '',
                        styles: '',
                        format: 'image/jpeg',
                        transparent: false
                    },

                    options: {
                        crs: null,
                        uppercase: false
                    },

                    initialize: function(url, options) { // (String, Object)
                        this._wmsUrl = url;

                        var wmsParams = L.extend({}, this.defaultWmsParams);

                        // all keys that are not NonTiledLayer options go to WMS params
                        for (var i in options) {
                            if (!L.NonTiledLayer.prototype.options.hasOwnProperty(i) &&
                                !(L.Layer && L.Layer.prototype.options.hasOwnProperty(i))) {
                                wmsParams[i] = options[i];
                            }
                        }

                        this.wmsParams = wmsParams;

                        L.setOptions(this, options);
                    },

                    onAdd: function(map) {

                        this._crs = this.options.crs || map.options.crs;
                        this._wmsVersion = parseFloat(this.wmsParams.version);

                        var projectionKey = this._wmsVersion >= 1.3 ? 'crs' : 'srs';
                        this.wmsParams[projectionKey] = this._crs.code;

                        L.NonTiledLayer.prototype.onAdd.call(this, map);
                    },

                    getImageUrl: function(bounds, width, height) {
                        var wmsParams = this.wmsParams;
                        wmsParams.width = width;
                        wmsParams.height = height;

                        var nw = this._crs.project(bounds.getNorthWest());
                        var se = this._crs.project(bounds.getSouthEast());

                        var url = this._wmsUrl;

                        var bbox = bbox = (this._wmsVersion >= 1.3 && this._crs === L.CRS.EPSG4326 ? [se.y, nw.x, nw.y, se.x] : [nw.x, se.y, se.x, nw.y]).join(',');

                        return url +
                            L.Util.getParamString(this.wmsParams, url, this.options.uppercase) +
                            (this.options.uppercase ? '&BBOX=' : '&bbox=') + bbox;
                    },

                    setParams: function(params, noRedraw) {

                        L.extend(this.wmsParams, params);

                        if (!noRedraw) {
                            this.redraw();
                        }

                        return this;
                    }
                });

                L.nonTiledLayer.wms = function(url, options) {
                    return new L.NonTiledLayer.WMS(url, options);
                };

                module.exports = L.NonTiledLayer.WMS;

            }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
        }, {}],
        2: [function(require, module, exports) {
            (function(global) {
                /*
                 * L.NonTiledLayer is an addon for leaflet which renders dynamic image overlays
                 */
                "use strict";

                var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);

                L.NonTiledLayer = (L.Layer || L.Class).extend({
                    includes: L.Mixin.Events,

                    emptyImageUrl: 'data:image/gif;base64,R0lGODlhAQABAHAAACH5BAUAAAAALAAAAAABAAEAAAICRAEAOw==', //1px transparent GIF 

                    options: {
                        attribution: '',
                        opacity: 1.0,
                        zIndex: undefined,
                        minZoom: 0,
                        maxZoom: 18,
                        pointerEvents: null,
                        errorImageUrl: 'data:image/gif;base64,R0lGODlhAQABAHAAACH5BAUAAAAALAAAAAABAAEAAAICRAEAOw==', //1px transparent GIF 
                        bounds: L.latLngBounds([-85.05, -180], [85.05, 180]),
                        useCanvas: undefined
                    },

                    key: '',

                    // override this method in the inherited class
                    //getImageUrl: function (bounds, width, height) {},
                    //getImageUrlAsync: function (bounds, width, height, f) {},

                    initialize: function(options) {
                        L.setOptions(this, options);
                    },

                    onAdd: function(map) {
                        this._map = map;

                        // don't animate on browsers without hardware-accelerated transitions or old Android/Opera
                        if (typeof this._zoomAnimated == 'undefined') // Leaflet 0.7
                            this._zoomAnimated = L.DomUtil.TRANSITION && L.Browser.any3d && !L.Browser.mobileOpera && this._map.options.zoomAnimation;

                        if (L.version < '1.0') this._map.on(this.getEvents(), this);
                        if (!this._div) {
                            this._div = L.DomUtil.create('div', 'leaflet-image-layer');
                            if (this.options.pointerEvents) {
                                this._div.style['pointer-events'] = this.options.pointerEvents;
                            }
                            if (typeof this.options.zIndex !== 'undefined') {
                                this._div.style.zIndex = this.options.zIndex;
                            }
                            if (typeof this.options.opacity !== 'undefined') {
                                this._div.style.opacity = this.options.opacity;
                            }
                        }

                        this.getPane().appendChild(this._div);

                        var canvasSupported = !!window.HTMLCanvasElement;
                        if (typeof this.options.useCanvas === 'undefined') {
                            this._useCanvas = canvasSupported;
                        } else {
                            this._useCanvas = this.options.useCanvas;
                        }

                        if (this._useCanvas) {
                            this._bufferCanvas = this._initCanvas();
                            this._currentCanvas = this._initCanvas();
                        } else {
                            this._bufferImage = this._initImage();
                            this._currentImage = this._initImage();
                        }

                        this._update();
                    },

                    getPane: function() {
                        if (L.Layer) {
                            return L.Layer.prototype.getPane.call(this);
                        }
                        if (this.options.pane) {
                            this._pane = this.options.pane;
                        } else {
                            this._pane = this._map.getPanes().overlayPane;
                        }
                        return this._pane;
                    },

                    onRemove: function(map) {
                        if (L.version < '1.0') this._map.off(this.getEvents(), this);

                        this.getPane().removeChild(this._div);

                        if (this._useCanvas) {
                            this._div.removeChild(this._bufferCanvas);
                            this._div.removeChild(this._currentCanvas);
                        } else {
                            this._div.removeChild(this._bufferImage);
                            this._div.removeChild(this._currentImage);
                        }
                    },

                    addTo: function(map) {
                        map.addLayer(this);
                        return this;
                    },

                    _setZoom: function() {
                        if (this._useCanvas) {
                            if (this._currentCanvas._bounds)
                                this._resetImageScale(this._currentCanvas, true);
                            if (this._bufferCanvas._bounds)
                                this._resetImageScale(this._bufferCanvas);
                        } else {
                            if (this._currentImage._bounds)
                                this._resetImageScale(this._currentImage, true);
                            if (this._bufferImage._bounds)
                                this._resetImageScale(this._bufferImage);
                        }
                    },

                    getEvents: function() {
                        var events = {
                            moveend: this._update
                        };

                        if (this._zoomAnimated) {
                            events.zoomanim = this._animateZoom;
                        }

                        // fix: no zoomanim for pinch with Leaflet 1.0!
                        if (L.version >= '1.0') {
                            events.zoom = this._setZoom;
                        }

                        return events;
                    },

                    getElement: function() {
                        return this._div;
                    },

                    setOpacity: function(opacity) {
                        this.options.opacity = opacity;
                        if (this._div) {
                            L.DomUtil.setOpacity(this._div, this.options.opacity);
                        }
                        return this;
                    },

                    setZIndex: function(zIndex) {
                        if (zIndex) {
                            this.options.zIndex = zIndex;
                            if (this._div) {
                                this._div.style.zIndex = zIndex;
                            }
                        }
                        return this;
                    },

                    // TODO remove bringToFront/bringToBack duplication from TileLayer/Path
                    bringToFront: function() {
                        if (this._div) {
                            this.getPane().appendChild(this._div);
                        }
                        return this;
                    },

                    bringToBack: function() {
                        if (this._div) {
                            this.getPane().insertBefore(this._div, this.getPane().firstChild);
                        }
                        return this;
                    },

                    getAttribution: function() {
                        return this.options.attribution;
                    },

                    _initCanvas: function() {
                        var _canvas = L.DomUtil.create('canvas', 'leaflet-image-layer');

                        this._div.appendChild(_canvas);
                        _canvas._image = new Image();
                        this._ctx = _canvas.getContext('2d');

                        if (this._map.options.zoomAnimation && L.Browser.any3d) {
                            L.DomUtil.addClass(_canvas, 'leaflet-zoom-animated');
                        } else {
                            L.DomUtil.addClass(_canvas, 'leaflet-zoom-hide');
                        }

                        L.extend(_canvas._image, {
                            onload: L.bind(this._onImageLoad, this),
                            onerror: L.bind(this._onImageError, this)
                        });

                        return _canvas;
                    },

                    _initImage: function() {
                        var _image = L.DomUtil.create('img', 'leaflet-image-layer');

                        this._div.appendChild(_image);

                        if (this._map.options.zoomAnimation && L.Browser.any3d) {
                            L.DomUtil.addClass(_image, 'leaflet-zoom-animated');
                        } else {
                            L.DomUtil.addClass(_image, 'leaflet-zoom-hide');
                        }


                        //TODO createImage util method to remove duplication
                        L.extend(_image, {
                            galleryimg: 'no',
                            onselectstart: L.Util.falseFn,
                            onmousemove: L.Util.falseFn,
                            onload: L.bind(this._onImageLoad, this),
                            onerror: L.bind(this._onImageError, this)
                        });

                        return _image;
                    },

                    redraw: function() {
                        if (this._map) {
                            this._update();
                        }
                        return this;
                    },

                    _animateZoom: function(e) {
                        if (this._useCanvas) {
                            if (this._currentCanvas._bounds)
                                this._animateImage(this._currentCanvas, e);
                            if (this._bufferCanvas._bounds)
                                this._animateImage(this._bufferCanvas, e);
                        } else {
                            if (this._currentImage._bounds)
                                this._animateImage(this._currentImage, e);
                            if (this._bufferImage._bounds)
                                this._animateImage(this._bufferImage, e);
                        }
                    },

                    _animateImage: function(image, e) {
                        if (typeof L.DomUtil.setTransform === 'undefined') { // Leaflet 0.7
                            var map = this._map,
                                scale = image._scale * map.getZoomScale(e.zoom),
                                nw = image._bounds.getNorthWest(),
                                se = image._bounds.getSouthEast(),

                                topLeft = map._latLngToNewLayerPoint(nw, e.zoom, e.center),
                                size = map._latLngToNewLayerPoint(se, e.zoom, e.center)._subtract(topLeft),
                                origin = topLeft._add(size._multiplyBy((1 / 2) * (1 - 1 / scale)));

                            image.style[L.DomUtil.TRANSFORM] =
                                L.DomUtil.getTranslateString(origin) + ' scale(' + scale + ') ';
                        } else {
                            var map = this._map,
                                scale = image._scale * image._sscale * map.getZoomScale(e.zoom),
                                nw = image._bounds.getNorthWest(),
                                se = image._bounds.getSouthEast(),

                                topLeft = map._latLngToNewLayerPoint(nw, e.zoom, e.center);

                            L.DomUtil.setTransform(image, topLeft, scale);
                        }

                        image._lastScale = scale;
                    },

                    _resetImageScale: function(image, resetTransform) {
                        var bounds = new L.Bounds(
                                this._map.latLngToLayerPoint(image._bounds.getNorthWest()),
                                this._map.latLngToLayerPoint(image._bounds.getSouthEast())),
                            orgSize = image._orgBounds.getSize().y,
                            scaledSize = bounds.getSize().y;

                        var scale = scaledSize / orgSize;
                        image._sscale = scale;

                        L.DomUtil.setTransform(image, bounds.min, scale);
                    },

                    _resetImage: function(image) {
                        var bounds = new L.Bounds(
                                this._map.latLngToLayerPoint(image._bounds.getNorthWest()),
                                this._map.latLngToLayerPoint(image._bounds.getSouthEast())),
                            size = bounds.getSize();

                        L.DomUtil.setPosition(image, bounds.min);

                        image._orgBounds = bounds;
                        image._sscale = 1;

                        if (this._useCanvas) {
                            image.width = size.x;
                            image.height = size.y;

                        } else {
                            image.style.width = size.x + 'px';
                            image.style.height = size.y + 'px';
                        }
                    },

                    _getClippedBounds: function() {
                        var wgsBounds = this._map.getBounds();

                        /**
                         * WARNNING
                         */

                        this.options.bounds = wgsBounds;

                        // truncate bounds to valid wgs bounds
                        var mSouth = wgsBounds.getSouth();
                        var mNorth = wgsBounds.getNorth();
                        var mWest = wgsBounds.getWest();
                        var mEast = wgsBounds.getEast();

                        var lSouth = this.options.bounds.getSouth();
                        var lNorth = this.options.bounds.getNorth();
                        var lWest = this.options.bounds.getWest();
                        var lEast = this.options.bounds.getEast();

                        //mWest = (mWest + 180) % 360 - 180;
                        if (mSouth < lSouth) mSouth = lSouth;
                        if (mNorth > lNorth) mNorth = lNorth;
                        if (mWest < lWest) mWest = lWest;
                        if (mEast > lEast) mEast = lEast;

                        var world1 = new L.LatLng(mNorth, mWest);
                        var world2 = new L.LatLng(mSouth, mEast);

                        return new L.LatLngBounds(world1, world2);
                    },

                    _update: function() {
                        var bounds = this._getClippedBounds();

                        // re-project to corresponding pixel bounds
                        var pix1 = this._map.latLngToContainerPoint(bounds.getNorthWest());
                        var pix2 = this._map.latLngToContainerPoint(bounds.getSouthEast());

                        // get pixel size
                        var width = pix2.x - pix1.x;
                        var height = pix2.y - pix1.y;

                        var i;
                        if (this._useCanvas) {
                            // set scales for zoom animation
                            this._bufferCanvas._scale = this._bufferCanvas._lastScale;
                            this._currentCanvas._scale = this._currentCanvas._lastScale = 1;
                            this._bufferCanvas._sscale = 1;

                            this._currentCanvas._bounds = bounds;

                            this._resetImage(this._currentCanvas);

                            i = this._currentCanvas._image;

                            L.DomUtil.setOpacity(i, 0);
                        } else {
                            // set scales for zoom animation
                            this._bufferImage._scale = this._bufferImage._lastScale;
                            this._currentImage._scale = this._currentImage._lastScale = 1;
                            this._bufferImage._sscale = 1;

                            this._currentImage._bounds = bounds;

                            this._resetImage(this._currentImage);

                            i = this._currentImage;

                            L.DomUtil.setOpacity(i, 0);
                        }

                        if (this._map.getZoom() < this.options.minZoom ||
                            this._map.getZoom() > this.options.maxZoom ||
                            width < 32 || height < 32) {
                            this._div.style.visibility = 'hidden';
                            i.src = this.emptyImageUrl;
                            this.key = i.key = '<empty>';
                            i.tag = null;
                            return;
                        }

                        // create a key identifying the current request
                        this.key = '' + bounds.getNorthWest() + ', ' + bounds.getSouthEast() + ', ' + width + ', ' + height;

                        if (this.getImageUrl) {
                            i.src = this.getImageUrl(bounds, width, height);
                            i.key = this.key;
                        } else {
                            this.getImageUrlAsync(bounds, width, height, this.key, function(key, url, tag) {
                                i.key = key;
                                i.src = url;
                                i.tag = tag;
                            });
                        }
                    },
                    _onImageError: function(e) {
                        this.fire('error', e);
                        L.DomUtil.addClass(e.target, 'invalid');
                        if (e.target.src !== this.options.errorImageUrl) { // prevent error loop if error image is not valid
                            e.target.src = this.options.errorImageUrl;
                        }
                    },
                    _onImageLoad: function(e) {
                        if (e.target.src !== this.options.errorImageUrl) {
                            L.DomUtil.removeClass(e.target, 'invalid');
                            if (!e.target.key || e.target.key !== this.key) { // obsolete / outdated image
                                return;
                            }
                        }
                        this._onImageDone(e);

                        this.fire('load', e);
                    },
                    _onImageDone: function(e) {
                        if (this._useCanvas) {
                            this._renderCanvas(e);
                        } else {
                            L.DomUtil.setOpacity(this._currentImage, 1);
                            L.DomUtil.setOpacity(this._bufferImage, 0);

                            if (this._addInteraction && this._currentImage.tag)
                                this._addInteraction(this._currentImage.tag);

                            var tmp = this._bufferImage;
                            this._bufferImage = this._currentImage;
                            this._currentImage = tmp;
                        }

                        if (e.target.key !== '<empty>')
                            this._div.style.visibility = 'visible';
                    },
                    _renderCanvas: function(e) {
                        var ctx = this._currentCanvas.getContext('2d');

                        ctx.drawImage(this._currentCanvas._image, 0, 0);

                        L.DomUtil.setOpacity(this._currentCanvas, 1);
                        L.DomUtil.setOpacity(this._bufferCanvas, 0);

                        if (this._addInteraction && this._currentCanvas._image.tag)
                            this._addInteraction(this._currentCanvas._image.tag);

                        var tmp = this._bufferCanvas;
                        this._bufferCanvas = this._currentCanvas;
                        this._currentCanvas = tmp;
                    }

                });

                L.nonTiledLayer = function() {
                    return new L.NonTiledLayer();
                };

                module.exports = L.NonTiledLayer;

            }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
        }, {}]
    }, {}, [2, 1])(2)
});
L.TileLayer.WMTS = L.TileLayer.extend({

    defaultWmtsParams: {
        service: 'WMTS',
        request: 'GetTile',
        version: '1.0.0',
        layer: '',
        style: '',
        tilematrixSet: '',
        format: 'image/jpeg'
    },

    initialize: function (url, options) { // (String, Object)
        this._url = url;
        var wmtsParams = L.extend({}, this.defaultWmtsParams),
        tileSize = options.tileSize || this.options.tileSize;
        if (options.detectRetina && L.Browser.retina) {
            wmtsParams.width = wmtsParams.height = tileSize * 2;
        } else {
            wmtsParams.width = wmtsParams.height = tileSize;
        }
        for (var i in options) {
            // all keys that are not TileLayer options go to WMTS params
            if (!this.options.hasOwnProperty(i) && i!="matrixIds") {
                wmtsParams[i] = options[i];
            }
        }
        this.wmtsParams = wmtsParams;
        this.matrixIds = options.matrixIds||this.getDefaultMatrix();
        L.setOptions(this, options);
    },

    onAdd: function (map) {
        L.TileLayer.prototype.onAdd.call(this, map);
    },

    getTileUrl: function (tilePoint, zoom) { // (Point, Number) -> String
        var map = this._map;
        crs = map.options.crs;
        tileSize = this.options.tileSize;
        nwPoint = tilePoint.multiplyBy(tileSize);
        //+/-1 in order to be on the tile
        nwPoint.x+=1;
        nwPoint.y-=1;
        sePoint = nwPoint.add(new L.Point(tileSize, tileSize));
        nw = crs.project(map.unproject(nwPoint, zoom));
        se = crs.project(map.unproject(sePoint, zoom));
        tilewidth = se.x-nw.x;
        zoom=map.getZoom();
        ident = this.matrixIds[zoom].identifier;
        X0 = this.matrixIds[zoom].topLeftCorner.lng;
        Y0 = this.matrixIds[zoom].topLeftCorner.lat;
        //tilecol=Math.floor((nw.x-X0)/tilewidth);
        //tilerow=-Math.floor((nw.y-Y0)/tilewidth);

        // DEBUG DAMIEN
        tilecol=Math.round((nw.x-X0)/tilewidth);
        tilerow=-Math.round((nw.y-Y0)/tilewidth);

        url = L.Util.template(this._url, {s: this._getSubdomain(tilePoint)});
        return url + L.Util.getParamString(this.wmtsParams, url) + "&tilematrix=" + ident + "&tilerow=" + tilerow +"&tilecol=" + tilecol ;
    },

    setParams: function (params, noRedraw) {
        L.extend(this.wmtsParams, params);
        if (!noRedraw) {
            this.redraw();
        }
        return this;
    },

    getDefaultMatrix : function () {
        /**
         * the matrix3857 represents the projection
         * for in the IGN WMTS for the google coordinates.
         */
        var matrixIds3857 = new Array(22);
        for (var i= 0; i<22; i++) {
            matrixIds3857[i]= {
                identifier    : "" + i,
                topLeftCorner : new L.LatLng(20037508,-20037508)
            };
        }
        return matrixIds3857;
    }
});

L.tileLayer.wmts = function (url, options) {
    return new L.TileLayer.WMTS(url, options);
};

L.Control.ZoomBox = L.Control.extend({
    _active: false,
    _map: null,
    includes: L.Mixin.Events,
    options: {
        position: 'topleft',
        className: 'fa fa-search-plus',
        title: 'Zoom to specific area',
        modal: false
    },
    onAdd: function (map) {
        this._map = map;
        this._container = L.DomUtil.create('div', 'leaflet-zoom-box-control leaflet-bar');
        this._container.title = this.options.title;
        var link = L.DomUtil.create('a', this.options.className, this._container);
        link.href = "#";

        // Bind to the map's boxZoom handler
        var _origMouseDown = map.boxZoom._onMouseDown;
        map.boxZoom._onMouseDown = function (e) {
            _origMouseDown.call(map.boxZoom, {
                clientX: e.clientX,
                clientY: e.clientY,
                which: 1,
                shiftKey: true
            });
        };

        map.on('zoomend', function () {
            if (map.getZoom() == map.getMaxZoom()) {
                L.DomUtil.addClass(link, 'leaflet-disabled');
            } else {
                L.DomUtil.removeClass(link, 'leaflet-disabled');
            }
        }, this);
        if (!this.options.modal) {
            map.on('boxzoomend', this.deactivate, this);
        }

        L.DomEvent
            .on(this._container, 'dblclick', L.DomEvent.stop)
            .on(this._container, 'click', L.DomEvent.stop)
            .on(this._container, 'click', function () {
                this._active = !this._active;
                if (this._active && map.getZoom() != map.getMaxZoom()) {
                    this.activate();
                } else {
                    this.deactivate();
                }
            }, this);
        return this._container;
    },
    activate: function () {
        L.DomUtil.addClass(this._container, 'active');
        this._map.dragging.disable();
        this._map.boxZoom.addHooks();
        L.DomUtil.addClass(this._map.getContainer(), 'leaflet-zoom-box-crosshair');
    },
    deactivate: function () {

        L.DomUtil.removeClass(this._container, 'active');
        this._map.dragging.enable();
        this._map.boxZoom.removeHooks();
        var container = this._map.getContainer();
        setTimeout(function () {
            L.DomUtil.removeClass(container, 'leaflet-zoom-box-crosshair');
        }, 100);
        this._active = false;
        this._map.boxZoom._moved = false; //to get past issue w/ Leaflet locking clicks when moved is true (https://github.com/Leaflet/Leaflet/issues/3026).

    }
});

L.control.zoomBox = function (options) {
    return new L.Control.ZoomBox(options);
};
(function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = typeof require == "function" && require;
                if (!u && a) return a(o, !0);
                if (i) return i(o, !0);
                var f = new Error("Cannot find module '" + o + "'");
                throw f.code = "MODULE_NOT_FOUND", f
            }
            var l = n[o] = {
                exports: {}
            };
            t[o][0].call(l.exports, function (e) {
                var n = t[o][1][e];
                return s(n ? n : e)
            }, l, l.exports, e, t, n, r)
        }
        return n[o].exports
    }
    var i = typeof require == "function" && require;
    for (var o = 0; o < r.length; o++) s(r[o]);
    return s
})({
    1: [

        function (require, module, exports) {
            /* MIT license */
            var convert = require("color-convert"),
                string = require("color-string");

            var Color = function (obj) {
                if (obj instanceof Color) return obj;
                if (!(this instanceof Color)) return new Color(obj);

                this.values = {
                    rgb: [0, 0, 0],
                    hsl: [0, 0, 0],
                    hsv: [0, 0, 0],
                    hwb: [0, 0, 0],
                    cmyk: [0, 0, 0, 0],
                    alpha: 1
                }

                // parse Color() argument
                if (typeof obj == "string") {
                    var vals = string.getRgba(obj);
                    if (vals) {
                        this.setValues("rgb", vals);
                    } else if (vals = string.getHsla(obj)) {
                        this.setValues("hsl", vals);
                    } else if (vals = string.getHwb(obj)) {
                        this.setValues("hwb", vals);
                    } else {
                        throw new Error("Unable to parse color from string \"" + obj + "\"");
                    }
                } else if (typeof obj == "object") {
                    var vals = obj;
                    if (vals["r"] !== undefined || vals["red"] !== undefined) {
                        this.setValues("rgb", vals)
                    } else if (vals["l"] !== undefined || vals["lightness"] !== undefined) {
                        this.setValues("hsl", vals)
                    } else if (vals["v"] !== undefined || vals["value"] !== undefined) {
                        this.setValues("hsv", vals)
                    } else if (vals["w"] !== undefined || vals["whiteness"] !== undefined) {
                        this.setValues("hwb", vals)
                    } else if (vals["c"] !== undefined || vals["cyan"] !== undefined) {
                        this.setValues("cmyk", vals)
                    } else {
                        throw new Error("Unable to parse color from object " + JSON.stringify(obj));
                    }
                }
            }

            Color.prototype = {
                rgb: function (vals) {
                    return this.setSpace("rgb", arguments);
                },
                hsl: function (vals) {
                    return this.setSpace("hsl", arguments);
                },
                hsv: function (vals) {
                    return this.setSpace("hsv", arguments);
                },
                hwb: function (vals) {
                    return this.setSpace("hwb", arguments);
                },
                cmyk: function (vals) {
                    return this.setSpace("cmyk", arguments);
                },

                rgbArray: function () {
                    return this.values.rgb;
                },
                hslArray: function () {
                    return this.values.hsl;
                },
                hsvArray: function () {
                    return this.values.hsv;
                },
                hwbArray: function () {
                    if (this.values.alpha !== 1) {
                        return this.values.hwb.concat([this.values.alpha])
                    }
                    return this.values.hwb;
                },
                cmykArray: function () {
                    return this.values.cmyk;
                },
                rgbaArray: function () {
                    var rgb = this.values.rgb;
                    return rgb.concat([this.values.alpha]);
                },
                hslaArray: function () {
                    var hsl = this.values.hsl;
                    return hsl.concat([this.values.alpha]);
                },
                alpha: function (val) {
                    if (val === undefined) {
                        return this.values.alpha;
                    }
                    this.setValues("alpha", val);
                    return this;
                },

                red: function (val) {
                    return this.setChannel("rgb", 0, val);
                },
                green: function (val) {
                    return this.setChannel("rgb", 1, val);
                },
                blue: function (val) {
                    return this.setChannel("rgb", 2, val);
                },
                hue: function (val) {
                    return this.setChannel("hsl", 0, val);
                },
                saturation: function (val) {
                    return this.setChannel("hsl", 1, val);
                },
                lightness: function (val) {
                    return this.setChannel("hsl", 2, val);
                },
                saturationv: function (val) {
                    return this.setChannel("hsv", 1, val);
                },
                whiteness: function (val) {
                    return this.setChannel("hwb", 1, val);
                },
                blackness: function (val) {
                    return this.setChannel("hwb", 2, val);
                },
                value: function (val) {
                    return this.setChannel("hsv", 2, val);
                },
                cyan: function (val) {
                    return this.setChannel("cmyk", 0, val);
                },
                magenta: function (val) {
                    return this.setChannel("cmyk", 1, val);
                },
                yellow: function (val) {
                    return this.setChannel("cmyk", 2, val);
                },
                black: function (val) {
                    return this.setChannel("cmyk", 3, val);
                },

                hexString: function () {
                    return string.hexString(this.values.rgb);
                },
                rgbString: function () {
                    return string.rgbString(this.values.rgb, this.values.alpha);
                },
                rgbaString: function () {
                    return string.rgbaString(this.values.rgb, this.values.alpha);
                },
                percentString: function () {
                    return string.percentString(this.values.rgb, this.values.alpha);
                },
                hslString: function () {
                    return string.hslString(this.values.hsl, this.values.alpha);
                },
                hslaString: function () {
                    return string.hslaString(this.values.hsl, this.values.alpha);
                },
                hwbString: function () {
                    return string.hwbString(this.values.hwb, this.values.alpha);
                },
                keyword: function () {
                    return string.keyword(this.values.rgb, this.values.alpha);
                },

                rgbNumber: function () {
                    return (this.values.rgb[0] << 16) | (this.values.rgb[1] << 8) | this.values.rgb[2];
                },

                luminosity: function () {
                    // http://www.w3.org/TR/WCAG20/#relativeluminancedef
                    var rgb = this.values.rgb;
                    var lum = [];
                    for (var i = 0; i < rgb.length; i++) {
                        var chan = rgb[i] / 255;
                        lum[i] = (chan <= 0.03928) ? chan / 12.92 : Math.pow(((chan + 0.055) / 1.055), 2.4)
                    }
                    return 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2];
                },

                contrast: function (color2) {
                    // http://www.w3.org/TR/WCAG20/#contrast-ratiodef
                    var lum1 = this.luminosity();
                    var lum2 = color2.luminosity();
                    if (lum1 > lum2) {
                        return (lum1 + 0.05) / (lum2 + 0.05)
                    };
                    return (lum2 + 0.05) / (lum1 + 0.05);
                },

                level: function (color2) {
                    var contrastRatio = this.contrast(color2);
                    return (contrastRatio >= 7.1) ? 'AAA' : (contrastRatio >= 4.5) ? 'AA' : '';
                },

                dark: function () {
                    // YIQ equation from http://24ways.org/2010/calculating-color-contrast
                    var rgb = this.values.rgb,
                        yiq = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
                    return yiq < 128;
                },

                light: function () {
                    return !this.dark();
                },

                negate: function () {
                    var rgb = []
                    for (var i = 0; i < 3; i++) {
                        rgb[i] = 255 - this.values.rgb[i];
                    }
                    this.setValues("rgb", rgb);
                    return this;
                },

                lighten: function (ratio) {
                    this.values.hsl[2] += this.values.hsl[2] * ratio;
                    this.setValues("hsl", this.values.hsl);
                    return this;
                },

                darken: function (ratio) {
                    this.values.hsl[2] -= this.values.hsl[2] * ratio;
                    this.setValues("hsl", this.values.hsl);
                    return this;
                },

                saturate: function (ratio) {
                    this.values.hsl[1] += this.values.hsl[1] * ratio;
                    this.setValues("hsl", this.values.hsl);
                    return this;
                },

                desaturate: function (ratio) {
                    this.values.hsl[1] -= this.values.hsl[1] * ratio;
                    this.setValues("hsl", this.values.hsl);
                    return this;
                },

                whiten: function (ratio) {
                    this.values.hwb[1] += this.values.hwb[1] * ratio;
                    this.setValues("hwb", this.values.hwb);
                    return this;
                },

                blacken: function (ratio) {
                    this.values.hwb[2] += this.values.hwb[2] * ratio;
                    this.setValues("hwb", this.values.hwb);
                    return this;
                },

                greyscale: function () {
                    var rgb = this.values.rgb;
                    // http://en.wikipedia.org/wiki/Grayscale#Converting_color_to_grayscale
                    var val = rgb[0] * 0.3 + rgb[1] * 0.59 + rgb[2] * 0.11;
                    this.setValues("rgb", [val, val, val]);
                    return this;
                },

                clearer: function (ratio) {
                    this.setValues("alpha", this.values.alpha - (this.values.alpha * ratio));
                    return this;
                },

                opaquer: function (ratio) {
                    this.setValues("alpha", this.values.alpha + (this.values.alpha * ratio));
                    return this;
                },

                rotate: function (degrees) {
                    var hue = this.values.hsl[0];
                    hue = (hue + degrees) % 360;
                    hue = hue < 0 ? 360 + hue : hue;
                    this.values.hsl[0] = hue;
                    this.setValues("hsl", this.values.hsl);
                    return this;
                },

                mix: function (color2, weight) {
                    weight = 1 - (weight == null ? 0.5 : weight);

                    // algorithm from Sass's mix(). Ratio of first color in mix is
                    // determined by the alphas of both colors and the weight
                    var t1 = weight * 2 - 1,
                        d = this.alpha() - color2.alpha();

                    var weight1 = (((t1 * d == -1) ? t1 : (t1 + d) / (1 + t1 * d)) + 1) / 2;
                    var weight2 = 1 - weight1;

                    var rgb = this.rgbArray();
                    var rgb2 = color2.rgbArray();

                    for (var i = 0; i < rgb.length; i++) {
                        rgb[i] = rgb[i] * weight1 + rgb2[i] * weight2;
                    }
                    this.setValues("rgb", rgb);

                    var alpha = this.alpha() * weight + color2.alpha() * (1 - weight);
                    this.setValues("alpha", alpha);

                    return this;
                },

                toJSON: function () {
                    return this.rgb();
                },

                clone: function () {
                    return new Color(this.rgb());
                }
            }


            Color.prototype.getValues = function (space) {
                var vals = {};
                for (var i = 0; i < space.length; i++) {
                    vals[space.charAt(i)] = this.values[space][i];
                }
                if (this.values.alpha != 1) {
                    vals["a"] = this.values.alpha;
                }
                // {r: 255, g: 255, b: 255, a: 0.4}
                return vals;
            }

            Color.prototype.setValues = function (space, vals) {
                var spaces = {
                    "rgb": ["red", "green", "blue"],
                    "hsl": ["hue", "saturation", "lightness"],
                    "hsv": ["hue", "saturation", "value"],
                    "hwb": ["hue", "whiteness", "blackness"],
                    "cmyk": ["cyan", "magenta", "yellow", "black"]
                };

                var maxes = {
                    "rgb": [255, 255, 255],
                    "hsl": [360, 100, 100],
                    "hsv": [360, 100, 100],
                    "hwb": [360, 100, 100],
                    "cmyk": [100, 100, 100, 100]
                };

                var alpha = 1;
                if (space == "alpha") {
                    alpha = vals;
                } else if (vals.length) {
                    // [10, 10, 10]
                    this.values[space] = vals.slice(0, space.length);
                    alpha = vals[space.length];
                } else if (vals[space.charAt(0)] !== undefined) {
                    // {r: 10, g: 10, b: 10}
                    for (var i = 0; i < space.length; i++) {
                        this.values[space][i] = vals[space.charAt(i)];
                    }
                    alpha = vals.a;
                } else if (vals[spaces[space][0]] !== undefined) {
                    // {red: 10, green: 10, blue: 10}
                    var chans = spaces[space];
                    for (var i = 0; i < space.length; i++) {
                        this.values[space][i] = vals[chans[i]];
                    }
                    alpha = vals.alpha;
                }
                this.values.alpha = Math.max(0, Math.min(1, (alpha !== undefined ? alpha : this.values.alpha)));
                if (space == "alpha") {
                    return;
                }

                // cap values of the space prior converting all values
                for (var i = 0; i < space.length; i++) {
                    var capped = Math.max(0, Math.min(maxes[space][i], this.values[space][i]));
                    this.values[space][i] = Math.round(capped);
                }

                // convert to all the other color spaces
                for (var sname in spaces) {
                    if (sname != space) {
                        this.values[sname] = convert[space][sname](this.values[space])
                    }

                    // cap values
                    for (var i = 0; i < sname.length; i++) {
                        var capped = Math.max(0, Math.min(maxes[sname][i], this.values[sname][i]));
                        this.values[sname][i] = Math.round(capped);
                    }
                }
                return true;
            }

            Color.prototype.setSpace = function (space, args) {
                var vals = args[0];
                if (vals === undefined) {
                    // color.rgb()
                    return this.getValues(space);
                }
                // color.rgb(10, 10, 10)
                if (typeof vals == "number") {
                    vals = Array.prototype.slice.call(args);
                }
                this.setValues(space, vals);
                return this;
            }

            Color.prototype.setChannel = function (space, index, val) {
                if (val === undefined) {
                    // color.red()
                    return this.values[space][index];
                }
                // color.red(100)
                this.values[space][index] = val;
                this.setValues(space, this.values[space]);
                return this;
            }

            module.exports = Color;

        }, {
            "color-convert": 3,
            "color-string": 4
        }
    ],
    2: [

        function (require, module, exports) {
            /* MIT license */

            module.exports = {
                rgb2hsl: rgb2hsl,
                rgb2hsv: rgb2hsv,
                rgb2hwb: rgb2hwb,
                rgb2cmyk: rgb2cmyk,
                rgb2keyword: rgb2keyword,
                rgb2xyz: rgb2xyz,
                rgb2lab: rgb2lab,
                rgb2lch: rgb2lch,

                hsl2rgb: hsl2rgb,
                hsl2hsv: hsl2hsv,
                hsl2hwb: hsl2hwb,
                hsl2cmyk: hsl2cmyk,
                hsl2keyword: hsl2keyword,

                hsv2rgb: hsv2rgb,
                hsv2hsl: hsv2hsl,
                hsv2hwb: hsv2hwb,
                hsv2cmyk: hsv2cmyk,
                hsv2keyword: hsv2keyword,

                hwb2rgb: hwb2rgb,
                hwb2hsl: hwb2hsl,
                hwb2hsv: hwb2hsv,
                hwb2cmyk: hwb2cmyk,
                hwb2keyword: hwb2keyword,

                cmyk2rgb: cmyk2rgb,
                cmyk2hsl: cmyk2hsl,
                cmyk2hsv: cmyk2hsv,
                cmyk2hwb: cmyk2hwb,
                cmyk2keyword: cmyk2keyword,

                keyword2rgb: keyword2rgb,
                keyword2hsl: keyword2hsl,
                keyword2hsv: keyword2hsv,
                keyword2hwb: keyword2hwb,
                keyword2cmyk: keyword2cmyk,
                keyword2lab: keyword2lab,
                keyword2xyz: keyword2xyz,

                xyz2rgb: xyz2rgb,
                xyz2lab: xyz2lab,
                xyz2lch: xyz2lch,

                lab2xyz: lab2xyz,
                lab2rgb: lab2rgb,
                lab2lch: lab2lch,

                lch2lab: lch2lab,
                lch2xyz: lch2xyz,
                lch2rgb: lch2rgb
            }


            function rgb2hsl(rgb) {
                var r = rgb[0] / 255,
                    g = rgb[1] / 255,
                    b = rgb[2] / 255,
                    min = Math.min(r, g, b),
                    max = Math.max(r, g, b),
                    delta = max - min,
                    h, s, l;

                if (max == min)
                    h = 0;
                else if (r == max)
                    h = (g - b) / delta;
                else if (g == max)
                    h = 2 + (b - r) / delta;
                else if (b == max)
                    h = 4 + (r - g) / delta;

                h = Math.min(h * 60, 360);

                if (h < 0)
                    h += 360;

                l = (min + max) / 2;

                if (max == min)
                    s = 0;
                else if (l <= 0.5)
                    s = delta / (max + min);
                else
                    s = delta / (2 - max - min);

                return [h, s * 100, l * 100];
            }

            function rgb2hsv(rgb) {
                var r = rgb[0],
                    g = rgb[1],
                    b = rgb[2],
                    min = Math.min(r, g, b),
                    max = Math.max(r, g, b),
                    delta = max - min,
                    h, s, v;

                if (max == 0)
                    s = 0;
                else
                    s = (delta / max * 1000) / 10;

                if (max == min)
                    h = 0;
                else if (r == max)
                    h = (g - b) / delta;
                else if (g == max)
                    h = 2 + (b - r) / delta;
                else if (b == max)
                    h = 4 + (r - g) / delta;

                h = Math.min(h * 60, 360);

                if (h < 0)
                    h += 360;

                v = ((max / 255) * 1000) / 10;

                return [h, s, v];
            }

            function rgb2hwb(rgb) {
                var r = rgb[0],
                    g = rgb[1],
                    b = rgb[2],
                    h = rgb2hsl(rgb)[0],
                    w = 1 / 255 * Math.min(r, Math.min(g, b)),
                    b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));

                return [h, w * 100, b * 100];
            }

            function rgb2cmyk(rgb) {
                var r = rgb[0] / 255,
                    g = rgb[1] / 255,
                    b = rgb[2] / 255,
                    c, m, y, k;

                k = Math.min(1 - r, 1 - g, 1 - b);
                c = (1 - r - k) / (1 - k) || 0;
                m = (1 - g - k) / (1 - k) || 0;
                y = (1 - b - k) / (1 - k) || 0;
                return [c * 100, m * 100, y * 100, k * 100];
            }

            function rgb2keyword(rgb) {
                return reverseKeywords[JSON.stringify(rgb)];
            }

            function rgb2xyz(rgb) {
                var r = rgb[0] / 255,
                    g = rgb[1] / 255,
                    b = rgb[2] / 255;

                // assume sRGB
                r = r > 0.04045 ? Math.pow(((r + 0.055) / 1.055), 2.4) : (r / 12.92);
                g = g > 0.04045 ? Math.pow(((g + 0.055) / 1.055), 2.4) : (g / 12.92);
                b = b > 0.04045 ? Math.pow(((b + 0.055) / 1.055), 2.4) : (b / 12.92);

                var x = (r * 0.4124) + (g * 0.3576) + (b * 0.1805);
                var y = (r * 0.2126) + (g * 0.7152) + (b * 0.0722);
                var z = (r * 0.0193) + (g * 0.1192) + (b * 0.9505);

                return [x * 100, y * 100, z * 100];
            }

            function rgb2lab(rgb) {
                var xyz = rgb2xyz(rgb),
                    x = xyz[0],
                    y = xyz[1],
                    z = xyz[2],
                    l, a, b;

                x /= 95.047;
                y /= 100;
                z /= 108.883;

                x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116);
                y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116);
                z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116);

                l = (116 * y) - 16;
                a = 500 * (x - y);
                b = 200 * (y - z);

                return [l, a, b];
            }

            function rgb2lch(args) {
                return lab2lch(rgb2lab(args));
            }

            function hsl2rgb(hsl) {
                var h = hsl[0] / 360,
                    s = hsl[1] / 100,
                    l = hsl[2] / 100,
                    t1, t2, t3, rgb, val;

                if (s == 0) {
                    val = l * 255;
                    return [val, val, val];
                }

                if (l < 0.5)
                    t2 = l * (1 + s);
                else
                    t2 = l + s - l * s;
                t1 = 2 * l - t2;

                rgb = [0, 0, 0];
                for (var i = 0; i < 3; i++) {
                    t3 = h + 1 / 3 * -(i - 1);
                    t3 < 0 && t3++;
                    t3 > 1 && t3--;

                    if (6 * t3 < 1)
                        val = t1 + (t2 - t1) * 6 * t3;
                    else if (2 * t3 < 1)
                        val = t2;
                    else if (3 * t3 < 2)
                        val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
                    else
                        val = t1;

                    rgb[i] = val * 255;
                }

                return rgb;
            }

            function hsl2hsv(hsl) {
                var h = hsl[0],
                    s = hsl[1] / 100,
                    l = hsl[2] / 100,
                    sv, v;
                l *= 2;
                s *= (l <= 1) ? l : 2 - l;
                v = (l + s) / 2;
                sv = (2 * s) / (l + s);
                return [h, sv * 100, v * 100];
            }

            function hsl2hwb(args) {
                return rgb2hwb(hsl2rgb(args));
            }

            function hsl2cmyk(args) {
                return rgb2cmyk(hsl2rgb(args));
            }

            function hsl2keyword(args) {
                return rgb2keyword(hsl2rgb(args));
            }


            function hsv2rgb(hsv) {
                var h = hsv[0] / 60,
                    s = hsv[1] / 100,
                    v = hsv[2] / 100,
                    hi = Math.floor(h) % 6;

                var f = h - Math.floor(h),
                    p = 255 * v * (1 - s),
                    q = 255 * v * (1 - (s * f)),
                    t = 255 * v * (1 - (s * (1 - f))),
                    v = 255 * v;

                switch (hi) {
                case 0:
                    return [v, t, p];
                case 1:
                    return [q, v, p];
                case 2:
                    return [p, v, t];
                case 3:
                    return [p, q, v];
                case 4:
                    return [t, p, v];
                case 5:
                    return [v, p, q];
                }
            }

            function hsv2hsl(hsv) {
                var h = hsv[0],
                    s = hsv[1] / 100,
                    v = hsv[2] / 100,
                    sl, l;

                l = (2 - s) * v;
                sl = s * v;
                sl /= (l <= 1) ? l : 2 - l;
                sl = sl || 0;
                l /= 2;
                return [h, sl * 100, l * 100];
            }

            function hsv2hwb(args) {
                return rgb2hwb(hsv2rgb(args))
            }

            function hsv2cmyk(args) {
                return rgb2cmyk(hsv2rgb(args));
            }

            function hsv2keyword(args) {
                return rgb2keyword(hsv2rgb(args));
            }

            // http://dev.w3.org/csswg/css-color/#hwb-to-rgb
            function hwb2rgb(hwb) {
                var h = hwb[0] / 360,
                    wh = hwb[1] / 100,
                    bl = hwb[2] / 100,
                    ratio = wh + bl,
                    i, v, f, n;

                // wh + bl cant be > 1
                if (ratio > 1) {
                    wh /= ratio;
                    bl /= ratio;
                }

                i = Math.floor(6 * h);
                v = 1 - bl;
                f = 6 * h - i;
                if ((i & 0x01) != 0) {
                    f = 1 - f;
                }
                n = wh + f * (v - wh); // linear interpolation

                switch (i) {
                    default:
                case 6:
                case 0:
                    r = v;
                    g = n;
                    b = wh;
                    break;
                case 1:
                    r = n;
                    g = v;
                    b = wh;
                    break;
                case 2:
                    r = wh;
                    g = v;
                    b = n;
                    break;
                case 3:
                    r = wh;
                    g = n;
                    b = v;
                    break;
                case 4:
                    r = n;
                    g = wh;
                    b = v;
                    break;
                case 5:
                    r = v;
                    g = wh;
                    b = n;
                    break;
                }

                return [r * 255, g * 255, b * 255];
            }

            function hwb2hsl(args) {
                return rgb2hsl(hwb2rgb(args));
            }

            function hwb2hsv(args) {
                return rgb2hsv(hwb2rgb(args));
            }

            function hwb2cmyk(args) {
                return rgb2cmyk(hwb2rgb(args));
            }

            function hwb2keyword(args) {
                return rgb2keyword(hwb2rgb(args));
            }

            function cmyk2rgb(cmyk) {
                var c = cmyk[0] / 100,
                    m = cmyk[1] / 100,
                    y = cmyk[2] / 100,
                    k = cmyk[3] / 100,
                    r, g, b;

                r = 1 - Math.min(1, c * (1 - k) + k);
                g = 1 - Math.min(1, m * (1 - k) + k);
                b = 1 - Math.min(1, y * (1 - k) + k);
                return [r * 255, g * 255, b * 255];
            }

            function cmyk2hsl(args) {
                return rgb2hsl(cmyk2rgb(args));
            }

            function cmyk2hsv(args) {
                return rgb2hsv(cmyk2rgb(args));
            }

            function cmyk2hwb(args) {
                return rgb2hwb(cmyk2rgb(args));
            }

            function cmyk2keyword(args) {
                return rgb2keyword(cmyk2rgb(args));
            }


            function xyz2rgb(xyz) {
                var x = xyz[0] / 100,
                    y = xyz[1] / 100,
                    z = xyz[2] / 100,
                    r, g, b;

                r = (x * 3.2406) + (y * -1.5372) + (z * -0.4986);
                g = (x * -0.9689) + (y * 1.8758) + (z * 0.0415);
                b = (x * 0.0557) + (y * -0.2040) + (z * 1.0570);

                // assume sRGB
                r = r > 0.0031308 ? ((1.055 * Math.pow(r, 1.0 / 2.4)) - 0.055) : r = (r * 12.92);

                g = g > 0.0031308 ? ((1.055 * Math.pow(g, 1.0 / 2.4)) - 0.055) : g = (g * 12.92);

                b = b > 0.0031308 ? ((1.055 * Math.pow(b, 1.0 / 2.4)) - 0.055) : b = (b * 12.92);

                r = Math.min(Math.max(0, r), 1);
                g = Math.min(Math.max(0, g), 1);
                b = Math.min(Math.max(0, b), 1);

                return [r * 255, g * 255, b * 255];
            }

            function xyz2lab(xyz) {
                var x = xyz[0],
                    y = xyz[1],
                    z = xyz[2],
                    l, a, b;

                x /= 95.047;
                y /= 100;
                z /= 108.883;

                x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116);
                y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116);
                z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116);

                l = (116 * y) - 16;
                a = 500 * (x - y);
                b = 200 * (y - z);

                return [l, a, b];
            }

            function xyz2lch(args) {
                return lab2lch(xyz2lab(args));
            }

            function lab2xyz(lab) {
                var l = lab[0],
                    a = lab[1],
                    b = lab[2],
                    x, y, z, y2;

                if (l <= 8) {
                    y = (l * 100) / 903.3;
                    y2 = (7.787 * (y / 100)) + (16 / 116);
                } else {
                    y = 100 * Math.pow((l + 16) / 116, 3);
                    y2 = Math.pow(y / 100, 1 / 3);
                }

                x = x / 95.047 <= 0.008856 ? x = (95.047 * ((a / 500) + y2 - (16 / 116))) / 7.787 : 95.047 * Math.pow((a / 500) + y2, 3);

                z = z / 108.883 <= 0.008859 ? z = (108.883 * (y2 - (b / 200) - (16 / 116))) / 7.787 : 108.883 * Math.pow(y2 - (b / 200), 3);

                return [x, y, z];
            }

            function lab2lch(lab) {
                var l = lab[0],
                    a = lab[1],
                    b = lab[2],
                    hr, h, c;

                hr = Math.atan2(b, a);
                h = hr * 360 / 2 / Math.PI;
                if (h < 0) {
                    h += 360;
                }
                c = Math.sqrt(a * a + b * b);
                return [l, c, h];
            }

            function lab2rgb(args) {
                return xyz2rgb(lab2xyz(args));
            }

            function lch2lab(lch) {
                var l = lch[0],
                    c = lch[1],
                    h = lch[2],
                    a, b, hr;

                hr = h / 360 * 2 * Math.PI;
                a = c * Math.cos(hr);
                b = c * Math.sin(hr);
                return [l, a, b];
            }

            function lch2xyz(args) {
                return lab2xyz(lch2lab(args));
            }

            function lch2rgb(args) {
                return lab2rgb(lch2lab(args));
            }

            function keyword2rgb(keyword) {
                return cssKeywords[keyword];
            }

            function keyword2hsl(args) {
                return rgb2hsl(keyword2rgb(args));
            }

            function keyword2hsv(args) {
                return rgb2hsv(keyword2rgb(args));
            }

            function keyword2hwb(args) {
                return rgb2hwb(keyword2rgb(args));
            }

            function keyword2cmyk(args) {
                return rgb2cmyk(keyword2rgb(args));
            }

            function keyword2lab(args) {
                return rgb2lab(keyword2rgb(args));
            }

            function keyword2xyz(args) {
                return rgb2xyz(keyword2rgb(args));
            }

            var cssKeywords = {
                aliceblue: [240, 248, 255],
                antiquewhite: [250, 235, 215],
                aqua: [0, 255, 255],
                aquamarine: [127, 255, 212],
                azure: [240, 255, 255],
                beige: [245, 245, 220],
                bisque: [255, 228, 196],
                black: [0, 0, 0],
                blanchedalmond: [255, 235, 205],
                blue: [0, 0, 255],
                blueviolet: [138, 43, 226],
                brown: [165, 42, 42],
                burlywood: [222, 184, 135],
                cadetblue: [95, 158, 160],
                chartreuse: [127, 255, 0],
                chocolate: [210, 105, 30],
                coral: [255, 127, 80],
                cornflowerblue: [100, 149, 237],
                cornsilk: [255, 248, 220],
                crimson: [220, 20, 60],
                cyan: [0, 255, 255],
                darkblue: [0, 0, 139],
                darkcyan: [0, 139, 139],
                darkgoldenrod: [184, 134, 11],
                darkgray: [169, 169, 169],
                darkgreen: [0, 100, 0],
                darkgrey: [169, 169, 169],
                darkkhaki: [189, 183, 107],
                darkmagenta: [139, 0, 139],
                darkolivegreen: [85, 107, 47],
                darkorange: [255, 140, 0],
                darkorchid: [153, 50, 204],
                darkred: [139, 0, 0],
                darksalmon: [233, 150, 122],
                darkseagreen: [143, 188, 143],
                darkslateblue: [72, 61, 139],
                darkslategray: [47, 79, 79],
                darkslategrey: [47, 79, 79],
                darkturquoise: [0, 206, 209],
                darkviolet: [148, 0, 211],
                deeppink: [255, 20, 147],
                deepskyblue: [0, 191, 255],
                dimgray: [105, 105, 105],
                dimgrey: [105, 105, 105],
                dodgerblue: [30, 144, 255],
                firebrick: [178, 34, 34],
                floralwhite: [255, 250, 240],
                forestgreen: [34, 139, 34],
                fuchsia: [255, 0, 255],
                gainsboro: [220, 220, 220],
                ghostwhite: [248, 248, 255],
                gold: [255, 215, 0],
                goldenrod: [218, 165, 32],
                gray: [128, 128, 128],
                green: [0, 128, 0],
                greenyellow: [173, 255, 47],
                grey: [128, 128, 128],
                honeydew: [240, 255, 240],
                hotpink: [255, 105, 180],
                indianred: [205, 92, 92],
                indigo: [75, 0, 130],
                ivory: [255, 255, 240],
                khaki: [240, 230, 140],
                lavender: [230, 230, 250],
                lavenderblush: [255, 240, 245],
                lawngreen: [124, 252, 0],
                lemonchiffon: [255, 250, 205],
                lightblue: [173, 216, 230],
                lightcoral: [240, 128, 128],
                lightcyan: [224, 255, 255],
                lightgoldenrodyellow: [250, 250, 210],
                lightgray: [211, 211, 211],
                lightgreen: [144, 238, 144],
                lightgrey: [211, 211, 211],
                lightpink: [255, 182, 193],
                lightsalmon: [255, 160, 122],
                lightseagreen: [32, 178, 170],
                lightskyblue: [135, 206, 250],
                lightslategray: [119, 136, 153],
                lightslategrey: [119, 136, 153],
                lightsteelblue: [176, 196, 222],
                lightyellow: [255, 255, 224],
                lime: [0, 255, 0],
                limegreen: [50, 205, 50],
                linen: [250, 240, 230],
                magenta: [255, 0, 255],
                maroon: [128, 0, 0],
                mediumaquamarine: [102, 205, 170],
                mediumblue: [0, 0, 205],
                mediumorchid: [186, 85, 211],
                mediumpurple: [147, 112, 219],
                mediumseagreen: [60, 179, 113],
                mediumslateblue: [123, 104, 238],
                mediumspringgreen: [0, 250, 154],
                mediumturquoise: [72, 209, 204],
                mediumvioletred: [199, 21, 133],
                midnightblue: [25, 25, 112],
                mintcream: [245, 255, 250],
                mistyrose: [255, 228, 225],
                moccasin: [255, 228, 181],
                navajowhite: [255, 222, 173],
                navy: [0, 0, 128],
                oldlace: [253, 245, 230],
                olive: [128, 128, 0],
                olivedrab: [107, 142, 35],
                orange: [255, 165, 0],
                orangered: [255, 69, 0],
                orchid: [218, 112, 214],
                palegoldenrod: [238, 232, 170],
                palegreen: [152, 251, 152],
                paleturquoise: [175, 238, 238],
                palevioletred: [219, 112, 147],
                papayawhip: [255, 239, 213],
                peachpuff: [255, 218, 185],
                peru: [205, 133, 63],
                pink: [255, 192, 203],
                plum: [221, 160, 221],
                powderblue: [176, 224, 230],
                purple: [128, 0, 128],
                rebeccapurple: [102, 51, 153],
                red: [255, 0, 0],
                rosybrown: [188, 143, 143],
                royalblue: [65, 105, 225],
                saddlebrown: [139, 69, 19],
                salmon: [250, 128, 114],
                sandybrown: [244, 164, 96],
                seagreen: [46, 139, 87],
                seashell: [255, 245, 238],
                sienna: [160, 82, 45],
                silver: [192, 192, 192],
                skyblue: [135, 206, 235],
                slateblue: [106, 90, 205],
                slategray: [112, 128, 144],
                slategrey: [112, 128, 144],
                snow: [255, 250, 250],
                springgreen: [0, 255, 127],
                steelblue: [70, 130, 180],
                tan: [210, 180, 140],
                teal: [0, 128, 128],
                thistle: [216, 191, 216],
                tomato: [255, 99, 71],
                turquoise: [64, 224, 208],
                violet: [238, 130, 238],
                wheat: [245, 222, 179],
                white: [255, 255, 255],
                whitesmoke: [245, 245, 245],
                yellow: [255, 255, 0],
                yellowgreen: [154, 205, 50]
            };

            var reverseKeywords = {};
            for (var key in cssKeywords) {
                reverseKeywords[JSON.stringify(cssKeywords[key])] = key;
            }

        }, {}
    ],
    3: [

        function (require, module, exports) {
            var conversions = require("./conversions");

            var convert = function () {
                return new Converter();
            }

            for (var func in conversions) {
                // export Raw versions
                convert[func + "Raw"] = (function (func) {
                    // accept array or plain args
                    return function (arg) {
                        if (typeof arg == "number")
                            arg = Array.prototype.slice.call(arguments);
                        return conversions[func](arg);
                    }
                })(func);

                var pair = /(\w+)2(\w+)/.exec(func),
                    from = pair[1],
                    to = pair[2];

                // export rgb2hsl and ["rgb"]["hsl"]
                convert[from] = convert[from] || {};

                convert[from][to] = convert[func] = (function (func) {
                    return function (arg) {
                        if (typeof arg == "number")
                            arg = Array.prototype.slice.call(arguments);

                        var val = conversions[func](arg);
                        if (typeof val == "string" || val === undefined)
                            return val; // keyword

                        for (var i = 0; i < val.length; i++)
                            val[i] = Math.round(val[i]);
                        return val;
                    }
                })(func);
            }


            /* Converter does lazy conversion and caching */
            var Converter = function () {
                this.convs = {};
            };

            /* Either get the values for a space or
  set the values for a space, depending on args */
            Converter.prototype.routeSpace = function (space, args) {
                var values = args[0];
                if (values === undefined) {
                    // color.rgb()
                    return this.getValues(space);
                }
                // color.rgb(10, 10, 10)
                if (typeof values == "number") {
                    values = Array.prototype.slice.call(args);
                }

                return this.setValues(space, values);
            };

            /* Set the values for a space, invalidating cache */
            Converter.prototype.setValues = function (space, values) {
                this.space = space;
                this.convs = {};
                this.convs[space] = values;
                return this;
            };

            /* Get the values for a space. If there's already
  a conversion for the space, fetch it, otherwise
  compute it */
            Converter.prototype.getValues = function (space) {
                var vals = this.convs[space];
                if (!vals) {
                    var fspace = this.space,
                        from = this.convs[fspace];
                    vals = convert[fspace][space](from);

                    this.convs[space] = vals;
                }
                return vals;
            };

            ["rgb", "hsl", "hsv", "cmyk", "keyword"].forEach(function (space) {
                Converter.prototype[space] = function (vals) {
                    return this.routeSpace(space, arguments);
                }
            });

            module.exports = convert;
        }, {
            "./conversions": 2
        }
    ],
    4: [

        function (require, module, exports) {
            /* MIT license */
            var colorNames = require('color-name');

            module.exports = {
                getRgba: getRgba,
                getHsla: getHsla,
                getRgb: getRgb,
                getHsl: getHsl,
                getHwb: getHwb,
                getAlpha: getAlpha,

                hexString: hexString,
                rgbString: rgbString,
                rgbaString: rgbaString,
                percentString: percentString,
                percentaString: percentaString,
                hslString: hslString,
                hslaString: hslaString,
                hwbString: hwbString,
                keyword: keyword
            }

            function getRgba(string) {
                if (!string) {
                    return;
                }
                var abbr = /^#([a-fA-F0-9]{3})$/,
                    hex = /^#([a-fA-F0-9]{6})$/,
                    rgba = /^rgba?\(\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/,
                    per = /^rgba?\(\s*([+-]?[\d\.]+)\%\s*,\s*([+-]?[\d\.]+)\%\s*,\s*([+-]?[\d\.]+)\%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/,
                    keyword = /(\D+)/;

                var rgb = [0, 0, 0],
                    a = 1,
                    match = string.match(abbr);
                if (match) {
                    match = match[1];
                    for (var i = 0; i < rgb.length; i++) {
                        rgb[i] = parseInt(match[i] + match[i], 16);
                    }
                } else if (match = string.match(hex)) {
                    match = match[1];
                    for (var i = 0; i < rgb.length; i++) {
                        rgb[i] = parseInt(match.slice(i * 2, i * 2 + 2), 16);
                    }
                } else if (match = string.match(rgba)) {
                    for (var i = 0; i < rgb.length; i++) {
                        rgb[i] = parseInt(match[i + 1]);
                    }
                    a = parseFloat(match[4]);
                } else if (match = string.match(per)) {
                    for (var i = 0; i < rgb.length; i++) {
                        rgb[i] = Math.round(parseFloat(match[i + 1]) * 2.55);
                    }
                    a = parseFloat(match[4]);
                } else if (match = string.match(keyword)) {
                    if (match[1] == "transparent") {
                        return [0, 0, 0, 0];
                    }
                    rgb = colorNames[match[1]];
                    if (!rgb) {
                        return;
                    }
                }

                for (var i = 0; i < rgb.length; i++) {
                    rgb[i] = scale(rgb[i], 0, 255);
                }
                if (!a && a != 0) {
                    a = 1;
                } else {
                    a = scale(a, 0, 1);
                }
                rgb[3] = a;
                return rgb;
            }

            function getHsla(string) {
                if (!string) {
                    return;
                }
                var hsl = /^hsla?\(\s*([+-]?\d+)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)/;
                var match = string.match(hsl);
                if (match) {
                    var alpha = parseFloat(match[4]);
                    var h = scale(parseInt(match[1]), 0, 360),
                        s = scale(parseFloat(match[2]), 0, 100),
                        l = scale(parseFloat(match[3]), 0, 100),
                        a = scale(isNaN(alpha) ? 1 : alpha, 0, 1);
                    return [h, s, l, a];
                }
            }

            function getHwb(string) {
                if (!string) {
                    return;
                }
                var hwb = /^hwb\(\s*([+-]?\d+)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)/;
                var match = string.match(hwb);
                if (match) {
                    var alpha = parseFloat(match[4]);
                    var h = scale(parseInt(match[1]), 0, 360),
                        w = scale(parseFloat(match[2]), 0, 100),
                        b = scale(parseFloat(match[3]), 0, 100),
                        a = scale(isNaN(alpha) ? 1 : alpha, 0, 1);
                    return [h, w, b, a];
                }
            }

            function getRgb(string) {
                var rgba = getRgba(string);
                return rgba && rgba.slice(0, 3);
            }

            function getHsl(string) {
                var hsla = getHsla(string);
                return hsla && hsla.slice(0, 3);
            }

            function getAlpha(string) {
                var vals = getRgba(string);
                if (vals) {
                    return vals[3];
                } else if (vals = getHsla(string)) {
                    return vals[3];
                } else if (vals = getHwb(string)) {
                    return vals[3];
                }
            }

            // generators
            function hexString(rgb) {
                return "#" + hexDouble(rgb[0]) + hexDouble(rgb[1]) + hexDouble(rgb[2]);
            }

            function rgbString(rgba, alpha) {
                if (alpha < 1 || (rgba[3] && rgba[3] < 1)) {
                    return rgbaString(rgba, alpha);
                }
                return "rgb(" + rgba[0] + ", " + rgba[1] + ", " + rgba[2] + ")";
            }

            function rgbaString(rgba, alpha) {
                if (alpha === undefined) {
                    alpha = (rgba[3] !== undefined ? rgba[3] : 1);
                }
                return "rgba(" + rgba[0] + ", " + rgba[1] + ", " + rgba[2] + ", " + alpha + ")";
            }

            function percentString(rgba, alpha) {
                if (alpha < 1 || (rgba[3] && rgba[3] < 1)) {
                    return percentaString(rgba, alpha);
                }
                var r = Math.round(rgba[0] / 255 * 100),
                    g = Math.round(rgba[1] / 255 * 100),
                    b = Math.round(rgba[2] / 255 * 100);

                return "rgb(" + r + "%, " + g + "%, " + b + "%)";
            }

            function percentaString(rgba, alpha) {
                var r = Math.round(rgba[0] / 255 * 100),
                    g = Math.round(rgba[1] / 255 * 100),
                    b = Math.round(rgba[2] / 255 * 100);
                return "rgba(" + r + "%, " + g + "%, " + b + "%, " + (alpha || rgba[3] || 1) + ")";
            }

            function hslString(hsla, alpha) {
                if (alpha < 1 || (hsla[3] && hsla[3] < 1)) {
                    return hslaString(hsla, alpha);
                }
                return "hsl(" + hsla[0] + ", " + hsla[1] + "%, " + hsla[2] + "%)";
            }

            function hslaString(hsla, alpha) {
                if (alpha === undefined) {
                    alpha = (hsla[3] !== undefined ? hsla[3] : 1);
                }
                return "hsla(" + hsla[0] + ", " + hsla[1] + "%, " + hsla[2] + "%, " + alpha + ")";
            }

            // hwb is a bit different than rgb(a) & hsl(a) since there is no alpha specific syntax
            // (hwb have alpha optional & 1 is default value)
            function hwbString(hwb, alpha) {
                if (alpha === undefined) {
                    alpha = (hwb[3] !== undefined ? hwb[3] : 1);
                }
                return "hwb(" + hwb[0] + ", " + hwb[1] + "%, " + hwb[2] + "%" + (alpha !== undefined && alpha !== 1 ? ", " + alpha : "") + ")";
            }

            function keyword(rgb) {
                return reverseNames[rgb.slice(0, 3)];
            }

            // helpers
            function scale(num, min, max) {
                return Math.min(Math.max(min, num), max);
            }

            function hexDouble(num) {
                var str = num.toString(16).toUpperCase();
                return (str.length < 2) ? "0" + str : str;
            }


            //create a list of reverse color names
            var reverseNames = {};
            for (var name in colorNames) {
                reverseNames[colorNames[name]] = name;
            }

        }, {
            "color-name": 5
        }
    ],
    5: [

        function (require, module, exports) {
            module.exports = {
                "aliceblue": [240, 248, 255],
                "antiquewhite": [250, 235, 215],
                "aqua": [0, 255, 255],
                "aquamarine": [127, 255, 212],
                "azure": [240, 255, 255],
                "beige": [245, 245, 220],
                "bisque": [255, 228, 196],
                "black": [0, 0, 0],
                "blanchedalmond": [255, 235, 205],
                "blue": [0, 0, 255],
                "blueviolet": [138, 43, 226],
                "brown": [165, 42, 42],
                "burlywood": [222, 184, 135],
                "cadetblue": [95, 158, 160],
                "chartreuse": [127, 255, 0],
                "chocolate": [210, 105, 30],
                "coral": [255, 127, 80],
                "cornflowerblue": [100, 149, 237],
                "cornsilk": [255, 248, 220],
                "crimson": [220, 20, 60],
                "cyan": [0, 255, 255],
                "darkblue": [0, 0, 139],
                "darkcyan": [0, 139, 139],
                "darkgoldenrod": [184, 134, 11],
                "darkgray": [169, 169, 169],
                "darkgreen": [0, 100, 0],
                "darkgrey": [169, 169, 169],
                "darkkhaki": [189, 183, 107],
                "darkmagenta": [139, 0, 139],
                "darkolivegreen": [85, 107, 47],
                "darkorange": [255, 140, 0],
                "darkorchid": [153, 50, 204],
                "darkred": [139, 0, 0],
                "darksalmon": [233, 150, 122],
                "darkseagreen": [143, 188, 143],
                "darkslateblue": [72, 61, 139],
                "darkslategray": [47, 79, 79],
                "darkslategrey": [47, 79, 79],
                "darkturquoise": [0, 206, 209],
                "darkviolet": [148, 0, 211],
                "deeppink": [255, 20, 147],
                "deepskyblue": [0, 191, 255],
                "dimgray": [105, 105, 105],
                "dimgrey": [105, 105, 105],
                "dodgerblue": [30, 144, 255],
                "firebrick": [178, 34, 34],
                "floralwhite": [255, 250, 240],
                "forestgreen": [34, 139, 34],
                "fuchsia": [255, 0, 255],
                "gainsboro": [220, 220, 220],
                "ghostwhite": [248, 248, 255],
                "gold": [255, 215, 0],
                "goldenrod": [218, 165, 32],
                "gray": [128, 128, 128],
                "green": [0, 128, 0],
                "greenyellow": [173, 255, 47],
                "grey": [128, 128, 128],
                "honeydew": [240, 255, 240],
                "hotpink": [255, 105, 180],
                "indianred": [205, 92, 92],
                "indigo": [75, 0, 130],
                "ivory": [255, 255, 240],
                "khaki": [240, 230, 140],
                "lavender": [230, 230, 250],
                "lavenderblush": [255, 240, 245],
                "lawngreen": [124, 252, 0],
                "lemonchiffon": [255, 250, 205],
                "lightblue": [173, 216, 230],
                "lightcoral": [240, 128, 128],
                "lightcyan": [224, 255, 255],
                "lightgoldenrodyellow": [250, 250, 210],
                "lightgray": [211, 211, 211],
                "lightgreen": [144, 238, 144],
                "lightgrey": [211, 211, 211],
                "lightpink": [255, 182, 193],
                "lightsalmon": [255, 160, 122],
                "lightseagreen": [32, 178, 170],
                "lightskyblue": [135, 206, 250],
                "lightslategray": [119, 136, 153],
                "lightslategrey": [119, 136, 153],
                "lightsteelblue": [176, 196, 222],
                "lightyellow": [255, 255, 224],
                "lime": [0, 255, 0],
                "limegreen": [50, 205, 50],
                "linen": [250, 240, 230],
                "magenta": [255, 0, 255],
                "maroon": [128, 0, 0],
                "mediumaquamarine": [102, 205, 170],
                "mediumblue": [0, 0, 205],
                "mediumorchid": [186, 85, 211],
                "mediumpurple": [147, 112, 219],
                "mediumseagreen": [60, 179, 113],
                "mediumslateblue": [123, 104, 238],
                "mediumspringgreen": [0, 250, 154],
                "mediumturquoise": [72, 209, 204],
                "mediumvioletred": [199, 21, 133],
                "midnightblue": [25, 25, 112],
                "mintcream": [245, 255, 250],
                "mistyrose": [255, 228, 225],
                "moccasin": [255, 228, 181],
                "navajowhite": [255, 222, 173],
                "navy": [0, 0, 128],
                "oldlace": [253, 245, 230],
                "olive": [128, 128, 0],
                "olivedrab": [107, 142, 35],
                "orange": [255, 165, 0],
                "orangered": [255, 69, 0],
                "orchid": [218, 112, 214],
                "palegoldenrod": [238, 232, 170],
                "palegreen": [152, 251, 152],
                "paleturquoise": [175, 238, 238],
                "palevioletred": [219, 112, 147],
                "papayawhip": [255, 239, 213],
                "peachpuff": [255, 218, 185],
                "peru": [205, 133, 63],
                "pink": [255, 192, 203],
                "plum": [221, 160, 221],
                "powderblue": [176, 224, 230],
                "purple": [128, 0, 128],
                "rebeccapurple": [102, 51, 153],
                "red": [255, 0, 0],
                "rosybrown": [188, 143, 143],
                "royalblue": [65, 105, 225],
                "saddlebrown": [139, 69, 19],
                "salmon": [250, 128, 114],
                "sandybrown": [244, 164, 96],
                "seagreen": [46, 139, 87],
                "seashell": [255, 245, 238],
                "sienna": [160, 82, 45],
                "silver": [192, 192, 192],
                "skyblue": [135, 206, 235],
                "slateblue": [106, 90, 205],
                "slategray": [112, 128, 144],
                "slategrey": [112, 128, 144],
                "snow": [255, 250, 250],
                "springgreen": [0, 255, 127],
                "steelblue": [70, 130, 180],
                "tan": [210, 180, 140],
                "teal": [0, 128, 128],
                "thistle": [216, 191, 216],
                "tomato": [255, 99, 71],
                "turquoise": [64, 224, 208],
                "violet": [238, 130, 238],
                "wheat": [245, 222, 179],
                "white": [255, 255, 255],
                "whitesmoke": [245, 245, 245],
                "yellow": [255, 255, 0],
                "yellowgreen": [154, 205, 50]
            }
        }, {}
    ],
    6: [

        function (require, module, exports) {
            module.exports = require('./lib/geocrunch');
        }, {
            "./lib/geocrunch": 11
        }
    ],
    7: [

        function (require, module, exports) {
            // distance.js - Distance mixins for Paths

            var _ = require('underscore');

            var R = require('./constants').EARTHRADIUS;
            var units = require('./units');
            var flipCoords = require('./flipcoords');

            // Area conversions (from sqmeters)
            var convertFuncs = {
                sqmeters: function (a) {
                    return a;
                },
                sqmiles: function (a) {
                    return units.sqMeters.toSqMiles(a);
                },
                acres: function (a) {
                    return units.sqMeters.toAcres(a);
                },
                hectares: function (a) {
                    return units.sqMeters.toHectares(a);
                }
            };

            // Calculates area in square meters
            // Method taken from OpenLayers API, https://github.com/openlayers/openlayers/blob/master/lib/OpenLayers/Geometry/LinearRing.js#L270
            var calcArea = function (coordArray) {
                var area = 0,
                    i, l, c1, c2;
                for (i = 0, l = coordArray.length; i < l; i += 1) {
                    c1 = coordArray[i];
                    c2 = coordArray[(i + 1) % coordArray.length]; // Access next item in array until last item is i, then accesses first (0)
                    area = area + units.degrees.toRadians(c2[0] - c1[0]) * (2 + Math.sin(units.degrees.toRadians(c1[1])) + Math.sin(units.degrees.toRadians(c2[1])));
                }
                return Math.abs(area * R * R / 2);
            };

            var calcCenter = function (coordArray) {
                var offset = coordArray[0],
                    twiceArea = 0,
                    x = 0,
                    y = 0,
                    i, l, c1, c2, f;
                if (coordArray.length === 1) {
                    return coordArray[0];
                }
                for (i = 0, l = coordArray.length; i < l; i += 1) {
                    c1 = coordArray[i];
                    c2 = coordArray[(i + 1) % coordArray.length]; // Access next item in array until last item is i, then accesses first (0)
                    f = (c1[1] - offset[1]) * (c2[0] - offset[0]) - (c2[1] - offset[1]) * (c1[0] - offset[0]);
                    twiceArea = twiceArea + f;
                    x = x + ((c1[0] + c2[0] - 2 * offset[0]) * f);
                    y = y + ((c1[1] + c2[1] - 2 * offset[1]) * f);
                }
                f = twiceArea * 3;
                return [x / f + offset[0], y / f + offset[1]];
            };

            module.exports = {
                _internalAreaCalc: function () {
                    // If not set, set this._calcedArea to total area in UNITS
                    // Checks for cache to prevent additional unnecessary calcs
                    if (!this._calcedArea) {
                        if (this._coords.length < 3) {
                            this._calcedArea = 0;
                        } else {
                            this._calcedArea = calcArea(this._coords);
                        }
                    }
                },
                _internalCenterCalc: function () {
                    if (!this._calcedCenter && this._coords.length) {
                        this._calcedCenter = calcCenter(this._coords);
                    }
                },
                area: function (options) {
                    var opts = _.extend({
                        units: 'sqmeters'
                    }, options);
                    this._internalAreaCalc();
                    if (_.isFunction(convertFuncs[opts.units])) {
                        return convertFuncs[opts.units](this._calcedArea);
                    }
                    // TODO. Handle non-matching units
                },
                center: function () {
                    this._internalCenterCalc();
                    return this._options.imBackwards === true ? flipCoords(this._calcedCenter) : this._calcedCenter;
                }
            };
        }, {
            "./constants": 8,
            "./flipcoords": 10,
            "./units": 13,
            "underscore": 14
        }
    ],
    8: [

        function (require, module, exports) {
            // utils/constants.js

            module.exports = {
                EARTHRADIUS: 6371000 // R in meters
            };
        }, {}
    ],
    9: [

        function (require, module, exports) {
            // distance.js - Distance mixins for Paths

            var _ = require('underscore');

            var R = require('./constants').EARTHRADIUS;
            var units = require('./units');

            // Distance conversions (from meters)
            var convertFuncs = {
                meters: function (d) {
                    return d;
                },
                kilometers: function (d) {
                    return units.meters.toKilometers(d);
                },
                feet: function (d) {
                    return units.meters.toFeet(d);
                },
                miles: function (d) {
                    return units.meters.toMiles(d);
                }
            };

            // Distance in meters
            // Always positive regardless of direction
            // Calculation based on Haversine Formula http://en.wikipedia.org/wiki/Haversine_formula
            // Another method is @ http://www.movable-type.co.uk/scripts/latlong-vincenty.html but seems way overcomplicated
            var calcDistance = function (coord1, coord2) {
                var deltaLng = units.degrees.toRadians(coord1[0] - coord2[0]),
                    deltaLat = units.degrees.toRadians(coord1[1] - coord2[1]),
                    lat1 = units.degrees.toRadians(coord1[1]),
                    lat2 = units.degrees.toRadians(coord2[1]),
                    hvsLng = Math.sin(deltaLng / 2),
                    hvsLat = Math.sin(deltaLat / 2);

                var a = hvsLat * hvsLat + hvsLng * hvsLng * Math.cos(lat1) * Math.cos(lat2);
                return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            };

            module.exports = {
                _internalDistanceCalc: function () {
                    // If not set, set this._calcedDistance to total distance in meters
                    // Checks for cache to prevent additional unnecessary calcs
                    var distance = 0,
                        i, l;
                    if (!this._calcedDistance) {
                        for (i = 0, l = this._coords.length; i < l; i += 1) {
                            if (i > 0) {
                                distance = distance + calcDistance(this._coords[i - 1], this._coords[i]);
                            }
                        }
                        this._calcedDistance = distance;
                    }
                },
                distance: function (options) {
                    var opts = _.extend({
                        units: 'meters'
                    }, options);
                    this._internalDistanceCalc();
                    if (_.isFunction(convertFuncs[opts.units])) {
                        return convertFuncs[opts.units](this._calcedDistance);
                    }
                    // TODO. Handle non-matching units
                }
            };
        }, {
            "./constants": 8,
            "./units": 13,
            "underscore": 14
        }
    ],
    10: [

        function (require, module, exports) {
            // utils/flipcoords.js - Util functions for working with backwards coordinates [lat, lng]

            var _ = require('underscore');

            module.exports = function (backwardsCoordArray) {
                return _.map(backwardsCoordArray, function (backwardsCoord) {
                    return [backwardsCoord[1], backwardsCoord[0]];
                });
            };
        }, {
            "underscore": 14
        }
    ],
    11: [

        function (require, module, exports) {
            // geocrunch.js

            var _ = require('underscore');

            var Path = require('./path');
            var distanceMixins = require('./distance'),
                areaMixins = require('./area');

            _.extend(Path.prototype, distanceMixins, areaMixins);

            exports.path = function (coords, options) {
                return new Path(coords, options);
            };
        }, {
            "./area": 7,
            "./distance": 9,
            "./path": 12,
            "underscore": 14
        }
    ],
    12: [

        function (require, module, exports) {
            // path.js - Object for working with a linear path of coordinates

            var flipCoords = require('./flipcoords');

            var Path = function (coords, options) {
                this._options = options || {};

                // Set this._coords... Think about flipping at time of calcs for less iterations/better perf. May risk code clarity and mixin ease.
                coords = coords || [];
                this._coords = this._options.imBackwards === true ? flipCoords(coords) : coords;
            };

            module.exports = Path;

        }, {
            "./flipcoords": 10
        }
    ],
    13: [

        function (require, module, exports) {
            // units.js - Standard unit conversions

            exports.meters = {
                toFeet: function (m) {
                    return m * 3.28084;
                },
                toKilometers: function (m) {
                    return m * 0.001;
                },
                toMiles: function (m) {
                    return m * 0.000621371;
                }
            };

            exports.sqMeters = {
                toSqMiles: function (m) {
                    return m * 0.000000386102;
                },
                toAcres: function (m) {
                    return m * 0.000247105;
                },
                toHectares: function (m) { //added this to bring in Hectares measurement
                    return m * 0.0001;
                }
            };

            exports.degrees = {
                toRadians: function (d) {
                    return d * Math.PI / 180;
                }
            };
        }, {}
    ],
    14: [

        function (require, module, exports) {
            //     Underscore.js 1.5.2
            //     http://underscorejs.org
            //     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
            //     Underscore may be freely distributed under the MIT license.

            (function () {

                // Baseline setup
                // --------------

                // Establish the root object, `window` in the browser, or `exports` on the server.
                var root = this;

                // Save the previous value of the `_` variable.
                var previousUnderscore = root._;

                // Establish the object that gets returned to break out of a loop iteration.
                var breaker = {};

                // Save bytes in the minified (but not gzipped) version:
                var ArrayProto = Array.prototype,
                    ObjProto = Object.prototype,
                    FuncProto = Function.prototype;

                // Create quick reference variables for speed access to core prototypes.
                var
                    push = ArrayProto.push,
                    slice = ArrayProto.slice,
                    concat = ArrayProto.concat,
                    toString = ObjProto.toString,
                    hasOwnProperty = ObjProto.hasOwnProperty;

                // All **ECMAScript 5** native function implementations that we hope to use
                // are declared here.
                var
                    nativeForEach = ArrayProto.forEach,
                    nativeMap = ArrayProto.map,
                    nativeReduce = ArrayProto.reduce,
                    nativeReduceRight = ArrayProto.reduceRight,
                    nativeFilter = ArrayProto.filter,
                    nativeEvery = ArrayProto.every,
                    nativeSome = ArrayProto.some,
                    nativeIndexOf = ArrayProto.indexOf,
                    nativeLastIndexOf = ArrayProto.lastIndexOf,
                    nativeIsArray = Array.isArray,
                    nativeKeys = Object.keys,
                    nativeBind = FuncProto.bind;

                // Create a safe reference to the Underscore object for use below.
                var _ = function (obj) {
                    if (obj instanceof _) return obj;
                    if (!(this instanceof _)) return new _(obj);
                    this._wrapped = obj;
                };

                // Export the Underscore object for **Node.js**, with
                // backwards-compatibility for the old `require()` API. If we're in
                // the browser, add `_` as a global object via a string identifier,
                // for Closure Compiler "advanced" mode.
                if (typeof exports !== 'undefined') {
                    if (typeof module !== 'undefined' && module.exports) {
                        exports = module.exports = _;
                    }
                    exports._ = _;
                } else {
                    root._ = _;
                }

                // Current version.
                _.VERSION = '1.5.2';

                // Collection Functions
                // --------------------

                // The cornerstone, an `each` implementation, aka `forEach`.
                // Handles objects with the built-in `forEach`, arrays, and raw objects.
                // Delegates to **ECMAScript 5**'s native `forEach` if available.
                var each = _.each = _.forEach = function (obj, iterator, context) {
                    if (obj == null) return;
                    if (nativeForEach && obj.forEach === nativeForEach) {
                        obj.forEach(iterator, context);
                    } else if (obj.length === +obj.length) {
                        for (var i = 0, length = obj.length; i < length; i++) {
                            if (iterator.call(context, obj[i], i, obj) === breaker) return;
                        }
                    } else {
                        var keys = _.keys(obj);
                        for (var i = 0, length = keys.length; i < length; i++) {
                            if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
                        }
                    }
                };

                // Return the results of applying the iterator to each element.
                // Delegates to **ECMAScript 5**'s native `map` if available.
                _.map = _.collect = function (obj, iterator, context) {
                    var results = [];
                    if (obj == null) return results;
                    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
                    each(obj, function (value, index, list) {
                        results.push(iterator.call(context, value, index, list));
                    });
                    return results;
                };

                var reduceError = 'Reduce of empty array with no initial value';

                // **Reduce** builds up a single result from a list of values, aka `inject`,
                // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
                _.reduce = _.foldl = _.inject = function (obj, iterator, memo, context) {
                    var initial = arguments.length > 2;
                    if (obj == null) obj = [];
                    if (nativeReduce && obj.reduce === nativeReduce) {
                        if (context) iterator = _.bind(iterator, context);
                        return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
                    }
                    each(obj, function (value, index, list) {
                        if (!initial) {
                            memo = value;
                            initial = true;
                        } else {
                            memo = iterator.call(context, memo, value, index, list);
                        }
                    });
                    if (!initial) throw new TypeError(reduceError);
                    return memo;
                };

                // The right-associative version of reduce, also known as `foldr`.
                // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
                _.reduceRight = _.foldr = function (obj, iterator, memo, context) {
                    var initial = arguments.length > 2;
                    if (obj == null) obj = [];
                    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
                        if (context) iterator = _.bind(iterator, context);
                        return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
                    }
                    var length = obj.length;
                    if (length !== +length) {
                        var keys = _.keys(obj);
                        length = keys.length;
                    }
                    each(obj, function (value, index, list) {
                        index = keys ? keys[--length] : --length;
                        if (!initial) {
                            memo = obj[index];
                            initial = true;
                        } else {
                            memo = iterator.call(context, memo, obj[index], index, list);
                        }
                    });
                    if (!initial) throw new TypeError(reduceError);
                    return memo;
                };

                // Return the first value which passes a truth test. Aliased as `detect`.
                _.find = _.detect = function (obj, iterator, context) {
                    var result;
                    any(obj, function (value, index, list) {
                        if (iterator.call(context, value, index, list)) {
                            result = value;
                            return true;
                        }
                    });
                    return result;
                };

                // Return all the elements that pass a truth test.
                // Delegates to **ECMAScript 5**'s native `filter` if available.
                // Aliased as `select`.
                _.filter = _.select = function (obj, iterator, context) {
                    var results = [];
                    if (obj == null) return results;
                    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
                    each(obj, function (value, index, list) {
                        if (iterator.call(context, value, index, list)) results.push(value);
                    });
                    return results;
                };

                // Return all the elements for which a truth test fails.
                _.reject = function (obj, iterator, context) {
                    return _.filter(obj, function (value, index, list) {
                        return !iterator.call(context, value, index, list);
                    }, context);
                };

                // Determine whether all of the elements match a truth test.
                // Delegates to **ECMAScript 5**'s native `every` if available.
                // Aliased as `all`.
                _.every = _.all = function (obj, iterator, context) {
                    iterator || (iterator = _.identity);
                    var result = true;
                    if (obj == null) return result;
                    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
                    each(obj, function (value, index, list) {
                        if (!(result = result && iterator.call(context, value, index, list))) return breaker;
                    });
                    return !!result;
                };

                // Determine if at least one element in the object matches a truth test.
                // Delegates to **ECMAScript 5**'s native `some` if available.
                // Aliased as `any`.
                var any = _.some = _.any = function (obj, iterator, context) {
                    iterator || (iterator = _.identity);
                    var result = false;
                    if (obj == null) return result;
                    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
                    each(obj, function (value, index, list) {
                        if (result || (result = iterator.call(context, value, index, list))) return breaker;
                    });
                    return !!result;
                };

                // Determine if the array or object contains a given value (using `===`).
                // Aliased as `include`.
                _.contains = _.include = function (obj, target) {
                    if (obj == null) return false;
                    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
                    return any(obj, function (value) {
                        return value === target;
                    });
                };

                // Invoke a method (with arguments) on every item in a collection.
                _.invoke = function (obj, method) {
                    var args = slice.call(arguments, 2);
                    var isFunc = _.isFunction(method);
                    return _.map(obj, function (value) {
                        return (isFunc ? method : value[method]).apply(value, args);
                    });
                };

                // Convenience version of a common use case of `map`: fetching a property.
                _.pluck = function (obj, key) {
                    return _.map(obj, function (value) {
                        return value[key];
                    });
                };

                // Convenience version of a common use case of `filter`: selecting only objects
                // containing specific `key:value` pairs.
                _.where = function (obj, attrs, first) {
                    if (_.isEmpty(attrs)) return first ? void 0 : [];
                    return _[first ? 'find' : 'filter'](obj, function (value) {
                        for (var key in attrs) {
                            if (attrs[key] !== value[key]) return false;
                        }
                        return true;
                    });
                };

                // Convenience version of a common use case of `find`: getting the first object
                // containing specific `key:value` pairs.
                _.findWhere = function (obj, attrs) {
                    return _.where(obj, attrs, true);
                };

                // Return the maximum element or (element-based computation).
                // Can't optimize arrays of integers longer than 65,535 elements.
                // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
                _.max = function (obj, iterator, context) {
                    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
                        return Math.max.apply(Math, obj);
                    }
                    if (!iterator && _.isEmpty(obj)) return -Infinity;
                    var result = {
                        computed: -Infinity,
                        value: -Infinity
                    };
                    each(obj, function (value, index, list) {
                        var computed = iterator ? iterator.call(context, value, index, list) : value;
                        computed > result.computed && (result = {
                            value: value,
                            computed: computed
                        });
                    });
                    return result.value;
                };

                // Return the minimum element (or element-based computation).
                _.min = function (obj, iterator, context) {
                    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
                        return Math.min.apply(Math, obj);
                    }
                    if (!iterator && _.isEmpty(obj)) return Infinity;
                    var result = {
                        computed: Infinity,
                        value: Infinity
                    };
                    each(obj, function (value, index, list) {
                        var computed = iterator ? iterator.call(context, value, index, list) : value;
                        computed < result.computed && (result = {
                            value: value,
                            computed: computed
                        });
                    });
                    return result.value;
                };

                // Shuffle an array, using the modern version of the
                // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
                _.shuffle = function (obj) {
                    var rand;
                    var index = 0;
                    var shuffled = [];
                    each(obj, function (value) {
                        rand = _.random(index++);
                        shuffled[index - 1] = shuffled[rand];
                        shuffled[rand] = value;
                    });
                    return shuffled;
                };

                // Sample **n** random values from an array.
                // If **n** is not specified, returns a single random element from the array.
                // The internal `guard` argument allows it to work with `map`.
                _.sample = function (obj, n, guard) {
                    if (arguments.length < 2 || guard) {
                        return obj[_.random(obj.length - 1)];
                    }
                    return _.shuffle(obj).slice(0, Math.max(0, n));
                };

                // An internal function to generate lookup iterators.
                var lookupIterator = function (value) {
                    return _.isFunction(value) ? value : function (obj) {
                        return obj[value];
                    };
                };

                // Sort the object's values by a criterion produced by an iterator.
                _.sortBy = function (obj, value, context) {
                    var iterator = lookupIterator(value);
                    return _.pluck(_.map(obj, function (value, index, list) {
                        return {
                            value: value,
                            index: index,
                            criteria: iterator.call(context, value, index, list)
                        };
                    }).sort(function (left, right) {
                        var a = left.criteria;
                        var b = right.criteria;
                        if (a !== b) {
                            if (a > b || a === void 0) return 1;
                            if (a < b || b === void 0) return -1;
                        }
                        return left.index - right.index;
                    }), 'value');
                };

                // An internal function used for aggregate "group by" operations.
                var group = function (behavior) {
                    return function (obj, value, context) {
                        var result = {};
                        var iterator = value == null ? _.identity : lookupIterator(value);
                        each(obj, function (value, index) {
                            var key = iterator.call(context, value, index, obj);
                            behavior(result, key, value);
                        });
                        return result;
                    };
                };

                // Groups the object's values by a criterion. Pass either a string attribute
                // to group by, or a function that returns the criterion.
                _.groupBy = group(function (result, key, value) {
                    (_.has(result, key) ? result[key] : (result[key] = [])).push(value);
                });

                // Indexes the object's values by a criterion, similar to `groupBy`, but for
                // when you know that your index values will be unique.
                _.indexBy = group(function (result, key, value) {
                    result[key] = value;
                });

                // Counts instances of an object that group by a certain criterion. Pass
                // either a string attribute to count by, or a function that returns the
                // criterion.
                _.countBy = group(function (result, key) {
                    _.has(result, key) ? result[key]++ : result[key] = 1;
                });

                // Use a comparator function to figure out the smallest index at which
                // an object should be inserted so as to maintain order. Uses binary search.
                _.sortedIndex = function (array, obj, iterator, context) {
                    iterator = iterator == null ? _.identity : lookupIterator(iterator);
                    var value = iterator.call(context, obj);
                    var low = 0,
                        high = array.length;
                    while (low < high) {
                        var mid = (low + high) >>> 1;
                        iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
                    }
                    return low;
                };

                // Safely create a real, live array from anything iterable.
                _.toArray = function (obj) {
                    if (!obj) return [];
                    if (_.isArray(obj)) return slice.call(obj);
                    if (obj.length === +obj.length) return _.map(obj, _.identity);
                    return _.values(obj);
                };

                // Return the number of elements in an object.
                _.size = function (obj) {
                    if (obj == null) return 0;
                    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
                };

                // Array Functions
                // ---------------

                // Get the first element of an array. Passing **n** will return the first N
                // values in the array. Aliased as `head` and `take`. The **guard** check
                // allows it to work with `_.map`.
                _.first = _.head = _.take = function (array, n, guard) {
                    if (array == null) return void 0;
                    return (n == null) || guard ? array[0] : slice.call(array, 0, n);
                };

                // Returns everything but the last entry of the array. Especially useful on
                // the arguments object. Passing **n** will return all the values in
                // the array, excluding the last N. The **guard** check allows it to work with
                // `_.map`.
                _.initial = function (array, n, guard) {
                    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
                };

                // Get the last element of an array. Passing **n** will return the last N
                // values in the array. The **guard** check allows it to work with `_.map`.
                _.last = function (array, n, guard) {
                    if (array == null) return void 0;
                    if ((n == null) || guard) {
                        return array[array.length - 1];
                    } else {
                        return slice.call(array, Math.max(array.length - n, 0));
                    }
                };

                // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
                // Especially useful on the arguments object. Passing an **n** will return
                // the rest N values in the array. The **guard**
                // check allows it to work with `_.map`.
                _.rest = _.tail = _.drop = function (array, n, guard) {
                    return slice.call(array, (n == null) || guard ? 1 : n);
                };

                // Trim out all falsy values from an array.
                _.compact = function (array) {
                    return _.filter(array, _.identity);
                };

                // Internal implementation of a recursive `flatten` function.
                var flatten = function (input, shallow, output) {
                    if (shallow && _.every(input, _.isArray)) {
                        return concat.apply(output, input);
                    }
                    each(input, function (value) {
                        if (_.isArray(value) || _.isArguments(value)) {
                            shallow ? push.apply(output, value) : flatten(value, shallow, output);
                        } else {
                            output.push(value);
                        }
                    });
                    return output;
                };

                // Flatten out an array, either recursively (by default), or just one level.
                _.flatten = function (array, shallow) {
                    return flatten(array, shallow, []);
                };

                // Return a version of the array that does not contain the specified value(s).
                _.without = function (array) {
                    return _.difference(array, slice.call(arguments, 1));
                };

                // Produce a duplicate-free version of the array. If the array has already
                // been sorted, you have the option of using a faster algorithm.
                // Aliased as `unique`.
                _.uniq = _.unique = function (array, isSorted, iterator, context) {
                    if (_.isFunction(isSorted)) {
                        context = iterator;
                        iterator = isSorted;
                        isSorted = false;
                    }
                    var initial = iterator ? _.map(array, iterator, context) : array;
                    var results = [];
                    var seen = [];
                    each(initial, function (value, index) {
                        if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
                            seen.push(value);
                            results.push(array[index]);
                        }
                    });
                    return results;
                };

                // Produce an array that contains the union: each distinct element from all of
                // the passed-in arrays.
                _.union = function () {
                    return _.uniq(_.flatten(arguments, true));
                };

                // Produce an array that contains every item shared between all the
                // passed-in arrays.
                _.intersection = function (array) {
                    var rest = slice.call(arguments, 1);
                    return _.filter(_.uniq(array), function (item) {
                        return _.every(rest, function (other) {
                            return _.indexOf(other, item) >= 0;
                        });
                    });
                };

                // Take the difference between one array and a number of other arrays.
                // Only the elements present in just the first array will remain.
                _.difference = function (array) {
                    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
                    return _.filter(array, function (value) {
                        return !_.contains(rest, value);
                    });
                };

                // Zip together multiple lists into a single array -- elements that share
                // an index go together.
                _.zip = function () {
                    var length = _.max(_.pluck(arguments, "length").concat(0));
                    var results = new Array(length);
                    for (var i = 0; i < length; i++) {
                        results[i] = _.pluck(arguments, '' + i);
                    }
                    return results;
                };

                // Converts lists into objects. Pass either a single array of `[key, value]`
                // pairs, or two parallel arrays of the same length -- one of keys, and one of
                // the corresponding values.
                _.object = function (list, values) {
                    if (list == null) return {};
                    var result = {};
                    for (var i = 0, length = list.length; i < length; i++) {
                        if (values) {
                            result[list[i]] = values[i];
                        } else {
                            result[list[i][0]] = list[i][1];
                        }
                    }
                    return result;
                };

                // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
                // we need this function. Return the position of the first occurrence of an
                // item in an array, or -1 if the item is not included in the array.
                // Delegates to **ECMAScript 5**'s native `indexOf` if available.
                // If the array is large and already in sort order, pass `true`
                // for **isSorted** to use binary search.
                _.indexOf = function (array, item, isSorted) {
                    if (array == null) return -1;
                    var i = 0,
                        length = array.length;
                    if (isSorted) {
                        if (typeof isSorted == 'number') {
                            i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);
                        } else {
                            i = _.sortedIndex(array, item);
                            return array[i] === item ? i : -1;
                        }
                    }
                    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
                    for (; i < length; i++)
                        if (array[i] === item) return i;
                    return -1;
                };

                // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
                _.lastIndexOf = function (array, item, from) {
                    if (array == null) return -1;
                    var hasIndex = from != null;
                    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
                        return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
                    }
                    var i = (hasIndex ? from : array.length);
                    while (i--)
                        if (array[i] === item) return i;
                    return -1;
                };

                // Generate an integer Array containing an arithmetic progression. A port of
                // the native Python `range()` function. See
                // [the Python documentation](http://docs.python.org/library/functions.html#range).
                _.range = function (start, stop, step) {
                    if (arguments.length <= 1) {
                        stop = start || 0;
                        start = 0;
                    }
                    step = arguments[2] || 1;

                    var length = Math.max(Math.ceil((stop - start) / step), 0);
                    var idx = 0;
                    var range = new Array(length);

                    while (idx < length) {
                        range[idx++] = start;
                        start += step;
                    }

                    return range;
                };

                // Function (ahem) Functions
                // ------------------

                // Reusable constructor function for prototype setting.
                var ctor = function () {};

                // Create a function bound to a given object (assigning `this`, and arguments,
                // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
                // available.
                _.bind = function (func, context) {
                    var args, bound;
                    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
                    if (!_.isFunction(func)) throw new TypeError;
                    args = slice.call(arguments, 2);
                    return bound = function () {
                        if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
                        ctor.prototype = func.prototype;
                        var self = new ctor;
                        ctor.prototype = null;
                        var result = func.apply(self, args.concat(slice.call(arguments)));
                        if (Object(result) === result) return result;
                        return self;
                    };
                };

                // Partially apply a function by creating a version that has had some of its
                // arguments pre-filled, without changing its dynamic `this` context.
                _.partial = function (func) {
                    var args = slice.call(arguments, 1);
                    return function () {
                        return func.apply(this, args.concat(slice.call(arguments)));
                    };
                };

                // Bind all of an object's methods to that object. Useful for ensuring that
                // all callbacks defined on an object belong to it.
                _.bindAll = function (obj) {
                    var funcs = slice.call(arguments, 1);
                    if (funcs.length === 0) throw new Error("bindAll must be passed function names");
                    each(funcs, function (f) {
                        obj[f] = _.bind(obj[f], obj);
                    });
                    return obj;
                };

                // Memoize an expensive function by storing its results.
                _.memoize = function (func, hasher) {
                    var memo = {};
                    hasher || (hasher = _.identity);
                    return function () {
                        var key = hasher.apply(this, arguments);
                        return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
                    };
                };

                // Delays a function for the given number of milliseconds, and then calls
                // it with the arguments supplied.
                _.delay = function (func, wait) {
                    var args = slice.call(arguments, 2);
                    return setTimeout(function () {
                        return func.apply(null, args);
                    }, wait);
                };

                // Defers a function, scheduling it to run after the current call stack has
                // cleared.
                _.defer = function (func) {
                    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
                };

                // Returns a function, that, when invoked, will only be triggered at most once
                // during a given window of time. Normally, the throttled function will run
                // as much as it can, without ever going more than once per `wait` duration;
                // but if you'd like to disable the execution on the leading edge, pass
                // `{leading: false}`. To disable execution on the trailing edge, ditto.
                _.throttle = function (func, wait, options) {
                    var context, args, result;
                    var timeout = null;
                    var previous = 0;
                    options || (options = {});
                    var later = function () {
                        previous = options.leading === false ? 0 : new Date;
                        timeout = null;
                        result = func.apply(context, args);
                    };
                    return function () {
                        var now = new Date;
                        if (!previous && options.leading === false) previous = now;
                        var remaining = wait - (now - previous);
                        context = this;
                        args = arguments;
                        if (remaining <= 0) {
                            clearTimeout(timeout);
                            timeout = null;
                            previous = now;
                            result = func.apply(context, args);
                        } else if (!timeout && options.trailing !== false) {
                            timeout = setTimeout(later, remaining);
                        }
                        return result;
                    };
                };

                // Returns a function, that, as long as it continues to be invoked, will not
                // be triggered. The function will be called after it stops being called for
                // N milliseconds. If `immediate` is passed, trigger the function on the
                // leading edge, instead of the trailing.
                _.debounce = function (func, wait, immediate) {
                    var timeout, args, context, timestamp, result;
                    return function () {
                        context = this;
                        args = arguments;
                        timestamp = new Date();
                        var later = function () {
                            var last = (new Date()) - timestamp;
                            if (last < wait) {
                                timeout = setTimeout(later, wait - last);
                            } else {
                                timeout = null;
                                if (!immediate) result = func.apply(context, args);
                            }
                        };
                        var callNow = immediate && !timeout;
                        if (!timeout) {
                            timeout = setTimeout(later, wait);
                        }
                        if (callNow) result = func.apply(context, args);
                        return result;
                    };
                };

                // Returns a function that will be executed at most one time, no matter how
                // often you call it. Useful for lazy initialization.
                _.once = function (func) {
                    var ran = false,
                        memo;
                    return function () {
                        if (ran) return memo;
                        ran = true;
                        memo = func.apply(this, arguments);
                        func = null;
                        return memo;
                    };
                };

                // Returns the first function passed as an argument to the second,
                // allowing you to adjust arguments, run code before and after, and
                // conditionally execute the original function.
                _.wrap = function (func, wrapper) {
                    return function () {
                        var args = [func];
                        push.apply(args, arguments);
                        return wrapper.apply(this, args);
                    };
                };

                // Returns a function that is the composition of a list of functions, each
                // consuming the return value of the function that follows.
                _.compose = function () {
                    var funcs = arguments;
                    return function () {
                        var args = arguments;
                        for (var i = funcs.length - 1; i >= 0; i--) {
                            args = [funcs[i].apply(this, args)];
                        }
                        return args[0];
                    };
                };

                // Returns a function that will only be executed after being called N times.
                _.after = function (times, func) {
                    return function () {
                        if (--times < 1) {
                            return func.apply(this, arguments);
                        }
                    };
                };

                // Object Functions
                // ----------------

                // Retrieve the names of an object's properties.
                // Delegates to **ECMAScript 5**'s native `Object.keys`
                _.keys = nativeKeys || function (obj) {
                    if (obj !== Object(obj)) throw new TypeError('Invalid object');
                    var keys = [];
                    for (var key in obj)
                        if (_.has(obj, key)) keys.push(key);
                    return keys;
                };

                // Retrieve the values of an object's properties.
                _.values = function (obj) {
                    var keys = _.keys(obj);
                    var length = keys.length;
                    var values = new Array(length);
                    for (var i = 0; i < length; i++) {
                        values[i] = obj[keys[i]];
                    }
                    return values;
                };

                // Convert an object into a list of `[key, value]` pairs.
                _.pairs = function (obj) {
                    var keys = _.keys(obj);
                    var length = keys.length;
                    var pairs = new Array(length);
                    for (var i = 0; i < length; i++) {
                        pairs[i] = [keys[i], obj[keys[i]]];
                    }
                    return pairs;
                };

                // Invert the keys and values of an object. The values must be serializable.
                _.invert = function (obj) {
                    var result = {};
                    var keys = _.keys(obj);
                    for (var i = 0, length = keys.length; i < length; i++) {
                        result[obj[keys[i]]] = keys[i];
                    }
                    return result;
                };

                // Return a sorted list of the function names available on the object.
                // Aliased as `methods`
                _.functions = _.methods = function (obj) {
                    var names = [];
                    for (var key in obj) {
                        if (_.isFunction(obj[key])) names.push(key);
                    }
                    return names.sort();
                };

                // Extend a given object with all the properties in passed-in object(s).
                _.extend = function (obj) {
                    each(slice.call(arguments, 1), function (source) {
                        if (source) {
                            for (var prop in source) {
                                obj[prop] = source[prop];
                            }
                        }
                    });
                    return obj;
                };

                // Return a copy of the object only containing the whitelisted properties.
                _.pick = function (obj) {
                    var copy = {};
                    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
                    each(keys, function (key) {
                        if (key in obj) copy[key] = obj[key];
                    });
                    return copy;
                };

                // Return a copy of the object without the blacklisted properties.
                _.omit = function (obj) {
                    var copy = {};
                    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
                    for (var key in obj) {
                        if (!_.contains(keys, key)) copy[key] = obj[key];
                    }
                    return copy;
                };

                // Fill in a given object with default properties.
                _.defaults = function (obj) {
                    each(slice.call(arguments, 1), function (source) {
                        if (source) {
                            for (var prop in source) {
                                if (obj[prop] === void 0) obj[prop] = source[prop];
                            }
                        }
                    });
                    return obj;
                };

                // Create a (shallow-cloned) duplicate of an object.
                _.clone = function (obj) {
                    if (!_.isObject(obj)) return obj;
                    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
                };

                // Invokes interceptor with the obj, and then returns obj.
                // The primary purpose of this method is to "tap into" a method chain, in
                // order to perform operations on intermediate results within the chain.
                _.tap = function (obj, interceptor) {
                    interceptor(obj);
                    return obj;
                };

                // Internal recursive comparison function for `isEqual`.
                var eq = function (a, b, aStack, bStack) {
                    // Identical objects are equal. `0 === -0`, but they aren't identical.
                    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
                    if (a === b) return a !== 0 || 1 / a == 1 / b;
                    // A strict comparison is necessary because `null == undefined`.
                    if (a == null || b == null) return a === b;
                    // Unwrap any wrapped objects.
                    if (a instanceof _) a = a._wrapped;
                    if (b instanceof _) b = b._wrapped;
                    // Compare `[[Class]]` names.
                    var className = toString.call(a);
                    if (className != toString.call(b)) return false;
                    switch (className) {
                        // Strings, numbers, dates, and booleans are compared by value.
                    case '[object String]':
                        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
                        // equivalent to `new String("5")`.
                        return a == String(b);
                    case '[object Number]':
                        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
                        // other numeric values.
                        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
                    case '[object Date]':
                    case '[object Boolean]':
                        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
                        // millisecond representations. Note that invalid dates with millisecond representations
                        // of `NaN` are not equivalent.
                        return +a == +b;
                        // RegExps are compared by their source patterns and flags.
                    case '[object RegExp]':
                        return a.source == b.source &&
                            a.global == b.global &&
                            a.multiline == b.multiline &&
                            a.ignoreCase == b.ignoreCase;
                    }
                    if (typeof a != 'object' || typeof b != 'object') return false;
                    // Assume equality for cyclic structures. The algorithm for detecting cyclic
                    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
                    var length = aStack.length;
                    while (length--) {
                        // Linear search. Performance is inversely proportional to the number of
                        // unique nested structures.
                        if (aStack[length] == a) return bStack[length] == b;
                    }
                    // Objects with different constructors are not equivalent, but `Object`s
                    // from different frames are.
                    var aCtor = a.constructor,
                        bCtor = b.constructor;
                    if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                        _.isFunction(bCtor) && (bCtor instanceof bCtor))) {
                        return false;
                    }
                    // Add the first object to the stack of traversed objects.
                    aStack.push(a);
                    bStack.push(b);
                    var size = 0,
                        result = true;
                    // Recursively compare objects and arrays.
                    if (className == '[object Array]') {
                        // Compare array lengths to determine if a deep comparison is necessary.
                        size = a.length;
                        result = size == b.length;
                        if (result) {
                            // Deep compare the contents, ignoring non-numeric properties.
                            while (size--) {
                                if (!(result = eq(a[size], b[size], aStack, bStack))) break;
                            }
                        }
                    } else {
                        // Deep compare objects.
                        for (var key in a) {
                            if (_.has(a, key)) {
                                // Count the expected number of properties.
                                size++;
                                // Deep compare each member.
                                if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
                            }
                        }
                        // Ensure that both objects contain the same number of properties.
                        if (result) {
                            for (key in b) {
                                if (_.has(b, key) && !(size--)) break;
                            }
                            result = !size;
                        }
                    }
                    // Remove the first object from the stack of traversed objects.
                    aStack.pop();
                    bStack.pop();
                    return result;
                };

                // Perform a deep comparison to check if two objects are equal.
                _.isEqual = function (a, b) {
                    return eq(a, b, [], []);
                };

                // Is a given array, string, or object empty?
                // An "empty" object has no enumerable own-properties.
                _.isEmpty = function (obj) {
                    if (obj == null) return true;
                    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
                    for (var key in obj)
                        if (_.has(obj, key)) return false;
                    return true;
                };

                // Is a given value a DOM element?
                _.isElement = function (obj) {
                    return !!(obj && obj.nodeType === 1);
                };

                // Is a given value an array?
                // Delegates to ECMA5's native Array.isArray
                _.isArray = nativeIsArray || function (obj) {
                    return toString.call(obj) == '[object Array]';
                };

                // Is a given variable an object?
                _.isObject = function (obj) {
                    return obj === Object(obj);
                };

                // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
                each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function (name) {
                    _['is' + name] = function (obj) {
                        return toString.call(obj) == '[object ' + name + ']';
                    };
                });

                // Define a fallback version of the method in browsers (ahem, IE), where
                // there isn't any inspectable "Arguments" type.
                if (!_.isArguments(arguments)) {
                    _.isArguments = function (obj) {
                        return !!(obj && _.has(obj, 'callee'));
                    };
                }

                // Optimize `isFunction` if appropriate.
                if (typeof (/./) !== 'function') {
                    _.isFunction = function (obj) {
                        return typeof obj === 'function';
                    };
                }

                // Is a given object a finite number?
                _.isFinite = function (obj) {
                    return isFinite(obj) && !isNaN(parseFloat(obj));
                };

                // Is the given value `NaN`? (NaN is the only number which does not equal itself).
                _.isNaN = function (obj) {
                    return _.isNumber(obj) && obj != +obj;
                };

                // Is a given value a boolean?
                _.isBoolean = function (obj) {
                    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
                };

                // Is a given value equal to null?
                _.isNull = function (obj) {
                    return obj === null;
                };

                // Is a given variable undefined?
                _.isUndefined = function (obj) {
                    return obj === void 0;
                };

                // Shortcut function for checking if an object has a given property directly
                // on itself (in other words, not on a prototype).
                _.has = function (obj, key) {
                    return hasOwnProperty.call(obj, key);
                };

                // Utility Functions
                // -----------------

                // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
                // previous owner. Returns a reference to the Underscore object.
                _.noConflict = function () {
                    root._ = previousUnderscore;
                    return this;
                };

                // Keep the identity function around for default iterators.
                _.identity = function (value) {
                    return value;
                };

                // Run a function **n** times.
                _.times = function (n, iterator, context) {
                    var accum = Array(Math.max(0, n));
                    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
                    return accum;
                };

                // Return a random integer between min and max (inclusive).
                _.random = function (min, max) {
                    if (max == null) {
                        max = min;
                        min = 0;
                    }
                    return min + Math.floor(Math.random() * (max - min + 1));
                };

                // List of HTML entities for escaping.
                var entityMap = {
                    escape: {
                        '&': '&amp;',
                        '<': '&lt;',
                        '>': '&gt;',
                        '"': '&quot;',
                        "'": '&#x27;'
                    }
                };
                entityMap.unescape = _.invert(entityMap.escape);

                // Regexes containing the keys and values listed immediately above.
                var entityRegexes = {
                    escape: new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
                    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
                };

                // Functions for escaping and unescaping strings to/from HTML interpolation.
                _.each(['escape', 'unescape'], function (method) {
                    _[method] = function (string) {
                        if (string == null) return '';
                        return ('' + string).replace(entityRegexes[method], function (match) {
                            return entityMap[method][match];
                        });
                    };
                });

                // If the value of the named `property` is a function then invoke it with the
                // `object` as context; otherwise, return it.
                _.result = function (object, property) {
                    if (object == null) return void 0;
                    var value = object[property];
                    return _.isFunction(value) ? value.call(object) : value;
                };

                // Add your own custom functions to the Underscore object.
                _.mixin = function (obj) {
                    each(_.functions(obj), function (name) {
                        var func = _[name] = obj[name];
                        _.prototype[name] = function () {
                            var args = [this._wrapped];
                            push.apply(args, arguments);
                            return result.call(this, func.apply(_, args));
                        };
                    });
                };

                // Generate a unique integer id (unique within the entire client session).
                // Useful for temporary DOM ids.
                var idCounter = 0;
                _.uniqueId = function (prefix) {
                    var id = ++idCounter + '';
                    return prefix ? prefix + id : id;
                };

                // By default, Underscore uses ERB-style template delimiters, change the
                // following template settings to use alternative delimiters.
                _.templateSettings = {
                    evaluate: /<%([\s\S]+?)%>/g,
                    interpolate: /<%=([\s\S]+?)%>/g,
                    escape: /<%-([\s\S]+?)%>/g
                };

                // When customizing `templateSettings`, if you don't want to define an
                // interpolation, evaluation or escaping regex, we need one that is
                // guaranteed not to match.
                var noMatch = /(.)^/;

                // Certain characters need to be escaped so that they can be put into a
                // string literal.
                var escapes = {
                    "'": "'",
                    '\\': '\\',
                    '\r': 'r',
                    '\n': 'n',
                    '\t': 't',
                    '\u2028': 'u2028',
                    '\u2029': 'u2029'
                };

                var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

                // JavaScript micro-templating, similar to John Resig's implementation.
                // Underscore templating handles arbitrary delimiters, preserves whitespace,
                // and correctly escapes quotes within interpolated code.
                _.template = function (text, data, settings) {
                    var render;
                    settings = _.defaults({}, settings, _.templateSettings);

                    // Combine delimiters into one regular expression via alternation.
                    var matcher = new RegExp([
                        (settings.escape || noMatch).source, (settings.interpolate || noMatch).source, (settings.evaluate || noMatch).source
                    ].join('|') + '|$', 'g');

                    // Compile the template source, escaping string literals appropriately.
                    var index = 0;
                    var source = "__p+='";
                    text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
                        source += text.slice(index, offset)
                            .replace(escaper, function (match) {
                                return '\\' + escapes[match];
                            });

                        if (escape) {
                            source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
                        }
                        if (interpolate) {
                            source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
                        }
                        if (evaluate) {
                            source += "';\n" + evaluate + "\n__p+='";
                        }
                        index = offset + match.length;
                        return match;
                    });
                    source += "';\n";

                    // If a variable is not specified, place data values in local scope.
                    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

                    source = "var __t,__p='',__j=Array.prototype.join," +
                        "print=function(){__p+=__j.call(arguments,'');};\n" +
                        source + "return __p;\n";

                    try {
                        render = new Function(settings.variable || 'obj', '_', source);
                    } catch (e) {
                        e.source = source;
                        throw e;
                    }

                    if (data) return render(data, _);
                    var template = function (data) {
                        return render.call(this, data, _);
                    };

                    // Provide the compiled function source as a convenience for precompilation.
                    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

                    return template;
                };

                // Add a "chain" function, which will delegate to the wrapper.
                _.chain = function (obj) {
                    return _(obj).chain();
                };

                // OOP
                // ---------------
                // If Underscore is called as a function, it returns a wrapped object that
                // can be used OO-style. This wrapper holds altered versions of all the
                // underscore functions. Wrapped objects may be chained.

                // Helper function to continue chaining intermediate results.
                var result = function (obj) {
                    return this._chain ? _(obj).chain() : obj;
                };

                // Add all of the Underscore functions to the wrapper object.
                _.mixin(_);

                // Add all mutator Array functions to the wrapper.
                each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function (name) {
                    var method = ArrayProto[name];
                    _.prototype[name] = function () {
                        var obj = this._wrapped;
                        method.apply(obj, arguments);
                        if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
                        return result.call(this, obj);
                    };
                });

                // Add all accessor Array functions to the wrapper.
                each(['concat', 'join', 'slice'], function (name) {
                    var method = ArrayProto[name];
                    _.prototype[name] = function () {
                        return result.call(this, method.apply(this._wrapped, arguments));
                    };
                });

                _.extend(_.prototype, {

                    // Start chaining a wrapped Underscore object.
                    chain: function () {
                        this._chain = true;
                        return this;
                    },

                    // Extracts the result from a wrapped and chained object.
                    value: function () {
                        return this._wrapped;
                    }

                });

            }).call(this);

        }, {}
    ],
    15: [

        function (require, module, exports) {

            (function () {

                // Baseline setup
                // --------------

                // Establish the root object, `window` in the browser, or `global` on the server.
                var root = this;

                // Save the previous value of the `humanize` variable.
                var previousHumanize = root.humanize;

                var humanize = {};

                if (typeof exports !== 'undefined') {
                    if (typeof module !== 'undefined' && module.exports) {
                        exports = module.exports = humanize;
                    }
                    exports.humanize = humanize;
                } else {
                    if (typeof define === 'function' && define.amd) {
                        define('humanize', function () {
                            return humanize;
                        });
                    }
                    root.humanize = humanize;
                }

                humanize.noConflict = function () {
                    root.humanize = previousHumanize;
                    return this;
                };

                humanize.pad = function (str, count, padChar, type) {
                    str += '';
                    if (!padChar) {
                        padChar = ' ';
                    } else if (padChar.length > 1) {
                        padChar = padChar.charAt(0);
                    }
                    type = (type === undefined) ? 'left' : 'right';

                    if (type === 'right') {
                        while (str.length < count) {
                            str = str + padChar;
                        }
                    } else {
                        // default to left
                        while (str.length < count) {
                            str = padChar + str;
                        }
                    }

                    return str;
                };

                // gets current unix time
                humanize.time = function () {
                    return new Date().getTime() / 1000;
                };

                /**
                 * PHP-inspired date
                 */

                /*  jan  feb  mar  apr  may  jun  jul  aug  sep  oct  nov  dec */
                var dayTableCommon = [0, 0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
                var dayTableLeap = [0, 0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];
                // var mtable_common[13] = {  0,  31,  28,  31,  30,  31,  30,  31,  31,  30,  31,  30,  31 };
                // static int ml_table_leap[13]   = {  0,  31,  29,  31,  30,  31,  30,  31,  31,  30,  31,  30,  31 };


                humanize.date = function (format, timestamp) {
                    var jsdate = ((timestamp === undefined) ? new Date() : // Not provided
                        (timestamp instanceof Date) ? new Date(timestamp) : // JS Date()
                        new Date(timestamp * 1000) // UNIX timestamp (auto-convert to int)
                    );

                    var formatChr = /\\?([a-z])/gi;
                    var formatChrCb = function (t, s) {
                        return f[t] ? f[t]() : s;
                    };

                    var shortDayTxt = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    var monthTxt = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

                    var f = {
                        /* Day */
                        // Day of month w/leading 0; 01..31
                        d: function () {
                            return humanize.pad(f.j(), 2, '0');
                        },

                        // Shorthand day name; Mon..Sun
                        D: function () {
                            return f.l().slice(0, 3);
                        },

                        // Day of month; 1..31
                        j: function () {
                            return jsdate.getDate();
                        },

                        // Full day name; Monday..Sunday
                        l: function () {
                            return shortDayTxt[f.w()];
                        },

                        // ISO-8601 day of week; 1[Mon]..7[Sun]
                        N: function () {
                            return f.w() || 7;
                        },

                        // Ordinal suffix for day of month; st, nd, rd, th
                        S: function () {
                            var j = f.j();
                            return j > 4 && j < 21 ? 'th' : {
                                1: 'st',
                                2: 'nd',
                                3: 'rd'
                            }[j % 10] || 'th';
                        },

                        // Day of week; 0[Sun]..6[Sat]
                        w: function () {
                            return jsdate.getDay();
                        },

                        // Day of year; 0..365
                        z: function () {
                            return (f.L() ? dayTableLeap[f.n()] : dayTableCommon[f.n()]) + f.j() - 1;
                        },

                        /* Week */
                        // ISO-8601 week number
                        W: function () {
                            // days between midweek of this week and jan 4
                            // (f.z() - f.N() + 1 + 3.5) - 3
                            var midWeekDaysFromJan4 = f.z() - f.N() + 1.5;
                            // 1 + number of weeks + rounded week
                            return humanize.pad(1 + Math.floor(Math.abs(midWeekDaysFromJan4) / 7) + (midWeekDaysFromJan4 % 7 > 3.5 ? 1 : 0), 2, '0');
                        },

                        /* Month */
                        // Full month name; January..December
                        F: function () {
                            return monthTxt[jsdate.getMonth()];
                        },

                        // Month w/leading 0; 01..12
                        m: function () {
                            return humanize.pad(f.n(), 2, '0');
                        },

                        // Shorthand month name; Jan..Dec
                        M: function () {
                            return f.F().slice(0, 3);
                        },

                        // Month; 1..12
                        n: function () {
                            return jsdate.getMonth() + 1;
                        },

                        // Days in month; 28..31
                        t: function () {
                            return (new Date(f.Y(), f.n(), 0)).getDate();
                        },

                        /* Year */
                        // Is leap year?; 0 or 1
                        L: function () {
                            return new Date(f.Y(), 1, 29).getMonth() === 1 ? 1 : 0;
                        },

                        // ISO-8601 year
                        o: function () {
                            var n = f.n();
                            var W = f.W();
                            return f.Y() + (n === 12 && W < 9 ? -1 : n === 1 && W > 9);
                        },

                        // Full year; e.g. 1980..2010
                        Y: function () {
                            return jsdate.getFullYear();
                        },

                        // Last two digits of year; 00..99
                        y: function () {
                            return (String(f.Y())).slice(-2);
                        },

                        /* Time */
                        // am or pm
                        a: function () {
                            return jsdate.getHours() > 11 ? 'pm' : 'am';
                        },

                        // AM or PM
                        A: function () {
                            return f.a().toUpperCase();
                        },

                        // Swatch Internet time; 000..999
                        B: function () {
                            var unixTime = jsdate.getTime() / 1000;
                            var secondsPassedToday = unixTime % 86400 + 3600; // since it's based off of UTC+1
                            if (secondsPassedToday < 0) {
                                secondsPassedToday += 86400;
                            }
                            var beats = ((secondsPassedToday) / 86.4) % 1000;
                            if (unixTime < 0) {
                                return Math.ceil(beats);
                            }
                            return Math.floor(beats);
                        },

                        // 12-Hours; 1..12
                        g: function () {
                            return f.G() % 12 || 12;
                        },

                        // 24-Hours; 0..23
                        G: function () {
                            return jsdate.getHours();
                        },

                        // 12-Hours w/leading 0; 01..12
                        h: function () {
                            return humanize.pad(f.g(), 2, '0');
                        },

                        // 24-Hours w/leading 0; 00..23
                        H: function () {
                            return humanize.pad(f.G(), 2, '0');
                        },

                        // Minutes w/leading 0; 00..59
                        i: function () {
                            return humanize.pad(jsdate.getMinutes(), 2, '0');
                        },

                        // Seconds w/leading 0; 00..59
                        s: function () {
                            return humanize.pad(jsdate.getSeconds(), 2, '0');
                        },

                        // Microseconds; 000000-999000
                        u: function () {
                            return humanize.pad(jsdate.getMilliseconds() * 1000, 6, '0');
                        },

                        // Whether or not the date is in daylight savings time
                        /*
      I: function () {
        // Compares Jan 1 minus Jan 1 UTC to Jul 1 minus Jul 1 UTC.
        // If they are not equal, then DST is observed.
        var Y = f.Y();
        return 0 + ((new Date(Y, 0) - Date.UTC(Y, 0)) !== (new Date(Y, 6) - Date.UTC(Y, 6)));
      },
      */

                        // Difference to GMT in hour format; e.g. +0200
                        O: function () {
                            var tzo = jsdate.getTimezoneOffset();
                            var tzoNum = Math.abs(tzo);
                            return (tzo > 0 ? '-' : '+') + humanize.pad(Math.floor(tzoNum / 60) * 100 + tzoNum % 60, 4, '0');
                        },

                        // Difference to GMT w/colon; e.g. +02:00
                        P: function () {
                            var O = f.O();
                            return (O.substr(0, 3) + ':' + O.substr(3, 2));
                        },

                        // Timezone offset in seconds (-43200..50400)
                        Z: function () {
                            return -jsdate.getTimezoneOffset() * 60;
                        },

                        // Full Date/Time, ISO-8601 date
                        c: function () {
                            return 'Y-m-d\\TH:i:sP'.replace(formatChr, formatChrCb);
                        },

                        // RFC 2822
                        r: function () {
                            return 'D, d M Y H:i:s O'.replace(formatChr, formatChrCb);
                        },

                        // Seconds since UNIX epoch
                        U: function () {
                            return jsdate.getTime() / 1000 || 0;
                        }
                    };

                    return format.replace(formatChr, formatChrCb);
                };


                /**
                 * format number by adding thousands separaters and significant digits while rounding
                 */
                humanize.numberFormat = function (number, decimals, decPoint, thousandsSep) {
                    decimals = isNaN(decimals) ? 2 : Math.abs(decimals);
                    decPoint = (decPoint === undefined) ? '.' : decPoint;
                    thousandsSep = (thousandsSep === undefined) ? ',' : thousandsSep;

                    var sign = number < 0 ? '-' : '';
                    number = Math.abs(+number || 0);

                    var intPart = parseInt(number.toFixed(decimals), 10) + '';
                    var j = intPart.length > 3 ? intPart.length % 3 : 0;

                    return sign + (j ? intPart.substr(0, j) + thousandsSep : '') + intPart.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thousandsSep) + (decimals ? decPoint + Math.abs(number - intPart).toFixed(decimals).slice(2) : '');
                };


                /**
                 * For dates that are the current day or within one day, return 'today', 'tomorrow' or 'yesterday', as appropriate.
                 * Otherwise, format the date using the passed in format string.
                 *
                 * Examples (when 'today' is 17 Feb 2007):
                 * 16 Feb 2007 becomes yesterday.
                 * 17 Feb 2007 becomes today.
                 * 18 Feb 2007 becomes tomorrow.
                 * Any other day is formatted according to given argument or the DATE_FORMAT setting if no argument is given.
                 */
                humanize.naturalDay = function (timestamp, format) {
                    timestamp = (timestamp === undefined) ? humanize.time() : timestamp;
                    format = (format === undefined) ? 'Y-m-d' : format;

                    var oneDay = 86400;
                    var d = new Date();
                    var today = (new Date(d.getFullYear(), d.getMonth(), d.getDate())).getTime() / 1000;

                    if (timestamp < today && timestamp >= today - oneDay) {
                        return 'yesterday';
                    } else if (timestamp >= today && timestamp < today + oneDay) {
                        return 'today';
                    } else if (timestamp >= today + oneDay && timestamp < today + 2 * oneDay) {
                        return 'tomorrow';
                    }

                    return humanize.date(format, timestamp);
                };

                /**
                 * returns a string representing how many seconds, minutes or hours ago it was or will be in the future
                 * Will always return a relative time, most granular of seconds to least granular of years. See unit tests for more details
                 */
                humanize.relativeTime = function (timestamp) {
                    timestamp = (timestamp === undefined) ? humanize.time() : timestamp;

                    var currTime = humanize.time();
                    var timeDiff = currTime - timestamp;

                    // within 2 seconds
                    if (timeDiff < 2 && timeDiff > -2) {
                        return (timeDiff >= 0 ? 'just ' : '') + 'now';
                    }

                    // within a minute
                    if (timeDiff < 60 && timeDiff > -60) {
                        return (timeDiff >= 0 ? Math.floor(timeDiff) + ' seconds ago' : 'in ' + Math.floor(-timeDiff) + ' seconds');
                    }

                    // within 2 minutes
                    if (timeDiff < 120 && timeDiff > -120) {
                        return (timeDiff >= 0 ? 'about a minute ago' : 'in about a minute');
                    }

                    // within an hour
                    if (timeDiff < 3600 && timeDiff > -3600) {
                        return (timeDiff >= 0 ? Math.floor(timeDiff / 60) + ' minutes ago' : 'in ' + Math.floor(-timeDiff / 60) + ' minutes');
                    }

                    // within 2 hours
                    if (timeDiff < 7200 && timeDiff > -7200) {
                        return (timeDiff >= 0 ? 'about an hour ago' : 'in about an hour');
                    }

                    // within 24 hours
                    if (timeDiff < 86400 && timeDiff > -86400) {
                        return (timeDiff >= 0 ? Math.floor(timeDiff / 3600) + ' hours ago' : 'in ' + Math.floor(-timeDiff / 3600) + ' hours');
                    }

                    // within 2 days
                    var days2 = 2 * 86400;
                    if (timeDiff < days2 && timeDiff > -days2) {
                        return (timeDiff >= 0 ? '1 day ago' : 'in 1 day');
                    }

                    // within 29 days
                    var days29 = 29 * 86400;
                    if (timeDiff < days29 && timeDiff > -days29) {
                        return (timeDiff >= 0 ? Math.floor(timeDiff / 86400) + ' days ago' : 'in ' + Math.floor(-timeDiff / 86400) + ' days');
                    }

                    // within 60 days
                    var days60 = 60 * 86400;
                    if (timeDiff < days60 && timeDiff > -days60) {
                        return (timeDiff >= 0 ? 'about a month ago' : 'in about a month');
                    }

                    var currTimeYears = parseInt(humanize.date('Y', currTime), 10);
                    var timestampYears = parseInt(humanize.date('Y', timestamp), 10);
                    var currTimeMonths = currTimeYears * 12 + parseInt(humanize.date('n', currTime), 10);
                    var timestampMonths = timestampYears * 12 + parseInt(humanize.date('n', timestamp), 10);

                    // within a year
                    var monthDiff = currTimeMonths - timestampMonths;
                    if (monthDiff < 12 && monthDiff > -12) {
                        return (monthDiff >= 0 ? monthDiff + ' months ago' : 'in ' + (-monthDiff) + ' months');
                    }

                    var yearDiff = currTimeYears - timestampYears;
                    if (yearDiff < 2 && yearDiff > -2) {
                        return (yearDiff >= 0 ? 'a year ago' : 'in a year');
                    }

                    return (yearDiff >= 0 ? yearDiff + ' years ago' : 'in ' + (-yearDiff) + ' years');
                };

                /**
                 * Converts an integer to its ordinal as a string.
                 *
                 * 1 becomes 1st
                 * 2 becomes 2nd
                 * 3 becomes 3rd etc
                 */
                humanize.ordinal = function (number) {
                    number = parseInt(number, 10);
                    number = isNaN(number) ? 0 : number;
                    var sign = number < 0 ? '-' : '';
                    number = Math.abs(number);
                    var tens = number % 100;

                    return sign + number + (tens > 4 && tens < 21 ? 'th' : {
                        1: 'st',
                        2: 'nd',
                        3: 'rd'
                    }[number % 10] || 'th');
                };

                /**
                 * Formats the value like a 'human-readable' file size (i.e. '13 KB', '4.1 MB', '102 bytes', etc).
                 *
                 * For example:
                 * If value is 123456789, the output would be 117.7 MB.
                 */
                humanize.filesize = function (filesize, kilo, decimals, decPoint, thousandsSep, suffixSep) {
                    kilo = (kilo === undefined) ? 1024 : kilo;
                    if (filesize <= 0) {
                        return '0 bytes';
                    }
                    if (filesize < kilo && decimals === undefined) {
                        decimals = 0;
                    }
                    if (suffixSep === undefined) {
                        suffixSep = ' ';
                    }
                    return humanize.intword(filesize, ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'], kilo, decimals, decPoint, thousandsSep, suffixSep);
                };

                /**
                 * Formats the value like a 'human-readable' number (i.e. '13 K', '4.1 M', '102', etc).
                 *
                 * For example:
                 * If value is 123456789, the output would be 117.7 M.
                 */
                humanize.intword = function (number, units, kilo, decimals, decPoint, thousandsSep, suffixSep) {
                    var humanized, unit;

                    units = units || ['', 'K', 'M', 'B', 'T'],
                    unit = units.length - 1,
                    kilo = kilo || 1000,
                    decimals = isNaN(decimals) ? 2 : Math.abs(decimals),
                    decPoint = decPoint || '.',
                    thousandsSep = thousandsSep || ',',
                    suffixSep = suffixSep || '';

                    for (var i = 0; i < units.length; i++) {
                        if (number < Math.pow(kilo, i + 1)) {
                            unit = i;
                            break;
                        }
                    }
                    humanized = number / Math.pow(kilo, unit);

                    var suffix = units[unit] ? suffixSep + units[unit] : '';
                    return humanize.numberFormat(humanized, decimals, decPoint, thousandsSep) + suffix;
                };

                /**
                 * Replaces line breaks in plain text with appropriate HTML
                 * A single newline becomes an HTML line break (<br />) and a new line followed by a blank line becomes a paragraph break (</p>).
                 *
                 * For example:
                 * If value is Joel\nis a\n\nslug, the output will be <p>Joel<br />is a</p><p>slug</p>
                 */
                humanize.linebreaks = function (str) {
                    // remove beginning and ending newlines
                    str = str.replace(/^([\n|\r]*)/, '');
                    str = str.replace(/([\n|\r]*)$/, '');

                    // normalize all to \n
                    str = str.replace(/(\r\n|\n|\r)/g, "\n");

                    // any consecutive new lines more than 2 gets turned into p tags
                    str = str.replace(/(\n{2,})/g, '</p><p>');

                    // any that are singletons get turned into br
                    str = str.replace(/\n/g, '<br />');
                    return '<p>' + str + '</p>';
                };

                /**
                 * Converts all newlines in a piece of plain text to HTML line breaks (<br />).
                 */
                humanize.nl2br = function (str) {
                    return str.replace(/(\r\n|\n|\r)/g, '<br />');
                };

                /**
                 * Truncates a string if it is longer than the specified number of characters.
                 * Truncated strings will end with a translatable ellipsis sequence ('…').
                 */
                humanize.truncatechars = function (string, length) {
                    if (string.length <= length) {
                        return string;
                    }
                    return string.substr(0, length) + '…';
                };

                /**
                 * Truncates a string after a certain number of words.
                 * Newlines within the string will be removed.
                 */
                humanize.truncatewords = function (string, numWords) {
                    var words = string.split(' ');
                    if (words.length < numWords) {
                        return string;
                    }
                    return words.slice(0, numWords).join(' ') + '…';
                };

            }).call(this);

        }, {}
    ],
    16: [

        function (require, module, exports) {
            //     Underscore.js 1.7.0
            //     http://underscorejs.org
            //     (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
            //     Underscore may be freely distributed under the MIT license.

            (function () {

                // Baseline setup
                // --------------

                // Establish the root object, `window` in the browser, or `exports` on the server.
                var root = this;

                // Save the previous value of the `_` variable.
                var previousUnderscore = root._;

                // Save bytes in the minified (but not gzipped) version:
                var ArrayProto = Array.prototype,
                    ObjProto = Object.prototype,
                    FuncProto = Function.prototype;

                // Create quick reference variables for speed access to core prototypes.
                var
                    push = ArrayProto.push,
                    slice = ArrayProto.slice,
                    concat = ArrayProto.concat,
                    toString = ObjProto.toString,
                    hasOwnProperty = ObjProto.hasOwnProperty;

                // All **ECMAScript 5** native function implementations that we hope to use
                // are declared here.
                var
                    nativeIsArray = Array.isArray,
                    nativeKeys = Object.keys,
                    nativeBind = FuncProto.bind;

                // Create a safe reference to the Underscore object for use below.
                var _ = function (obj) {
                    if (obj instanceof _) return obj;
                    if (!(this instanceof _)) return new _(obj);
                    this._wrapped = obj;
                };

                // Export the Underscore object for **Node.js**, with
                // backwards-compatibility for the old `require()` API. If we're in
                // the browser, add `_` as a global object.
                if (typeof exports !== 'undefined') {
                    if (typeof module !== 'undefined' && module.exports) {
                        exports = module.exports = _;
                    }
                    exports._ = _;
                } else {
                    root._ = _;
                }

                // Current version.
                _.VERSION = '1.7.0';

                // Internal function that returns an efficient (for current engines) version
                // of the passed-in callback, to be repeatedly applied in other Underscore
                // functions.
                var createCallback = function (func, context, argCount) {
                    if (context === void 0) return func;
                    switch (argCount == null ? 3 : argCount) {
                    case 1:
                        return function (value) {
                            return func.call(context, value);
                        };
                    case 2:
                        return function (value, other) {
                            return func.call(context, value, other);
                        };
                    case 3:
                        return function (value, index, collection) {
                            return func.call(context, value, index, collection);
                        };
                    case 4:
                        return function (accumulator, value, index, collection) {
                            return func.call(context, accumulator, value, index, collection);
                        };
                    }
                    return function () {
                        return func.apply(context, arguments);
                    };
                };

                // A mostly-internal function to generate callbacks that can be applied
                // to each element in a collection, returning the desired result — either
                // identity, an arbitrary callback, a property matcher, or a property accessor.
                _.iteratee = function (value, context, argCount) {
                    if (value == null) return _.identity;
                    if (_.isFunction(value)) return createCallback(value, context, argCount);
                    if (_.isObject(value)) return _.matches(value);
                    return _.property(value);
                };

                // Collection Functions
                // --------------------

                // The cornerstone, an `each` implementation, aka `forEach`.
                // Handles raw objects in addition to array-likes. Treats all
                // sparse array-likes as if they were dense.
                _.each = _.forEach = function (obj, iteratee, context) {
                    if (obj == null) return obj;
                    iteratee = createCallback(iteratee, context);
                    var i, length = obj.length;
                    if (length === +length) {
                        for (i = 0; i < length; i++) {
                            iteratee(obj[i], i, obj);
                        }
                    } else {
                        var keys = _.keys(obj);
                        for (i = 0, length = keys.length; i < length; i++) {
                            iteratee(obj[keys[i]], keys[i], obj);
                        }
                    }
                    return obj;
                };

                // Return the results of applying the iteratee to each element.
                _.map = _.collect = function (obj, iteratee, context) {
                    if (obj == null) return [];
                    iteratee = _.iteratee(iteratee, context);
                    var keys = obj.length !== +obj.length && _.keys(obj),
                        length = (keys || obj).length,
                        results = Array(length),
                        currentKey;
                    for (var index = 0; index < length; index++) {
                        currentKey = keys ? keys[index] : index;
                        results[index] = iteratee(obj[currentKey], currentKey, obj);
                    }
                    return results;
                };

                var reduceError = 'Reduce of empty array with no initial value';

                // **Reduce** builds up a single result from a list of values, aka `inject`,
                // or `foldl`.
                _.reduce = _.foldl = _.inject = function (obj, iteratee, memo, context) {
                    if (obj == null) obj = [];
                    iteratee = createCallback(iteratee, context, 4);
                    var keys = obj.length !== +obj.length && _.keys(obj),
                        length = (keys || obj).length,
                        index = 0,
                        currentKey;
                    if (arguments.length < 3) {
                        if (!length) throw new TypeError(reduceError);
                        memo = obj[keys ? keys[index++] : index++];
                    }
                    for (; index < length; index++) {
                        currentKey = keys ? keys[index] : index;
                        memo = iteratee(memo, obj[currentKey], currentKey, obj);
                    }
                    return memo;
                };

                // The right-associative version of reduce, also known as `foldr`.
                _.reduceRight = _.foldr = function (obj, iteratee, memo, context) {
                    if (obj == null) obj = [];
                    iteratee = createCallback(iteratee, context, 4);
                    var keys = obj.length !== +obj.length && _.keys(obj),
                        index = (keys || obj).length,
                        currentKey;
                    if (arguments.length < 3) {
                        if (!index) throw new TypeError(reduceError);
                        memo = obj[keys ? keys[--index] : --index];
                    }
                    while (index--) {
                        currentKey = keys ? keys[index] : index;
                        memo = iteratee(memo, obj[currentKey], currentKey, obj);
                    }
                    return memo;
                };

                // Return the first value which passes a truth test. Aliased as `detect`.
                _.find = _.detect = function (obj, predicate, context) {
                    var result;
                    predicate = _.iteratee(predicate, context);
                    _.some(obj, function (value, index, list) {
                        if (predicate(value, index, list)) {
                            result = value;
                            return true;
                        }
                    });
                    return result;
                };

                // Return all the elements that pass a truth test.
                // Aliased as `select`.
                _.filter = _.select = function (obj, predicate, context) {
                    var results = [];
                    if (obj == null) return results;
                    predicate = _.iteratee(predicate, context);
                    _.each(obj, function (value, index, list) {
                        if (predicate(value, index, list)) results.push(value);
                    });
                    return results;
                };

                // Return all the elements for which a truth test fails.
                _.reject = function (obj, predicate, context) {
                    return _.filter(obj, _.negate(_.iteratee(predicate)), context);
                };

                // Determine whether all of the elements match a truth test.
                // Aliased as `all`.
                _.every = _.all = function (obj, predicate, context) {
                    if (obj == null) return true;
                    predicate = _.iteratee(predicate, context);
                    var keys = obj.length !== +obj.length && _.keys(obj),
                        length = (keys || obj).length,
                        index, currentKey;
                    for (index = 0; index < length; index++) {
                        currentKey = keys ? keys[index] : index;
                        if (!predicate(obj[currentKey], currentKey, obj)) return false;
                    }
                    return true;
                };

                // Determine if at least one element in the object matches a truth test.
                // Aliased as `any`.
                _.some = _.any = function (obj, predicate, context) {
                    if (obj == null) return false;
                    predicate = _.iteratee(predicate, context);
                    var keys = obj.length !== +obj.length && _.keys(obj),
                        length = (keys || obj).length,
                        index, currentKey;
                    for (index = 0; index < length; index++) {
                        currentKey = keys ? keys[index] : index;
                        if (predicate(obj[currentKey], currentKey, obj)) return true;
                    }
                    return false;
                };

                // Determine if the array or object contains a given value (using `===`).
                // Aliased as `include`.
                _.contains = _.include = function (obj, target) {
                    if (obj == null) return false;
                    if (obj.length !== +obj.length) obj = _.values(obj);
                    return _.indexOf(obj, target) >= 0;
                };

                // Invoke a method (with arguments) on every item in a collection.
                _.invoke = function (obj, method) {
                    var args = slice.call(arguments, 2);
                    var isFunc = _.isFunction(method);
                    return _.map(obj, function (value) {
                        return (isFunc ? method : value[method]).apply(value, args);
                    });
                };

                // Convenience version of a common use case of `map`: fetching a property.
                _.pluck = function (obj, key) {
                    return _.map(obj, _.property(key));
                };

                // Convenience version of a common use case of `filter`: selecting only objects
                // containing specific `key:value` pairs.
                _.where = function (obj, attrs) {
                    return _.filter(obj, _.matches(attrs));
                };

                // Convenience version of a common use case of `find`: getting the first object
                // containing specific `key:value` pairs.
                _.findWhere = function (obj, attrs) {
                    return _.find(obj, _.matches(attrs));
                };

                // Return the maximum element (or element-based computation).
                _.max = function (obj, iteratee, context) {
                    var result = -Infinity,
                        lastComputed = -Infinity,
                        value, computed;
                    if (iteratee == null && obj != null) {
                        obj = obj.length === +obj.length ? obj : _.values(obj);
                        for (var i = 0, length = obj.length; i < length; i++) {
                            value = obj[i];
                            if (value > result) {
                                result = value;
                            }
                        }
                    } else {
                        iteratee = _.iteratee(iteratee, context);
                        _.each(obj, function (value, index, list) {
                            computed = iteratee(value, index, list);
                            if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
                                result = value;
                                lastComputed = computed;
                            }
                        });
                    }
                    return result;
                };

                // Return the minimum element (or element-based computation).
                _.min = function (obj, iteratee, context) {
                    var result = Infinity,
                        lastComputed = Infinity,
                        value, computed;
                    if (iteratee == null && obj != null) {
                        obj = obj.length === +obj.length ? obj : _.values(obj);
                        for (var i = 0, length = obj.length; i < length; i++) {
                            value = obj[i];
                            if (value < result) {
                                result = value;
                            }
                        }
                    } else {
                        iteratee = _.iteratee(iteratee, context);
                        _.each(obj, function (value, index, list) {
                            computed = iteratee(value, index, list);
                            if (computed < lastComputed || computed === Infinity && result === Infinity) {
                                result = value;
                                lastComputed = computed;
                            }
                        });
                    }
                    return result;
                };

                // Shuffle a collection, using the modern version of the
                // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
                _.shuffle = function (obj) {
                    var set = obj && obj.length === +obj.length ? obj : _.values(obj);
                    var length = set.length;
                    var shuffled = Array(length);
                    for (var index = 0, rand; index < length; index++) {
                        rand = _.random(0, index);
                        if (rand !== index) shuffled[index] = shuffled[rand];
                        shuffled[rand] = set [index];
                    }
                    return shuffled;
                };

                // Sample **n** random values from a collection.
                // If **n** is not specified, returns a single random element.
                // The internal `guard` argument allows it to work with `map`.
                _.sample = function (obj, n, guard) {
                    if (n == null || guard) {
                        if (obj.length !== +obj.length) obj = _.values(obj);
                        return obj[_.random(obj.length - 1)];
                    }
                    return _.shuffle(obj).slice(0, Math.max(0, n));
                };

                // Sort the object's values by a criterion produced by an iteratee.
                _.sortBy = function (obj, iteratee, context) {
                    iteratee = _.iteratee(iteratee, context);
                    return _.pluck(_.map(obj, function (value, index, list) {
                        return {
                            value: value,
                            index: index,
                            criteria: iteratee(value, index, list)
                        };
                    }).sort(function (left, right) {
                        var a = left.criteria;
                        var b = right.criteria;
                        if (a !== b) {
                            if (a > b || a === void 0) return 1;
                            if (a < b || b === void 0) return -1;
                        }
                        return left.index - right.index;
                    }), 'value');
                };

                // An internal function used for aggregate "group by" operations.
                var group = function (behavior) {
                    return function (obj, iteratee, context) {
                        var result = {};
                        iteratee = _.iteratee(iteratee, context);
                        _.each(obj, function (value, index) {
                            var key = iteratee(value, index, obj);
                            behavior(result, value, key);
                        });
                        return result;
                    };
                };

                // Groups the object's values by a criterion. Pass either a string attribute
                // to group by, or a function that returns the criterion.
                _.groupBy = group(function (result, value, key) {
                    if (_.has(result, key)) result[key].push(value);
                    else result[key] = [value];
                });

                // Indexes the object's values by a criterion, similar to `groupBy`, but for
                // when you know that your index values will be unique.
                _.indexBy = group(function (result, value, key) {
                    result[key] = value;
                });

                // Counts instances of an object that group by a certain criterion. Pass
                // either a string attribute to count by, or a function that returns the
                // criterion.
                _.countBy = group(function (result, value, key) {
                    if (_.has(result, key)) result[key]++;
                    else result[key] = 1;
                });

                // Use a comparator function to figure out the smallest index at which
                // an object should be inserted so as to maintain order. Uses binary search.
                _.sortedIndex = function (array, obj, iteratee, context) {
                    iteratee = _.iteratee(iteratee, context, 1);
                    var value = iteratee(obj);
                    var low = 0,
                        high = array.length;
                    while (low < high) {
                        var mid = low + high >>> 1;
                        if (iteratee(array[mid]) < value) low = mid + 1;
                        else high = mid;
                    }
                    return low;
                };

                // Safely create a real, live array from anything iterable.
                _.toArray = function (obj) {
                    if (!obj) return [];
                    if (_.isArray(obj)) return slice.call(obj);
                    if (obj.length === +obj.length) return _.map(obj, _.identity);
                    return _.values(obj);
                };

                // Return the number of elements in an object.
                _.size = function (obj) {
                    if (obj == null) return 0;
                    return obj.length === +obj.length ? obj.length : _.keys(obj).length;
                };

                // Split a collection into two arrays: one whose elements all satisfy the given
                // predicate, and one whose elements all do not satisfy the predicate.
                _.partition = function (obj, predicate, context) {
                    predicate = _.iteratee(predicate, context);
                    var pass = [],
                        fail = [];
                    _.each(obj, function (value, key, obj) {
                        (predicate(value, key, obj) ? pass : fail).push(value);
                    });
                    return [pass, fail];
                };

                // Array Functions
                // ---------------

                // Get the first element of an array. Passing **n** will return the first N
                // values in the array. Aliased as `head` and `take`. The **guard** check
                // allows it to work with `_.map`.
                _.first = _.head = _.take = function (array, n, guard) {
                    if (array == null) return void 0;
                    if (n == null || guard) return array[0];
                    if (n < 0) return [];
                    return slice.call(array, 0, n);
                };

                // Returns everything but the last entry of the array. Especially useful on
                // the arguments object. Passing **n** will return all the values in
                // the array, excluding the last N. The **guard** check allows it to work with
                // `_.map`.
                _.initial = function (array, n, guard) {
                    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
                };

                // Get the last element of an array. Passing **n** will return the last N
                // values in the array. The **guard** check allows it to work with `_.map`.
                _.last = function (array, n, guard) {
                    if (array == null) return void 0;
                    if (n == null || guard) return array[array.length - 1];
                    return slice.call(array, Math.max(array.length - n, 0));
                };

                // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
                // Especially useful on the arguments object. Passing an **n** will return
                // the rest N values in the array. The **guard**
                // check allows it to work with `_.map`.
                _.rest = _.tail = _.drop = function (array, n, guard) {
                    return slice.call(array, n == null || guard ? 1 : n);
                };

                // Trim out all falsy values from an array.
                _.compact = function (array) {
                    return _.filter(array, _.identity);
                };

                // Internal implementation of a recursive `flatten` function.
                var flatten = function (input, shallow, strict, output) {
                    if (shallow && _.every(input, _.isArray)) {
                        return concat.apply(output, input);
                    }
                    for (var i = 0, length = input.length; i < length; i++) {
                        var value = input[i];
                        if (!_.isArray(value) && !_.isArguments(value)) {
                            if (!strict) output.push(value);
                        } else if (shallow) {
                            push.apply(output, value);
                        } else {
                            flatten(value, shallow, strict, output);
                        }
                    }
                    return output;
                };

                // Flatten out an array, either recursively (by default), or just one level.
                _.flatten = function (array, shallow) {
                    return flatten(array, shallow, false, []);
                };

                // Return a version of the array that does not contain the specified value(s).
                _.without = function (array) {
                    return _.difference(array, slice.call(arguments, 1));
                };

                // Produce a duplicate-free version of the array. If the array has already
                // been sorted, you have the option of using a faster algorithm.
                // Aliased as `unique`.
                _.uniq = _.unique = function (array, isSorted, iteratee, context) {
                    if (array == null) return [];
                    if (!_.isBoolean(isSorted)) {
                        context = iteratee;
                        iteratee = isSorted;
                        isSorted = false;
                    }
                    if (iteratee != null) iteratee = _.iteratee(iteratee, context);
                    var result = [];
                    var seen = [];
                    for (var i = 0, length = array.length; i < length; i++) {
                        var value = array[i];
                        if (isSorted) {
                            if (!i || seen !== value) result.push(value);
                            seen = value;
                        } else if (iteratee) {
                            var computed = iteratee(value, i, array);
                            if (_.indexOf(seen, computed) < 0) {
                                seen.push(computed);
                                result.push(value);
                            }
                        } else if (_.indexOf(result, value) < 0) {
                            result.push(value);
                        }
                    }
                    return result;
                };

                // Produce an array that contains the union: each distinct element from all of
                // the passed-in arrays.
                _.union = function () {
                    return _.uniq(flatten(arguments, true, true, []));
                };

                // Produce an array that contains every item shared between all the
                // passed-in arrays.
                _.intersection = function (array) {
                    if (array == null) return [];
                    var result = [];
                    var argsLength = arguments.length;
                    for (var i = 0, length = array.length; i < length; i++) {
                        var item = array[i];
                        if (_.contains(result, item)) continue;
                        for (var j = 1; j < argsLength; j++) {
                            if (!_.contains(arguments[j], item)) break;
                        }
                        if (j === argsLength) result.push(item);
                    }
                    return result;
                };

                // Take the difference between one array and a number of other arrays.
                // Only the elements present in just the first array will remain.
                _.difference = function (array) {
                    var rest = flatten(slice.call(arguments, 1), true, true, []);
                    return _.filter(array, function (value) {
                        return !_.contains(rest, value);
                    });
                };

                // Zip together multiple lists into a single array -- elements that share
                // an index go together.
                _.zip = function (array) {
                    if (array == null) return [];
                    var length = _.max(arguments, 'length').length;
                    var results = Array(length);
                    for (var i = 0; i < length; i++) {
                        results[i] = _.pluck(arguments, i);
                    }
                    return results;
                };

                // Converts lists into objects. Pass either a single array of `[key, value]`
                // pairs, or two parallel arrays of the same length -- one of keys, and one of
                // the corresponding values.
                _.object = function (list, values) {
                    if (list == null) return {};
                    var result = {};
                    for (var i = 0, length = list.length; i < length; i++) {
                        if (values) {
                            result[list[i]] = values[i];
                        } else {
                            result[list[i][0]] = list[i][1];
                        }
                    }
                    return result;
                };

                // Return the position of the first occurrence of an item in an array,
                // or -1 if the item is not included in the array.
                // If the array is large and already in sort order, pass `true`
                // for **isSorted** to use binary search.
                _.indexOf = function (array, item, isSorted) {
                    if (array == null) return -1;
                    var i = 0,
                        length = array.length;
                    if (isSorted) {
                        if (typeof isSorted == 'number') {
                            i = isSorted < 0 ? Math.max(0, length + isSorted) : isSorted;
                        } else {
                            i = _.sortedIndex(array, item);
                            return array[i] === item ? i : -1;
                        }
                    }
                    for (; i < length; i++)
                        if (array[i] === item) return i;
                    return -1;
                };

                _.lastIndexOf = function (array, item, from) {
                    if (array == null) return -1;
                    var idx = array.length;
                    if (typeof from == 'number') {
                        idx = from < 0 ? idx + from + 1 : Math.min(idx, from + 1);
                    }
                    while (--idx >= 0)
                        if (array[idx] === item) return idx;
                    return -1;
                };

                // Generate an integer Array containing an arithmetic progression. A port of
                // the native Python `range()` function. See
                // [the Python documentation](http://docs.python.org/library/functions.html#range).
                _.range = function (start, stop, step) {
                    if (arguments.length <= 1) {
                        stop = start || 0;
                        start = 0;
                    }
                    step = step || 1;

                    var length = Math.max(Math.ceil((stop - start) / step), 0);
                    var range = Array(length);

                    for (var idx = 0; idx < length; idx++, start += step) {
                        range[idx] = start;
                    }

                    return range;
                };

                // Function (ahem) Functions
                // ------------------

                // Reusable constructor function for prototype setting.
                var Ctor = function () {};

                // Create a function bound to a given object (assigning `this`, and arguments,
                // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
                // available.
                _.bind = function (func, context) {
                    var args, bound;
                    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
                    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
                    args = slice.call(arguments, 2);
                    bound = function () {
                        if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
                        Ctor.prototype = func.prototype;
                        var self = new Ctor;
                        Ctor.prototype = null;
                        var result = func.apply(self, args.concat(slice.call(arguments)));
                        if (_.isObject(result)) return result;
                        return self;
                    };
                    return bound;
                };

                // Partially apply a function by creating a version that has had some of its
                // arguments pre-filled, without changing its dynamic `this` context. _ acts
                // as a placeholder, allowing any combination of arguments to be pre-filled.
                _.partial = function (func) {
                    var boundArgs = slice.call(arguments, 1);
                    return function () {
                        var position = 0;
                        var args = boundArgs.slice();
                        for (var i = 0, length = args.length; i < length; i++) {
                            if (args[i] === _) args[i] = arguments[position++];
                        }
                        while (position < arguments.length) args.push(arguments[position++]);
                        return func.apply(this, args);
                    };
                };

                // Bind a number of an object's methods to that object. Remaining arguments
                // are the method names to be bound. Useful for ensuring that all callbacks
                // defined on an object belong to it.
                _.bindAll = function (obj) {
                    var i, length = arguments.length,
                        key;
                    if (length <= 1) throw new Error('bindAll must be passed function names');
                    for (i = 1; i < length; i++) {
                        key = arguments[i];
                        obj[key] = _.bind(obj[key], obj);
                    }
                    return obj;
                };

                // Memoize an expensive function by storing its results.
                _.memoize = function (func, hasher) {
                    var memoize = function (key) {
                        var cache = memoize.cache;
                        var address = hasher ? hasher.apply(this, arguments) : key;
                        if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
                        return cache[address];
                    };
                    memoize.cache = {};
                    return memoize;
                };

                // Delays a function for the given number of milliseconds, and then calls
                // it with the arguments supplied.
                _.delay = function (func, wait) {
                    var args = slice.call(arguments, 2);
                    return setTimeout(function () {
                        return func.apply(null, args);
                    }, wait);
                };

                // Defers a function, scheduling it to run after the current call stack has
                // cleared.
                _.defer = function (func) {
                    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
                };

                // Returns a function, that, when invoked, will only be triggered at most once
                // during a given window of time. Normally, the throttled function will run
                // as much as it can, without ever going more than once per `wait` duration;
                // but if you'd like to disable the execution on the leading edge, pass
                // `{leading: false}`. To disable execution on the trailing edge, ditto.
                _.throttle = function (func, wait, options) {
                    var context, args, result;
                    var timeout = null;
                    var previous = 0;
                    if (!options) options = {};
                    var later = function () {
                        previous = options.leading === false ? 0 : _.now();
                        timeout = null;
                        result = func.apply(context, args);
                        if (!timeout) context = args = null;
                    };
                    return function () {
                        var now = _.now();
                        if (!previous && options.leading === false) previous = now;
                        var remaining = wait - (now - previous);
                        context = this;
                        args = arguments;
                        if (remaining <= 0 || remaining > wait) {
                            clearTimeout(timeout);
                            timeout = null;
                            previous = now;
                            result = func.apply(context, args);
                            if (!timeout) context = args = null;
                        } else if (!timeout && options.trailing !== false) {
                            timeout = setTimeout(later, remaining);
                        }
                        return result;
                    };
                };

                // Returns a function, that, as long as it continues to be invoked, will not
                // be triggered. The function will be called after it stops being called for
                // N milliseconds. If `immediate` is passed, trigger the function on the
                // leading edge, instead of the trailing.
                _.debounce = function (func, wait, immediate) {
                    var timeout, args, context, timestamp, result;

                    var later = function () {
                        var last = _.now() - timestamp;

                        if (last < wait && last > 0) {
                            timeout = setTimeout(later, wait - last);
                        } else {
                            timeout = null;
                            if (!immediate) {
                                result = func.apply(context, args);
                                if (!timeout) context = args = null;
                            }
                        }
                    };

                    return function () {
                        context = this;
                        args = arguments;
                        timestamp = _.now();
                        var callNow = immediate && !timeout;
                        if (!timeout) timeout = setTimeout(later, wait);
                        if (callNow) {
                            result = func.apply(context, args);
                            context = args = null;
                        }

                        return result;
                    };
                };

                // Returns the first function passed as an argument to the second,
                // allowing you to adjust arguments, run code before and after, and
                // conditionally execute the original function.
                _.wrap = function (func, wrapper) {
                    return _.partial(wrapper, func);
                };

                // Returns a negated version of the passed-in predicate.
                _.negate = function (predicate) {
                    return function () {
                        return !predicate.apply(this, arguments);
                    };
                };

                // Returns a function that is the composition of a list of functions, each
                // consuming the return value of the function that follows.
                _.compose = function () {
                    var args = arguments;
                    var start = args.length - 1;
                    return function () {
                        var i = start;
                        var result = args[start].apply(this, arguments);
                        while (i--) result = args[i].call(this, result);
                        return result;
                    };
                };

                // Returns a function that will only be executed after being called N times.
                _.after = function (times, func) {
                    return function () {
                        if (--times < 1) {
                            return func.apply(this, arguments);
                        }
                    };
                };

                // Returns a function that will only be executed before being called N times.
                _.before = function (times, func) {
                    var memo;
                    return function () {
                        if (--times > 0) {
                            memo = func.apply(this, arguments);
                        } else {
                            func = null;
                        }
                        return memo;
                    };
                };

                // Returns a function that will be executed at most one time, no matter how
                // often you call it. Useful for lazy initialization.
                _.once = _.partial(_.before, 2);

                // Object Functions
                // ----------------

                // Retrieve the names of an object's properties.
                // Delegates to **ECMAScript 5**'s native `Object.keys`
                _.keys = function (obj) {
                    if (!_.isObject(obj)) return [];
                    if (nativeKeys) return nativeKeys(obj);
                    var keys = [];
                    for (var key in obj)
                        if (_.has(obj, key)) keys.push(key);
                    return keys;
                };

                // Retrieve the values of an object's properties.
                _.values = function (obj) {
                    var keys = _.keys(obj);
                    var length = keys.length;
                    var values = Array(length);
                    for (var i = 0; i < length; i++) {
                        values[i] = obj[keys[i]];
                    }
                    return values;
                };

                // Convert an object into a list of `[key, value]` pairs.
                _.pairs = function (obj) {
                    var keys = _.keys(obj);
                    var length = keys.length;
                    var pairs = Array(length);
                    for (var i = 0; i < length; i++) {
                        pairs[i] = [keys[i], obj[keys[i]]];
                    }
                    return pairs;
                };

                // Invert the keys and values of an object. The values must be serializable.
                _.invert = function (obj) {
                    var result = {};
                    var keys = _.keys(obj);
                    for (var i = 0, length = keys.length; i < length; i++) {
                        result[obj[keys[i]]] = keys[i];
                    }
                    return result;
                };

                // Return a sorted list of the function names available on the object.
                // Aliased as `methods`
                _.functions = _.methods = function (obj) {
                    var names = [];
                    for (var key in obj) {
                        if (_.isFunction(obj[key])) names.push(key);
                    }
                    return names.sort();
                };

                // Extend a given object with all the properties in passed-in object(s).
                _.extend = function (obj) {
                    if (!_.isObject(obj)) return obj;
                    var source, prop;
                    for (var i = 1, length = arguments.length; i < length; i++) {
                        source = arguments[i];
                        for (prop in source) {
                            if (hasOwnProperty.call(source, prop)) {
                                obj[prop] = source[prop];
                            }
                        }
                    }
                    return obj;
                };

                // Return a copy of the object only containing the whitelisted properties.
                _.pick = function (obj, iteratee, context) {
                    var result = {},
                        key;
                    if (obj == null) return result;
                    if (_.isFunction(iteratee)) {
                        iteratee = createCallback(iteratee, context);
                        for (key in obj) {
                            var value = obj[key];
                            if (iteratee(value, key, obj)) result[key] = value;
                        }
                    } else {
                        var keys = concat.apply([], slice.call(arguments, 1));
                        obj = new Object(obj);
                        for (var i = 0, length = keys.length; i < length; i++) {
                            key = keys[i];
                            if (key in obj) result[key] = obj[key];
                        }
                    }
                    return result;
                };

                // Return a copy of the object without the blacklisted properties.
                _.omit = function (obj, iteratee, context) {
                    if (_.isFunction(iteratee)) {
                        iteratee = _.negate(iteratee);
                    } else {
                        var keys = _.map(concat.apply([], slice.call(arguments, 1)), String);
                        iteratee = function (value, key) {
                            return !_.contains(keys, key);
                        };
                    }
                    return _.pick(obj, iteratee, context);
                };

                // Fill in a given object with default properties.
                _.defaults = function (obj) {
                    if (!_.isObject(obj)) return obj;
                    for (var i = 1, length = arguments.length; i < length; i++) {
                        var source = arguments[i];
                        for (var prop in source) {
                            if (obj[prop] === void 0) obj[prop] = source[prop];
                        }
                    }
                    return obj;
                };

                // Create a (shallow-cloned) duplicate of an object.
                _.clone = function (obj) {
                    if (!_.isObject(obj)) return obj;
                    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
                };

                // Invokes interceptor with the obj, and then returns obj.
                // The primary purpose of this method is to "tap into" a method chain, in
                // order to perform operations on intermediate results within the chain.
                _.tap = function (obj, interceptor) {
                    interceptor(obj);
                    return obj;
                };

                // Internal recursive comparison function for `isEqual`.
                var eq = function (a, b, aStack, bStack) {
                    // Identical objects are equal. `0 === -0`, but they aren't identical.
                    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
                    if (a === b) return a !== 0 || 1 / a === 1 / b;
                    // A strict comparison is necessary because `null == undefined`.
                    if (a == null || b == null) return a === b;
                    // Unwrap any wrapped objects.
                    if (a instanceof _) a = a._wrapped;
                    if (b instanceof _) b = b._wrapped;
                    // Compare `[[Class]]` names.
                    var className = toString.call(a);
                    if (className !== toString.call(b)) return false;
                    switch (className) {
                        // Strings, numbers, regular expressions, dates, and booleans are compared by value.
                    case '[object RegExp]':
                        // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
                    case '[object String]':
                        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
                        // equivalent to `new String("5")`.
                        return '' + a === '' + b;
                    case '[object Number]':
                        // `NaN`s are equivalent, but non-reflexive.
                        // Object(NaN) is equivalent to NaN
                        if (+a !== +a) return +b !== +b;
                        // An `egal` comparison is performed for other numeric values.
                        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
                    case '[object Date]':
                    case '[object Boolean]':
                        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
                        // millisecond representations. Note that invalid dates with millisecond representations
                        // of `NaN` are not equivalent.
                        return +a === +b;
                    }
                    if (typeof a != 'object' || typeof b != 'object') return false;
                    // Assume equality for cyclic structures. The algorithm for detecting cyclic
                    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
                    var length = aStack.length;
                    while (length--) {
                        // Linear search. Performance is inversely proportional to the number of
                        // unique nested structures.
                        if (aStack[length] === a) return bStack[length] === b;
                    }
                    // Objects with different constructors are not equivalent, but `Object`s
                    // from different frames are.
                    var aCtor = a.constructor,
                        bCtor = b.constructor;
                    if (
                        aCtor !== bCtor &&
                        // Handle Object.create(x) cases
                        'constructor' in a && 'constructor' in b &&
                        !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                            _.isFunction(bCtor) && bCtor instanceof bCtor)
                    ) {
                        return false;
                    }
                    // Add the first object to the stack of traversed objects.
                    aStack.push(a);
                    bStack.push(b);
                    var size, result;
                    // Recursively compare objects and arrays.
                    if (className === '[object Array]') {
                        // Compare array lengths to determine if a deep comparison is necessary.
                        size = a.length;
                        result = size === b.length;
                        if (result) {
                            // Deep compare the contents, ignoring non-numeric properties.
                            while (size--) {
                                if (!(result = eq(a[size], b[size], aStack, bStack))) break;
                            }
                        }
                    } else {
                        // Deep compare objects.
                        var keys = _.keys(a),
                            key;
                        size = keys.length;
                        // Ensure that both objects contain the same number of properties before comparing deep equality.
                        result = _.keys(b).length === size;
                        if (result) {
                            while (size--) {
                                // Deep compare each member
                                key = keys[size];
                                if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
                            }
                        }
                    }
                    // Remove the first object from the stack of traversed objects.
                    aStack.pop();
                    bStack.pop();
                    return result;
                };

                // Perform a deep comparison to check if two objects are equal.
                _.isEqual = function (a, b) {
                    return eq(a, b, [], []);
                };

                // Is a given array, string, or object empty?
                // An "empty" object has no enumerable own-properties.
                _.isEmpty = function (obj) {
                    if (obj == null) return true;
                    if (_.isArray(obj) || _.isString(obj) || _.isArguments(obj)) return obj.length === 0;
                    for (var key in obj)
                        if (_.has(obj, key)) return false;
                    return true;
                };

                // Is a given value a DOM element?
                _.isElement = function (obj) {
                    return !!(obj && obj.nodeType === 1);
                };

                // Is a given value an array?
                // Delegates to ECMA5's native Array.isArray
                _.isArray = nativeIsArray || function (obj) {
                    return toString.call(obj) === '[object Array]';
                };

                // Is a given variable an object?
                _.isObject = function (obj) {
                    var type = typeof obj;
                    return type === 'function' || type === 'object' && !!obj;
                };

                // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
                _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function (name) {
                    _['is' + name] = function (obj) {
                        return toString.call(obj) === '[object ' + name + ']';
                    };
                });

                // Define a fallback version of the method in browsers (ahem, IE), where
                // there isn't any inspectable "Arguments" type.
                if (!_.isArguments(arguments)) {
                    _.isArguments = function (obj) {
                        return _.has(obj, 'callee');
                    };
                }

                // Optimize `isFunction` if appropriate. Work around an IE 11 bug.
                if (typeof / . / !== 'function') {
                    _.isFunction = function (obj) {
                        return typeof obj == 'function' || false;
                    };
                }

                // Is a given object a finite number?
                _.isFinite = function (obj) {
                    return isFinite(obj) && !isNaN(parseFloat(obj));
                };

                // Is the given value `NaN`? (NaN is the only number which does not equal itself).
                _.isNaN = function (obj) {
                    return _.isNumber(obj) && obj !== +obj;
                };

                // Is a given value a boolean?
                _.isBoolean = function (obj) {
                    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
                };

                // Is a given value equal to null?
                _.isNull = function (obj) {
                    return obj === null;
                };

                // Is a given variable undefined?
                _.isUndefined = function (obj) {
                    return obj === void 0;
                };

                // Shortcut function for checking if an object has a given property directly
                // on itself (in other words, not on a prototype).
                _.has = function (obj, key) {
                    return obj != null && hasOwnProperty.call(obj, key);
                };

                // Utility Functions
                // -----------------

                // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
                // previous owner. Returns a reference to the Underscore object.
                _.noConflict = function () {
                    root._ = previousUnderscore;
                    return this;
                };

                // Keep the identity function around for default iteratees.
                _.identity = function (value) {
                    return value;
                };

                _.constant = function (value) {
                    return function () {
                        return value;
                    };
                };

                _.noop = function () {};

                _.property = function (key) {
                    return function (obj) {
                        return obj[key];
                    };
                };

                // Returns a predicate for checking whether an object has a given set of `key:value` pairs.
                _.matches = function (attrs) {
                    var pairs = _.pairs(attrs),
                        length = pairs.length;
                    return function (obj) {
                        if (obj == null) return !length;
                        obj = new Object(obj);
                        for (var i = 0; i < length; i++) {
                            var pair = pairs[i],
                                key = pair[0];
                            if (pair[1] !== obj[key] || !(key in obj)) return false;
                        }
                        return true;
                    };
                };

                // Run a function **n** times.
                _.times = function (n, iteratee, context) {
                    var accum = Array(Math.max(0, n));
                    iteratee = createCallback(iteratee, context, 1);
                    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
                    return accum;
                };

                // Return a random integer between min and max (inclusive).
                _.random = function (min, max) {
                    if (max == null) {
                        max = min;
                        min = 0;
                    }
                    return min + Math.floor(Math.random() * (max - min + 1));
                };

                // A (possibly faster) way to get the current timestamp as an integer.
                _.now = Date.now || function () {
                    return new Date().getTime();
                };

                // List of HTML entities for escaping.
                var escapeMap = {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#x27;',
                    '`': '&#x60;'
                };
                var unescapeMap = _.invert(escapeMap);

                // Functions for escaping and unescaping strings to/from HTML interpolation.
                var createEscaper = function (map) {
                    var escaper = function (match) {
                        return map[match];
                    };
                    // Regexes for identifying a key that needs to be escaped
                    var source = '(?:' + _.keys(map).join('|') + ')';
                    var testRegexp = RegExp(source);
                    var replaceRegexp = RegExp(source, 'g');
                    return function (string) {
                        string = string == null ? '' : '' + string;
                        return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
                    };
                };
                _.escape = createEscaper(escapeMap);
                _.unescape = createEscaper(unescapeMap);

                // If the value of the named `property` is a function then invoke it with the
                // `object` as context; otherwise, return it.
                _.result = function (object, property) {
                    if (object == null) return void 0;
                    var value = object[property];
                    return _.isFunction(value) ? object[property]() : value;
                };

                // Generate a unique integer id (unique within the entire client session).
                // Useful for temporary DOM ids.
                var idCounter = 0;
                _.uniqueId = function (prefix) {
                    var id = ++idCounter + '';
                    return prefix ? prefix + id : id;
                };

                // By default, Underscore uses ERB-style template delimiters, change the
                // following template settings to use alternative delimiters.
                _.templateSettings = {
                    evaluate: /<%([\s\S]+?)%>/g,
                    interpolate: /<%=([\s\S]+?)%>/g,
                    escape: /<%-([\s\S]+?)%>/g
                };

                // When customizing `templateSettings`, if you don't want to define an
                // interpolation, evaluation or escaping regex, we need one that is
                // guaranteed not to match.
                var noMatch = /(.)^/;

                // Certain characters need to be escaped so that they can be put into a
                // string literal.
                var escapes = {
                    "'": "'",
                    '\\': '\\',
                    '\r': 'r',
                    '\n': 'n',
                    '\u2028': 'u2028',
                    '\u2029': 'u2029'
                };

                var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

                var escapeChar = function (match) {
                    return '\\' + escapes[match];
                };

                // JavaScript micro-templating, similar to John Resig's implementation.
                // Underscore templating handles arbitrary delimiters, preserves whitespace,
                // and correctly escapes quotes within interpolated code.
                // NB: `oldSettings` only exists for backwards compatibility.
                _.template = function (text, settings, oldSettings) {
                    if (!settings && oldSettings) settings = oldSettings;
                    settings = _.defaults({}, settings, _.templateSettings);

                    // Combine delimiters into one regular expression via alternation.
                    var matcher = RegExp([
                        (settings.escape || noMatch).source, (settings.interpolate || noMatch).source, (settings.evaluate || noMatch).source
                    ].join('|') + '|$', 'g');

                    // Compile the template source, escaping string literals appropriately.
                    var index = 0;
                    var source = "__p+='";
                    text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
                        source += text.slice(index, offset).replace(escaper, escapeChar);
                        index = offset + match.length;

                        if (escape) {
                            source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
                        } else if (interpolate) {
                            source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
                        } else if (evaluate) {
                            source += "';\n" + evaluate + "\n__p+='";
                        }

                        // Adobe VMs need the match returned to produce the correct offest.
                        return match;
                    });
                    source += "';\n";

                    // If a variable is not specified, place data values in local scope.
                    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

                    source = "var __t,__p='',__j=Array.prototype.join," +
                        "print=function(){__p+=__j.call(arguments,'');};\n" +
                        source + 'return __p;\n';

                    try {
                        var render = new Function(settings.variable || 'obj', '_', source);
                    } catch (e) {
                        e.source = source;
                        throw e;
                    }

                    var template = function (data) {
                        return render.call(this, data, _);
                    };

                    // Provide the compiled source as a convenience for precompilation.
                    var argument = settings.variable || 'obj';
                    template.source = 'function(' + argument + '){\n' + source + '}';

                    return template;
                };

                // Add a "chain" function. Start chaining a wrapped Underscore object.
                _.chain = function (obj) {
                    var instance = _(obj);
                    instance._chain = true;
                    return instance;
                };

                // OOP
                // ---------------
                // If Underscore is called as a function, it returns a wrapped object that
                // can be used OO-style. This wrapper holds altered versions of all the
                // underscore functions. Wrapped objects may be chained.

                // Helper function to continue chaining intermediate results.
                var result = function (obj) {
                    return this._chain ? _(obj).chain() : obj;
                };

                // Add your own custom functions to the Underscore object.
                _.mixin = function (obj) {
                    _.each(_.functions(obj), function (name) {
                        var func = _[name] = obj[name];
                        _.prototype[name] = function () {
                            var args = [this._wrapped];
                            push.apply(args, arguments);
                            return result.call(this, func.apply(_, args));
                        };
                    });
                };

                // Add all of the Underscore functions to the wrapper object.
                _.mixin(_);

                // Add all mutator Array functions to the wrapper.
                _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function (name) {
                    var method = ArrayProto[name];
                    _.prototype[name] = function () {
                        var obj = this._wrapped;
                        method.apply(obj, arguments);
                        if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
                        return result.call(this, obj);
                    };
                });

                // Add all accessor Array functions to the wrapper.
                _.each(['concat', 'join', 'slice'], function (name) {
                    var method = ArrayProto[name];
                    _.prototype[name] = function () {
                        return result.call(this, method.apply(this._wrapped, arguments));
                    };
                });

                // Extracts the result from a wrapped and chained object.
                _.prototype.value = function () {
                    return this._wrapped;
                };

                // AMD registration happens at the end for compatibility with AMD loaders
                // that may not enforce next-turn semantics on modules. Even though general
                // practice for AMD registration is to be anonymous, underscore registers
                // as a named module because, like jQuery, it is a base library that is
                // popular enough to be bundled in a third party lib, but not be part of
                // an AMD load request. Those cases could generate an error when an
                // anonymous define() is called outside of a loader request.
                if (typeof define === 'function' && define.amd) {
                    define('underscore', [], function () {
                        return _;
                    });
                }
            }.call(this));

        }, {}
    ],
    17: [

        function (require, module, exports) {
            // calc.js
            // measure calculations

            var _ = require('underscore');
            var geocrunch = require('geocrunch');

            var pad = function (num) {
                return num < 10 ? '0' + num.toString() : num.toString();
            };

            var ddToDms = function (coordinate, posSymbol, negSymbol) {
                var dd = Math.abs(coordinate),
                    d = Math.floor(dd),
                    m = Math.floor((dd - d) * 60),
                    s = Math.round((dd - d - (m / 60)) * 3600 * 100) / 100,
                    directionSymbol = dd === coordinate ? posSymbol : negSymbol;
                return pad(d) + '&deg; ' + pad(m) + '\' ' + pad(s) + '" ' + directionSymbol;
            };

            var measure = function (latlngs) {
                var last = _.last(latlngs);
                var path = geocrunch.path(_.map(latlngs, function (latlng) {
                    return [latlng.lng, latlng.lat];
                }));
                return {
                    lastCoord: {
                        dd: {
                            x: last.lng,
                            y: last.lat
                        },
                        dms: {
                            x: ddToDms(last.lng, 'E', 'W'),
                            y: ddToDms(last.lat, 'N', 'S')
                        }
                    },
                    length: {
                        feet: path.distance({
                            units: 'feet'
                        }),
                        miles: path.distance({
                            units: 'miles'
                        }),
                        meters: path.distance({
                            units: 'meters'
                        }),
                        kilometers: path.distance({
                            units: 'kilometers'
                        })
                    },
                    area: {
                        acres: path.area({
                            units: 'acres'
                        }),
                        sqmeters: path.area({
                            units: 'sqmeters'
                        }),
                        hectares: path.area({
                            units: 'hectares'
                        })
                    }
                };
            };

            module.exports = {
                measure: measure // `measure(latLngArray)` - returns object with calced measurements for passed points
            };
        }, {
            "geocrunch": 6,
            "underscore": 16
        }
    ],
    18: [

        function (require, module, exports) {
            // dom.js
            // utility functions for managing DOM elements

            var selectOne = function (selector, el) {
                if (!el) {
                    el = document;
                }
                return el.querySelector(selector);
            };

            var selectAll = function (selector, el) {
                if (!el) {
                    el = document;
                }
                return Array.prototype.slice.call(el.querySelectorAll(selector));
            };

            var hide = function (el) {
                if (el) {
                    el.setAttribute('style', 'display:none;');
                    return el;
                }
            };

            var show = function (el) {
                if (el) {
                    el.removeAttribute('style');
                    return el;
                }
            };

            module.exports = {
                $: selectOne, // `$('.myclass', baseElement)` - returns selected element or undefined
                $$: selectAll, // `$$('.myclass', baseElement)` - returns array of selected elements
                hide: hide, // `hide(someElement)` - hide passed dom element
                show: show // `show(someElement)` - show passed dom element
            };
        }, {}
    ],
    19: [

        function (require, module, exports) {
            (function (global) {
                // leaflet-measure.js

                var _ = require('underscore');
                var L = (typeof window !== "undefined" ? window.L : typeof global !== "undefined" ? global.L : null);
                var humanize = require('humanize');

                var calc = require('./calc');
                var dom = require('./dom');
                var $ = dom.$;

                var Symbology = require('./mapsymbology');


                var controlTemplate;
                var resultsTemplate;
                var pointPopupTemplate;
                var linePopupTemplate;
                var areaPopupTemplate;

                L.Control.Measure = L.Control.extend({
                    _className: 'leaflet-control-measure',
                    options: {
                        position: 'topright',
                        activeColor: '#ABE67E', // base color for map features while actively measuring
                        completedColor: '#C8F2BE', // base color for permenant features generated from completed measure
                        popupOptions: { // standard leaflet popup options http://leafletjs.com/reference.html#popup-options
                            className: 'leaflet-measure-resultpopup',
                            autoPanPadding: [10, 10]
                        },
                        title: "Measure distances and areas",
                        start: "Create a new measurement",
                        addpoint: "Start creating a measurement by adding points to the map",
                        cancel: "Cancel",
                        finish: "Finish Measurement",
                        lastpoint: "Last Point",
                        pathdistance: "Path Distance",
                        meters: "Meters",
                        kilometers: "Kilometers",
                        area: "Area",
                        acres: "Acres",
                        sqmeters: "square meters",
                        hectares: "Hectares",
                        pointlocation: "Point Location",
                        centerlocation: "Center on this Location",
                        delete: "Delete",
                        linearmesurement: "Linear Measurement",
                        areamesurement: "Area Measurement",
                        perimeter: "Perimeter",
                        thousandsep: "'",
                        decsep: "."
                    },
                    initialize: function (options) {

                        controlTemplate = _.template("<a class=\"<%= model.className %>-toggle js-toggle\" href=\"#\" title=\"'+options.title+'\"></a>\n<div class=\"<%= model.className %>-interaction js-interaction\">\n  <div class=\"js-startprompt startprompt\">\n<ul class=\"tasks\">\n      <a href=\"#\" class=\"js-start start\">" + options.start + "</a>\n    </ul>\n  </div>\n  <div class=\"js-measuringprompt\">\n<p class=\"js-starthelp\">" + options.addpoint + "</p>\n    <div class=\"js-results results\"></div>\n    <ul class=\"js-measuretasks tasks\">\n      <li><a href=\"#\" class=\"js-cancel cancel\">" + options.cancel + "</a></li>\n      <li><a href=\"#\" class=\"js-finish finish\">" + options.finish + "</a></li>\n    </ul>\n  </div>\n</div>");
                        resultsTemplate = _.template("<div class=\"group\">\n<p class=\"lastpoint heading\">" + options.lastpoint + "</p>\n<p><%= model.lastCoord.dms.y %> <span class=\"coorddivider\">/</span> <%= model.lastCoord.dms.x %></p>\n<p><%= humanize.numberFormat(model.lastCoord.dd.y, 6) %> <span class=\"coorddivider\">/</span> <%= humanize.numberFormat(model.lastCoord.dd.x, 6) %></p>\n</div>\n<% if (model.pointCount > 1) { %>\n<div class=\"group\">\n<p><span class=\"heading\">" + options.pathdistance + "</span> <%= humanize.numberFormat(model.length.meters, 2,'" + options.decsep + "','" + options.thousandsep + "') %> " + options.meters + " (<%= humanize.numberFormat(model.length.kilometers, 2,'" + options.decsep + "','" + options.thousandsep + "') %> " + options.kilometers + ")</p>\n</div>\n<% } %>\n<% if (model.pointCount > 2) { %>\n<div class=\"group\">\n<p><span class=\"heading\">" + options.area + "</span> <%= humanize.numberFormat(model.area.sqmeters, 2,'" + options.decsep + "','" + options.thousandsep + "') %> " + options.sqmeters + " (<%= humanize.numberFormat(model.area.hectares, 2,'" + options.decsep + "','" + options.thousandsep + "') %> " + options.hectares + ")</p>\n</div>\n<% } %>");
                        pointPopupTemplate = _.template("<h3>" + options.pointlocation + "</h3>\n<p><%= model.lastCoord.dms.y %> <span class=\"coorddivider\">/</span> <%= model.lastCoord.dms.x %></p>\n<p><%= humanize.numberFormat(model.lastCoord.dd.y, 6) %> <span class=\"coorddivider\">/</span> <%= humanize.numberFormat(model.lastCoord.dd.x, 6) %></p>\n<ul class=\"tasks\">\n  <li><a href=\"#\" class=\"js-zoomto zoomto\">" + options.centerlocation + "</a></li>\n  <li><a href=\"#\" class=\"js-deletemarkup deletemarkup\">" + options.delete + "</a></li>\n</ul>");
                        linePopupTemplate = _.template("<h3>" + options.linearmesurement + "</h3>\n<p><%= humanize.numberFormat(model.length.meters, 2,'" + options.decsep + "','" + options.thousandsep + "') %> " + options.meters + "</p>\n<p><%= humanize.numberFormat(model.length.kilometers, 2,'" + options.decsep + "','" + options.thousandsep + "') %> " + options.kilometers + "</p>\n<ul class=\"tasks\">\n  <li><a href=\"#\" class=\"js-zoomto zoomto\">" + options.centerlocation + "</a></li>\n  <li><a href=\"#\" class=\"js-deletemarkup deletemarkup\">" + options.delete + "</a></li>\n</ul>");
                        areaPopupTemplate = _.template("<h3>" + options.areamesurement + "</h3>\n<p><%= humanize.numberFormat(model.area.sqmeters, 2,'" + options.decsep + "','" + options.thousandsep + "') %> " + options.sqmeters + " (<%= humanize.numberFormat(model.area.hectares, 2,'" + options.decsep + "','" + options.thousandsep + "') %> " + options.hectares + ")</p>\n<p><%= humanize.numberFormat(model.length.meters, 2,'" + options.decsep + "','" + options.thousandsep + "') %> " + options.meters + " (<%= humanize.numberFormat(model.length.kilometers, 2,'" + options.decsep + "','" + options.thousandsep + "') %> Kilometers) " + options.perimeter + "</p>\n<ul class=\"tasks\">\n  <li><a href=\"#\" class=\"js-zoomto zoomto\">" + options.centerlocation + "</a></li>\n  <li><a href=\"#\" class=\"js-deletemarkup deletemarkup\">" + options.delete + "</a></li>\n</ul>");

                        L.setOptions(this, options);
                        this._symbols = new Symbology(_.pick(this.options, 'activeColor', 'completedColor'));
                    },
                    onAdd: function (map) {
                        this._map = map;
                        this._latlngs = [];
                        this._initLayout();
                        map.on('click', this._collapse, this);
                        this._layer = L.layerGroup().addTo(map);
                        return this._container;
                    },
                    onRemove: function (map) {
                        map.off('click', this._collapse, this);
                        map.removeLayer(this._layer);
                    },
                    _initLayout: function () {
                        var className = this._className,
                            container = this._container = L.DomUtil.create('div', className);
                        var $toggle, $start, $cancel, $finish;

                        container.innerHTML = controlTemplate({
                            model: {
                                className: className
                            }
                        });

                        // copied from leaflet
                        // https://bitbucket.org/ljagis/js-mapbootstrap/src/4ab1e9e896c08bdbc8164d4053b2f945143f4f3a/app/components/measure/leaflet-measure-control.js?at=master#cl-30
                        container.setAttribute('aria-haspopup', true);
                        if (!L.Browser.touch) {
                            L.DomEvent.disableClickPropagation(container);
                            L.DomEvent.disableScrollPropagation(container);
                        } else {
                            L.DomEvent.on(container, 'click', L.DomEvent.stopPropagation);
                        }

                        $toggle = this.$toggle = $('.js-toggle', container); // collapsed content
                        this.$interaction = $('.js-interaction', container); // expanded content
                        $start = $('.js-start', container); // start button
                        $cancel = $('.js-cancel', container); // cancel button
                        $finish = $('.js-finish', container); // finish button
                        this.$startPrompt = $('.js-startprompt', container); // full area with button to start measurment
                        this.$measuringPrompt = $('.js-measuringprompt', container); // full area with all stuff for active measurement
                        this.$startHelp = $('.js-starthelp', container); // "Start creating a measurement by adding points"
                        this.$results = $('.js-results', container); // div with coordinate, linear, area results
                        this.$measureTasks = $('.js-measuretasks', container); // active measure buttons container

                        this._collapse();
                        this._updateMeasureNotStarted();

                        if (!L.Browser.android) {
                            L.DomEvent.on(container, 'mouseenter', this._expand, this);
                            L.DomEvent.on(container, 'mouseleave', this._collapse, this);
                        }
                        L.DomEvent.on($toggle, 'click', L.DomEvent.stop);
                        if (L.Browser.touch) {
                            L.DomEvent.on($toggle, 'click', this._expand, this);
                        } else {
                            L.DomEvent.on($toggle, 'focus', this._expand, this);
                        }
                        L.DomEvent.on($start, 'click', L.DomEvent.stop);
                        L.DomEvent.on($start, 'click', this._startMeasure, this);
                        L.DomEvent.on($cancel, 'click', L.DomEvent.stop);
                        L.DomEvent.on($cancel, 'click', this._finishMeasure, this);
                        L.DomEvent.on($finish, 'click', L.DomEvent.stop);
                        L.DomEvent.on($finish, 'click', this._handleMeasureDoubleClick, this);
                    },
                    _expand: function () {
                        dom.hide(this.$toggle);
                        dom.show(this.$interaction);
                    },
                    _collapse: function () {
                        if (!this._locked) {
                            dom.hide(this.$interaction);
                            dom.show(this.$toggle);
                        }
                    },
                    // move between basic states:
                    // measure not started, started/in progress but no points added, in progress and with points
                    _updateMeasureNotStarted: function () {
                        dom.hide(this.$startHelp);
                        dom.hide(this.$results);
                        dom.hide(this.$measureTasks);
                        dom.hide(this.$measuringPrompt);
                        dom.show(this.$startPrompt);
                    },
                    _updateMeasureStartedNoPoints: function () {
                        dom.hide(this.$results);
                        dom.show(this.$startHelp);
                        dom.show(this.$measureTasks);
                        dom.hide(this.$startPrompt);
                        dom.show(this.$measuringPrompt);
                    },
                    _updateMeasureStartedWithPoints: function () {
                        dom.hide(this.$startHelp);
                        dom.show(this.$results);
                        dom.show(this.$measureTasks);
                        dom.hide(this.$startPrompt);
                        dom.show(this.$measuringPrompt);
                    },
                    // get state vars and interface ready for measure
                    _startMeasure: function () {
                        this._locked = true;

                        this._map.doubleClickZoom.disable(); // double click now finishes measure
                        this._map.on('mouseout', this._handleMapMouseOut, this);

                        L.DomEvent.on(this._container, 'mouseenter', this._handleMapMouseOut, this);

                        if (!this._measureCollector) {
                            // polygon to cover all other layers and collection measure move and click events
                            this._measureCollector = L.polygon([
                                [90, -180],
                                [90, 180],
                                [-90, 180],
                                [-90, -180]
                            ], this._symbols.getSymbol('measureCollector')).addTo(this._layer);
                            this._measureCollector.on('mousemove', this._handleMeasureMove, this);
                            this._measureCollector.on('dblclick', this._handleMeasureDoubleClick, this);
                            this._measureCollector.on('click', this._handleMeasureClick, this);
                        }
                        this._measureCollector.bringToFront();

                        this._measureVertexes = L.featureGroup().addTo(this._layer);

                        this._updateMeasureStartedNoPoints();
                    },
                    // return to state with no measure in progress, undo `this._startMeasure`
                    _finishMeasure: function () {
                        this._locked = false;

                        this._map.doubleClickZoom.enable();
                        this._map.off('mouseout', this._handleMapMouseOut, this);

                        L.DomEvent.off(this._container, 'mouseover', this._handleMapMouseOut, this);

                        this._clearMeasure();

                        this._measureCollector.off();
                        this._layer.removeLayer(this._measureCollector);
                        this._measureCollector = null;

                        this._layer.removeLayer(this._measureVertexes);
                        this._measureVertexes = null;

                        this._updateMeasureNotStarted();
                        this._collapse();
                    },
                    // clear all running measure data
                    _clearMeasure: function () {
                        this._latlngs = [];
                        this._measureVertexes.clearLayers();
                        if (this._measureDrag) {
                            this._layer.removeLayer(this._measureDrag);
                        }
                        if (this._measureArea) {
                            this._layer.removeLayer(this._measureArea);
                        }
                        if (this._measureBoundary) {
                            this._layer.removeLayer(this._measureBoundary);
                        }
                        this._measureDrag = null;
                        this._measureArea = null;
                        this._measureBoundary = null;
                    },
                    // update results area of dom with calced measure from `this._latlngs`
                    _updateResults: function () {
                        var calced = calc.measure(this._latlngs);
                        this.$results.innerHTML = resultsTemplate({
                            model: _.extend({}, calced, {
                                pointCount: this._latlngs.length
                            }),
                            humanize: humanize
                        });
                    },
                    // mouse move handler while measure in progress
                    // adds floating measure marker under cursor
                    _handleMeasureMove: function (evt) {
                        if (!this._measureDrag) {
                            this._measureDrag = L.circleMarker(evt.latlng, this._symbols.getSymbol('measureDrag')).addTo(this._layer);
                        } else {
                            this._measureDrag.setLatLng(evt.latlng);
                        }
                        this._measureDrag.bringToFront();
                    },
                    // handler for both double click and clicking finish button
                    // do final calc and finish out current measure, clear dom and internal state, add permanent map features
                    _handleMeasureDoubleClick: function () {
                        var latlngs = this._latlngs,
                            calced, resultFeature, popupContainer, popupContent, zoomLink, deleteLink;

                        this._finishMeasure();

                        if (!latlngs.length) {
                            return;
                        }

                        if (latlngs.length > 2) {
                            latlngs.push(_.first(latlngs)); // close path to get full perimeter measurement for areas
                        }

                        calced = calc.measure(latlngs);

                        if (latlngs.length === 1) {
                            resultFeature = L.circleMarker(latlngs[0], this._symbols.getSymbol('resultPoint'));
                            popupContent = pointPopupTemplate({
                                model: calced,
                                humanize: humanize
                            });
                        } else if (latlngs.length === 2) {
                            resultFeature = L.polyline(latlngs, this._symbols.getSymbol('resultLine')).addTo(this._map);
                            popupContent = linePopupTemplate({
                                model: calced,
                                humanize: humanize
                            });
                        } else {
                            resultFeature = L.polygon(latlngs, this._symbols.getSymbol('resultArea'));
                            popupContent = areaPopupTemplate({
                                model: calced,
                                humanize: humanize
                            });
                        }

                        popupContainer = L.DomUtil.create('div', '');
                        popupContainer.innerHTML = popupContent;

                        zoomLink = $('.js-zoomto', popupContainer);
                        if (zoomLink) {
                            L.DomEvent.on(zoomLink, 'click', L.DomEvent.stop);
                            L.DomEvent.on(zoomLink, 'click', function () {
                                this._map.fitBounds(resultFeature.getBounds(), {
                                    padding: [20, 20],
                                    maxZoom: 17
                                });
                            }, this);
                        }

                        deleteLink = $('.js-deletemarkup', popupContainer);
                        if (deleteLink) {
                            L.DomEvent.on(deleteLink, 'click', L.DomEvent.stop);
                            L.DomEvent.on(deleteLink, 'click', function () {
                                // TODO. maybe remove any event handlers on zoom and delete buttons?
                                this._map.removeLayer(resultFeature);
                            }, this);
                        }

                        resultFeature.addTo(this._map);
                        resultFeature.bindPopup(popupContainer, this.options.popupOptions);
                        resultFeature.openPopup(resultFeature.getBounds().getCenter());
                    },
                    // handle map click during ongoing measurement
                    // add new clicked point, update measure layers and results ui
                    _handleMeasureClick: function (evt) {
                        var latlng = evt.latlng,
                            lastClick = _.last(this._latlngs),
                            vertexSymbol = this._symbols.getSymbol('measureVertex');

                        this._map.closePopup(); // open popups aren't closed on click. may be bug. close popup manually just in case.

                        if (!lastClick || !latlng.equals(lastClick)) { // skip if same point as last click, happens on `dblclick`
                            this._latlngs.push(latlng);
                            this._addMeasureArea(this._latlngs);
                            this._addMeasureBoundary(this._latlngs);

                            this._measureVertexes.eachLayer(function (layer) {
                                layer.setStyle(vertexSymbol);
                                // reset all vertexes to non-active class - only last vertex is active
                                // `layer.setStyle({ className: 'layer-measurevertex'})` doesn't work. https://github.com/leaflet/leaflet/issues/2662
                                // set attribute on path directly
                                layer._path.setAttribute('class', vertexSymbol.className);
                            });

                            this._addNewVertex(latlng);

                            if (this._measureBoundary) {
                                this._measureBoundary.bringToFront();
                            }
                            this._measureVertexes.bringToFront();
                        }

                        this._updateResults();
                        this._updateMeasureStartedWithPoints();
                    },
                    // handle map mouse out during ongoing measure
                    // remove floating cursor vertex from map
                    _handleMapMouseOut: function () {
                        if (this._measureDrag) {
                            this._layer.removeLayer(this._measureDrag);
                            this._measureDrag = null;
                        }
                    },
                    // add various measure graphics to map - vertex, area, boundary
                    _addNewVertex: function (latlng) {
                        L.circleMarker(latlng, this._symbols.getSymbol('measureVertexActive')).addTo(this._measureVertexes);
                    },
                    _addMeasureArea: function (latlngs) {
                        if (latlngs.length < 3) {
                            if (this._measureArea) {
                                this._layer.removeLayer(this._measureArea);
                                this._measureArea = null;
                            }
                            return;
                        }
                        if (!this._measureArea) {
                            this._measureArea = L.polygon(latlngs, this._symbols.getSymbol('measureArea')).addTo(this._layer);
                        } else {
                            this._measureArea.setLatLngs(latlngs);
                        }
                    },
                    _addMeasureBoundary: function (latlngs) {
                        if (latlngs.length < 2) {
                            if (this._measureBoundary) {
                                this._layer.removeLayer(this._measureBoundary);
                                this._measureBoundary = null;
                            }
                            return;
                        }
                        if (!this._measureBoundary) {
                            this._measureBoundary = L.polyline(latlngs, this._symbols.getSymbol('measureBoundary')).addTo(this._layer);
                        } else {
                            this._measureBoundary.setLatLngs(latlngs);
                        }
                    }
                });

                L.Map.mergeOptions({
                    measureControl: false
                });

                L.Map.addInitHook(function () {
                    if (this.options.measureControl) {
                        this.measureControl = (new L.Control.Measure()).addTo(this);
                    }
                });

                L.control.measure = function (options) {
                    return new L.Control.Measure(options);
                };
            }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
        }, {
            "./calc": 17,
            "./dom": 18,
            "./mapsymbology": 20,
            "humanize": 15,
            "underscore": 16
        }
    ],
    20: [

        function (require, module, exports) {
            // mapsymbology.js

            var _ = require('underscore');

            var color = require('color');

            var Symbology = function (options) {
                this.setOptions(options);
            };

            Symbology.DEFAULTS = {
                activeColor: '#ABE67E', // base color for map features while actively measuring
                completedColor: '#C8F2BE' // base color for permenant features generated from completed measure
            };

            _.extend(Symbology.prototype, {
                setOptions: function (options) {
                    this._options = _.extend({}, Symbology.DEFAULTS, this._options, options);
                    return this;
                },
                getSymbol: function (name) {
                    var symbols = {
                        measureCollector: {
                            clickable: true,
                            stroke: false,
                            fillOpacity: 0.0,
                            className: 'layer-measurecollector'
                        },
                        measureDrag: {
                            clickable: false,
                            radius: 4,
                            color: this._options.activeColor,
                            weight: 2,
                            opacity: 0.7,
                            fillColor: this._options.activeColor,
                            fillOpacity: 0.5,
                            className: 'layer-measuredrag'
                        },
                        measureArea: {
                            clickable: false,
                            stroke: false,
                            fillColor: this._options.activeColor,
                            fillOpacity: 0.2,
                            className: 'layer-measurearea'
                        },
                        measureBoundary: {
                            clickable: false,
                            color: this._options.activeColor,
                            weight: 2,
                            opacity: 0.9,
                            fill: false,
                            className: 'layer-measureboundary'
                        },
                        measureVertex: {
                            clickable: false,
                            radius: 4,
                            color: this._options.activeColor,
                            weight: 2,
                            opacity: 1,
                            fillColor: this._options.activeColor,
                            fillOpacity: 0.7,
                            className: 'layer-measurevertex'
                        },
                        measureVertexActive: {
                            clickable: false,
                            radius: 4,
                            color: this._options.activeColor,
                            weight: 2,
                            opacity: 1,
                            fillColor: this._options.activeColor,
                            fillOpacity: 0.7,
                            className: 'layer-measurevertex active'
                        },
                        resultArea: {
                            clickable: true,
                            color: this._options.completedColor,
                            weight: 2,
                            opacity: 0.9,
                            fillColor: this._options.completedColor,
                            fillOpacity: 0.2,
                            className: 'layer-measure-resultarea'
                        },
                        resultLine: {
                            clickable: true,
                            color: this._options.completedColor,
                            weight: 3,
                            opacity: 0.9,
                            fill: false,
                            className: 'layer-measure-resultline'
                        },
                        resultPoint: {
                            clickable: true,
                            radius: 4,
                            color: this._options.completedColor,
                            weight: 2,
                            opacity: 1,
                            fillColor: this._options.completedColor,
                            fillOpacity: 0.7,
                            className: 'layer-measure-resultpoint'
                        }
                    };
                    return symbols[name];
                }
            });

            module.exports = Symbology;
        }, {
            "color": 1,
            "underscore": 16
        }
    ]
}, {}, [19]);
(function (factory) {
    // Packaging/modules magic dance
    var L;



    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['leaflet'], factory);
    } else if (typeof module !== 'undefined') {
        // Node/CommonJS
        L = require('leaflet');
        module.exports = factory(L);
    } else {
        // Browser globals
        if (typeof window.L === 'undefined')
            throw 'Leaflet must be loaded first';
        factory(window.L);
    }
}(function (L) {
    'use strict';
    L.Control.Geocoder = L.Control.extend({
        options: {
            showResultIcons: false,
            collapsed: true,
            expand: 'click',
            position: 'topright',
            placeholder: 'Search...',
            errorMessage: 'Nothing found.',
            title: 'Find an address'
        },

        _callbackId: 0,

        initialize: function (options) {
            L.Util.setOptions(this, options);
            if (!this.options.geocoder) {
                this.options.geocoder = new L.Control.Geocoder.Nominatim();
            }
        },

        onAdd: function (map) {
            var className = 'leaflet-control-geocoder',
                container = L.DomUtil.create('div', className),
                icon = L.DomUtil.create('div', 'leaflet-control-geocoder-icon', container),
                form = this._form = L.DomUtil.create('form', className + '-form', container),
                input;

            this._map = map;
            this._container = container;
            this._container.title = this.options.title;
            input = this._input = L.DomUtil.create('input');
            input.type = 'text';
            input.placeholder = this.options.placeholder;

            L.DomEvent.addListener(input, 'keydown', this._keydown, this);
            //L.DomEvent.addListener(input, 'onpaste', this._clearResults, this);
            //L.DomEvent.addListener(input, 'oninput', this._clearResults, this);

            this._errorElement = document.createElement('div');
            this._errorElement.className = className + '-form-no-error';
            this._errorElement.innerHTML = this.options.errorMessage;

            this._alts = L.DomUtil.create('ul', className + '-alternatives leaflet-control-geocoder-alternatives-minimized');

            form.appendChild(input);
            form.appendChild(this._errorElement);
            container.appendChild(this._alts);

            L.DomEvent.addListener(form, 'submit', this._geocode, this);

            if (this.options.collapsed) {
                if (this.options.expand === 'click') {
                    L.DomEvent.addListener(icon, 'click', function (e) {
                        // TODO: touch
                        if (e.button === 0 && e.detail !== 2) {
                            this._toggle();
                        }
                    }, this);
                } else {
                    L.DomEvent.addListener(icon, 'mouseover', this._expand, this);
                    L.DomEvent.addListener(icon, 'mouseout', this._collapse, this);
                    this._map.on('movestart', this._collapse, this);
                }
            } else {
                this._expand();
            }

            L.DomEvent.disableClickPropagation(container);

            return container;
        },

        _geocodeResult: function (results) {
            L.DomUtil.removeClass(this._container, 'leaflet-control-geocoder-throbber');
            /*if (results.length === 1) {
				this._geocodeResultSelected(results[0]);
			} else*/
            if (results.length > 0) {
                this._alts.innerHTML = '';
                this._results = results;
                L.DomUtil.removeClass(this._alts, 'leaflet-control-geocoder-alternatives-minimized');
                for (var i = 0; i < results.length; i++) {
                    this._alts.appendChild(this._createAlt(results[i], i));
                }
            } else {
                L.DomUtil.addClass(this._errorElement, 'leaflet-control-geocoder-error');
            }
        },

        markGeocode: function (result) {
            this._map.fitBounds(result.bbox);

            if (this._geocodeMarker) {
                this._map.removeLayer(this._geocodeMarker);
            }

            this._geocodeMarker = new L.Marker(result.center)
                .bindPopup(result.html || result.name)
                .addTo(this._map)
                .openPopup();

            return this;
        },

        _geocode: function (event) {
            if (event !== null)
                L.DomEvent.preventDefault(event);

            L.DomUtil.addClass(this._container, 'leaflet-control-geocoder-throbber');
            this._clearResults();
            this.options.geocoder.geocode(this._input.value, this._geocodeResult, this);

            return false;
        },

        _geocodeResultSelected: function (result) {
            if (this.options.collapsed) {
                this._collapse();
            } else {
                this._clearResults();
            }
            this.markGeocode(result);
        },

        _toggle: function () {
            if (this._container.className.indexOf('leaflet-control-geocoder-expanded') >= 0) {
                this._collapse();
            } else {
                this._expand();
            }
        },

        _expand: function () {
            L.DomUtil.addClass(this._container, 'leaflet-control-geocoder-expanded');
            this._input.select();
        },

        _collapse: function () {
            this._container.className = this._container.className.replace(' leaflet-control-geocoder-expanded', '');
            L.DomUtil.addClass(this._alts, 'leaflet-control-geocoder-alternatives-minimized');
            L.DomUtil.removeClass(this._errorElement, 'leaflet-control-geocoder-error');
        },

        _clearResults: function () {
            L.DomUtil.addClass(this._alts, 'leaflet-control-geocoder-alternatives-minimized');
            this._selection = null;
            L.DomUtil.removeClass(this._errorElement, 'leaflet-control-geocoder-error');
        },

        _createAlt: function (result, index) {
            var li = document.createElement('li'),
                a = L.DomUtil.create('a', '', li),
                icon = this.options.showResultIcons && result.icon ? L.DomUtil.create('img', '', a) : null,
                text = result.html ? undefined : document.createTextNode(result.name);

            if (icon) {
                icon.src = result.icon;
            }

            a.href = '#';
            a.setAttribute('data-result-index', index);

            if (result.html) {
                a.innerHTML = result.html;
            } else {
                a.appendChild(text);
            }

            L.DomEvent.addListener(li, 'click', function clickHandler(e) {
                L.DomEvent.preventDefault(e);
                this._geocodeResultSelected(result);
            }, this);

            return li;
        },

        _keydown: function (e) {
            var _this = this


            setTimeout(function () {
                if (_this._input.value.length > 2) {
                    _this._geocode(null);
                } else {
                    _this._clearResults();
                }
            }, 50);


            var _this = this,
                select = function select(dir) {
                    if (_this._selection) {
                        L.DomUtil.removeClass(_this._selection.firstChild, 'leaflet-control-geocoder-selected');
                        _this._selection = _this._selection[dir > 0 ? 'nextSibling' : 'previousSibling'];
                    }
                    if (!_this._selection) {
                        _this._selection = _this._alts[dir > 0 ? 'firstChild' : 'lastChild'];
                    }

                    if (_this._selection) {
                        L.DomUtil.addClass(_this._selection.firstChild, 'leaflet-control-geocoder-selected');
                    }

                };

            switch (e.keyCode) {
                // Escape
            case 27:
                if (this.options.collapsed) {
                    this._collapse();
                }
                break;
                // Up
            case 38:
                select(-1);
                L.DomEvent.preventDefault(e);
                break;
                // Up
            case 40:
                select(1);
                L.DomEvent.preventDefault(e);
                break;
                // Enter
            case 13:
                if (this._selection) {
                    var index = parseInt(this._selection.firstChild.getAttribute('data-result-index'), 10);
                    this._geocodeResultSelected(this._results[index]);
                    this._clearResults();
                    L.DomEvent.preventDefault(e);
                }
            }
            return true;
        }
    });

    L.Control.geocoder = function (id, options) {
        return new L.Control.Geocoder(id, options);
    };

    L.Control.Geocoder.callbackId = 0;
    L.Control.Geocoder.jsonp = function (url, params, callback, context, jsonpParam) {
        var callbackId = '_l_geocoder_' + (L.Control.Geocoder.callbackId++);
        params[jsonpParam || 'callback'] = callbackId;
        window[callbackId] = L.Util.bind(callback, context);
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url + L.Util.getParamString(params);
        script.id = callbackId;
        document.getElementsByTagName('head')[0].appendChild(script);
    };
    L.Control.Geocoder.getJSON = function (url, params, callback) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", url + L.Util.getParamString(params), true);
        xmlHttp.send(null);
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState != 4) return;
            if (xmlHttp.status != 200 && req.status != 304) return;
            callback(JSON.parse(xmlHttp.response));
        };
    };

    L.Control.Geocoder.template = function (str, data, htmlEscape) {
        return str.replace(/\{ *([\w_]+) *\}/g, function (str, key) {
            var value = data[key];
            if (value === undefined) {
                value = '';
            } else if (typeof value === 'function') {
                value = value(data);
            }
            return L.Control.Geocoder.htmlEscape(value);
        });
    };

    // Adapted from handlebars.js
    // https://github.com/wycats/handlebars.js/
    L.Control.Geocoder.htmlEscape = (function () {
        var badChars = /[&<>"'`]/g;
        var possible = /[&<>"'`]/;
        var escape = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            '\'': '&#x27;',
            '`': '&#x60;'
        };

        function escapeChar(chr) {
            return escape[chr];
        }

        return function (string) {
            if (string == null) {
                return '';
            } else if (!string) {
                return string + '';
            }

            // Force a string conversion as this will be done by the append regardless and
            // the regex test will do this transparently behind the scenes, causing issues if
            // an object's to string has escaped characters in it.
            string = '' + string;

            if (!possible.test(string)) {
                return string;
            }
            return string.replace(badChars, escapeChar);
        };
    })();

    L.Control.Geocoder.Nominatim = L.Class.extend({
        options: {
            serviceUrl: '//nominatim.openstreetmap.org/',
            geocodingQueryParams: {},
            reverseQueryParams: {},
            htmlTemplate: function (r) {
                var a = r.address,
                    parts = [];
                if (a.road || a.building) {
                    parts.push('{building} {road} {house_number}');
                }

                if (a.city || a.town || a.village) {
                    parts.push('<span class="' + (parts.length > 0 ? 'leaflet-control-geocoder-address-detail' : '') +
                        '">{postcode} {city} {town} {village}</span>');
                }

                if (a.state || a.country) {
                    parts.push('<span class="' + (parts.length > 0 ? 'leaflet-control-geocoder-address-context' : '') +
                        '">{state} {country}</span>');
                }

                return L.Control.Geocoder.template(parts.join('<br/>'), a, true);
            }
        },

        initialize: function (options) {
            L.Util.setOptions(this, options);
        },

        geocode: function (query, cb, context) {
            L.Control.Geocoder.jsonp(this.options.serviceUrl + 'search/', L.extend({
                    q: query,
                    limit: 5,
                    format: 'json',
                    addressdetails: 1
                }, this.options.geocodingQueryParams),
                function (data) {
                    var results = [];
                    for (var i = data.length - 1; i >= 0; i--) {
                        var bbox = data[i].boundingbox;
                        for (var j = 0; j < 4; j++) bbox[j] = parseFloat(bbox[j]);
                        results[i] = {
                            icon: data[i].icon,
                            name: data[i].display_name,
                            html: this.options.htmlTemplate ?
                                this.options.htmlTemplate(data[i]) : undefined,
                            bbox: L.latLngBounds([bbox[0], bbox[2]], [bbox[1], bbox[3]]),
                            center: L.latLng(data[i].lat, data[i].lon),
                            properties: data[i]
                        };
                    }
                    cb.call(context, results);
                }, this, 'json_callback');
        },

        reverse: function (location, scale, cb, context) {
            L.Control.Geocoder.jsonp(this.options.serviceUrl + 'reverse/', L.extend({
                lat: location.lat,
                lon: location.lng,
                zoom: Math.round(Math.log(scale / 256) / Math.log(2)),
                addressdetails: 1,
                format: 'json'
            }, this.options.reverseQueryParams), function (data) {
                var result = [],
                    loc;

                if (data && data.lat && data.lon) {
                    loc = L.latLng(data.lat, data.lon);
                    result.push({
                        name: data.display_name,
                        html: this.options.htmlTemplate ?
                            this.options.htmlTemplate(data) : undefined,
                        center: loc,
                        bounds: L.latLngBounds(loc, loc),
                        properties: data
                    });
                }

                cb.call(context, result);
            }, this, 'json_callback');
        }
    });

    L.Control.Geocoder.nominatim = function (options) {
        return new L.Control.Geocoder.Nominatim(options);
    };

    L.Control.Geocoder.Bing = L.Class.extend({
        initialize: function (key) {
            this.key = key;
        },

        geocode: function (query, cb, context) {
            L.Control.Geocoder.jsonp('//dev.virtualearth.net/REST/v1/Locations', {
                query: query,
                key: this.key
            }, function (data) {
                var results = [];
                for (var i = data.resourceSets[0].resources.length - 1; i >= 0; i--) {
                    var resource = data.resourceSets[0].resources[i],
                        bbox = resource.bbox;
                    results[i] = {
                        name: resource.name,
                        bbox: L.latLngBounds([bbox[0], bbox[1]], [bbox[2], bbox[3]]),
                        center: L.latLng(resource.point.coordinates)
                    };
                }
                cb.call(context, results);
            }, this, 'jsonp');
        },

        reverse: function (location, scale, cb, context) {
            L.Control.Geocoder.jsonp('//dev.virtualearth.net/REST/v1/Locations/' + location.lat + ',' + location.lng, {
                key: this.key
            }, function (data) {
                var results = [];
                for (var i = data.resourceSets[0].resources.length - 1; i >= 0; i--) {
                    var resource = data.resourceSets[0].resources[i],
                        bbox = resource.bbox;
                    results[i] = {
                        name: resource.name,
                        bbox: L.latLngBounds([bbox[0], bbox[1]], [bbox[2], bbox[3]]),
                        center: L.latLng(resource.point.coordinates)
                    };
                }
                cb.call(context, results);
            }, this, 'jsonp');
        }
    });

    L.Control.Geocoder.bing = function (key) {
        return new L.Control.Geocoder.Bing(key);
    };

    L.Control.Geocoder.RaveGeo = L.Class.extend({
        options: {
            querySuffix: '',
            deepSearch: true,
            wordBased: false
        },

        jsonp: function (params, callback, context) {
            var callbackId = '_l_geocoder_' + (L.Control.Geocoder.callbackId++),
                paramParts = [];
            params.prepend = callbackId + '(';
            params.append = ')';
            for (var p in params) {
                paramParts.push(p + '=' + escape(params[p]));
            }

            window[callbackId] = L.Util.bind(callback, context);
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = this._serviceUrl + '?' + paramParts.join('&');
            script.id = callbackId;
            document.getElementsByTagName('head')[0].appendChild(script);
        },

        initialize: function (serviceUrl, scheme, options) {
            L.Util.setOptions(this, options);

            this._serviceUrl = serviceUrl;
            this._scheme = scheme;
        },

        geocode: function (query, cb, context) {
            L.Control.Geocoder.jsonp(this._serviceUrl, {
                address: query + this.options.querySuffix,
                scheme: this._scheme,
                outputFormat: 'jsonp',
                deepSearch: this.options.deepSearch,
                wordBased: this.options.wordBased
            }, function (data) {
                var results = [];
                for (var i = data.length - 1; i >= 0; i--) {
                    var r = data[i],
                        c = L.latLng(r.y, r.x);
                    results[i] = {
                        name: r.address,
                        bbox: L.latLngBounds([c]),
                        center: c
                    };
                }
                cb.call(context, results);
            }, this);
        }
    });

    L.Control.Geocoder.raveGeo = function (serviceUrl, scheme, options) {
        return new L.Control.Geocoder.RaveGeo(serviceUrl, scheme, options);
    };

    L.Control.Geocoder.MapQuest = L.Class.extend({
        options: {
            serviceUrl: '//www.mapquestapi.com/geocoding/v1'
        },

        initialize: function (key, options) {
            // MapQuest seems to provide URI encoded API keys,
            // so to avoid encoding them twice, we decode them here
            this._key = decodeURIComponent(key);

            L.Util.setOptions(this, options);
        },

        _formatName: function () {
            var r = [],
                i;
            for (i = 0; i < arguments.length; i++) {
                if (arguments[i]) {
                    r.push(arguments[i]);
                }
            }

            return r.join(', ');
        },

        geocode: function (query, cb, context) {
            L.Control.Geocoder.jsonp(this.options.serviceUrl + '/address', {
                key: this._key,
                location: query,
                limit: 5,
                outFormat: 'json'
            }, function (data) {
                var results = [],
                    loc,
                    latLng;
                if (data.results && data.results[0].locations) {
                    for (var i = data.results[0].locations.length - 1; i >= 0; i--) {
                        loc = data.results[0].locations[i];
                        latLng = L.latLng(loc.latLng);
                        results[i] = {
                            name: this._formatName(loc.street, loc.adminArea4, loc.adminArea3, loc.adminArea1),
                            bbox: L.latLngBounds(latLng, latLng),
                            center: latLng
                        };
                    }
                }

                cb.call(context, results);
            }, this);
        },

        reverse: function (location, scale, cb, context) {
            L.Control.Geocoder.jsonp(this.options.serviceUrl + '/reverse', {
                key: this._key,
                location: location.lat + ',' + location.lng,
                outputFormat: 'json'
            }, function (data) {
                var results = [],
                    loc,
                    latLng;
                if (data.results && data.results[0].locations) {
                    for (var i = data.results[0].locations.length - 1; i >= 0; i--) {
                        loc = data.results[0].locations[i];
                        latLng = L.latLng(loc.latLng);
                        results[i] = {
                            name: this._formatName(loc.street, loc.adminArea4, loc.adminArea3, loc.adminArea1),
                            bbox: L.latLngBounds(latLng, latLng),
                            center: latLng
                        };
                    }
                }

                cb.call(context, results);
            }, this);
        }
    });

    L.Control.Geocoder.mapQuest = function (key, options) {
        return new L.Control.Geocoder.MapQuest(key, options);
    };

    L.Control.Geocoder.Mapbox = L.Class.extend({
        options: {
            service_url: 'https://api.tiles.mapbox.com/v4/geocode/mapbox.places-v1/'
        },

        initialize: function (access_token) {
            this._access_token = access_token;
        },

        geocode: function (query, cb, context) {
            L.Control.Geocoder.getJSON(this.options.service_url + encodeURIComponent(query) + '.json', {
                access_token: this._access_token,
            }, function (data) {
                var results = [],
                    loc,
                    latLng,
                    latLngBounds;
                if (data.features && data.features.length) {
                    for (var i = 0; i <= data.features.length - 1; i++) {
                        loc = data.features[i];
                        latLng = L.latLng(loc.center.reverse());
                        if (loc.hasOwnProperty('bbox')) {
                            latLngBounds = L.latLngBounds(L.latLng(loc.bbox.slice(0, 2).reverse()), L.latLng(loc.bbox.slice(2, 4).reverse()));
                        } else {
                            latLngBounds = L.latLngBounds(latLng, latLng);
                        }
                        results[i] = {
                            name: loc.place_name,
                            bbox: latLngBounds,
                            center: latLng
                        };
                    }
                }

                cb.call(context, results);
            });
        },

        suggest: function (query, cb, context) {
            return this.geocode(query, cb, context);
        },

        reverse: function (location, scale, cb, context) {
            L.Control.Geocoder.getJSON(this.options.service_url + encodeURIComponent(location.lng) + ',' + encodeURIComponent(location.lat) + '.json', {
                access_token: this._access_token,
            }, function (data) {
                var results = [],
                    loc,
                    latLng,
                    latLngBounds;
                if (data.features && data.features.length) {
                    for (var i = 0; i <= data.features.length - 1; i++) {
                        loc = data.features[i];
                        latLng = L.latLng(loc.center.reverse());
                        if (loc.hasOwnProperty('bbox')) {
                            latLngBounds = L.latLngBounds(L.latLng(loc.bbox.slice(0, 2).reverse()), L.latLng(loc.bbox.slice(2, 4).reverse()));
                        } else {
                            latLngBounds = L.latLngBounds(latLng, latLng);
                        }
                        results[i] = {
                            name: loc.place_name,
                            bbox: latLngBounds,
                            center: latLng
                        };
                    }
                }

                cb.call(context, results);
            });
        }
    });

    L.Control.Geocoder.mapbox = function (access_token) {
        return new L.Control.Geocoder.Mapbox(access_token);
    };

    L.Control.Geocoder.Google = L.Class.extend({
        options: {
            service_url: 'https://maps.googleapis.com/maps/api/geocode/json'
        },

        initialize: function (options) {
            this._key = options.key;
            L.extend(this.options, options);
            //this._key = key;
        },

        geocode: function (query, cb, context) {
            //console.log(this.options);
            var params = {
                address: query,
            };
            if (this._key && this._key.length) {
                params['key'] = this._key
            }
            if (typeof (this.options.language) != "undefined" && this.options.language !== null)
                params['language'] = this.options.language;

            if (typeof (this.options.bounds) != "undefined" && this.options.bounds !== null) {
                var a_bounds = this.options.bounds.split(',');
                params['bounds'] = parseFloat(a_bounds[1]) + ',' + parseFloat(a_bounds[0]) + '|' + parseFloat(a_bounds[3]) + ',' + parseFloat(a_bounds[2]);
            }

            L.Control.Geocoder.getJSON(this.options.service_url, params, function (data) {
                var results = [],
                    loc,
                    latLng,
                    latLngBounds;
                if (data.results && data.results.length) {
                    for (var i = 0; i <= data.results.length - 1; i++) {
                        loc = data.results[i];
                        latLng = L.latLng(loc.geometry.location);
                        latLngBounds = L.latLngBounds(L.latLng(loc.geometry.viewport.northeast), L.latLng(loc.geometry.viewport.southwest));
                        results[i] = {
                            name: loc.formatted_address,
                            bbox: latLngBounds,
                            center: latLng
                        };
                    }
                }

                cb.call(context, results);
            });
        },

        reverse: function (location, scale, cb, context) {
            var params = {
                latlng: encodeURIComponent(location.lat) + ',' + encodeURIComponent(location.lng)
            };
            if (this._key && this._key.length) {
                params['key'] = this._key
            }
            L.Control.Geocoder.getJSON(this.options.service_url, params, function (data) {
                var results = [],
                    loc,
                    latLng,
                    latLngBounds;
                if (data.results && data.results.length) {
                    for (var i = 0; i <= data.results.length - 1; i++) {
                        loc = data.results[i];
                        latLng = L.latLng(loc.geometry.location);
                        latLngBounds = L.latLngBounds(L.latLng(loc.geometry.viewport.northeast), L.latLng(loc.geometry.viewport.southwest));
                        results[i] = {
                            name: loc.formatted_address,
                            bbox: latLngBounds,
                            center: latLng
                        };
                    }
                }

                cb.call(context, results);
            });
        }
    });

    L.Control.Geocoder.google = function (options) {
        return new L.Control.Geocoder.Google(options);
    };

    L.Control.Geocoder.Photon = L.Class.extend({
        options: {
            serviceUrl: '//photon.komoot.de/api/'
        },

        initialize: function (options) {
            L.setOptions(this, options);
        },

        geocode: function (query, cb, context) {
            var params = L.extend({
                q: query,
            }, this.options.geocodingQueryParams);

            L.Control.Geocoder.getJSON(this.options.serviceUrl, params, function (data) {
                var results = [],
                    i,
                    f,
                    c,
                    latLng,
                    extent,
                    bbox;
                if (data && data.features) {
                    for (i = 0; i < data.features.length; i++) {
                        f = data.features[i];
                        c = f.geometry.coordinates;
                        latLng = L.latLng(c[1], c[0]);
                        extent = f.properties.extent;

                        if (extent) {
                            bbox = L.latLngBounds([extent[1], extent[0]], [extent[3], extent[2]]);
                        } else {
                            bbox = L.latLngBounds(latLng, latLng);
                        }

                        results.push({
                            name: f.properties.name,
                            center: latLng,
                            bbox: bbox
                        });
                    }
                }

                cb.call(context, results);
            });
        },

        suggest: function (query, cb, context) {
            return this.geocode(query, cb, context);
        },

        reverse: function (latLng, cb, context) {
            // Not yet implemented in Photon
            // https://github.com/komoot/photon/issues/19
            cb.call(context, []);
        }
    });

    L.Control.Geocoder.photon = function (options) {
        return new L.Control.Geocoder.Photon(options);
    };

    return L.Control.Geocoder;
}));
 //**************
 //  EasyPrint
 L.Control.EasyPrint = L.Control.extend({
     options: {
         position: 'topleft',
         title: 'Print',
         print: 'Print',
         cancel: 'cancel',
         copyright: '',
         defaulttitle: '',
         defaultdesc: ''
     },

     onAdd: function (map) {
         var options = this.options;
         var container = L.DomUtil.create('div', 'leaflet-control-easyPrint leaflet-bar leaflet-control');

         container.title = options.title;
         this.link = L.DomUtil.create('a', 'leaflet-control-easyPrint-button leaflet-bar-part', container);
         this.link.href = '#';

         L.DomEvent
             .on(container, 'click', function (e) {
                 L.DomEvent.stopPropagation(e);
                 L.DomEvent.preventDefault(e);

                 L.easyPrint(options);
             });


         jQuery('body').on('click', '.easySDImapPrintOk', function (e) {
             e.preventDefault();
             window.print();
         });

         jQuery('body').on('click', '.easySDImapPrintCancel', function (e) {
             e.preventDefault();
             L.easyPrintCancel();
         });

         return container;
     }

 });

 L.easyPrintControl = function (options) {
     return new L.Control.EasyPrint(options);
 };

 //*********************

 L.easyPrint = function (options) {

     var container = jQuery('.leaflet-control-easyPrint');
     var mapContainer = container.parents('.leaflet-container');

     var width = mapContainer.width();
     var height = mapContainer.height();

     //  container.width(width);
     //  container.height(height);

     if (options.defaulttitle == undefined) options.defaulttitle = '';
     if (options.defaultdesc == undefined) options.defaultdesc = '';

     jQuery('body').addClass('easySDImapPrint');

     jQuery('body *').addClass('mapPrintHideMe');


     var printBlock = container.parents('.easySDImapPrintBlock');
     if (printBlock.length === 0) printBlock = container;

     printBlock.parents().removeClass('mapPrintHideMe');
     printBlock.find('*.mapPrintHideMe').removeClass('mapPrintHideMe');
     printBlock.removeClass('mapPrintHideMe');


     var html = '<div class="easySDImapPrintMeta">';
     html += '<input type="text" class="easySDImapPrintTitle" value="' + options.defaulttitle + '" placeholder="Titre"/>';
     html += '<textarea type="text" class="easySDImapPrintDesc">' + options.defaultdesc + '</textarea>';
     html += '<p class="easySDImapPrintCopyright">' + options.copyright + '</p>';
     html += '</div>';
     html += '<div class="easySDImapPrintButtons">';
     html += '<a href="#" class="easySDImapPrintOk btn btn-lg btn-large btn-primary">' + options.print + '</a>';
     html += '<a href="#" class="easySDImapPrintCancel btn btn-lg btn-large btn-default">' + options.cancel + '</a>';
     html += '</div>';
     //console.log(mapContainer);
     ///console.log(container);
     mapContainer.after(html);

     jQuery('.easySDImapPrintMeta, .easySDImapPrintButtons').width(width);
     jQuery("html, body").animate({
         scrollTop: jQuery(document).height()
     }, 1000);
 };




 L.easyPrintCancel = function () {
     jQuery('.easySDImapPrint').removeClass('easySDImapPrint');
     jQuery('.mapPrintHideMe').removeClass('mapPrintHideMe');
     jQuery('.easySDImapPrintMeta').remove();
     jQuery('.easySDImapPrintButtons').remove();
 };
(function(r){"object"===typeof exports&&"undefined"!==typeof module?module.exports=r():"function"===typeof define&&define.Ka?define([],r):("undefined"!==typeof window?window:"undefined"!==typeof global?global:"undefined"!==typeof self?self:this).WMSCapabilities=r()})(function(){return function f(h,a,e){function g(c,l){if(!a[c]){if(!h[c]){var b="function"==typeof require&&require;if(!l&&b)return b(c,!0);if(m)return m(c,!0);b=Error("Cannot find module '"+c+"'");throw b.code="MODULE_NOT_FOUND",b;}b=
a[c]={exports:{}};h[c][0].call(b.exports,function(a){var b=h[c][1][a];return g(b?b:a)},b,b.exports,f,h,a,e)}return a[c].exports}for(var m="function"==typeof require&&require,c=0;c<e.length;c++)g(e[c]);return g}({1:[function(f,h){h.exports=f("./src/wms")},{"./src/wms":6}],2:[function(f,h){h.exports={u:1,Ba:2,ba:3,M:4,Ga:5,Fa:6,Ja:7,Ca:8,o:9,Ea:10,Da:11,Ia:12}},{}],3:[function(f,h){h.exports=function(a){return void 0!==a}},{}],4:[function(f,h){h.exports=function(a,e,g){return e in a?a[e]:a[e]=g}},{}],
5:[function(f,h){var a=f("./isdef"),e=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;h.exports={trim:function(a){return a.replace(e,"")},m:function(e,f,c){e=a(c)?e.toFixed(c):String(e);c=e.indexOf(".");-1==c&&(c=e.length);f=Math.max(0,f-c);return Array(f+1).join("0")+e}}},{"./isdef":3}],6:[function(f,h){function a(a){this.version=void 0;this.v=new e;this.F=a}var e=f("./xml_parser"),g=f("./utils/isdef"),m=f("./node_types"),c=f("./utils/setifundefined"),d=f("./xsd"),l=f("./xlink"),b=e.va;a.prototype.data=function(a){this.F=
a;return this};a.prototype.toJSON=function(a){a=a||this.F;return this.parse(a)};a.prototype.parse=function(a){return this.oa(this.v.za(a))};a.prototype.oa=function(a){for(a=a.firstChild;a;a=a.nextSibling)if(a.nodeType==m.u)return this.ya(a);return null};a.prototype.ya=function(c){this.version=c.getAttribute("version");return e.b({version:this.version},a.Y,c,[])||null};a.ca=function(c,b){return e.b({},a.K,c,b)};a.ea=function(a){var c=d.s,b=[c(a.getAttribute("minx")),c(a.getAttribute("miny")),c(a.getAttribute("maxx")),
c(a.getAttribute("maxy"))],c=[c(a.getAttribute("resx")),c(a.getAttribute("resy"))];return{crs:a.getAttribute("CRS")||a.getAttribute("SRS"),extent:b,res:c}};a.ma=function(c,b){var d=e.b({},a.T,c,b);if(g(d)){var l=d.westBoundLongitude,k=d.southBoundLatitude,f=d.eastBoundLongitude,d=d.northBoundLatitude;return g(l)&&g(k)&&g(f)&&g(d)?[l,k,f,d]:void 0}};a.fa=function(c,b){return e.b({},a.L,c,b)};a.ta=function(c,b){return e.b({},a.$,c,b)};a.ia=function(c,b){return e.b({},a.O,c,b)};a.ja=function(c,b){return e.b({},
a.P,c,b)};a.ha=function(c,b){return e.b({},a.N,c,b)};a.na=function(c,b){return e.b([],a.S,c,b)};a.ga=function(c,b){return e.b({},a.D,c,b)};a.qa=function(b,l){var f=l[l.length-1],h=e.b({},a.D,b,l);if(g(h)){var k=d.i(b.getAttribute("queryable"));g(k)||(k=f.queryable);h.queryable=g(k)?k:!1;k=d.C(b.getAttribute("cascaded"));g(k)||(k=f.cascaded);h.cascaded=k;k=d.i(b.getAttribute("opaque"));g(k)||(k=f.opaque);h.opaque=g(k)?k:!1;k=d.i(b.getAttribute("noSubsets"));g(k)||(k=f.noSubsets);h.noSubsets=g(k)?k:
!1;k=d.s(b.getAttribute("fixedWidth"));g(k)||(k=f.fixedWidth);h.fixedWidth=k;k=d.s(b.getAttribute("fixedHeight"));g(k)||(k=f.fixedHeight);h.fixedHeight=k;for(var m=["Style","CRS","AuthorityURL"],k=0,t=m.length;k<t;k++){var n=m[k],q=f[n];if(g(q)){var p=c(h,n,[]),p=p.concat(q);h[n]=p}}m="EX_GeographicBoundingBox BoundingBox Dimension Attribution MinScaleDenominator MaxScaleDenominator".split(" ");k=0;for(t=m.length;k<t;k++)n=m[k],p=h[n],g(p)||(q=f[n],h[n]=q);return h}};a.la=function(a){return{name:a.getAttribute("name"),
units:a.getAttribute("units"),unitSymbol:a.getAttribute("unitSymbol"),"default":a.getAttribute("default"),multipleValues:d.i(a.getAttribute("multipleValues")),nearestValue:d.i(a.getAttribute("nearestValue")),current:d.i(a.getAttribute("current")),values:d.a(a)}};a.h=function(c,b){return e.b({},a.U,c,b)};a.sa=function(c,b){return e.b({},a.Z,c,b)};a.ka=function(c,b){return e.b({},a.R,c,b)};a.pa=function(c,b){return e.b({},a.V,c,b)};a.w=function(c,b){return e.b({},a.X,c,b)};a.H=function(c,b){var e=a.h(c,
b);if(g(e)){var l=d.C,l=[l(c.getAttribute("width")),l(c.getAttribute("height"))];e.size=l;return e}};a.da=function(c,b){var d=a.h(c,b);if(g(d))return d.name=c.getAttribute("name"),d};a.ra=function(c,b){var d=a.h(c,b);if(g(d))return d.type=c.getAttribute("type"),d};a.ua=function(c,b){return e.b({},a.aa,c,b)};a.G=function(c,b){return e.b([],a.W,c,b)};a.c=[null,"http://www.opengis.net/wms"];a.Y=e.f(a.c,{Service:b(a.ta),Capability:b(a.fa)});a.L=e.f(a.c,{Request:b(a.sa),Exception:b(a.na),Layer:b(a.ga)});
a.$=e.f(a.c,{Name:b(d.a),Title:b(d.a),Abstract:b(d.a),KeywordList:b(a.G),OnlineResource:b(l.A),ContactInformation:b(a.ia),Fees:b(d.a),AccessConstraints:b(d.a),LayerLimit:b(d.B),MaxWidth:b(d.B),MaxHeight:b(d.B)});a.O=e.f(a.c,{ContactPersonPrimary:b(a.ja),ContactPosition:b(d.a),ContactAddress:b(a.ha),ContactVoiceTelephone:b(d.a),ContactFacsimileTelephone:b(d.a),ContactElectronicMailAddress:b(d.a)});a.P=e.f(a.c,{ContactPerson:b(d.a),ContactOrganization:b(d.a)});a.N=e.f(a.c,{AddressType:b(d.a),Address:b(d.a),
City:b(d.a),StateOrProvince:b(d.a),PostCode:b(d.a),Country:b(d.a)});a.S=e.f(a.c,{Format:e.J(d.a)});a.D=e.f(a.c,{Name:b(d.a),Title:b(d.a),Abstract:b(d.a),KeywordList:b(a.G),CRS:e.g(d.a),EX_GeographicBoundingBox:b(a.ma),BoundingBox:e.g(a.ea),Dimension:e.g(a.la),Attribution:b(a.ca),AuthorityURL:e.g(a.da),Identifier:e.g(d.a),MetadataURL:e.g(a.ra),DataURL:e.g(a.h),FeatureListURL:e.g(a.h),Style:e.g(a.ua),MinScaleDenominator:b(d.j),MaxScaleDenominator:b(d.j),Layer:e.g(a.qa)});a.K=e.f(a.c,{Title:b(d.a),OnlineResource:b(l.A),
LogoURL:b(a.H)});a.T=e.f(a.c,{westBoundLongitude:b(d.j),eastBoundLongitude:b(d.j),southBoundLatitude:b(d.j),northBoundLatitude:b(d.j)});a.Z=e.f(a.c,{GetCapabilities:b(a.w),GetMap:b(a.w),GetFeatureInfo:b(a.w)});a.X=e.f(a.c,{Format:e.g(d.a),DCPType:e.g(a.ka)});a.R=e.f(a.c,{HTTP:b(a.pa)});a.V=e.f(a.c,{Get:b(a.h),Post:b(a.h)});a.aa=e.f(a.c,{Name:b(d.a),Title:b(d.a),Abstract:b(d.a),LegendURL:e.g(a.H),StyleSheetURL:b(a.h),StyleURL:b(a.h)});a.U=e.f(a.c,{Format:b(d.a),OnlineResource:b(l.A)});a.W=e.f(a.c,
{Keyword:e.J(d.a)});h.exports=a},{"./node_types":2,"./utils/isdef":3,"./utils/setifundefined":4,"./xlink":7,"./xml_parser":8,"./xsd":9}],7:[function(f,h){h.exports={A:function(a){return a.getAttributeNS("http://www.w3.org/1999/xlink","href")}}},{}],8:[function(f,h){function a(){this.v=new DOMParser}var e=f("./utils/isdef"),g=f("./utils/setifundefined"),m=f("./node_types");a.prototype.za=function(a){return this.v.parseFromString(a,"application/xml")};a.l=function(c){return a.I(c,!1,[]).join("")};a.I=
function(c,d,e){if(c.nodeType===m.M||c.nodeType===m.ba)d?e.push(String(c.nodeValue).replace(/(\r\n|\r|\n)/g,"")):e.push(c.nodeValue);else for(c=c.firstChild;c;c=c.nextSibling)a.I(c,d,e);return e};a.xa=function(c,d,l){for(d=a.firstElementChild(d);d;d=a.nextElementSibling(d)){var b=c[d.namespaceURI||null];e(b)&&(b=b[d.localName],e(b)&&b.call(void 0,d,l))}};a.firstElementChild=function(a){for(a=a.firstElementChild||a.firstChild;a&&a.nodeType!==m.u;)a=a.nextSibling;return a};a.nextElementSibling=function(a){for(a=
a.nextElementSibling||a.nextSibling;a&&a.nodeType!==m.u;)a=a.nextSibling;return a};a.f=function(c,d){return a.wa(c,d)};a.wa=function(a,d){var l=e(void 0)?void 0:{},b,f;b=0;for(f=a.length;b<f;++b)l[a[b]]=d;return l};a.va=function(a,d,l){return function(b,f){var g=a.call(e(l)?l:this,b,f);if(e(g)){var h=f[f.length-1],m=e(d)?d:b.localName;h[m]=g}}};a.g=function(a){return function(d,f){var b=a.call(e(void 0)?void 0:this,d,f);if(e(b)){var h=f[f.length-1],m=e(void 0)?void 0:d.localName;g(h,m,[]).push(b)}}};
a.J=function(a){return function(d,f){var b=a.call(e(void 0)?void 0:this,d,f);e(b)&&f[f.length-1].push(b)}};a.b=function(c,d,e,b){b.push(c);a.xa(d,e,b);return b.pop()};h.exports=a},{"./node_types":2,"./utils/isdef":3,"./utils/setifundefined":4}],9:[function(f,h){var a=f("./utils/isdef"),e=f("./utils/string"),g=f("./xml_parser"),m={Ha:"http://www.w3.org/2001/XMLSchema",La:function(a){a=g.l(a);return m.i(a)},i:function(c){if(c=/^\s*(true|1)|(false|0)\s*$/.exec(c))return a(c[1])||!1},Ma:function(c){c=
g.l(c);if(c=/^\s*(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(Z|(?:([+\-])(\d{2})(?::(\d{2}))?))\s*$/.exec(c)){var d=Date.UTC(parseInt(c[1],10),parseInt(c[2],10)-1,parseInt(c[3],10),parseInt(c[4],10),parseInt(c[5],10),parseInt(c[6],10))/1E3;if("Z"!=c[7]){var e="-"==c[8]?-1:1,d=d+60*e*parseInt(c[9],10);a(c[10])&&(d+=3600*e*parseInt(c[10],10))}return d}},j:function(a){a=g.l(a);return m.s(a)},s:function(a){if(a=/^\s*([+\-]?\d*\.?\d+(?:e[+\-]?\d+)?)\s*$/i.exec(a))return parseFloat(a[1])},B:function(a){a=
g.l(a);return m.C(a)},C:function(a){if(a=/^\s*(\d+)\s*$/.exec(a))return parseInt(a[1],10)},a:function(a){a=g.l(a);return e.trim(a)},Na:function(a,d){m.Aa(a,d?"1":"0")},Oa:function(a,d){var e=new Date(1E3*d),b=e.getUTCFullYear()+"-"+b.m(e.getUTCMonth()+1,2)+"-"+b.m(e.getUTCDate(),2)+"T"+b.m(e.getUTCHours(),2)+":"+b.m(e.getUTCMinutes(),2)+":"+b.m(e.getUTCSeconds(),2)+"Z";a.appendChild(g.o.createTextNode(b))},Pa:function(a,d){a.appendChild(g.o.createTextNode(d.toPrecision()))},Qa:function(a,d){a.appendChild(g.o.createTextNode(d.toString()))},
Aa:function(a,d){a.appendChild(g.o.createTextNode(d))}};h.exports=m},{"./utils/isdef":3,"./utils/string":5,"./xml_parser":8}]},{},[1])(1)});

L.Control.Sidebar = L.Control.extend({
    includes: L.Mixin.Events,

    initialize: function (id, options) {
        var i, child;

        L.setOptions(this, options);

        // Find sidebar HTMLElement
        this._sidebar = L.DomUtil.get(id);

        // Attach touch styling if necessary
        if (L.Browser.touch)
            L.DomUtil.addClass(this._sidebar, 'leaflet-touch');

        // Find sidebar > ul.sidebar-tabs and sidebar > div.sidebar-content
        for (i = this._sidebar.children.length - 1; i >= 0; i--) {
            child = this._sidebar.children[i];
            if (child.tagName == 'UL' &&
                L.DomUtil.hasClass(child, 'sidebar-tabs'))
                this._tabs = child;

            else if (child.tagName == 'DIV' &&
                L.DomUtil.hasClass(child, 'sidebar-content'))
                this._container = child;
        }

        // Find sidebar > ul.sidebar-tabs > li
        this._tabitems = [];
        for (i = this._tabs.children.length - 1; i >= 0; i--) {
            child = this._tabs.children[i];
            if (child.tagName == 'LI') {
                this._tabitems.push(child);
                child._sidebar = this;
            }
        }

        // Find sidebar > div.sidebar-content > div.sidebar-pane
        this._panes = [];
        for (i = this._container.children.length - 1; i >= 0; i--) {
            child = this._container.children[i];
            if (child.tagName == 'DIV' &&
                L.DomUtil.hasClass(child, 'sidebar-pane'))
                this._panes.push(child);
        }

        this._hasTouchStart = L.Browser.touch &&
            ('ontouchstart' in document.documentElement);
    },

    addTo: function (map) {
        this._map = map;

        var e = this._hasTouchStart ? 'touchstart' : 'click';
        for (var i = this._tabitems.length - 1; i >= 0; i--) {
            var child = this._tabitems[i];
            L.DomEvent.on(child.firstChild, e, this._onClick, child);
        }

        return this;
    },

    removeFrom: function (map) {
        this._map = null;

        var e = this._hasTouchStart ? 'touchstart' : 'click';
        for (var i = this._tabitems.length - 1; i >= 0; i--) {
            var child = this._tabitems[i];
            L.DomEvent.off(child.firstChild, e, this._onClick);
        }

        return this;
    },

    open: function (id) {
        var i, child;

        // hide old active contents and show new content
        for (i = this._panes.length - 1; i >= 0; i--) {
            child = this._panes[i];
            if (child.id == id)
                L.DomUtil.addClass(child, 'active');
            else if (L.DomUtil.hasClass(child, 'active'))
                L.DomUtil.removeClass(child, 'active');
        }

        // remove old active highlights and set new highlight
        for (i = this._tabitems.length - 1; i >= 0; i--) {
            child = this._tabitems[i];
            if (child.firstChild.hash == '#' + id)
                L.DomUtil.addClass(child, 'active');
            else if (L.DomUtil.hasClass(child, 'active'))
                L.DomUtil.removeClass(child, 'active');
        }

        this.fire('content', {
            id: id
        });

        // open sidebar (if necessary)
        if (L.DomUtil.hasClass(this._sidebar, 'collapsed')) {
            this.fire('opening');
            L.DomUtil.removeClass(this._sidebar, 'collapsed');
        }

        return this;
    },

    close: function () {
        // remove old active highlights
        for (var i = this._tabitems.length - 1; i >= 0; i--) {
            var child = this._tabitems[i];
            if (L.DomUtil.hasClass(child, 'active'))
                L.DomUtil.removeClass(child, 'active');
        }

        // close sidebar
        if (!L.DomUtil.hasClass(this._sidebar, 'collapsed')) {
            this.fire('closing');
            L.DomUtil.addClass(this._sidebar, 'collapsed');
        }

        return this;
    },

    _onClick: function (e) {
        e.preventDefault();
        if (L.DomUtil.hasClass(this, 'active'))
            this._sidebar.close();
        else
            this._sidebar.open(this.firstChild.hash.slice(1));

    }
});

L.control.sidebar = function (sidebar, options) {
    return new L.Control.Sidebar(sidebar, options);
};
 easyLayer = function (map, params) {

     var options = {
         baseGroupName: '',
         addlayers: 'add layers'
     };

     jQuery.extend(options, params);

     var _this = {
         map: map,
         groups: [],
         baseLayer: {},
         layers: {},
     };

     var container = null;

     var isset = function (variable) {
         return typeof (variable) != "undefined" && variable !== null;
     };


     function debounce(func, wait, immediate) { //http://davidwalsh.name/essential-javascript-functions
         var timeout;
         return function () {
             var context = this,
                 args = arguments;
             var later = function () {
                 timeout = null;
                 if (!immediate) func.apply(context, args);
             };
             var callNow = immediate && !timeout;
             clearTimeout(timeout);
             timeout = setTimeout(later, wait);
             if (callNow) func.apply(context, args);
         };
     };



     var onLayerChange = function (e) {
         var layerId = L.Util.stamp(e.layer);
         if (e.type === 'layeradd') {
             onLayerOn(layerId);
         } else {
             onLayerOff(layerId);
         }
     }

     //map events
     map.on('layeradd', onLayerChange, this)
         .on('layerremove', onLayerChange, this)
         .on('zoomend', function () {
             _this.update();
         });

     var getLayerById = function (layerId) {
         var rlayer = false;
         jQuery.each(_this.baseLayer, function (i, layer) {
             var _layerId = L.Util.stamp(layer.layer);
             if (_layerId == layerId) rlayer = layer;
         });

         jQuery.each(_this.groups, function (i, group) {
             var layers = _this.layers[group];
             jQuery.each(layers, function (j, layer) {
                 var _layerId = L.Util.stamp(layer.layer);
                 if (_layerId == layerId) rlayer = layer;
             });
         });

         return rlayer;
     }

     _this.getLayerById = getLayerById;



     var onLayerOn = function (layerId) {
         container.find('.easyLayerTree .layer' + layerId).addClass('on');
         //overlay
         jQuery.each(_this.groups, function (i, group) {
             var layers = _this.layers[group];
             if (isset(layers) && isset(layers[layerId])) {
                 layers[layerId].on = true;
             }
         });
         //baselayer
         if (isset(_this.baseLayer[layerId])) {

             jQuery.each(_this.baseLayer, function (i, baselayer) {
                 //for (var i in _this.baseLayer) {
                 baselayer.on = false;
             });
             _this.baseLayer[layerId].on = true;
         }

     }

     var onLayerOff = function (layerId) {
         container.find('.easyLayerTree .layer' + layerId).removeClass('on');
         //overlay
         jQuery.each(_this.groups, function (i, group) {
             var layers = _this.layers[group];
             if (isset(layers) && isset(layers[layerId])) {
                 layers[layerId].on = false;
             }
         });
     }


     _this.addTo = function (div) {
         container = div;
         container.on('change', '.easyLayerTree input[type=checkbox]', function () {
             _this.switchLayer(this.name);
         });
         container.on('change', '.easyLayerTree input[type=radio]', function () {
             var target_id = this.value;
             jQuery.each(_this.baseLayer, function (i, blayer) {
                 if (i !== target_id) {
                     _this.switchLayer(i, 'off');
                 }
             });

             _this.switchLayer(target_id, 'on');
         });
     }


     var layerObj = function (name, layer, overlay) {
         return {
             name: name,
             layer: layer,
             overlay: overlay,
             on: null
         };
     }


     _this.addOverlay = function (layer, name, group) {
         if (-1 === jQuery.inArray(group, _this.groups)) {
             _this.addGroup(group);
             _this.layers[group] = {};
         }

         _this.layers[group][L.Util.stamp(layer)] = layerObj(name, layer, true);
         _this.update();
     }

     _this.addBaseLayer = function (layer, name) {
         _this.baseLayer[L.Util.stamp(layer)] = layerObj(name, layer, false);
         _this.update();
     }


     _this.addGroup = function (group) {
         _this.groups.push(group);
     }

     _this.setBaseGroupName = function (name) {
         options.baseGroupName = name;
         _this.update();
     }

     _this.getBaseGroupName = function () {
         return options.baseGroupName;
     }

     _this.removeGroup = function (group) {
         var index = jQuery.inArray(group, _this.groups);
         if (index > -1) {
             _this.groups.splice(index, 1);
         }

     }

     _this.switchLayer = function (layerId, mode) {
         var layerObj = getLayerById(layerId);

         if ((layerObj.on && mode !== 'on') || mode === 'off') {
             _this.map.removeLayer(layerObj.layer);

         } else {
             _this.map.addLayer(layerObj.layer);
         }
     }

     var checkZoom = function () {
         var zoom = map.getZoom();
         jQuery.each(_this.groups, function (i, group) {
             jQuery.each(_this.layers[group], function (layerId, layerObj) {
                 var zoomOk = (zoom >= layerObj.layer.options.minZoom && zoom <= layerObj.layer.options.maxZoom);
                 if (zoomOk) {
                     container.find('.easyLayerTree .layer' + layerId).removeClass('outOfZoom');
                 } else {
                     container.find('.easyLayerTree .layer' + layerId).addClass('outOfZoom');
                 }

             });
         });
     }


     _this.update = debounce(function () {
         if (container !== null) {
             container.html('<h4>' + options.title + '</h4><ul class="easyLayerTree"></ul>');

             if (Object.keys(_this.baseLayer).length > 0)
                 container.find('.easyLayerTree').append('<li><a href="#" class="grouplink basegroup">' + options.baseGroupName + '</a></li>');
             var ul = jQuery('<ul class="groupbasegroup"></ul>').appendTo(container.find('.easyLayerTree'));
             jQuery.each(_this.baseLayer, function (i, layer) {
                 var layerId = L.Util.stamp(layer.layer);
                 jQuery('<li class="baselayer layer' + layerId + (layer.on ? ' on' : '') + (isset(layer.layer.data.serviceconnector) ? ' LC_' + layer.layer.data.serviceconnector : '') + '"><label><input name="baselayer" value="' + layerId + '" type="radio" ' + (layer.on ? ' checked=checked' : '') + '> ' + layer.name + '</label></li>').appendTo(ul);

             });

             jQuery.each(_this.groups, function (i, group) {
                 container.find('.easyLayerTree').append('<li><a href="#" class="grouplink group' + i + ' data-group="' + i + '">' + group + '</a></li>');
                 var ul = jQuery('<ul class="group' + i + '"></ul>').appendTo(container.find('.easyLayerTree'));
                 jQuery.each(_this.layers[group], function (j, layer) {
                     var layerId = L.Util.stamp(layer.layer);
                     jQuery('<li class="layer' + layerId + (layer.on ? ' on' : '') + (isset(layer.layer.data.serviceconnector) ? ' LC_' + layer.layer.data.serviceconnector : '') + '"><label><input name="' + layerId + '" type="checkbox" ' + (layer.on ? ' checked=checked' : '') + '> ' + layer.name + '</label></li>').appendTo(ul);
                 });
             });

             if (options.addLayer !== false)
                 jQuery('<div><a href="#" class="addLayerBtn">' + options.addlayers + '</a></div>').appendTo(container);

             checkZoom();
         }
     }, 100);


     return _this;

 }
 easyAddLayer = function(easysdi_leaflet, layertree, serviceConnector, params) {

     var options = {
         "selectserver": "View available data from",
         "addserver": "add a server",
         "loadingtext": "loading ...",
         "nolayersfound": "No available layer"
     };
     var map = easysdi_leaflet.mapObj;

     jQuery.extend(options, params);

     var current_container = null;
     var current_service = null;

     var _this = {
         map: map,
     };

     var isset = function(variable) {
         return typeof(variable) != "undefined" && variable !== null;
     };


     function debounce(func, wait, immediate) { //http://davidwalsh.name/essential-javascript-functions
         var timeout;
         return function() {
             var context = this,
                 args = arguments;
             var later = function() {
                 timeout = null;
                 if (!immediate) func.apply(context, args);
             };
             var callNow = immediate && !timeout;
             clearTimeout(timeout);
             timeout = setTimeout(later, wait);
             if (callNow) func.apply(context, args);
         };
     };

     var setServicesAvailableSelect = function() {
         if (current_container == null || current_container.find('.service_switcher').length == 0)
             return false;

         var services = serviceConnector.getAllServices(map);
         services._new_ = {
             servicealias: '',
             name: options.addserver,
             list: true
         };

         var select = current_container.find('.service_switcher select');
         select.html('');
         for (var i in services) {
             if (services[i].list) {
                 if (current_service == null) current_service = services[i].servicealias;
                 jQuery('<option value="' + services[i].servicealias + '"' + (current_service == services[i].servicealias ? ' selected' : '') + '>' + services[i].name + '</option>').appendTo('select');
             }
         }

         setLayerAvailableSelect();
     }


     var setLayerAvailableSelect = function() {
         var ul = current_container.find('.available_layers ul');

         if (current_service == '') {
             ul.html('<form class="addservice">' +
                 '<div>' +
                 '<label>Type</label>' +
                 '<select name="type">' +
                 '<option value="WMS">Web Map Service (WMS)</option>' +
                 //'<option value="WMTS">Tiled Map Service (WMTS)</option>' +
                 //  '<option value="REST">WArcGIS REST Service (REST)</option>'+
                 '</select>' +
                 '</div>' +
                 '<div>' +
                 '<label>URL</label>' +
                 '<input type="text" name="url"/>' +
                 '</div>' +
                 '<input type="submit" value="' + options.addserver + '" />' +
                 '</form>');

             return false;
         }

         if (current_container == null || current_container.find('.available_layers').length == 0)
             return false;


         var layers = serviceConnector.getServiceLayers(current_service);

         if (layers === null) {
             ul.html(options.loadingtext);
             setTimeout(setLayerAvailableSelect, 500);
             setTimeout(setServicesAvailableSelect, 500);
             return false;
         }

         ul.html('');
         if (layers.length == 0) {
             ul.html('<p class="warning">' + options.nolayersfound + '</p>')
         }
         for (var i in layers) {
             var l = layers[i];

             if (isset(l.Title)) {
                 var title = l.Title;
                 var alias = l.Name;
                 jQuery('<li><a href="#" data-layer="' + alias + '">' + title + '</a></li>').appendTo(ul);
             }


             if (typeof l === 'string') jQuery('<li><a href="#" data-layer="' + l + '">' + l + '</a></li>').appendTo(ul);


         }
     }

     var addLayer = function(servicealias, layeralias) {
         var cap = serviceConnector.getCapabilities(servicealias);
         var layer = serviceConnector.getLayerData(cap, layeralias);
         var service = serviceConnector.services[servicealias];

         var overlay = true;
         var show = true;
         var group = options.defaultGroup;

         if (service.serviceconnector == 'WMS')
             var data = {
                 name: layer.Title,
                 serviceconnector: service.serviceconnector,
                 serviceurl: service.serviceurl,
                 servicealias: servicealias,
                 layername: layeralias,
                 opacity: 1,
                 format: 'image/png',
                 attribution: serviceConnector.getAttribution(layer),
                 style: '',
                 bounds: '',
                 maxZoom: '',
                 zIndex: 10000
             };


         if (service.serviceconnector == 'WMTS')
             var data = {
                 name: layer.Title,
                 serviceconnector: service.serviceconnector,
                 serviceurl: service.serviceurl,
                 servicealias: servicealias,
                 layername: layeralias,
                 opacity: 1,
                 format: 'image/png',
                 attribution: serviceConnector.getAttribution(layer),
                 style: '',
                 bounds: '',
                 maxZoom: '',
                 zIndex: 10000
                     // !TODO gestion des tilematrix, va necessiter proj4
             };

         if (service.serviceconnector == 'Google') {
             var data = {
                 name: 'Google ' + layeralias,
                 serviceconnector: service.serviceconnector,
                 servicealias: servicealias,
                 layername: layeralias,
                 opacity: 1
             };
             overlay = false;
             group = null;
         }

         if (service.serviceconnector == 'OSM') {
             var data = {
                 name: 'OSM ' + layeralias,
                 serviceconnector: service.serviceconnector,
                 servicealias: servicealias,
                 layername: layeralias,
                 opacity: 1
             };
             overlay = false;
             group = null;
         }

         if (service.serviceconnector == 'Bing') {
             var data = {
                 name: 'Bing ' + layeralias,
                 serviceconnector: service.serviceconnector,
                 servicealias: servicealias,
                 layername: layeralias,
                 opacity: 1
             };
             overlay = false;
             group = null;
         }




         easysdi_leaflet.addLayer(data, overlay, show, group);
         if (overlay == false) {
             console.log('la couche ' + data.name + ' a été ajoutée aux couches de fond');
             // !TODO gerer l'ajoute de baselayer
         }
     }


     _this.show = function(container) {


         current_container = container;
         jQuery('<div class="service_switcher">' +
             '<label>' + options.selectserver + '</label>' +
             '<select class="services"></select>' +
             '</div>' +
             '<div class="available_layers"><ul></ul></div>').appendTo(container);
         setServicesAvailableSelect();

         container.on('change', '.service_switcher select', function() {
             current_service = jQuery(this).val();
             setLayerAvailableSelect();
         });

         container.on('click', '.available_layers a', function(e) {
             e.preventDefault();
             var layer = jQuery(this).data('layer');
             addLayer(current_service, layer);
         });

         container.on('submit', '.addservice', function(e) {
             e.preventDefault();
             var url = jQuery(this).find('input[name=url]').val();
             var type = jQuery(this).find('select[name=type]').val();
             var data = {
                 serviceconnector: type,
                 servicetype: 'physical',
                 serviceurl: url,
                 servicealias: url
             };
             current_service = url;
             var ns = serviceConnector.addService(data);
             ns.list = true;
             setLayerAvailableSelect();
         });
     }




     return _this;

 }
 easyLegend = function (map, layertree, serviceconnector, params) {

     var options = {
         "zoomOnExtends": "Zoom on layer",
         "order": "Order",
         "download": "Download",
         "metadata": "Info",
         "remove": "Remove",
         "openLegend": "Open",
         "legendTitle": "Legend"
     };

     jQuery.extend(options, params);

     var _this = {
         map: map,
         layertree: layertree,
     };

     var container = null;

     var isset = function (variable) {
         return typeof (variable) != "undefined" && variable !== null;
     };


     function debounce(func, wait, immediate) { //http://davidwalsh.name/essential-javascript-functions
         var timeout;
         return function () {
             var context = this,
                 args = arguments;
             var later = function () {
                 timeout = null;
                 if (!immediate) func.apply(context, args);
             };
             var callNow = immediate && !timeout;
             clearTimeout(timeout);
             timeout = setTimeout(later, wait);
             if (callNow) func.apply(context, args);
         };
     };



     map.on('layeradd', function () {
         _this.update();
     })
         .on('layerremove', function () {
             _this.update();
         })
         .on('zoomend', function () {
             _this.update();
         });

     window.addEventListener('getCapabilities', function (e) {
         _this.update();
     });



     _this.addTo = function (div) {
         container = div;

         container.on('click', '.removeLayer', function (event) {
             event.preventDefault();
             layertree.switchLayer(jQuery(this).data('layerid'), 'off');
             layertree.update();
         });

         container.on('click', '.zoomlink', function (event) {
             event.preventDefault();
             var bb = jQuery(this).data('bbox').split(',');
             bb = L.latLngBounds([
                 [bb[1], bb[0]],
                 [bb[3], bb[2]]
             ]);
             map.fitBounds(bb);
             return false;
         });


     }

     var getIGNlegend = function (layername, zoom) {
         if (layername == 'GEOGRAPHICALGRIDSYSTEMS.CASSINI')
             return 'http://www.geoportail.gouv.fr/depot/api/legende/LEG_GEOGRAPHICALGRIDSYSTEMS_ETATMAJOR.jpg';

         if (layername == 'GEOGRAPHICALGRIDSYSTEMS.ETATMAJOR' || layername == 'GEOGRAPHICALGRIDSYSTEMS.ETATMAJOR40')
             return 'http://www.geoportail.gouv.fr/depot/api/legende/LEG_GEOGRAPHICALGRIDSYSTEMS_CASSINI.jpg';


         if (layername == 'GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN-EXPRESS.STANDARD') {
             if (zoom >= 18) return 'http://www.geoportail.gouv.fr/depot/api/legende/LEG_GM_SCAN-EXPRESS_STANDARD_GE.jpg';
             if (zoom >= 15) return 'http://www.geoportail.gouv.fr/depot/api/legende/LEG_GM_SCAN-EXPRESS_STANDARD_25K.jpg';
             if (zoom >= 11) return 'http://www.geoportail.gouv.fr/depot/api/legende/LEG_GM_SCAN-EXPRESS_STANDARD_100K.jpg';
             if (zoom >= 9) return 'http://www.geoportail.gouv.fr/depot/api/legende/LEG_GM_SCAN-EXPRESS_STANDARD_250K.jpg';
             return 'http://www.geoportail.gouv.fr/depot/api/legende/LEG_GM_SCAN-EXPRESS_STANDARD_1000K.jpg';
         }

         if (layername == 'GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN-EXPRESS.CLASSIQUE') {
             if (zoom >= 18) return 'http://www.geoportail.gouv.fr/depot/api/legende/LEG_GM_SCAN-EXPRESS_CLASSIQUE_GE.jpg';
             if (zoom >= 15) return 'http://www.geoportail.gouv.fr/depot/api/legende/LEG_GM_SCAN-EXPRESS_CLASSIQUE_25K.jpg';
             if (zoom >= 11) return 'http://www.geoportail.gouv.fr/depot/api/legende/LEG_GM_SCAN-EXPRESS_CLASSIQUE_100K.jpg';
             if (zoom >= 9) return 'http://www.geoportail.gouv.fr/depot/api/legende/LEG_GM_SCAN-EXPRESS_CLASSIQUE_250K.jpg';
             return 'http://www.geoportail.gouv.fr/depot/api/legende/LEG_GM_SCAN-EXPRESS_CLASSIQUE_1000K.jpg';
         }

         if (layername == 'GEOGRAPHICALGRIDSYSTEMS.MAPS') {
             if (zoom >= 18) return false;
             if (zoom >= 15) return false;
             if (zoom >= 13) return 'http://www.geoportail.gouv.fr/depot/api/legende/LEG_GEOGRAPHICALGRIDSYSTEMS_SCANDEP.jpg';
             return 'http://www.geoportail.gouv.fr/depot/api/legende/LEG_GEOGRAPHICALGRIDSYSTEMS_SCANREG.jpg';
         }

         if (layername == 'ADMINISTRATIVEUNITS.BOUNDARIES')
             return 'http://www.geoportail.gouv.fr/depot/api/legende/LEG_ADMINISTRATIVEUNITS_BOUNDARIES.jpg';

         return false;
     }


     var addLegendBtns = function (target, layer) {
         var layerId = L.Util.stamp(layer.layer);
         var btn_div = jQuery('<div class="action_btns"></div>');
         target.append(btn_div);

         //  console.log(layer.layer.data.layername, serviceconnector.getQueryable(layer.layer));

         var bb = serviceconnector.getBBox(layer.layer, map);
         if (bb !== false && bb !== null)
             jQuery('<a href="#"  class="zoomlink" rel="tooltip" data-bbox="' + bb.toBBoxString() + '" title="' + options.zoomOnExtends + '"><i class="fa fa-search"></i></a>').appendTo(btn_div);

         if (options.layerorder !== false && layer.layer.data.hasextraction == 1)
             jQuery('<a href="' + layer.layer.data.extractionurl + '" target=_blank class="commandlink" rel="tooltip" title="' + options.order + '"><i class="fa fa-shopping-cart"></i></a>').appendTo(btn_div);

         if (options.layerdownload !== false && layer.layer.data.hasdownload == 1)
             jQuery('<a href="' + layer.layer.data.downloadurl + '" target=_blank class="downloadlink" rel="tooltip" title="' + options.download + '"><i class="fa fa-download"></i></a>').appendTo(btn_div);

         if (options.layerdetailsheet !== false && isset(layer.layer.data.metadatalink) && layer.layer.data.metadatalink !== '')
             jQuery('<a href="' + layer.layer.data.metadatalink + '" target=_blank class="metadatalink" rel="tooltip" title="' + options.metadata + '"><i class="fa fa-info-circle"></i></a>').appendTo(btn_div);

         if (layer.overlay === true)
             jQuery('<a href="#" class="removeLayer" data-layerId="' + layerId + '" rel="tooltip" title="' + options.remove + '"><i class="fa fa-times-circle"></i></a>').appendTo(btn_div);



     }


     var addLegendImage = function (target, layer, map) {
         var url = false;
         if (isset(layer.legendUrl)) {
             url = layer.legendUrl;
         } else {
             var zoom = map.getZoom();
             var legendUrl = serviceconnector.getLegendURL(layer.layer);
             url = legendUrl;

             // gestion legendes IGN
             if (url == 'http://www.geoportail.gouv.fr/depot/LEGEND.jpg') {
                 url = getIGNlegend(layer.layer.data.layername, zoom);
             }

             if (url === false) {
                 url = serviceconnector.getLegendGraphic(layer.layer, map);
             }

         }
         if (url != false && url != null) {
             html = '<br>';
             html += '<a href="' + url + '" target=_blank title="' + options.openLegend + '" rel="tooltip"><img src="' + url + '" alt=""/></a>';
             target.append(html);
         }

     }



     _this.update = debounce(function () {
         if (container !== null) {
             container.html('<h4>' + options.title + '<br><small>' + options.legendTitle + '</small></h4><ul class="easyLegend"></ul>');
             var lastGroup = '';



             for (var i in layertree.baseLayer) {
                 var layer = layertree.baseLayer[i];
                 if (layer.on) {
                     if (lastGroup !== 'baselayer') {
                         container.find('.easyLegend').append('<li><a href="#" class="grouplink basegroup">' + layertree.getBaseGroupName() + '</a></li>');
                         var ul = jQuery('<ul class="group' + i + '"></ul>').appendTo(container.find('.easyLegend'));
                         lastGroup = 'baselayer';
                     }
                     var li = jQuery('<li class="baselayer layer' + i + (isset(layer.layer.data.serviceconnector) ? ' LC_' + layer.layer.data.serviceconnector : '') + '"></li>').appendTo(ul);
                     addLegendBtns(li, layer);
                     jQuery('<span>' + layer.name + '</span>').appendTo(li);
                     addLegendImage(li, layer, map);
                     li.append('<div class="clearfix"></div>');

                 }
             }


             for (var i in layertree.groups) {
                 var group = layertree.groups[i];

                 for (var j in layertree.layers[group]) {
                     var layer = layertree.layers[group][j];
                     if (layer.on) {
                         if (lastGroup !== 'group' + i) {
                             container.find('.easyLegend').append('<li><a href="#" class="grouplink group' + i + ' data-group="' + i + '">' + group + '</a></li>');
                             var ul = jQuery('<ul class="group' + i + '"></ul>').appendTo(container.find('.easyLegend'));
                             lastGroup = 'group' + i;
                         }
                         var li = jQuery('<li class="layer' + j + (isset(layer.layer.data.serviceconnector) ? ' LC_' + layer.layer.data.serviceconnector : '') + '"></li>').appendTo(ul);
                         addLegendBtns(li, layer);
                         jQuery('<span>' + layer.name + '</span>').appendTo(li);
                         addLegendImage(li, layer, map);
                         li.append('<div class="clearfix"></div>');

                     }
                 }
             }
         }
     }, 100);


     return _this;

 }
L.Control.GraphicScale=L.Control.extend({options:{position:"bottomleft",updateWhenIdle:false,minUnitWidth:30,maxUnitsWidth:240,fill:false,showSubunits:false,doubleLine:false,labelPlacement:"auto"},onAdd:function(map){this._map=map;this._possibleUnitsNum=[3,5,2,4];this._possibleUnitsNumLen=this._possibleUnitsNum.length;this._possibleDivisions=[1,.5,.25,.2];this._possibleDivisionsLen=this._possibleDivisions.length;this._possibleDivisionsSub={1:{num:2,division:.5},.5:{num:5,division:.1},.25:{num:5,division:.05},.2:{num:2,division:.1}};this._scaleInner=this._buildScale();this._scale=this._addScale(this._scaleInner);this._setStyle(this.options);map.on(this.options.updateWhenIdle?"moveend":"move",this._update,this);map.whenReady(this._update,this);return this._scale},onRemove:function(map){map.off(this.options.updateWhenIdle?"moveend":"move",this._update,this)},_addScale:function(scaleInner){var scale=L.DomUtil.create("div");scale.className="leaflet-control-graphicscale";scale.appendChild(scaleInner);return scale},_setStyle:function(options){var classNames=["leaflet-control-graphicscale-inner"];if(options.fill&&options.fill!=="nofill"){classNames.push("filled");classNames.push("filled-"+options.fill)}if(options.showSubunits){classNames.push("showsubunits")}if(options.doubleLine){classNames.push("double")}classNames.push("labelPlacement-"+options.labelPlacement);this._scaleInner.className=classNames.join(" ")},_buildScale:function(){var root=document.createElement("div");root.className="leaflet-control-graphicscale-inner";var subunits=L.DomUtil.create("div","subunits",root);var units=L.DomUtil.create("div","units",root);this._units=[];this._unitsLbls=[];this._subunits=[];for(var i=0;i<5;i++){var unit=this._buildDivision(i%2===0);units.appendChild(unit);this._units.push(unit);var unitLbl=this._buildDivisionLbl();unit.appendChild(unitLbl);this._unitsLbls.push(unitLbl);var subunit=this._buildDivision(i%2===1);subunits.appendChild(subunit);this._subunits.unshift(subunit)}this._zeroLbl=L.DomUtil.create("div","label zeroLabel");this._zeroLbl.innerHTML="0";this._units[0].appendChild(this._zeroLbl);this._subunitsLbl=L.DomUtil.create("div","label subunitsLabel");this._subunitsLbl.innerHTML="?";this._subunits[4].appendChild(this._subunitsLbl);return root},_buildDivision:function(fill){var item=L.DomUtil.create("div","division");var l1=L.DomUtil.create("div","line");item.appendChild(l1);var l2=L.DomUtil.create("div","line2");item.appendChild(l2);if(fill)l1.appendChild(L.DomUtil.create("div","fill"));if(!fill)l2.appendChild(L.DomUtil.create("div","fill"));return item},_buildDivisionLbl:function(){var itemLbl=L.DomUtil.create("div","label divisionLabel");return itemLbl},_update:function(){var bounds=this._map.getBounds(),centerLat=bounds.getCenter().lat,halfWorldMeters=6378137*Math.PI*Math.cos(centerLat*Math.PI/180),dist=halfWorldMeters*(bounds.getNorthEast().lng-bounds.getSouthWest().lng)/180,size=this._map.getSize();if(size.x>0){this._updateScale(dist,this.options)}},_updateScale:function(maxMeters,options){var scale=this._getBestScale(maxMeters,options.minUnitWidth,options.maxUnitsWidth);this._render(scale)},_getBestScale:function(maxMeters,minUnitWidthPx,maxUnitsWidthPx){var possibleUnits=this._getPossibleUnits(maxMeters,minUnitWidthPx,this._map.getSize().x);var possibleScales=this._getPossibleScales(possibleUnits,maxUnitsWidthPx);possibleScales.sort(function(scaleA,scaleB){return scaleB.score-scaleA.score});var scale=possibleScales[0];scale.subunits=this._getSubunits(scale);return scale},_getSubunits:function(scale){var subdivision=this._possibleDivisionsSub[scale.unit.unitDivision];var subunit={};subunit.subunitDivision=subdivision.division;subunit.subunitMeters=subdivision.division*(scale.unit.unitMeters/scale.unit.unitDivision);subunit.subunitPx=subdivision.division*(scale.unit.unitPx/scale.unit.unitDivision);var subunits={subunit:subunit,numSubunits:subdivision.num,total:subdivision.num*subunit.subunitMeters};return subunits},_getPossibleScales:function(possibleUnits,maxUnitsWidthPx){var scales=[];var minTotalWidthPx=Number.POSITIVE_INFINITY;var fallbackScale;for(var i=0;i<this._possibleUnitsNumLen;i++){var numUnits=this._possibleUnitsNum[i];var numUnitsScore=(this._possibleUnitsNumLen-i)*.5;for(var j=0;j<possibleUnits.length;j++){var unit=possibleUnits[j];var totalWidthPx=unit.unitPx*numUnits;var scale={unit:unit,totalWidthPx:totalWidthPx,numUnits:numUnits,score:0};var totalWidthPxScore=1-(maxUnitsWidthPx-totalWidthPx)/maxUnitsWidthPx;totalWidthPxScore*=3;var score=unit.unitScore+numUnitsScore+totalWidthPxScore;if(unit.unitDivision===.25&&numUnits===3||unit.unitDivision===.5&&numUnits===3||unit.unitDivision===.25&&numUnits===5){score-=2}scale.score=score;if(totalWidthPx<maxUnitsWidthPx){scales.push(scale)}if(totalWidthPx<minTotalWidthPx){minTotalWidthPx=totalWidthPx;fallbackScale=scale}}}if(!scales.length)scales.push(fallbackScale);return scales},_getPossibleUnits:function(maxMeters,minUnitWidthPx,mapWidthPx){var exp=(Math.floor(maxMeters)+"").length;var unitMetersPow;var units=[];for(var i=exp;i>0;i--){unitMetersPow=Math.pow(10,i);for(var j=0;j<this._possibleDivisionsLen;j++){var unitMeters=unitMetersPow*this._possibleDivisions[j];var unitPx=mapWidthPx*(unitMeters/maxMeters);if(unitPx<minUnitWidthPx){return units}units.push({unitMeters:unitMeters,unitPx:unitPx,unitDivision:this._possibleDivisions[j],unitScore:this._possibleDivisionsLen-j})}}return units},_render:function(scale){this._renderPart(scale.unit.unitPx,scale.unit.unitMeters,scale.numUnits,this._units,this._unitsLbls);this._renderPart(scale.subunits.subunit.subunitPx,scale.subunits.subunit.subunitMeters,scale.subunits.numSubunits,this._subunits);var subunitsDisplayUnit=this._getDisplayUnit(scale.subunits.total);this._subunitsLbl.innerHTML=""+subunitsDisplayUnit.amount+subunitsDisplayUnit.unit},_renderPart:function(px,meters,num,divisions,divisionsLbls){var displayUnit=this._getDisplayUnit(meters);for(var i=0;i<this._units.length;i++){var division=divisions[i];if(i<num){division.style.width=px+"px";division.className="division"}else{division.style.width=0;division.className="division hidden"}if(!divisionsLbls)continue;var lbl=divisionsLbls[i];var lblClassNames=["label","divisionLabel"];if(i<num){var lblText=(i+1)*displayUnit.amount;if(i===num-1){lblText+=displayUnit.unit;lblClassNames.push("labelLast")}else{lblClassNames.push("labelSub")}lbl.innerHTML=lblText}lbl.className=lblClassNames.join(" ")}},_getDisplayUnit:function(meters){var displayUnit=meters<1e3?"m":"km";return{unit:displayUnit,amount:displayUnit==="km"?meters/1e3:meters}}});L.Map.mergeOptions({graphicScaleControl:false});L.Map.addInitHook(function(){if(this.options.graphicScaleControl){this.graphicScaleControl=new L.Control.GraphicScale;this.addControl(this.graphicScaleControl)}});L.control.graphicScale=function(options){return new L.Control.GraphicScale(options)};
 easyGetFeature = function(map, layertree, serviceconnector, params, popup_size) {

     var options = {
         "queryablelayers_title": "Select a layer",
         "noqueryablelayers": "No queryanle layer.",
         "emptyselection": "empty",
         "noresults": "nothing found"
     };

     jQuery.extend(options, params);

     var _this = {
         map: map,
         layertree: layertree,
         query: []
     };

     var container = null;
     var container_info = null;
     var container_results = null;

     var marker_layer = L.layerGroup();

     var current_layerID = null;

     var queryable = [];
     var last_event;

     var isset = function(variable) {
         return typeof(variable) != "undefined" && variable !== null;
     };


     function debounce(func, wait, immediate) { //http://davidwalsh.name/essential-javascript-functions
         var timeout;
         return function() {
             var context = this,
                 args = arguments;
             var later = function() {
                 timeout = null;
                 if (!immediate) func.apply(context, args);
             };
             var callNow = immediate && !timeout;
             clearTimeout(timeout);
             timeout = setTimeout(later, wait);
             if (callNow) func.apply(context, args);
         };
     };



     map.on('layeradd', function() {
             _this.update();
         })
         .on('layerremove', function() {
             _this.update();
         })
         .on('click', function(e) {
             _this.onclick(e);
         });

     jQuery('#sidebar').on('click', '.sidebar-tabs a', function() {
         _this.update();
     })

     window.addEventListener('getCapabilities', function(e) {
         _this.update();
     });



     _this.addTo = function(div) {
         container = div;

         container_info = jQuery('<div class="getfeature_info"></div>').appendTo(container);
         container_results = jQuery('<div class="getfeature_results"></div>').appendTo(container);

         /*container_info.on('change', 'select.queryable_layers', function() {
             current_layerID = jQuery(this).val();
         });*/

         container_results.on('click', '.removeResult', function(e) {
             e.stopPropagation();
             e.preventDefault();
             queryid = jQuery(this).data('queryid');
             removeRes(_this.query[queryid]);
         });

         container_results.on('click', '.removeAllResult', function(e) {
             e.stopPropagation();
             e.preventDefault();
             for (var i in _this.query)
                 removeRes(_this.query[i]);
         });

         container_results.on('click', '.found', function(e) {
             e.preventDefault();
             queryid = jQuery(this).data('queryid');
             showRes(_this.query[queryid]);
         });

     }

     var removeRes = function(queryRes) {
         queryRes.html = false;
         if (isset(queryRes.obj))
             marker_layer.removeLayer(queryRes.obj);
         _this.updateResults();
     };

     var showRes = function(queryRes) {
         queryRes.obj.openPopup();
         map.panTo(queryRes.latlng);
     };

     var collapse_start =
         '<div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true">';



     var collapse_end = '</div>';

     var tmp_collapse = "";
     var nbr_active_layer = 0;
     var first_layer;

     _this.onclick = function(e) {
         nbr_active_layer = 0;
         first_layer = "in";
         layertree.groups.forEach(function(group) {
             for (var index in layertree.layers[group]) {
                 var attr = layertree.layers[group][index];
                 if (attr.on == true) {
                     nbr_active_layer++;
                 }

             };
         });
         tmp_collapse = "";
         if (jQuery('.leaflet-zoom-box-crosshair').length == 0) {

             layertree.groups.forEach(function(group) {
                 for (var index in layertree.layers[group]) {

                     var attr = layertree.layers[group][index];
                     if (attr.on == true) {
                         last_event = e;
                         _this.getFeature(layertree.getLayerById(attr.layer._leaflet_id), e);
                     }
					
                 };
             });
			
         }
     }





     _this.getFeature = function(layer, event /*= last_event crash Ie*/ ) {

         var loc = event.containerPoint;
         var url = serviceconnector.getFeatureUrl(layer.layer, map, loc);

         request = {
             loading: true,
             layer: layer,
             latlng: event.latlng,
         };
         _this.query.push(request);
         var id = _this.query.length - 1;
         request = _this.query[id];
         request.id = id;
         request.html = "";
         jQuery.ajax({
             type: "GET",
             url: url,
             success: function(data) {
                 request.loading = false;
				 
                 if (data != null) {
                     var table = jQuery('<div></div>').html(data).find('table');
					 var ul = jQuery('<div></div>').html(data).find('ul');
                     if (table.length > 0) {
                         jQuery.each(table, function() {
                             request.html = '<table class="featureInfo easygetfeature_table">' + jQuery(this).html() + '</table>';
                         });
                         var collapse =
                             '<div class="panel panel-default">' +
                             '<div class="panel-heading" role="tab" id="headingOne">' +
                             '<h4 class="panel-title">' +
                             '<a role="button" data-toggle="collapse" data-parent="#accordion" href="#collapse' + layer.layer._leaflet_id + '" aria-expanded="true" aria-controls="collapse' + layer.layer._leaflet_id + '">' +
                             layer.name +
                             '</a>' +
                             '</h4>' +
                             '</div>' +
                             '<div id="collapse' + layer.layer._leaflet_id + '" class="panel-collapse collapse ' + first_layer + '" role="tabpanel" aria-labelledby="heading' + layer.layer._leaflet_id + '">' +
                             '<div class="panel-body">' +
                             '<pre class="featureInfo easygetfeature_pre">' + request.html + '</pre>' +
                             '</div>' +
                             '</div>' +
                             '</div>';

                         tmp_collapse += collapse;
                         request.html = collapse_start + tmp_collapse + collapse_end;
                         first_layer = "";

                         var evt = new CustomEvent('getFeature', request);
                         window.dispatchEvent(evt);
                         nbr_active_layer--;
                         _this.updateResults();

                     } else {
						 if (ul.length > 0) {
							 jQuery.each(ul, function() {
								 request.html = '<table class="featureInfo easygetfeature_table">' + jQuery(this).html() + '</table>';
							 });
							 var collapse =
								 '<div class="panel panel-default">' +
								 '<div class="panel-heading" role="tab" id="headingOne">' +
								 '<h4 class="panel-title">' +
								 '<a role="button" data-toggle="collapse" data-parent="#accordion" href="#collapse' + layer.layer._leaflet_id + '" aria-expanded="true" aria-controls="collapse' + layer.layer._leaflet_id + '">' +
								 layer.name +
								 '</a>' +
								 '</h4>' +
								 '</div>' +
								 '<div id="collapse' + layer.layer._leaflet_id + '" class="panel-collapse collapse ' + first_layer + '" role="tabpanel" aria-labelledby="heading' + layer.layer._leaflet_id + '">' +
								 '<div class="panel-body">' +
								 '<pre class="featureInfo easygetfeature_pre">' + request.html + '</pre>' +
								 '</div>' +
								 '</div>' +
								 '</div>';

							 tmp_collapse += collapse;
							 request.html = collapse_start + tmp_collapse + collapse_end;
							 first_layer = "";

							 var evt = new CustomEvent('getFeature', request);
							 window.dispatchEvent(evt);
							 nbr_active_layer--;
							 _this.updateResults();
						 
						 } else {
							 data = data.replace('GetFeatureInfo results:', '').replace(/\s+/g, '').trim();
							 if (data.length > 0 && data.search('noresults') == -1 && data.search('nolayerwasqueryable') == -1 && data.search('<body></body>') == -1) {
								 var collapse =
									 '<div class="panel panel-default">' +
									 '<div class="panel-heading" role="tab" id="headingOne">' +
									 '<h4 class="panel-title">' +
									 '<a role="button" data-toggle="collapse" data-parent="#accordion" href="#collapse' + layer.layer._leaflet_id + '" aria-expanded="true" aria-controls="collapse' + layer.layer._leaflet_id + '">' +
									 layer.name +
									 '</a>' +
									 '</h4>' +
									 '</div>' +
									 '<div id="collapse' + layer.layer._leaflet_id + '" class="panel-collapse collapse ' + first_layer + '" role="tabpanel" aria-labelledby="heading' + layer.layer._leaflet_id + '">' +
									 '<div class="panel-body featureInfo easygetfeature_pre">' +
									 data +
									 '</div>' +
									 '</div>' +
									 '</div>';
								 
								 tmp_collapse += collapse;
								 request.html = collapse_start + tmp_collapse + collapse_end;
								 first_layer = "";

								 var evt = new CustomEvent('getFeature', request);
								 window.dispatchEvent(evt);
								 //nbr_active_layer--;
								 _this.updateResults();
							 }else{
								 nbr_active_layer--;
							 }
						 }
					 }
                 }
					setTimeout(function(){
						//_this.updateResults();
					}, 2000);
             }

         }).fail(function() {
             request.html = false;
         });
     }



     _this.update = debounce(function() {
         var queryable = [];
         jQuery(map._container).removeClass('getFeatureOn');
         if (container_info !== null) {

             container_info.html('');

             for (var i in layertree.baseLayer) {
                 var layer = layertree.baseLayer[i];
                 if (layer.on) {
                     if (serviceconnector.getQueryable(layer.layer))
                         queryable.push(layer);
                 }
             }


             for (var i in layertree.groups) {
                 var group = layertree.groups[i];
                 for (var j in layertree.layers[group]) {
                     var layer = layertree.layers[group][j];
                     if (layer.on) {
                         var query_url = serviceconnector.getQueryable(layer.layer, map);
                         if (query_url != false && query_url != null)
                             queryable.push(layer);
                     }
                 }
             }



         }
     }, 250);



     var addQueryObj = function(query) {

         var html_result = query.html;

         var nlayer = new L.Marker(query.latlng)
             .bindPopup(html_result, {
                 // className: 'easygetfeature_popup',
                 maxWidth: popup_size.popupwidth,
                 minWidth: popup_size.popupwidth,
                 minHeight: popup_size.popupheight,
                 maxHeight: popup_size.popupheight,
             })
             .addTo(marker_layer)
             .openPopup();

         if (!jQuery('#sidebar #getfeature').hasClass('active')) {
             var popup = L.popup({
                     //className: 'easygetfeature_popup',
                     maxWidth: popup_size.popupwidth,
                     minWidth: popup_size.popupwidth,
                     minHeight: popup_size.popupheight,
                     maxHeight: popup_size.popupheight,
                 })
                 .setLatLng(query.latlng)
                 .setContent(html_result)

             .openOn(map);



         }


         query.obj = nlayer;
     }

     _this.updateResults = debounce(function() {

         if (container_results !== null) {

             container_results.html('');

             var query_shown = jQuery.grep(_this.query, function(v) {
                 return v.loading == false && v.html != null && v.html != false;
             });
             if (query_shown.length > 1)
                 container_results.append('<a href="#" class="removeAllResult" rel="tooltip" title="' + options.emptyselection + '"><i class="fa fa-eraser"></i></a>');

             jQuery.each(_this.query, function(i, query) {
                 if (query.loading) {
                     var html = '<div class="query' + i + ' loading"></div>';
                     var div = jQuery(html).appendTo(container_results);
                     div.append(jQuery('<p>' + query.layer.name + '</p>'));
                     div.append(jQuery('<p><small>' + query.latlng.lat + ', ' + query.latlng.lng + '</small></p>'));
                 } else {
                     if (query.html !== false) {
                         if (query.html !== 'none') {
                             var html = '<div class="query' + i + ' found" data-queryid=' + i + '></div>';
                         } else {
                             var html = '<div class="query' + i + ' none" data-queryid=' + i + '></div>';
                         }
                         var div = jQuery(html).appendTo(container_results);
                         if (query.html !== 'none')
                             div.append('<div class="query-btns"><a href="#" class="removeResult" data-queryid="' + i + '" rel="tooltip" title="Enlever le résultat"><i class="fa fa-times-circle"></i></a></div>');
                         div.append(jQuery('<p>' + query.layer.name + '</p>'));
                         div.append(jQuery('<p><small>' + query.latlng.lat + ', ' + query.latlng.lng + '</small></p>'));
                         if (query.html !== 'none') {
                             if (query.obj == null) addQueryObj(query);
                         } else {
                             div.append(jQuery('<p class="warning"><small>' + options.noresults + '</small></p>'));
                         }
                     }

                 }
             });
             //var left = document.getElementsByClassName("easygetfeature_popup")[0].style.left.split("px")
             //left = Number(left[0]) - ((popup_size.popupwidth - document.getElementsByClassName("easygetfeature_popup")[0].clientWidth) / 2);

             //var bottom = document.getElementsByClassName("easygetfeature_popup")[0].style.bottom.split("px")

             //bottom = Number(bottom[0]) - ((popup_size.popupheight - document.getElementsByClassName("easygetfeature_popup")[0].clientHeight));



             //document.getElementsByClassName("easygetfeature_popup")[0].style.left = left + "px";
             //document.getElementsByClassName("easygetfeature_popup")[0].style.bottom = bottom + "px";
             //document.getElementsByClassName("easygetfeature_popup")[0].style.width = popup_size.popupwidth + "px";
             //document.getElementsByClassName("easygetfeature_popup")[0].style.height = popup_size.popupheight + "px";
             //document.getElementsByClassName("leaflet-popup-content-wrapper")[0].style.height = popup_size.popupheight + "px";
             //document.getElementsByClassName("leaflet-popup-content")[0].style.maxHeight = popup_size.popupheight - 20 + "px";
         }
     }, 250);


     _this.showPanel = function(sidebar) {
         sidebar.open();
         _this.update();
     }

     return _this;

 }
L.Control.Fullscreen=L.Control.extend({options:{position:"topleft",title:{"false":"View Fullscreen","true":"Exit Fullscreen"}},onAdd:function(map){var container=L.DomUtil.create("div","leaflet-control-fullscreen leaflet-bar leaflet-control");this.link=L.DomUtil.create("a","leaflet-control-fullscreen-button leaflet-bar-part",container);this.link.href="#";this._map=map;this._map.on("fullscreenchange",this._toggleTitle,this);this._toggleTitle();L.DomEvent.on(this.link,"click",this._click,this);return container},_click:function(e){L.DomEvent.stopPropagation(e);L.DomEvent.preventDefault(e);this._map.toggleFullscreen(this.options)},_toggleTitle:function(){this.link.title=this.options.title[this._map.isFullscreen()]}});L.Map.include({isFullscreen:function(){return this._isFullscreen||false},toggleFullscreen:function(options){var container=this.getContainer();if(this.isFullscreen()){if(options&&options.pseudoFullscreen){this._disablePseudoFullscreen(container)}else if(document.exitFullscreen){document.exitFullscreen()}else if(document.mozCancelFullScreen){document.mozCancelFullScreen()}else if(document.webkitCancelFullScreen){document.webkitCancelFullScreen()}else if(document.msExitFullscreen){document.msExitFullscreen()}else{this._disablePseudoFullscreen(container)}}else{if(options&&options.pseudoFullscreen){this._enablePseudoFullscreen(container)}else if(container.requestFullscreen){container.requestFullscreen()}else if(container.mozRequestFullScreen){container.mozRequestFullScreen()}else if(container.webkitRequestFullscreen){container.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT)}else if(container.msRequestFullscreen){container.msRequestFullscreen()}else{this._enablePseudoFullscreen(container)}}},_enablePseudoFullscreen:function(container){L.DomUtil.addClass(container,"leaflet-pseudo-fullscreen");this._setFullscreen(true);this.fire("fullscreenchange")},_disablePseudoFullscreen:function(container){L.DomUtil.removeClass(container,"leaflet-pseudo-fullscreen");this._setFullscreen(false);this.fire("fullscreenchange")},_setFullscreen:function(fullscreen){this._isFullscreen=fullscreen;var container=this.getContainer();if(fullscreen){L.DomUtil.addClass(container,"leaflet-fullscreen-on")}else{L.DomUtil.removeClass(container,"leaflet-fullscreen-on")}this.invalidateSize()},_onFullscreenChange:function(e){var fullscreenElement=document.fullscreenElement||document.mozFullScreenElement||document.webkitFullscreenElement||document.msFullscreenElement;if(fullscreenElement===this.getContainer()&&!this._isFullscreen){this._setFullscreen(true);this.fire("fullscreenchange")}else if(fullscreenElement!==this.getContainer()&&this._isFullscreen){this._setFullscreen(false);this.fire("fullscreenchange")}}});L.Map.mergeOptions({fullscreenControl:false});L.Map.addInitHook(function(){if(this.options.fullscreenControl){this.fullscreenControl=new L.Control.Fullscreen(this.options.fullscreenControl);this.addControl(this.fullscreenControl)}var fullscreenchange;if("onfullscreenchange"in document){fullscreenchange="fullscreenchange"}else if("onmozfullscreenchange"in document){fullscreenchange="mozfullscreenchange"}else if("onwebkitfullscreenchange"in document){fullscreenchange="webkitfullscreenchange"}else if("onmsfullscreenchange"in document){fullscreenchange="MSFullscreenChange"}if(fullscreenchange){var onFullscreenChange=L.bind(this._onFullscreenChange,this);this.whenReady(function(){L.DomEvent.on(document,fullscreenchange,onFullscreenChange)});this.on("unload",function(){L.DomEvent.off(document,fullscreenchange,onFullscreenChange)})}});L.control.fullscreen=function(options){return new L.Control.Fullscreen(options)};
/* global define, XMLHttpRequest */

const f = function fFunc(factory, window) {
    // Universal Module Definition
    if (typeof define === 'function' && define.amd) {
        define(['leaflet'], factory)
    } else if (typeof module !== 'undefined') {
        // Node/CommonJS
        module.exports = factory(require('leaflet'))
    } else {
        // Browser globals
        if (typeof window.L === 'undefined') {
            throw new Error('Leaflet must be loaded first')
        }
        factory(window.L)
    }
}

const factory = function factoryFunc(L) {
    L.GeocoderBAN = L.Control.extend({
        options: {
            position: 'topleft',
            placeholder: 'adresse',
            geographicalPriority: false,
            resultsNumber: 7,
            geographicalPriorityNumber: 300,
            collapsed: true,
            serviceUrl: 'https://api-adresse.data.gouv.fr/search/',
            minIntervalBetweenRequests: 250,
            defaultMarkgeocode: true,
            autofocus: true
        },
        includes: /*L.Evented.prototype ||*/ L.Mixin.Events,
        initialize: function(options) {
            L.Util.setOptions(this, options)
        },
        onRemove: function(map) {
            map.off('click', this.collapseHack, this)
        },
        onAdd: function(map) {
            var className = 'leaflet-control-geocoder-ban'
            var container = this.container = L.DomUtil.create('div', className + ' leaflet-bar')
            var icon = this.icon = L.DomUtil.create('button', className + '-icon', container)
            var form = this.form = L.DomUtil.create('div', className + '-form', container)
            var input

            map.on('click', this.collapseHack, this)

            icon.innerHTML = '&nbsp;'
            icon.type = 'button'

            input = this.input = L.DomUtil.create('input', '', form)
            input.type = 'text'
            input.placeholder = this.options.placeholder

            this.alts = L.DomUtil.create('ul',
                className + '-alternatives ' + className + '-alternatives-minimized',
                container)

            L.DomEvent.on(icon, 'click', function(e) {
                this.toggle()
                L.DomEvent.preventDefault(e)
            }, this)
            L.DomEvent.addListener(input, 'keyup', this.keyup, this)

            L.DomEvent.disableScrollPropagation(container)
            L.DomEvent.disableClickPropagation(container)

            if (!this.options.collapsed) {
                this.expand()
                if (this.options.autofocus) {
                    setTimeout(function() { input.focus() }, 250)
                }
            }
            return container
        },
        toggle: function() {
            if (L.DomUtil.hasClass(this.container, 'leaflet-control-geocoder-ban-expanded')) {
                this.collapse()
            } else {
                this.expand()
            }
        },
        expand: function() {
            L.DomUtil.addClass(this.container, 'leaflet-control-geocoder-ban-expanded')
            if (this.geocodeMarker) {
                this._map.removeLayer(this.geocodeMarker)
            }
            this.input.select()
        },
        collapse: function() {
            L.DomUtil.removeClass(this.container, 'leaflet-control-geocoder-ban-expanded')
            L.DomUtil.addClass(this.alts, 'leaflet-control-geocoder-ban-alternatives-minimized')
            this.input.blur()
        },
        collapseHack: function(e) {
            // leaflet bug (see #5507) before v1.1.0 that converted enter keypress to click.
            if (e.originalEvent instanceof MouseEvent) {
                this.collapse()
            }
        },
        moveSelection: function(direction) {
            var s = document.getElementsByClassName('leaflet-control-geocoder-ban-selected')
            var el
            if (!s.length) {
                el = this.alts[direction < 0 ? 'firstChild' : 'lastChild']
                L.DomUtil.addClass(el, 'leaflet-control-geocoder-ban-selected')
            } else {
                var currentSelection = s[0]
                L.DomUtil.removeClass(currentSelection, 'leaflet-control-geocoder-ban-selected')
                if (direction > 0) {
                    el = currentSelection.previousElementSibling ? currentSelection.previousElementSibling : this.alts['lastChild']
                } else {
                    el = currentSelection.nextElementSibling ? currentSelection.nextElementSibling : this.alts['firstChild']
                }
            }
            if (el) {
                L.DomUtil.addClass(el, 'leaflet-control-geocoder-ban-selected')
            }
        },
        keyup: function(e) {
            switch (e.keyCode) {
                case 27:
                    // escape
                    this.collapse()
                    L.DomEvent.preventDefault(e)
                    break
                case 38:
                    // down
                    this.moveSelection(1)
                    L.DomEvent.preventDefault(e)
                    break
                case 40:
                    // up
                    this.moveSelection(-1)
                    L.DomEvent.preventDefault(e)
                    break
                case 13:
                    // enter
                    var s = document.getElementsByClassName('leaflet-control-geocoder-ban-selected')
                    if (s.length) {
                        this.geocodeResult(s[0].geocodedFeatures)
                    }
                    L.DomEvent.preventDefault(e)
                    break
                default:
                    if (this.input.value) {
                        var limit = this.options.resultsNumber;
                        if (this.options.geographicalPriority) {
                            limit = this.options.geographicalPriorityNumber;
                        }
                        var params = { q: this.input.value, limit: limit };
                        var t = this
                        if (this.setTimeout) {
                            clearTimeout(this.setTimeout)
                        }
                        // avoid responses collision if typing quickly
                        var that = this;
                        this.setTimeout = setTimeout(function() {
                            var map_center;
                            if (t.options.geographicalPriority) {
                                map_center = that._map.getCenter();
                                params.lat = map_center.lat;
                                params.lon = map_center.lng;
                            }
                            getJSON(t.options.serviceUrl, params, t.displayResults(t))
                        }, this.options.minIntervalBetweenRequests)
                    } else {
                        this.clearResults()
                    }
                    L.DomEvent.preventDefault(e)
            }
        },
        clearResults: function() {
            while (this.alts.firstChild) {
                this.alts.removeChild(this.alts.firstChild)
            }
        },
        displayResults: function(t) {
            t.clearResults()
            var that = this;
            return function(res) {
                if (res && res.features) {
                    var features;
                    if (t.options.geographicalPriority) {
                        map = that._map;
                        features = [];
                        var map_bounds = map.getBounds();

                        for (var i = 0; i < res.features.length; i++) {
                            var feature = res.features[i];
                            var coord = feature.geometry.coordinates;
                            if (map_bounds._northEast.lat >= coord[1] &&
                                map_bounds._northEast.lng >= coord[0] &&
                                map_bounds._southWest.lng <= coord[0] &&
                                map_bounds._southWest.lat <= coord[1]
                            ) {
                                features.push(feature);
                            }
                        }

                    } else {
                        features = res.features;
                    }
                    L.DomUtil.removeClass(t.alts, 'leaflet-control-geocoder-ban-alternatives-minimized')
                    for (var i = 0; i < Math.min(features.length, t.options.resultsNumber); i++) {
                        t.alts.appendChild(t.createAlt(features[i], i))
                    }
                }
            }
        },
        createAlt: function(feature, index) {
            var li = L.DomUtil.create('li', '')
            var a = L.DomUtil.create('a', '', li)
            li.setAttribute('data-result-index', index)
            a.innerHTML = '<strong>' + feature.properties.label + '</strong>, ' + feature.properties.context
            li.geocodedFeatures = feature
            var clickHandler = function(e) {
                this.collapse()
                this.geocodeResult(feature)
            }
            var mouseOverHandler = function(e) {
                var s = document.getElementsByClassName('leaflet-control-geocoder-ban-selected')
                if (s.length) {
                    L.DomUtil.removeClass(s[0], 'leaflet-control-geocoder-ban-selected')
                }
                L.DomUtil.addClass(li, 'leaflet-control-geocoder-ban-selected')
            }
            var mouseOutHandler = function(e) {
                L.DomUtil.removeClass(li, 'leaflet-control-geocoder-ban-selected')
            }
            L.DomEvent.on(li, 'click', clickHandler, this)
            L.DomEvent.on(li, 'mouseover', mouseOverHandler, this)
            L.DomEvent.on(li, 'mouseout', mouseOutHandler, this)
            return li
        },
        geocodeResult: function(feature) {
            this.collapse()
            this.markGeocode(feature)
        },
        markGeocode: function(feature) {
            var latlng = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]]
            this._map.setView(latlng, 14)
            this.geocodeMarker = new L.Marker(latlng)
                .bindPopup(feature.properties.label)
                .addTo(this._map)
                .openPopup()
        }
    })

    const getJSON = function(url, params, callback) {
        var xmlHttp = new XMLHttpRequest()
        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState !== 4) {
                return
            }
            if (xmlHttp.status !== 200 && xmlHttp.status !== 304) {
                return
            }
            callback(JSON.parse(xmlHttp.response))
        }
        xmlHttp.open('GET', url + L.Util.getParamString(params), true)
        xmlHttp.setRequestHeader('Accept', 'application/json')
        xmlHttp.send(null)
    }

    L.geocoderBAN = function(options) {
        return new L.GeocoderBAN(options)
    }
    return L.GeocoderBAN
};

f(factory, window);
/*! Version: 0.62.0
Copyright (c) 2016 Dominik Moritz */

!function(t,i){"function"==typeof define&&define.amd?define(["leaflet"],t):"object"==typeof exports&&(void 0!==i&&i.L?module.exports=t(L):module.exports=t(require("leaflet"))),void 0!==i&&i.L&&(i.L.Control.Locate=t(L))}(function(t){var i=function(i,o,s){(s=s.split(" ")).forEach(function(s){t.DomUtil[i].call(this,o,s)})},o=function(t,o){i("addClass",t,o)},s=function(t,o){i("removeClass",t,o)},e=t.Control.extend({options:{position:"topleft",layer:void 0,setView:"untilPan",keepCurrentZoomLevel:!1,flyTo:!1,clickBehavior:{inView:"stop",outOfView:"setView"},returnToPrevBounds:!1,cacheLocation:!0,drawCircle:!0,drawMarker:!0,markerClass:t.CircleMarker,circleStyle:{color:"#136AEC",fillColor:"#136AEC",fillOpacity:.15,weight:2,opacity:.5},markerStyle:{color:"#136AEC",fillColor:"#2A93EE",fillOpacity:.7,weight:2,opacity:.9,radius:5},followCircleStyle:{},followMarkerStyle:{},icon:"fa fa-map-marker",iconLoading:"fa fa-spinner fa-spin",iconElementTag:"span",circlePadding:[0,0],metric:!0,createButtonCallback:function(i,o){var s=t.DomUtil.create("a","leaflet-bar-part leaflet-bar-part-single",i);return s.title=o.strings.title,{link:s,icon:t.DomUtil.create(o.iconElementTag,o.icon,s)}},onLocationError:function(t,i){alert(t.message)},onLocationOutsideMapBounds:function(t){t.stop(),alert(t.options.strings.outsideMapBoundsMsg)},showPopup:!0,strings:{title:"Localisez moi",metersUnit:"meters",feetUnit:"feet",popup:"Vous êtes dans un rayon de {distance} m de ce point",outsideMapBoundsMsg:"Vous êtes en dehors des limites de cette carte"},locateOptions:{maxZoom:1/0,watch:!0,setView:!1}},initialize:function(i){for(var o in i)"object"==typeof this.options[o]?t.extend(this.options[o],i[o]):this.options[o]=i[o];this.options.followMarkerStyle=t.extend({},this.options.markerStyle,this.options.followMarkerStyle),this.options.followCircleStyle=t.extend({},this.options.circleStyle,this.options.followCircleStyle)},onAdd:function(i){var o=t.DomUtil.create("div","leaflet-control-locate leaflet-bar leaflet-control");this._layer=this.options.layer||new t.LayerGroup,this._layer.addTo(i),this._event=void 0,this._prevBounds=null;var s=this.options.createButtonCallback(o,this.options);return this._link=s.link,this._icon=s.icon,t.DomEvent.on(this._link,"click",t.DomEvent.stopPropagation).on(this._link,"click",t.DomEvent.preventDefault).on(this._link,"click",this._onClick,this).on(this._link,"dblclick",t.DomEvent.stopPropagation),this._resetVariables(),this._map.on("unload",this._unload,this),o},_onClick:function(){if(this._justClicked=!0,this._userPanned=!1,this._active&&!this._event)this.stop();else if(this._active&&void 0!==this._event)switch(this._map.getBounds().contains(this._event.latlng)?this.options.clickBehavior.inView:this.options.clickBehavior.outOfView){case"setView":this.setView();break;case"stop":this.stop(),this.options.returnToPrevBounds&&(this.options.flyTo?this._map.flyToBounds:this._map.fitBounds).bind(this._map)(this._prevBounds)}else this.options.returnToPrevBounds&&(this._prevBounds=this._map.getBounds()),this.start();this._updateContainerStyle()},start:function(){this._activate(),this._event&&(this._drawMarker(this._map),this.options.setView&&this.setView()),this._updateContainerStyle()},stop:function(){this._deactivate(),this._cleanClasses(),this._resetVariables(),this._removeMarker()},_activate:function(){this._active||(this._map.locate(this.options.locateOptions),this._active=!0,this._map.on("locationfound",this._onLocationFound,this),this._map.on("locationerror",this._onLocationError,this),this._map.on("dragstart",this._onDrag,this))},_deactivate:function(){this._map.stopLocate(),this._active=!1,this.options.cacheLocation||(this._event=void 0),this._map.off("locationfound",this._onLocationFound,this),this._map.off("locationerror",this._onLocationError,this),this._map.off("dragstart",this._onDrag,this)},setView:function(){if(this._drawMarker(),this._isOutsideMapBounds())this._event=void 0,this.options.onLocationOutsideMapBounds(this);else if(this.options.keepCurrentZoomLevel)(t=this.options.flyTo?this._map.flyTo:this._map.panTo).bind(this._map)([this._event.latitude,this._event.longitude]);else{var t=this.options.flyTo?this._map.flyToBounds:this._map.fitBounds;t.bind(this._map)(this._event.bounds,{padding:this.options.circlePadding,maxZoom:this.options.locateOptions.maxZoom})}},_drawMarker:function(){void 0===this._event.accuracy&&(this._event.accuracy=0);var i=this._event.accuracy,o=this._event.latlng;if(this.options.drawCircle){var s=this._isFollowing()?this.options.followCircleStyle:this.options.circleStyle;this._circle?this._circle.setLatLng(o).setRadius(i).setStyle(s):this._circle=t.circle(o,i,s).addTo(this._layer)}var e,n;if(this.options.metric?(e=i.toFixed(0),n=this.options.strings.metersUnit):(e=(3.2808399*i).toFixed(0),n=this.options.strings.feetUnit),this.options.drawMarker){var a=this._isFollowing()?this.options.followMarkerStyle:this.options.markerStyle;this._marker?(this._marker.setLatLng(o),this._marker.setStyle&&this._marker.setStyle(a)):this._marker=new this.options.markerClass(o,a).addTo(this._layer)}var r=this.options.strings.popup;this.options.showPopup&&r&&this._marker&&this._marker.bindPopup(t.Util.template(r,{distance:e,unit:n}))._popup.setLatLng(o)},_removeMarker:function(){this._layer.clearLayers(),this._marker=void 0,this._circle=void 0},_unload:function(){this.stop(),this._map.off("unload",this._unload,this)},_onLocationError:function(t){3==t.code&&this.options.locateOptions.watch||(this.stop(),this.options.onLocationError(t,this))},_onLocationFound:function(t){if((!this._event||this._event.latlng.lat!==t.latlng.lat||this._event.latlng.lng!==t.latlng.lng||this._event.accuracy!==t.accuracy)&&this._active){switch(this._event=t,this._drawMarker(),this._updateContainerStyle(),this.options.setView){case"once":this._justClicked&&this.setView();break;case"untilPan":this._userPanned||this.setView();break;case"always":this.setView()}this._justClicked=!1}},_onDrag:function(){this._event&&(this._userPanned=!0,this._updateContainerStyle(),this._drawMarker())},_isFollowing:function(){return!!this._active&&("always"===this.options.setView||("untilPan"===this.options.setView?!this._userPanned:void 0))},_isOutsideMapBounds:function(){return void 0!==this._event&&(this._map.options.maxBounds&&!this._map.options.maxBounds.contains(this._event.latlng))},_updateContainerStyle:function(){this._container&&(this._active&&!this._event?this._setClasses("requesting"):this._isFollowing()?this._setClasses("following"):this._active?this._setClasses("active"):this._cleanClasses())},_setClasses:function(t){"requesting"==t?(s(this._container,"active following"),o(this._container,"requesting"),s(this._icon,this.options.icon),o(this._icon,this.options.iconLoading)):"active"==t?(s(this._container,"requesting following"),o(this._container,"active"),s(this._icon,this.options.iconLoading),o(this._icon,this.options.icon)):"following"==t&&(s(this._container,"requesting"),o(this._container,"active following"),s(this._icon,this.options.iconLoading),o(this._icon,this.options.icon))},_cleanClasses:function(){t.DomUtil.removeClass(this._container,"requesting"),t.DomUtil.removeClass(this._container,"active"),t.DomUtil.removeClass(this._container,"following"),s(this._icon,this.options.iconLoading),o(this._icon,this.options.icon)},_resetVariables:function(){this._active=!1,this._justClicked=!1,this._userPanned=!1}});return t.control.locate=function(i){return new t.Control.Locate(i)},e},window);
//# sourceMappingURL=L.Control.Locate.min.js.map
var easySDImap;

jQuery(document).ready(function($) {

    var script_path = 'libs/easySDI_leaflet.pack/easySDI_leaflet.pack.min.js';

    var scripts = document.getElementsByTagName("script");

    var local_url = '';

    // Look through them trying to find ourselves
    for (var i = 0; i < scripts.length; i++) {
        if (scripts[i].src.indexOf(script_path) > -1) {
            var local_url = scripts[i].src.substring(0, scripts[i].src.indexOf(script_path));
        }
    }

    if (local_url.length == 0) {
        script_path = 'libs/easysdi_leaflet/easysdi_leaflet.js';
        // Look through them trying to find ourselves
        for (var i = 0; i < scripts.length; i++) {
            if (scripts[i].src.indexOf(script_path) > -1) {
                var local_url = scripts[i].src.substring(0, scripts[i].src.indexOf(script_path));
            }
        }
    }

    var isset = function(variable) {
        return typeof(variable) != "undefined" && variable !== null;
    };

    var addIfSet = function(obj, name, value) {
        if (isset(value)) {
            obj[name] = value;
        }
    };

    var byOrdering = function(a, b) {
        {
            var aOrder = isset(a.ordering) ? parseInt(a.ordering) : 0;
            var bOrder = isset(b.ordering) ? parseInt(b.ordering) : 0;
            return ((aOrder < bOrder) ? -1 : ((aOrder > bOrder) ? 1 : 0));
        }
    }

    var projectedToLatLng = function(y, x, crs) {
        var projected = L.point(y, x).divideBy(6378137); //6378137 sphere radius
        return crs.projection.unproject(projected);
    };

    var LatLngFromString = function(string, crs) {

        var v = string.split(',');
        var nb_coords = v.length / 2;
        if (nb_coords != Math.round(nb_coords)) {
            console.log('ERROR: nb impair de coordonnées ' + v.length);
            return null;
        }
        if (nb_coords == 1) {
            if (crs !== undefined) {
                return projectedToLatLng(v[0], v[1], crs);
            } else {
                return L.latLng(v[1], v[0]);
            }
        }

        if (nb_coords > 1) {
            var res = [];
            for (i = 0; i <= nb_coords - 1; i++) {
                if (crs !== undefined) {
                    res.push(projectedToLatLng(v[i * 2], v[i * 2 + 1], crs));
                } else {
                    res.push(L.latLng(v[i * 2 + 1], v[i * 2]));
                }
            }
            return res;
        }
    };



    //https://gist.github.com/aymanfarhat/5608517
    function urlObject(options) {
        "use strict";
        /*global window, document*/

        var url_search_arr,
            option_key,
            i,
            urlObj,
            get_param,
            key,
            val,
            url_query,
            url_get_params = {},
            a = document.createElement('a'),
            default_options = {
                'url': window.location.href,
                'unescape': true,
                'convert_num': true
            };

        if (typeof options !== "object") {
            options = default_options;
        } else {
            for (option_key in default_options) {
                if (default_options.hasOwnProperty(option_key)) {
                    if (options[option_key] === undefined) {
                        options[option_key] = default_options[option_key];
                    }
                }
            }
        }

        a.href = options.url;
        url_query = a.search.substring(1);
        url_search_arr = url_query.split('&');

        if (url_search_arr[0].length > 1) {
            for (i = 0; i < url_search_arr.length; i += 1) {
                get_param = url_search_arr[i].split("=");

                if (options.unescape) {
                    key = decodeURI(get_param[0]);
                    val = decodeURI(get_param[1]);
                } else {
                    key = get_param[0];
                    val = get_param[1];
                }

                if (options.convert_num) {
                    if (val.match(/^\d+$/)) {
                        val = parseInt(val, 10);
                    } else if (val.match(/^\d+\.\d+$/)) {
                        val = parseFloat(val);
                    }
                }

                if (url_get_params[key] === undefined) {
                    url_get_params[key] = val;
                } else if (typeof url_get_params[key] === "string") {
                    url_get_params[key] = [url_get_params[key], val];
                } else {
                    url_get_params[key].push(val);
                }

                get_param = [];
            }
        }

        urlObj = {
            protocol: a.protocol,
            hostname: a.hostname,
            host: a.host,
            port: a.port,
            hash: a.hash.substr(1),
            pathname: a.pathname,
            search: a.search,
            parameters: url_get_params
        };

        return urlObj;
    }



    // Changes XML to JSON
    function xmlToJson(xml) { //http://davidwalsh.name/convert-xml-json

        // Create the return object
        var obj = {};

        if (xml.nodeType == 1) { // element
            // do attributes
            if (xml.attributes.length > 0) {
                obj["@attributes"] = {};
                for (var j = 0; j < xml.attributes.length; j++) {
                    var attribute = xml.attributes.item(j);
                    obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
                }
            }
        } else if (xml.nodeType == 3) { // text
            obj = xml.nodeValue;
        }

        // do children
        if (xml.hasChildNodes()) {
            for (var i = 0; i < xml.childNodes.length; i++) {
                var item = xml.childNodes.item(i);
                var nodeName = item.nodeName;
                if (typeof(obj[nodeName]) == "undefined") {
                    obj[nodeName] = xmlToJson(item);
                } else {
                    if (typeof(obj[nodeName].push) == "undefined") {
                        var old = obj[nodeName];
                        obj[nodeName] = [];
                        obj[nodeName].push(old);
                    }
                    obj[nodeName].push(xmlToJson(item));
                }
            }
        }
        return obj;
    };




    easymapServiceConnector = function(proxy) {

        var _this = {
            services: {},
            proxy: proxy,
        };

        _this.addService = function(data) {
            if (!isset(_this.services[data.servicealias])) {
                _this.services[data.servicealias] = {
                    serviceconnector: data.serviceconnector,
                    servicetype: data.servicetype,
                    serviceurl: data.serviceurl,
                    servicealias: data.servicealias
                }
                if (data.serviceconnector == 'WMS' || data.serviceconnector == 'WMTS')
                    _this.getCapabilities(data.servicealias);
            }
            return _this.services[data.servicealias];
        };



        _this.getAllServices = function(map) {
            jQuery.each(map.contextMapData.services, function(i, s) {
                //for (var i in map.contextMapData.services) {
                //var s = map.contextMapData.services[i];
                var ns = _this.addService(s);
                ns.name = s.name;
                ns.list = true;
            });
            return _this.services;
        };


        _this.getServiceLayers = function(servicealias) {
            var service = _this.services[servicealias];

            if (service.serviceconnector == 'WMS' || service.serviceconnector == 'WMTS') {
                var cap = _this.getCapabilities(servicealias);
                return getLayers(cap);
            }

            switch (service.serviceconnector) {

                case "Google":
                    return ['ROADMAP', 'SATELLITE', 'HYBRID', 'TERRAIN'];
                    break;

                case "Bing":
                    //return ['Aerial', 'AerialWithLabels', 'Road', 'collinsBart', 'ordnanceSurvey'];
                    break;

                case "OSM":
                    return ['mapnik'];
                    break;

                default:
                    return false;
            }
        };


        var loadCapabilities = function(servicealias) {
            var service = _this.services[servicealias];
            var url = service.serviceurl + '?service=' + service.serviceconnector + '&request=GetCapabilities';
            if (isset(_this.proxy)) url = proxy + encodeURIComponent(url);

            service.loading = true;

            jQuery.ajax({
                type: "GET",
                url: url,
                dataType: "text",
                success: function(xml) {
                    service.loading = false;
                    if (xml != null) {
                        service.getCapabilitiesXML = xml;
                        service.getCapabilities = new WMSCapabilities(xml).toJSON();
                        if (!isset(service.name)) updateServiceName(servicealias);
                    }
                    var evt = new CustomEvent('getCapabilities', service);
                    window.dispatchEvent(evt);
                }
            }).fail(function() {
                service.getCapabilities = false;
            });
        };


        _this.getCapabilities = function(servicealias) {
            var service = _this.services[servicealias];
            if (isset(service.getCapabilities)) return service.getCapabilities;
            if (!isset(service.loading))
                loadCapabilities(servicealias);

            return null;
        };



        var getLayers = function(capabilities) {


            if (capabilities == null) return null;
            var res = [];

            var recurLayer = function(layer, pretitle, niv) {
                if (!isset(niv)) niv = 0;
                if (!isset(pretitle)) pretitle = '';
                if (isset(layer.Layer)) {
                    jQuery.each(layer.Layer, function(i, l) {
                        recurLayer(l, (niv > 1) ? pretitle + layer.Title + ' ' : pretitle, niv + 1);
                    });
                } else {
                    layer.Group = pretitle;
                    res.push(layer);
                }
            }


            if (isset(capabilities.Capability)) {
                var Layers = jQuery.extend({}, capabilities.Capability.Layer);
                recurLayer(Layers, '', 0);
            }

            return res;
        }

        var _getLayerData = function(capabilities, layername) {
            var rlayer = false;
            var layers = getLayers(capabilities);
            jQuery.each(layers, function(i, lay) {
                //for (var i in layers) {
                //var lay = layers[i];
                var layname;
                if (isset(lay.Name)) {
                    layname = lay.Name;
                }
                if (layname == layername) {
                    rlayer = lay;
                }
            });
            return rlayer;
        };

        _this.getLayerData = function(capabilities, layername) {
            return _getLayerData(capabilities, layername);
        }


        _this.getLegendURL = function(layer) {
            if (layer.data.serviceconnector != 'WMS' && layer.data.serviceconnector != 'WMTS') return false;
            var cap = _this.getCapabilities(layer.data.servicealias, layer);
            if (!isset(cap) || typeof cap !== 'object') return null;

            var lay = _getLayerData(cap, layer.data.layername);

            if (isset(lay.Style)) {
                if (isset(lay.Style[0].LegendURL)) {
                    if (isset(lay.Style[0].LegendURL[0].OnlineResource)) {
                        return lay.Style[0].LegendURL[0].OnlineResource;
                    } else {
                        return lay.Style[0].LegendURL[0];
                    }
                }
            }
            return false;
        };

        _this.getLegendGraphic = function(layer, map) {
            if (layer.data.serviceconnector != 'WMS' && layer.data.serviceconnector != 'WMTS') return false;
            var service = _this.services[layer.data.servicealias];
            var crs_code = map.contextMapData.srs;
            var scale = 128 * 6378137 / (Math.pow(2, map.getZoom()));
            var url = service.serviceurl + '?service=' + service.serviceconnector + '&request=GetLegendGraphic&CRS=' + crs_code + '&LAYER=' + layer.data.layername + '&transparent=true&format=image%2Fpng&legend_options=fontAntiAliasing%3Atrue%3BfontSize%3A11%3BfontName%3AAria&scale=' + scale;

            return url;
        }

        _this.getAttribution = function(layer) {
            if (isset(layer.Layer)) return _this.getAttribution(layer.Layer[0]);
            if (!isset(layer.Attribution)) return null;
            var html = layer.Attribution['Title'];
            if (isset(layer.Attribution['LogoURL']))
                html = '<img src="' + layer.Attribution['LogoURL']['OnlineResource'] + '" alt="" />' + html;
            if (isset(layer.Attribution['OnlineResource']))
                html = '<a href="' + layer.Attribution['OnlineResource'] + '">' + html + '</a>';
            return html;
        }

        var updateServiceName = function(serviceAlias) {
            var cap = _this.services[serviceAlias].getCapabilities;
            if (isset(cap.Service))
                _this.services[serviceAlias].name = cap.Service.Title;
        }


        _this.getBBox = function(layer, map) {
            if (layer.data.serviceconnector != 'WMS' && layer.data.serviceconnector != 'WMTS') return false;
            var cap = _this.getCapabilities(layer.data.servicealias, layer);
            if (!isset(cap) || typeof cap !== 'object') return null;

            var srs = map.contextMapData.srs;
            var lay = _getLayerData(cap, layer.data.layername);

            if (isset(lay.BoundingBox)) {
                var boxes = lay.BoundingBox;

                for (var i in boxes) {
                    var attr = boxes[i];
                    if ('CRS:84' == attr.crs) {
                        var bb = LatLngFromString(attr.extent[0] + ',' + attr.extent[1] + ',' + attr.extent[2] + ',' + attr.extent[3]);
                        return L.latLngBounds(bb);
                    }
                }

                for (var i in boxes) {
                    var attr = boxes[i];
                    if (srs == attr.crs) {
                        var bb = LatLngFromString(attr.extent[0] + ',' + attr.extent[1] + ',' + attr.extent[2] + ',' + attr.extent[3], map.options.crs);
                        return L.latLngBounds(bb);
                    }
                }

            }


            return false;
        };


        var _getFeatureUrl = function(capabilities, layer, map, loc) {

            var wmsParams = {
                request: 'GetFeatureInfo',
                query_layers: layer.data.layername,
                layers: layer.data.layername,
                info_format: '',
				version:'1.3.0',
                feature_count: 10,
                X: Math.round(loc.x),
                Y: Math.round(loc.y)
            };


            jQuery.each(capabilities.Capability.Request.GetFeatureInfo.Format, function(k, format) {
                if (format == 'text/plain' && wmsParams.info_format == '') wmsParams.info_format = format;
                if (format == 'text/html') wmsParams.info_format = format;
				if (format == '') wmsParams.info_format = 'text/html';
            });
			
			if (wmsParams.info_format == ''){
				wmsParams.info_format = 'text/html';
			}

            var bounds = map.getBounds();
            var size = map.getSize();
            var wmsVersion = layer.wmsParams.version;
			wmsParams.version = wmsVersion;
            var crs = map.options.crs || map.options.crs;
            var projectionKey = wmsVersion >= 1.3 ? 'crs' : 'srs';
            var nw = crs.project(bounds.getNorthWest());
            var se = crs.project(bounds.getSouthEast());

            var params = {
                'width': size.x,
                'height': size.y
            };
            params[projectionKey] = crs.code; //'CRS:84';
            params.bbox = (
                wmsVersion >= 1.3 && crs === L.CRS.EPSG4326 ? [se.y, nw.x, nw.y, se.x] : [nw.x, se.y, se.x, nw.y]
            ).join(',');

            L.extend(wmsParams, params);
            var url = capabilities.Capability.Request.GetFeatureInfo.DCPType[0].HTTP.Get.OnlineResource;
            url += L.Util.getParamString(wmsParams, url);
            if (isset(_this.proxy)) url = proxy + encodeURIComponent(url);

            return url;
        }



        _this.getQueryable = function(layer) {
            if (layer.data.serviceconnector != 'WMS' && layer.data.serviceconnector != 'WMTS') return false;
            var cap = _this.getCapabilities(layer.data.servicealias, layer);
            if (!isset(cap) || typeof cap !== 'object') return null;

            var lay = _getLayerData(cap, layer.data.layername);

            if (isset(lay.queryable)) {
                if (lay.queryable == true) {
                    return true;
                }
            }

            return false;
        };


        _this.getFeatureUrl = function(layer, map, loc) {
            if (!isset(layer)) return false;
            if (layer.data.serviceconnector != 'WMS' && layer.data.serviceconnector != 'WMTS') return false;
            var cap = _this.getCapabilities(layer.data.servicealias, layer);
            if (!isset(cap) || typeof cap !== 'object') return null;

            return _getFeatureUrl(cap, layer, map, loc);

        };




        return _this;
    };




    easySDImap = function(obj, data, options) {

        var params = {

        };
        jQuery.extend(params, options);
        var _easySDImap = {};
        var map;
        var baseLayers = {};
        var overlays = {};
        var services = {};
        var mapOptions = {
            zoomControl: false,
            attributionControl: false,
            dragging: false,
            touchZoom: false,
            doubleClickZoom: false,
            scrollWheelZoom: false,
            boxZoom: false,
            keyboard: false,
        };
        var container;

        if (options == undefined) {
            options = {};
            if (options.mapoptions == undefined) {
                options.mapoptions = {};
            }
        }

        mapOptions = jQuery.extend(true, mapOptions, options.mapoptions);


        var controlLayer, controlLegend, controlFeature;
        var serviceConnector;
        var lastBaseLayer = null;

        var baseLayerGroup = '';

        var url_obj = urlObject(window.location.href);

        var lang;
        var boundsLatLng;
        var contextMapData;

        _easySDImap.params = params;

        var pushTool = function(alias, control, params) {
            _easySDImap.tools.push({
                alias: alias,
                control: control,
                params: params
            });
        }


        var init = function() {

            container = obj;

            var h = jQuery(window).height();
            container.height(h * 0.95);

            // order mapdata arrays
            //contextMapData.groups.sort(byOrdering);
            contextMapData.services.sort(byOrdering);

            _easySDImap.contextMapData = contextMapData;

            serviceConnector = easymapServiceConnector(contextMapData.proxyhost);

            mapOptions.crs = setCRS(contextMapData.srs);
            mapOptions.center = LatLngFromString(contextMapData.centercoordinates, mapOptions.crs);
            mapOptions.zoom = parseFloat(contextMapData.zoom);

            var bounds = LatLngFromString(contextMapData.maxextent, mapOptions.crs);
            mapOptions.maxBounds = L.latLngBounds(bounds);
            boundsLatLng = mapOptions.maxBounds;

            map = L.map(container[0], mapOptions);



            map.on('zoomstart', function(event) {
                var id = jQuery("input[name='baselayer']:checked").val();
                for (var key in baseLayers) {
                    if (baseLayers[key]._leaflet_id == id) {
                        _easySDImap.mapObj.options.maxZoom = baseLayers[key].options.maxZoom;
                    }
                }
            });

            _easySDImap.mapObj = map;

            var minZoom = map.getBoundsZoom(mapOptions.maxBounds);
            map.options.minZoom = minZoom;

            map.contextMapData = contextMapData;



            // initialisation tools



            _easySDImap.tools = [];

            // initialisation tools Hors params
            pushTool('attribution', addTool('attribution'));

            jQuery.each(contextMapData.tools, function(i, t) {
                //for (var i in contextMapData.tools) {
                //var t = contextMapData.tools[i];
                var ntool = addTool(t.alias, t.params);
                if (ntool !== false)
                    pushTool(t.alias, ntool, t.params);
            });


            /*
            fixe display print-left
            var printProvider = L.print.provider({
                method: 'GET',
                url: 'http://lebouzin/print-servlet/pdf',
                autoLoad: true,
                dpi: 90
            });*/

            /*var printControl = L.control.print({
                provider: printProvider
            });*/
            //map.addControl(printControl);




            if (!isset(controlLayer)) {
                controlLayer = L.control.groupedLayers(baseLayers, overlays, {
                    autoZIndex: false
                }).addTo(map); // creation du controller de couches
            }

            var layerorder = 1000;
            var reversegroup = "";
            // creation de couches
            jQuery.each(contextMapData.groups, function(g, group) {
                var overlay = (group.isbackground != '1');
                if (isset(group.layers)) {
                    if (group.isbackground == 1) {
                        var has_default = false;
                        for (var index = 0; index < group.layers.length; index++) {
                            var element = group.layers[index];
                            if (element.id == data.default_backgroud_layer) {
                                has_default = true;
                            }
                        }
                        if (!has_default) {
                            data.default_backgroud_layer = group.layers[0].id
                        }

                        reversegroup = group.layers;
                    } else {
                        reversegroup = group.layers.reverse();
                    }
                    jQuery.each(reversegroup, function(l, layer) {
                        var show = (layer.isdefaultvisible == '1');
                        layer.ordering = layerorder;
                        addLayer(layer, overlay, show, group.name);
                        layerorder--;
                    });
                }
            });

            var geoJsonDataObj = obj.siblings('.addGeoJson');
            if (geoJsonDataObj.length > 0) {
                var ld = L.geoJson(JSON.parse(geoJsonDataObj.html()), {
                    style: {
                        className: 'addedGeoJsonLayer'
                    }
                }); // ajouter style
                overlays['textareaGeoJson'] = ld;
                ld.addTo(map);
                geoJsonDataObj.remove();
            }



            if (isset(lastBaseLayer)) {
                if (lastBaseLayer.data.servicealias == "google") {
                    var gmap_layer = new L.Google(lastBaseLayer.data.layername);
                    map.addLayer(gmap_layer);
                } else {
                    lastBaseLayer.addTo(map);
                }
            }

            obj.addClass('easySDImap');



            // data


            _easySDImap.obj = obj;
            _easySDImap.addLayer = addLayer;
            _easySDImap.getContext = getContext;
            _easySDImap.setContext = setContext;
            _easySDImap.layers = {
                baseLayers: baseLayers,
                overlays: overlays
            };
            _easySDImap.services = services;

            //update map bbox from URL param
            if (isset(url_obj.parameters.bbox)) {
                console.info('use url bbox ' + url_obj.parameters.bbox);
                _easySDImap.setBBox(url_obj.parameters.bbox);
            }

            setTimeout(updateMapFromContext, 200);


        };

        var updateMapFromContext = function() {
            //update map context from params
            if (isset(_easySDImap.params.context)) {
                if (typeof _easySDImap.params.context != "object") {
                    eval('_easySDImap.params.context=' + _easySDImap.params.context + ';');
                }
                setContext(_easySDImap.params.context);
            }


            //update map bbox from URL param
            if (isset(url_obj.parameters.bbox)) {
                console.info('use url bbox ' + url_obj.parameters.bbox);
                _easySDImap.setBBox(url_obj.parameters.bbox);
            }
        }

        _easySDImap.setBBox = function(bbox) {
            var url_bbox = L.latLngBounds(LatLngFromString(bbox, mapOptions.crs));
            map.fitBounds(url_bbox);
        }

        var hasTool = function(toolname) {
            var rtool = false;
            jQuery.each(_easySDImap.contextMapData.tools, function(t, tool) {
                //for (var t in _easySDImap.contextMapData.tools) {
                //var tool = _easySDImap.contextMapData.tools[t];
                if (tool.alias == toolname) rtool = tool;
            });
            return rtool;
        };

        _easySDImap.getTool = function(toolname) {
            var rtool = false;
            jQuery.each(_easySDImap.tools, function(t, tool) {
                //for (var t in _easySDImap.tools) {
                // var tool = _easySDImap.tools[t];
                if (tool.alias == toolname) rtool = tool.control;
            });
            return rtool;
        }


        var addTool = function(toolname, params) {
            switch (toolname) {
                case 'googleearth':
                    return false;
                    break;

                case 'navigation':
                    return initNavigation(params);
                    break;

                case 'zoom':
                    return initZoom(params);
                    break;

                case 'navigationhistory':
                    return false;
                    break;

                case 'zoomtoextent':
                    return false;
                    break;

                case 'measure':
                    return initMeasure(params);
                    break;
                    //ICI
                case 'googlegeocoder':
                    return initGeocoderGoogle('google', params);
                    break;

                case 'bangeocoder':
                    return initGeocoderBan('ban', params);
                    break;

                case 'fullscreen':
                    return initFullscreen(params);
                    break;

                case 'locate':
                    return initLocate(params);
                    break;

                case 'print':
                    return initPrint(params);
                    break;

                case 'addlayer':
                    return false;
                    break;

                case 'removelayer':
                    return false;
                    break;

                case 'layerproperties':
                    return false;
                    break;

                case 'getfeatureinfo':
                    return false;
                    break;

                case 'layertree':
                    return initLayertree(params);
                    break;

                case 'scaleline':
                    return initScaleline(params);;
                    break;

                case 'mouseposition':
                    return false;
                    break;

                case 'wfslocator':
                    return false;
                    break;

                case 'searchcatalog':
                    return false;
                    break;

                case 'layerdetailsheet':
                    return false;
                    break;

                case 'layerdownload':
                    return false;
                    break;

                case 'layerorder':
                    return false;
                    break;

                case 'attribution':
                    return initAttribution(params);
                    break;



                default:
                    console.info('ERROR Tool ' + toolname + ' non géré');
            }



        };

        var setCRS = function(srs) {
            if (srs == 'EPSG:3857') return L.CRS.EPSG3857;
            if (srs == 'EPSG:4326') return L.CRS.EPSG4326;
            if (srs == 'EPSG:3395') return L.CRS.EPSG3395;
            // !TODO gestion autres proj4Leaflet
            return null;
        };

        var getOloptions = function(opt) {
            if (!isset(opt) || opt == '') return [];
            var asOLoptions = JSON.parse(opt); //opt.replace('OpenLayers.', '_ImportOL.');
            //eval('var asOLoptions= {' + opt + '};');
            return asOLoptions;
            //return [];
        };

        var _ImportOL = {};
        _ImportOL.Bounds = function(b1, b2, b3, b4) {
            var bounds = LatLngFromString(b1 + ',' + b2 + ',' + b3 + ',' + b4, mapOptions.crs.crs);
            return L.latLngBounds(bounds);
        };

        var getLayersStatus = function() {
            var res = {
                baseLayers: [],
                overlays: []
            };

            jQuery.each(baseLayers, function(i, baseLayer) {
                //for (var i in baseLayers) {
                res.baseLayers.push({
                    layer: i,
                    status: isset(baseLayer._map)
                });
            });

            jQuery.each(overlays, function(g, overlay) {
                //for (var g in overlays) {
                res.overlays.push({
                    layer: g,
                    status: isset(overlay._map)
                });
            });

            return res;
        };


        var getContext = function() {
            var bbox = map.getBounds().toBBoxString();
            return {
                bbox: bbox,
                layers: getLayersStatus()
            };
        };


        var setContext = function(c) {
            var coords = c.bbox.split(',');
            coords = [
                [coords[1], coords[0]],
                [coords[3], coords[2]]
            ];
            map.fitBounds(coords);

            jQuery.each(c.layers.baseLayers, function(i, contextBaseLayer) {

                if (isset(baseLayers[contextBaseLayer])) {
                    if (contextBaseLayer.status) {
                        map.addLayer(baseLayers[contextBaseLayer.layer]);
                    } else {
                        map.removeLayer(baseLayers[contextBaseLayer.layer]);
                    }

                }
            });

            jQuery.each(c.layers.overlays, function(i2, contextOverlay) {
                if (isset(overlays[contextOverlay.layer])) {
                    if (contextOverlay.status) {
                        map.addLayer(overlays[contextOverlay.layer]);
                    } else {
                        map.removeLayer(overlays[contextOverlay.layer]);
                    }

                }
            });
        };




        var addLayer = function(data, overlay, show, group) {
            //console.info(data.name+' ['+data.serviceconnector+']');
            serviceConnector.addService(data);

            var l = null;
            switch (data.serviceconnector) {

                case 'WMS':
                    l = addWMS(data);
                    break;

                case 'WMTS':
                    l = addWMTS(data);
                    break;

                case 'OSM':
                    l = addOSM(data);
                    break;

                case 'Google':
                    l = addGoogle(data);
                    break;

                case 'Bing':
                    l = addBing(data);
                    break;

                default:
                    console.error('ERROR ' + data.serviceconnector + ' non géré');
                    return false;
            }


            if (l !== null && l !== false) {

                l.data = data;

                if (overlay === false) {
                    if (isset(group))
                        setBaseLayerGroup(group);
                    addBaseLayer(l, data.name);
                } else {
                    addOverlay(l, group, data.name);
                }

                if (show) {
                    if (isset(l.addTo)) {
                        l.addTo(map);
                    }
                }
            }
            return l;
        };

        var setBaseLayerGroup = function(group) {
            baseLayerGroup = group;
            if (isset(controlLayer.setBaseGroupName))
                controlLayer.setBaseGroupName(baseLayerGroup);
        }



        var addBaseLayer = function(layer, name) {
            if (!isset(layer.data)) layer.data = {};
            if (isset(layer.setZIndex)) {
                layer.setZIndex(1);
            }

            baseLayers[name] = layer;
            if (isset(controlLayer))
                controlLayer.addBaseLayer(layer, name);
            if (layer.data.id === contextMapData.default_backgroud_layer) {
                lastBaseLayer = layer;
            }

        };
        _easySDImap.addBaseLayer = addBaseLayer;

        var addOverlay = function(layer, group, name) {
            if (!isset(layer.data)) layer.data = {};
            overlays[name] = layer;
            if (isset(controlLayer))
                controlLayer.addOverlay(layer, name, group);
        };
        _easySDImap.addOverlay = addOverlay;


        var loadGeojson = function(url, group, name) {
            if (!isset(group)) group = url;
            if (!isset(name)) name = group;
            jQuery.getJSON(url, function(geodata) {

                var geojson_layer = L.Proj.geoJson(geodata, {
                    style: function(feature) {
                        var options = {
                            weight: 2,
                            opacity: 1
                        };
                        options.maxZoom = 50
                        return options;
                    },
                    onEachFeature: function(feature, tlayer) {

                        tlayer.on('click', function(e) {

                            var html = '<table class="table table-bordered table-striped" style="display: block; max-height: 400px; overflow: auto">';
                            jQuery.each(feature.properties, function(k, v) {
                                html += '<tr><th>' + k + '</th><td>' + v + '</td></tr>';
                            })
                            html += '</table>';

                            tlayer.bindPopup(html, {
                                maxWidth: 500
                            }).openPopup();
                        });
                    }

                });

                addOverlay(geojson_layer, group, name);
                _easySDImap.mapObj.fitBounds(geojson_layer.getBounds());
                setTimeout(function() {
                    _easySDImap.mapObj.addLayer(geojson_layer);
                }, 10);

            });

        };
        _easySDImap.loadGeojson = loadGeojson;


        var changeIGNkey = function(url, key) {
            if (isset(key))
                url = url.replace(/\.ign\.fr\/[\w]*\/geoportail\//gi, '.ign.fr/' + key + '/geoportail/');
            return url;
        }



        var addWMS = function(data) {

            var url = data.serviceurl;
            url = changeIGNkey(url, params.ignkey);

            var options = {};

            addIfSet(options, 'layers', data.layername);
            options.format = 'image/png';

            addIfSet(options, 'opacity', parseFloat(data.opacity));
            options.zIndex = 10;

            addIfSet(options, 'zIndex', parseInt(data.ordering) + 10);
            addIfSet(options, 'zIndex', data.zIndex);


            addIfSet(options, 'format', data.format);
            addIfSet(options, 'attribution', data.attribution);
            addIfSet(options, 'style', data.style);
            addIfSet(options, 'bounds', data.bounds);
            addIfSet(options, 'maxZoom', data.maxZoom);


            var o = getOloptions(data.asOLoptions);
            addIfSet(options, 'format', o.format);
            addIfSet(options, 'attribution', o.attribution);
            addIfSet(options, 'style', o.style);
            addIfSet(options, 'bounds', o.bounds);



            o.maxZoom = 24; // default leaflet TileLayermaxZoom is 18

            if (isset(o.numZoomLevels)) {
                o.maxZoom = parseInt(o.numZoomLevels) - 1;
            }
            addIfSet(options, 'maxZoom', o.maxZoom);


            options.transparent = true;
            data.TileLayer_options = options;
            options.pane = map.getPanes().tilePane;
            if (parseInt(data.istiled)) {
                return new L.tileLayer.wms(url, options);
            } else {
                return new L.nonTiledLayer.wms(url, options);
            }
        };


        var addWMTS = function(data) {

            var url = data.serviceurl;
            url = changeIGNkey(url, params.ignkey);
            var options = {};

            addIfSet(options, 'layer', data.layername);
            addIfSet(options, 'tilematrixSet', data.asOLmatrixset);

            addIfSet(options, 'opacity', parseFloat(data.opacity));
            options.zIndex = 10;
            addIfSet(options, 'zIndex', parseInt(data.ordering) + 10);

            var o = getOloptions(data.asOLoptions);

            options.format = 'image/png';
            addIfSet(options, 'format', o.format);
            addIfSet(options, 'attribution', o.attribution);
            addIfSet(options, 'style', o.style);
            addIfSet(options, 'bounds', o.bounds);

            if (isset(o.numZoomLevels)) {
                o.maxZoom = parseInt(o.numZoomLevels) - 1;
            }
            addIfSet(options, 'maxZoom', o.maxZoom);

            if (isset(o.maxResolution)) {
                o.minZoom = parseInt(o.maxResolution);
                o.minZoom = o.maxZoom - Math.floor(Math.log(o.minZoom) / Math.log(2)) + 1; // calcule minZoom level a partir de maxResolution
            }
            addIfSet(options, 'minZoom', o.minZoom);

            addIfSet(options, 'matrixIds', o.matrixIds);

            if (isset(o.matrixIds)) {
                options.topLeftCorner = new L.LatLng(20037508, -20037508);
            }


            if (isset(options.topLeftCorner)) {
                jQuery.each(options.matrixIds, function(m, matrixId) {
                    //for (var m in options.matrixIds) {
                    options.matrixIds[m] = {
                        //identifier: options.matrixIds[m],
                        identifier: matrixId,
                        topLeftCorner: options.topLeftCorner
                    };
                });
            }

            addIfSet(options, 'format', data.format);
            addIfSet(options, 'attribution', data.attribution);
            addIfSet(options, 'style', data.style);
            addIfSet(options, 'bounds', data.bounds);
            addIfSet(options, 'maxZoom', data.maxZoom);

            data.TileLayer_options = options;

            return new L.TileLayer.WMTS(url, options);
        };




        var addOSM = function(data) {
            return L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            });
        };


        var addGoogle = function(data) {
            if (typeof(google) !== 'undefined') {
                return new L.Google(data.layername);
            }
            return false;
        };

        var addBing = function(data) {
            /*if (isset(L.BingLayer))
            return new L.BingLayer(data.layername);*/
            return false;
        };

        //**********
        // Navigation
        // *********

        var initNavigation = function(params) {
            var options = {
                position: 'topleft',
                zoomInTitle: i18n.t('tools_tooltips.zoomInTitle'),
                zoomOutTitle: i18n.t('tools_tooltips.zoomOutTitle')
            };
            jQuery.extend(options, params);

            map.dragging.enable();
            map.touchZoom.enable();
            map.doubleClickZoom.enable();
            map.scrollWheelZoom.enable();
            map.boxZoom.enable();
            map.keyboard.enable();
            //map.tap.enable();

            var tool = L.control.zoom(options);
            tool.addTo(map);
            return tool;
        };


        //**********
        // Zoom
        // *********

        var initZoom = function(params) {
            var options = {
                position: 'topleft',
                title: i18n.t('tools_tooltips.zoomBoxTitle')
            };
            jQuery.extend(options, params);
            var tool = L.control.zoomBox(options); //https://github.com/consbio/Leaflet.ZoomBox
            tool.addTo(map);
            return tool;
        };


        //**********
        // Measure
        // *********
        var initMeasure = function(params) {
            var options = {
                position: 'topright',
                activeColor: '#D9534F',
                completedColor: '#5BC0DE'
            };
            jQuery.extend(options, i18n.t('measure', {
                returnObjectTrees: true
            }));
            jQuery.extend(options, params);
            var tool = L.control.measure(options); //https://github.com/answerquest/leaflet-measure/tree/1b4776a7ce3a25170f5c66bf2ccbd927bf568abd
            tool.addTo(map);
            return tool;
        };



        //**********
        // Attribution
        // *********
        var initAttribution = function(params) {
            var options = {
                position: 'bottomright',
                prefix: false
            };
            jQuery.extend(options, params);
            var tool = L.control.attribution(options);
            tool.addTo(map);
            return tool;
        };



        //**********
        // Geocoder
        // *********
        var initGeocoderGoogle = function(provider, params) {
            var options = {
                position: 'topleft',
                language: lang,
                bounds: boundsLatLng.toBBoxString()
            };
            jQuery.extend(options, i18n.t('geocoder', {
                returnObjectTrees: true
            }));
            jQuery.extend(options, params);


            if (provider == 'google') {
                options.geocoder = new L.Control.Geocoder.Google({
                    language: options.language,
                    bounds: options.bounds
                });
            }





            var tool = L.Control.geocoder(options); //https://github.com/perliedman/leaflet-control-geocoder

            //affichage résultat
            tool.markGeocode = function(result) {
                var bbox = result.bbox;
                map.fitBounds(bbox);
                map._geocodeMarker = new L.Marker(result.center)
                    .bindPopup(result.html || result.name)
                    .addTo(map)
                    .openPopup();
                setTimeout(function() {
                    map.removeLayer(map._geocodeMarker);
                }, 3000);
            };
            tool.addTo(map);
            return tool;
        };

        var initGeocoderBan = function(provider, params) {
            var options = {
                position: 'topleft',
                language: lang,
                bounds: boundsLatLng.toBBoxString()
            };
            jQuery.extend(options, i18n.t('geocoder', {
                returnObjectTrees: true
            }));
            jQuery.extend(options, params);


            var tool = L.geocoderBAN({ geographicalPriority: true });

            tool.addTo(map);
            return tool;
        };

        var initFullscreen = function(params) {

            var tool = L.control.fullscreen({
                title: {
                    'false': 'Afficher en plein écran',
                    'true': 'Quitter le mode plein écran'
                }
            });

            tool.addTo(map);
            return tool;
        };

        var initLocate = function(params) {

            var tool = L.control.locate({
                locateOptions: {
                    maxZoom: 18
                }
            });

            tool.addTo(map);
            return tool;
        };





        //********
        // Print
        // ******


        var initPrint = function(params) {
            var d = new Date();
            var options = {
                position: 'topright',
                copyright: '© ' + _easySDImap.contextMapData.sitename + ' ' + d.getFullYear(),
                defaulttitle: _easySDImap.contextMapData.title,
                defaultdesc: _easySDImap.contextMapData.abstract,
            };
            jQuery.extend(options, i18n.t('print', {
                returnObjectTrees: true
            }));
            jQuery.extend(options, params);

            var control = L.easyPrintControl(options);
            control.addTo(map);
            return control;
        };


        //*******
        //scaleline
        //*******

        var initScaleline = function(params) {
            var graphicScale = L.control.graphicScale({
                fill: 'hollow',
                position: 'bottomright'
            }).addTo(map);
        };


        //*******
        //layertree
        //*******

        var initLayertree = function(params) {
            var _this = {};
            var options = {
                position: 'topleft',
                title: _easySDImap.contextMapData.name,
                baseGroupName: baseLayerGroup,
                addlayer: hasTool('addlayer'),
                removelayer: hasTool('removelayer'),
                layerproperties: hasTool('layerproperties'),
                getfeatureinfo: hasTool('getfeatureinfo'),
                searchcatalog: hasTool('searchcatalog'),
                layerdetailsheet: hasTool('layerdetailsheet'),
                layerdownload: hasTool('layerdownload'),
                layerorder: hasTool('layerorder'),
                defaultGroup: _easySDImap.contextMapData.default_group,
                sharelink: (_easySDImap.params.sharelink == true)

            };

            jQuery.extend(options, i18n.t('layertree', {
                returnObjectTrees: true
            }));
            jQuery.extend(options, params);

            var sidebar_html = jQuery('<div id="easysdi_leaflet_sidebar" class="sidebar collapsed">' +
                '<ul class="sidebar-tabs sidebar-tabs-top" role="tablist"></ul>' +
                '<ul class="sidebar-tabs sidebar-tabs-bottom" role="tablist"></ul>' +
                '<div class="sidebar-content active"></div>' +
                '</div>').prependTo('#easySDIMap');

            // tree
            jQuery('<li><a href="#tree" role="tab" title="' + i18n.t('tools_tooltips.layertree') + '"><i class="fa fa-bars"></i></a></li>').appendTo(sidebar_html.find('.sidebar-tabs-top'));
            _this.panelTree = jQuery('<div class="sidebar-pane" id="tree"></div>').appendTo(sidebar_html.find('.sidebar-content'));

            _this.easyLayer = easyLayer(map, options);
            controlLayer = _this.easyLayer;
            controlLayer.addTo(_this.panelTree);

            pushTool('panelTree', _this.panelTree);

            //legend
            jQuery('<li><a href="#legend" role="tab" title="' + i18n.t('tools_tooltips.legend') + '"><i class="fa fa-newspaper-o"></i></a></li>').appendTo(sidebar_html.find('.sidebar-tabs-top'));
            _this.panelLegend = jQuery('<div class="sidebar-pane" id="legend"></div>').appendTo(sidebar_html.find('.sidebar-content'));

            _this.easyLegend = easyLegend(map, controlLayer, serviceConnector, options);
            controlLegend = _this.easyLegend;
            controlLegend.addTo(_this.panelLegend);


            //addLayer
            if (options.addLayer !== false) {
                _this.easyAddLayer = easyAddLayer(_easySDImap, controlLayer, serviceConnector, options);
                sidebar_html.on('click', '.addLayerBtn', function(e) {
                    e.preventDefault();
                    var target = jQuery('<div class="addlayer_container"></div>');
                    jQuery(this).after(target).hide();
                    _this.easyAddLayer.show(target);
                });
                pushTool('addlayer', _this.easyAddLayer);
            }



            //getFeature
            if (options.getfeatureinfo !== false) {
                _this.panelFeature = jQuery('<div class="sidebar-pane" id="getfeature"></div>').appendTo(sidebar_html.find('.sidebar-content'));
                console.log("popup", data.popupheight, data.popupwidth);
                var popup_size = {};
                if (data.popupheight > 0 && data.popupheight != false) {
                    popup_size.popupheight = data.popupheight;
                } else {
                    popup_size.popupheight = 200;
                }
                if (data.popupwidth > 0 && data.popupwidth != false) {
                    popup_size.popupwidth = data.popupwidth;
                } else {
                    popup_size.popupwidth = 350;
                }


                _this.easyGetFeature = easyGetFeature(map, controlLayer, serviceConnector, options, popup_size);
                controlGetFeature = _this.easyGetFeature;
                controlGetFeature.addTo(_this.panelFeature);

                map.on('click', function(e) {
                    // controlGetFeature.showPanel(_this.sidebar);
                });
                pushTool('getfeatureinfo', controlGetFeature);
            }


            //sharelink
            if (options.sharelink) {

                function htmlEncode(value) {
                    return $('<div/>').text(value).html();
                }

                function htmlDecode(value) {
                    return $('<div/>').html(value).text();
                }

                var updateShareLink = function() {
                    if (!_easySDImap.getContext) {
                        setTimeout(updateShareLink, 250);
                        return false;
                    }
                    var base_url = location.protocol + "//" + location.host;
                    var context_url = _easySDImap.params.url;
                    if ((context_url.search('http://') != 0) && (context_url.search('https://') != 0) && (context_url.search('//') != 0)) {
                        context_url = base_url + context_url;
                    }
                    var context = _easySDImap.getContext();
                    var script_path = 'libs/easySDI_leaflet.pack/easySDI_leaflet.pack.min.js';

                    var scripts = document.getElementsByTagName("script");

                    var local_url = '';

                    // Look through them trying to find ourselves
                    for (var i = 0; i < scripts.length; i++) {
                        if (scripts[i].src.indexOf(script_path) > -1) {
                            var local_url = scripts[i].src.substring(0, scripts[i].src.indexOf(script_path));
                        }
                    }

                    if (local_url.length == 0) {
                        script_path = 'libs/easysdi_leaflet/easysdi_leaflet.js';
                        // Look through them trying to find ourselves
                        for (var i = 0; i < scripts.length; i++) {
                            if (scripts[i].src.indexOf(script_path) > -1) {
                                var local_url = scripts[i].src.substring(0, scripts[i].src.indexOf(script_path));
                            }
                        }
                    }


                    code = '';

                    code += '<!-- ---------------------------------- -->' + "\r\n";
                    code += '<!-- CODE A AJOUTER DANS LE BLOC <head> -->' + "\r\n";
                    code += '<!-- ---------------------------------- -->' + "\r\n";
                    code += '<link rel="stylesheet" href="' + local_url + 'libs/leaflet/leaflet.css" type="text/css"/>' + "\r\n";
                    code += '<link rel="stylesheet" href="' + local_url + 'libs/easySDI_leaflet.pack/main.css" type="text/css"/>' + "\r\n";

                    code += "\r\n";
                    code += "\r\n";

                    code += '<!-- -------------------------------------------------- -->' + "\r\n";
                    code += '<!-- CODE A AJOUTER OU VOUS SOUHAITEZ AFFICHER LA CARTE -->' + "\r\n";
                    code += '<!-- -------------------------------------------------- -->' + "\r\n";
                    code += '<div id="easySDIMap" class="easySDImapPrintBlock">' + "\r\n";
                    code += '   <div id="map" class="easySDI-leaflet sidebar-map" data-url="' + context_url + '"';
                    code += ' data-context=\'' + JSON.stringify(context) + "'";
                    if (isset(_easySDImap.params.ignkey)) code += ' data-ignkey="VOTRE_CLEF_IGN"';
                    code += '></div>' + "\r\n";
                    code += '</div>' + "\r\n";

                    code += "\r\n";


                    code += "<script> window.jQuery ||  document.write('<script src=\"https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min.js\"><\\\/script>');</script>" + "\r\n";
                    code += "<script> window.L ||  document.write('<script src=\"https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.5/leaflet.js\"><\\\/script>');</script>" + "\r\n";
                    code += '<script src="' + local_url + 'libs/easySDI_leaflet.pack/easySDI_leaflet.pack.js" type="text/javascript"></script>' + "\r\n";
                    if (jQuery.inArray('Google', context.layers.baseLayer) != -1 || jQuery.inArray('Google', context.layers.overlays) != -1) {
                        code += '<script src="https://maps.google.com/maps/api/js?v=3&sensor=false" type="text/javascript"></script>' + "\r\n";
                    }

                    code += '';

                    html = '<h4>Vous pouvez intégrer cette carte à votre site en utilisant le code suivant:</h4>';
                    html += '<pre class="sharelink">' + htmlEncode(code) + '</pre>';




                    jQuery('#sharelink').html(html);
                }

                jQuery('<li><a href="#sharelink" role="tab" title="' + i18n.t('tools_tooltips.sharelink') + '"><i class="fa fa-share-alt"></i></a></li>').appendTo(sidebar_html.find('.sidebar-tabs-top'));
                _this.panelSharelink = jQuery('<div class="sidebar-pane" id="sharelink"><pre></pre></div>').appendTo(sidebar_html.find('.sidebar-content'));
                updateShareLink();

                map.on('moveend', function(e) {
                    updateShareLink();
                });
                map.on('layeradd', function(e) {
                    updateShareLink();
                });
                map.on('layerremove', function(e) {
                    updateShareLink();
                });

            }


            _this.sidebar = L.control.sidebar('easysdi_leaflet_sidebar', options);
            _this.sidebar.addTo(map);




            return _this;
        };


        //*******

        if (data === undefined) {
            var textarea = obj.find('textarea');
            contextMapData = jQuery.parseJSON(textarea.val());
            textarea.remove();

        } else {
            contextMapData = data;
        }

        lang = contextMapData.lang;
        var i18nPath = local_url + 'locales';

        i18n.init({
            resGetPath: i18nPath + '/' + lang + '/translation.json',
            lng: lang
        }, function(t) {
            init();
        });



        obj.data('_easySDImap', _easySDImap);

        return _easySDImap;
    };


    // auto init div.easySDI-leaflet[data-url]
    jQuery('div.easySDI-leaflet[data-url]').each(function() {
        var obj = jQuery(this);
        jQuery.getJSON(obj.data('url'), {}, function(data) {
            var n = easySDImap(obj, data.data, obj.data());
            if (obj.data('callback') !== undefined) {
                var c = obj.data('callback');
                if (jQuery.isFunction(c)) {
                    c(n);
                } else {
                    try {
                        ce = eval(c);
                        ce(n);
                    } catch (e) {
                        console.error('invalid callback ' + c + ' ' + e);
                    }
                }
                //  if (jQuery.isFunction(c)) c(n);
            }
        }).fail(function(jqXHR, textStatus, errorThrown) {
            if (textStatus !== 'abort') {
                console.log("error " + textStatus);
                console.log("incoming Text " + jqXHR.responseText);
            }
        });
    });


    jQuery.fn.extend({
        easySDImap: function(data, callback) {
            var map_array = [];
            this.each(function() {
                if (data !== undefined) {
                    var n = easySDImap(jQuery(this), data);
                    if (jQuery.isFunction(callback)) callback(n);
                    return n;
                }
                map_array.push(jQuery(this).data('_easySDImap'));
            });
            return map_array.length == 1 ? map_array[0] : map_array;
        }
    });



});



/************/
