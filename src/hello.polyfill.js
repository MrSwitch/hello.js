// ES5 Object.create
if (!Object.create) {

	// Shim, Object create
	// A shim for Object.create(), it adds a prototype to a new object
	Object.create = (function() {

		function F() {}

		return function(o) {

			if (arguments.length != 1) {
				throw new Error('Object.create implementation only accepts one parameter.');
			}

			F.prototype = o;
			return new F();
		};

	})();

}

// ES5 Object.keys
if (!Object.keys) {
	Object.keys = function(o, k, r) {
		r = [];
		for (k in o) {
			if (r.hasOwnProperty.call(o, k))
				r.push(k);
		}

		return r;
	};
}
/* eslint-disable no-extend-native */
// ES5 [].indexOf
if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function(s) {

		for (var j = 0; j < this.length; j++) {
			if (this[j] === s) {
				return j;
			}
		}

		return -1;
	};
}

// ES5 [].forEach
if (!Array.prototype.forEach) {
	Array.prototype.forEach = function(fun/*, thisArg*/) {

		if (this === void 0 || this === null) {
			throw new TypeError();
		}

		var t = Object(this);
		var len = t.length >>> 0;
		if (typeof fun !== 'function') {
			throw new TypeError();
		}

		var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
		for (var i = 0; i < len; i++) {
			if (i in t) {
				fun.call(thisArg, t[i], i, t);
			}
		}

		return this;
	};
}

// ES5 [].filter
if (!Array.prototype.filter) {
	Array.prototype.filter = function(fun, thisArg) {

		var a = [];
		this.forEach(function(val, i, t) {
			if (fun.call(thisArg || void 0, val, i, t)) {
				a.push(val);
			}
		});

		return a;
	};
}

// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: http://es5.github.io/#x15.4.4.19
if (!Array.prototype.map) {

	Array.prototype.map = function(fun, thisArg) {

		var a = [];
		this.forEach(function(val, i, t) {
			a.push(fun.call(thisArg || void 0, val, i, t));
		});

		return a;
	};
}

// ES5 isArray
if (!Array.isArray) {

	// Function Array.isArray
	Array.isArray = function(o) {
		return Object.prototype.toString.call(o) === '[object Array]';
	};

}

// Test for location.assign
if (typeof window === 'object' && typeof window.location === 'object' && !window.location.assign) {

	window.location.assign = function(url) {
		window.location = url;
	};

}

// Test for Function.bind
if (!Function.prototype.bind) {

	// MDN
	// Polyfill IE8, does not support native Function.bind
	Function.prototype.bind = function(b) {

		if (typeof this !== 'function') {
			throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
		}

		function C() {}

		var a = [].slice;
		var f = a.call(arguments, 1);
		var _this = this;
		var D = function() {
			return _this.apply(this instanceof C ? this : b || window, f.concat(a.call(arguments)));
		};

		C.prototype = this.prototype;
		D.prototype = new C();

		return D;
	};

}
/* eslint-enable no-extend-native */
