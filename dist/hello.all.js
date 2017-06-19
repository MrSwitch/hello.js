(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

// Services
require('./modules/dropbox.js');
require('./modules/facebook.js');
require('./modules/flickr.js');
require('./modules/foursquare.js');
require('./modules/github.js');
require('./modules/google.js');
require('./modules/instagram.js');
require('./modules/joinme.js');
require('./modules/linkedin.js');
require('./modules/soundcloud.js');
require('./modules/twitter.js');
require('./modules/vk.js');
require('./modules/windows.js');
require('./modules/yahoo.js');

// Environment tweaks
require('./hello.phonegap.js');
require('./hello.chromeapp.js');

// Build environments
require('./hello.amd.js');

// Export HelloJS
module.exports = require('./hello.js');

},{"./hello.amd.js":2,"./hello.chromeapp.js":3,"./hello.js":4,"./hello.phonegap.js":5,"./modules/dropbox.js":6,"./modules/facebook.js":7,"./modules/flickr.js":8,"./modules/foursquare.js":9,"./modules/github.js":10,"./modules/google.js":11,"./modules/instagram.js":12,"./modules/joinme.js":13,"./modules/linkedin.js":14,"./modules/soundcloud.js":15,"./modules/twitter.js":16,"./modules/vk.js":17,"./modules/windows.js":18,"./modules/yahoo.js":19}],2:[function(require,module,exports){
'use strict';

// Register as anonymous AMD module
if (typeof define === 'function' && define.amd) {
	define(function () {
		return hello;
	});
}

},{}],3:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// Script to support ChromeApps
// This overides the hello.utils.popup method to support chrome.identity.launchWebAuthFlow
// See https://developer.chrome.com/apps/app_identity#non

var URL = require('tricks/window/url');
var hello = require('./hello');

// Is this a chrome app?
if ((typeof chrome === 'undefined' ? 'undefined' : _typeof(chrome)) === 'object' && _typeof(chrome.identity) === 'object' && chrome.identity.launchWebAuthFlow) {
	var _cache;

	(function () {

		// Open function
		var _open = function _open(url, interactive) {

			// Launch
			var ref = {
				closed: false
			};

			// Launch the webAuthFlow
			chrome.identity.launchWebAuthFlow({
				url: url,
				interactive: interactive
			}, function (responseUrl) {

				// Did the user cancel this prematurely
				if (responseUrl === undefined) {
					ref.closed = true;
					return;
				}

				// Split appart the URL
				var a = URL(responseUrl);

				// The location can be augmented in to a location object like so...
				// We dont have window operations on the popup so lets create some
				var _popup = {
					location: {

						// Change the location of the popup
						assign: function assign(url) {

							// If there is a secondary reassign
							// In the case of OAuth1
							// Trigger this in non-interactive mode.
							_open(url, false);
						},

						search: a.search,
						hash: a.hash,
						href: a.href
					},
					close: function close() {}
				};

				// Then this URL contains information which HelloJS must process
				// URL string
				// Window - any action such as window relocation goes here
				// Opener - the parent window which opened this, aka this script

				hello.utils.responseHandler(_popup, window);
			});

			// Return the reference
			return ref;
		};

		// Swap the popup method
		hello.utils.popup = function (url) {

			return _open(url, true);
		};

		// Swap the hidden iframe method
		hello.utils.iframe = function (url) {

			_open(url, false);
		};

		// Swap the request_cors method
		hello.utils.request_cors = function (callback) {

			callback();

			// Always run as CORS

			return true;
		};

		// Swap the storage method
		_cache = {};

		chrome.storage.local.get('hello', function (r) {
			// Update the cache
			_cache = r.hello || {};
		});

		hello.utils.store = function (name, value) {

			// Get all
			if (arguments.length === 0) {
				return _cache;
			}

			// Get
			if (arguments.length === 1) {
				return _cache[name] || null;
			}

			// Set
			if (value) {
				_cache[name] = value;
				chrome.storage.local.set({ hello: _cache });
				return value;
			}

			// Delete
			if (value === null) {
				delete _cache[name];
				chrome.storage.local.set({ hello: _cache });
				return null;
			}
		};
	})();
}

},{"./hello":4,"tricks/window/url":69}],4:[function(require,module,exports){
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

},{"tricks/array/diff":20,"tricks/array/unique":23,"tricks/browser/agent/localStorage":26,"tricks/dom/hiddenFrame":38,"tricks/events/globalCallback":42,"tricks/http/request":31,"tricks/object/args":44,"tricks/object/clone":45,"tricks/object/diffKey":46,"tricks/object/extend":47,"tricks/object/isEmpty":51,"tricks/object/merge":52,"tricks/object/pubsub":53,"tricks/object/then":55,"tricks/string/createUrl":58,"tricks/string/queryparse":62,"tricks/window/close":67,"tricks/window/popup":68,"tricks/window/url":69}],5:[function(require,module,exports){
'use strict';

// Phonegap override for hello.phonegap.js
var URL = require('tricks/window/url');
var hello = require('./hello');

(function () {

	// Is this a phonegap implementation?
	if (!(/^file:\/{3}[^\/]/.test(window.location.href) && window.cordova)) {
		// Cordova is not included.
		return;
	}

	// Augment the hidden iframe method
	hello.utils.iframe = function (url, redirectUri) {
		hello.utils.popup(url, redirectUri, { hidden: 'yes' });
	};

	// Augment the popup
	var utilPopup = hello.utils.popup;

	// Replace popup
	hello.utils.popup = function (url, redirectUri, options) {

		// Run the standard
		var popup = utilPopup.call(this, url, redirectUri, options);

		// Create a function for reopening the popup, and assigning events to the new popup object
		// PhoneGap support
		// Add an event listener to listen to the change in the popup windows URL
		// This must appear before popup.focus();
		try {
			if (popup && popup.addEventListener) {

				// Get the origin of the redirect URI

				var a = URL(redirectUri);
				var redirectUriOrigin = a.origin || a.protocol + '//' + a.hostname;

				// Listen to changes in the InAppBrowser window

				popup.addEventListener('loadstart', function (e) {

					var url = e.url;

					// Is this the path, as given by the redirectUri?
					// Check the new URL agains the redirectUriOrigin.
					// According to #63 a user could click 'cancel' in some dialog boxes ....
					// The popup redirects to another page with the same origin, yet we still wish it to close.

					if (url.indexOf(redirectUriOrigin) !== 0) {
						return;
					}

					// Split appart the URL
					var a = URL(url);

					// We dont have window operations on the popup so lets create some
					// The location can be augmented in to a location object like so...

					var _popup = {
						location: {
							// Change the location of the popup
							assign: function assign(location) {

								// Unfourtunatly an app is may not change the location of a InAppBrowser window.
								// So to shim this, just open a new one.
								popup.executeScript({ code: 'window.location.href = "' + location + ';"' });
							},

							search: a.search,
							hash: a.hash,
							href: a.href
						},
						close: function close() {
							if (popup.close) {
								popup.close();
								try {
									popup.closed = true;
								} catch (_e) {}
							}
						}
					};

					// Then this URL contains information which HelloJS must process
					// URL string
					// Window - any action such as window relocation goes here
					// Opener - the parent window which opened this, aka this script

					hello.utils.responseHandler(_popup, window);
				});
			}
		} catch (e) {}

		return popup;
	};
})();

},{"./hello":4,"tricks/window/url":69}],6:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var hello = require('../hello.js');
var toBlob = require('tricks/object/toBlob');
var querystringify = require('tricks/string/querystringify');

