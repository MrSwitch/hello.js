(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 * @hello.js
 *
 * HelloJS is a client side Javascript SDK for making OAuth2 logins and subsequent REST calls.
 *
 * @author Andrew Dodson
 * @website https://adodson.com/hello.js/

 * @copyright Andrew Dodson, 2012 - 2015
 * @license MIT: You are free to use and modify this code for any use, on the condition that this copyright notice remains.
 */

var argmap = require('tricks/object/args');
var clone = require('tricks/object/clone');
var closeWindow = require('tricks/window/close');
var createUrl = require('tricks/string/createUrl');
var diffKey = require('tricks/object/diffKey');
var diff = require('tricks/array/diff');
var extend = require('tricks/object/extend');
var globalCallback = require('tricks/events/globalCallback');
var iframe = require('tricks/dom/hiddenFrame');
var isEmpty = require('tricks/object/isEmpty');
var merge = require('tricks/object/merge');
var param = require('tricks/string/queryparse');
var popup = require('tricks/window/popup');
var pubsub = require('tricks/object/pubsub');
var request = require('tricks/http/request');
var store = require('tricks/browser/agent/localStorage');
var Then = require('tricks/object/then');
var unique = require('tricks/array/unique');
var Url = require('tricks/window/url');

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
		pubsub.call(self);

		return self;
	},


	// Initialize
	// Define the client_ids for the endpoint services
	// @param object o, contains a key value pair, service => clientId
	// @param object opts, contains a key value pair of options used for defining the authentication defaults
	// @param number timeout, timeout in seconds
	init: function init(services, options) {

		if (!services) {
			return this.services;
		}

		// Define provider credentials
		// Reformat the ID field
		for (var x in services) {
			if (services.hasOwnProperty(x)) {
				if (_typeof(services[x]) !== 'object') {
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
				this.settings.redirect_uri = Url(options.redirect_uri).href;
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
		var _this2 = this;

		var utils = this.utils;
		// Get parameters

		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		var p = argmap({ network: 's', options: 'o', callback: 'f' }, args);
		// Create an object which inherits its parent as the prototype and constructs a new event chain.
		var promise = new Promise(function (accept, reject) {

			// Local vars
			var url;

			// Get all the custom options and store to be appended to the querystring
			var qs = diffKey(p.options, _this2.settings);

			// Merge/override options with app defaults
			var opts = p.options = merge(_this2.settings, p.options || {});

			// Merge/override options with app defaults
			opts.popup = merge(_this2.settings.popup, p.options.popup || {});

			// Network
			p.network = p.network || _this2.settings.default_service;

			// Is our service valid?
			if (typeof p.network !== 'string' || !(p.network in _this2.services)) {
				// Trigger the default login.
				// Ahh we dont have one.
				return reject(error('invalid_network', 'The provided network was not recognized'));
			}

			var provider = _this2.services[p.network];

			// Create a global listener to capture events triggered out of scope
			var callbackId = globalCallback(function (str) {

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
					accept({
						network: obj.network,
						authResponse: obj
					});
				} else {
					// Reject a successful login
					reject(obj);
				}
			}, null, '_hellojs_');

			var redirectUri = Url(opts.redirect_uri).href;

			// May be a space-delimited list of multiple, complementary types
			var responseType = provider.oauth.response_type || opts.response_type;

			// Fallback to token if the module hasn't defined a grant url
			if (/\bcode\b/.test(responseType) && !provider.oauth.grant) {
				responseType = responseType.replace(/\bcode\b/, 'token');
			}

			// Query string parameters, we may pass our own arguments to form the querystring
			p.qs = merge(qs, {
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
			var scope = _this2.settings.scope ? [_this2.settings.scope.toString()] : [];

			// Extend the providers scope list with the default
			var scopeMap = merge(_this2.settings.scope_map, provider.scope || {});

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
			scope = unique(scope).filter(filterEmpty);

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
			scope = unique(scope).filter(filterEmpty);

			// Join with the expected scope delimiter into a string
			p.qs.scope = scope.join(provider.scope_delim || ',');

			// Is the user already signed in with the appropriate scopes, valid access_token?
			if (opts.force === false) {

				if (session && 'access_token' in session && session.access_token && 'expires' in session && session.expires > new Date().getTime() / 1e3) {
					// What is different about the scopes in the session vs the scopes in the new login?
					var a = diff((session.scope || '').split(SCOPE_SPLIT), (p.qs.state.scope || '').split(SCOPE_SPLIT));
					if (a.length === 0) {

						// OK trigger the callback
						accept({
							unchanged: true,
							network: p.network,
							authResponse: session
						});

						// Nothing has changed
						return;
					}
				}
			}

			// Page URL
			if (opts.display === 'page' && opts.page_uri) {
				// Add a page location, place to endup after session has authenticated
				p.qs.state.page_uri = Url(opts.page_uri).href;
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
				url = createUrl(opts.oauth_proxy, p.qs, encodeFunction);
			}

			// Refresh token
			else if (opts.display === 'none' && provider.oauth.grant && session && session.refresh_token) {

					// Add the refresh_token to the request
					p.qs.refresh_token = session.refresh_token;

					// Define the request path
					url = createUrl(opts.oauth_proxy, p.qs, encodeFunction);
				} else {
					url = createUrl(provider.oauth.auth, p.qs, encodeFunction);
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

					var win = utils.popup(url, redirectUri, opts.popup);

					var timer = setInterval(function () {
						if (!win || win.closed) {
							clearInterval(timer);
							if (!promise.state) {

								var response = error('cancelled', 'Login has been cancelled');

								if (!popup) {
									response = error('blocked', 'Popup was blocked');
								}

								response.network = p.network;

								reject(response);
							}
						}
					}, 100);
				} else {
					window.location = url;
				}

			function encodeFunction(s) {
				return s;
			}

			function filterEmpty(s) {
				return !!s;
			}
		});

		// Bind callback to both reject and fulfill states
		promise.then(p.callback, p.callback);
		// Trigger an event on the global listener
		function emit(s, value) {
			hello.emit(s, value);
		}
		promise.then(emit.bind(this, 'auth.login auth'), emit.bind(this, 'auth.failed auth'));
		return promise;
	},


	// Remove any data associated with a given service
	// @param string name of the service
	// @param function callback
	logout: function logout() {
		var _this3 = this;

		var utils = this.utils;

		for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
			args[_key2] = arguments[_key2];
		}

		var p = argmap({ name: 's', options: 'o', callback: 'f' }, args);
		// Create a new promise
		var promise = new Promise(function (accept, reject) {

			p.options = p.options || {};

			// Network
			p.name = p.name || _this3.settings.default_service;
			p.authResponse = utils.store(p.name);

			if (p.name && !(p.name in _this3.services)) {

				reject(error('invalid_network', 'The network was unrecognized'));
			} else if (p.name && p.authResponse) {

				// Define the callback
				var callback = function callback(opts) {

					// Remove from the store
					utils.store(p.name, null);

					// Emit events by default
					accept(merge({ network: p.name }, opts || {}));
				};

				// Run an async operation to remove the users session
				var _opts = {};
				if (p.options.force) {
					var logout = _this3.services[p.name].logout;
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
							return;
						}
					}
				}

				// Remove local credentials
				callback(_opts);
			} else {
				reject(error('invalid_session', 'There was no session to remove'));
			}
		});

		// Add callback to events
		promise.then(p.callback, p.callback);
		// Trigger an event on the global listener
		function emit(s, value) {
			hello.emit(s, value);
		}
		promise.then(emit.bind(this, 'auth.logout auth'), emit.bind(this, 'error'));
		return promise;
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

function error(code, message) {
	return {
		error: {
			code: code,
			message: message
		}
	};
}

hello.utils = {
	iframe: iframe,
	popup: popup,
	request: request,
	store: store
};

// Core utilities
extend(hello.utils, {

	// OAuth and API response handler
	responseHandler: function responseHandler(window, parent) {
		var utils = this;
		var _this = this;
		var p;
		var location = window.location;

		var redirect = location.assign && location.assign.bind(location) || function (url) {
			window.location = url;
		};

		// Is this an auth relay message which needs to call the proxy?
		p = param(location.search);

		// OAuth2 or OAuth1 server response?
		if (p && p.state && (p.code || p.oauth_token)) {

			var state = JSON.parse(p.state);

			// Add this path as the redirect_uri
			p.redirect_uri = state.redirect_uri || location.href.replace(/[\?\#].*$/, '');

			// Redirect to the host
			var path = state.oauth_proxy + '?' + param(p);

			redirect(path);

			return;
		}

		// Save session, from redirected authentication
		// #access_token has come in?
		//
		// FACEBOOK is returning auth errors within as a query_string... thats a stickler for consistency.
		// SoundCloud is the state in the querystring and the token in the hashtag, so we'll mix the two together

		p = merge(param(location.search || ''), param(location.hash || ''));

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
						callback(parent, p.callback)(res);
						closeWindow(window);
					}

			// If this page is still open
			if (p.page_uri) {
				redirect(p.page_uri);
			}
		}

		// OAuth redirect, fixes URI fragments from being lost in Safari
		// (URI Fragments within 302 Location URI are lost over HTTPS)
		// Loading the redirect.html before triggering the OAuth Flow seems to fix it.
		else if ('oauth_redirect' in p) {

				redirect(decodeURIComponent(p.oauth_redirect));
				return;
			}

		// Trigger a callback to authenticate
		function authCallback(obj, window, parent) {

			var cb = obj.callback;
			var network = obj.network;

			// Trigger the callback on the parent
			utils.store(network, obj);

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
				utils.store(network, obj);

				// Call the globalEvent function on the parent
				// It's safer to pass back a string to the parent,
				// Rather than an object/array (better for IE8)
				var str = JSON.stringify(obj);

				try {
					callback(parent, cb)(str);
				} catch (e) {
					// Error thrown whilst executing parent callback
				}
			}

			closeWindow(window);
		}

		function callback(parent, callbackID) {
			if (callbackID.indexOf('_hellojs_') !== 0) {
				return function () {
					throw 'Could not execute callback ' + callbackID;
				};
			}

			return parent[callbackID];
		}
	}
});

// Events
// Extend the hello object with its own event instance
pubsub.call(hello);

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
		if (auth && (typeof auth === 'undefined' ? 'undefined' : _typeof(auth)) === 'object' && auth.network) {
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
	var _this4 = this;

	for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
		args[_key3] = arguments[_key3];
	}

	// Arguments
	var p = argmap({ path: 's!', query: 'o', method: 's', data: 'o', timeout: 'i', callback: 'f' }, args);

	// Construct a new Promise object
	var promise = new Promise(function (accept, reject) {

		// Remove the network from path, e.g. facebook:/me/friends
		// Results in { network : facebook, path : me/friends }
		if (!p || !p.path) {
			return reject(error('invalid_path', 'Missing the path parameter from the request'));
		}

		// Method
		p.method = (p.method || 'get').toLowerCase();

		// Headers
		p.headers = p.headers || {};

		// Response format
		p.responseType = p.responseType || 'json';

		// Query
		p.query = p.query || {};

		// If get, put all parameters into query
		if (p.method === 'get' || p.method === 'delete') {
			extend(p.query, p.data);
			p.data = {};
		}

		var data = p.data = p.data || {};

		p.path = p.path.replace(/^\/+/, '');
		var a = (p.path.split(/[\/\:]/, 2) || [])[0].toLowerCase();

		if (a in _this4.services) {
			p.network = a;
			var reg = new RegExp('^' + a + ':?\/?');
			p.path = p.path.replace(reg, '');
		}

		// Network & Provider
		// Define the network that this request is made for
		p.network = _this4.settings.default_service = p.network || _this4.settings.default_service;
		var o = _this4.services[p.network];

		// INVALID
		// Is there no service by the given network name?
		if (!o) {
			return reject(error('invalid_network', 'Could not match the service requested: ' + p.network));
		}

		// PATH
		// As long as the path isn't flagged as unavaiable, e.g. path == false

		if (!(!(p.method in o) || !(p.path in o[p.method]) || o[p.method][p.path] !== false)) {
			return reject(error('invalid_path', 'The provided path is not available on the selected network'));
		}

		// PROXY
		// OAuth1 calls always need a proxy

		if (!p.oauth_proxy) {
			p.oauth_proxy = _this4.settings.oauth_proxy;
		}

		if (!('proxy' in p)) {
			p.proxy = p.oauth_proxy && o.oauth && parseInt(o.oauth.version, 10) === 1;
		}

		// TIMEOUT
		// Adopt timeout from global settings by default

		if (!('timeout' in p)) {
			p.timeout = _this4.settings.timeout;
		}

		// Format response
		// Whether to run the raw response through post processing.
		if (!('formatResponse' in p)) {
			p.formatResponse = true;
		}

		// Get the current session
		// Append the access_token to the query
		p.authResponse = _this4.getAuthResponse(p.network);
		if (p.authResponse && p.authResponse.access_token) {
			p.query.access_token = p.authResponse.access_token;
		}

		var url = p.path;
		var m;

		// Store the query as options
		// This is used to populate the request object before the data is augmented by the prewrap handlers.
		p.options = clone(p.query);

		// Clone the data object
		// Prevent this script overwriting the data of the incoming object.
		// Ensure that everytime we run an iteration the callbacks haven't removed some data
		p.data = clone(data);

		// URL Mapping
		// Is there a map for the given URL?
		var actions = o[{ 'delete': 'del' }[p.method] || p.method] || {};

		// Extrapolate the QueryString
		// Provide a clean path
		// Move the querystring into the data
		if (p.method === 'get') {

			var query = url.split(/[\?#]/)[1];
			if (query) {
				extend(p.query, param(query));

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
		p.redirect_uri = _this4.settings.redirect_uri;

		// Define FormatHandler
		// The request can be procesed in a multitude of ways
		// Here's the options - depending on the browser and endpoint
		p.xhr = o.xhr;
		p.jsonp = o.jsonp;
		p.form = o.form;

		// Define Proxy handler
		p.proxyHandler = function (p, callback) {

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
			var path = createUrl(p.url, p.query);

			// Proxy the request through a server
			// Used for signing OAuth1
			// And circumventing services without Access-Control Headers
			if (p.proxy) {
				// Use the proxy as a path
				path = createUrl(p.oauth_proxy, {
					path: path,
					access_token: sign || '',

					// This will prompt the request to be signed as though it is OAuth1
					then: p.proxy_response_type || (p.method.toLowerCase() === 'get' ? 'redirect' : 'proxy'),
					method: p.method.toLowerCase(),
					suppress_response_codes: true
				});
			}

			callback(path);
		};

		// If url needs a base
		// Wrap everything in
		var getPath = function getPath(url) {

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
					reject(error('missing_attribute', 'The attribute ' + key + ' is missing from the request'));
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
			_this4.utils.request(p, function (r, headers) {

				// Is this a raw response?
				if (!p.formatResponse) {
					// Bad request? error statusCode or otherwise contains an error response vis JSONP?
					if ((typeof headers === 'undefined' ? 'undefined' : _typeof(headers)) === 'object' ? headers.statusCode >= 400 : (typeof r === 'undefined' ? 'undefined' : _typeof(r)) === 'object' && 'error' in r) {
						reject(r);
					} else {
						accept(r);
					}

					return;
				}

				// Should this be an object
				if (r === true) {
					r = { success: true };
				}

				// The delete callback needs a better response
				if (p.method === 'delete') {
					r = !r || isEmpty(r) ? { success: true } : r;
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
					reject(r);
				} else {
					accept(r);
				}
			});
		};

		// Make request
		if (typeof url === 'function') {
			// Does self have its own callback?
			url(p, getPath);
		} else {
			// Else the URL is a string
			getPath(url);
		}
	});

	// Completed event callback
	promise.then(p.callback, p.callback);

	return promise;
};

/////////////////////////////////////
//
// Save any access token that is in the current page URL
// Handle any response solicited through iframe hash tag following an API request
//
/////////////////////////////////////

hello.utils.responseHandler(window, window.opener || window.parent);

},{"tricks/array/diff":2,"tricks/array/unique":5,"tricks/browser/agent/localStorage":8,"tricks/dom/hiddenFrame":20,"tricks/events/globalCallback":24,"tricks/http/request":13,"tricks/object/args":26,"tricks/object/clone":27,"tricks/object/diffKey":28,"tricks/object/extend":29,"tricks/object/isEmpty":32,"tricks/object/merge":33,"tricks/object/pubsub":34,"tricks/object/then":36,"tricks/string/createUrl":38,"tricks/string/queryparse":42,"tricks/window/close":47,"tricks/window/popup":48,"tricks/window/url":49}],2:[function(require,module,exports){
"use strict";

module.exports = function (a, b) {
  return b.filter(function (item) {
    return a.indexOf(item) === -1;
  });
};

},{}],3:[function(require,module,exports){
"use strict";

// Array find
// Returns the first non undefined response
// If the response is (Boolean) True, then the value of that array item is returned instead...
module.exports = function (arr, callback) {
	var thisArg = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

	for (var i = 0; i < arr.length; i++) {
		var value = callback.call(thisArg, arr[i]);
		if (value !== undefined) {
			return value === true ? arr[i] : value;
		}
	}
};

},{}],4:[function(require,module,exports){
"use strict";

module.exports = function (obj) {
  return Array.prototype.slice.call(obj);
};

},{}],5:[function(require,module,exports){
"use strict";

module.exports = function (a) {
	if (!Array.isArray(a)) {
		return [];
	}

	// Is this the first location of item
	return a.filter(function (item, index) {
		return a.indexOf(item) === index;
	});
};

},{}],6:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var jsonParse = require('../../string/jsonParse.js');
var extend = require('../../object/extend.js');

// Return handler
module.exports = Storage;

function Storage(method) {

	this.native = method;

	return extend(this.api.bind(this), this);
}

Storage.prototype.api = function (name, value) {
	// recursive
	if ((typeof name === 'undefined' ? 'undefined' : _typeof(name)) === 'object') {
		for (var x in name) {
			this.api(x, name[x]);
		}
	}

	// Local storage
	else if (!name) {
			throw 'agent/store must have a valid name';
		} else if (value === undefined) {
			return this.getItem(name);
		} else if (value === null) {
			this.removeItem(name);
		} else {
			this.setItem(name, value);
		}
};

Storage.prototype.getItem = function (name) {
	return jsonParse(this.native.getItem(name));
};

Storage.prototype.setItem = function (name, value) {
	this.native.setItem(name, JSON.stringify(value));
};

Storage.prototype.removeItem = function (name) {
	this.native.removeItem(name);
};

},{"../../object/extend.js":29,"../../string/jsonParse.js":40}],7:[function(require,module,exports){
'use strict';

// Provide an API for setting and retrieving cookies
var arrayFind = require('../../array/find.js');
var Storage = require('./Storage.js');

// Emulate localStorage using cookies
module.exports = new Storage({
	getItem: function getItem(name) {
		var key = name + '=';
		var m = document.cookie.split(';');
		return arrayFind(m, function (item) {
			item = item.replace(/(^\s+|\s+$)/, '');
			if (item && item.indexOf(key) === 0) {
				return item.substr(key.length);
			}
		}) || null;
	},

	setItem: function setItem(name, value) {
		document.cookie = name + '=' + value;
	},

	removeItem: function removeItem(name) {
		document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	}
});

},{"../../array/find.js":3,"./Storage.js":6}],8:[function(require,module,exports){
'use strict';

// sessionStorage
// Shimmed up sessionStorage

var sessionStorage = require('./sessionStorage.js');
var Storage = require('./Storage.js');

// Test the environment
try {
	var temp = '__tricks_temp__';
	// In Chrome with cookies blocked, calling localStorage throws an error
	var storage = window.localStorage;
	storage.setItem(temp, 1);
	storage.removeItem(temp);
	module.exports = new Storage(storage);
} catch (e) {
	module.exports = sessionStorage;
}

},{"./Storage.js":6,"./sessionStorage.js":9}],9:[function(require,module,exports){
'use strict';

// sessionStorage
// Shimmed up sessionStorage

var cookieStorage = require('./cookieStorage.js');
var Storage = require('./Storage.js');

// Test the environment
try {
	var temp = '__tricks_temp__';
	// In Chrome with cookies blocked, calling localStorage throws an error
	var storage = window.sessionStorage;
	storage.setItem(temp, 1);
	storage.removeItem(temp);
	module.exports = new Storage(storage);
} catch (e) {
	module.exports = cookieStorage;
}

},{"./Storage.js":6,"./cookieStorage.js":7}],10:[function(require,module,exports){
'use strict';

// Post
// Send information to a remote location using the post mechanism
// @param string uri path
// @param object data, key value data to send
// @param function callback, function to execute in response

var append = require('../../dom/append.js');
var attr = require('../../dom/attr.js');
var domInstance = require('../../dom/domInstance.js');
var createElement = require('../../dom/createElement.js');
var globalCallback = require('../../events/globalCallback.js');
var toArray = require('../../array/toArray.js');
var instanceOf = require('../../object/instanceOf.js');
var on = require('../../events/on.js');
var emit = require('../../events/emit.js');
var setImmediate = require('../../time/setImmediate.js');

module.exports = function (url, data, options, callback, callback_name) {
	var timeout = arguments.length <= 5 || arguments[5] === undefined ? 60000 : arguments[5];


	var timer = void 0;
	var bool = 0;
	var cb = function cb(r) {
		if (!bool++) {
			if (timer) {
				clearTimeout(timer);
				timer = null;
			}
			callback(r);

			// Trigger onsubmit on the form.
			// Typically this isn't activated until afterwards
			emit(form, 'submit');

			// The setImmediate fixes the test runner in phantomjs
			setImmediate(function () {
				return frame.parentNode.removeChild(frame);
			});
		}

		return true;
	};

	// What is the name of the callback to contain
	// We'll also use this to name the iframe
	callback_name = globalCallback(cb, callback_name);

	/////////////////////
	// Create the FRAME
	/////////////////////

	var frame = createFrame(callback_name);

	// Override callback mechanism. Triggger a response onload/onerror
	if (options && options.callbackonload) {

		// Onload is being fired twice
		frame.onload = cb.bind(null, {
			response: 'posted',
			message: 'Content was posted'
		});
	}

	/////////////////////
	// Set a timeout
	/////////////////////

	if (timeout) {
		timer = setTimeout(cb.bind(null, new Error('timeout')), timeout);
	}

	/////////////////////
	// Create a form
	/////////////////////

	var form = createFormFromData(data);

	// The URL is a function for some cases and as such
	// Determine its value with a callback containing the new parameters of this function.
	url = url.replace(new RegExp('=\\?(&|$)'), '=' + callback_name + '$1');

	// Set the target of the form
	attr(form, {
		method: 'POST',
		target: callback_name,
		action: url
	});

	form.target = callback_name;

	// Submit the form
	// Some reason this needs to be offset from the current window execution
	setTimeout(function () {
		form.submit();
	}, 100);
};

function createFrame(callback_name) {
	var frame = void 0;

	try {
		// IE7 hack, only lets us define the name here, not later.
		frame = createElement('<iframe name="' + callback_name + '">');
	} catch (e) {
		frame = createElement('iframe');
	}

	// Attach the frame with the following attributes to the document body.
	attr(frame, {
		name: callback_name,
		id: callback_name,
		style: 'display:none;'
	});

	document.body.appendChild(frame);

	return frame;
}

function createFormFromData(data) {

	// This hack needs a form
	var form = null;
	var reenableAfterSubmit = [];
	var i = 0;
	var x = null;

	// If we are just posting a single item
	if (domInstance('input', data)) {
		// Get the parent form
		form = data.form;

		// Loop through and disable all of its siblings
		toArray(form.elements).forEach(function (input) {
			if (input !== data) {
				input.setAttribute('disabled', true);
			}
		});

		// Move the focus to the form
		data = form;
	}

	// Posting a form
	if (domInstance('form', data)) {
		// This is a form element
		form = data;

		// Does this form need to be a multipart form?
		toArray(form.elements).forEach(function (input) {
			if (!input.disabled && input.type === 'file') {
				form.encoding = form.enctype = 'multipart/form-data';
				input.setAttribute('name', 'file');
			}
		});
	} else {
		// Its not a form element,
		// Therefore it must be a JSON object of Key=>Value or Key=>Element
		// If anyone of those values are a input type=file we shall shall insert its siblings into the form for which it belongs.
		for (x in data) {
			if (data.hasOwnProperty(x)) {
				// Is this an input Element?
				if (domInstance('input', data[x]) && data[x].type === 'file') {
					form = data[x].form;
					form.encoding = form.enctype = 'multipart/form-data';
				}
			}
		} // Do If there is no defined form element, lets create one.
		if (!form) {
			// Build form
			form = append('form');

			// Bind the removal of the form
			on(form, 'submit', function () {
				setImmediate(function () {
					form.parentNode.removeChild(form);
				});
			});
		} else {
			// Bind the clean up of the existing form.
			on(form, 'submit', function () {
				setImmediate(function () {
					reenableAfterSubmit.forEach(function (input) {
						if (input) {
							input.setAttribute('disabled', false);
							input.disabled = false;
						}
					});

					// Reset, incase this is called again.
					reenableAfterSubmit.length = 0;
				});
			});
		}

		var input = void 0;

		// Add elements to the form if they dont exist
		for (x in data) {
			if (data.hasOwnProperty(x)) {

				// Is this an element?
				var el = domInstance('input', data[x]) || domInstance('textArea', data[x]) || domInstance('select', data[x]);

				// Is this not an input element, or one that exists outside the form.
				if (!el || data[x].form !== form) {

					// Does an element have the same name?
					var inputs = form.elements[x];
					if (input) {
						// Remove it.
						if (!instanceOf(inputs, window.NodeList)) {
							inputs = [inputs];
						}

						for (i = 0; i < inputs.length; i++) {
							inputs[i].parentNode.removeChild(inputs[i]);
						}
					}

					// Create an input element
					input = append('input', {
						type: 'hidden',
						name: x
					}, form);

					// Does it have a value attribute?
					if (el) {
						input.value = data[x].value;
					} else if (domInstance(null, data[x])) {
						input.value = data[x].innerHTML || data[x].innerText;
					} else {
						input.value = data[x];
					}
				}

				// It is an element, which exists within the form, but the name is wrong
				else if (el && data[x].name !== x) {
						data[x].setAttribute('name', x);
						data[x].name = x;
					}
			}
		} // Disable elements from within the form if they weren't specified
		toArray(form.elements).forEach(function (input) {

			// Does the same name and value exist in the parent
			if (!(input.name in data) && input.getAttribute('disabled') !== true) {
				// Disable
				input.setAttribute('disabled', true);

				// Add re-enable to callback
				reenableAfterSubmit.push(input);
			}
		});
	}

	return form;
}

},{"../../array/toArray.js":4,"../../dom/append.js":15,"../../dom/attr.js":16,"../../dom/createElement.js":17,"../../dom/domInstance.js":18,"../../events/emit.js":23,"../../events/globalCallback.js":24,"../../events/on.js":25,"../../object/instanceOf.js":30,"../../time/setImmediate.js":46}],11:[function(require,module,exports){
'use strict';

var createElement = require('../../dom/createElement.js');
var createEvent = require('../../events/createEvent.js');

module.exports = function (url, callback) {
	var timeout = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];


	// Inject a script tag
	var bool = 0;
	var timer = void 0;
	var head = document.getElementsByTagName('script')[0].parentNode;
	var cb = function cb(e) {
		if (!bool++ && callback) {
			callback(e);
		}
		if (timer) {
			clearTimeout(timer);
		}
	};

	// Add timeout
	if (timeout) {
		timer = window.setTimeout(function () {
			cb(createEvent('timeout'));
		}, timeout);
	}

	// Build script tag
	var script = createElement('script', {
		src: url,
		onerror: cb,
		onload: cb,
		onreadystatechange: function onreadystatechange() {
			if (/loaded|complete/i.test(script.readyState)) {
				cb(createEvent('load'));
			}
		}
	});

	// Set Async
	script.async = true;

	// Inject script tag into the head element
	head.insertBefore(script, head.firstChild);

	return script;
};

},{"../../dom/createElement.js":17,"../../events/createEvent.js":22}],12:[function(require,module,exports){
'use strict';

// JSONP
var globalCallback = require('../../events/globalCallback.js');
var getScript = require('./getScript.js');

var MATCH_CALLBACK_PLACEHOLDER = /=\?(&|$)/;

module.exports = function (url, callback, callback_name) {
	var timeout = arguments.length <= 3 || arguments[3] === undefined ? 60000 : arguments[3];


	// Change the name of the callback
	var result = void 0;

	// Add callback to the window object
	callback_name = globalCallback(function (json) {
		result = json;
		return true; // this ensure the window reference is removed
	}, callback_name);

	// The URL is a function for some cases and as such
	// Determine its value with a callback containing the new parameters of this function.
	url = url.replace(MATCH_CALLBACK_PLACEHOLDER, '=' + callback_name + '$1');

	var script = getScript(url, function () {
		callback(result);
		script.parentNode.removeChild(script);
	}, timeout);

	return script;
};

},{"../../events/globalCallback.js":24,"./getScript.js":11}],13:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// Request
// Makes an REST request given an object which describes how (aka, xhr, jsonp, formpost)
var jsonp = require('./jsonp.js');
var xhr = require('./xhr.js');
var formpost = require('./formpost.js');
var SupportCORS = require('../../support/cors.js');
var globalCallback = require('../../events/globalCallback.js');
var createUrl = require('../../string/createUrl.js');
var extend = require('../../object/extend.js');

