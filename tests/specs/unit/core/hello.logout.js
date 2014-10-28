
define([
//	'../../../src/hello'
	'../../libs/error_response'
], function(
//	hello
	error_response
){



	//
	// Logout
	//
	describe('hello.logout', function(){

		it('should trigger an error when accessed through logout', function(done){

			// Make request
			hello("Facelessbook").logout().on('error', error_response('invalid_network',done) );

		});
		it('should assign a complete event', function(done){
			hello.logout('test', function(){done();});
		});

		it('should throw a completed event if network name is wrong', function(done){
			var instance = hello.logout('test', function(e){
				expect( e ).to.have.property( 'error' );
				done();
			});
		});
		it('should throw a error event if network name is wrong', function(done){
			var instance = hello.logout('test');
			instance.on('error', function(){
				done();
			});
		});
	});

});