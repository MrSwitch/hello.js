define([
//	'../../../../src/utils/diff'
], function(
//	diff
){

var util = hello.utils.param;

//
// Events
//
describe('utils / param', function(){

	var test = {
		param : 'param1',
		param2 : 'param2',
		hyperlink : 'https://example.com?a=1&b=2',
		jsonp : '?'
	};


	it('should accept an object and return a string', function(){

		var value = util({});

		expect( value ).to.be.a( 'string' );

	});

	it('should accept a string and return an object', function(){

		var value = util("");

		expect( value ).to.be.an( Object );

	});


	it('should turn URL query into an object', function(){

		// convert there and back

		var value = util(util(test));

		expect( value ).to.eql( test );

	});

	it('should turn an object into a URL string', function(){

		// convert there and back

		var value = util(test);

		expect( value ).to.be.a( 'string' );

	});

	it('should only include hasOwnProperties from an object', function(){

		// convert there and back
		
		var obj = hello.utils.objectCreate({ignore:'this should be excluded'});
		obj.included = 'this is included';

		var value = util(util(obj));

		expect( value ).to.have.property( 'included' ).and.not.to.have.property( 'ignore' );

	});

});

	
});