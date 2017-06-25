(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.hello = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

module.exports = function (a, b) {
  return b.filter(function (item) {
    return a.indexOf(item) === -1;
  });
};

},{}],2:[function(require,module,exports){
"use strict";

// Array find
// Returns the first non undefined response
// If the response is (Boolean) True, then the value of that array item is returned instead...
module.exports = function (arr, callback) {
	var thisArg = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

	for (var i = 0; i < arr.length; i++) {
		var value = callback.call(thisArg, arr[i]);
		if (value !== undefined) {
			return value === true ? arr[i] : value;
		}
	}
};

},{}],3:[function(require,module,exports){
"use strict";

module.exports = function (obj) {
  return Array.prototype.slice.call(obj);
};

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var jsonParse = require(38);
var extend = require(28);

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

},{"28":28,"38":38}],6:[function(require,module,exports){
'use strict';

// Provide an API for setting and retrieving cookies
var arrayFind = require(2);
var Storage = require(5);

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

},{"2":2,"5":5}],7:[function(require,module,exports){
'use strict';

// sessionStorage
// Shimmed up sessionStorage

var sessionStorage = require(8);
var Storage = require(5);

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

},{"5":5,"8":8}],8:[function(require,module,exports){
'use strict';

// sessionStorage
// Shimmed up sessionStorage

var cookieStorage = require(6);
var Storage = require(5);

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

},{"5":5,"6":6}],9:[function(require,module,exports){
'use strict';

// Post
// Send information to a remote location using the post mechanism
// @param string uri path
// @param object data, key value data to send
// @param function callback, function to execute in response

var append = require(14);
var attr = require(15);
var domInstance = require(17);
var createElement = require(16);
var globalCallback = require(23);
var toArray = require(3);
var instanceOf = require(29);
var on = require(24);
var emit = require(22);
var setImmediate = require(44);

module.exports = function (url, data, options, callback, callback_name) {
	var timeout = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 60000;


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

},{"14":14,"15":15,"16":16,"17":17,"22":22,"23":23,"24":24,"29":29,"3":3,"44":44}],10:[function(require,module,exports){
'use strict';

var createElement = require(16);
var createEvent = require(21);

module.exports = function (url, callback) {
	var timeout = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;


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

},{"16":16,"21":21}],11:[function(require,module,exports){
'use strict';

// JSONP
var globalCallback = require(23);
var getScript = require(10);

var MATCH_CALLBACK_PLACEHOLDER = /=\?(&|$)/;

module.exports = function (url, callback, callback_name) {
	var timeout = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 60000;


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

},{"10":10,"23":23}],12:[function(require,module,exports){
'use strict';

// Request
// Makes an REST request given an object which describes how (aka, xhr, jsonp, formpost)
var jsonp = require(11);
var xhr = require(13);
var formpost = require(9);
var SupportCORS = require(43);
var globalCallback = require(23);
var createUrl = require(36);
var extend = require(28);

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

			return;
		}
	}

	callback({ error: 'invalid_request' });
};

},{"11":11,"13":13,"23":23,"28":28,"36":36,"43":43,"9":9}],13:[function(require,module,exports){
'use strict';

// XHR: uses CORS to make requests
var instanceOf = require(29);
var extract = require(37);
var jsonParse = require(38);
var tryCatch = require(35);
var rewire = require(34);

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

},{"29":29,"34":34,"35":35,"37":37,"38":38}],14:[function(require,module,exports){
'use strict';

var createElement = require(16);

module.exports = function (tagName, prop) {
	var parent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : document.body;

	var elm = createElement(tagName, prop);
	parent.appendChild(elm);
	return elm;
};

},{"16":16}],15:[function(require,module,exports){
'use strict';

var each = require(18);

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

},{"18":18}],16:[function(require,module,exports){
'use strict';

var attr = require(15);

module.exports = function (tagName, attrs) {
	var elm = document.createElement(tagName);
	attr(elm, attrs);
	return elm;
};

},{"15":15}],17:[function(require,module,exports){
'use strict';

var instanceOf = require(29);

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

},{"29":29}],18:[function(require,module,exports){
'use strict';

var isDom = require(20);
var instanceOf = require(29);
var toArray = require(3);

module.exports = function (matches) {
	var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};


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

},{"20":20,"29":29,"3":3}],19:[function(require,module,exports){
'use strict';

var append = require(14);
var param = require(39);

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

},{"14":14,"39":39}],20:[function(require,module,exports){
'use strict';

var instanceOf = require(29);

var _HTMLElement = typeof HTMLElement !== 'undefined' ? HTMLElement : Element;
var _HTMLDocument = typeof HTMLDocument !== 'undefined' ? HTMLDocument : Document;
var _Window = window.constructor;

module.exports = function (test) {
	return instanceOf(test, _HTMLElement) || instanceOf(test, _HTMLDocument) || instanceOf(test, _Window);
};

},{"29":29}],21:[function(require,module,exports){
'use strict';

// IE does not support `new Event()`
// See https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events for details
var dict = { bubbles: true, cancelable: true };

var createEvent = function createEvent(eventname) {
	var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : dict;
	return new Event(eventname, options);
};

try {
	createEvent('test');
} catch (e) {
	createEvent = function createEvent(eventname) {
		var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : dict;

		var e = document.createEvent('Event');
		e.initEvent(eventname, !!options.bubbles, !!options.cancelable);
		return e;
	};
}

module.exports = createEvent;

},{}],22:[function(require,module,exports){
'use strict';

// on.js
// Listen to events, this is a wrapper for addEventListener
var each = require(18);
var createEvent = require(21);

// Return
module.exports = function (elements, eventname) {
  return each(elements, function (el) {
    return el.dispatchEvent(createEvent(eventname));
  });
};

},{"18":18,"21":21}],23:[function(require,module,exports){
'use strict';

// Global Events
// Attach the callback to the window object
// Return its unique reference
var random = require(42);

module.exports = function (callback, guid) {
	var prefix = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '_tricks_';


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

},{"42":42}],24:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// on.js
// Listen to events, this is a wrapper for addEventListener

var each = require(18);
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
	var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;


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

},{"18":18}],25:[function(require,module,exports){
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

},{}],26:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var isBinary = require(30);

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

},{"30":30}],27:[function(require,module,exports){
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

},{}],28:[function(require,module,exports){
'use strict';

var instanceOf = require(29);

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

},{"29":29}],29:[function(require,module,exports){
"use strict";

module.exports = function (test, root) {
  return root && test instanceof root;
};

},{}],30:[function(require,module,exports){
'use strict';

var instanceOf = require(29);

module.exports = function (data) {
	return instanceOf(data, Object) && (instanceOf(data, typeof HTMLInputElement !== 'undefined' ? HTMLInputElement : undefined) && data.type === 'file' || instanceOf(data, typeof HTMLInput !== 'undefined' ? HTMLInput : undefined) && data.type === 'file' || instanceOf(data, typeof FileList !== 'undefined' ? FileList : undefined) || instanceOf(data, typeof File !== 'undefined' ? File : undefined) || instanceOf(data, typeof Blob !== 'undefined' ? Blob : undefined));
};

},{"29":29}],31:[function(require,module,exports){
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

},{}],32:[function(require,module,exports){
'use strict';

// Extend an object
var extend = require(28);

module.exports = function () {
	for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
		args[_key] = arguments[_key];
	}

	args.unshift({});
	return extend.apply(undefined, args);
};

},{"28":28}],33:[function(require,module,exports){
'use strict';

// Pubsub extension
// A contructor superclass for adding event menthods, on, off, emit.
var setImmediate = require(44);

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

},{"44":44}],34:[function(require,module,exports){
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

},{}],35:[function(require,module,exports){
"use strict";

module.exports = function (fn) {
	try {
		return fn.call(null);
	} catch (e) {
		// Continue
	}
};

},{}],36:[function(require,module,exports){
'use strict';

var querystringify = require(41);
var isEmpty = require(31);

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

},{"31":31,"41":41}],37:[function(require,module,exports){
"use strict";

// Extract
// Extract the parameters of an URL string
// @param string s, string to decode

module.exports = function (str, match_params) {
	var formatFunction = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function (x) {
		return x;
	};

	var a = {};
	var m = void 0;
	while (m = match_params.exec(str)) {
		a[m[1]] = formatFunction(m[2]);
	}
	return a;
};

},{}],38:[function(require,module,exports){
'use strict';

var tryCatch = require(35);
module.exports = function (str) {
  return tryCatch(function () {
    return JSON.parse(str);
  });
};

},{"35":35}],39:[function(require,module,exports){
'use strict';

// Param
// Explode/encode the parameters of an URL string/object
// @param string s, string to decode
module.exports = function (hash) {
	var delimiter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '&';
	var seperator = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '=';
	var formatFunction = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : function (o) {
		return o;
	};
	return Object.keys(hash).map(function (name) {
		var value = formatFunction(hash[name]);
		return name + (value !== null ? seperator + value : '');
	}).join(delimiter);
};

},{}],40:[function(require,module,exports){
'use strict';

// Create a Query string
var extract = require(37);

var trim_left = /^[\#\?]/;
var match_params = /([^=\/\&]+)=([^\&]+)/g;

module.exports = function (str) {
	var formatFunction = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : decodeURIComponent;

	str = str.replace(trim_left, '');
	return extract(str, match_params, formatFunction);
};

},{"37":37}],41:[function(require,module,exports){
'use strict';

// Create a Query string
var param = require(39);
var fn = function fn(value) {
  return value === '?' ? '?' : encodeURIComponent(value);
};

module.exports = function (o) {
  var formatter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : fn;
  return param(o, '&', '=', formatter);
};

},{"39":39}],42:[function(require,module,exports){
"use strict";

module.exports = function () {
  return parseInt(Math.random() * 1e12, 10).toString(36);
};

},{}],43:[function(require,module,exports){
'use strict';

module.exports = 'withCredentials' in new XMLHttpRequest();

},{}],44:[function(require,module,exports){
'use strict';

module.exports = typeof setImmediate === 'function' ? setImmediate : function (cb) {
  return setTimeout(cb, 0);
};

},{}],45:[function(require,module,exports){
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

},{}],46:[function(require,module,exports){
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

// popup
// Easy options as a hash
var param = require(39);

var documentElement = document.documentElement;
var dimensions = [['Top', 'Height'], ['Left', 'Width']];

module.exports = function (url, target) {
	var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};


	// centers the popup correctly to the current display of a multi-screen display.
	dimensions.forEach(generatePosition.bind(options));

	// Open
	return window.open(url, target, param(options, ','));
};

function generatePosition(_ref) {
	var _ref2 = _slicedToArray(_ref, 2),
	    Position = _ref2[0],
	    Dimension = _ref2[1];

	var position = Position.toLowerCase();
	var dimension = Dimension.toLowerCase();
	if (this[dimension] && !(position in this)) {
		var dualScreenPos = window['screen' + Position] !== undefined ? window['screen' + Position] : screen[position];
		var d = screen[dimension] || window['inner' + Dimension] || documentElement['client' + Dimension];
		this[position] = parseInt((d - this[dimension]) / 2, 10) + dualScreenPos;
	}
}

},{"39":39}],47:[function(require,module,exports){
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

},{}],48:[function(require,module,exports){
'use strict';

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
	return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
	return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

function _asyncToGenerator(fn) {
	return function () {
		var gen = fn.apply(this, arguments);return new Promise(function (resolve, reject) {
			function step(key, arg) {
				try {
					var info = gen[key](arg);var value = info.value;
				} catch (error) {
					reject(error);return;
				}if (info.done) {
					resolve(value);
				} else {
					return Promise.resolve(value).then(function (value) {
						step("next", value);
					}, function (err) {
						step("throw", err);
					});
				}
			}return step("next");
		});
	};
}

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

var argmap = require(25);
var clone = require(26);
var closeWindow = require(45);
var createUrl = require(36);
var diffKey = require(27);
var diff = require(1);
var extend = require(28);
var globalCallback = require(23);
var iframe = require(19);
var isEmpty = require(31);
var merge = require(32);
var param = require(40);
var popup = require(46);
var pubsub = require(33);
var random = require(42);
var request = require(12);
var store = require(7);
var unique = require(4);
var Url = require(47);

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
		var _this = this;

		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		return _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
			var utils, p, url, qs, opts, provider, callbackId, prs, redirectUri, responseType, session, SCOPE_SPLIT, scope, scopeMap, a, win, encodeFunction, filterEmpty, promise, emit;
			return regeneratorRuntime.wrap(function _callee$(_context) {
				while (1) {
					switch (_context.prev = _context.next) {
						case 0:
							emit = function emit(s, value) {
								hello.emit(s, value);
							};

							filterEmpty = function filterEmpty(s) {
								return !!s;
							};

							encodeFunction = function encodeFunction(s) {
								return s;
							};

							utils = _this.utils;
							// Get parameters

							p = argmap({ network: 's', options: 'o', callback: 'f' }, args);

							// Local vars

							url = void 0;

							// Get all the custom options and store to be appended to the querystring

							qs = diffKey(p.options, _this.settings);

							// Merge/override options with app defaults

							opts = p.options = merge(_this.settings, p.options || {});

							// Merge/override options with app defaults

							opts.popup = merge(_this.settings.popup, p.options.popup || {});

							// Network
							p.network = p.network || _this.settings.default_service;

							// Is our service valid?

							if (!(typeof p.network !== 'string' || !(p.network in _this.services))) {
								_context.next = 12;
								break;
							}

							throw error('invalid_network', 'The provided network was not recognized');

						case 12:
							provider = _this.services[p.network];

							// Create a global listener to capture events triggered out of scope

							callbackId = '_hellojs_' + random();
							prs = [];

							prs.push(new Promise(function (accept, reject) {
								globalCallback(function (str) {

									// The responseHandler returns a string, lets save this locally
									var obj = void 0;

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
								}, callbackId);
							}));

							redirectUri = Url(opts.redirect_uri).href;

							// May be a space-delimited list of multiple, complementary types

							responseType = provider.oauth.response_type || opts.response_type;

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
							session = utils.store(p.network);

							// Scopes (authentication permisions)
							// Ensure this is a string - IE has a problem moving Arrays between windows
							// Append the setup scope

							SCOPE_SPLIT = /[,\s]+/;

							// Include default scope settings (cloned).

							scope = _this.settings.scope ? [_this.settings.scope.toString()] : [];

							// Extend the providers scope list with the default

							scopeMap = merge(_this.settings.scope_map, provider.scope || {});

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
							scope = scope.map(function (item) {
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

							if (!(opts.force === false)) {
								_context.next = 38;
								break;
							}

							if (!(session && 'access_token' in session && session.access_token && 'expires' in session && session.expires > new Date().getTime() / 1e3)) {
								_context.next = 38;
								break;
							}

							// What is different about the scopes in the session vs the scopes in the new login?
							a = diff((session.scope || '').split(SCOPE_SPLIT), (p.qs.state.scope || '').split(SCOPE_SPLIT));

							if (!(a.length === 0)) {
								_context.next = 38;
								break;
							}

							return _context.abrupt('return', {
								unchanged: true,
								network: p.network,
								authResponse: session
							});

						case 38:

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
									win = utils.popup(url, redirectUri, opts.popup);

									prs.push(new Promise(function (accept, reject) {

										var timer = setInterval(function () {
											if (!win || win.closed) {
												clearInterval(timer);

												var response = error('cancelled', 'Login has been cancelled');

												if (!popup) {
													response = error('blocked', 'Popup was blocked');
												}

												response.network = p.network;

												reject(response);
											}
										}, 100);
									}));
								} else {
									window.location = url;
								}

							// Return the first success or failure...
							promise = Promise.race(prs);

							// Bind callback to both reject and fulfill states

							promise.then(p.callback, p.callback);

							// Trigger an event on the global listener


							promise.then(emit.bind(_this, 'auth.login auth'), emit.bind(_this, 'auth.failed auth'));

							return _context.abrupt('return', promise);

						case 49:
						case 'end':
							return _context.stop();
					}
				}
			}, _callee, _this);
		}))();
	},

	// Remove any data associated with a given service
	// @param string name of the service
	// @param function callback
	logout: function logout() {
		var _this2 = this;

		for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
			args[_key2] = arguments[_key2];
		}

		return _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
			var utils, p, prs, promiseLogout, promise;
			return regeneratorRuntime.wrap(function _callee2$(_context2) {
				while (1) {
					switch (_context2.prev = _context2.next) {
						case 0:
							utils = _this2.utils;
							p = argmap({ name: 's', options: 'o', callback: 'f' }, args);
							prs = [];

							p.options = p.options || {};

							// Network
							p.name = p.name || _this2.settings.default_service;
							p.authResponse = utils.store(p.name);

							if (!(p.name && !(p.name in _this2.services))) {
								_context2.next = 10;
								break;
							}

							throw error('invalid_network', 'The network was unrecognized');

						case 10:
							if (!(p.name && p.authResponse)) {
								_context2.next = 15;
								break;
							}

							promiseLogout = new Promise(function (accept) {
								// Run an async operation to remove the users session
								var _opts = {};

								if (p.options.force) {
									var logout = _this2.services[p.name].logout;
									if (logout) {
										// Convert logout to URL string,
										// If no string is returned, then this function will handle the logout async style
										if (typeof logout === 'function') {
											logout = logout(accept, p);
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

								accept(_opts);
							}).then(function (opts) {

								// Remove from the store
								utils.store(p.name, null);

								// Emit events by default
								return merge({
									network: p.name
								}, opts || {});
							});

							prs.push(promiseLogout);

							_context2.next = 16;
							break;

						case 15:
							throw error('invalid_session', 'There was no session to remove');

						case 16:

							// Promse
							promise = Promise.race(prs);

							// Add callback to events

							promise.then(p.callback, p.callback);

							// Trigger an event on the global listener
							promise.then(function (value) {
								return hello.emit('auth.logout auth', value);
							}, function (err) {
								return hello.emit('error', err);
							});

							return _context2.abrupt('return', promise);

						case 20:
						case 'end':
							return _context2.stop();
					}
				}
			}, _callee2, _this2);
		}))();
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

		var p = void 0;
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
			p.redirect_uri = state.redirect_uri || location.href.replace(/[?#].*$/, '');

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
				hello.emit('error', 'Could not decode state parameter');
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
				// continue


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

		// Loop through the services

		var _loop = function _loop(name) {
			if (hello.services.hasOwnProperty(name)) {

				if (!hello.services[name].id) {
					// We haven't attached an ID so dont listen.
					return 'continue';
				}

				// Get session
				var session = hello.utils.store(name) || {};
				var provider = hello.services[name];
				var oldSess = oldSessions[name] || {};

				var emit = function emit(eventName) {
					hello.emit('auth.' + eventName, {
						network: name,
						authResponse: session
					});
				};

				// Listen for globalEvents that did not get triggered from the child
				if (session && 'callback' in session) {

					// To do remove from session object...
					var cb = session.callback;
					try {
						delete session.callback;
					} catch (e) {}
					// Continue


					// Update store
					// Removing the callback
					hello.utils.store(name, session);

					// Emit global events
					try {
						window[cb](session);
					} catch (e) {
						// Continue
					}
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
					return 'continue';
				}

				// Has session changed?
				else if (oldSess.access_token === session.access_token && oldSess.expires === session.expires) {
						return 'continue';
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
		};

		for (var name in hello.services) {
			var _ret = _loop(name);

			if (_ret === 'continue') continue;
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
	var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
		var _this3 = this;

		for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
			args[_key3] = arguments[_key3];
		}

		var p, data, a, reg, o, url, m, actions, query, promise;
		return regeneratorRuntime.wrap(function _callee3$(_context3) {
			while (1) {
				switch (_context3.prev = _context3.next) {
					case 0:

						// Arguments
						p = argmap({ path: 's!', query: 'o', method: 's', data: 'o', timeout: 'i', callback: 'f' }, args);

						// Remove the network from path, e.g. facebook:/me/friends
						// Results in { network : facebook, path : me/friends }

						if (!(!p || !p.path)) {
							_context3.next = 3;
							break;
						}

						throw error('invalid_path', 'Missing the path parameter from the request');

					case 3:

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

						data = p.data = p.data || {};

						p.path = p.path.replace(/^\/+/, '');
						a = (p.path.split(/[/:]/, 2) || [])[0].toLowerCase();

						if (a in this.services) {
							p.network = a;
							reg = new RegExp('^' + a + ':?/?');

							p.path = p.path.replace(reg, '');
						}

						// Network & Provider
						// Define the network that this request is made for
						p.network = this.settings.default_service = p.network || this.settings.default_service;
						o = this.services[p.network];

						// INVALID
						// Is there no service by the given network name?

						if (o) {
							_context3.next = 16;
							break;
						}

						throw error('invalid_network', 'Could not match the service requested: ' + p.network);

					case 16:
						if (!(p.method in o) || !(p.path in o[p.method]) || o[p.method][p.path] !== false) {
							_context3.next = 18;
							break;
						}

						throw error('invalid_path', 'The provided path is not available on the selected network');

					case 18:

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

						url = p.path;
						m = void 0;

						// Store the query as options
						// This is used to populate the request object before the data is augmented by the prewrap handlers.

						p.options = clone(p.query);

						// Clone the data object
						// Prevent this script overwriting the data of the incoming object.
						// Ensure that everytime we run an iteration the callbacks haven't removed some data
						p.data = clone(data);

						// URL Mapping
						// Is there a map for the given URL?
						actions = o[{ delete: 'del' }[p.method] || p.method] || {};

						// Extrapolate the QueryString
						// Provide a clean path
						// Move the querystring into the data

						if (p.method === 'get') {
							query = url.split(/[?#]/)[1];

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
						p.proxyHandler = function (p, callback) {

							// Are we signing the request?
							var sign = void 0;

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

						promise = void 0;

						// Make request

						if (typeof url === 'function') {
							// Does self have its own callback?
							promise = new Promise(function (accept) {
								return url(p, accept);
							});
						} else {
							// Else the URL is a string
							promise = Promise.resolve(url);
						}

						// Handle the url...
						promise = promise.then(function (url) {

							// Format the string if it needs it
							url = url.replace(/@\{([a-z_-]+)(\|.*?)?\}/gi, function (m, key, defaults) {
								var val = defaults ? defaults.replace(/^\|/, '') : '';
								if (key in p.query) {
									val = p.query[key];
									delete p.query[key];
								} else if (p.data && key in p.data) {
									val = p.data[key];
									delete p.data[key];
								} else if (!defaults) {
									throw error('missing_attribute', 'The attribute ' + key + ' is missing from the request');
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
							return new Promise(function (accept) {
								return _this3.utils.request(p, function (data, headers) {
									return accept({ data: data, headers: headers });
								});
							});
						}).then(function (resp) {
							var data = resp.data;
							var headers = resp.headers;

							// Is this a raw response?

							if (!p.formatResponse) {
								// Bad request? error statusCode or otherwise contains an error response vis JSONP?
								if ((typeof headers === 'undefined' ? 'undefined' : _typeof(headers)) === 'object' ? headers.statusCode >= 400 : (typeof r === 'undefined' ? 'undefined' : _typeof(r)) === 'object' && 'error' in data) {
									throw data;
								}

								return data;
							}

							// Should this be an object
							if (data === true) {
								data = { success: true };
							}

							// The delete callback needs a better response
							if (p.method === 'delete') {
								data = !data || isEmpty(data) ? { success: true } : data;
							}

							// FORMAT RESPONSE?
							// Does self request have a corresponding formatter
							if (o.wrap && (p.path in o.wrap || 'default' in o.wrap)) {
								var wrap = p.path in o.wrap ? p.path : 'default';

								// FORMAT RESPONSE
								var b = o.wrap[wrap](data, headers, p);

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
										data.paging.next += '#' + p.path;
									}
							}

							// Dispatch to listeners
							// Emit events which pertain to the formatted response
							if (!data || 'error' in data) {
								throw data;
							} else {
								return data;
							}
						});

						// Completed event callback
						promise.then(p.callback, p.callback);

						return _context3.abrupt('return', promise);

					case 41:
					case 'end':
						return _context3.stop();
				}
			}
		}, _callee3, this);
	}));

	return function () {
		return _ref.apply(this, arguments);
	};
}();

/////////////////////////////////////
//
// Save any access token that is in the current page URL
// Handle any response solicited through iframe hash tag following an API request
//
/////////////////////////////////////

hello.utils.responseHandler(window, window.opener || window.parent);

module.exports = hello;

},{"1":1,"12":12,"19":19,"23":23,"25":25,"26":26,"27":27,"28":28,"31":31,"32":32,"33":33,"36":36,"4":4,"40":40,"42":42,"45":45,"46":46,"47":47,"7":7}]},{},[48])(48)
});

//# sourceMappingURL=hello.js.map
