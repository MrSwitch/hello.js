/**
 * Run tests on the HelloJS service
 */
//var assert = chai.assert;
//var should = chai.should();

mocha.setup('bdd');
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