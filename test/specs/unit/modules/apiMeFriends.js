// Test GET me/friends
const hello = require('../../../../src/hello.js');
const helper = require('./helper.js');

describe('hello.api(\'/me/friends\')', () => {

	helper.sharedSetup();

	const tests = ['flickr', 'foursquare', 'github', 'google', 'linkedin', 'soundcloud', 'twitter', 'windows', 'yahoo'];

	tests.forEach(network => {

		it(`should format ${  network  }:me/friends correctly`, done => {

			hello(network)
				.api('/me/friends')
				.then(friends => {
					friends.data.forEach(friend => {
						expect(friend.id).to.be.ok();
						expect(friend.name).to.be.ok();
						if (friend.thumbnail) {
							expect(friend.thumbnail).to.match(/^https?:\/\/[a-z0-9.-]+\/.*/i);
						}
					});

					expect(friends.data.length).to.be.ok();

					done();
				})
				.then(null, done);

		});

	});

});

