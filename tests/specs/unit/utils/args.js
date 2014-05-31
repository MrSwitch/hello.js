define([
//	'../../../../src/utils/diff'
], function(
//	diff
){

var args = hello.utils.args;

//
// Events
//
describe('utils / args', function(){


	it('should accept an object and arguments as first and second parameters and return an object', function(){

		var value = args({}, []);

		expect( value ).to.be.an( Object );

	});


	it('should map arguments to an object', function(){

		var value = args({str:'s', obj: 'o', func : 'f'}, ['String', {}, function(){}]);

		expect( value ).to.be.an( 'object' );

		expect( value.str ).to.be.a( 'string' );

		expect( value.obj ).to.be.an( 'object' );

		expect( value.func ).to.be.a( 'function' );

	});



	it('should interpret the order of arguments, so some can be ommited', function(){

		var value = args({str:'s', obj: 'o', func : 'f'}, [function(){}]);


		expect( value )

			.to.be.an( 'object' )

			.and.to.not.have.property('str')

			.and.to.not.have.property('obj');


		expect( value.func ).to.be.a( 'function' );

	});

	it('should decipher whether the first argument is all the arguments represented as an object', function(){

		var value = args({str:'s', obj: 'o', func : 'f'}, [{
			func : function(){}
		}]);

		expect( value )

			.to.be.an( 'object' )

			.and.to.not.have.property('str')

			.and.to.not.have.property('obj');


		expect( value.func ).to.be.a( 'function' );

	});

});

	
});