module.exports = function (p, callback) {

	if (typeof p === 'string') {
		p = {
			url: p
		};
	}

	// Use interchangeably
	p.url = p.url || p.uri;

	// Set defaults
	p.query = p.query || p.qs || {};

	// Default method
	p.method = (p.method || 'get').toLowerCase();

	// Default proxy response
	p.proxyHandler = p.proxyHandler || function (p, cb) {
		cb();
	};

	// CORS
	if (SupportCORS && (typeof p.xhr === 'function' ? p.xhr(p, p.query) : p.xhr !== false)) {

		// Pass the selected request through a proxy
		p.proxyHandler(p, function () {
			// The agent and the provider support CORS
			var url = createUrl(p.url, p.query);
			var x = xhr(p.method, url, p.responseType, p.headers, p.data, callback);
			x.onprogress = p.onprogress || null;

			// Feature detect, not available on all implementations of XMLHttpRequest
			if (x.upload && p.onuploadprogress) {
				x.upload.onprogress = p.onuploadprogress;
			}
		});

		return;
	}

	// Apply a globalCallback
	p.callbackID = p.query.callback = globalCallback(callback);

	// JSONP
	if (p.jsonp !== false) {

		// Call p.jsonp handler
		if (typeof p.jsonp === 'function') {
			// Format the request via JSONP
			p.jsonp(p, p.query);
		}

		// Lets use JSONP if the method is 'get'
		if (p.method === 'get') {

			p.proxyHandler(p, function () {
				var url = createUrl(p.url, extend(p.query, p.data || {}));
				jsonp(url, callback, p.callbackID, p.timeout);
			});

			return;
		}
	}

	// Otherwise we're on to the old school, iframe hacks and JSONP
	if (p.form !== false) {
		var _ret = function () {

			// Add some additional query parameters to the URL
			// We're pretty stuffed if the endpoint doesn't like these
			p.query.redirect_uri = p.redirect_uri;
			p.query.state = JSON.stringify({ callback: p.callbackID });
			delete p.query.callback;

			var opts = void 0;

			if (typeof p.form === 'function') {

				// Format the request
				opts = p.form(p, p.query);
			}

			if (p.method === 'post' && opts !== false) {

				p.proxyHandler(p, function () {
					var url = createUrl(p.url, p.query);
					formpost(url, p.data, opts, callback, p.callbackID, p.timeout);
				});

				return {
					v: void 0
				};
			}
		}();

		if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
	}

	callback({ error: 'invalid_request' });
};

},{"../../events/globalCallback.js":24,"../../object/extend.js":29,"../../string/createUrl.js":38,"../../support/cors.js":45,"./formpost.js":10,"./jsonp.js":12,"./xhr.js":14}],14:[function(require,module,exports){
'use strict';

// XHR: uses CORS to make requests
var instanceOf = require('../../object/instanceOf.js');
var extract = require('../../string/extract.js');
var jsonParse = require('../../string/jsonParse.js');
var tryCatch = require('../../object/tryCatch.js');
var rewire = require('../../object/rewire.js');

var match_headers = /([a-z0-9\-]+):\s*(.*);?/gi;

module.exports = rewire(xhr);

function xhr(method, url, responseType, headers, data, callback) {

	var r = new XMLHttpRequest();

	// Make it CAPITAL
	method = method.toUpperCase();

	// Define the callback function
	r.onload = function () {
		// Response
		var response = r.response;

		// Was this text
		if (!response && (r.responseType === '' || r.responseType === 'text')) {
			response = r.responseText;
		}

		// Is this json?
		if (typeof response === 'string' && responseType === 'json') {

			// Set this to the json response
			// Fallback if the browser did not defined responseJSON...
			response = r.responseJSON || jsonParse(r.responseText || r.response);
		}

		var headers = extract(r.getAllResponseHeaders(), match_headers);
		headers.statusCode = r.status;

		callback(response, headers);
	};

	r.onerror = r.onload;

	// Should we add the query to the URL?
	if (method === 'GET' || method === 'DELETE') {
		data = null;
	} else if (data && typeof data !== 'string' && !instanceOf(data, window.FormData) && !instanceOf(data, window.File) && !instanceOf(data, window.Blob)) {
		// Loop through and add formData
		data = toFormData(data);
	}

	// Open the path, async
	r.open(method, url, true);

	// Set responseType if supported
	if ('responseType' in r) {

		tryCatch(function () {
			// Setting this to an unsupported value can result in a "SYNTAX_ERR: DOM Exception 12"
			r.responseType = responseType;
		});
	} else if (responseType === 'blob') {
		r.overrideMimeType('text/plain; charset=x-user-defined');
	}

	// Set any bespoke headers
	if (headers) {
		for (var x in headers) {
			r.setRequestHeader(x, headers[x]);
		}
	}

	r.send(data);

	return r;
}

function toFormData(data) {
	var f = new FormData();
	for (var x in data) {
		if (data.hasOwnProperty(x)) {
			if (instanceOf(data[x], window.HTMLInputElement) && 'files' in data[x]) {
				if (data[x].files.length > 0) {
					f.append(x, data[x].files[0]);
				}
			} else if (instanceOf(data[x], window.Blob)) {
				f.append(x, data[x], data.name);
			} else {
				f.append(x, data[x]);
			}
		}
	}
	return f;
}

},{"../../object/instanceOf.js":30,"../../object/rewire.js":35,"../../object/tryCatch.js":37,"../../string/extract.js":39,"../../string/jsonParse.js":40}],15:[function(require,module,exports){
'use strict';

var createElement = require('./createElement.js');

module.exports = function (tagName, prop) {
	var parent = arguments.length <= 2 || arguments[2] === undefined ? document.body : arguments[2];

	var elm = createElement(tagName, prop);
	parent.appendChild(elm);
	return elm;
};

},{"./createElement.js":17}],16:[function(require,module,exports){
'use strict';

var each = require('./each.js');

module.exports = function (elements, props) {
	return each(elements, function (element) {
		for (var x in props) {
			var prop = props[x];
			if (typeof prop === 'function') {
				element[x] = prop;
			} else {
				element.setAttribute(x, prop);
			}
		}
	});
};

},{"./each.js":19}],17:[function(require,module,exports){
'use strict';

var attr = require('./attr.js');

module.exports = function (tagName, attrs) {
	var elm = document.createElement(tagName);
	attr(elm, attrs);
	return elm;
};

},{"./attr.js":16}],18:[function(require,module,exports){
'use strict';

var instanceOf = require('../object/instanceOf.js');

module.exports = function (type, data) {
	var test = 'HTML' + (type || '').replace(/^[a-z]/, function (m) {
		return m.toUpperCase();
	}) + 'Element';

	if (!data) {
		return false;
	}

	if (window[test]) {
		return instanceOf(data, window[test]);
	} else if (window.Element) {
		return instanceOf(data, window.Element) && (!type || data.tagName && data.tagName.toLowerCase() === type);
	} else {
		return !(instanceOf(data, Object) || instanceOf(data, Array) || instanceOf(data, String) || instanceOf(data, Number)) && data.tagName && data.tagName.toLowerCase() === type;
	}
};

},{"../object/instanceOf.js":30}],19:[function(require,module,exports){
'use strict';

var isDom = require('./isDom.js');
var instanceOf = require('../object/instanceOf.js');
var toArray = require('../array/toArray.js');

module.exports = function (matches) {
	var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];


	if (isDom(matches)) {
		matches = [matches];
	} else if (typeof matches === 'string') {
		matches = document.querySelectorAll(matches);
	}

	if (!instanceOf(matches, Array)) {
		matches = toArray(matches);
	}

	if (callback) {
		matches.forEach(callback);
	}

	return matches;
};

},{"../array/toArray.js":4,"../object/instanceOf.js":30,"./isDom.js":21}],20:[function(require,module,exports){
'use strict';

var append = require('./append.js');
var param = require('../string/param.js');

module.exports = function (src) {

	var style = param({
		position: 'absolute',
		left: '-1000px',
		bottom: 0,
		height: '1px',
		width: '1px'
	}, ';', ':');

	return append('iframe', { src: src, style: style });
};

},{"../string/param.js":41,"./append.js":15}],21:[function(require,module,exports){
'use strict';

var instanceOf = require('../object/instanceOf.js');

var _HTMLElement = typeof HTMLElement !== 'undefined' ? HTMLElement : Element;
var _HTMLDocument = typeof HTMLDocument !== 'undefined' ? HTMLDocument : Document;
var _Window = window.constructor;

module.exports = function (test) {
	return instanceOf(test, _HTMLElement) || instanceOf(test, _HTMLDocument) || instanceOf(test, _Window);
};

},{"../object/instanceOf.js":30}],22:[function(require,module,exports){
'use strict';

// IE does not support `new Event()`
// See https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events for details
var dict = { bubbles: true, cancelable: true };

var createEvent = function createEvent(eventname) {
	var options = arguments.length <= 1 || arguments[1] === undefined ? dict : arguments[1];
	return new Event(eventname, options);
};

try {
	createEvent('test');
} catch (e) {
	createEvent = function createEvent(eventname) {
		var options = arguments.length <= 1 || arguments[1] === undefined ? dict : arguments[1];

		var e = document.createEvent('Event');
		e.initEvent(eventname, !!options.bubbles, !!options.cancelable);
		return e;
	};
}

module.exports = createEvent;

},{}],23:[function(require,module,exports){
'use strict';

// on.js
// Listen to events, this is a wrapper for addEventListener
var each = require('../dom/each.js');
var createEvent = require('./createEvent.js');

// Return
module.exports = function (elements, eventname) {
  return each(elements, function (el) {
    return el.dispatchEvent(createEvent(eventname));
  });
};

},{"../dom/each.js":19,"./createEvent.js":22}],24:[function(require,module,exports){
'use strict';

// Global Events
// Attach the callback to the window object
// Return its unique reference
var random = require('../string/random.js');

module.exports = function (callback, guid) {
	var prefix = arguments.length <= 2 || arguments[2] === undefined ? '_tricks_' : arguments[2];


	// If the guid has not been supplied then create a new one.
	guid = guid || prefix + random();

	// Define the callback function
	window[guid] = handle.bind(null, guid, callback);

	return guid;
};

function handle(guid, callback) {
	for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
		args[_key - 2] = arguments[_key];
	}

	callback.apply(undefined, args) && delete window[guid];
}

},{"../string/random.js":44}],25:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// on.js
// Listen to events, this is a wrapper for addEventListener

