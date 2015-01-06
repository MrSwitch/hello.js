define([
	'../libs/error_response',
	'../../../src/modules/facebook',
	'../../../src/modules/flickr',
	'../../../src/modules/google',
	'../../../src/modules/windows',
	'../../../src/modules/dropbox',
	'../../../src/modules/twitter',
	'../../../src/modules/yahoo',
	'../../../src/modules/instagram',
	'../../../src/modules/linkedin',
	'../../../src/modules/foursquare',
	'../../../src/modules/github',
	'../../../src/modules/soundcloud'
], function(
//	hello
	error_response
){

//
// Modules are of the following formats
//

describe( 'E2E Modules', function(){

// Loop through all services
for(var name in hello.services){
	setup_module_tests(hello.services[name], name);
}

function setup_module_tests(module, name){

	describe( name , function(){

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

		xit('return error object when an api request is made with an unverified user', function(done){

			var i=0;

			this.timeout(60000);

			var cb = error_response(null, function(){
				if(++i===3)
					done();
			});

			// ensure user is signed out
			hello.logout(name);

			// Make a request that returns an error object
			hello(name).on("error", cb).api('me', cb).on("error", cb);
		});
		/**/

	});
}
});
});
