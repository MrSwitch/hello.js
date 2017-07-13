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

const argmap = require('tricks/object/args');
const clone = require('tricks/object/clone');
const closeWindow = require('tricks/window/close');
const createUrl = require('tricks/string/createUrl');
const diffKey = require('tricks/object/diffKey');
const diff = require('tricks/array/diff');
const extend = require('tricks/object/extend');
const globalCallback = require('tricks/events/globalCallback');
const iframe = require('tricks/dom/hiddenFrame');
const isEmpty = require('tricks/object/isEmpty');
const merge = require('tricks/object/merge');
const queryparse = require('tricks/string/queryparse');
const querystringify = require('tricks/string/querystringify');
const popup = require('tricks/window/popup');
const pubsub = require('tricks/object/pubsub');
const random = require('tricks/string/random');
const request = require('tricks/http/request');
const store = require('tricks/browser/agent/localStorage');
const unique = require('tricks/array/unique');
const Url = require('tricks/window/url');
const Until = require('tricks/object/until');

const hello = function(name) {
	return hello.use(name);
};

module.exports = hello;

extend(hello, {

	settings: {

		// OAuth2 authentication defaults
		redirect_uri: (typeof location !== 'undefined' ? location.href.split('#')[0] : null),
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
		page_uri: (typeof location !== 'undefined' ? location.href : null)
	},

	// Service configuration objects
	services: {},

	// Use
	// Define a new instance of the HelloJS library with a default service
	use(service) {

		// Create self, which inherits from its parent
		const self = Object.create(this);

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
	init(services, options) {

		if (!services) {
			return this.services;
		}

		// Define provider credentials
		// Reformat the ID field
		for (const x in services) {
			if (services.hasOwnProperty(x)) {
				if (typeof (services[x]) !== 'object') {
					services[x] = {id: services[x]};
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
	async login(...args) {

		const utils = this.utils;
		// Get parameters
		const p = argmap({network: 's', options: 'o', callback: 'f'}, args);

		// Local vars
		let url;

		// Get all the custom options and store to be appended to the querystring
		const qs = diffKey(p.options, this.settings);

		// Merge/override options with app defaults
		const opts = p.options = merge(this.settings, p.options || {});

		// Merge/override options with app defaults
		opts.popup = merge(this.settings.popup, p.options.popup || {});

		// Network
		p.network = p.network || this.settings.default_service;

		// Is our service valid?
		if (typeof (p.network) !== 'string' || !(p.network in this.services)) {
			// Trigger the default login.
			// Ahh we dont have one.
			throw error('invalid_network', 'The provided network was not recognized');
		}

		const provider = this.services[p.network];

		// Create a global listener to capture events triggered out of scope
		const callbackId = `_hellojs_${random()}`;

		const prs = [];

		prs.push(new Promise((accept, reject) => {
			globalCallback(str => {

				// The responseHandler returns a string, lets save this locally
				let obj;

				if (str) {
					obj = JSON.parse(str);
				}
				else {
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
				}
				else {
					// Reject a successful login
					reject(obj);
				}
			}, callbackId);
		}));

		const redirectUri = Url(opts.redirect_uri).href;

		// May be a space-delimited list of multiple, complementary types
		let responseType = provider.oauth.response_type || opts.response_type;

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
		const session = utils.store(p.network);

		// Scopes (authentication permisions)
		// Ensure this is a string - IE has a problem moving Arrays between windows
		// Append the setup scope
		const SCOPE_SPLIT = /[,\s]+/;

		// Include default scope settings (cloned).
		let scope = this.settings.scope ? [this.settings.scope.toString()] : [];

		// Extend the providers scope list with the default
		const scopeMap = merge(this.settings.scope_map, provider.scope || {});

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
		// Does this have a mapping?
		scope = scope.map(item => ((item in scopeMap) ? scopeMap[item] : item));

		// Stringify and Arrayify so that double mapped scopes are given the chance to be formatted
		scope = scope.join(',').split(SCOPE_SPLIT);

		// Again...
		// Format remove duplicates and empty values
		scope = unique(scope).filter(filterEmpty);

		// Join with the expected scope delimiter into a string
		p.qs.scope = scope.join(provider.scope_delim || ',');

		// Is the user already signed in with the appropriate scopes, valid access_token?
		if (opts.force === false) {

			if (session && 'access_token' in session && session.access_token && 'expires' in session && session.expires > ((new Date()).getTime() / 1e3)) {
				// What is different about the scopes in the session vs the scopes in the new login?
				const a = diff((session.scope || '').split(SCOPE_SPLIT), (p.qs.state.scope || '').split(SCOPE_SPLIT));
				if (a.length === 0) {

					// OK trigger the callback
					return {
						unchanged: true,
						network: p.network,
						authResponse: session
					};
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
		if ('login' in provider && typeof (provider.login) === 'function') {
			// Format the paramaters according to the providers formatting function
			provider.login(p);
		}

		// Add OAuth to state
		// Where the service is going to take advantage of the oauth_proxy
		if (!/\btoken\b/.test(responseType) ||
		parseInt(provider.oauth.version, 10) < 2 ||
		(opts.display === 'none' && provider.oauth.grant && session && session.refresh_token)) {

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
		}
		else {
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

			const win = utils.popup(url, redirectUri, opts.popup);

			// Monitor the state of the popup...
			prs.push(Until((accept, reject) => {
				if (!win || win.closed) {

					let response = error('cancelled', 'Login has been cancelled');

					if (!popup) {
						response = error('blocked', 'Popup was blocked');
					}

					response.network = p.network;

					reject(response);
				}
			}, 100));
		}

		else {
			window.location = url;
		}

		function encodeFunction(s) {
			return s;
		}

		function filterEmpty(s) {
			return !!s;
		}

		// Return the first success or failure...
		const promise = Promise.race(prs);

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
	async logout(...args) {

		const utils = this.utils;

		const p = argmap({name: 's', options: 'o', callback: 'f'}, args);

		const prs = [];

		p.options = p.options || {};

		// Network
		p.name = p.name || this.settings.default_service;
		p.authResponse = utils.store(p.name);

		if (p.name && !(p.name in this.services)) {

			throw error('invalid_network', 'The network was unrecognized');

		}
		else if (p.name && p.authResponse) {

			const promiseLogout = new Promise(accept => {
				// Run an async operation to remove the users session
				const _opts = {};

				if (p.options.force) {
					let logout = this.services[p.name].logout;
					if (logout) {
						// Convert logout to URL string,
						// If no string is returned, then this function will handle the logout async style
						if (typeof (logout) === 'function') {
							logout = logout(accept, p);
						}

						// If logout is a string then assume URL and open in iframe.
						if (typeof (logout) === 'string') {
							utils.iframe(logout);
							_opts.force = null;
							_opts.message = 'Logout success on providers site was indeterminate';
						}
						else if (logout === undefined) {
							// The callback function will handle the response.
							return;
						}
					}
				}

				accept(_opts);
			})
				.then(opts => {

					// Remove from the store
					utils.store(p.name, null);

					// Emit events by default
					return merge({
						network: p.name
					}, opts || {});
				});

			prs.push(promiseLogout);

		}
		else {
			throw error('invalid_session', 'There was no session to remove');
		}

		// Promse
		const promise = Promise.race(prs);

		// Add callback to events
		promise.then(p.callback, p.callback);

		// Trigger an event on the global listener
		promise.then(
			value => hello.emit('auth.logout auth', value),
			err => hello.emit('error', err)
		);

		return promise;
	},

	// Returns all the sessions that are subscribed too
	// @param string optional, name of the service to get information about.
	getAuthResponse(service) {

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
			code,
			message
		}
	};
}

hello.utils = {
	iframe,
	popup,
	request,
	store
};

// Core utilities
extend(hello.utils, {

	// OAuth and API response handler
	responseHandler(window, parent) {
		const utils = this;

		let p;
		const location = window.location;

		const redirect = (location.assign && location.assign.bind(location)) || (url => {
			window.location = url;
		});

		// Is this an auth relay message which needs to call the proxy?
		p = queryparse(location.search);

		// OAuth2 or OAuth1 server response?
		if (p && p.state && (p.code || p.oauth_token)) {

			// State
			const state = JSON.parse(p.state);

			// Add this path as the redirect_uri
			p.redirect_uri = state.redirect_uri || location.href.replace(/[?#].*$/, '');

			// Redirect to the host
			const path = `${state.oauth_proxy}?${querystringify(p)}`;

			redirect(path);

			return;
		}

		// Save session, from redirected authentication
		// #access_token has come in?
		//
		// FACEBOOK is returning auth errors within as a query_string... thats a stickler for consistency.
		// SoundCloud is the state in the querystring and the token in the hashtag, so we'll mix the two together

		p = merge(queryparse(location.search || ''), queryparse(location.hash || ''));

		// If p.state
		if (p && 'state' in p) {

			// Remove any addition information
			// E.g. p.state = 'facebook.page';
			try {
				const a = JSON.parse(p.state);
				extend(p, a);
			}
			catch (e) {
				hello.emit('error', 'Could not decode state parameter');
			}

			// Access_token?
			if (('access_token' in p && p.access_token) && p.network) {

				if (!p.expires_in || parseInt(p.expires_in, 10) === 0) {
					// If p.expires_in is unset, set to 0
					p.expires_in = 0;
				}

				p.expires_in = parseInt(p.expires_in, 10);
				p.expires = ((new Date()).getTime() / 1e3) + (p.expires_in || (60 * 60 * 24 * 365));

				// Lets use the "state" to assign it to one of our networks
				authCallback(p, window, parent);
			}

			// Error=?
			// &error_description=?
			// &state=?
			else if (('error' in p && p.error) && p.network) {

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
				const res = 'result' in p && p.result ? JSON.parse(p.result) : false;

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

			const cb = obj.callback;
			const network = obj.network;

			// Trigger the callback on the parent
			utils.store(network, obj);

			// If this is a page request it has no parent or opener window to handle callbacks
			if (('display' in obj) && obj.display === 'page') {
				return;
			}

			// Remove from session object
			if (parent && cb && cb in parent) {

				try {
					delete obj.callback;
				}
				catch (e) {
					// continue
				}

				// Update store
				utils.store(network, obj);

				// Call the globalEvent function on the parent
				// It's safer to pass back a string to the parent,
				// Rather than an object/array (better for IE8)
				const str = JSON.stringify(obj);

				try {
					callback(parent, cb)(str);
				}
				catch (e) {
					// Error thrown whilst executing parent callback
				}
			}

			closeWindow(window);
		}

		function callback(parent, callbackID) {
			if (callbackID.indexOf('_hellojs_') !== 0) {
				return function() {
					throw `Could not execute callback ${callbackID}`;
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

(function(hello) {

	// Monitor for a change in state and fire
	const oldSessions = {};

	// Hash of expired tokens
	const expired = {};

	// Listen to other triggers to Auth events, use these to update this
	hello.on('auth.login, auth.logout', auth => {
		if (auth && typeof (auth) === 'object' && auth.network) {
			oldSessions[auth.network] = hello.utils.store(auth.network) || {};
		}
	});

	(function self() {

		const CURRENT_TIME = ((new Date()).getTime() / 1e3);

		// Loop through the services
		for (const name in hello.services) {
			if (hello.services.hasOwnProperty(name)) {

				if (!hello.services[name].id) {
				// We haven't attached an ID so dont listen.
					continue;
				}

				// Get session
				const session = hello.utils.store(name) || {};
				const provider = hello.services[name];
				const oldSess = oldSessions[name] || {};

				const emit = function(eventName) {
					hello.emit(`auth.${eventName}`, {
						network: name,
						authResponse: session
					});
				};

				// Listen for globalEvents that did not get triggered from the child
				if (session && 'callback' in session) {

					// To do remove from session object...
					const cb = session.callback;
					try {
						delete session.callback;
					}
					catch (e) {
						// Continue
					}

					// Update store
					// Removing the callback
					hello.utils.store(name, session);

					// Emit global events
					try {
						window[cb](session);
					}
					catch (e) {
						// Continue
					}
				}

				// Refresh token
				if (session && ('expires' in session) && session.expires < CURRENT_TIME) {

					// If auto refresh is possible
					// Either the browser supports
					const refresh = provider.refresh || session.refresh_token;

					// Has the refresh been run recently?
					if (refresh && (!(name in expired) || expired[name] < CURRENT_TIME)) {
						// Try to resignin
						hello.emit('notice', `${name} has expired trying to resignin`);
						hello.login(name, {display: 'none', force: false});

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
				else if (oldSess.access_token === session.access_token &&
			oldSess.expires === session.expires) {
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

hello.api = async function(...args) {

	// Arguments
	const p = argmap({path: 's!', query: 'o', method: 's', data: 'o', timeout: 'i', callback: 'f'}, args);

	// Remove the network from path, e.g. facebook:/me/friends
	// Results in { network : facebook, path : me/friends }
	if (!p || !p.path) {
		throw error('invalid_path', 'Missing the path parameter from the request');
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

	const data = p.data = p.data || {};

	p.path = p.path.replace(/^\/+/, '');
	const a = (p.path.split(/[/:]/, 2) || [])[0].toLowerCase();

	if (a in this.services) {
		p.network = a;
		const reg = new RegExp(`^${a}:?/?`);
		p.path = p.path.replace(reg, '');
	}

	// Network & Provider
	// Define the network that this request is made for
	p.network = this.settings.default_service = p.network || this.settings.default_service;
	const o = this.services[p.network];

	// INVALID
	// Is there no service by the given network name?
	if (!o) {
		throw error('invalid_network', `Could not match the service requested: ${  p.network}`);
	}

	// PATH
	// As long as the path isn't flagged as unavaiable, e.g. path == false

	if (!(!(p.method in o) || !(p.path in o[p.method]) || o[p.method][p.path] !== false)) {
		throw error('invalid_path', 'The provided path is not available on the selected network');
	}

	// PROXY
	// OAuth1 calls always need a proxy

	if (!p.oauth_proxy) {
		p.oauth_proxy = this.settings.oauth_proxy;
	}

	if (!('proxy' in p)) {
		p.proxy = p.oauth_proxy && o.oauth && parseInt(o.oauth.version, 10) === 1;
	}

	// TIMEOUT
	// Adopt timeout from global settings by default

	if (!('timeout' in p)) {
		p.timeout = this.settings.timeout;
	}

	// Format response
	// Whether to run the raw response through post processing.
	if (!('formatResponse' in p)) {
		p.formatResponse = true;
	}

	// Get the current session
	// Append the access_token to the query
	p.authResponse = this.getAuthResponse(p.network);
	if (p.authResponse && p.authResponse.access_token) {
		p.query.access_token = p.authResponse.access_token;
	}

	let url = p.path;
	let m;

	// Store the query as options
	// This is used to populate the request object before the data is augmented by the prewrap handlers.
	p.options = clone(p.query);

	// Clone the data object
	// Prevent this script overwriting the data of the incoming object.
	// Ensure that everytime we run an iteration the callbacks haven't removed some data
	p.data = clone(data);

	// URL Mapping
	// Is there a map for the given URL?
	const actions = o[{delete: 'del'}[p.method] || p.method] || {};

	// Extrapolate the QueryString
	// Provide a clean path
	// Move the querystring into the data
	if (p.method === 'get') {

		const query = url.split(/[?#]/)[1];
		if (query) {
			extend(p.query, queryparse(query));

			// Remove the query part from the URL
			url = url.replace(/\?.*?(#|$)/, '$1');
		}
	}

	// Is the hash fragment defined
	if ((m = url.match(/#(.+)/, ''))) {
		url = url.split('#')[0];
		p.path = m[1];
	}
	else if (url in actions) {
		p.path = url;
		url = actions[url];
	}
	else if ('default' in actions) {
		url = actions.default;
	}

	// Redirect Handler
	// This defines for the Form+Iframe+Hash hack where to return the results too.
	p.redirect_uri = this.settings.redirect_uri;

	// Define FormatHandler
	// The request can be procesed in a multitude of ways
	// Here's the options - depending on the browser and endpoint
	p.xhr = o.xhr;
	p.jsonp = o.jsonp;
	p.form = o.form;

	// Define Proxy handler
	p.proxyHandler = hello.utils.proxyHandler;

	// If url needs a base
	// Wrap everything in

	let promise;

	// Make request
	if (typeof (url) === 'function') {
		// Does self have its own callback?
		promise = new Promise(accept => url(p, accept));
	}
	else {
		// Else the URL is a string
		promise = Promise.resolve(url);
	}

	// Handle the url...
	promise = promise.then(url => {

		// Format the string if it needs it
		url = url.replace(/@\{([a-z_-]+)(\|.*?)?\}/gi, (m, key, defaults) => {
			let val = defaults ? defaults.replace(/^\|/, '') : '';
			if (key in p.query) {
				val = p.query[key];
				delete p.query[key];
			}
			else if (p.data && key in p.data) {
				val = p.data[key];
				delete p.data[key];
			}
			else if (!defaults) {
				throw error('missing_attribute', `The attribute ${  key  } is missing from the request`);
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
		return new Promise(accept => this.utils.request(p, (data, headers) => accept({data, headers})));

	})
		.then(resp => {

			let {data} = resp;
			const {headers} = resp;

			// Is this a raw response?
			if (!p.formatResponse) {
				// Bad request? error statusCode or otherwise contains an error response vis JSONP?
				if (typeof headers === 'object' ? (headers.statusCode >= 400) : (typeof r === 'object' && 'error' in data)) {
					throw data;
				}

				return data;
			}

			// Should this be an object
			if (data === true) {
				data = {success: true};
			}

			// The delete callback needs a better response
			if (p.method === 'delete') {
				data = (!data || isEmpty(data)) ? {success: true} : data;
			}

			// FORMAT RESPONSE?
			// Does self request have a corresponding formatter
			if (o.wrap && ((p.path in o.wrap) || ('default' in o.wrap))) {
				const wrap = (p.path in o.wrap ? p.path : 'default');

				// FORMAT RESPONSE
				const b = o.wrap[wrap](data, headers, p);

				// Has the response been utterly overwritten?
				// Typically self augments the existing object.. but for those rare occassions
				if (b) {
					data = b;
				}
			}

			// Is there a next_page defined in the response?
			if (data && 'paging' in data && data.paging.next) {

				// Add the relative path if it is missing from the paging/next path
				if (data.paging.next[0] === '?') {
					data.paging.next = p.path + data.paging.next;
				}

				// The relative path has been defined, lets markup the handler in the HashFragment
				else {
					data.paging.next += `#${  p.path}`;
				}
			}

			// Dispatch to listeners
			// Emit events which pertain to the formatted response
			if (!data || 'error' in data) {
				throw data;
			}
			else {
				return data;
			}
		});

	// Completed event callback
	promise.then(p.callback, p.callback);

	return promise;
};

/**
 * ProxyHandler
 * Defines any post protocol handling
 * e.g. manipulating the request to route via a thirdparty service
 */

hello.utils.proxyHandler = (p, callback) => {

	const authResponse = p.authResponse;

	// Are we signing the request?
	let access_token = '';

	// OAuth1
	// Remove the token from the query before signing
	if (authResponse && authResponse.oauth && parseInt(authResponse.oauth.version, 10) === 1) {

		// OAUTH SIGNING PROXY
		access_token = p.query.access_token || '';

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

	// Proxy the request through a server
	// Used for signing OAuth1
	// And circumventing services without Access-Control Headers
	if (p.proxy) {

		// Construct the path
		const path = createUrl(p.url, p.query);

		p.url = p.oauth_proxy;
		p.query = {
			path,
			access_token,

			// This will prompt the request to be signed as though it is OAuth1
			then: p.proxy_response_type || (p.method.toLowerCase() === 'get' ? 'redirect' : 'proxy'),
			method: p.method.toLowerCase(),
			suppress_response_codes: true
		};

		console.log(path);
	}

	callback();
};


/////////////////////////////////////
//
// Save any access token that is in the current page URL
// Handle any response solicited through iframe hash tag following an API request
//
/////////////////////////////////////

hello.utils.responseHandler(window, window.opener || window.parent);

module.exports = hello;