define([
//	'../../../src/hello'
	'../../libs/error_response'
], function(
//	hello
	error_response
){

	//
	// GetAuthResposne
	//
	describe("hello.getAuthResponse", function(){

		it('should trigger an error when accessing an invalid network', function(done){
			// Make request
			hello("Facelessbook").on('error', error_response('invalid_network',done) ).getAuthResponse();
		});
		it('should return null when accessing an invalid network implicitly', function(){
			// Make request
			var r = hello("Facelessbook").getAuthResponse();
			expect(r).to.be(null);
		});
		it('should return null when accessing an invalid network explicitly', function(){
			// Make request
			var r = hello.getAuthResponse("Facelessbook");
			expect(r).to.be(null);
		});
	});

});