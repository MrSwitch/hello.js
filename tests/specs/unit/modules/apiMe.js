import helper from './helper';

describe('hello.api(\'/me\')', function() {

	helper.sharedSetup();

	var tests = [
		{
			network: 'bikeindex',
			expect: {
				id: '13674',
				thumbnail: undefined
			},
			errorExpect: {
				code: 'access_denied',
				message: 'OAuth error: unauthorized'
			}
		},
		{
			network: 'box',
			expect: {
				id: '197571718',
				name: 'Jane McGee',
				thumbnail: 'https://app.box.com/api/avatar/large/197571718'
			},
			errorExpect: false
		},
		{
			network: 'dropbox',
			expect: {
				id: 374434467,
				name: 'Jane McGee',
				thumbnail: undefined
			},
			errorExpect: {
				code: 'server_error',
				message: 'The given OAuth 2 access token doesn\'t exist or has expired.'
			}
		},
		{
			network: 'facebook',
			expect: {
				id: '100008806508341',
				name: 'Jane McGee',
				thumbnail: 'https://graph.facebook.com/100008806508341/picture'
			},
			errorExpect: {
				code: 190,
				message: 'Invalid OAuth access token.'
			}
		},
		{
			network: 'flickr',
			expect: {
				id: '34790912@N05',
				name: 'Jane McGee',
				thumbnail: 'https://farm4.staticflickr.com/3729/buddyicons/34790912@N05_l.jpg'
			},
			errorExpect: {
				code: 'invalid_request',
				message: 'User not found'
			}
		},
		{
			network: 'foursquare',
			expect: {
				id: '110649444',
				name: 'Jane McGee',
				thumbnail: 'https://irs0.4sqi.net/img/user/100x100/110649444-XTNO1LD24NJOW0TW.jpg'
			},
			errorExpect: {
				code: 'access_denied',
				message: 'OAuth token invalid or revoked.'
			}
		},
		{
			network: 'github',
			expect: {
				id: 10398423,
				name: 'janemcgee35',
				thumbnail: 'https://avatars.githubusercontent.com/u/10398423?v=3'
			},
			errorExpect: false
		},
		{
			network: 'google',
			expect: {
				id: '115111284799080900590',
				name: 'Jane McGee',
				thumbnail: 'https://lh3.googleusercontent.com/-NWCgcgRDieE/AAAAAAAAAAI/AAAAAAAAABc/DCi-M8IuzMo/photo.jpg?sz=50'
			},
			errorExpect: {
				code: 403,
				message: 'Daily Limit for Unauthenticated Use Exceeded. Continued use requires signup.'
			}
		},
		{
			network: 'instagram',
			expect: {
				id: '1636340308',
				name: 'Jane McGee',
				thumbnail: 'https://igcdn-photos-h-a.akamaihd.net/hphotos-ak-xaf1/t51.2885-19/10919499_876030935750711_2062576510_a.jpg'
			},
			errorExpect: {
				code: 'OAuthParameterException',
				message: 'Missing client_id or access_token URL parameter.'
			}
		},
		{
			network: 'joinme',
			expect: {
				id: 'janemcgee35@join.me',
				name: 'Jane McGee',
				thumbnail: undefined
			},
			errorExpect: false
		},
		{
			network: 'linkedin',
			expect: {
				id: 'sDsPqKdBkl',
				name: 'Jane McGee',
				thumbnail: 'https://media.licdn.com/mpr/mprx/0_oFea4Eo2n6j5ZQS2oLwg4HE7NiWQ4Qp2H_yl4dVyw6gBFGIuQ3ZGnWmtsSdZUTjhIXErcmkkxGoX'
			},
			errorExpect: {
				code: 401,
				message: 'Unknown authentication scheme'
			}
		},
		{
			network: 'soundcloud',
			expect: {
				id: 131420710,
				name: 'janemcgee35',
				thumbnail: 'https://i1.sndcdn.com/avatars-000123511300-upb183-large.jpg'
			},
			errorExpect: false
		},
		{
			network: 'twitter',
			expect: {
				id: 2961707375,
				name: 'Jane McGee',
				thumbnail: 'https://pbs.twimg.com/profile_images/552017091583152128/a8lyS35y_normal.jpeg'
			},
			errorExpect: {
				code: 'request_failed',
				message: 'Bad Authentication data'
			}
		},
		{
			network: 'vk',
			expect: {
				id: 434460,
				name: 'Юрий Опарин',
				thumbnail: 'http://cs304605.vk.me/u434460/d_1acca7c0.jpg'
			},
			errorExpect: {
				code: 10,
				message: 'Internal server error: could not get application'
			}
		},
		{
			network: 'windows',
			expect: {
				id: '939f37452466502a',
				name: 'Jane McGee',
				thumbnail: 'https://apis.live.net/v5.0/939f37452466502a/picture?access_token=token'
			},
			errorExpect: {
				code: 'request_token_invalid',
				message: 'The access token isn\'t valid.'
			}
		},
		{
			network: 'yahoo',
			expect: {
				id: 'UKGYDRAHEWONVO35KOOBBGQ4UU',
				name: 'Jane McGee',
				thumbnail: 'https://socialprofiles.zenfs.com/images/805efb9485e4878f21be4d9e9e5890ca_192.png'
			},
			errorExpect: false
		}
	];

	describe('authorised requests', function() {

		helper.forEach(tests, function(test) {

			it('should format ' + test.network + ' correctly', function(done) {

				hello(test.network)
					.api('/me', {
						access_token: 'token'
					})
					.then(function(me) {
						expect(me.id).to.be(test.expect.id);
						expect(me.name).to.be(test.expect.name);
						expect(me.thumbnail).to.be(test.expect.thumbnail);
						done();
					})
					.then(null, done);

			});

		});
	});

	describe('unauthorised requests', function() {

		helper.forEach(tests, function(test) {

			if (!test.errorExpect) {
				return;
			}

			it('should trigger the error handler for ' + test.network, function(done) {

				hello(test.network)
					.api('/me', {
						stubType: '-unauth',
						access_token: null
					})
					.then(done, function(data) {
						expect(data.error).to.not.be(undefined);
						expect(data.error.code).to.be(test.errorExpect.code);
						expect(data.error.message).to.be(test.errorExpect.message);
						done();
					})
					.then(null, done);
			});

		});

	});

});

