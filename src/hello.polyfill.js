

if( !Object.create ){

	// Shim, Object create
	// A shim for Object.create(), it adds a prototype to a new object

	Object.create = (function(){
		function F(){}
		return function(o){
			if (arguments.length != 1) {
				throw new Error('Object.create implementation only accepts one parameter.');
			}
			F.prototype = o;
			return new F();
		};
	})();
}




if( !Array.prototype.indexOf ){

	// indexOf
	// IE hack Array.indexOf doesn't exist prior to IE9

	Array.prototype.indexOf = function(s){
		for(var j=0;j<this.length;j++){
			if(this[j]===s){
				return j;
			}
		}
		return -1;
	};
}


if( !Array.isArray ){

	// isArray

	Array.isArray = function (o){
		return Object.prototype.toString.call(o) === '[object Array]';
	};
}



if( window && window.location && !window.location.assign ){
	window.location.assign = function(url){
		window.location = url;
	}
}



if( !Function.prototype.bind ){

	// MDN
	// Polyfill IE8, does not support native Function.bind

	Function.prototype.bind = function(b){
		if(typeof this!=="function"){
			throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
		}
		function c(){}
		var a=[].slice,
			f=a.call(arguments,1),
			e=this,
			d=function(){
				return e.apply(this instanceof c?this:b||window,f.concat(a.call(arguments)));
			};
			c.prototype=this.prototype;
			d.prototype=new c();
		return d;
	};
}
