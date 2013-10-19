

//
// Modules are of the following formats
//
describe('Modules all', function(){

	var MATCH_URL = /^https?\:\/\//;

	it('contain oauth or url.auth paths', function(){

		// Loop through all services
		for(var name in hello.services){
			var path = hello.services[name].oauth.auth;
			expect( path ).to.match( /^https?\:\/\// );
		}
	});


	it('using OAuth1 contain, auth, request, token properties', function(){

		// Loop through all services
		for(var name in hello.services){
			var oauth = hello.services[name].oauth;
			if(oauth && parseInt(oauth.version,10) === 1 ){
				expect( oauth.auth ).to.match( MATCH_URL );
				expect( oauth.token ).to.match( MATCH_URL );
				expect( oauth.request ).to.match( MATCH_URL );
			}
		}
	});

	it('return error object when an api request is made with an unverified user', function(done){

		this.timeout(60000);

		var i=0;

		function contains_error_callback(data){

			expect(data).to.be.a("object");
			expect(data).to.have.property("error");
			expect(data.error).to.have.property("code");
			expect(data.error).to.have.property("message");
			expect(data.error.code).to.not.be.an("object");
			expect(data.error.message).to.not.be.an("object");

			if(--i <= 0){
				done();
			}
		}

		// Loop through all services
		for(var name in hello.services){
			// i++
			i++;

			// ensure user is signed out
			hello.logout(name);

			// Make a request that returns an error object
			hello(name).api('me', contains_error_callback);
		}
	});
	/**/

});
