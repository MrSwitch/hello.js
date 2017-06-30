/* global chrome */
// Script to support ChromeApps
// This overides the hello.utils.popup method to support chrome.identity.launchWebAuthFlow
// See https://developer.chrome.com/apps/app_identity#non

const URL = require('tricks/window/url');
const hello = require('./hello');

// Is this a chrome app?
if (typeof chrome === 'object' && typeof chrome.identity === 'object' && chrome.identity.launchWebAuthFlow) {

	// Swap the popup method
	hello.utils.popup = function(url) {

		return _open(url, true);

	};

	// Swap the hidden iframe method
	hello.utils.iframe = function(url) {

		_open(url, false);

	};

	// Swap the request_cors method
	hello.utils.request_cors = function(callback) {

		callback();

		// Always run as CORS

		return true;
	};

	// Swap the storage method
	let _cache = {};
	chrome.storage.local.get('hello', r => {
		// Update the cache
		_cache = r.hello || {};
	});

	hello.utils.store = function(name, value) {

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
			chrome.storage.local.set({hello: _cache});
			return value;
		}

		// Delete
		if (value === null) {
			delete _cache[name];
			chrome.storage.local.set({hello: _cache});
			return null;
		}
	};
}

// Export HelloJS
module.exports = hello;


// Open function
function _open(url, interactive) {

	// Launch
	const ref = {
		closed: false
	};

		// Launch the webAuthFlow
	chrome.identity.launchWebAuthFlow({
		url,
		interactive
	}, responseUrl => {

		// Did the user cancel this prematurely
		if (responseUrl === undefined) {
			ref.closed = true;
			return;
		}

		// Split appart the URL
		const a = URL(responseUrl);

		// The location can be augmented in to a location object like so...
		// We dont have window operations on the popup so lets create some
		const _popup = {
			location: {

				// Change the location of the popup
				assign(url) {

					// If there is a secondary reassign
					// In the case of OAuth1
					// Trigger this in non-interactive mode.
					_open(url, false);
				},

				search: a.search,
				hash: a.hash,
				href: a.href
			},
			close() {}
		};

			// Then this URL contains information which HelloJS must process
			// URL string
			// Window - any action such as window relocation goes here
			// Opener - the parent window which opened this, aka this script

		hello.utils.responseHandler(_popup, window);
	});

	// Return the reference
	return ref;
}