var each = require('../dom/each.js');
var SEPERATOR = /[\s\,]+/;

// See https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md#feature-detection
var supportsPassive = false;
try {
	var opts = Object.defineProperty({}, 'passive', {
		get: function get() {
			supportsPassive = true;
		}
	});
	window.addEventListener('test', null, opts);
} catch (e) {
	// Continue
}

module.exports = function (elements, eventnames, callback) {
	var options = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];


	if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object' && options.passive && !supportsPassive) {
		// Override the passive mark
		options = false;
	}

	eventnames = eventnames.split(SEPERATOR);
	return each(elements, function (el) {
		return eventnames.forEach(function (eventname) {
			return el.addEventListener(eventname, callback, options);
		});
	});
};

},{"../dom/each.js":19}],26:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// Makes it easier to assign parameters, where some are optional
// @param o object
// @param a arguments
module.exports = function (o, args) {

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
	if (args.length === 1 && _typeof(args[0]) === 'object' && o[x] !== 'o!') {

		// Could this object still belong to a property?
		// Check the object keys if they match any of the property keys
		for (x in args[0]) {
			if (o.hasOwnProperty(x)) {
				// Does this key exist in the property list?
				if (x in o) {
					// Yes this key does exist so its most likely this function has been invoked with an object parameter
					// Return first argument as the hash of all arguments
					return args[0];
				}
			}
		}
	}

	// Else loop through and account for the missing ones.
	for (x in o) {
		if (o.hasOwnProperty(x)) {

			t = _typeof(args[i]);

			if (typeof o[x] === 'function' && o[x].test(args[i]) || typeof o[x] === 'string' && (o[x].indexOf('s') > -1 && t === 'string' || o[x].indexOf('o') > -1 && t === 'object' || o[x].indexOf('i') > -1 && t === 'number' || o[x].indexOf('a') > -1 && t === 'object' || o[x].indexOf('f') > -1 && t === 'function')) {
				p[x] = args[i++];
			} else if (typeof o[x] === 'string' && o[x].indexOf('!') > -1) {
				return false;
			}
		}
	}

	return p;
};

},{}],27:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var isBinary = require('./isBinary.js');

