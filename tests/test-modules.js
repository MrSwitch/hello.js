

//
// Modules are of the following formats
//
describe('Modules all', function(){

	var MATCH_URL = /^https?\:\/\//;

	it('contain oauth or url.auth paths', function(){

		// Loop through all services
		for(var name in hello.services){
			var path = hello.services[name].uri.auth||hello.services[name].oauth.auth;
			assert.match( path, /^https?\:\/\// );
		}
	});


	it('using OAuth1 contain, auth, request, token properties', function(){

		// Loop through all services
		for(var name in hello.services){
			var oauth = hello.services[name].oauth;
			if(oauth && parseInt(oauth.version,10) === 1 ){
				assert.match( oauth.auth, MATCH_URL );
				assert.match( oauth.token, MATCH_URL );
				assert.match( oauth.request, MATCH_URL );
			}
		}
	});

});