(function (hello) {

	// OAuth1
	var OAuth1Settings = {
		version: '1.0',
		auth: 'https://www.dropbox.com/1/oauth/authorize',
		request: 'https://api.dropbox.com/1/oauth/request_token',
		token: 'https://api.dropbox.com/1/oauth/access_token'
	};

	// OAuth2 Settings
	var OAuth2Settings = {
		version: 2,
		auth: 'https://www.dropbox.com/1/oauth2/authorize',
		grant: 'https://api.dropbox.com/1/oauth2/token'
	};

	// Initiate the Dropbox module
	hello.init({

		dropbox: {

			name: 'Dropbox',

			oauth: OAuth2Settings,

			login: function login(p) {
				// OAuth2 non-standard adjustments
				p.qs.scope = '';

				// Should this be run as OAuth1?
				// If the redirect_uri is is HTTP (non-secure) then its required to revert to the OAuth1 endpoints
				var redirect = decodeURIComponent(p.qs.redirect_uri);
				if (redirect.indexOf('http:') === 0 && redirect.indexOf('http://localhost/') !== 0) {

					// Override the dropbox OAuth settings.
					hello.services.dropbox.oauth = OAuth1Settings;
				} else {
					// Override the dropbox OAuth settings.
					hello.services.dropbox.oauth = OAuth2Settings;
				}

				// The dropbox login window is a different size
				p.options.popup.width = 1000;
				p.options.popup.height = 1000;
			},

			/*
   	Dropbox does not allow insecure HTTP URI's in the redirect_uri field
   	...otherwise I'd love to use OAuth2
   		Follow request https://forums.dropbox.com/topic.php?id=106505
   		p.qs.response_type = 'code';
   	oauth: {
   		version: 2,
   		auth: 'https://www.dropbox.com/1/oauth2/authorize',
   		grant: 'https://api.dropbox.com/1/oauth2/token'
   	}
   */

			// API Base URL
			base: 'https://api.dropbox.com/1/',

			// Bespoke setting: this is states whether to use the custom environment of Dropbox or to use their own environment
			// Because it's notoriously difficult for Dropbox too provide access from other webservices, this defaults to Sandbox
			root: 'sandbox',

			// Map GET requests
			get: {
				me: 'account/info',

				// Https://www.dropbox.com/developers/core/docs#metadata
				'me/files': req('metadata/auto/@{parent|}'),
				'me/folder': req('metadata/auto/@{id}'),
				'me/folders': req('metadata/auto/'),

				'default': function _default(p, callback) {
					if (p.path.match('https://api-content.dropbox.com/1/files/')) {
						// This is a file, return binary data
						p.method = 'blob';
					}

					callback(p.path);
				}
			},

			post: {
				'me/files': function meFiles(p, callback) {

					var path = p.data.parent;
					var fileName = p.data.name;

					p.data = {
						file: p.data.file
					};

					// Does this have a data-uri to upload as a file?
					if (typeof p.data.file === 'string') {
						p.data.file = toBlob(p.data.file);
					}

					callback('https://api-content.dropbox.com/1/files_put/auto/' + path + '/' + fileName);
				},

				'me/folders': function meFolders(p, callback) {

					var name = p.data.name;
					p.data = {};

					callback('fileops/create_folder?root=@{root|sandbox}&' + querystringify({
						path: name
					}));
				}
			},

			// Map DELETE requests
			del: {
				'me/files': 'fileops/delete?root=@{root|sandbox}&path=@{id}',
				'me/folder': 'fileops/delete?root=@{root|sandbox}&path=@{id}'
			},

			wrap: {
				me: function me(o) {
					formatError(o);
					if (!o.uid) {
						return o;
					}

					o.name = o.display_name;
					var m = o.name.split(' ');
					o.first_name = m.shift();
					o.last_name = m.join(' ');
					o.id = o.uid;
					delete o.uid;
					delete o.display_name;
					return o;
				},

				'default': function _default(o, headers, req) {
					formatError(o);
					if (o.is_dir && o.contents) {
						o.data = o.contents;
						delete o.contents;

						o.data.forEach(function (item) {
							item.root = o.root;
							formatFile(item, headers, req);
						});
					}

					formatFile(o, headers, req);

					if (o.is_deleted) {
						o.success = true;
					}

					return o;
				}
			},

			// Doesn't return the CORS headers
			xhr: function xhr(p) {

				// The proxy supports allow-cross-origin-resource
				// Alas that's the only thing we're using.
				if (p.data && p.data.file) {
					var file = p.data.file;
					if (file) {
						if (file.files) {
							p.data = file.files[0];
						} else {
							p.data = file;
						}
					}
				}

				if (p.method === 'delete') {
					p.method = 'post';
				}

				return true;
			},

			form: function form(p, qs) {
				delete qs.state;
				delete qs.redirect_uri;
			}
		}
	});

	function formatError(o) {
		if (o && 'error' in o) {
			o.error = {
				code: 'server_error',
				message: o.error.message || o.error
			};
		}
	}

	function formatFile(o, headers, req) {

		if ((typeof o === 'undefined' ? 'undefined' : _typeof(o)) !== 'object' || typeof Blob !== 'undefined' && o instanceof Blob || typeof ArrayBuffer !== 'undefined' && o instanceof ArrayBuffer) {
			// This is a file, let it through unformatted
			return;
		}

		if ('error' in o) {
			return;
		}

		var path = (o.root !== 'app_folder' ? o.root : '') + o.path.replace(/\&/g, '%26');
		path = path.replace(/^\//, '');
		if (o.thumb_exists) {
			o.thumbnail = req.oauth_proxy + '?path=' + encodeURIComponent('https://api-content.dropbox.com/1/thumbnails/auto/' + path + '?format=jpeg&size=m') + '&access_token=' + req.options.access_token;
		}

		o.type = o.is_dir ? 'folder' : o.mime_type;
		o.name = o.path.replace(/.*\//g, '');
		if (o.is_dir) {
			o.files = path.replace(/^\//, '');
		} else {
			o.downloadLink = hello.settings.oauth_proxy + '?path=' + encodeURIComponent('https://api-content.dropbox.com/1/files/auto/' + path) + '&access_token=' + req.options.access_token;
			o.file = 'https://api-content.dropbox.com/1/files/auto/' + path;
		}

		if (!o.id) {
			o.id = o.path.replace(/^\//, '');
		}

		// O.media = 'https://api-content.dropbox.com/1/files/' + path;
	}

	function req(str) {
		return function (p, cb) {
			delete p.query.limit;
			cb(str);
		};
	}
})(hello);

},{"../hello.js":4,"tricks/object/toBlob":56,"tricks/string/querystringify":63}],7:[function(require,module,exports){
'use strict';

var hello = require('../hello.js');

var globalCallback = require('tricks/events/globalCallback');
var hasBinary = require('tricks/object/hasBinary');
var querystringify = require('tricks/string/querystringify');
var toBlob = require('tricks/object/toBlob');

(function (hello) {
	// For APIs, once a version is no longer usable, any calls made to it will be defaulted to the next oldest usable version.
	// So we explicitly state it.
	var version = 'v2.9';

	hello.init({

		facebook: {

			name: 'Facebook',

			// SEE https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow
			oauth: {
				version: 2,
				auth: 'https://www.facebook.com/' + version + '/dialog/oauth/',
				grant: 'https://graph.facebook.com/oauth/access_token'
			},

			// Authorization scopes
			scope: {
				basic: 'public_profile',
				email: 'email',
				share: 'user_posts',
				birthday: 'user_birthday',
				events: 'user_events',
				photos: 'user_photos',
				videos: 'user_videos',
				friends: 'user_friends',
				files: 'user_photos,user_videos',
				publish_files: 'user_photos,user_videos,publish_actions',
				publish: 'publish_actions',

				// Deprecated in v2.0
				// Create_event	: 'create_event',

				offline_access: ''
			},

			// Refresh the access_token
			refresh: false,

			login: function login(p) {

				// Reauthenticate
				// https://developers.facebook.com/docs/facebook-login/reauthentication
				if (p.options.force) {
					p.qs.auth_type = 'reauthenticate';
				}

				// Set the display value
				p.qs.display = p.options.display || 'popup';
			},

			logout: function logout(callback, options) {
				// Assign callback to a global handler
				var callbackID = globalCallback(callback);
				var redirect = encodeURIComponent(hello.settings.redirect_uri + '?' + querystringify({ callback: callbackID, result: JSON.stringify({ force: true }), state: '{}' }));
				var token = (options.authResponse || {}).access_token;
				hello.utils.iframe('https://www.facebook.com/logout.php?next=' + redirect + '&access_token=' + token);

				// Possible responses:
				// String URL	- hello.logout should handle the logout
				// Undefined	- this function will handle the callback
				// True - throw a success, this callback isn't handling the callback
				// False - throw a error
				if (!token) {
					// If there isn't a token, the above wont return a response, so lets trigger a response
					return false;
				}
			},

			// API Base URL
			base: 'https://graph.facebook.com/' + version + '/',

			// Map GET requests
			get: {
				me: 'me?fields=email,first_name,last_name,name,timezone,verified',
				'me/friends': 'me/friends',
				'me/following': 'me/friends',
				'me/followers': 'me/friends',
				'me/share': 'me/feed',
				'me/like': 'me/likes',
				'me/files': 'me/albums',
				'me/albums': 'me/albums?fields=cover_photo,name',
				'me/album': '@{id}/photos?fields=picture',
				'me/photos': 'me/photos',
				'me/photo': '@{id}',
				'friend/albums': '@{id}/albums',
				'friend/photos': '@{id}/photos'

				// Pagination
				// Https://developers.facebook.com/docs/reference/api/pagination/
			},

			// Map POST requests
			post: {
				'me/share': 'me/feed',
				'me/photo': '@{id}'

				// Https://developers.facebook.com/docs/graph-api/reference/v2.2/object/likes/
			},

			wrap: {
				me: formatUser,
				'me/friends': formatFriends,
				'me/following': formatFriends,
				'me/followers': formatFriends,
				'me/albums': format,
				'me/photos': format,
				'me/files': format,
				'default': format
			},

			// Special requirements for handling XHR
			xhr: function xhr(p, qs) {
				if (p.method === 'get' || p.method === 'post') {
					qs.suppress_response_codes = true;
				}

				// Is this a post with a data-uri?
				if (p.method === 'post' && p.data && typeof p.data.file === 'string') {
					// Convert the Data-URI to a Blob
					p.data.file = toBlob(p.data.file);
				}

				return true;
			},

			// Special requirements for handling JSONP fallback
			jsonp: function jsonp(p, qs) {
				var m = p.method;
				if (m !== 'get' && !hasBinary(p.data)) {
					p.data.method = m;
					p.method = 'get';
				} else if (p.method === 'delete') {
					qs.method = 'delete';
					p.method = 'post';
				}
			},

			// Special requirements for iframe form hack
			form: function form(p) {
				return {
					// Fire the callback onload
					callbackonload: true
				};
			}
		}
	});

	var base = 'https://graph.facebook.com/';

	function formatUser(o) {
		if (o.id) {
			o.thumbnail = o.picture = 'https://graph.facebook.com/' + o.id + '/picture';
		}

		return o;
	}

	function formatFriends(o) {
		if ('data' in o) {
			o.data.forEach(formatUser);
		}

		return o;
	}

	function format(o, headers, req) {
		if (typeof o === 'boolean') {
			o = { success: o };
		}

		if (o && 'data' in o) {
			var token = req.authResponse.access_token;

			if (!(o.data instanceof Array)) {
				var data = o.data;
				delete o.data;
				o.data = [data];
			}

			o.data.forEach(function (d) {

				if (d.picture) {
					d.thumbnail = d.picture;
				}

				d.pictures = (d.images || []).sort(function (a, b) {
					return a.width - b.width;
				});

				if (d.cover_photo && d.cover_photo.id) {
					d.thumbnail = base + d.cover_photo.id + '/picture?access_token=' + token;
				}

				if (d.type === 'album') {
					d.files = d.photos = base + d.id + '/photos';
				}

				if (d.can_upload) {
					d.upload_location = base + d.id + '/photos';
				}
			});
		}

		return o;
	}
})(hello);

},{"../hello.js":4,"tricks/events/globalCallback":42,"tricks/object/hasBinary":48,"tricks/object/toBlob":56,"tricks/string/querystringify":63}],8:[function(require,module,exports){
'use strict';

var hello = require('../hello.js');

(function (hello) {

	hello.init({

		flickr: {

			name: 'Flickr',

			// Ensure that you define an oauth_proxy
			oauth: {
				version: '1.0a',
				auth: 'https://www.flickr.com/services/oauth/authorize?perms=read',
				request: 'https://www.flickr.com/services/oauth/request_token',
				token: 'https://www.flickr.com/services/oauth/access_token'
			},

			// API base URL
			base: 'https://api.flickr.com/services/rest',

			// Map GET resquests
			get: {
				me: sign('flickr.people.getInfo'),
				'me/friends': sign('flickr.contacts.getList', { per_page: '@{limit|50}' }),
				'me/following': sign('flickr.contacts.getList', { per_page: '@{limit|50}' }),
				'me/followers': sign('flickr.contacts.getList', { per_page: '@{limit|50}' }),
				'me/albums': sign('flickr.photosets.getList', { per_page: '@{limit|50}' }),
				'me/album': sign('flickr.photosets.getPhotos', { photoset_id: '@{id}' }),
				'me/photos': sign('flickr.people.getPhotos', { per_page: '@{limit|50}' })
			},

			wrap: {
				me: function me(o) {
					formatError(o);
					o = checkResponse(o, 'person');
					if (o.id) {
						if (o.realname) {
							o.name = o.realname._content;
							var m = o.name.split(' ');
							o.first_name = m.shift();
							o.last_name = m.join(' ');
						}

						o.thumbnail = getBuddyIcon(o, 'l');
						o.picture = getBuddyIcon(o, 'l');
					}

					return o;
				},

				'me/friends': formatFriends,
				'me/followers': formatFriends,
				'me/following': formatFriends,
				'me/albums': function meAlbums(o) {
					formatError(o);
					o = checkResponse(o, 'photosets');
					paging(o);
					if (o.photoset) {
						o.data = o.photoset;
						o.data.forEach(function (item) {
							item.name = item.title._content;
							item.photos = 'https://api.flickr.com/services/rest' + getApiUrl('flickr.photosets.getPhotos', { photoset_id: item.id }, true);
						});

						delete o.photoset;
					}

					return o;
				},

				'me/photos': function mePhotos(o) {
					formatError(o);
					return formatPhotos(o);
				},

				'default': function _default(o) {
					formatError(o);
					return formatPhotos(o);
				}
			},

			xhr: false,

			jsonp: function jsonp(p, qs) {
				if (p.method == 'get') {
					delete qs.callback;
					qs.jsoncallback = p.callbackID;
				}
			}
		}
	});

	function getApiUrl(method, extraParams, skipNetwork) {
		var url = (skipNetwork ? '' : 'flickr:') + '?method=' + method + '&api_key=' + hello.services.flickr.id + '&format=json';
		for (var param in extraParams) {
			if (extraParams.hasOwnProperty(param)) {
				url += '&' + param + '=' + extraParams[param];
			}
		}

		return url;
	}

	// This is not exactly neat but avoid to call
	// The method 'flickr.test.login' for each api call

	function withUser(cb) {
		var auth = hello.getAuthResponse('flickr');
		cb(auth && auth.user_nsid ? auth.user_nsid : null);
	}

	function sign(url, params) {
		if (!params) {
			params = {};
		}

		return function (p, callback) {
			withUser(function (userId) {
				params.user_id = userId;
				callback(getApiUrl(url, params, true));
			});
		};
	}

	function getBuddyIcon(profile, size) {
		var url = 'https://www.flickr.com/images/buddyicon.gif';
		if (profile.nsid && profile.iconserver && profile.iconfarm) {
			url = 'https://farm' + profile.iconfarm + '.staticflickr.com/' + profile.iconserver + '/' + 'buddyicons/' + profile.nsid + (size ? '_' + size : '') + '.jpg';
		}

		return url;
	}

	// See: https://www.flickr.com/services/api/misc.urls.html
	function createPhotoUrl(id, farm, server, secret, size) {
		size = size ? '_' + size : '';
		return 'https://farm' + farm + '.staticflickr.com/' + server + '/' + id + '_' + secret + size + '.jpg';
	}

	function formatUser(o) {}

	function formatError(o) {
		if (o && o.stat && o.stat.toLowerCase() != 'ok') {
			o.error = {
				code: 'invalid_request',
				message: o.message
			};
		}
	}

	function formatPhotos(o) {
		if (o.photoset || o.photos) {
			var set = 'photoset' in o ? 'photoset' : 'photos';
			o = checkResponse(o, set);
			paging(o);
			o.data = o.photo;
			delete o.photo;
			for (var i = 0; i < o.data.length; i++) {
				var photo = o.data[i];
				photo.name = photo.title;
				photo.picture = createPhotoUrl(photo.id, photo.farm, photo.server, photo.secret, '');
				photo.pictures = createPictures(photo.id, photo.farm, photo.server, photo.secret);
				photo.source = createPhotoUrl(photo.id, photo.farm, photo.server, photo.secret, 'b');
				photo.thumbnail = createPhotoUrl(photo.id, photo.farm, photo.server, photo.secret, 'm');
			}
		}

		return o;
	}

	// See: https://www.flickr.com/services/api/misc.urls.html
	function createPictures(id, farm, server, secret) {

		var NO_LIMIT = 2048;
		var sizes = [{ id: 't', max: 100 }, { id: 'm', max: 240 }, { id: 'n', max: 320 }, { id: '', max: 500 }, { id: 'z', max: 640 }, { id: 'c', max: 800 }, { id: 'b', max: 1024 }, { id: 'h', max: 1600 }, { id: 'k', max: 2048 }, { id: 'o', max: NO_LIMIT }];

		return sizes.map(function (size) {
			return {
				source: createPhotoUrl(id, farm, server, secret, size.id),

				// Note: this is a guess that's almost certain to be wrong (unless square source)
				width: size.max,
				height: size.max
			};
		});
	}

	function checkResponse(o, key) {

		if (key in o) {
			o = o[key];
		} else if (!('error' in o)) {
			o.error = {
				code: 'invalid_request',
				message: o.message || 'Failed to get data from Flickr'
			};
		}

		return o;
	}

	function formatFriends(o) {
		formatError(o);
		if (o.contacts) {
			o = checkResponse(o, 'contacts');
			paging(o);
			o.data = o.contact;
			delete o.contact;
			for (var i = 0; i < o.data.length; i++) {
				var item = o.data[i];
				item.id = item.nsid;
				item.name = item.realname || item.username;
				item.thumbnail = getBuddyIcon(item, 'm');
			}
		}

		return o;
	}

	function paging(res) {
		if (res.page && res.pages && res.page !== res.pages) {
			res.paging = {
				next: '?page=' + ++res.page
			};
		}
	}
})(hello);

},{"../hello.js":4}],9:[function(require,module,exports){
'use strict';

var hello = require('../hello.js');

(function (hello) {

	hello.init({

		foursquare: {

			name: 'Foursquare',

			oauth: {
				// See: https://developer.foursquare.com/overview/auth
				version: 2,
				auth: 'https://foursquare.com/oauth2/authenticate',
				grant: 'https://foursquare.com/oauth2/access_token'
			},

			// Refresh the access_token once expired
			refresh: true,

			base: 'https://api.foursquare.com/v2/',

			get: {
				me: 'users/self',
				'me/friends': 'users/self/friends',
				'me/followers': 'users/self/friends',
				'me/following': 'users/self/friends'
			},

			wrap: {
				me: function me(o) {
					formatError(o);
					if (o && o.response) {
						o = o.response.user;
						formatUser(o);
					}

					return o;
				},

				'default': function _default(o) {
					formatError(o);

					// Format friends
					if (o && 'response' in o && 'friends' in o.response && 'items' in o.response.friends) {
						o.data = o.response.friends.items;
						o.data.forEach(formatUser);
						delete o.response;
					}

					return o;
				}
			},

			xhr: formatRequest,
			jsonp: formatRequest
		}
	});

	function formatError(o) {
		if (o.meta && (o.meta.code === 400 || o.meta.code === 401)) {
			o.error = {
				code: 'access_denied',
				message: o.meta.errorDetail
			};
		}
	}

	function formatUser(o) {
		if (o && o.id) {
			o.thumbnail = o.photo.prefix + '100x100' + o.photo.suffix;
			o.name = o.firstName + ' ' + o.lastName;
			o.first_name = o.firstName;
			o.last_name = o.lastName;
			if (o.contact) {
				if (o.contact.email) {
					o.email = o.contact.email;
				}
			}
		}
	}

	function formatRequest(p, qs) {
		var token = qs.access_token;
		delete qs.access_token;
		qs.oauth_token = token;
		qs.v = 20121125;
		return true;
	}
})(hello);

},{"../hello.js":4}],10:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var hello = require('../hello.js');

(function (hello) {

	hello.init({

		github: {

			name: 'GitHub',

			oauth: {
				version: 2,
				auth: 'https://github.com/login/oauth/authorize',
				grant: 'https://github.com/login/oauth/access_token',
				response_type: 'code'
			},

			scope: {
				email: 'user:email'
			},

			base: 'https://api.github.com/',

			get: {
				me: 'user',
				'me/friends': 'user/following?per_page=@{limit|100}',
				'me/following': 'user/following?per_page=@{limit|100}',
				'me/followers': 'user/followers?per_page=@{limit|100}',
				'me/like': 'user/starred?per_page=@{limit|100}'
			},

			wrap: {
				me: function me(o, headers) {

					formatError(o, headers);
					formatUser(o);

					return o;
				},

				'default': function _default(o, headers, req) {

					formatError(o, headers);

					if (Array.isArray(o)) {
						o = { data: o };
					}

					if (o.data) {
						paging(o, headers, req);
						o.data.forEach(formatUser);
					}

					return o;
				}
			},

			xhr: function xhr(p) {

				if (p.method !== 'get' && p.data) {

					// Serialize payload as JSON
					p.headers = p.headers || {};
					p.headers['Content-Type'] = 'application/json';
					if (_typeof(p.data) === 'object') {
						p.data = JSON.stringify(p.data);
					}
				}

				return true;
			}
		}
	});

	function formatError(o, headers) {
		var code = headers ? headers.statusCode : o && 'meta' in o && 'status' in o.meta && o.meta.status;
		if (code === 401 || code === 403) {
			o.error = {
				code: 'access_denied',
				message: o.message || (o.data ? o.data.message : 'Could not get response')
			};
			delete o.message;
		}
	}

	function formatUser(o) {
		if (o.id) {
			o.thumbnail = o.picture = o.avatar_url;
			o.name = o.login;
		}
	}

	function paging(res, headers, req) {
		if (res.data && res.data.length && headers && headers.Link) {
			var next = headers.Link.match(/<(.*?)>;\s*rel=\"next\"/);
			if (next) {
				res.paging = {
					next: next[1]
				};
			}
		}
	}
})(hello);

},{"../hello.js":4}],11:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var hello = require('../hello.js');

(function (hello) {

	var contactsUrl = 'https://www.google.com/m8/feeds/contacts/default/full?v=3.0&alt=json&max-results=@{limit|1000}&start-index=@{start|1}';

	hello.init({

		google: {

			name: 'Google Plus',

			// See: http://code.google.com/apis/accounts/docs/OAuth2UserAgent.html
			oauth: {
				version: 2,
				auth: 'https://accounts.google.com/o/oauth2/auth',
				grant: 'https://accounts.google.com/o/oauth2/token'
			},

			// Authorization scopes
			scope: {
				basic: 'https://www.googleapis.com/auth/plus.me profile',
				email: 'email',
				birthday: '',
				events: '',
				photos: 'https://picasaweb.google.com/data/',
				videos: 'http://gdata.youtube.com',
				friends: 'https://www.google.com/m8/feeds, https://www.googleapis.com/auth/plus.login',
				files: 'https://www.googleapis.com/auth/drive.readonly',
				publish: '',
				publish_files: 'https://www.googleapis.com/auth/drive',
				share: '',
				create_event: '',
				offline_access: ''
			},

			scope_delim: ' ',

			login: function login(p) {

				if (p.qs.response_type === 'code') {

					// Let's set this to an offline access to return a refresh_token
					p.qs.access_type = 'offline';
				}

				// Reauthenticate
				// https://developers.google.com/identity/protocols/
				if (p.options.force) {
					p.qs.approval_prompt = 'force';
				}
			},

			// API base URI
			base: 'https://www.googleapis.com/',

			// Map GET requests
			get: {
				me: 'plus/v1/people/me',

				// Deprecated Sept 1, 2014
				//'me': 'oauth2/v1/userinfo?alt=json',

				// See: https://developers.google.com/+/api/latest/people/list
				'me/friends': 'plus/v1/people/me/people/visible?maxResults=@{limit|100}',
				'me/following': contactsUrl,
				'me/followers': contactsUrl,
				'me/contacts': contactsUrl,
				'me/share': 'plus/v1/people/me/activities/public?maxResults=@{limit|100}',
				'me/feed': 'plus/v1/people/me/activities/public?maxResults=@{limit|100}',
				'me/albums': 'https://picasaweb.google.com/data/feed/api/user/default?alt=json&max-results=@{limit|100}&start-index=@{start|1}',
				'me/album': function meAlbum(p, callback) {
					var key = p.query.id;
					delete p.query.id;
					callback(key.replace('/entry/', '/feed/'));
				},

				'me/photos': 'https://picasaweb.google.com/data/feed/api/user/default?alt=json&kind=photo&max-results=@{limit|100}&start-index=@{start|1}',

				// See: https://developers.google.com/drive/v2/reference/files/list
				'me/file': 'drive/v2/files/@{id}',
				'me/files': 'drive/v2/files?q=%22@{parent|root}%22+in+parents+and+trashed=false&maxResults=@{limit|100}',

				// See: https://developers.google.com/drive/v2/reference/files/list
				'me/folders': 'drive/v2/files?q=%22@{id|root}%22+in+parents+and+mimeType+=+%22application/vnd.google-apps.folder%22+and+trashed=false&maxResults=@{limit|100}',

				// See: https://developers.google.com/drive/v2/reference/files/list
				'me/folder': 'drive/v2/files?q=%22@{id|root}%22+in+parents+and+trashed=false&maxResults=@{limit|100}'
			},

			// Map POST requests
			post: {

				// Google Drive
				'me/files': uploadDrive,
				'me/folders': function meFolders(p, callback) {
					p.data = {
						title: p.data.name,
						parents: [{ id: p.data.parent || 'root' }],
						mimeType: 'application/vnd.google-apps.folder'
					};
					callback('drive/v2/files');
				}
			},

			// Map PUT requests
			put: {
				'me/files': uploadDrive
			},

			// Map DELETE requests
			del: {
				'me/files': 'drive/v2/files/@{id}',
				'me/folder': 'drive/v2/files/@{id}'
			},

			// Map PATCH requests
			patch: {
				'me/file': 'drive/v2/files/@{id}'
			},

			wrap: {
				me: function me(o) {
					if (o.id) {
						o.last_name = o.family_name || (o.name ? o.name.familyName : null);
						o.first_name = o.given_name || (o.name ? o.name.givenName : null);

						if (o.emails && o.emails.length) {
							o.email = o.emails[0].value;
						}

						formatPerson(o);
					}

					return o;
				},

				'me/friends': function meFriends(o) {
					if (o.items) {
						paging(o);
						o.data = o.items;
						o.data.forEach(formatPerson);
						delete o.items;
					}

					return o;
				},

				'me/contacts': formatFriends,
				'me/followers': formatFriends,
				'me/following': formatFriends,
				'me/share': formatFeed,
				'me/feed': formatFeed,
				'me/albums': gEntry,
				'me/photos': formatPhotos,
				'default': gEntry
			},

			xhr: function xhr(p) {

				if (p.method === 'post' || p.method === 'put') {
					toJSON(p);
				} else if (p.method === 'patch') {
					_extends(p.query, p.data);
					p.data = null;
				}

				return true;
			},

			// Don't even try submitting via form.
			// This means no POST operations in <=IE9
			form: false
		}
	});

	function toInt(s) {
		return parseInt(s, 10);
	}

	function formatFeed(o) {
		paging(o);
		o.data = o.items;
		delete o.items;
		return o;
	}

	// Format: ensure each record contains a name, id etc.
	function formatItem(o) {
		if (o.error) {
			return;
		}

		if (!o.name) {
			o.name = o.title || o.message;
		}

		if (!o.picture) {
			o.picture = o.thumbnailLink;
		}

		if (!o.thumbnail) {
			o.thumbnail = o.thumbnailLink;
		}

		if (o.mimeType === 'application/vnd.google-apps.folder') {
			o.type = 'folder';
			o.files = 'https://www.googleapis.com/drive/v2/files?q=%22' + o.id + '%22+in+parents';
		}

		return o;
	}

	function formatImage(image) {
		return {
			source: image.url,
			width: image.width,
			height: image.height
		};
	}

	function formatPhotos(o) {
		o.data = o.feed.entry.map(formatEntry);
		delete o.feed;
	}

	// Google has a horrible JSON API
	function gEntry(o) {
		paging(o);

		if ('feed' in o && 'entry' in o.feed) {
			o.data = o.feed.entry.map(formatEntry);
			delete o.feed;
		}

		// Old style: Picasa, etc.
		else if ('entry' in o) {
				return formatEntry(o.entry);
			}

			// New style: Google Drive & Plus
			else if ('items' in o) {
					o.data = o.items.map(formatItem);
					delete o.items;
				} else {
					formatItem(o);
				}

		return o;
	}

	function formatPerson(o) {
		o.name = o.displayName || o.name;
		o.picture = o.picture || (o.image ? o.image.url : null);
		o.thumbnail = o.picture;
	}

	function formatFriends(o, headers, req) {
		paging(o);
		var r = [];
		if ('feed' in o && 'entry' in o.feed) {
			var token = req.query.access_token;
			for (var i = 0; i < o.feed.entry.length; i++) {
				var a = o.feed.entry[i];

				a.id = a.id.$t;
				a.name = a.title.$t;
				delete a.title;
				if (a.gd$email) {
					a.email = a.gd$email && a.gd$email.length > 0 ? a.gd$email[0].address : null;
					a.emails = a.gd$email;
					delete a.gd$email;
				}

				if (a.updated) {
					a.updated = a.updated.$t;
				}

				if (a.link) {

					var pic = a.link.length > 0 ? a.link[0].href : null;
					if (pic && a.link[0].gd$etag) {
						pic += (pic.indexOf('?') > -1 ? '&' : '?') + 'access_token=' + token;
						a.picture = pic;
						a.thumbnail = pic;
					}

					delete a.link;
				}

				if (a.category) {
					delete a.category;
				}
			}

			o.data = o.feed.entry;
			delete o.feed;
		}

		return o;
	}

	function formatEntry(a) {

		var group = a.media$group;
		var photo = group.media$content.length ? group.media$content[0] : {};
		var mediaContent = group.media$content || [];
		var mediaThumbnail = group.media$thumbnail || [];

		var pictures = mediaContent.concat(mediaThumbnail).map(formatImage).sort(function (a, b) {
			return a.width - b.width;
		});

		var i = 0;
		var _a;
		var p = {
			id: a.id.$t,
			name: a.title.$t,
			description: a.summary.$t,
			updated_time: a.updated.$t,
			created_time: a.published.$t,
			picture: photo ? photo.url : null,
			pictures: pictures,
			images: [],
			thumbnail: photo ? photo.url : null,
			width: photo.width,
			height: photo.height
		};

		// Get feed/children
		if ('link' in a) {
			for (i = 0; i < a.link.length; i++) {
				var d = a.link[i];
				if (d.rel.match(/\#feed$/)) {
					p.upload_location = p.files = p.photos = d.href;
					break;
				}
			}
		}

		// Get images of different scales
		if ('category' in a && a.category.length) {
			_a = a.category;
			for (i = 0; i < _a.length; i++) {
				if (_a[i].scheme && _a[i].scheme.match(/\#kind$/)) {
					p.type = _a[i].term.replace(/^.*?\#/, '');
				}
			}
		}

		// Get images of different scales
		if ('media$thumbnail' in group && group.media$thumbnail.length) {
			_a = group.media$thumbnail;
			p.thumbnail = _a[0].url;
			p.images = _a.map(formatImage);
		}

		_a = group.media$content;

		if (_a && _a.length) {
			p.images.push(formatImage(_a[0]));
		}

		return p;
	}

	function paging(res) {

		// Contacts V2
		if ('feed' in res && res.feed.openSearch$itemsPerPage) {
			var limit = toInt(res.feed.openSearch$itemsPerPage.$t);
			var start = toInt(res.feed.openSearch$startIndex.$t);
			var total = toInt(res.feed.openSearch$totalResults.$t);

			if (start + limit < total) {
				res.paging = {
					next: '?start=' + (start + limit)
				};
			}
		} else if ('nextPageToken' in res) {
			res.paging = {
				next: '?pageToken=' + res.nextPageToken
			};
		}
	}

	// Construct a multipart message
	function Multipart() {

		// Internal body
		var body = [];
		var boundary = (Math.random() * 1e10).toString(32);
		var counter = 0;
		var lineBreak = '\r\n';
		var delim = lineBreak + '--' + boundary;
		var ready = function ready() {};

		var dataUri = /^data\:([^;,]+(\;charset=[^;,]+)?)(\;base64)?,/i;

		// Add file
		function addFile(item) {
			var fr = new FileReader();
			fr.onload = function (e) {
				addContent(btoa(e.target.result), item.type + lineBreak + 'Content-Transfer-Encoding: base64');
			};

			fr.readAsBinaryString(item);
		}

		// Add content
		function addContent(content, type) {
			body.push(lineBreak + 'Content-Type: ' + type + lineBreak + lineBreak + content);
			counter--;
			ready();
		}

		// Add new things to the object
		this.append = function (content, type) {

			// Does the content have an array
			if (typeof content === 'string' || !('length' in Object(content))) {
				// Converti to multiples
				content = [content];
			}

			for (var i = 0; i < content.length; i++) {

				counter++;

				var item = content[i];

				// Is this a file?
				// Files can be either Blobs or File types
				if (typeof File !== 'undefined' && item instanceof File || typeof Blob !== 'undefined' && item instanceof Blob) {
					// Read the file in
					addFile(item);
				}

				// Data-URI?
				// Data:[<mime type>][;charset=<charset>][;base64],<encoded data>
				// /^data\:([^;,]+(\;charset=[^;,]+)?)(\;base64)?,/i
				else if (typeof item === 'string' && item.match(dataUri)) {
						var m = item.match(dataUri);
						addContent(item.replace(dataUri, ''), m[1] + lineBreak + 'Content-Transfer-Encoding: base64');
					}

					// Regular string
					else {
							addContent(item, type);
						}
			}
		};

		this.onready = function (fn) {
			ready = function ready() {
				if (counter === 0) {
					// Trigger ready
					body.unshift('');
					body.push('--');
					fn(body.join(delim), boundary);
					body = [];
				}
			};

			ready();
		};
	}

	// Upload to Drive
	// If this is PUT then only augment the file uploaded
	// PUT https://developers.google.com/drive/v2/reference/files/update
	// POST https://developers.google.com/drive/manage-uploads
	function uploadDrive(p, callback) {

		var data = {};

		// Test for DOM element
		if (p.data && typeof HTMLInputElement !== 'undefined' && p.data instanceof HTMLInputElement) {
			p.data = { file: p.data };
		}

		if (!p.data.name && Object(Object(p.data.file).files).length && p.method === 'post') {
			p.data.name = p.data.file.files[0].name;
		}

		if (p.method === 'post') {
			p.data = {
				title: p.data.name,
				parents: [{ id: p.data.parent || 'root' }],
				file: p.data.file
			};
		} else {

			// Make a reference
			data = p.data;
			p.data = {};

			// Add the parts to change as required
			if (data.parent) {
				p.data.parents = [{ id: p.data.parent || 'root' }];
			}

			if (data.file) {
				p.data.file = data.file;
			}

			if (data.name) {
				p.data.title = data.name;
			}
		}

		// Extract the file, if it exists from the data object
		// If the File is an INPUT element lets just concern ourselves with the NodeList
		var file;
		if ('file' in p.data) {
			file = p.data.file;
			delete p.data.file;

			if ((typeof file === 'undefined' ? 'undefined' : _typeof(file)) === 'object' && 'files' in file) {
				// Assign the NodeList
				file = file.files;
			}

			if (!file || !file.length) {
				callback({
					error: {
						code: 'request_invalid',
						message: 'There were no files attached with this request to upload'
					}
				});
				return;
			}
		}

		// Set type p.data.mimeType = Object(file[0]).type || 'application/octet-stream';

		// Construct a multipart message
		var parts = new Multipart();
		parts.append(JSON.stringify(p.data), 'application/json');

		// Read the file into a  base64 string... yep a hassle, i know
		// FormData doesn't let us assign our own Multipart headers and HTTP Content-Type
		// Alas GoogleApi need these in a particular format
		if (file) {
			parts.append(file);
		}

		parts.onready(function (body, boundary) {

			p.headers['content-type'] = 'multipart/related; boundary="' + boundary + '"';
			p.data = body;

			callback('upload/drive/v2/files' + (data.id ? '/' + data.id : '') + '?uploadType=multipart');
		});
	}

	function toJSON(p) {
		if (_typeof(p.data) === 'object') {
			// Convert the POST into a javascript object
			try {
				p.data = JSON.stringify(p.data);
				p.headers['content-type'] = 'application/json';
			} catch (e) {}
		}
	}
})(hello);

},{"../hello.js":4}],12:[function(require,module,exports){
'use strict';

var hello = require('../hello.js');

(function (hello) {

	hello.init({

		instagram: {

			name: 'Instagram',

			oauth: {
				// See: http://instagram.com/developer/authentication/
				version: 2,
				auth: 'https://instagram.com/oauth/authorize/',
				grant: 'https://api.instagram.com/oauth/access_token'
			},

			// Refresh the access_token once expired
			refresh: true,

			scope: {
				basic: 'basic',
				photos: '',
				friends: 'relationships',
				publish: 'likes comments',
				email: '',
				share: '',
				publish_files: '',
				files: '',
				videos: '',
				offline_access: ''
			},

			scope_delim: ' ',

			base: 'https://api.instagram.com/v1/',

			get: {
				me: 'users/self',
				'me/feed': 'users/self/feed?count=@{limit|100}',
				'me/photos': 'users/self/media/recent?min_id=0&count=@{limit|100}',
				'me/friends': 'users/self/follows?count=@{limit|100}',
				'me/following': 'users/self/follows?count=@{limit|100}',
				'me/followers': 'users/self/followed-by?count=@{limit|100}',
				'friend/photos': 'users/@{id}/media/recent?min_id=0&count=@{limit|100}'
			},

			post: {
				'me/like': function meLike(p, callback) {
					var id = p.data.id;
					p.data = {};
					callback('media/' + id + '/likes');
				}
			},

			del: {
				'me/like': 'media/@{id}/likes'
			},

			wrap: {
				me: function me(o) {

					formatError(o);

					if ('data' in o) {
						o.id = o.data.id;
						o.thumbnail = o.data.profile_picture;
						o.name = o.data.full_name || o.data.username;
					}

					return o;
				},

				'me/friends': formatFriends,
				'me/following': formatFriends,
				'me/followers': formatFriends,
				'me/photos': function mePhotos(o) {

					formatError(o);
					paging(o);

					if ('data' in o) {
						o.data = o.data.filter(function (d) {
							return d.type === 'image';
						});

						o.data.forEach(function (d) {
							d.name = d.caption ? d.caption.text : null;
							d.thumbnail = d.images.thumbnail.url;
							d.picture = d.images.standard_resolution.url;
							d.pictures = Object.keys(d.images).map(function (key) {
								var image = d.images[key];
								return formatImage(image);
							}).sort(function (a, b) {
								return a.width - b.width;
							});
						});
					}

					return o;
				},

				'default': function _default(o) {
					o = formatError(o);
					paging(o);
					return o;
				}
			},

			// Instagram does not return any CORS Headers
			// So besides JSONP we're stuck with proxy
			xhr: function xhr(p, qs) {

				var method = p.method;
				var proxy = method !== 'get';

				if (proxy) {

					if ((method === 'post' || method === 'put') && p.query.access_token) {
						p.data.access_token = p.query.access_token;
						delete p.query.access_token;
					}

					// No access control headers
					// Use the proxy instead
					p.proxy = proxy;
				}

				return proxy;
			},

			// No form
			form: false
		}
	});

	function formatImage(image) {
		return {
			source: image.url,
			width: image.width,
			height: image.height
		};
	}

	function formatError(o) {
		if (typeof o === 'string') {
			return {
				error: {
					code: 'invalid_request',
					message: o
				}
			};
		}

		if (o && 'meta' in o && 'error_type' in o.meta) {
			o.error = {
				code: o.meta.error_type,
				message: o.meta.error_message
			};
		}

		return o;
	}

	function formatFriends(o) {
		paging(o);
		if (o && 'data' in o) {
			o.data.forEach(formatFriend);
		}

		return o;
	}

	function formatFriend(o) {
		if (o.id) {
			o.thumbnail = o.profile_picture;
			o.name = o.full_name || o.username;
		}
	}

	// See: http://instagram.com/developer/endpoints/
	function paging(res) {
		if (res && 'pagination' in res) {
			res.paging = {
				next: res.pagination.next_url
			};
			delete res.pagination;
		}
	}
})(hello);

},{"../hello.js":4}],13:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var hello = require('../hello.js');

(function (hello) {

	hello.init({

		joinme: {

			name: 'join.me',

			oauth: {
				version: 2,
				auth: 'https://secure.join.me/api/public/v1/auth/oauth2',
				grant: 'https://secure.join.me/api/public/v1/auth/oauth2'
			},

			refresh: false,

			scope: {
				basic: 'user_info',
				user: 'user_info',
				scheduler: 'scheduler',
				start: 'start_meeting',
				email: '',
				friends: '',
				share: '',
				publish: '',
				photos: '',
				publish_files: '',
				files: '',
				videos: '',
				offline_access: ''
			},

			scope_delim: ' ',

			login: function login(p) {
				p.options.popup.width = 400;
				p.options.popup.height = 700;
			},

			base: 'https://api.join.me/v1/',

			get: {
				me: 'user',
				meetings: 'meetings',
				'meetings/info': 'meetings/@{id}'
			},

			post: {
				'meetings/start/adhoc': function meetingsStartAdhoc(p, callback) {
					callback('meetings/start');
				},

				'meetings/start/scheduled': function meetingsStartScheduled(p, callback) {
					var meetingId = p.data.meetingId;
					p.data = {};
					callback('meetings/' + meetingId + '/start');
				},

				'meetings/schedule': function meetingsSchedule(p, callback) {
					callback('meetings');
				}
			},

			patch: {
				'meetings/update': function meetingsUpdate(p, callback) {
					callback('meetings/' + p.data.meetingId);
				}
			},

			del: {
				'meetings/delete': 'meetings/@{id}'
			},

			wrap: {
				me: function me(o, headers) {
					formatError(o, headers);

					if (!o.email) {
						return o;
					}

					o.name = o.fullName;
					o.first_name = o.name.split(' ')[0];
					o.last_name = o.name.split(' ')[1];
					o.id = o.email;

					return o;
				},

				'default': function _default(o, headers) {
					formatError(o, headers);

					return o;
				}
			},

			xhr: formatRequest

		}
	});

	function formatError(o, headers) {
		var errorCode;
		var message;
		var details;

		if (o && 'Message' in o) {
			message = o.Message;
			delete o.Message;

			if ('ErrorCode' in o) {
				errorCode = o.ErrorCode;
				delete o.ErrorCode;
			} else {
				errorCode = getErrorCode(headers);
			}

			o.error = {
				code: errorCode,
				message: message,
				details: o
			};
		}

		return o;
	}

	function formatRequest(p, qs) {
		// Move the access token from the request body to the request header
		var token = qs.access_token;
		delete qs.access_token;
		p.headers.Authorization = 'Bearer ' + token;

		// Format non-get requests to indicate json body
		if (p.method !== 'get' && p.data) {
			p.headers['Content-Type'] = 'application/json';
			if (_typeof(p.data) === 'object') {
				p.data = JSON.stringify(p.data);
			}
		}

		if (p.method === 'put') {
			p.method = 'patch';
		}

		return true;
	}

	function getErrorCode(headers) {
		switch (headers.statusCode) {
			case 400:
				return 'invalid_request';
			case 403:
				return 'stale_token';
			case 401:
				return 'invalid_token';
			case 500:
				return 'server_error';
			default:
				return 'server_error';
		}
	}
})(hello);

},{"../hello.js":4}],14:[function(require,module,exports){
'use strict';

var hello = require('../hello.js');

(function (hello) {

	hello.init({

		linkedin: {

			oauth: {
				version: 2,
				response_type: 'code',
				auth: 'https://www.linkedin.com/uas/oauth2/authorization',
				grant: 'https://www.linkedin.com/uas/oauth2/accessToken'
			},

			// Refresh the access_token once expired
			refresh: true,

			scope: {
				basic: 'r_basicprofile',
				email: 'r_emailaddress',
				files: '',
				friends: '',
				photos: '',
				publish: 'w_share',
				publish_files: 'w_share',
				share: '',
				videos: '',
				offline_access: ''
			},
			scope_delim: ' ',

			base: 'https://api.linkedin.com/v1/',

			get: {
				me: 'people/~:(picture-url,first-name,last-name,id,formatted-name,email-address)',

				// See: http://developer.linkedin.com/documents/get-network-updates-and-statistics-api
				'me/share': 'people/~/network/updates?count=@{limit|250}'
			},

			post: {

				// See: https://developer.linkedin.com/documents/api-requests-json
				'me/share': function meShare(p, callback) {
					var data = {
						visibility: {
							code: 'anyone'
						}
					};

					if (p.data.id) {

						data.attribution = {
							share: {
								id: p.data.id
							}
						};
					} else {
						data.comment = p.data.message;
						if (p.data.picture && p.data.link) {
							data.content = {
								'submitted-url': p.data.link,
								'submitted-image-url': p.data.picture
							};
						}
					}

					p.data = JSON.stringify(data);

					callback('people/~/shares?format=json');
				},

				'me/like': like
			},

			del: {
				'me/like': like
			},

			wrap: {
				me: function me(o) {
					formatError(o);
					formatUser(o);
					return o;
				},

				'me/friends': formatFriends,
				'me/following': formatFriends,
				'me/followers': formatFriends,
				'me/share': function meShare(o) {
					formatError(o);
					paging(o);
					if (o.values) {
						o.data = o.values.map(formatUser);
						o.data.forEach(function (item) {
							item.message = item.headline;
						});

						delete o.values;
					}

					return o;
				},

				'default': function _default(o, headers) {
					formatError(o);
					empty(o, headers);
					paging(o);
				}
			},

			jsonp: function jsonp(p, qs) {
				formatQuery(qs);
				if (p.method === 'get') {
					qs.format = 'jsonp';
					qs['error-callback'] = p.callbackID;
				}
			},

			xhr: function xhr(p, qs) {
				if (p.method !== 'get') {
					formatQuery(qs);
					p.headers['Content-Type'] = 'application/json';

					// Note: x-li-format ensures error responses are not returned in XML
					p.headers['x-li-format'] = 'json';
					p.proxy = true;
					return true;
				}

				return false;
			}
		}
	});

	function formatError(o) {
		if (o && 'errorCode' in o) {
			o.error = {
				code: o.status,
				message: o.message
			};
		}
	}

	function formatUser(o) {
		if (o.error) {
			return;
		}

		o.first_name = o.firstName;
		o.last_name = o.lastName;
		o.name = o.formattedName || o.first_name + ' ' + o.last_name;
		o.thumbnail = o.pictureUrl;
		o.email = o.emailAddress;
		return o;
	}

	function formatFriends(o) {
		formatError(o);
		paging(o);
		if (o.values) {
			o.data = o.values.map(formatUser);
			delete o.values;
		}

		return o;
	}

	function paging(res) {
		if ('_count' in res && '_start' in res && res._count + res._start < res._total) {
			res.paging = {
				next: '?start=' + (res._start + res._count) + '&count=' + res._count
			};
		}
	}

	function empty(o, headers) {
		if (JSON.stringify(o) === '{}' && headers.statusCode === 200) {
			o.success = true;
		}
	}

	function formatQuery(qs) {
		// LinkedIn signs requests with the parameter 'oauth2_access_token'
		// ... yeah another one who thinks they should be different!
		if (qs.access_token) {
			qs.oauth2_access_token = qs.access_token;
			delete qs.access_token;
		}
	}

	function like(p, callback) {
		p.headers['x-li-format'] = 'json';
		var id = p.data.id;
		p.data = (p.method !== 'delete').toString();
		p.method = 'put';
		callback('people/~/network/updates/key=' + id + '/is-liked');
	}
})(hello);

},{"../hello.js":4}],15:[function(require,module,exports){
'use strict';

var hello = require('../hello.js');

// See: https://developers.soundcloud.com/docs/api/reference
(function (hello) {

	hello.init({

		soundcloud: {
			name: 'SoundCloud',

			oauth: {
				version: 2,
				auth: 'https://soundcloud.com/connect',
				grant: 'https://soundcloud.com/oauth2/token'
			},

			// Request path translated
			base: 'https://api.soundcloud.com/',
			get: {
				me: 'me.json',

				// Http://developers.soundcloud.com/docs/api/reference#me
				'me/friends': 'me/followings.json',
				'me/followers': 'me/followers.json',
				'me/following': 'me/followings.json',

				// See: http://developers.soundcloud.com/docs/api/reference#activities
				'default': function _default(p, callback) {

					// Include '.json at the end of each request'
					callback(p.path + '.json');
				}
			},

			// Response handlers
			wrap: {
				me: function me(o) {
					formatUser(o);
					return o;
				},

				'default': function _default(o) {
					if (Array.isArray(o)) {
						o = {
							data: o.map(formatUser)
						};
					}

					paging(o);
					return o;
				}
			},

			xhr: formatRequest,
			jsonp: formatRequest
		}
	});

	function formatRequest(p, qs) {
		// Alter the querystring
		var token = qs.access_token;
		delete qs.access_token;
		qs.oauth_token = token;
		qs['_status_code_map[302]'] = 200;
		return true;
	}

	function formatUser(o) {
		if (o.id) {
			o.picture = o.avatar_url;
			o.thumbnail = o.avatar_url;
			o.name = o.username || o.full_name;
		}

		return o;
	}

	// See: http://developers.soundcloud.com/docs/api/reference#activities
	function paging(res) {
		if ('next_href' in res) {
			res.paging = {
				next: res.next_href
			};
		}
	}
})(hello);

},{"../hello.js":4}],16:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var hello = require('../hello.js');