// Create a clone of an object
module.exports = function clone(obj) {
	// Does not clone DOM elements, nor Binary data, e.g. Blobs, Filelists
	if (obj === null || (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object' || obj instanceof Date || 'nodeName' in obj || isBinary(obj) || typeof FormData === 'function' && obj instanceof FormData) {
		return obj;
	}

	if (Array.isArray(obj)) {
		// Clone each item in the array
		return obj.map(clone.bind(this));
	}

	// But does clone everything else.
	var _clone = {};
	for (var x in obj) {
		_clone[x] = clone(obj[x]);
	}

	return _clone;
};

},{"./isBinary.js":31}],28:[function(require,module,exports){
"use strict";

// Return all the properties in 'a' which aren't in 'b';
module.exports = function (a, b) {
	if (a || !b) {
		var r = {};
		for (var x in a) {
			// is this a custom property?
			if (!(x in b)) {
				r[x] = a[x];
			}
		}
		return r;
	}
	return a;
};

},{}],29:[function(require,module,exports){
'use strict';

var instanceOf = require('./instanceOf.js');

module.exports = function extend(r) {
	for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
		args[_key - 1] = arguments[_key];
	}

	args.forEach(function (o) {
		if (Array.isArray(r) && Array.isArray(o)) {
			Array.prototype.push.apply(r, o);
		} else if (instanceOf(r, Object) && instanceOf(o, Object) && r !== o) {
			for (var x in o) {
				r[x] = extend(r[x], o[x]);
			}
		} else if (Array.isArray(o)) {
			// Clone it
			r = o.slice(0);
		} else {
			r = o;
		}
	});
	return r;
};

},{"./instanceOf.js":30}],30:[function(require,module,exports){
"use strict";

module.exports = function (test, root) {
  return root && test instanceof root;
};

},{}],31:[function(require,module,exports){
'use strict';

var instanceOf = require('./instanceOf.js');

module.exports = function (data) {
	return instanceOf(data, Object) && (instanceOf(data, typeof HTMLInputElement !== 'undefined' ? HTMLInputElement : undefined) && data.type === 'file' || instanceOf(data, typeof HTMLInput !== 'undefined' ? HTMLInput : undefined) && data.type === 'file' || instanceOf(data, typeof FileList !== 'undefined' ? FileList : undefined) || instanceOf(data, typeof File !== 'undefined' ? File : undefined) || instanceOf(data, typeof Blob !== 'undefined' ? Blob : undefined));
};

},{"./instanceOf.js":30}],32:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

