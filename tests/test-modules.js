

//
// Modules are of the following formats
//

// Loop through all services
for(var name in hello.services){
	setup_module_tests(hello.services[name], name);
}

function setup_module_tests(module, name){

	describe( module.name || name + ' Module', function(){

		var MATCH_URL = /^https?\:\/\//;

		it('contain oauth.auth path', function(){
			var path = module.oauth.auth;
			expect( path ).to.match( /^https?\:\/\// );
		});

		it('specify a base url', function(){
			// Loop through all services
			expect( module.base ).to.match( /^https?\:\/\// );
		});


		it('using OAuth1 contain, auth, request, token properties', function(){

			// Loop through all services
			var oauth = module.oauth;
			if(oauth && parseInt(oauth.version,10) === 1 ){
				expect( oauth.auth ).to.match( MATCH_URL );
				expect( oauth.token ).to.match( MATCH_URL );
				expect( oauth.request ).to.match( MATCH_URL );
			}
		});

		it('return error object when an api request is made with an unverified user', function(done){

			var i=0;

			this.timeout(60000);

			var cb = function(data){
				expect(data).to.be.a("object");
				expect(data).to.have.property("error");
				expect(data.error).to.have.property("code");
				expect(data.error).to.have.property("message");
				expect(data.error.code).to.not.be.an("object");
				expect(data.error.message).to.not.be.an("object");
				if(++i===3)
					done();
			};

			// ensure user is signed out
			hello.logout(name);

			// Make a request that returns an error object
			hello(name).on("error", cb).api('me', cb).on("error", cb);
		});
		/**/

	});
}