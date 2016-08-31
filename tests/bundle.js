(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
(function (process){
/**
 * @hello.js
 *
 * HelloJS is a client side Javascript SDK for making OAuth2 logins and subsequent REST calls.
 *
 * @author Andrew Dodson
 * @website https://adodson.com/hello.js/
 *
 * @copyright Andrew Dodson, 2012 - 2015
 * @license MIT: You are free to use and modify this code for any use, on the condition that this copyright notice remains.
 */

'use strict';

var extend = require('tricks/object/extend');
var _store = require('tricks/helper/store');

var hello = function hello(name) {
	return hello.use(name);
};

module.exports = hello;

extend(hello, {

	settings: {

		// OAuth2 authentication defaults
		redirect_uri: typeof location !== 'undefined' ? location.href.split('#')[0] : null,
		response_type: 'token',
		display: 'popup',
		state: '',

		// OAuth1 shim
		// The path to the OAuth1 server for signing user requests
		// Want to recreate your own? Checkout https://github.com/MrSwitch/node-oauth-shim
		oauth_proxy: 'https://auth-server.herokuapp.com/proxy',

		// API timeout in milliseconds
		timeout: 20000,

		// Popup Options
		popup: {
			resizable: 1,
			scrollbars: 1,
			width: 500,
			height: 550
		},

		// Default scope
		// Many services require atleast a profile scope,
		// HelloJS automatially includes the value of provider.scope_map.basic
		// If that's not required it can be removed via hello.settings.scope.length = 0;
		scope: ['basic'],

		// Scope Maps
		// This is the default module scope, these are the defaults which each service is mapped too.
		// By including them here it prevents the scope from being applied accidentally
		scope_map: {
			basic: ''
		},

		// Default service / network
		default_service: null,

		// Force authentication
		// When hello.login is fired.
		// (null): ignore current session expiry and continue with login
		// (true): ignore current session expiry and continue with login, ask for user to reauthenticate
		// (false): if the current session looks good for the request scopes return the current session.
		force: null,

		// Page URL
		// When 'display=page' this property defines where the users page should end up after redirect_uri
		// Ths could be problematic if the redirect_uri is indeed the final place,
		// Typically this circumvents the problem of the redirect_url being a dumb relay page.
		page_uri: typeof location !== 'undefined' ? location.href : null
	},

	// Service configuration objects
	services: {},

	// Use
	// Define a new instance of the HelloJS library with a default service
	use: function use(service) {

		// Create self, which inherits from its parent
		var self = Object.create(this);

		// Inherit the prototype from its parent
		self.settings = Object.create(this.settings);

		// Define the default service
		if (service) {
			self.settings.default_service = service;
		}

		// Create an instance of Events
		self.utils.Event.call(self);

		return self;
	},

	// Initialize
	// Define the client_ids for the endpoint services
	// @param object o, contains a key value pair, service => clientId
	// @param object opts, contains a key value pair of options used for defining the authentication defaults
	// @param number timeout, timeout in seconds
	init: function init(services, options) {

		var utils = this.utils;

		if (!services) {
			return this.services;
		}

		// Define provider credentials
		// Reformat the ID field
		for (var x in services) {
			if (services.hasOwnProperty(x)) {
				if (typeof services[x] !== 'object') {
					services[x] = { id: services[x] };
				}
			}
		}

		// Merge services if there already exists some
		extend(this.services, services);

		// Update the default settings with this one.
		if (options) {
			extend(this.settings, options);

			// Do this immediatly incase the browser changes the current path.
			if ('redirect_uri' in options) {
				this.settings.redirect_uri = utils.url(options.redirect_uri).href;
			}
		}

		return this;
	},

	// Login
	// Using the endpoint
	// @param network stringify       name to connect to
	// @param options object    (optional)  {display mode, is either none|popup(default)|page, scope: email,birthday,publish, .. }
	// @param callback  function  (optional)  fired on signin
	login: function login() {

		// Create an object which inherits its parent as the prototype and constructs a new event chain.
		var _this = this;
		var utils = _this.utils;
		var error = utils.error;
		var promise = utils.Promise();

		// Get parameters
		var p = utils.args({ network: 's', options: 'o', callback: 'f' }, arguments);

		// Local vars
		var url;

		// Get all the custom options and store to be appended to the querystring
		var qs = utils.diffKey(p.options, _this.settings);

		// Merge/override options with app defaults
		var opts = p.options = utils.merge(_this.settings, p.options || {});

		// Merge/override options with app defaults
		opts.popup = utils.merge(_this.settings.popup, p.options.popup || {});

		// Network
		p.network = p.network || _this.settings.default_service;

		// Bind callback to both reject and fulfill states
		promise.proxy.then(p.callback, p.callback);

		// Trigger an event on the global listener
		function emit(s, value) {
			hello.emit(s, value);
		}

		promise.proxy.then(emit.bind(this, 'auth.login auth'), emit.bind(this, 'auth.failed auth'));

		// Is our service valid?
		if (typeof p.network !== 'string' || !(p.network in _this.services)) {
			// Trigger the default login.
			// Ahh we dont have one.
			return promise.reject(error('invalid_network', 'The provided network was not recognized'));
		}

		var provider = _this.services[p.network];

		// Create a global listener to capture events triggered out of scope
		var callbackId = utils.globalEvent(function (str) {

			// The responseHandler returns a string, lets save this locally
			var obj;

			if (str) {
				obj = JSON.parse(str);
			} else {
				obj = error('cancelled', 'The authentication was not completed');
			}

			// Handle these response using the local
			// Trigger on the parent
			if (!obj.error) {

				// Save on the parent window the new credentials
				// This fixes an IE10 bug i think... atleast it does for me.
				utils.store(obj.network, obj);

				// Fulfill a successful login
				promise.fulfill({
					network: obj.network,
					authResponse: obj
				});
			} else {
				// Reject a successful login
				promise.reject(obj);
			}
		});

		var redirectUri = utils.url(opts.redirect_uri).href;

		// May be a space-delimited list of multiple, complementary types
		var responseType = provider.oauth.response_type || opts.response_type;

		// Fallback to token if the module hasn't defined a grant url
		if (/\bcode\b/.test(responseType) && !provider.oauth.grant) {
			responseType = responseType.replace(/\bcode\b/, 'token');
		}

		// Query string parameters, we may pass our own arguments to form the querystring
		p.qs = utils.merge(qs, {
			client_id: encodeURIComponent(provider.id),
			response_type: encodeURIComponent(responseType),
			redirect_uri: encodeURIComponent(redirectUri),
			state: {
				client_id: provider.id,
				network: p.network,
				display: opts.display,
				callback: callbackId,
				state: opts.state,
				redirect_uri: redirectUri
			}
		});

		// Get current session for merging scopes, and for quick auth response
		var session = utils.store(p.network);

		// Scopes (authentication permisions)
		// Ensure this is a string - IE has a problem moving Arrays between windows
		// Append the setup scope
		var SCOPE_SPLIT = /[,\s]+/;

		// Include default scope settings (cloned).
		var scope = _this.settings.scope ? [_this.settings.scope.toString()] : [];

		// Extend the providers scope list with the default
		var scopeMap = utils.merge(_this.settings.scope_map, provider.scope || {});

		// Add user defined scopes...
		if (opts.scope) {
			scope.push(opts.scope.toString());
		}

		// Append scopes from a previous session.
		// This helps keep app credentials constant,
		// Avoiding having to keep tabs on what scopes are authorized
		if (session && 'scope' in session && session.scope instanceof String) {
			scope.push(session.scope);
		}

		// Join and Split again
		scope = scope.join(',').split(SCOPE_SPLIT);

		// Format remove duplicates and empty values
		scope = utils.unique(scope).filter(filterEmpty);

		// Save the the scopes to the state with the names that they were requested with.
		p.qs.state.scope = scope.join(',');

		// Map scopes to the providers naming convention
		scope = scope.map(function (item) {
			// Does this have a mapping?
			return item in scopeMap ? scopeMap[item] : item;
		});

		// Stringify and Arrayify so that double mapped scopes are given the chance to be formatted
		scope = scope.join(',').split(SCOPE_SPLIT);

		// Again...
		// Format remove duplicates and empty values
		scope = utils.unique(scope).filter(filterEmpty);

		// Join with the expected scope delimiter into a string
		p.qs.scope = scope.join(provider.scope_delim || ',');

		// Is the user already signed in with the appropriate scopes, valid access_token?
		if (opts.force === false) {

			if (session && 'access_token' in session && session.access_token && 'expires' in session && session.expires > new Date().getTime() / 1e3) {
				// What is different about the scopes in the session vs the scopes in the new login?
				var diff = utils.diff((session.scope || '').split(SCOPE_SPLIT), (p.qs.state.scope || '').split(SCOPE_SPLIT));
				if (diff.length === 0) {

					// OK trigger the callback
					promise.fulfill({
						unchanged: true,
						network: p.network,
						authResponse: session
					});

					// Nothing has changed
					return promise;
				}
			}
		}

		// Page URL
		if (opts.display === 'page' && opts.page_uri) {
			// Add a page location, place to endup after session has authenticated
			p.qs.state.page_uri = utils.url(opts.page_uri).href;
		}

		// Bespoke
		// Override login querystrings from auth_options
		if ('login' in provider && typeof provider.login === 'function') {
			// Format the paramaters according to the providers formatting function
			provider.login(p);
		}

		// Add OAuth to state
		// Where the service is going to take advantage of the oauth_proxy
		if (!/\btoken\b/.test(responseType) || parseInt(provider.oauth.version, 10) < 2 || opts.display === 'none' && provider.oauth.grant && session && session.refresh_token) {

			// Add the oauth endpoints
			p.qs.state.oauth = provider.oauth;

			// Add the proxy url
			p.qs.state.oauth_proxy = opts.oauth_proxy;
		}

		// Convert state to a string
		p.qs.state = encodeURIComponent(JSON.stringify(p.qs.state));

		// URL
		if (parseInt(provider.oauth.version, 10) === 1) {

			// Turn the request to the OAuth Proxy for 3-legged auth
			url = utils.qs(opts.oauth_proxy, p.qs, encodeFunction);
		}

		// Refresh token
		else if (opts.display === 'none' && provider.oauth.grant && session && session.refresh_token) {

				// Add the refresh_token to the request
				p.qs.refresh_token = session.refresh_token;

				// Define the request path
				url = utils.qs(opts.oauth_proxy, p.qs, encodeFunction);
			} else {
				url = utils.qs(provider.oauth.auth, p.qs, encodeFunction);
			}

		// Broadcast this event as an auth:init
		emit('auth.init', p);

		// Execute
		// Trigger how we want self displayed
		if (opts.display === 'none') {
			// Sign-in in the background, iframe
			utils.iframe(url, redirectUri);
		}

		// Triggering popup?
		else if (opts.display === 'popup') {

				var popup = utils.popup(url, redirectUri, opts.popup);

				var timer = setInterval(function () {
					if (!popup || popup.closed) {
						clearInterval(timer);
						if (!promise.state) {

							var response = error('cancelled', 'Login has been cancelled');

							if (!popup) {
								response = error('blocked', 'Popup was blocked');
							}

							response.network = p.network;

							promise.reject(response);
						}
					}
				}, 100);
			} else {
				window.location = url;
			}

		return promise.proxy;

		function encodeFunction(s) {
			return s;
		}

		function filterEmpty(s) {
			return !!s;
		}
	},

	// Remove any data associated with a given service
	// @param string name of the service
	// @param function callback
	logout: function logout() {

		var _this = this;
		var utils = _this.utils;
		var error = utils.error;

		// Create a new promise
		var promise = utils.Promise();

		var p = utils.args({ name: 's', options: 'o', callback: 'f' }, arguments);

		p.options = p.options || {};

		// Add callback to events
		promise.proxy.then(p.callback, p.callback);

		// Trigger an event on the global listener
		function emit(s, value) {
			hello.emit(s, value);
		}

		promise.proxy.then(emit.bind(this, 'auth.logout auth'), emit.bind(this, 'error'));

		// Network
		p.name = p.name || this.settings.default_service;
		p.authResponse = utils.store(p.name);

		if (p.name && !(p.name in _this.services)) {

			promise.reject(error('invalid_network', 'The network was unrecognized'));
		} else if (p.name && p.authResponse) {

			// Define the callback
			var callback = function callback(opts) {

				// Remove from the store
				utils.store(p.name, null);

				// Emit events by default
				promise.fulfill(hello.utils.merge({ network: p.name }, opts || {}));
			};

			// Run an async operation to remove the users session
			var _opts = {};
			if (p.options.force) {
				var logout = _this.services[p.name].logout;
				if (logout) {
					// Convert logout to URL string,
					// If no string is returned, then this function will handle the logout async style
					if (typeof logout === 'function') {
						logout = logout(callback, p);
					}

					// If logout is a string then assume URL and open in iframe.
					if (typeof logout === 'string') {
						utils.iframe(logout);
						_opts.force = null;
						_opts.message = 'Logout success on providers site was indeterminate';
					} else if (logout === undefined) {
						// The callback function will handle the response.
						return promise.proxy;
					}
				}
			}

			// Remove local credentials
			callback(_opts);
		} else {
			promise.reject(error('invalid_session', 'There was no session to remove'));
		}

		return promise.proxy;
	},

	// Returns all the sessions that are subscribed too
	// @param string optional, name of the service to get information about.
	getAuthResponse: function getAuthResponse(service) {

		// If the service doesn't exist
		service = service || this.settings.default_service;

		if (!service || !(service in this.services)) {
			return null;
		}

		return this.utils.store(service) || null;
	},

	// Events: placeholder for the events
	events: {}
});

// Core utilities
extend(hello.utils, {

	// Error
	error: function error(code, message) {
		return {
			error: {
				code: code,
				message: message
			}
		};
	},

	// Append the querystring to a url
	// @param string url
	// @param object parameters
	qs: function qs(url, params, formatFunction) {

		if (params) {

			// Set default formatting function
			formatFunction = formatFunction || encodeURIComponent;

			// Override the items in the URL which already exist
			for (var x in params) {
				var str = '([\\?\\&])' + x + '=[^\\&]*';
				var reg = new RegExp(str);
				if (url.match(reg)) {
					url = url.replace(reg, '$1' + x + '=' + formatFunction(params[x]));
					delete params[x];
				}
			}
		}

		if (!this.isEmpty(params)) {
			return url + (url.indexOf('?') > -1 ? '&' : '?') + this.param(params, formatFunction);
		}

		return url;
	},

	// Param
	// Explode/encode the parameters of an URL string/object
	// @param string s, string to decode
	param: function param(s, formatFunction) {
		var b;
		var a = {};
		var m;

		if (typeof s === 'string') {

			formatFunction = formatFunction || decodeURIComponent;

			m = s.replace(/^[\#\?]/, '').match(/([^=\/\&]+)=([^\&]+)/g);
			if (m) {
				for (var i = 0; i < m.length; i++) {
					b = m[i].match(/([^=]+)=(.*)/);
					a[b[1]] = formatFunction(b[2]);
				}
			}

			return a;
		} else {

			formatFunction = formatFunction || encodeURIComponent;

			var o = s;

			a = [];

			for (var x in o) {
				if (o.hasOwnProperty(x)) {
					if (o.hasOwnProperty(x)) {
						a.push([x, o[x] === '?' ? '?' : formatFunction(o[x])].join('='));
					}
				}
			}

			return a.join('&');
		}
	},

	// Local storage facade
	store: function store() {
		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		// If this is setting a value
		_store.apply(null, args);
	},

	// Create and Append new DOM elements
	// @param node string
	// @param attr object literal
	// @param dom/string
	append: function append(node, attr, target) {

		var n = typeof node === 'string' ? document.createElement(node) : node;

		if (typeof attr === 'object') {
			if ('tagName' in attr) {
				target = attr;
			} else {
				for (var x in attr) {
					if (attr.hasOwnProperty(x)) {
						if (typeof attr[x] === 'object') {
							for (var y in attr[x]) {
								if (attr[x].hasOwnProperty(y)) {
									n[x][y] = attr[x][y];
								}
							}
						} else if (x === 'html') {
							n.innerHTML = attr[x];
						}

						// IE doesn't like us setting methods with setAttribute
						else if (!/^on/.test(x)) {
								n.setAttribute(x, attr[x]);
							} else {
								n[x] = attr[x];
							}
					}
				}
			}
		}

		if (target === 'body') {
			(function self() {
				if (document.body) {
					document.body.appendChild(n);
				} else {
					setTimeout(self, 16);
				}
			})();
		} else if (typeof target === 'object') {
			target.appendChild(n);
		} else if (typeof target === 'string') {
			document.getElementsByTagName(target)[0].appendChild(n);
		}

		return n;
	},

	// An easy way to create a hidden iframe
	// @param string src
	iframe: function iframe(src) {
		this.append('iframe', { src: src, style: { position: 'absolute', left: '-1000px', bottom: 0, height: '1px', width: '1px' } }, 'body');
	},

	// Makes it easier to assign parameters, where some are optional
	// @param o object
	// @param a arguments
	args: function args(o, _args) {

		var p = {};
		var i = 0;
		var t = null;
		var x = null;

		// 'x' is the first key in the list of object parameters
		for (x in o) {
			if (o.hasOwnProperty(x)) {
				break;
			}
		}

		// Passing in hash object of arguments?
		// Where the first argument can't be an object
		if (_args.length === 1 && typeof _args[0] === 'object' && o[x] != 'o!') {

			// Could this object still belong to a property?
			// Check the object keys if they match any of the property keys
			for (x in _args[0]) {
				if (o.hasOwnProperty(x)) {
					// Does this key exist in the property list?
					if (x in o) {
						// Yes this key does exist so its most likely this function has been invoked with an object parameter
						// Return first argument as the hash of all arguments
						return _args[0];
					}
				}
			}
		}

		// Else loop through and account for the missing ones.
		for (x in o) {
			if (o.hasOwnProperty(x)) {

				t = typeof _args[i];

				if (typeof o[x] === 'function' && o[x].test(_args[i]) || typeof o[x] === 'string' && (o[x].indexOf('s') > -1 && t === 'string' || o[x].indexOf('o') > -1 && t === 'object' || o[x].indexOf('i') > -1 && t === 'number' || o[x].indexOf('a') > -1 && t === 'object' || o[x].indexOf('f') > -1 && t === 'function')) {
					p[x] = _args[i++];
				} else if (typeof o[x] === 'string' && o[x].indexOf('!') > -1) {
					return false;
				}
			}
		}

		return p;
	},

	// Returns a URL instance
	url: function url(path) {

		// If the path is empty
		if (!path) {
			return window.location;
		}

		// Chrome and FireFox support new URL() to extract URL objects
		else if (window.URL && URL instanceof Function && URL.length !== 0) {
				return new URL(path, window.location);
			}

			// Ugly shim, it works!
			else {
					var a = document.createElement('a');
					a.href = path;
					return a.cloneNode(false);
				}
	},

	diff: function diff(a, b) {
		return b.filter(function (item) {
			return a.indexOf(item) === -1;
		});
	},

	// Get the different hash of properties unique to `a`, and not in `b`
	diffKey: function diffKey(a, b) {
		if (a || !b) {
			var r = {};
			for (var x in a) {
				// Does the property not exist?
				if (!(x in b)) {
					r[x] = a[x];
				}
			}

			return r;
		}

		return a;
	},

	// Unique
	// Remove duplicate and null values from an array
	// @param a array
	unique: function unique(a) {
		if (!Array.isArray(a)) {
			return [];
		}

		return a.filter(function (item, index) {
			// Is this the first location of item
			return a.indexOf(item) === index;
		});
	},

	isEmpty: function isEmpty(obj) {

		// Scalar
		if (!obj) return true;

		// Array
		if (Array.isArray(obj)) {
			return !obj.length;
		} else if (typeof obj === 'object') {
			// Object
			for (var key in obj) {
				if (obj.hasOwnProperty(key)) {
					return false;
				}
			}
		}

		return true;
	},

	//jscs:disable

	/*!
  **  Thenable -- Embeddable Minimum Strictly-Compliant Promises/A+ 1.1.1 Thenable
  **  Copyright (c) 2013-2014 Ralf S. Engelschall <http://engelschall.com>
  **  Licensed under The MIT License <http://opensource.org/licenses/MIT>
  **  Source-Code distributed on <http://github.com/rse/thenable>
  */
	Promise: (function () {
		/*  promise states [Promises/A+ 2.1]  */
		var STATE_PENDING = 0; /*  [Promises/A+ 2.1.1]  */
		var STATE_FULFILLED = 1; /*  [Promises/A+ 2.1.2]  */
		var STATE_REJECTED = 2; /*  [Promises/A+ 2.1.3]  */

		/*  promise object constructor  */
		var api = function api(executor) {
			/*  optionally support non-constructor/plain-function call  */
			if (!(this instanceof api)) return new api(executor);

			/*  initialize object  */
			this.id = "Thenable/1.0.6";
			this.state = STATE_PENDING; /*  initial state  */
			this.fulfillValue = undefined; /*  initial value  */ /*  [Promises/A+ 1.3, 2.1.2.2]  */
			this.rejectReason = undefined; /*  initial reason */ /*  [Promises/A+ 1.5, 2.1.3.2]  */
			this.onFulfilled = []; /*  initial handlers  */
			this.onRejected = []; /*  initial handlers  */

			/*  provide optional information-hiding proxy  */
			this.proxy = {
				then: this.then.bind(this)
			};

			/*  support optional executor function  */
			if (typeof executor === "function") executor.call(this, this.fulfill.bind(this), this.reject.bind(this));
		};

		/*  promise API methods  */
		api.prototype = {
			/*  promise resolving methods  */
			fulfill: function fulfill(value) {
				return deliver(this, STATE_FULFILLED, "fulfillValue", value);
			},
			reject: function reject(value) {
				return deliver(this, STATE_REJECTED, "rejectReason", value);
			},

			/*  "The then Method" [Promises/A+ 1.1, 1.2, 2.2]  */
			then: function then(onFulfilled, onRejected) {
				var curr = this;
				var next = new api(); /*  [Promises/A+ 2.2.7]  */
				curr.onFulfilled.push(resolver(onFulfilled, next, "fulfill")); /*  [Promises/A+ 2.2.2/2.2.6]  */
				curr.onRejected.push(resolver(onRejected, next, "reject")); /*  [Promises/A+ 2.2.3/2.2.6]  */
				execute(curr);
				return next.proxy; /*  [Promises/A+ 2.2.7, 3.3]  */
			}
		};

		/*  deliver an action  */
		var deliver = function deliver(curr, state, name, value) {
			if (curr.state === STATE_PENDING) {
				curr.state = state; /*  [Promises/A+ 2.1.2.1, 2.1.3.1]  */
				curr[name] = value; /*  [Promises/A+ 2.1.2.2, 2.1.3.2]  */
				execute(curr);
			}
			return curr;
		};

		/*  execute all handlers  */
		var execute = function execute(curr) {
			if (curr.state === STATE_FULFILLED) execute_handlers(curr, "onFulfilled", curr.fulfillValue);else if (curr.state === STATE_REJECTED) execute_handlers(curr, "onRejected", curr.rejectReason);
		};

		/*  execute particular set of handlers  */
		var execute_handlers = function execute_handlers(curr, name, value) {
			/* global process: true */
			/* global setImmediate: true */
			/* global setTimeout: true */

			/*  short-circuit processing  */
			if (curr[name].length === 0) return;

			/*  iterate over all handlers, exactly once  */
			var handlers = curr[name];
			curr[name] = []; /*  [Promises/A+ 2.2.2.3, 2.2.3.3]  */
			var func = function func() {
				for (var i = 0; i < handlers.length; i++) handlers[i](value); /*  [Promises/A+ 2.2.5]  */
			};

			/*  execute procedure asynchronously  */ /*  [Promises/A+ 2.2.4, 3.1]  */
			if (typeof process === "object" && typeof process.nextTick === "function") process.nextTick(func);else if (typeof setImmediate === "function") setImmediate(func);else setTimeout(func, 0);
		};

		/*  generate a resolver function  */
		var resolver = function resolver(cb, next, method) {
			return function (value) {
				if (typeof cb !== "function") /*  [Promises/A+ 2.2.1, 2.2.7.3, 2.2.7.4]  */
					next[method].call(next, value); /*  [Promises/A+ 2.2.7.3, 2.2.7.4]  */
				else {
						var result;
						try {
							result = cb(value);
						} /*  [Promises/A+ 2.2.2.1, 2.2.3.1, 2.2.5, 3.2]  */
						catch (e) {
							next.reject(e); /*  [Promises/A+ 2.2.7.2]  */
							return;
						}
						resolve(next, result); /*  [Promises/A+ 2.2.7.1]  */
					}
			};
		};

		/*  "Promise Resolution Procedure"  */ /*  [Promises/A+ 2.3]  */
		var resolve = function resolve(promise, x) {
			/*  sanity check arguments  */ /*  [Promises/A+ 2.3.1]  */
			if (promise === x || promise.proxy === x) {
				promise.reject(new TypeError("cannot resolve promise with itself"));
				return;
			}

			/*  surgically check for a "then" method
   	(mainly to just call the "getter" of "then" only once)  */
			var then;
			if (typeof x === "object" && x !== null || typeof x === "function") {
				try {
					then = x.then;
				} /*  [Promises/A+ 2.3.3.1, 3.5]  */
				catch (e) {
					promise.reject(e); /*  [Promises/A+ 2.3.3.2]  */
					return;
				}
			}

			/*  handle own Thenables    [Promises/A+ 2.3.2]
   	and similar "thenables" [Promises/A+ 2.3.3]  */
			if (typeof then === "function") {
				var resolved = false;
				try {
					/*  call retrieved "then" method */ /*  [Promises/A+ 2.3.3.3]  */
					then.call(x,
					/*  resolvePromise  */function (y) {
						if (resolved) return;resolved = true; /*  [Promises/A+ 2.3.3.3.3]  */
						if (y === x) /*  [Promises/A+ 3.6]  */
							promise.reject(new TypeError("circular thenable chain"));else resolve(promise, y);
					},

					/*  rejectPromise  */function (r) {
						if (resolved) return;resolved = true; /*  [Promises/A+ 2.3.3.3.3]  */
						promise.reject(r);
					});
				} catch (e) {
					if (!resolved) /*  [Promises/A+ 2.3.3.3.3]  */
						promise.reject(e); /*  [Promises/A+ 2.3.3.3.4]  */
				}
				return;
			}

			/*  handle other values  */
			promise.fulfill(x); /*  [Promises/A+ 2.3.4, 2.3.3.4]  */
		};

		/*  export API  */
		return api;
	})(),

	//jscs:enable

	// Event
	// A contructor superclass for adding event menthods, on, off, emit.
	Event: function Event() {

		var separator = /[\s\,]+/;

		// If this doesn't support getPrototype then we can't get prototype.events of the parent
		// So lets get the current instance events, and add those to a parent property
		this.parent = {
			events: this.events,
			findEvents: this.findEvents,
			parent: this.parent,
			utils: this.utils
		};

		this.events = {};

		// On, subscribe to events
		// @param evt   string
		// @param callback  function
		this.on = function (evt, callback) {

			if (callback && typeof callback === 'function') {
				var a = evt.split(separator);
				for (var i = 0; i < a.length; i++) {

					// Has this event already been fired on this instance?
					this.events[a[i]] = [callback].concat(this.events[a[i]] || []);
				}
			}

			return this;
		};

		// Off, unsubscribe to events
		// @param evt   string
		// @param callback  function
		this.off = function (evt, callback) {

			this.findEvents(evt, function (name, index) {
				if (!callback || this.events[name][index] === callback) {
					this.events[name][index] = null;
				}
			});

			return this;
		};

		// Emit
		// Triggers any subscribed events
		this.emit = function (evt /*, data, ... */) {

			// Get arguments as an Array, knock off the first one
			var args = Array.prototype.slice.call(arguments, 1);
			args.push(evt);

			// Handler
			var handler = function handler(name, index) {

				// Replace the last property with the event name
				args[args.length - 1] = name === '*' ? evt : name;

				// Trigger
				this.events[name][index].apply(this, args);
			};

			// Find the callbacks which match the condition and call
			var _this = this;
			while (_this && _this.findEvents) {

				// Find events which match
				_this.findEvents(evt + ',*', handler);
				_this = _this.parent;
			}

			return this;
		};

		//
		// Easy functions
		this.emitAfter = function () {
			var _this = this;
			var args = arguments;
			setTimeout(function () {
				_this.emit.apply(_this, args);
			}, 0);

			return this;
		};

		this.findEvents = function (evt, callback) {

			var a = evt.split(separator);

			for (var name in this.events) {
				if (this.events.hasOwnProperty(name)) {

					if (a.indexOf(name) > -1) {

						for (var i = 0; i < this.events[name].length; i++) {

							// Does the event handler exist?
							if (this.events[name][i]) {
								// Emit on the local instance of this
								callback.call(this, name, i);
							}
						}
					}
				}
			}
		};

		return this;
	},

	// Global Events
	// Attach the callback to the window object
	// Return its unique reference
	globalEvent: function globalEvent(callback, guid) {
		// If the guid has not been supplied then create a new one.
		guid = guid || '_hellojs_' + parseInt(Math.random() * 1e12, 10).toString(36);

		// Define the callback function
		window[guid] = function () {
			// Trigger the callback
			try {
				if (callback.apply(this, arguments)) {
					delete window[guid];
				}
			} catch (e) {
				console.error(e);
			}
		};

		return guid;
	},

	// Trigger a clientside popup
	// This has been augmented to support PhoneGap
	popup: function popup(url, redirectUri, options) {

		var documentElement = document.documentElement;

		// Multi Screen Popup Positioning (http://stackoverflow.com/a/16861050)
		// Credit: http://www.xtf.dk/2011/08/center-new-popup-window-even-on.html
		// Fixes dual-screen position                         Most browsers      Firefox

		if (options.height) {
			var dualScreenTop = window.screenTop !== undefined ? window.screenTop : screen.top;
			var height = screen.height || window.innerHeight || documentElement.clientHeight;
			options.top = parseInt((height - options.height) / 2, 10) + dualScreenTop;
		}

		if (options.width) {
			var dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : screen.left;
			var width = screen.width || window.innerWidth || documentElement.clientWidth;
			options.left = parseInt((width - options.width) / 2, 10) + dualScreenLeft;
		}

		// Convert options into an array
		var optionsArray = [];
		Object.keys(options).forEach(function (name) {
			var value = options[name];
			optionsArray.push(name + (value !== null ? '=' + value : ''));
		});

		// Call the open() function with the initial path
		//
		// OAuth redirect, fixes URI fragments from being lost in Safari
		// (URI Fragments within 302 Location URI are lost over HTTPS)
		// Loading the redirect.html before triggering the OAuth Flow seems to fix it.
		//
		// Firefox  decodes URL fragments when calling location.hash.
		//  - This is bad if the value contains break points which are escaped
		//  - Hence the url must be encoded twice as it contains breakpoints.
		if (navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1) {
			url = redirectUri + '#oauth_redirect=' + encodeURIComponent(encodeURIComponent(url));
		}

		var popup = window.open(url, '_blank', optionsArray.join(','));

		if (popup && popup.focus) {
			popup.focus();
		}

		return popup;
	},

	// OAuth and API response handler
	responseHandler: function responseHandler(window, parent) {

		var _this = this;
		var p;
		var location = window.location;

		// Is this an auth relay message which needs to call the proxy?
		p = _this.param(location.search);

		// OAuth2 or OAuth1 server response?
		if (p && p.state && (p.code || p.oauth_token)) {

			var state = JSON.parse(p.state);

			// Add this path as the redirect_uri
			p.redirect_uri = state.redirect_uri || location.href.replace(/[\?\#].*$/, '');

			// Redirect to the host
			var path = state.oauth_proxy + '?' + _this.param(p);

			location.assign(path);

			return;
		}

		// Save session, from redirected authentication
		// #access_token has come in?
		//
		// FACEBOOK is returning auth errors within as a query_string... thats a stickler for consistency.
		// SoundCloud is the state in the querystring and the token in the hashtag, so we'll mix the two together

		p = _this.merge(_this.param(location.search || ''), _this.param(location.hash || ''));

		// If p.state
		if (p && 'state' in p) {

			// Remove any addition information
			// E.g. p.state = 'facebook.page';
			try {
				var a = JSON.parse(p.state);
				extend(p, a);
			} catch (e) {
				console.error('Could not decode state parameter');
			}

			// Access_token?
			if ('access_token' in p && p.access_token && p.network) {

				if (!p.expires_in || parseInt(p.expires_in, 10) === 0) {
					// If p.expires_in is unset, set to 0
					p.expires_in = 0;
				}

				p.expires_in = parseInt(p.expires_in, 10);
				p.expires = new Date().getTime() / 1e3 + (p.expires_in || 60 * 60 * 24 * 365);

				// Lets use the "state" to assign it to one of our networks
				authCallback(p, window, parent);
			}

			// Error=?
			// &error_description=?
			// &state=?
			else if ('error' in p && p.error && p.network) {

					p.error = {
						code: p.error,
						message: p.error_message || p.error_description
					};

					// Let the state handler handle it
					authCallback(p, window, parent);
				}

				// API call, or a cancelled login
				// Result is serialized JSON string
				else if (p.callback && p.callback in parent) {

						// Trigger a function in the parent
						var res = 'result' in p && p.result ? JSON.parse(p.result) : false;

						// Trigger the callback on the parent
						parent[p.callback](res);
						closeWindow();
					}

			// If this page is still open
			if (p.page_uri) {
				location.assign(p.page_uri);
			}
		}

		// OAuth redirect, fixes URI fragments from being lost in Safari
		// (URI Fragments within 302 Location URI are lost over HTTPS)
		// Loading the redirect.html before triggering the OAuth Flow seems to fix it.
		else if ('oauth_redirect' in p) {

				location.assign(decodeURIComponent(p.oauth_redirect));
				return;
			}

		// Trigger a callback to authenticate
		function authCallback(obj, window, parent) {

			var cb = obj.callback;
			var network = obj.network;

			// Trigger the callback on the parent
			_this.store(network, obj);

			// If this is a page request it has no parent or opener window to handle callbacks
			if ('display' in obj && obj.display === 'page') {
				return;
			}

			// Remove from session object
			if (parent && cb && cb in parent) {

				try {
					delete obj.callback;
				} catch (e) {}

				// Update store
				_this.store(network, obj);

				// Call the globalEvent function on the parent
				// It's safer to pass back a string to the parent,
				// Rather than an object/array (better for IE8)
				var str = JSON.stringify(obj);

				try {
					parent[cb](str);
				} catch (e) {
					// Error thrown whilst executing parent callback
				}
			}

			closeWindow();
		}

		function closeWindow() {

			if (window.frameElement) {
				// Inside an iframe, remove from parent
				parent.document.body.removeChild(window.frameElement);
			} else {
				// Close this current window
				try {
					window.close();
				} catch (e) {}

				// IOS bug wont let us close a popup if still loading
				if (window.addEventListener) {
					window.addEventListener('load', function () {
						window.close();
					});
				}
			}
		}
	}
});

// Events
// Extend the hello object with its own event instance
hello.utils.Event.call(hello);

///////////////////////////////////
// Monitoring session state
// Check for session changes
///////////////////////////////////

(function (hello) {

	// Monitor for a change in state and fire
	var oldSessions = {};

	// Hash of expired tokens
	var expired = {};

	// Listen to other triggers to Auth events, use these to update this
	hello.on('auth.login, auth.logout', function (auth) {
		if (auth && typeof auth === 'object' && auth.network) {
			oldSessions[auth.network] = hello.utils.store(auth.network) || {};
		}
	});

	(function self() {

		var CURRENT_TIME = new Date().getTime() / 1e3;
		var emit = function emit(eventName) {
			hello.emit('auth.' + eventName, {
				network: name,
				authResponse: session
			});
		};

		// Loop through the services
		for (var name in hello.services) {
			if (hello.services.hasOwnProperty(name)) {

				if (!hello.services[name].id) {
					// We haven't attached an ID so dont listen.
					continue;
				}

				// Get session
				var session = hello.utils.store(name) || {};
				var provider = hello.services[name];
				var oldSess = oldSessions[name] || {};

				// Listen for globalEvents that did not get triggered from the child
				if (session && 'callback' in session) {

					// To do remove from session object...
					var cb = session.callback;
					try {
						delete session.callback;
					} catch (e) {}

					// Update store
					// Removing the callback
					hello.utils.store(name, session);

					// Emit global events
					try {
						window[cb](session);
					} catch (e) {}
				}

				// Refresh token
				if (session && 'expires' in session && session.expires < CURRENT_TIME) {

					// If auto refresh is possible
					// Either the browser supports
					var refresh = provider.refresh || session.refresh_token;

					// Has the refresh been run recently?
					if (refresh && (!(name in expired) || expired[name] < CURRENT_TIME)) {
						// Try to resignin
						hello.emit('notice', name + ' has expired trying to resignin');
						hello.login(name, { display: 'none', force: false });

						// Update expired, every 10 minutes
						expired[name] = CURRENT_TIME + 600;
					}

					// Does this provider not support refresh
					else if (!refresh && !(name in expired)) {
							// Label the event
							emit('expired');
							expired[name] = true;
						}

					// If session has expired then we dont want to store its value until it can be established that its been updated
					continue;
				}

				// Has session changed?
				else if (oldSess.access_token === session.access_token && oldSess.expires === session.expires) {
						continue;
					}

					// Access_token has been removed
					else if (!session.access_token && oldSess.access_token) {
							emit('logout');
						}

						// Access_token has been created
						else if (session.access_token && !oldSess.access_token) {
								emit('login');
							}

							// Access_token has been updated
							else if (session.expires !== oldSess.expires) {
									emit('update');
								}

				// Updated stored session
				oldSessions[name] = session;

				// Remove the expired flags
				if (name in expired) {
					delete expired[name];
				}
			}
		}

		// Check error events
		setTimeout(self, 1000);
	})();
})(hello);

// EOF CORE lib
//////////////////////////////////

/////////////////////////////////////////
// API
// @param path    string
// @param query   object (optional)
// @param method  string (optional)
// @param data    object (optional)
// @param timeout integer (optional)
// @param callback  function (optional)

hello.api = function () {

	// Shorthand
	var _this = this;
	var utils = _this.utils;
	var error = utils.error;

	// Construct a new Promise object
	var promise = utils.Promise();

	// Arguments
	var p = utils.args({ path: 's!', query: 'o', method: 's', data: 'o', timeout: 'i', callback: 'f' }, arguments);

	// Method
	p.method = (p.method || 'get').toLowerCase();

	// Headers
	p.headers = p.headers || {};

	// Query
	p.query = p.query || {};

	// If get, put all parameters into query
	if (p.method === 'get' || p.method === 'delete') {
		extend(p.query, p.data);
		p.data = {};
	}

	var data = p.data = p.data || {};

	// Completed event callback
	promise.then(p.callback, p.callback);

	// Remove the network from path, e.g. facebook:/me/friends
	// Results in { network : facebook, path : me/friends }
	if (!p.path) {
		return promise.reject(error('invalid_path', 'Missing the path parameter from the request'));
	}

	p.path = p.path.replace(/^\/+/, '');
	var a = (p.path.split(/[\/\:]/, 2) || [])[0].toLowerCase();

	if (a in _this.services) {
		p.network = a;
		var reg = new RegExp('^' + a + ':?\/?');
		p.path = p.path.replace(reg, '');
	}

	// Network & Provider
	// Define the network that this request is made for
	p.network = _this.settings.default_service = p.network || _this.settings.default_service;
	var o = _this.services[p.network];

	// INVALID
	// Is there no service by the given network name?
	if (!o) {
		return promise.reject(error('invalid_network', 'Could not match the service requested: ' + p.network));
	}

	// PATH
	// As long as the path isn't flagged as unavaiable, e.g. path == false

	if (!(!(p.method in o) || !(p.path in o[p.method]) || o[p.method][p.path] !== false)) {
		return promise.reject(error('invalid_path', 'The provided path is not available on the selected network'));
	}

	// PROXY
	// OAuth1 calls always need a proxy

	if (!p.oauth_proxy) {
		p.oauth_proxy = _this.settings.oauth_proxy;
	}

	if (!('proxy' in p)) {
		p.proxy = p.oauth_proxy && o.oauth && parseInt(o.oauth.version, 10) === 1;
	}

	// TIMEOUT
	// Adopt timeout from global settings by default

	if (!('timeout' in p)) {
		p.timeout = _this.settings.timeout;
	}

	// Format response
	// Whether to run the raw response through post processing.
	if (!('formatResponse' in p)) {
		p.formatResponse = true;
	}

	// Get the current session
	// Append the access_token to the query
	p.authResponse = _this.getAuthResponse(p.network);
	if (p.authResponse && p.authResponse.access_token) {
		p.query.access_token = p.authResponse.access_token;
	}

	var url = p.path;
	var m;

	// Store the query as options
	// This is used to populate the request object before the data is augmented by the prewrap handlers.
	p.options = utils.clone(p.query);

	// Clone the data object
	// Prevent this script overwriting the data of the incoming object.
	// Ensure that everytime we run an iteration the callbacks haven't removed some data
	p.data = utils.clone(data);

	// URL Mapping
	// Is there a map for the given URL?
	var actions = o[({ 'delete': 'del' })[p.method] || p.method] || {};

	// Extrapolate the QueryString
	// Provide a clean path
	// Move the querystring into the data
	if (p.method === 'get') {

		var query = url.split(/[\?#]/)[1];
		if (query) {
			extend(p.query, utils.param(query));

			// Remove the query part from the URL
			url = url.replace(/\?.*?(#|$)/, '$1');
		}
	}

	// Is the hash fragment defined
	if (m = url.match(/#(.+)/, '')) {
		url = url.split('#')[0];
		p.path = m[1];
	} else if (url in actions) {
		p.path = url;
		url = actions[url];
	} else if ('default' in actions) {
		url = actions['default'];
	}

	// Redirect Handler
	// This defines for the Form+Iframe+Hash hack where to return the results too.
	p.redirect_uri = _this.settings.redirect_uri;

	// Define FormatHandler
	// The request can be procesed in a multitude of ways
	// Here's the options - depending on the browser and endpoint
	p.xhr = o.xhr;
	p.jsonp = o.jsonp;
	p.form = o.form;

	// Make request
	if (typeof url === 'function') {
		// Does self have its own callback?
		url(p, getPath);
	} else {
		// Else the URL is a string
		getPath(url);
	}

	return promise.proxy;

	// If url needs a base
	// Wrap everything in
	function getPath(url) {

		// Format the string if it needs it
		url = url.replace(/\@\{([a-z\_\-]+)(\|.*?)?\}/gi, function (m, key, defaults) {
			var val = defaults ? defaults.replace(/^\|/, '') : '';
			if (key in p.query) {
				val = p.query[key];
				delete p.query[key];
			} else if (p.data && key in p.data) {
				val = p.data[key];
				delete p.data[key];
			} else if (!defaults) {
				promise.reject(error('missing_attribute', 'The attribute ' + key + ' is missing from the request'));
			}

			return val;
		});

		// Add base
		if (!url.match(/^https?:\/\//)) {
			url = o.base + url;
		}

		// Define the request URL
		p.url = url;

		// Make the HTTP request with the curated request object
		// CALLBACK HANDLER
		// @ response object
		// @ statusCode integer if available
		utils.request(p, function (r, headers) {

			// Is this a raw response?
			if (!p.formatResponse) {
				// Bad request? error statusCode or otherwise contains an error response vis JSONP?
				if (typeof headers === 'object' ? headers.statusCode >= 400 : typeof r === 'object' && 'error' in r) {
					promise.reject(r);
				} else {
					promise.fulfill(r);
				}

				return;
			}

			// Should this be an object
			if (r === true) {
				r = { success: true };
			} else if (!r) {
				r = {};
			}

			// The delete callback needs a better response
			if (p.method === 'delete') {
				r = !r || utils.isEmpty(r) ? { success: true } : r;
			}

			// FORMAT RESPONSE?
			// Does self request have a corresponding formatter
			if (o.wrap && (p.path in o.wrap || 'default' in o.wrap)) {
				var wrap = p.path in o.wrap ? p.path : 'default';
				var time = new Date().getTime();

				// FORMAT RESPONSE
				var b = o.wrap[wrap](r, headers, p);

				// Has the response been utterly overwritten?
				// Typically self augments the existing object.. but for those rare occassions
				if (b) {
					r = b;
				}
			}

			// Is there a next_page defined in the response?
			if (r && 'paging' in r && r.paging.next) {

				// Add the relative path if it is missing from the paging/next path
				if (r.paging.next[0] === '?') {
					r.paging.next = p.path + r.paging.next;
				}

				// The relative path has been defined, lets markup the handler in the HashFragment
				else {
						r.paging.next += '#' + p.path;
					}
			}

			// Dispatch to listeners
			// Emit events which pertain to the formatted response
			if (!r || 'error' in r) {
				promise.reject(r);
			} else {
				promise.fulfill(r);
			}
		});
	}
};

// API utilities
extend(hello.utils, {

	// Make an HTTP request
	request: function request(p, callback) {

		var _this = this;
		var error = _this.error;

		// This has to go through a POST request
		if (!_this.isEmpty(p.data) && !('FileList' in window) && _this.hasBinary(p.data)) {

			// Disable XHR and JSONP
			p.xhr = false;
			p.jsonp = false;
		}

		// Check if the browser and service support CORS
		var cors = this.request_cors(function () {
			// If it does then run this...
			return p.xhr === undefined || p.xhr && (typeof p.xhr !== 'function' || p.xhr(p, p.query));
		});

		if (cors) {

			formatUrl(p, function (url) {

				var x = _this.xhr(p.method, url, p.headers, p.data, callback);
				x.onprogress = p.onprogress || null;

				// Windows Phone does not support xhr.upload, see #74
				// Feature detect
				if (x.upload && p.onuploadprogress) {
					x.upload.onprogress = p.onuploadprogress;
				}
			});

			return;
		}

		// Clone the query object
		// Each request modifies the query object and needs to be tared after each one.
		var _query = p.query;

		p.query = _this.clone(p.query);

		// Assign a new callbackID
		p.callbackID = _this.globalEvent();

		// JSONP
		if (p.jsonp !== false) {

			// Clone the query object
			p.query.callback = p.callbackID;

			// If the JSONP is a function then run it
			if (typeof p.jsonp === 'function') {
				p.jsonp(p, p.query);
			}

			// Lets use JSONP if the method is 'get'
			if (p.method === 'get') {

				formatUrl(p, function (url) {
					_this.jsonp(url, callback, p.callbackID, p.timeout);
				});

				return;
			} else {
				// It's not compatible reset query
				p.query = _query;
			}
		}

		// Otherwise we're on to the old school, iframe hacks and JSONP
		if (p.form !== false) {

			// Add some additional query parameters to the URL
			// We're pretty stuffed if the endpoint doesn't like these
			p.query.redirect_uri = p.redirect_uri;
			p.query.state = JSON.stringify({ callback: p.callbackID });

			var opts;

			if (typeof p.form === 'function') {

				// Format the request
				opts = p.form(p, p.query);
			}

			if (p.method === 'post' && opts !== false) {

				formatUrl(p, function (url) {
					_this.post(url, p.data, opts, callback, p.callbackID, p.timeout);
				});

				return;
			}
		}

		// None of the methods were successful throw an error
		callback(error('invalid_request', 'There was no mechanism for handling this request'));

		return;

		// Format URL
		// Constructs the request URL, optionally wraps the URL through a call to a proxy server
		// Returns the formatted URL
		function formatUrl(p, callback) {

			// Are we signing the request?
			var sign;

			// OAuth1
			// Remove the token from the query before signing
			if (p.authResponse && p.authResponse.oauth && parseInt(p.authResponse.oauth.version, 10) === 1) {

				// OAUTH SIGNING PROXY
				sign = p.query.access_token;

				// Remove the access_token
				delete p.query.access_token;

				// Enfore use of Proxy
				p.proxy = true;
			}

			// POST body to querystring
			if (p.data && (p.method === 'get' || p.method === 'delete')) {
				// Attach the p.data to the querystring.
				extend(p.query, p.data);
				p.data = null;
			}

			// Construct the path
			var path = _this.qs(p.url, p.query);

			// Proxy the request through a server
			// Used for signing OAuth1
			// And circumventing services without Access-Control Headers
			if (p.proxy) {
				// Use the proxy as a path
				path = _this.qs(p.oauth_proxy, {
					path: path,
					access_token: sign || '',

					// This will prompt the request to be signed as though it is OAuth1
					then: p.proxy_response_type || (p.method.toLowerCase() === 'get' ? 'redirect' : 'proxy'),
					method: p.method.toLowerCase(),
					suppress_response_codes: true
				});
			}

			callback(path);
		}
	},

	// Test whether the browser supports the CORS response
	request_cors: function request_cors(callback) {
		return 'withCredentials' in new XMLHttpRequest() && callback();
	},

	// Return the type of DOM object
	domInstance: function domInstance(type, data) {
		var test = 'HTML' + (type || '').replace(/^[a-z]/, function (m) {
			return m.toUpperCase();
		}) + 'Element';

		if (!data) {
			return false;
		}

		if (window[test]) {
			return data instanceof window[test];
		} else if (window.Element) {
			return data instanceof window.Element && (!type || data.tagName && data.tagName.toLowerCase() === type);
		} else {
			return !(data instanceof Object || data instanceof Array || data instanceof String || data instanceof Number) && data.tagName && data.tagName.toLowerCase() === type;
		}
	},

	// Create a clone of an object
	clone: function clone(obj) {
		// Does not clone DOM elements, nor Binary data, e.g. Blobs, Filelists
		if (obj === null || typeof obj !== 'object' || obj instanceof Date || 'nodeName' in obj || this.isBinary(obj) || typeof FormData === 'function' && obj instanceof FormData) {
			return obj;
		}

		if (Array.isArray(obj)) {
			// Clone each item in the array
			return obj.map(this.clone.bind(this));
		}

		// But does clone everything else.
		var clone = {};
		for (var x in obj) {
			clone[x] = this.clone(obj[x]);
		}

		return clone;
	},

	// XHR: uses CORS to make requests
	xhr: function xhr(method, url, headers, data, callback) {

		var r = new XMLHttpRequest();
		var error = this.error;

		// Binary?
		var binary = false;
		if (method === 'blob') {
			binary = method;
			method = 'GET';
		}

		method = method.toUpperCase();

		// Xhr.responseType 'json' is not supported in any of the vendors yet.
		r.onload = function (e) {
			var json = r.response;
			try {
				json = JSON.parse(r.responseText);
			} catch (_e) {
				if (r.status === 401) {
					json = error('access_denied', r.statusText);
				}
			}

			var headers = headersToJSON(r.getAllResponseHeaders());
			headers.statusCode = r.status;

			callback(json || (method === 'GET' ? error('empty_response', 'Could not get resource') : {}), headers);
		};

		r.onerror = function (e) {
			var json = r.responseText;
			try {
				json = JSON.parse(r.responseText);
			} catch (_e) {}

			callback(json || error('access_denied', 'Could not get resource'));
		};

		var x;

		// Should we add the query to the URL?
		if (method === 'GET' || method === 'DELETE') {
			data = null;
		} else if (data && typeof data !== 'string' && !(data instanceof FormData) && !(data instanceof File) && !(data instanceof Blob)) {
			// Loop through and add formData
			var f = new FormData();
			for (x in data) if (data.hasOwnProperty(x)) {
				if (data[x] instanceof HTMLInputElement) {
					if ('files' in data[x] && data[x].files.length > 0) {
						f.append(x, data[x].files[0]);
					}
				} else if (data[x] instanceof Blob) {
					f.append(x, data[x], data.name);
				} else {
					f.append(x, data[x]);
				}
			}

			data = f;
		}

		// Open the path, async
		r.open(method, url, true);

		if (binary) {
			if ('responseType' in r) {
				r.responseType = binary;
			} else {
				r.overrideMimeType('text/plain; charset=x-user-defined');
			}
		}

		// Set any bespoke headers
		if (headers) {
			for (x in headers) {
				r.setRequestHeader(x, headers[x]);
			}
		}

		r.send(data);

		return r;

		// Headers are returned as a string
		function headersToJSON(s) {
			var r = {};
			var reg = /([a-z\-]+):\s?(.*);?/gi;
			var m;
			while (m = reg.exec(s)) {
				r[m[1]] = m[2];
			}

			return r;
		}
	},

	// JSONP
	// Injects a script tag into the DOM to be executed and appends a callback function to the window object
	// @param string/function pathFunc either a string of the URL or a callback function pathFunc(querystringhash, continueFunc);
	// @param function callback a function to call on completion;
	jsonp: function jsonp(url, callback, callbackID, timeout) {

		var _this = this;
		var error = _this.error;

		// Change the name of the callback
		var bool = 0;
		var head = document.getElementsByTagName('head')[0];
		var operaFix;
		var result = error('server_error', 'server_error');
		var cb = function cb() {
			if (! bool++) {
				window.setTimeout(function () {
					callback(result);
					head.removeChild(script);
				}, 0);
			}
		};

		// Add callback to the window object
		callbackID = _this.globalEvent(function (json) {
			result = json;
			return true;

			// Mark callback as done
		}, callbackID);

		// The URL is a function for some cases and as such
		// Determine its value with a callback containing the new parameters of this function.
		url = url.replace(new RegExp('=\\?(&|$)'), '=' + callbackID + '$1');

		// Build script tag
		var script = _this.append('script', {
			id: callbackID,
			name: callbackID,
			src: url,
			async: true,
			onload: cb,
			onerror: cb,
			onreadystatechange: function onreadystatechange() {
				if (/loaded|complete/i.test(this.readyState)) {
					cb();
				}
			}
		});

		// Opera fix error
		// Problem: If an error occurs with script loading Opera fails to trigger the script.onerror handler we specified
		//
		// Fix:
		// By setting the request to synchronous we can trigger the error handler when all else fails.
		// This action will be ignored if we've already called the callback handler "cb" with a successful onload event
		if (window.navigator.userAgent.toLowerCase().indexOf('opera') > -1) {
			operaFix = _this.append('script', {
				text: 'document.getElementById(\'' + callbackID + '\').onerror();'
			});
			script.async = false;
		}

		// Add timeout
		if (timeout) {
			window.setTimeout(function () {
				result = error('timeout', 'timeout');
				cb();
			}, timeout);
		}

		// TODO: add fix for IE,
		// However: unable recreate the bug of firing off the onreadystatechange before the script content has been executed and the value of "result" has been defined.
		// Inject script tag into the head element
		head.appendChild(script);

		// Append Opera Fix to run after our script
		if (operaFix) {
			head.appendChild(operaFix);
		}
	},

	// Post
	// Send information to a remote location using the post mechanism
	// @param string uri path
	// @param object data, key value data to send
	// @param function callback, function to execute in response
	post: function post(url, data, options, callback, callbackID, timeout) {

		var _this = this;
		var error = _this.error;
		var doc = document;

		// This hack needs a form
		var form = null;
		var reenableAfterSubmit = [];
		var newform;
		var i = 0;
		var x = null;
		var bool = 0;
		var cb = function cb(r) {
			if (! bool++) {
				callback(r);
			}
		};

		// What is the name of the callback to contain
		// We'll also use this to name the iframe
		_this.globalEvent(cb, callbackID);

		// Build the iframe window
		var win;
		try {
			// IE7 hack, only lets us define the name here, not later.
			win = doc.createElement('<iframe name="' + callbackID + '">');
		} catch (e) {
			win = doc.createElement('iframe');
		}

		win.name = callbackID;
		win.id = callbackID;
		win.style.display = 'none';

		// Override callback mechanism. Triggger a response onload/onerror
		if (options && options.callbackonload) {
			// Onload is being fired twice
			win.onload = function () {
				cb({
					response: 'posted',
					message: 'Content was posted'
				});
			};
		}

		if (timeout) {
			setTimeout(function () {
				cb(error('timeout', 'The post operation timed out'));
			}, timeout);
		}

		doc.body.appendChild(win);

		// If we are just posting a single item
		if (_this.domInstance('form', data)) {
			// Get the parent form
			form = data.form;

			// Loop through and disable all of its siblings
			for (i = 0; i < form.elements.length; i++) {
				if (form.elements[i] !== data) {
					form.elements[i].setAttribute('disabled', true);
				}
			}

			// Move the focus to the form
			data = form;
		}

		// Posting a form
		if (_this.domInstance('form', data)) {
			// This is a form element
			form = data;

			// Does this form need to be a multipart form?
			for (i = 0; i < form.elements.length; i++) {
				if (!form.elements[i].disabled && form.elements[i].type === 'file') {
					form.encoding = form.enctype = 'multipart/form-data';
					form.elements[i].setAttribute('name', 'file');
				}
			}
		} else {
			// Its not a form element,
			// Therefore it must be a JSON object of Key=>Value or Key=>Element
			// If anyone of those values are a input type=file we shall shall insert its siblings into the form for which it belongs.
			for (x in data) if (data.hasOwnProperty(x)) {
				// Is this an input Element?
				if (_this.domInstance('input', data[x]) && data[x].type === 'file') {
					form = data[x].form;
					form.encoding = form.enctype = 'multipart/form-data';
				}
			}

			// Do If there is no defined form element, lets create one.
			if (!form) {
				// Build form
				form = doc.createElement('form');
				doc.body.appendChild(form);
				newform = form;
			}

			var input;

			// Add elements to the form if they dont exist
			for (x in data) if (data.hasOwnProperty(x)) {

				// Is this an element?
				var el = _this.domInstance('input', data[x]) || _this.domInstance('textArea', data[x]) || _this.domInstance('select', data[x]);

				// Is this not an input element, or one that exists outside the form.
				if (!el || data[x].form !== form) {

					// Does an element have the same name?
					var inputs = form.elements[x];
					if (input) {
						// Remove it.
						if (!(inputs instanceof NodeList)) {
							inputs = [inputs];
						}

						for (i = 0; i < inputs.length; i++) {
							inputs[i].parentNode.removeChild(inputs[i]);
						}
					}

					// Create an input element
					input = doc.createElement('input');
					input.setAttribute('type', 'hidden');
					input.setAttribute('name', x);

					// Does it have a value attribute?
					if (el) {
						input.value = data[x].value;
					} else if (_this.domInstance(null, data[x])) {
						input.value = data[x].innerHTML || data[x].innerText;
					} else {
						input.value = data[x];
					}

					form.appendChild(input);
				}

				// It is an element, which exists within the form, but the name is wrong
				else if (el && data[x].name !== x) {
						data[x].setAttribute('name', x);
						data[x].name = x;
					}
			}

			// Disable elements from within the form if they weren't specified
			for (i = 0; i < form.elements.length; i++) {

				input = form.elements[i];

				// Does the same name and value exist in the parent
				if (!(input.name in data) && input.getAttribute('disabled') !== true) {
					// Disable
					input.setAttribute('disabled', true);

					// Add re-enable to callback
					reenableAfterSubmit.push(input);
				}
			}
		}

		// Set the target of the form
		form.setAttribute('method', 'POST');
		form.setAttribute('target', callbackID);
		form.target = callbackID;

		// Update the form URL
		form.setAttribute('action', url);

		// Submit the form
		// Some reason this needs to be offset from the current window execution
		setTimeout(function () {
			form.submit();

			setTimeout(function () {
				try {
					// Remove the iframe from the page.
					//win.parentNode.removeChild(win);
					// Remove the form
					if (newform) {
						newform.parentNode.removeChild(newform);
					}
				} catch (e) {
					try {
						console.error('HelloJS: could not remove iframe');
					} catch (ee) {}
				}

				// Reenable the disabled form
				for (var i = 0; i < reenableAfterSubmit.length; i++) {
					if (reenableAfterSubmit[i]) {
						reenableAfterSubmit[i].setAttribute('disabled', false);
						reenableAfterSubmit[i].disabled = false;
					}
				}
			}, 0);
		}, 100);
	},

	// Some of the providers require that only multipart is used with non-binary forms.
	// This function checks whether the form contains binary data
	hasBinary: function hasBinary(data) {
		for (var x in data) if (data.hasOwnProperty(x)) {
			if (this.isBinary(data[x])) {
				return true;
			}
		}

		return false;
	},

	// Determines if a variable Either Is or like a FormInput has the value of a Blob

	isBinary: function isBinary(data) {

		return data instanceof Object && (this.domInstance('input', data) && data.type === 'file' || 'FileList' in window && data instanceof window.FileList || 'File' in window && data instanceof window.File || 'Blob' in window && data instanceof window.Blob);
	},

	// Convert Data-URI to Blob string
	toBlob: function toBlob(dataURI) {
		var reg = /^data\:([^;,]+(\;charset=[^;,]+)?)(\;base64)?,/i;
		var m = dataURI.match(reg);
		if (!m) {
			return dataURI;
		}

		var binary = atob(dataURI.replace(reg, ''));
		var array = [];
		for (var i = 0; i < binary.length; i++) {
			array.push(binary.charCodeAt(i));
		}

		return new Blob([new Uint8Array(array)], { type: m[1] });
	}

});

// EXTRA: Convert FormElement to JSON for POSTing
// Wrappers to add additional functionality to existing functions
(function (hello) {

	// Copy original function
	var api = hello.api;
	var utils = hello.utils;

	extend(utils, {

		// DataToJSON
		// This takes a FormElement|NodeList|InputElement|MixedObjects and convers the data object to JSON.
		dataToJSON: function dataToJSON(p) {

			var _this = this;
			var w = window;
			var data = p.data;

			// Is data a form object
			if (_this.domInstance('form', data)) {
				data = _this.nodeListToJSON(data.elements);
			} else if ('NodeList' in w && data instanceof NodeList) {
				data = _this.nodeListToJSON(data);
			} else if (_this.domInstance('input', data)) {
				data = _this.nodeListToJSON([data]);
			}

			// Is data a blob, File, FileList?
			if ('File' in w && data instanceof w.File || 'Blob' in w && data instanceof w.Blob || 'FileList' in w && data instanceof w.FileList) {
				data = { file: data };
			}

			// Loop through data if it's not form data it must now be a JSON object
			if (!('FormData' in w && data instanceof w.FormData)) {

				for (var x in data) if (data.hasOwnProperty(x)) {

					if ('FileList' in w && data[x] instanceof w.FileList) {
						if (data[x].length === 1) {
							data[x] = data[x][0];
						}
					} else if (_this.domInstance('input', data[x]) && data[x].type === 'file') {
						continue;
					} else if (_this.domInstance('input', data[x]) || _this.domInstance('select', data[x]) || _this.domInstance('textArea', data[x])) {
						data[x] = data[x].value;
					} else if (_this.domInstance(null, data[x])) {
						data[x] = data[x].innerHTML || data[x].innerText;
					}
				}
			}

			p.data = data;
			return data;
		},

		// NodeListToJSON
		// Given a list of elements extrapolate their values and return as a json object
		nodeListToJSON: function nodeListToJSON(nodelist) {

			var json = {};

			// Create a data string
			for (var i = 0; i < nodelist.length; i++) {

				var input = nodelist[i];

				// If the name of the input is empty or diabled, dont add it.
				if (input.disabled || !input.name) {
					continue;
				}

				// Is this a file, does the browser not support 'files' and 'FormData'?
				if (input.type === 'file') {
					json[input.name] = input;
				} else {
					json[input.name] = input.value || input.innerHTML;
				}
			}

			return json;
		}
	});

	// Replace it
	hello.api = function () {

		// Get arguments
		var p = utils.args({ path: 's!', method: 's', data: 'o', timeout: 'i', callback: 'f' }, arguments);

		// Change for into a data object
		if (p.data) {
			utils.dataToJSON(p);
		}

		return api.call(this, p);
	};
})(hello);

/////////////////////////////////////
//
// Save any access token that is in the current page URL
// Handle any response solicited through iframe hash tag following an API request
//
/////////////////////////////////////

hello.utils.responseHandler(window, window.opener || window.parent);
/*  [Promises/A+ 2.3.3.3.1]  */
/*  [Promises/A+ 2.3.3.3.2]  */

}).call(this,require('_process'))

},{"_process":1,"tricks/helper/store":23,"tricks/object/extend":24}],3:[function(require,module,exports){
'use strict';

define(function () {

	return function (eventCode, done) {
		return function (data, type) {

			expect(data).to.be.a('object');
			expect(data).to.have.property('error');
			expect(data.error).to.have.property('code');
			expect(data.error).to.have.property('message');
			expect(data.error.code).to.not.be.an('object');
			expect(data.error.message).to.not.be.an('object');

			if (eventCode) expect(data.error.code).to.be(eventCode);

			done();
		};
	};
});

},{}],4:[function(require,module,exports){
'use strict';

define(['../libs/errorResponse', '../../../src/modules/box', '../../../src/modules/facebook', '../../../src/modules/flickr', '../../../src/modules/google', '../../../src/modules/windows', '../../../src/modules/dropbox', '../../../src/modules/twitter', '../../../src/modules/yahoo', '../../../src/modules/instagram', '../../../src/modules/joinme', '../../../src/modules/linkedin', '../../../src/modules/foursquare', '../../../src/modules/github', '../../../src/modules/bikeindex', '../../../src/modules/soundcloud', '../../../src/modules/vk'], function (errorResponse) {

	describe('E2E modules', function () {

		// Loop through all services
		for (var name in hello.services) {
			setupModuleTests(hello.services[name], name);
		}

		function setupModuleTests(module, name) {

			describe(name, function () {

				var MATCH_URL = /^https?\:\/\//;

				it('should contain oauth.auth path', function () {
					var path = module.oauth.auth;
					expect(path).to.match(/^https?\:\/\//);
				});

				it('should specify a base url', function () {
					// Loop through all services
					expect(module.base).to.match(/^https?\:\/\//);
				});

				it('should be using OAuth1 contain, auth, request, token properties', function () {

					// Loop through all services
					var oauth = module.oauth;
					if (oauth && parseInt(oauth.version, 10) === 1) {
						expect(oauth.auth).to.match(MATCH_URL);
						expect(oauth.token).to.match(MATCH_URL);
						expect(oauth.request).to.match(MATCH_URL);
					}
				});

				xit('should return error object when an api request is made with an unverified user', function (done) {

					var i = 0;

					this.timeout(60000);

					var cb = errorResponse(null, function () {
						if (++i === 2) done();
					});

					// Ensure user is signed out
					hello.logout(name);

					// Make a request that returns an error object
					hello(name).api('me', cb).then(null, cb);
				});
			});
		}
	});
});

},{}],5:[function(require,module,exports){
'use strict';

require('./e2e/modules.js');
require('./index.js');
require('./unit/core/hello.api.js');
require('./unit/core/hello.events.js');
require('./unit/core/hello.getAuthResponse.js');
require('./unit/core/hello.init.js');
require('./unit/core/hello.login.js');
require('./unit/core/hello.logout.js');
require('./unit/core/hello.use.js');
require('./unit/core/session.monitor.js');
require('./unit/ext/chromeapp/popup.js');
require('./unit/modules/api.js');
require('./unit/modules/apiMe.js');
require('./unit/modules/apiMeAlbum.js');
require('./unit/modules/apiMeAlbums.js');
require('./unit/modules/apiMeFriends.js');
require('./unit/modules/apiMePhotos.js');
require('./unit/modules/helper.js');
require('./unit/modules/index.js');

},{"./e2e/modules.js":4,"./index.js":5,"./unit/core/hello.api.js":6,"./unit/core/hello.events.js":7,"./unit/core/hello.getAuthResponse.js":8,"./unit/core/hello.init.js":9,"./unit/core/hello.login.js":10,"./unit/core/hello.logout.js":11,"./unit/core/hello.use.js":12,"./unit/core/session.monitor.js":13,"./unit/ext/chromeapp/popup.js":14,"./unit/modules/api.js":15,"./unit/modules/apiMe.js":16,"./unit/modules/apiMeAlbum.js":17,"./unit/modules/apiMeAlbums.js":18,"./unit/modules/apiMeFriends.js":19,"./unit/modules/apiMePhotos.js":20,"./unit/modules/helper.js":21,"./unit/modules/index.js":22}],6:[function(require,module,exports){
'use strict';

var hello = require('../../../../src/hello.js');
var errorResponse = require('../../../lib/errorResponse.js');

describe('hello.api', function () {

	var _request = hello.utils.request;
	var _store = hello.utils.store;
	var _session = {
		access_token: 'token'
	};
	var testable = {};

	before(function () {

		// Unset
		_request = hello.utils.request;
		_store = hello.utils.store;

		// Mock request
		hello.utils.request = function (req, callback) {
			setTimeout(function () {
				callback(req);
			});
		};

		hello.utils.store = function (label, body) {
			return _session;
		};

		// Define default network
		hello.init({
			testable: {
				oauth: {
					auth: 'https://testdemo/access',
					version: 2
				},

				scope: {
					basic: 'basic_scope'
				},

				base: 'https://testable/'
			}
		});

		testable = hello.services.testable;
	});

	after(function () {

		// Renew
		hello.utils.request = _request;
	});

	it('should assign a complete event', function (done) {
		hello('test').api('/', function () {
			done();
		});
	});

	it('should throw a completed event if network name is undefined', function (done) {
		hello('test').api('/', errorResponse('invalid_network', done));
	});

	it('should throw a error event if network name is undefined', function (done) {
		hello('test').api('/').then(null, errorResponse('invalid_network', done));
	});

	it('should throw a error event if path name is undefined', function (done) {
		hello('test').api().then(null, errorResponse('invalid_path', done));
	});

	it('should construct the url using the base and the pathname', function (done) {

		hello('testable').api('/endpoint', function (res) {
			expect(res.url).to.eql('https://testable/endpoint');
			done();
		});
	});

	it('should extract the parameters from the URL', function (done) {

		var session = _session;
		_session = null;

		hello('testable').api('/endpoint?a=a&b=b', function (res) {
			_session = session;
			expect(res.url).to.eql('https://testable/endpoint');
			expect(res.query).to.eql({
				a: 'a',
				b: 'b'
			});
			done();
		});
	});

	it('should attach query object to the req.query', function (done) {

		hello('testable').api('/endpoint', { a: 'a' }, function (res) {

			expect(res.query).to.have.property('a', 'a');

			done();
		});
	});

	it('should attach authResponse object to the req.authResponse', function (done) {

		hello('testable').api('/endpoint', function (res) {

			expect(res.authResponse).to.eql(_session);

			done();
		});
	});

	it('should attach data object to the req.query when `req.method = get`', function (done) {

		hello('testable').api('/endpoint', 'get', { a: 'a' }, function (res) {

			expect(res.query).to.have.property('a', 'a');
			expect(res.data).to.be.empty();

			done();
		});
	});

	it('should attach post data object to the req.data', function (done) {

		hello('testable').api('/endpoint', 'post', { a: 'a' }, function (res) {

			expect(res.method).to.eql('post');
			expect(res.query).to.not.have.property('a');
			expect(res.data).to.have.property('a', 'a');

			done();
		});
	});

	describe('POST', function () {

		// Not supported in IE9
		var hasFormdata = typeof FormData === 'function';

		if (hasFormdata) {
			it('should accept FormData as the data object', function (done) {

				var formData = new FormData();
				formData.append('user', 'name');

				hello('testable').api('/endpoint', 'POST', formData).then(function (res) {
					// The formData should not be mutated, but left as is.
					expect(res.data).to.equal(formData);
					done();
				});
			});
		}
	});

	describe('signing', function () {

		it('should add the access_token to the req.query', function (done) {

			hello('testable').api('/endpoint', function (res) {
				expect(res.url).to.eql('https://testable/endpoint');
				expect(res.query).to.eql(_session);
				done();
			});
		});

		it('should mark OAuth1 endpoints with req.proxy', function (done) {

			// Override
			testable.oauth.version = 1;

			hello('testable').api('/endpoint', function (res) {

				// Renew
				testable.oauth.version = 2;

				// Test
				expect(res.proxy).to.be.ok();
				expect(res.oauth_proxy).to.eql(hello.settings.oauth_proxy);

				done();
			});
		});
	});

	describe('map', function () {

		it('should process req object through the modules.get[req.path] function', function (done) {

			testable.get = testable.get || {};
			testable.get.handled = function (p) {
				expect(p).to.have.property('path', 'handled');
				done();
			};

			hello('testable').api('/handled', { a: 'a' });
		});

		it('should process req object through the modules.get.default function if req.path not in module.get', function (done) {

			testable.get = testable.get || {};
			testable.get['default'] = function (p) {
				expect(p).to.have.property('path', 'unhandled');
				delete testable.get['default'];
				done();
			};

			hello('testable').api('/unhandled', { a: 'a' });
		});

		it('should trigger an error if the mapped value is false', function (done) {

			testable.get = testable.get || {};
			testable.get.handled = false;

			hello('testable').api('/handled').then(null, function (res) {

				// Should place the value of a in the parameter list
				expect(res.error).to.have.property('code', 'invalid_path');

				delete testable.get.handled;

				done();
			});
		});

		describe('Replace @{} in path with request parameters', function () {

			it('should define the path using the query parameters and remove them from the query', function (done) {

				testable.get = testable.get || {};
				testable.get.handled = 'endpoint?b=@{a}';

				hello('testable').api('/handled', { a: 'a' }).then(function (res) {

					// Should place the value of a in the parameter list
					expect(res.url).to.contain('endpoint?b=a');

					// Should place the value of a in the parameter list
					expect(res.path).to.eql('handled');

					// Should remove the property from the req.query
					expect(res.query).to.not.have.property('a');

					delete testable.get.handled;

					done();
				}, done);
			});

			it('should define the path using the query parameters and remove them from the post data', function (done) {

				testable.post = testable.post || {};
				testable.post.handled = 'endpoint?b=@{a}';

				hello('testable').api('/handled', 'post', { a: 'a' }).then(function (res) {

					// Should place the value of a in the parameter list
					expect(res.url).to.contain('endpoint?b=a');

					// Should place the value of a in the parameter list
					expect(res.path).to.eql('handled');

					// Should remove the property from the req.query
					expect(res.data).to.not.have.property('a');

					delete testable.get.handled;

					done();
				}, done);
			});

			it('should trigger an error if there was no query parameter arg, i.e. @{arg}', function (done) {

				testable.get = testable.get || {};
				testable.get.handled = 'endpoint?b=@{a}';

				hello('testable').api('/handled').then(null, function (res) {

					// Should place the value of a in the parameter list
					expect(res.error).to.have.property('code', 'missing_attribute');

					delete testable.get.handled;

					done();
				});
			});

			it('should use the default value if one is defined i.e. @{arg|default}', function (done) {

				testable.get = testable.get || {};
				testable.get.handled = 'endpoint?empty=@{a|}&arg=@{b|default}';

				hello('testable').api('/handled', function (res) {

					// Should place the value of a in the parameter list
					expect(res.url).to.contain('endpoint?empty=&arg=default');

					// Should place the value of a in the parameter list
					expect(res.path).to.eql('handled');

					delete testable.get.handled;

					done();
				});
			});
		});
	});

	describe('wrap', function () {

		it('should trigger the wrap function', function (done) {

			testable.wrap = testable.wrap || {};
			testable.wrap.handled = function (req) {
				delete testable.wrap.handled;
				done();
			};

			hello('testable').api('/handled');
		});

		it('should trigger the wrap.default function if none exists', function (done) {

			testable.wrap = testable.wrap || {};
			testable.wrap['default'] = function (req) {
				delete testable.wrap['default'];
				done();
			};

			hello('testable').api('/unhandled');
		});

		it('should not trigger the wrap function if formatResponse = false', function (done) {

			testable.wrap = testable.wrap || {};
			testable.wrap.handled = function (req) {
				done(new Error('Wrap handler erroneously called'));
			};

			hello('testable').api({
				path: '/handled',
				formatResponse: false
			}).then(function () {
				// If the response handler was not called then we're good
				done();
			});
		});
	});

	describe('paging', function () {

		it('should override the path parameter with the hash fragment', function (done) {

			hello('testable').api('/endpoint#formatting', function (res) {
				expect(res.url).to.eql('https://testable/endpoint');
				expect(res.path).to.eql('formatting');
				done();
			});
		});

		it('should append the req.path to the hash of the response.paging.next', function (done) {

			testable.wrap = testable.wrap || {};
			testable.wrap['default'] = function (req) {
				req.paging = { next: 'next?page=2' };
				delete testable.wrap['default'];
			};

			hello('testable').api('/unhandled', function (res) {

				// Should place the value of a in the parameter list
				expect(res.paging.next).to.contain('#unhandled');

				done();
			});
		});
	});
});

},{"../../../../src/hello.js":2,"../../../lib/errorResponse.js":3}],7:[function(require,module,exports){
'use strict';

var hello = require('../../../../src/hello.js');
describe('hello events', function () {

	it('should bind handler using hello.on(eventName, handler) and trigger hello.emit', function (done) {
		function handler() {
			done();
		}

		hello.on('auth.login', handler);
		hello.emit('auth.login');
		hello.off('auth.login', handler);
	});
});

},{"../../../../src/hello.js":2}],8:[function(require,module,exports){
'use strict';

describe('hello.getAuthResponse', function () {

	it('should return null when accessing an invalid network implicitly', function () {
		// Make request
		var r = hello('Facelessbook').getAuthResponse();
		expect(r).to.be(null);
	});

	it('should return null when accessing an invalid network explicitly', function () {
		// Make request
		var r = hello.getAuthResponse('Facelessbook');
		expect(r).to.be(null);
	});
});

},{}],9:[function(require,module,exports){
'use strict';

var hello = require('../../../../src/hello.js');

describe('hello.init', function () {

	it('should set app credentials and options', function () {

		var credentials = {
			service: 'id'
		};
		var options = {
			redirect_uri: './relative'
		};

		hello.init(credentials, options);
		expect(hello.settings.redirect_uri).to.match(/\/relative/);
	});
});

},{"../../../../src/hello.js":2}],10:[function(require,module,exports){
'use strict';

define(['../../libs/errorResponse'], function (errorResponse) {

	describe('hello.login', function () {

		var testable;
		var second;

		// Create a dummy network
		beforeEach(function () {
			// Create networks
			testable = {
				oauth: {
					auth: 'https://testdemo/access',
					grant: 'https://testdemo/grant',
					version: 2
				},
				scope: {
					basic: 'basic_scope'
				}
			};

			second = {
				oauth: {
					auth: 'https://testdemo/access',
					version: 2
				},
				scope: {
					another_scope: 'another_scope'
				}
			};

			// Add a network
			hello.init({
				testable: testable,
				second: second
			});
		});

		// Destroy it
		afterEach(function () {
			delete hello.services.testable;
		});

		var utils = hello.utils;
		var _open = utils.popup;

		after(function () {
			hello.utils.popup = _open;
		});

		it('should assign a complete event', function (done) {

			var spy = sinon.spy(function () {
				done();
			});

			var popup = {
				closed: false
			};

			window.open = function () {
				return popup;
			};

			hello.login('testable', spy);

			popup.closed = true;
		});

		it('should throw a completed and error event if network name is wrong', function (done) {
			hello.login('invalidname', errorResponse('invalid_network', done));
		});

		it('should throw a error event if network name is wrong', function (done) {
			hello.login('invalidname').then(null, errorResponse('invalid_network', done));
		});

		it('should by default, trigger window.open request', function (done) {

			var spy = sinon.spy(function () {
				done();
			});

			utils.popup = spy;

			hello.login('testable');
		});

		it('should include the basic scope defined by the module, by default', function (done) {

			var spy = sinon.spy(function (url, name, optins) {

				expect(url).to.contain('scope=' + hello.services.testable.scope.basic);

				done();
			});

			utils.popup = spy;

			hello.login('testable');
		});

		it('should not use "basic" as the default scope, if there is no mapping', function (done) {

			// Remove the basic scope
			delete hello.services.testable.scope.basic;

			// Now the response should not include the scope...
			var spy = sinon.spy(function (url) {
				expect(url).to.not.contain('scope=basic');
				done();
			});

			utils.popup = spy;

			hello('testable').login();
		});

		describe('options', function () {

			it('should apply `options.redirect_uri`', function (done) {

				var REDIRECT_URI = 'http://dummydomain.com/';

				var spy = sinon.spy(function (url, name, options) {

					var params = hello.utils.param(url.split('?')[1]);

					expect(params.redirect_uri).to.equal(REDIRECT_URI);

					done();
				});

				utils.popup = spy;

				hello.login('testable', { redirect_uri: REDIRECT_URI });
			});

			it('should URIencode `options.redirect_uri`', function (done) {

				var REDIRECT_URI = 'http://dummydomain.com/?breakdown';

				var spy = sinon.spy(function (url, name, optins) {

					expect(url).to.not.contain(REDIRECT_URI);
					expect(url).to.contain(encodeURIComponent(REDIRECT_URI));

					done();
				});

				utils.popup = spy;

				hello.login('testable', { redirect_uri: REDIRECT_URI });
			});

			it('should pass through unknown scopes defined in `options.scope`', function (done) {

				var spy = sinon.spy(function (url, name, optins) {

					var params = hello.utils.param(url.split('?')[1]);

					expect(params.scope).to.contain('email');

					done();
				});

				utils.popup = spy;

				hello.login('testable', { scope: 'email' });
			});

			it('should include the basic scope defined in the settings `hello.settings.scope`', function (done) {

				hello.settings.scope = ['basic'];
				testable.scope.basic = 'basic';

				var spy = sinon.spy(function (url, name, optins) {
					var params = hello.utils.param(url.split('?')[1]);
					expect(params.scope).to.contain('basic');
					done();
				});

				utils.popup = spy;

				hello.login('testable', { scope: ['email'] });
			});

			it('should discard common scope, aka scopes undefined by this module but defined as a global standard in the libary (i.e. basic)', function (done) {

				var commonScope = 'common_scope';

				// Set this as a common scope (always set to '')
				hello.settings.scope_map[commonScope] = '';

				var spy = sinon.spy(function (url, name, optins) {

					// Parse parameters
					var params = hello.utils.param(url.split('?')[1]);

					expect(params.scope).to.not.contain(commonScope);
					done();
				});

				utils.popup = spy;

				hello.login('testable', { scope: commonScope });
			});

			it('should not included empty scopes', function (done) {

				var scope = 'scope';
				var paddedScope = ',' + scope + ',';
				delete testable.scope.basic;

				var spy = sinon.spy(function (url, name, optins) {

					// Parse parameters
					var params = hello.utils.param(url.split('?')[1]);

					expect(params.scope).to.eql(scope);
					done();
				});

				utils.popup = spy;

				hello.login('testable', { scope: paddedScope });
			});

			it('should use the correct and unencoded delimiter to separate scope', function (done) {

				var basicScope = 'read_user,read_bikes';
				var scopeDelim = '+';

				hello.init({
					test_delimit_scope: {
						oauth: {
							auth: 'https://testdemo/access',
							version: 2
						},
						scope_delim: scopeDelim,
						scope: {
							basic: basicScope
						}
					}
				});

				var spy = sinon.spy(function (url, name, optins) {

					expect(url).to.contain(basicScope.replace(/[\+\,\s]/, scopeDelim));
					done();
				});

				utils.popup = spy;

				hello.login('test_delimit_scope');
			});

			it('should space encode the delimiter of multiple response_type\'s', function (done) {

				var opts = {
					response_type: 'code grant_scopes'
				};

				var spy = sinon.spy(function (url, name) {

					expect(url).to.contain('code%20grant_scopes');
					done();
				});

				utils.popup = spy;

				hello.login('testable', opts);
			});

			it('should substitute "token" for "code" when there is no Grant URL defined', function (done) {

				var opts = {
					response_type: 'code grant_scopes'
				};

				hello.services.testable.oauth.grant = null;

				var spy = sinon.spy(function (url, name) {

					expect(url).to.contain('token%20grant_scopes');
					done();
				});

				utils.popup = spy;

				hello.login('testable', opts);
			});
		});

		describe('popup options', function () {

			it('should give the popup the default options', function (done) {

				var spy = sinon.spy(function (url, name, options) {
					expect(options.resizable).to.eql('1');
					expect(options.scrollbars).to.eql('1');
					expect(options.width).to.eql('500');
					expect(options.height).to.eql('550');
					done();
				});

				utils.popup = spy;

				hello.login('testable');
			});

			it('should allow the popup options to be overridden', function (done) {

				var spy = sinon.spy(function (url, name, options) {
					expect(options.location).to.eql('no');
					expect(options.toolbar).to.eql('no');
					expect(options.hidden).to.eql(true);
					done();
				});

				utils.popup = spy;

				hello.login('testable', {
					popup: {
						hidden: true,
						location: 'no',
						toolbar: 'no'
					}
				});
			});
		});

		describe('option.force = false', function () {

			var _store = hello.utils.store;
			var session = null;

			beforeEach(function () {

				session = {
					access_token: 'token',
					expires: new Date().getTime() / 1e3 + 1000,
					scope: 'basic'
				};

				hello.utils.store = function () {
					return session;
				};
			});

			afterEach(function () {

				hello.utils.store = _store;
			});

			it('should not trigger the popup if there is a valid session', function (done) {

				var spy = sinon.spy(done.bind(null, new Error('window.open should not be called')));
				utils.popup = spy;

				hello('testable').login({ force: false }).then(function (r) {
					expect(spy.notCalled).to.be.ok();
					expect(r.authResponse).to.eql(session);
					done();
				});
			});

			it('should trigger the popup if the token has expired', function (done) {

				var spy = sinon.spy(function () {
					done();
				});

				utils.popup = spy;

				session.expires = new Date().getTime() / 1e3 - 1000;

				hello('testable').login({ force: false });
			});

			it('should trigger the popup if the scopes have changed', function (done) {

				var spy = sinon.spy(function () {
					done();
				});

				utils.popup = spy;

				hello('testable').login({ force: false, scope: 'not-basic' });
			});
		});

		describe('custom query string parameters', function () {

			it('should attach custom parameters to the querystring', function (done) {

				var options = {
					custom: 'custom'
				};

				var spy = sinon.spy(function (url, name, options) {

					var params = hello.utils.param(url.split('?')[1]);

					expect(params).to.have.property('custom', options.custom);

					done();
				});

				utils.popup = spy;

				hello.login('testable', options);
			});
		});

		describe('global events', function () {

			it('should trigger an auth.init event before requesting the auth flow', function (done) {

				// Listen out for the auth-flow
				hello.on('auth.init', function (e) {
					expect(e).to.have.property('network', 'testable');
					expect(spy.notCalled).to.be.ok();
					done();
				});

				// Go no further
				var spy = sinon.spy();
				utils.popup = spy;

				// Login
				hello('testable').login({ force: true });
			});
		});
	});
});

},{}],11:[function(require,module,exports){
'use strict';

define(['../../libs/errorResponse'], function (errorResponse) {

	describe('hello.logout', function () {

		before(function () {
			hello.init({
				test: {
					name: 'test',
					id: 'id'
				}
			});
		});

		after(function () {
			delete hello.services.test;
		});

		it('should trigger an error when network is unknown', function (done) {
			// Make request
			hello('unknown').logout().then(null, errorResponse('invalid_network', done));
		});

		it('should assign a complete event', function (done) {
			hello('unknown').logout(function () {
				done();
			});
		});

		it('should throw an error events in the eventCompleted handler', function (done) {
			hello('unknown').logout(function (e) {
				expect(e).to.have.property('error');
				done();
			});
		});

		describe('remove session from store', function () {

			var store = hello.utils.store;

			beforeEach(function () {
				hello.utils.store = store;
			});

			afterEach(function () {
				hello.utils.store = store;
			});

			it('should remove the session from the localStorage', function () {

				var spy = sinon.spy(function () {
					return {};
				});

				hello.utils.store = spy;

				hello('test').logout();

				expect(spy.calledWith('test', null)).to.be.ok();
			});
		});

		describe('force=true', function () {

			describe('module.logout handler', function () {

				var module = {
					logout: function logout() {}
				};

				var store = hello.utils.store;
				var session = {};

				beforeEach(function () {

					// Clear all services
					delete hello.services.testable;

					hello.init({
						testable: module
					});

					hello.utils.store = function () {
						return session;
					};
				});

				afterEach(function () {
					// Restore... bah dum!
					hello.utils.store = store;
				});

				it('should call module.logout', function (done) {

					module.logout = function () {
						done();
					};

					hello('testable').logout({ force: true });
				});

				it('should attach authResponse object to the options.authResponse', function (done) {

					module.logout = function (callback, options) {
						expect(options).to.have.property('authResponse', session);
						done();
					};

					hello('testable').logout({ force: true });
				});
			});
		});
	});
});

},{}],12:[function(require,module,exports){
'use strict';

define([], function () {

	describe('hello.use', function () {

		it('should set the service on the current instance only', function () {
			var root = hello;
			var rootService = hello.settings.default_service;
			var instance = hello('instance');
			var descendent = instance.use('descendent');
			expect(hello.settings.default_service).to.be(rootService);
			expect(instance.settings.default_service).to.be('instance');
			expect(descendent.settings.default_service).to.be('descendent');
		});

		it('should return a new instance', function () {

			var instance = hello('instance');
			expect(instance).to.not.be(hello);
		});
	});
});

},{}],13:[function(require,module,exports){
// Session monitor
'use strict';

define([], function () {

	describe('Session monitor', function () {

		beforeEach(function () {
			// Define the service
			hello.services.test = {
				id: 'id'
			};
		});

		afterEach(function () {
			// Define the service
			delete hello.services.test;
		});

		it('should listen to changes within shared storage and trigger global callbacks where they have otherwise not been triggered', function (done) {

			// Create a callback
			var callbackName = hello.utils.globalEvent(function (obj) {
				expect(obj).to.have.property('access_token', 'token');
				expect(obj).to.have.property('expires_in', 3600);

				// Should remove the callback from the session
				expect(obj).to.not.have.property('callback');
				done();
			});

			// Construct an AuthResponse
			var obj = {
				callback: callbackName,
				access_token: 'token',
				expires_in: 3600
			};

			// Store the new auth response and the global callback will be triggered
			hello.utils.store('test', obj);
		});

		it('should ignore services which do not have an id defined', function (done) {
			// Create a spy
			var spy = sinon.spy(done);

			// Remove the id from the test service
			delete hello.services.test.id;

			// Create a callback
			var callbackName = hello.utils.globalEvent(spy);

			// Construct an AuthResponse
			var obj = {
				callback: callbackName,
				access_token: 'token',
				expires_in: 3600
			};

			// Store the new auth response and the global callback will be triggered
			hello.utils.store('test', obj);

			// Create a timer
			setTimeout(function () {
				expect(spy.called).to.not.be.ok();
				done();
			}, 1500);
		});
	});
});

},{}],14:[function(require,module,exports){
// Chrome Packaged Apps
// The Chrome Extension redefines the "hello.utils.popup"

'use strict';

describe('ChromeApp hello.utils.popup', function () {

	var _launch = chrome.identity.launchWebAuthFlow;

	after(function () {
		chrome.identity.launchWebAuthFlow = _launch;
	});

	it('Should launch chrome.identity.launchWebAuthFlow', function () {

		var spy = sinon.spy();

		chrome.identity.launchWebAuthFlow = spy;

		hello.utils.popup('https://doma.in/oauth/auth', 'https://redirect.uri/path', {});

		expect(spy.calledOnce).to.be.ok();
	});
});

},{}],15:[function(require,module,exports){
// API, A quick run through of the endpoints and their responses
'use strict';

define(['./helper', '../../stubs/endpoints'], function (helper, endpoints) {

	// Endpoints is an generated array of files in the stubs directory.
	// Here we are using it to simulate a range of API requests and responses to see how Hello.API handles them.

	describe('API endpoints', function () {

		helper.sharedSetup();

		helper.forEach(endpoints, function (fileName) {

			// Extract from the file name the endpoint request
			var m = fileName.match(/([a-z]+)\/(get|post|del|put)\/(.*?)(;[^.]+)?(\-([a-z]+))?\.json/);
			var network = m[1];
			var method = m[2];
			var path = m[3];
			var query = m[4];
			var errors = m[5];

			// Format query
			if (query) {
				query = splitter(query, ';', '-');
			}

			it('should handle ' + m.slice(1, 5).join(' '), function (done) {

				var req = {
					path: path,
					method: method,
					query: query,
					stub: m[0]
				};

				var promise = hello(network).api(req);

				if (!errors) {
					promise.then(function () {
						done();
					}, done);
				} else {
					promise.then(done, function () {
						done();
					});
				}
			});
		});
	});
});

function splitter(str, delim, sep) {
	var q = {};

	str.split(delim).forEach(function (s) {
		if (s === '') {
			return;
		}

		var m = s.split(sep);
		q[m[0]] = m[1];
	});

	return q;
}

},{}],16:[function(require,module,exports){
'use strict';

define(['./helper'], function (helper) {

	describe('hello.api(\'/me\')', function () {

		helper.sharedSetup();

		var tests = [{
			network: 'bikeindex',
			expect: {
				id: '13674',
				thumbnail: undefined
			},
			errorExpect: {
				code: 'access_denied',
				message: 'OAuth error: unauthorized'
			}
		}, {
			network: 'box',
			expect: {
				id: '197571718',
				name: 'Jane McGee',
				thumbnail: 'https://app.box.com/api/avatar/large/197571718'
			},
			errorExpect: false
		}, {
			network: 'dropbox',
			expect: {
				id: 374434467,
				name: 'Jane McGee',
				thumbnail: undefined
			},
			errorExpect: {
				code: 'server_error',
				message: 'The given OAuth 2 access token doesn\'t exist or has expired.'
			}
		}, {
			network: 'facebook',
			expect: {
				id: '100008806508341',
				name: 'Jane McGee',
				thumbnail: 'https://graph.facebook.com/100008806508341/picture'
			},
			errorExpect: {
				code: 190,
				message: 'Invalid OAuth access token.'
			}
		}, {
			network: 'flickr',
			expect: {
				id: '34790912@N05',
				name: 'Jane McGee',
				thumbnail: 'https://farm4.staticflickr.com/3729/buddyicons/34790912@N05_l.jpg'
			},
			errorExpect: {
				code: 'invalid_request',
				message: 'User not found'
			}
		}, {
			network: 'foursquare',
			expect: {
				id: '110649444',
				name: 'Jane McGee',
				thumbnail: 'https://irs0.4sqi.net/img/user/100x100/110649444-XTNO1LD24NJOW0TW.jpg'
			},
			errorExpect: {
				code: 'access_denied',
				message: 'OAuth token invalid or revoked.'
			}
		}, {
			network: 'github',
			expect: {
				id: 10398423,
				name: 'janemcgee35',
				thumbnail: 'https://avatars.githubusercontent.com/u/10398423?v=3'
			},
			errorExpect: false
		}, {
			network: 'google',
			expect: {
				id: '115111284799080900590',
				name: 'Jane McGee',
				thumbnail: 'https://lh3.googleusercontent.com/-NWCgcgRDieE/AAAAAAAAAAI/AAAAAAAAABc/DCi-M8IuzMo/photo.jpg?sz=50'
			},
			errorExpect: {
				code: 403,
				message: 'Daily Limit for Unauthenticated Use Exceeded. Continued use requires signup.'
			}
		}, {
			network: 'instagram',
			expect: {
				id: '1636340308',
				name: 'Jane McGee',
				thumbnail: 'https://igcdn-photos-h-a.akamaihd.net/hphotos-ak-xaf1/t51.2885-19/10919499_876030935750711_2062576510_a.jpg'
			},
			errorExpect: {
				code: 'OAuthParameterException',
				message: 'Missing client_id or access_token URL parameter.'
			}
		}, {
			network: 'joinme',
			expect: {
				id: 'janemcgee35@join.me',
				name: 'Jane McGee',
				thumbnail: undefined
			},
			errorExpect: false
		}, {
			network: 'linkedin',
			expect: {
				id: 'sDsPqKdBkl',
				name: 'Jane McGee',
				thumbnail: 'https://media.licdn.com/mpr/mprx/0_oFea4Eo2n6j5ZQS2oLwg4HE7NiWQ4Qp2H_yl4dVyw6gBFGIuQ3ZGnWmtsSdZUTjhIXErcmkkxGoX'
			},
			errorExpect: {
				code: 401,
				message: 'Unknown authentication scheme'
			}
		}, {
			network: 'soundcloud',
			expect: {
				id: 131420710,
				name: 'janemcgee35',
				thumbnail: 'https://i1.sndcdn.com/avatars-000123511300-upb183-large.jpg'
			},
			errorExpect: false
		}, {
			network: 'twitter',
			expect: {
				id: 2961707375,
				name: 'Jane McGee',
				thumbnail: 'https://pbs.twimg.com/profile_images/552017091583152128/a8lyS35y_normal.jpeg'
			},
			errorExpect: {
				code: 'request_failed',
				message: 'Bad Authentication data'
			}
		}, {
			network: 'vk',
			expect: {
				id: 434460,
				name: 'Юрий Опарин',
				thumbnail: 'http://cs304605.vk.me/u434460/d_1acca7c0.jpg'
			},
			errorExpect: {
				code: 10,
				message: 'Internal server error: could not get application'
			}
		}, {
			network: 'windows',
			expect: {
				id: '939f37452466502a',
				name: 'Jane McGee',
				thumbnail: 'https://apis.live.net/v5.0/939f37452466502a/picture?access_token=token'
			},
			errorExpect: {
				code: 'request_token_invalid',
				message: 'The access token isn\'t valid.'
			}
		}, {
			network: 'yahoo',
			expect: {
				id: 'UKGYDRAHEWONVO35KOOBBGQ4UU',
				name: 'Jane McGee',
				thumbnail: 'https://socialprofiles.zenfs.com/images/805efb9485e4878f21be4d9e9e5890ca_192.png'
			},
			errorExpect: false
		}];

		describe('authorised requests', function () {

			helper.forEach(tests, function (test) {

				it('should format ' + test.network + ' correctly', function (done) {

					hello(test.network).api('/me', {
						access_token: 'token'
					}).then(function (me) {
						expect(me.id).to.be(test.expect.id);
						expect(me.name).to.be(test.expect.name);
						expect(me.thumbnail).to.be(test.expect.thumbnail);
						done();
					}).then(null, done);
				});
			});
		});

		describe('unauthorised requests', function () {

			helper.forEach(tests, function (test) {

				if (!test.errorExpect) {
					return;
				}

				it('should trigger the error handler for ' + test.network, function (done) {

					hello(test.network).api('/me', {
						stubType: '-unauth',
						access_token: null
					}).then(done, function (data) {
						expect(data.error).to.not.be(undefined);
						expect(data.error.code).to.be(test.errorExpect.code);
						expect(data.error.message).to.be(test.errorExpect.message);
						done();
					}).then(null, done);
				});
			});
		});
	});
});

},{}],17:[function(require,module,exports){
'use strict';

define(['./helper'], function (helper) {

	describe('hello.api(\'/me/album\')', function () {

		helper.sharedSetup();

		var tests = [{
			network: 'google',
			expect: {
				length: 6,
				first: {
					id: 'https://picasaweb.google.com/data/entry/api/user/115111284799080900590/albumid/6101137643479860177/photoid/6101137651261702722?alt=json',
					name: 'bling-piggy.jpg',
					picture: 'https://lh5.googleusercontent.com/-WYnDVp26U7k/VKuYXl03AkI/AAAAAAAAADU/nOsGBUZecRw/bling-piggy.jpg'
				}
			}
		}, {
			network: 'facebook',
			expect: {
				length: 7,
				first: {
					id: '1380486122254925',
					name: undefined,
					picture: 'https://fbcdn-sphotos-g-a.akamaihd.net/hphotos-ak-xfa1/v/t1.0-9/s130x130/10924813_1380486122254925_8328783981056301338_n.jpg?oh=d703e6d45262e4996a783dcd056dec03&oe=5531C3B7&__gda__=1429692476_20dfea8df43185ea83fd611e043f5213'
				}
			}
		}, {
			network: 'windows',
			expect: {
				length: 7,
				first: {
					id: 'file.939f37452466502a.939F37452466502A!117',
					name: 'funeral-piggy.jpg',
					picture: 'https://public-ch3301.files.1drv.com/y2mVoR3TWKeWdH5vzmYmYyFRaFRlj0FPPy6zAcQWY2hy9tcjqWfKc5Uqg2ctPFwuz-WmPIhp5gZKZz8SU3gFx1vNdVDmLetto8IOMRpD0wAKoQMl1IWJFPCmu-hE8-FVB2Eb4x9885zel5SRdAqfsR3OA/funeral-piggy.jpg?psid=1'
				}
			}
		}];

		helper.forEach(tests, function (test) {

			it('should format ' + test.network + ' correctly', function (done) {

				hello(test.network).api('/me/album', {
					id: 'album-id'
				}).then(function (album) {
					var first = album.data[0];
					expect(album.data.length).to.be(test.expect.length);
					expect(first.id).to.be(test.expect.first.id);
					expect(first.name).to.be(test.expect.first.name);
					expect(first.picture).to.be(test.expect.first.picture);
					done();
				}).then(null, done);
			});
		});
	});
});

},{}],18:[function(require,module,exports){
'use strict';

define(['./helper'], function (helper) {

	describe('hello.api(\'/me/albums\')', function () {

		helper.sharedSetup();

		var tests = [{
			network: 'facebook',
			expect: {
				length: 3,
				first: {
					id: '1380499628920241',
					name: 'Timeline Photos',
					thumbnail: 'https://graph.facebook.com/10152107682897233/picture?access_token=token',
					photos: undefined
				}
			}
		}, {
			network: 'flickr',
			expect: {
				length: 3,
				first: {
					id: '72157627511003764',
					name: 'Wales with mum and Matt - dropped in on Ozzy',
					photos: 'https://api.flickr.com/services/rest?method=flickr.photosets.getPhotos&api_key=undefined&format=json&photoset_id=72157627511003764'
				}
			}
		}, {
			network: 'google',
			expect: {
				length: 2,
				first: {
					id: 'https://picasaweb.google.com/data/entry/api/user/115111284799080900590/albumid/6101137643479860177?alt=json',
					name: '2015-01-06',
					thumbnail: 'https://lh4.googleusercontent.com/-FwGrKcgx4II/VKuYXI1hg9E/AAAAAAAAADQ/_EpYdYBoAng/s160-c/20150106.jpg',
					photos: 'https://picasaweb.google.com/data/feed/api/user/115111284799080900590/albumid/6101137643479860177?alt=json&authkey=Gv1sRgCJW1vqqlkp_74wE'
				}
			}
		}, {
			network: 'windows',
			expect: {
				length: 2,
				first: {
					id: 'folder.939f37452466502a.939F37452466502A!115',
					name: 'More Pictures',
					thumbnail: undefined,
					photos: 'https://apis.live.net/v5.0/folder.939f37452466502a.939F37452466502A!115/photos'
				}
			}
		}];

		helper.forEach(tests, function (test) {

			it('should format ' + test.network + ' correctly', function (done) {
				hello(test.network).api('/me/albums', {
					access_token: 'token'
				}).then(function (albums) {
					var first = albums.data[0];
					expect(albums.data).not.to.be(undefined);
					expect(albums.data.length).to.be(test.expect.length);
					expect(first.id).to.be(test.expect.first.id);
					expect(first.name).to.be(test.expect.first.name);
					expect(first.thumbnail).to.be(test.expect.first.thumbnail);
					expect(first.photos).to.be(test.expect.first.photos);
					done();
				}).then(null, done);
			});
		});
	});
});

},{}],19:[function(require,module,exports){
// Test GET me/friends

'use strict';

define(['./helper'], function (helper) {

	describe('hello.api(\'/me/friends\')', function () {

		helper.sharedSetup();

		var tests = ['flickr', 'foursquare', 'github', 'google', 'linkedin', 'soundcloud', 'twitter', 'windows', 'yahoo'];

		tests.forEach(function (network) {

			it('should format ' + network + ':me/friends correctly', function (done) {

				hello(network).api('/me/friends').then(function (friends) {
					friends.data.forEach(function (friend) {
						expect(friend.id).to.be.ok();
						expect(friend.name).to.be.ok();
						if (friend.thumbnail) {
							expect(friend.thumbnail).to.match(/^https?\:\/\/[a-z0-9\.\-]+\/.*/i);
						}
					});

					expect(friends.data.length).to.be.ok();

					done();
				}).then(null, done);
			});
		});
	});
});

},{}],20:[function(require,module,exports){
'use strict';

define(['./helper'], function (helper) {

	describe('hello.api(\'/me/photos\')', function () {

		helper.sharedSetup();

		var tests = [{
			network: 'instagram',
			expect: {
				length: 5,
				first: {
					id: '891783660020488189_1636340308',
					name: 'Red Carpet Piggy',
					picture: 'http://scontent-a.cdninstagram.com/hphotos-xaf1/t51.2885-15/10903489_924233790922795_96516085_n.jpg',
					pictures: [{
						source: 'http://scontent-a.cdninstagram.com/hphotos-xaf1/t51.2885-15/10903489_924233790922795_96516085_s.jpg',
						width: 150,
						height: 150
					}, {
						source: 'http://scontent-a.cdninstagram.com/hphotos-xaf1/t51.2885-15/10903489_924233790922795_96516085_a.jpg',
						width: 306,
						height: 306
					}, {
						source: 'http://scontent-a.cdninstagram.com/hphotos-xaf1/t51.2885-15/10903489_924233790922795_96516085_n.jpg',
						width: 640,
						height: 640
					}]
				}
			}
		}, {
			network: 'google',
			expect: {
				length: 7,
				first: {
					id: 'https://picasaweb.google.com/data/entry/api/user/115111284799080900590/albumid/6101137643479860177/photoid/6101137679962229346?alt=json',
					name: 'wistful-piggy.jpg',
					picture: 'https://lh3.googleusercontent.com/-A9K1HZCyma8/VKuYZQvmSmI/AAAAAAAAADU/9AvsN7uNS2Y/wistful-piggy.jpg',
					pictures: [{
						source: 'https://lh3.googleusercontent.com/-A9K1HZCyma8/VKuYZQvmSmI/AAAAAAAAADU/9AvsN7uNS2Y/s72/wistful-piggy.jpg',
						width: 48,
						height: 72
					}, {
						source: 'https://lh3.googleusercontent.com/-A9K1HZCyma8/VKuYZQvmSmI/AAAAAAAAADU/9AvsN7uNS2Y/s144/wistful-piggy.jpg',
						width: 96,
						height: 144
					}, {
						source: 'https://lh3.googleusercontent.com/-A9K1HZCyma8/VKuYZQvmSmI/AAAAAAAAADU/9AvsN7uNS2Y/s288/wistful-piggy.jpg',
						width: 192,
						height: 288
					}, {
						source: 'https://lh3.googleusercontent.com/-A9K1HZCyma8/VKuYZQvmSmI/AAAAAAAAADU/9AvsN7uNS2Y/wistful-piggy.jpg',
						width: 300,
						height: 450
					}]
				}
			}
		}, {
			network: 'facebook',
			expect: {
				length: 5,
				first: {
					id: '1380493922254145',
					name: 'LBD Piggy',
					picture: 'https://fbcdn-sphotos-g-a.akamaihd.net/hphotos-ak-xap1/v/t1.0-9/s130x130/10897962_1380493922254145_5386757285347386511_n.jpg?oh=98e30ce334bf9cb01f808c0c1134afff&oe=55291C94&__gda__=1429910956_84b3b9a2d5d9326485e630290657afcc',
					pictures: [{
						source: 'https://fbcdn-sphotos-g-a.akamaihd.net/hphotos-ak-xap1/v/t1.0-9/p130x130/10897962_1380493922254145_5386757285347386511_n.jpg?oh=c844758a0168dc0fa20106614496f20f&oe=553CD544&__gda__=1433335420_b6b78a2b6554da54741dffea139b18bf',
						width: 130,
						height: 147
					}, {
						source: 'https://fbcdn-sphotos-g-a.akamaihd.net/hphotos-ak-xap1/v/t1.0-9/p75x225/10897962_1380493922254145_5386757285347386511_n.jpg?oh=ea4175f2762b46d4b8b3bfb663a0cc91&oe=55361281&__gda__=1428907231_a5b7ab31f4bdf6ad829389734e4bf42b',
						width: 198,
						height: 225
					}, {
						source: 'https://fbcdn-sphotos-g-a.akamaihd.net/hphotos-ak-xap1/v/t1.0-9/p320x320/10897962_1380493922254145_5386757285347386511_n.jpg?oh=be66c3ee515536d73917146cfa6f7d86&oe=552CF0A3&__gda__=1428296859_6705bd7c1183d77b84a9249492334798',
						width: 320,
						height: 362
					}, {
						source: 'https://fbcdn-sphotos-g-a.akamaihd.net/hphotos-ak-xap1/v/t1.0-9/p180x540/10897962_1380493922254145_5386757285347386511_n.jpg?oh=a5cd1de629354d1b880133cf314408c9&oe=552BFCE8&__gda__=1430386896_07316fcb7c40fc98585837b6b33773ff',
						width: 477,
						height: 540
					}, {
						source: 'https://fbcdn-sphotos-g-a.akamaihd.net/hphotos-ak-xap1/v/t1.0-9/p480x480/10897962_1380493922254145_5386757285347386511_n.jpg?oh=be2c6c759107eecf58c323cfb2053492&oe=553FE4E4&__gda__=1428803548_71b51cb1f98f4eb0608bcb11df5cb8bf',
						width: 480,
						height: 543
					}, {
						source: 'https://fbcdn-sphotos-g-a.akamaihd.net/hphotos-ak-xap1/t31.0-8/p600x600/10896389_1380493922254145_5386757285347386511_o.jpg',
						width: 600,
						height: 679
					}, {
						source: 'https://fbcdn-sphotos-g-a.akamaihd.net/hphotos-ak-xap1/t31.0-8/p720x720/10896389_1380493922254145_5386757285347386511_o.jpg',
						width: 720,
						height: 815
					}, {
						source: 'https://fbcdn-sphotos-g-a.akamaihd.net/hphotos-ak-xap1/t31.0-8/p960x960/10896389_1380493922254145_5386757285347386511_o.jpg',
						width: 960,
						height: 1086
					}, {
						source: 'https://fbcdn-sphotos-g-a.akamaihd.net/hphotos-ak-xap1/t31.0-8/10896389_1380493922254145_5386757285347386511_o.jpg',
						width: 1809,
						height: 2048
					}]
				}
			}
		}, {
			network: 'flickr',
			expect: {
				length: 5,
				first: {
					id: '6206400436',
					name: 'DSC03367',
					picture: 'https://farm7.staticflickr.com/6162/6206400436_1d15b3aa99.jpg',
					pictures: [{
						source: 'https://farm7.staticflickr.com/6162/6206400436_1d15b3aa99_t.jpg',
						width: 100,
						height: 100
					}, {
						source: 'https://farm7.staticflickr.com/6162/6206400436_1d15b3aa99_m.jpg',
						width: 240,
						height: 240
					}, {
						source: 'https://farm7.staticflickr.com/6162/6206400436_1d15b3aa99_n.jpg',
						width: 320,
						height: 320
					}, {
						source: 'https://farm7.staticflickr.com/6162/6206400436_1d15b3aa99.jpg',
						width: 500,
						height: 500
					}, {
						source: 'https://farm7.staticflickr.com/6162/6206400436_1d15b3aa99_z.jpg',
						width: 640,
						height: 640
					}, {
						source: 'https://farm7.staticflickr.com/6162/6206400436_1d15b3aa99_c.jpg',
						width: 800,
						height: 800
					}, {
						source: 'https://farm7.staticflickr.com/6162/6206400436_1d15b3aa99_b.jpg',
						width: 1024,
						height: 1024
					}, {
						source: 'https://farm7.staticflickr.com/6162/6206400436_1d15b3aa99_h.jpg',
						width: 1600,
						height: 1600
					}, {
						source: 'https://farm7.staticflickr.com/6162/6206400436_1d15b3aa99_k.jpg',
						width: 2048,
						height: 2048
					}, {
						source: 'https://farm7.staticflickr.com/6162/6206400436_1d15b3aa99_o.jpg',
						width: 2048,
						height: 2048
					}]
				}
			}
		}, {
			network: 'windows',
			expect: {
				length: 7,
				first: {
					id: 'file.939f37452466502a.939F37452466502A!109',
					name: 'funeral-piggy.jpg',
					picture: 'https://public-ch3301.files.1drv.com/y2mtE3u-1oVm7UJkYR5Ylxn2b8BR4attabxQ0AEiajowKHvlJUZBxjLpP8LWG4Pi4ZEuDyQFELhxSxoNNHxP--6kcx0Z6mCsWnYjR1_1-izBx8HkqE1ghH6I22bQtIKPjFXnXJbHtHXhFgvQwq7eKZ03Q/funeral-piggy.jpg?psid=1',
					pictures: [{
						source: 'https://public-ch3301.files.1drv.com/y2mtE3u-1oVm7UJkYR5Ylxn2b8BR4attabxQ0AEiajowKHvlJUZBxjLpP8LWG4Pi4ZEuDyQFELhxSxoNNHxP--6kcx0Z6mCsWnYjR1_1-izBx8HkqE1ghH6I22bQtIKPjFXnXJbHtHXhFgvQwq7eKZ03Q/funeral-piggy.jpg?psid=1',
						width: 85,
						height: 96
					}, {
						source: 'https://public-ch3301.files.1drv.com/y2mrLoEhkFAzHOjlFCyVV4ypi_TtACvF476rRuvAOBoVSsNJrt722EP9xCR_b_Z0qa8vocx8kNPlxoUFehnT_7e6LD-L8J14V-SzD5nCRiiT-Mg8J2pKgtW_pf6XD2Sg7oS/funeral-piggy.jpg?psid=1&ck=2&ex=720',
						width: 156,
						height: 176
					}, {
						source: 'https://public-ch3301.files.1drv.com/y2mqUA8S78mIJyXz1Tof4bZ8a_4CuConMxRIJ4nZ2I6QyQDjmshrQb393fB8xwt_5b_3b1-je4c_OlJbXJVF9oafdXw1t7eB4rqFTuVZAq-snGg1ksLwLM3OAJUUPGTidy6/funeral-piggy.jpg?psid=1&ck=2&ex=720',
						width: 707,
						height: 800
					}, {
						source: 'https://public-ch3301.files.1drv.com/y2mg6goRE11zDIFTJ7rokvWLucBkeD6k6ljXPP2ARkUjR2rfo5-xU13wAU23CrmaGEsIr6NIeXfetdx0htCjqUb7QYttyRnuP2BXFJ0f_7uEA5NGIeH2tk6_DjFoUUIHKg-KdFDuKWM_FHUe48vF6fr4g/funeral-piggy.jpg?psid=1',
						width: 2000,
						height: 2263
					}]
				}
			}
		}];

		helper.forEach(tests, function (test) {

			it('should format ' + test.network + ' correctly', function (done) {

				hello(test.network).api('/me/photos').then(function (photos) {
					var first = photos.data[0];
					expect(photos.data.length).to.be(test.expect.length);
					expect(first.id).to.be(test.expect.first.id);
					expect(first.name).to.be(test.expect.first.name);
					expect(first.picture).to.be(test.expect.first.picture);
					if (test.expect.first.pictures) expect(first.pictures).to.eql(test.expect.first.pictures);
					done();
				}).then(null, done);
			});
		});
	});
});

},{}],21:[function(require,module,exports){
'use strict';

define([], function () {

	// Shim up IE8
	if (typeof XMLHttpRequest !== 'undefined' && !('withCredentials' in new XMLHttpRequest())) {

		XMLHttpRequest.prototype.withCredentials = true;
		hello.utils.xhr = function (method, url, headers, body, callback) {
			var x = new XMLHttpRequest();
			x.onreadystatechange = function () {
				if (x.readyState === 4) {
					var r = x.responseText;
					r = JSON.parse(r);
					callback(r);
				}
			};

			x.open(method, url);
			x.send(body);
			return x;
		};
	}

	return {

		forEach: function forEach(collection, fn) {
			if (collection && collection.length) {
				for (var i = 0; i < collection.length; i += 1) {
					fn(collection[i]);
				}
			}
		},

		getRequestProxy: function getRequestProxy(originalRequest) {

			var requestProxy = function requestProxy(req, callback) {

				var r = {
					network: req.network,
					method: 'get',
					url: req.url,
					data: req.data,
					query: {},
					xhr: true
				};

				var stubName = req.path + (req.options.stubType || '') + '.json';
				r.url = './stubs/' + (req.stub || req.network + '/' + req.method + '/' + stubName);
				originalRequest.call(hello.utils, r, callback);
			};

			return requestProxy;
		},

		sharedSetup: function sharedSetup() {

			var originalGetAuthResponse = hello.getAuthResponse;
			var originalRequest = hello.utils.request;
			var requestProxy = this.getRequestProxy(originalRequest);

			before(function () {
				hello.getAuthResponse = function (service) {
					return {
						access_token: 'token'
					};
				};

				hello.utils.request = requestProxy;
			});

			after(function () {
				hello.getAuthResponse = originalGetAuthResponse;
				hello.utils.request = originalRequest;
			});
		}

	};
});

},{}],22:[function(require,module,exports){
// Load in the modules to test the endpoints
'use strict';

define(['./api', './apiMe', './apiMeAlbum', './apiMeAlbums', './apiMeFriends', './apiMePhotos'], function () {
	// Done
});

},{}],23:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var a = ['localStorage', 'sessionStorage'];
var i = -1;
var prefix = 'test';

var namespace = 'tricks';

exports.namespace = namespace;
// Set LocalStorage
var localStorage;

while (a[++i]) {
	try {
		// In Chrome with cookies blocked, calling localStorage throws an error
		localStorage = window[a[i]];
		localStorage.setItem(prefix + i, i);
		localStorage.removeItem(prefix + i);
		break;
	} catch (e) {
		localStorage = null;
	}
}

if (!localStorage) {

	var cache = null;

	localStorage = {
		getItem: function getItem(prop) {
			prop += '=';
			var m = document.cookie.split(';');
			m.forEach(function (item) {
				item = item.replace(/(^\s+|\s+$)/, '');
				if (item && item.indexOf(prop) === 0) {
					return item.substr(prop.length);
				}
			});

			return cache;
		},

		setItem: function setItem(prop, value) {
			cache = value;
			document.cookie = prop + '=' + value;
		}
	};

	// Fill the cache up
	cache = localStorage.getItem(namespace);
}

function get() {
	var json = {};
	try {
		json = JSON.parse(localStorage.getItem(namespace)) || {};
	} catch (e) {}

	return json;
}

function set(json) {
	localStorage.setItem(namespace, JSON.stringify(json));
}

module.exports = function (name, value) {
	// Local storage
	var json = get();

	if (name && value === undefined) {
		return json[name] || null;
	} else if (name && value === null) {
		try {
			delete json[name];
		} catch (e) {
			json[name] = null;
		}
	} else if (name) {
		json[name] = value;
	} else {
		return json;
	}

	set(json);

	return json || null;
};

},{}],24:[function(require,module,exports){
'use strict';

var instanceOf = require('./instanceOf.js');

module.exports = function extend(r) {
	for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
		args[_key - 1] = arguments[_key];
	}

	args.forEach(function (o) {
		if (instanceOf(r, Object) && instanceOf(o, Object) && r !== o) {
			for (var x in o) {
				r[x] = extend(r[x], o[x]);
			}
		} else {
			r = o;
		}
	});
	return r;
};

},{"./instanceOf.js":25}],25:[function(require,module,exports){
"use strict";

module.exports = function (test, root) {
	return root && test instanceof root;
};

},{}]},{},[5])


//# sourceMappingURL=bundle.js.map