module.exports = function (obj) {

	// Scalar
	if (!obj) return true;

	// Array
	if (Array.isArray(obj)) {
		return !obj.length;
	} else if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object') {
		// Object
		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {
				return false;
			}
		}
	}

	return true;
};

},{}],33:[function(require,module,exports){
'use strict';

// Extend an object
var extend = require('./extend.js');

module.exports = function () {
	for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
		args[_key] = arguments[_key];
	}

	args.unshift({});
	return extend.apply(undefined, args);
};

},{"./extend.js":29}],34:[function(require,module,exports){
'use strict';

// Pubsub extension
// A contructor superclass for adding event menthods, on, off, emit.
var setImmediate = require('../time/setImmediate.js');

var separator = /[\s\,]+/;

module.exports = function () {

	// If this doesn't support getPrototype then we can't get prototype.events of the parent
	// So lets get the current instance events, and add those to a parent property
	this.parent = {
		events: this.events,
		findEvents: this.findEvents,
		parent: this.parent,
		utils: this.utils
	};

	this.events = {};

	this.off = off;
	this.on = on;
	this.emit = emit;
	this.emitAfter = emitAfter;
	this.findEvents = findEvents;

	return this;
};

// On, subscribe to events
// @param evt   string
// @param callback  function
function on(evt, callback) {
	var _this2 = this;

	if (callback && typeof callback === 'function') {
		evt.split(separator).forEach(function (name) {
			// Has this event already been fired on this instance?
			_this2.events[name] = [callback].concat(_this2.events[name] || []);
		});
	}

	return this;
}

// Off, unsubscribe to events
// @param evt   string
// @param callback  function
function off(evt, callback) {

	this.findEvents(evt, function (name, index) {
		if (!callback || this.events[name][index] === callback) {
			this.events[name][index] = null;
		}
	});

	return this;
}

// Emit
// Triggers any subscribed events
function emit(evt) {
	for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
		args[_key - 1] = arguments[_key];
	}

	// Append the eventname to the end of the arguments
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
}

// Easy functions
function emitAfter() {
	var _this3 = this;

	for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
		args[_key2] = arguments[_key2];
	}

	setImmediate(function () {
		_this3.emit.apply(_this3, args);
	});

	return this;
}

