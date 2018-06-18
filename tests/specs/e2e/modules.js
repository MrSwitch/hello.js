define([
	'../libs/errorResponse',
	'../../../src/modules/box',
	'../../../src/modules/facebook',
	'../../../src/modules/flickr',
	'../../../src/modules/google',
	'../../../src/modules/google_oauth2',
	'../../../src/modules/windows',
	'../../../src/modules/dropbox',
	'../../../src/modules/twitter',
	'../../../src/modules/yahoo',
	'../../../src/modules/instagram',
	'../../../src/modules/joinme',
	'../../../src/modules/linkedin',
	'../../../src/modules/foursquare',
	'../../../src/modules/github',
	'../../../src/modules/bikeindex',
	'../../../src/modules/soundcloud',
	'../../../src/modules/vk'
], function(
	errorResponse
) {

	describe('E2E modules', function() {

		var expectedServices = [
			'bikeindex',
			'box',
			'dropbox',
			'facebook',
			'flickr',
			'foursquare',
			'google',
			'google_oauth2',
			'instagram',
			'joinme',
			'linkedin',
			'twitter',
			'windows',
			'yahoo',
			'github',
			'soundcloud',
			'vk'
		];

		// This check verifies that the module's initializer does not throw:
		// This is important since hello.js currently swallows this exception and
		// simply silently fails to register the module.
		var actualKeys = Object.keys(hello.services);
		for (var i = 0; i < expectedServices.length; ++i) {
			checkMembership(actualKeys, expectedServices[i]);
		}

		function checkMembership(actualKeys, expectedService) {
			it('should load module ' + expectedService, function() {
				expect(actualKeys.includes(expectedService)).to.equal(true);
			});
		}

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
});
