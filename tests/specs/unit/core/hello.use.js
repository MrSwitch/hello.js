define([
//	'../../../src/hello'
	'../../libs/error_response'
], function(
//	hello
	error_response
){

	//
	// Use
	//
	describe('hello.use', function(){

		it('should set the service on the current instance only', function(){
			var root = hello, root_service = hello.settings.default_service;
			var instance = hello('instance');
			var descendent = instance.use('descendent');
			expect( hello.settings.default_service ).to.be( root_service );
			expect( instance.settings.default_service ).to.be( 'instance' );
			expect( descendent.settings.default_service ).to.be( 'descendent' );
		});

		it('should return a new instance', function(){

			var instance = hello('instance');
			expect( instance ).to.not.be( hello );
		});

	});


});