function findEvents(evt, callback) {

	var a = evt.split(separator);

	for (var name in this.events) {
		if (this.events.hasOwnProperty(name)) {

			if (a.indexOf(name) > -1) {

				this.events[name].forEach(triggerCallback.bind(this, name, callback));
			}
		}
	}
}

function triggerCallback(name, callback, handler, i) {
	// Does the event handler exist?
	if (handler) {
		// Emit on the local instance of this
		callback.call(this, name, i);
	}
}

},{"../time/setImmediate.js":46}],35:[function(require,module,exports){
"use strict";

// Rewire functions
module.exports = function (fn) {
	var f = function f() {
		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		return f.fn.apply(null, args);
	};
	f.fn = fn;
	return f;
};

},{}],36:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// Then
// Create a Promise instance which can be returned by a function
var setImmediate = require('../time/setImmediate.js');

/*!
 **  Thenable -- Embeddable Minimum Strictly-Compliant Promises/A+ 1.1.1 Thenable
 **  Copyright (c) 2013-2014 Ralf S. Engelschall <http://engelschall.com>
 **  Licensed under The MIT License <http://opensource.org/licenses/MIT>
 **  Source-Code distributed on <http://github.com/rse/thenable>
 */

/*  promise states [Promises/A+ 2.1]  */
var STATE_PENDING = 0; /*  [Promises/A+ 2.1.1]  */
var STATE_FULFILLED = 1; /*  [Promises/A+ 2.1.2]  */
var STATE_REJECTED = 2; /*  [Promises/A+ 2.1.3]  */