(function (hello) {

	var base = 'https://api.twitter.com/';

	hello.init({

		twitter: {

			// Ensure that you define an oauth_proxy
			oauth: {
				version: '1.0a',
				auth: base + 'oauth/authenticate',
				request: base + 'oauth/request_token',
				token: base + 'oauth/access_token'
			},

			login: function login(p) {
				// Reauthenticate
				// https://dev.twitter.com/oauth/reference/get/oauth/authenticate
				var prefix = '?force_login=true';
				this.oauth.auth = this.oauth.auth.replace(prefix, '') + (p.options.force ? prefix : '');
			},

			base: base + '1.1/',

			get: {
				me: 'account/verify_credentials.json',
				'me/friends': 'friends/list.json?count=@{limit|200}',
				'me/following': 'friends/list.json?count=@{limit|200}',
				'me/followers': 'followers/list.json?count=@{limit|200}',

				// Https://dev.twitter.com/docs/api/1.1/get/statuses/user_timeline
				'me/share': 'statuses/user_timeline.json?count=@{limit|200}',

				// Https://dev.twitter.com/rest/reference/get/favorites/list
				'me/like': 'favorites/list.json?count=@{limit|200}'
			},

			post: {
				'me/share': function meShare(p, callback) {

					var data = p.data;
					p.data = null;

					var status = [];

					// Change message to status
					if (data.message) {
						status.push(data.message);
						delete data.message;
					}

					// If link is given
					if (data.link) {
						status.push(data.link);
						delete data.link;
					}

					if (data.picture) {
						status.push(data.picture);
						delete data.picture;
					}

					// Compound all the components
					if (status.length) {
						data.status = status.join(' ');
					}

					// Tweet media
					if (data.file) {
						data['media[]'] = data.file;
						delete data.file;
						p.data = data;
						callback('statuses/update_with_media.json');
					}

					// Retweet?
					else if ('id' in data) {
							callback('statuses/retweet/' + data.id + '.json');
						}

						// Tweet
						else {
								// Assign the post body to the query parameters
								_extends(p.query, data);
								callback('statuses/update.json?include_entities=1');
							}
				},

				// See: https://dev.twitter.com/rest/reference/post/favorites/create
				'me/like': function meLike(p, callback) {
					var id = p.data.id;
					p.data = null;
					callback('favorites/create.json?id=' + id);
				}
			},

			del: {

				// See: https://dev.twitter.com/rest/reference/post/favorites/destroy
				'me/like': function meLike() {
					p.method = 'post';
					var id = p.data.id;
					p.data = null;
					callback('favorites/destroy.json?id=' + id);
				}
			},

			wrap: {
				me: function me(res) {
					formatError(res);
					formatUser(res);
					return res;
				},

				'me/friends': formatFriends,
				'me/followers': formatFriends,
				'me/following': formatFriends,

				'me/share': function meShare(res) {
					formatError(res);
					paging(res);
					if (!res.error && 'length' in res) {
						return { data: res };
					}

					return res;
				},

				'default': function _default(res) {
					res = arrayToDataResponse(res);
					paging(res);
					return res;
				}
			},
			xhr: function xhr(p) {

				// Rely on the proxy for non-GET requests.
				return p.method !== 'get';
			}
		}
	});

	function formatUser(o) {
		if (o.id) {
			if (o.name) {
				var m = o.name.split(' ');
				o.first_name = m.shift();
				o.last_name = m.join(' ');
			}

			// See: https://dev.twitter.com/overview/general/user-profile-images-and-banners
			o.thumbnail = o.profile_image_url_https || o.profile_image_url;
		}

		return o;
	}

	function formatFriends(o) {
		formatError(o);
		paging(o);
		if (o.users) {
			o.data = o.users.map(formatUser);
			delete o.users;
		}

		return o;
	}

	function formatError(o) {
		if (o.errors) {
			var e = o.errors[0];
			o.error = {
				code: 'request_failed',
				message: e.message
			};
		}
	}

	// Take a cursor and add it to the path
	function paging(res) {
		// Does the response include a 'next_cursor_string'
		if ('next_cursor_str' in res) {
			// See: https://dev.twitter.com/docs/misc/cursoring
			res.paging = {
				next: '?cursor=' + res.next_cursor_str
			};
		}
	}

	function arrayToDataResponse(res) {
		return Array.isArray(res) ? { data: res } : res;
	}

	/**
 // The documentation says to define user in the request
 // Although its not actually required.
 	var user_id;
 	function withUserId(callback){
 	if(user_id){
 		callback(user_id);
 	}
 	else{
 		hello.api('twitter:/me', function(o){
 			user_id = o.id;
 			callback(o.id);
 		});
 	}
 }
 	function sign(url){
 	return function(p, callback){
 		withUserId(function(user_id){
 			callback(url+'?user_id='+user_id);
 		});
 	};
 }
 */
})(hello);

},{"../hello.js":4}],17:[function(require,module,exports){
'use strict';

var hello = require('../hello.js');

// Vkontakte (vk.com)
(function (hello) {

	hello.init({

		vk: {
			name: 'Vk',

			// See https://vk.com/dev/oauth_dialog
			oauth: {
				version: 2,
				auth: 'https://oauth.vk.com/authorize',
				grant: 'https://oauth.vk.com/access_token'
			},

			// Authorization scopes
			// See https://vk.com/dev/permissions
			scope: {
				email: 'email',
				friends: 'friends',
				photos: 'photos',
				videos: 'video',
				share: 'share',
				offline_access: 'offline'
			},

			// Refresh the access_token
			refresh: true,

			login: function login(p) {
				p.qs.display = window.navigator && window.navigator.userAgent && /ipad|phone|phone|android/.test(window.navigator.userAgent.toLowerCase()) ? 'mobile' : 'popup';
			},

			// API Base URL
			base: 'https://api.vk.com/method/',

			// Map GET requests
			get: {
				me: function me(p, callback) {
					p.query.fields = 'id,first_name,last_name,photo_max';
					callback('users.get');
				}
			},

			wrap: {
				me: function me(res, headers, req) {
					formatError(res);
					return formatUser(res, req);
				}
			},

			// No XHR
			xhr: false,

			// All requests should be JSONP as of missing CORS headers in https://api.vk.com/method/*
			jsonp: true,

			// No form
			form: false
		}
	});

	function formatUser(o, req) {

		if (o !== null && 'response' in o && o.response !== null && o.response.length) {
			o = o.response[0];
			o.id = o.uid;
			o.thumbnail = o.picture = o.photo_max;
			o.name = o.first_name + ' ' + o.last_name;

			if (req.authResponse && req.authResponse.email !== null) o.email = req.authResponse.email;
		}

		return o;
	}

	function formatError(o) {

		if (o.error) {
			var e = o.error;
			o.error = {
				code: e.error_code,
				message: e.error_msg
			};
		}
	}
})(hello);

},{"../hello.js":4}],18:[function(require,module,exports){
'use strict';

var hello = require('../hello.js');

var hasBinary = require('tricks/object/hasBinary');
var toBlob = require('tricks/object/toBlob');

(function (hello) {

	hello.init({
		windows: {
			name: 'Windows live',

			// REF: http://msdn.microsoft.com/en-us/library/hh243641.aspx
			oauth: {
				version: 2,
				auth: 'https://login.live.com/oauth20_authorize.srf',
				grant: 'https://login.live.com/oauth20_token.srf'
			},

			// Refresh the access_token once expired
			refresh: true,

			logout: function logout() {
				return 'http://login.live.com/oauth20_logout.srf?ts=' + new Date().getTime();
			},

			// Authorization scopes
			scope: {
				basic: 'wl.signin,wl.basic',
				email: 'wl.emails',
				birthday: 'wl.birthday',
				events: 'wl.calendars',
				photos: 'wl.photos',
				videos: 'wl.photos',
				friends: 'wl.contacts_emails',
				files: 'wl.skydrive',
				publish: 'wl.share',
				publish_files: 'wl.skydrive_update',
				share: 'wl.share',
				create_event: 'wl.calendars_update,wl.events_create',
				offline_access: 'wl.offline_access'
			},

			// API base URL
			base: 'https://apis.live.net/v5.0/',

			// Map GET requests
			get: {

				// Friends
				me: 'me',
				'me/friends': 'me/friends',
				'me/following': 'me/contacts',
				'me/followers': 'me/friends',
				'me/contacts': 'me/contacts',

				'me/albums': 'me/albums',

				// Include the data[id] in the path
				'me/album': '@{id}/files',
				'me/photo': '@{id}',

				// Files
				'me/files': '@{parent|me/skydrive}/files',
				'me/folders': '@{id|me/skydrive}/files',
				'me/folder': '@{id|me/skydrive}/files'
			},

			// Map POST requests
			post: {
				'me/albums': 'me/albums',
				'me/album': '@{id}/files/',

				'me/folders': '@{id|me/skydrive/}',
				'me/files': '@{parent|me/skydrive}/files'
			},

			// Map DELETE requests
			del: {
				// Include the data[id] in the path
				'me/album': '@{id}',
				'me/photo': '@{id}',
				'me/folder': '@{id}',
				'me/files': '@{id}'
			},

			wrap: {
				me: formatUser,

				'me/friends': formatFriends,
				'me/contacts': formatFriends,
				'me/followers': formatFriends,
				'me/following': formatFriends,
				'me/albums': formatAlbums,
				'me/photos': formatDefault,
				'default': formatDefault
			},

			xhr: function xhr(p) {
				if (p.method !== 'get' && p.method !== 'delete' && !hasBinary(p.data)) {

					// Does this have a data-uri to upload as a file?
					if (typeof p.data.file === 'string') {
						p.data.file = toBlob(p.data.file);
					} else {
						p.data = JSON.stringify(p.data);
						p.headers = {
							'Content-Type': 'application/json'
						};
					}
				}

				return true;
			},

			jsonp: function jsonp(p) {
				if (p.method !== 'get' && !hasBinary(p.data)) {
					p.data.method = p.method;
					p.method = 'get';
				}
			}
		}
	});

	function formatDefault(o) {
		if ('data' in o) {
			o.data.forEach(function (d) {
				if (d.picture) {
					d.thumbnail = d.picture;
				}

				if (d.images) {
					d.pictures = d.images.map(formatImage).sort(function (a, b) {
						return a.width - b.width;
					});
				}
			});
		}

		return o;
	}

	function formatImage(image) {
		return {
			width: image.width,
			height: image.height,
			source: image.source
		};
	}

	function formatAlbums(o) {
		if ('data' in o) {
			o.data.forEach(function (d) {
				d.photos = d.files = 'https://apis.live.net/v5.0/' + d.id + '/photos';
			});
		}

		return o;
	}

	function formatUser(o, headers, req) {
		if (o.id) {
			var token = req.authResponse.access_token;
			if (o.emails) {
				o.email = o.emails.preferred;
			}

			// If this is not an non-network friend
			if (o.is_friend !== false) {
				// Use the id of the user_id if available
				var id = o.user_id || o.id;
				o.thumbnail = o.picture = 'https://apis.live.net/v5.0/' + id + '/picture?access_token=' + token;
			}
		}

		return o;
	}

	function formatFriends(o, headers, req) {
		if ('data' in o) {
			o.data.forEach(function (d) {
				formatUser(d, headers, req);
			});
		}

		return o;
	}
})(hello);

},{"../hello.js":4,"tricks/object/hasBinary":48,"tricks/object/toBlob":56}],19:[function(require,module,exports){
'use strict';

var hello = require('../hello.js');

(function (hello) {

	hello.init({

		yahoo: {

			// Ensure that you define an oauth_proxy
			oauth: {
				version: '1.0a',
				auth: 'https://api.login.yahoo.com/oauth/v2/request_auth',
				request: 'https://api.login.yahoo.com/oauth/v2/get_request_token',
				token: 'https://api.login.yahoo.com/oauth/v2/get_token'
			},

			// Login handler
			login: function login(p) {
				// Change the default popup window to be at least 560
				// Yahoo does dynamically change it on the fly for the signin screen (only, what if your already signed in)
				p.options.popup.width = 560;

				// Yahoo throws an parameter error if for whatever reason the state.scope contains a comma, so lets remove scope
				try {
					delete p.qs.state.scope;
				} catch (e) {}
			},

			base: 'https://social.yahooapis.com/v1/',

			get: {
				me: yql('select * from social.profile(0) where guid=me'),
				'me/friends': yql('select * from social.contacts(0) where guid=me'),
				'me/following': yql('select * from social.contacts(0) where guid=me')
			},
			wrap: {
				me: formatUser,

				// Can't get IDs
				// It might be better to loop through the social.relationship table with has unique IDs of users.
				'me/friends': formatFriends,
				'me/following': formatFriends,
				'default': paging
			}
		}
	});

	/*
 	// Auto-refresh fix: bug in Yahoo can't get this to work with node-oauth-shim
 	login : function(o){
 		// Is the user already logged in
 		var auth = hello('yahoo').getAuthResponse();
 			// Is this a refresh token?
 		if(o.options.display==='none'&&auth&&auth.access_token&&auth.refresh_token){
 			// Add the old token and the refresh token, including path to the query
 			// See http://developer.yahoo.com/oauth/guide/oauth-refreshaccesstoken.html
 			o.qs.access_token = auth.access_token;
 			o.qs.refresh_token = auth.refresh_token;
 			o.qs.token_url = 'https://api.login.yahoo.com/oauth/v2/get_token';
 		}
 	},
 */

	function formatError(o) {
		if (o && 'meta' in o && 'error_type' in o.meta) {
			o.error = {
				code: o.meta.error_type,
				message: o.meta.error_message
			};
		}
	}

	function formatUser(o) {

		formatError(o);
		if (o.query && o.query.results && o.query.results.profile) {
			o = o.query.results.profile;
			o.id = o.guid;
			o.last_name = o.familyName;
			o.first_name = o.givenName || o.nickname;
			var a = [];
			if (o.first_name) {
				a.push(o.first_name);
			}

			if (o.last_name) {
				a.push(o.last_name);
			}

			o.name = a.join(' ');
			o.email = o.emails && o.emails[0] ? o.emails[0].handle : null;
			o.thumbnail = o.image ? o.image.imageUrl : null;
		}

		return o;
	}

	function formatFriends(o, headers, request) {
		formatError(o);
		paging(o, headers, request);
		var contact;
		var field;
		if (o.query && o.query.results && o.query.results.contact) {
			o.data = o.query.results.contact;
			delete o.query;

			if (!Array.isArray(o.data)) {
				o.data = [o.data];
			}

			o.data.forEach(formatFriend);
		}

		return o;
	}

	function formatFriend(contact) {
		contact.id = null;

		// #362: Reports of responses returning a single item, rather than an Array of items.
		// Format the contact.fields to be an array.
		if (contact.fields && !(contact.fields instanceof Array)) {
			contact.fields = [contact.fields];
		}

		(contact.fields || []).forEach(function (field) {
			if (field.type === 'email') {
				contact.email = field.value;
			}

			if (field.type === 'name') {
				contact.first_name = field.value.givenName;
				contact.last_name = field.value.familyName;
				contact.name = field.value.givenName + ' ' + field.value.familyName;
			}

			if (field.type === 'yahooid') {
				contact.id = field.value;
			}
		});
	}

	function paging(res, headers, request) {

		// See: http://developer.yahoo.com/yql/guide/paging.html#local_limits
		if (res.query && res.query.count && request.options) {
			res.paging = {
				next: '?start=' + (res.query.count + (+request.options.start || 1))
			};
		}

		return res;
	}

	function yql(q) {
		return 'https://query.yahooapis.com/v1/yql?q=' + (q + ' limit @{limit|100} offset @{start|0}').replace(/\s/g, '%20') + '&format=json';
	}
})(hello);

},{"../hello.js":4}],20:[function(require,module,exports){
"use strict";

module.exports = function (a, b) {
  return b.filter(function (item) {
    return a.indexOf(item) === -1;
  });
};

},{}],21:[function(require,module,exports){
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

},{}],22:[function(require,module,exports){
"use strict";

module.exports = function (obj) {
  return Array.prototype.slice.call(obj);
};

},{}],23:[function(require,module,exports){
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

},{}],24:[function(require,module,exports){
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

},{"../../object/extend.js":47,"../../string/jsonParse.js":60}],25:[function(require,module,exports){
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

},{"../../array/find.js":21,"./Storage.js":24}],26:[function(require,module,exports){
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

},{"./Storage.js":24,"./sessionStorage.js":27}],27:[function(require,module,exports){
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

},{"./Storage.js":24,"./cookieStorage.js":25}],28:[function(require,module,exports){
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

},{"../../array/toArray.js":22,"../../dom/append.js":33,"../../dom/attr.js":34,"../../dom/createElement.js":35,"../../dom/domInstance.js":36,"../../events/emit.js":41,"../../events/globalCallback.js":42,"../../events/on.js":43,"../../object/instanceOf.js":49,"../../time/setImmediate.js":66}],29:[function(require,module,exports){
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

},{"../../dom/createElement.js":35,"../../events/createEvent.js":40}],30:[function(require,module,exports){
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

},{"../../events/globalCallback.js":42,"./getScript.js":29}],31:[function(require,module,exports){
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

},{"../../events/globalCallback.js":42,"../../object/extend.js":47,"../../string/createUrl.js":58,"../../support/cors.js":65,"./formpost.js":28,"./jsonp.js":30,"./xhr.js":32}],32:[function(require,module,exports){
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

},{"../../object/instanceOf.js":49,"../../object/rewire.js":54,"../../object/tryCatch.js":57,"../../string/extract.js":59,"../../string/jsonParse.js":60}],33:[function(require,module,exports){
'use strict';

var createElement = require('./createElement.js');

module.exports = function (tagName, prop) {
	var parent = arguments.length <= 2 || arguments[2] === undefined ? document.body : arguments[2];

	var elm = createElement(tagName, prop);
	parent.appendChild(elm);
	return elm;
};

},{"./createElement.js":35}],34:[function(require,module,exports){
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

},{"./each.js":37}],35:[function(require,module,exports){
'use strict';

var attr = require('./attr.js');

module.exports = function (tagName, attrs) {
	var elm = document.createElement(tagName);
	attr(elm, attrs);
	return elm;
};

},{"./attr.js":34}],36:[function(require,module,exports){
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

},{"../object/instanceOf.js":49}],37:[function(require,module,exports){
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

},{"../array/toArray.js":22,"../object/instanceOf.js":49,"./isDom.js":39}],38:[function(require,module,exports){
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

},{"../string/param.js":61,"./append.js":33}],39:[function(require,module,exports){
'use strict';

var instanceOf = require('../object/instanceOf.js');

var _HTMLElement = typeof HTMLElement !== 'undefined' ? HTMLElement : Element;
var _HTMLDocument = typeof HTMLDocument !== 'undefined' ? HTMLDocument : Document;
var _Window = window.constructor;

module.exports = function (test) {
	return instanceOf(test, _HTMLElement) || instanceOf(test, _HTMLDocument) || instanceOf(test, _Window);
};

},{"../object/instanceOf.js":49}],40:[function(require,module,exports){
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

},{}],41:[function(require,module,exports){
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

},{"../dom/each.js":37,"./createEvent.js":40}],42:[function(require,module,exports){
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

},{"../string/random.js":64}],43:[function(require,module,exports){
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

},{"../dom/each.js":37}],44:[function(require,module,exports){
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

},{}],45:[function(require,module,exports){
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

},{"./isBinary.js":50}],46:[function(require,module,exports){
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

},{}],47:[function(require,module,exports){
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

},{"./instanceOf.js":49}],48:[function(require,module,exports){
'use strict';

var isBinary = require('./isBinary.js');

// Some of the providers require that only multipart is used with non-binary forms.
// This function checks whether the form contains binary data
module.exports = function (data) {
	for (var x in data) {
		if (data.hasOwnProperty(x)) {
			if (isBinary(data[x])) {
				return true;
			}
		}
	}

	return false;
};

},{"./isBinary.js":50}],49:[function(require,module,exports){
"use strict";

module.exports = function (test, root) {
  return root && test instanceof root;
};

},{}],50:[function(require,module,exports){
'use strict';

var instanceOf = require('./instanceOf.js');

module.exports = function (data) {
	return instanceOf(data, Object) && (instanceOf(data, typeof HTMLInputElement !== 'undefined' ? HTMLInputElement : undefined) && data.type === 'file' || instanceOf(data, typeof HTMLInput !== 'undefined' ? HTMLInput : undefined) && data.type === 'file' || instanceOf(data, typeof FileList !== 'undefined' ? FileList : undefined) || instanceOf(data, typeof File !== 'undefined' ? File : undefined) || instanceOf(data, typeof Blob !== 'undefined' ? Blob : undefined));
};

},{"./instanceOf.js":49}],51:[function(require,module,exports){
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

},{}],52:[function(require,module,exports){
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

},{"./extend.js":47}],53:[function(require,module,exports){
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

},{"../time/setImmediate.js":66}],54:[function(require,module,exports){
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

},{}],55:[function(require,module,exports){
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

},{"../time/setImmediate.js":66}],56:[function(require,module,exports){
'use strict';

// Convert Data-URI to Blob string

var reg = /^data\:([^;,]+(\;charset=[^;,]+)?)(\;base64)?,/i;

module.exports = function (dataURI) {
	var m = dataURI.match(reg);
	if (!m) {
		return dataURI;
	}

	var binary = atob(dataURI.replace(reg, ''));
	var len = binary.length;
	var arr = new Uint8Array(len);

	for (var i = 0; i < len; i++) {
		arr[i] = binary.charCodeAt(i);
	}

	return new Blob([arr], { type: m[1] });
};

},{}],57:[function(require,module,exports){
"use strict";

module.exports = function (fn) {
	try {
		return fn.call(null);
	} catch (e) {
		// Continue
	}
};

},{}],58:[function(require,module,exports){
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

},{"../object/isEmpty.js":51,"./querystringify.js":63}],59:[function(require,module,exports){
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

},{}],60:[function(require,module,exports){
'use strict';

var tryCatch = require('../object/tryCatch.js');
module.exports = function (str) {
  return tryCatch(function () {
    return JSON.parse(str);
  });
};

},{"../object/tryCatch.js":57}],61:[function(require,module,exports){
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

},{}],62:[function(require,module,exports){
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

},{"./extract.js":59}],63:[function(require,module,exports){
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

},{"./param.js":61}],64:[function(require,module,exports){
"use strict";

module.exports = function () {
  return parseInt(Math.random() * 1e12, 10).toString(36);
};

},{}],65:[function(require,module,exports){
'use strict';

module.exports = 'withCredentials' in new XMLHttpRequest();

},{}],66:[function(require,module,exports){
'use strict';

module.exports = typeof setImmediate === 'function' ? setImmediate : function (cb) {
  return setTimeout(cb, 0);
};

},{}],67:[function(require,module,exports){
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

},{}],68:[function(require,module,exports){
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

},{"../string/param.js":61}],69:[function(require,module,exports){
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
