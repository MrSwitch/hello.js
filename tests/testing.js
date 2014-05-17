/**
 * Run tests on the HelloJS service
 */
//var assert = chai.assert;
//var should = chai.should();

mocha.setup('bdd');
mocha.setup({ignoreLeaks:true});

var tests = [];
for (var file in window.__karma__.files) {
	if (window.__karma__.files.hasOwnProperty(file)) {
		if (/\.js$/.test(file)) {
			tests.push(file);
		}
	}
}

//
/*
var previous_load = window.requirejs.load;
window.requirejs.load = function(context, moduleName, url){
	if(! /^\.js(\?|$)/.test(url)){
		url = url.replace(/(\/[^\?\/]+)(?!\.js)(\?|$)/, '$1.js$2');
	}
	previous_load.call(this, context, moduleName, url);
};
/**/

console.log(tests);

requirejs.config({
	// Karma serves files from '/base'
	baseUrl: '/base/src',

	// ask Require.js to load these files (all our tests)
	deps: tests,

	// start test run, once Require.js is done
	callback: window.__karma__.start
});


//mocha.setup({globals: [/^_hellojs_/]});
/*
jasmine.Matchers.prototype.toBeTypeOf = function(expected) {
	var actual, notText, objType;
 
	actual = this.actual;
	notText = this.isNot ? 'not ' : '';
	objType = actual ? Object.prototype.toString.call(actual) : '';
 
	this.message = function() {
		return 'Expected ' + actual + notText + ' to be an array';
	};
 
	return objType.toLowerCase() === '[object ' + expected.toLowerCase() + ']';
};
*/