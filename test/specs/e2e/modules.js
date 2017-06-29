const hello = require('../../../src/hello.js');
const errorResponse = require('../../lib/errorResponse.js');

require('../../../src/modules/box.js');
require('../../../src/modules/facebook.js');
require('../../../src/modules/flickr.js');
require('../../../src/modules/google.js');
require('../../../src/modules/windows.js');
require('../../../src/modules/dropbox.js');
require('../../../src/modules/twitter.js');
require('../../../src/modules/yahoo.js');
require('../../../src/modules/instagram.js');
require('../../../src/modules/joinme.js');
require('../../../src/modules/linkedin.js');
require('../../../src/modules/foursquare.js');
require('../../../src/modules/github.js');
require('../../../src/modules/bikeindex.js');
require('../../../src/modules/soundcloud.js');
require('../../../src/modules/vk.js');

describe('E2E modules', () => {

	// Loop through all services
	for (const name in hello.services) {
		setupModuleTests(hello.services[name], name);
	}

	function setupModuleTests(module, name) {

		describe(name, () => {

			const MATCH_URL = /^https?:\/\//;

			it('should contain oauth.auth path', () => {
				const path = module.oauth.auth;
				expect(path).to.match(/^https?:\/\//);
			});

			it('should specify a base url', () => {
				// Loop through all services
				expect(module.base).to.match(/^https?:\/\//);
			});

			it('should be using OAuth1 contain, auth, request, token properties', () => {

				// Loop through all services
				const oauth = module.oauth;
				if (oauth && parseInt(oauth.version, 10) === 1) {
					expect(oauth.auth).to.match(MATCH_URL);
					expect(oauth.token).to.match(MATCH_URL);
					expect(oauth.request).to.match(MATCH_URL);
				}
			});

			xit('should return error object when an api request is made with an unverified user', function(done) {

				let i = 0;

				this.timeout(60000);

				const cb = errorResponse(null, () => {
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
