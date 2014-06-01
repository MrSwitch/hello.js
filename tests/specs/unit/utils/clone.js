define([
//	'../../../../src/utils/dataToJSON'
], function(
//	dataToJSON
){

	var utils = hello.utils;

	//
	// Are errors thrown if an invalid network is provided
	//
	describe('utils / clone', function(){

		it('should clone a simple object', function(){

			var test = {
				prop : 'prop'
			};

			var value = utils.clone(test);

			// Assert that its the same but different.
			expect( value ).to.be.eql( test ).and.not.to.be.equal( test );

		});

		if(window.Blob){
			it('should not clone Blob values', function(){

				var blob = new Blob();

				var test = {
					prop : blob
				};

				var value = utils.clone(test);

				// Assert that its the same but different.
				expect( value.prop ).to.be.a( Blob ).and.to.be.equal( blob );

			});
		}

		it('should not clone DOM element', function(){

			var node = document.createElement('input');

			var test = {
				prop : node
			};

			var value = utils.clone(test);

			// Assert that its the same but different.
			expect( value.prop ).to.be.a( window.Element || window.HTMLElement ).and.to.be.equal( node );

		});

	});


});