/*  promise object constructor  */
module.exports = api;

function api(executor) {
	/*  optionally support non-constructor/plain-function call  */
	if (!(this instanceof api)) return new api(executor);

	/*  initialize object  */
	this.id = 'Thenable/1.0.6';
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
	if (typeof executor === 'function') executor.call(this, this.fulfill.bind(this), this.reject.bind(this));
}

/*  promise API methods  */
api.prototype = {
	/*  promise resolving methods  */
	fulfill: function fulfill(value) {
		return deliver(this, STATE_FULFILLED, 'fulfillValue', value);
	},
	reject: function reject(value) {
		return deliver(this, STATE_REJECTED, 'rejectReason', value);
	},


	/*  'The then Method' [Promises/A+ 1.1, 1.2, 2.2]  */
	then: function then(onFulfilled, onRejected) {
		var curr = this;
		var next = new api(); /*  [Promises/A+ 2.2.7]  */
		curr.onFulfilled.push(resolver(onFulfilled, next, 'fulfill')); /*  [Promises/A+ 2.2.2/2.2.6]  */
		curr.onRejected.push(resolver(onRejected, next, 'reject')); /*  [Promises/A+ 2.2.3/2.2.6]  */
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
	if (curr.state === STATE_FULFILLED) execute_handlers(curr, 'onFulfilled', curr.fulfillValue);else if (curr.state === STATE_REJECTED) execute_handlers(curr, 'onRejected', curr.rejectReason);
};

/*  execute particular set of handlers  */
var execute_handlers = function execute_handlers(curr, name, value) {

	/*  short-circuit processing  */
	if (curr[name].length === 0) return;

	/*  iterate over all handlers, exactly once  */
	var handlers = curr[name];
	curr[name] = []; /*  [Promises/A+ 2.2.2.3, 2.2.3.3]  */
	setImmediate(function () {
		for (var i = 0; i < handlers.length; i++) {
			handlers[i](value);
		} /*  [Promises/A+ 2.2.5]  */
	});
};

/*  generate a resolver function  */
var resolver = function resolver(cb, next, method) {
	return function (value) {
		if (typeof cb !== 'function') /*  [Promises/A+ 2.2.1, 2.2.7.3, 2.2.7.4]  */
			next[method].call(next, value); /*  [Promises/A+ 2.2.7.3, 2.2.7.4]  */
		else {
				var result = void 0;
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

/*  'Promise Resolution Procedure'  */ /*  [Promises/A+ 2.3]  */
var resolve = function resolve(promise, x) {
	/*  sanity check arguments  */ /*  [Promises/A+ 2.3.1]  */
	if (promise === x || promise.proxy === x) {
		promise.reject(new TypeError('cannot resolve promise with itself'));
		return;
	}

	/*  surgically check for a 'then' method
 	(mainly to just call the 'getter' of 'then' only once)  */
	var then = void 0;
	if ((typeof x === 'undefined' ? 'undefined' : _typeof(x)) === 'object' && x !== null || typeof x === 'function') {
		try {
			then = x.then;
		} /*  [Promises/A+ 2.3.3.1, 3.5]  */
		catch (e) {
			promise.reject(e); /*  [Promises/A+ 2.3.3.2]  */
			return;
		}
	}

	/*  handle own Thenables    [Promises/A+ 2.3.2]
 	and similar 'thenables' [Promises/A+ 2.3.3]  */
	if (typeof then === 'function') {
		var _ret = function () {
			var resolved = false;
			try {
				/*  call retrieved 'then' method */ /*  [Promises/A+ 2.3.3.3]  */
				then.call(x,
				/*  resolvePromise  */ /*  [Promises/A+ 2.3.3.3.1]  */
				function (y) {
					if (resolved) return;resolved = true; /*  [Promises/A+ 2.3.3.3.3]  */
					if (y === x) /*  [Promises/A+ 3.6]  */
						promise.reject(new TypeError('circular thenable chain'));else resolve(promise, y);
				},

				/*  rejectPromise  */ /*  [Promises/A+ 2.3.3.3.2]  */
				function (r) {
					if (resolved) return;resolved = true; /*  [Promises/A+ 2.3.3.3.3]  */
					promise.reject(r);
				});
			} catch (e) {
				if (!resolved) /*  [Promises/A+ 2.3.3.3.3]  */
					promise.reject(e); /*  [Promises/A+ 2.3.3.3.4]  */
			}
			return {
				v: void 0
			};
		}();

		if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
	}

	/*  handle other values  */
	promise.fulfill(x); /*  [Promises/A+ 2.3.4, 2.3.3.4]  */
};

},{"../time/setImmediate.js":46}],37:[function(require,module,exports){
"use strict";

module.exports = function (fn) {
	try {
		return fn.call(null);
	} catch (e) {
		// Continue
	}
};

},{}],38:[function(require,module,exports){
'use strict';

var querystringify = require('./querystringify.js');
var isEmpty = require('../object/isEmpty.js');

module.exports = function (url, params, formatFunction) {

	var reg = void 0;

	if (params) {
		// Set default formatting function
		formatFunction = formatFunction || encodeURIComponent;

		// Override the items in the URL which already exist
		for (var x in params) {
			var str = '([\\?\\&])' + x + '=[^\\&]*';
			reg = new RegExp(str);
			if (url.match(reg)) {
				url = url.replace(reg, '$1' + x + '=' + formatFunction(params[x]));
				delete params[x];
			}
		}
	}

	if (!isEmpty(params)) {
		return url + (url.indexOf('?') > -1 ? '&' : '?') + querystringify(params, formatFunction);
	}

	return url;
};

},{"../object/isEmpty.js":32,"./querystringify.js":43}],39:[function(require,module,exports){
"use strict";

// Extract
// Extract the parameters of an URL string
// @param string s, string to decode

module.exports = function (str, match_params) {
	var formatFunction = arguments.length <= 2 || arguments[2] === undefined ? function (x) {
		return x;
	} : arguments[2];

	var a = {};
	var m = void 0;
	while (m = match_params.exec(str)) {
		a[m[1]] = formatFunction(m[2]);
	}
	return a;
};

},{}],40:[function(require,module,exports){
'use strict';

var tryCatch = require('../object/tryCatch.js');
module.exports = function (str) {
  return tryCatch(function () {
    return JSON.parse(str);
  });
};

},{"../object/tryCatch.js":37}],41:[function(require,module,exports){
'use strict';

// Param
// Explode/encode the parameters of an URL string/object
// @param string s, string to decode
module.exports = function (hash) {
	var delimiter = arguments.length <= 1 || arguments[1] === undefined ? '&' : arguments[1];
	var seperator = arguments.length <= 2 || arguments[2] === undefined ? '=' : arguments[2];
	var formatFunction = arguments.length <= 3 || arguments[3] === undefined ? function (o) {
		return o;
	} : arguments[3];
	return Object.keys(hash).map(function (name) {
		var value = formatFunction(hash[name]);
		return name + (value !== null ? seperator + value : '');
	}).join(delimiter);
};

},{}],42:[function(require,module,exports){
'use strict';

// Create a Query string
var extract = require('./extract.js');

var trim_left = /^[\#\?]/;
var match_params = /([^=\/\&]+)=([^\&]+)/g;

module.exports = function (str) {
	var formatFunction = arguments.length <= 1 || arguments[1] === undefined ? decodeURIComponent : arguments[1];

	str = str.replace(trim_left, '');
	return extract(str, match_params, formatFunction);
};

},{"./extract.js":39}],43:[function(require,module,exports){
'use strict';

// Create a Query string
var param = require('./param.js');
var fn = function fn(value) {
  return value === '?' ? '?' : encodeURIComponent(value);
};

module.exports = function (o) {
  var formatter = arguments.length <= 1 || arguments[1] === undefined ? fn : arguments[1];
  return param(o, '&', '=', formatter);
};

},{"./param.js":41}],44:[function(require,module,exports){
"use strict";

module.exports = function () {
  return parseInt(Math.random() * 1e12, 10).toString(36);
};

},{}],45:[function(require,module,exports){
'use strict';

module.exports = 'withCredentials' in new XMLHttpRequest();

},{}],46:[function(require,module,exports){
'use strict';

module.exports = typeof setImmediate === 'function' ? setImmediate : function (cb) {
  return setTimeout(cb, 0);
};

},{}],47:[function(require,module,exports){
'use strict';

// Close a window
module.exports = function (window) {

	// Is this window within an Iframe?
	if (window.frameElement) {
		window.parent.document.body.removeChild(window.frameElement);
	} else {
		// Close this current window
		try {
			window.close();
		} catch (e) {}
		// Continue


		// IOS bug wont let us close a popup if still loading
		if (window.addEventListener) {
			window.addEventListener('load', function () {
				return window.close();
			});
		}
	}
};

},{}],48:[function(require,module,exports){
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

// popup
// Easy options as a hash
var param = require('../string/param.js');

var documentElement = document.documentElement;
var dimensions = [['Top', 'Height'], ['Left', 'Width']];

module.exports = function (url, target) {
	var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];


	// centers the popup correctly to the current display of a multi-screen display.
	dimensions.forEach(generatePosition.bind(options));

	// Open
	return window.open(url, target, param(options, ','));
};

function generatePosition(_ref) {
	var _ref2 = _slicedToArray(_ref, 2);

	var Position = _ref2[0];
	var Dimension = _ref2[1];

	var position = Position.toLowerCase();
	var dimension = Dimension.toLowerCase();
	if (this[dimension] && !(position in this)) {
		var dualScreenPos = window['screen' + Position] !== undefined ? window['screen' + Position] : screen[position];
		var d = screen[dimension] || window['inner' + Dimension] || documentElement['client' + Dimension];
		this[position] = parseInt((d - this[dimension]) / 2, 10) + dualScreenPos;
	}
}

},{"../string/param.js":41}],49:[function(require,module,exports){
'use strict';

module.exports = function (path) {

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
				// Return clone for IE compatibility view.
				return a.cloneNode(false);
			}
};

},{}]},{},[1]);
