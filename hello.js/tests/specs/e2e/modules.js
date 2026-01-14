
import errorResponse from '../libs/errorResponse';
import '../../../src/modules/box';
import '../../../src/modules/facebook';
import '../../../src/modules/flickr';
import '../../../src/modules/google';
import '../../../src/modules/windows';
import '../../../src/modules/dropbox';
import '../../../src/modules/twitter';
import '../../../src/modules/yahoo';
import '../../../src/modules/instagram';
import '../../../src/modules/joinme';
import '../../../src/modules/linkedin';
import '../../../src/modules/foursquare';
import '../../../src/modules/github';
import '../../../src/modules/bikeindex';
import '../../../src/modules/soundcloud';
import '../../../src/modules/vk';

describe('E2E modules', function() {

	// Loop through all services
	for (var name in hello.services) {
		setupModuleTests(hello.services[name], name);
	}

	function setupModuleTests(module, name) {

		describe(name, function() {

			var MATCH_URL = /^https?\:\/\//;

			it('should contain oauth.auth path', function() {
				var path = module.oauth.auth;
				expect(path).to.match(/^https?\:\/\//);
			});

			it('should specify a base url', function() {
				// Loop through all services
				expect(module.base).to.match(/^https?\:\/\//);
			});

			it('should be using OAuth1 contain, auth, request, token properties', function() {

				// Loop through all services
				var oauth = module.oauth;
				if (oauth && parseInt(oauth.version, 10) === 1) {
					expect(oauth.auth).to.match(MATCH_URL);
					expect(oauth.token).to.match(MATCH_URL);
					expect(oauth.request).to.match(MATCH_URL);
				}
			});

			xit('should return error object when an api request is made with an unverified user', function(done) {

				var i = 0;

				this.timeout(60000);

				var cb = errorResponse(null, function() {
					if (++i === 2)
						done();
				});

				// Ensure user is signed out
				hello.logout(name);

				// Make a request that returns an error object
				hello(name)
					.api('me', cb)
					.then(null, cb);
			});
		});
	}
});
