// ES5 Object.create
if (!Object.create) {
	// Shim, Object.create
	// A shim for Object.create(), it adds a prototype to a new object
	Object.create = (function () {
		function F() {}

		return function (o) {
			if (arguments.length !== 1 || typeof o !== 'object' || o === null) {
				throw new TypeError('Object.create implementation only accepts a non-null object.');
			}

			F.prototype = o;
			return new F();
		};
	})();
}

// ES5 Object.keys
if (!Object.keys) {
	Object.keys = function (o) {
		if (o === null || typeof o !== 'object') {
			throw new TypeError('Object.keys called on a non-object');
		}

		var r = [];
		for (var k in o) {
			if (Object.prototype.hasOwnProperty.call(o, k)) {
				r.push(k);
			}
		}
		return r;
	};
}

/* eslint-disable no-extend-native */
// ES5 [].indexOf
if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function (s, fromIndex) {
		var len = this.length >>> 0;
		var start = fromIndex | 0;

		if (len === 0) return -1;

		start = Math.max(start >= 0 ? start : len - Math.abs(start), 0);

		for (var j = start; j < len; j++) {
			if (this[j] === s) {
				return j;
			}
		}

		return -1;
	};
}

// ES5 [].forEach
if (!Array.prototype.forEach) {
	Array.prototype.forEach = function (fun, thisArg) {
		if (this == null) {
			throw new TypeError('Array.prototype.forEach called on null or undefined');
		}

		if (typeof fun !== 'function') {
			throw new TypeError(fun + ' is not a function');
		}

		var t = Object(this);
		var len = t.length >>> 0;

		for (var i = 0; i < len; i++) {
			if (i in t) {
				fun.call(thisArg, t[i], i, t);
			}
		}
	};
}

// ES5 [].filter
if (!Array.prototype.filter) {
	Array.prototype.filter = function (fun, thisArg) {
		if (this == null) {
			throw new TypeError('Array.prototype.filter called on null or undefined');
		}

		if (typeof fun !== 'function') {
			throw new TypeError(fun + ' is not a function');
		}

		var a = [];
		this.forEach(function (val, i, t) {
			if (fun.call(thisArg || void 0, val, i, t)) {
				a.push(val);
			}
		});

		return a;
	};
}

// ES5 [].map
if (!Array.prototype.map) {
	Array.prototype.map = function (fun, thisArg) {
		if (this == null) {
			throw new TypeError('Array.prototype.map called on null or undefined');
		}

		if (typeof fun !== 'function') {
			throw new TypeError(fun + ' is not a function');
		}

		var a = [];
		this.forEach(function (val, i, t) {
			a.push(fun.call(thisArg || void 0, val, i, t));
		});

		return a;
	};
}

// ES5 isArray
if (!Array.isArray) {
	Array.isArray = function (o) {
		return Object.prototype.toString.call(o) === '[object Array]';
	};
}

// Test for location.assign
if (typeof window === 'object' && typeof window.location === 'object' && !window.location.assign) {
	window.location.assign = function (url) {
		if (typeof url !== 'string') {
			throw new TypeError('URL must be a string');
		}
		window.location.href = url;
	};
}

// Test for Function.bind
if (!Function.prototype.bind) {
	// MDN
	// Polyfill IE8, does not support native Function.bind
	Function.prototype.bind = function (context) {
		if (typeof this !== 'function') {
			throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
		}

		var args = Array.prototype.slice.call(arguments, 1);
		var self = this;
		var bound = function () {
			return self.apply(this instanceof bound ? this : context, args.concat(Array.prototype.slice.call(arguments)));
		};

		function EmptyFunction() {}
		if (this.prototype) {
			EmptyFunction.prototype = this.prototype;
		}
		bound.prototype = new EmptyFunction();

		return bound;
	};
}
/* eslint-enable no-extend-native */
