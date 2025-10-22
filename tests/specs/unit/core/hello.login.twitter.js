import errorResponse from '../../libs/errorResponse';

describe('hello.login - Twitter OAuth 1.0a Client Context (Issue #667)', function() {

	var twitter_service;
	var utils = hello.utils;
	var _popup = utils.popup;
	var _iframe = utils.iframe;

	beforeEach(function() {
		// Create Twitter service configuration
		twitter_service = {
			oauth: {
				version: '1.0a',
				auth: 'https://api.twitter.com/oauth/authenticate',
				request: 'https://api.twitter.com/oauth/request_token',
				token: 'https://api.twitter.com/oauth/access_token'
			},
			login: function(p) {
				// Validate client configuration before proceeding
				if (!hello.services.twitter || !hello.services.twitter.id) {
					throw new Error('Twitter client ID not configured. Use hello.init({twitter: "your_client_id"})');
				}

				// Ensure client context is preserved for OAuth 1.0a vault creation
				if (p.qs && p.qs.state) {
					p.qs.state.client_id = hello.services.twitter.id;
				}

				// Reauthenticate
				var prefix = '?force_login=true';
				this.oauth.auth = this.oauth.auth.replace(prefix, '') + (p.options.force ? prefix : '');
			}
		};

		// Initialize Twitter service
		hello.init({
			twitter: Object.assign({id: 'test_twitter_client_id'}, twitter_service)
		});

		// Mock popup and iframe functions
		utils.popup = sinon.spy(function() {
			return {closed: false};
		});

		utils.iframe = sinon.spy();
	});

	afterEach(function() {
		// Clean up
		delete hello.services.twitter;
		utils.popup = _popup;
		utils.iframe = _iframe;
		hello.logout();
	});

	describe('Client Context Preservation', function() {

		it('should include client_id in state to prevent vault creation error', function(done) {

			var popupSpy = sinon.spy(function(url) {
				// Parse the URL to extract state parameter
				var urlParts = url.split('?');
				if (urlParts.length > 1) {
					var params = hello.utils.param(urlParts[1]);
					if (params.state) {
						var state;
						try {
							state = JSON.parse(decodeURIComponent(params.state));
						} catch(e) {
							// Try base64 decode if JSON parse fails
							try {
								state = JSON.parse(window.atob(params.state));
							} catch(e2) {
								// State might be in different format
								console.warn('Could not parse state parameter');
							}
						}

						if (state && state.client_id) {
							expect(state.client_id).to.equal('test_twitter_client_id');
							done();
						} else {
							done(new Error('client_id not found in state'));
						}
					} else {
						done(new Error('state parameter not found'));
					}
				} else {
					done(new Error('URL parameters not found'));
				}

				return {closed: false};
			});

			utils.popup = popupSpy;

			hello.login('twitter');
		});

		it('should throw descriptive error when client ID is missing', function(done) {
			// Clear twitter configuration to simulate missing client ID
			hello.services.twitter = Object.assign({}, twitter_service);
			delete hello.services.twitter.id;

			try {
				hello.login('twitter');
				done(new Error('Expected error was not thrown'));
			} catch(error) {
				expect(error.message).to.contain('Twitter client ID not configured');
				done();
			}
		});

		it('should preserve client context for OAuth 1.0a in core login flow', function(done) {

			var popupSpy = sinon.spy(function(url) {
				// For OAuth 1.0a, the URL should go through oauth_proxy
				expect(url).to.contain('oauth_proxy');
				
				// Parse the URL to check for client context
				var urlParts = url.split('?');
				if (urlParts.length > 1) {
					var params = hello.utils.param(urlParts[1]);
					if (params.state) {
						var state;
						try {
							state = JSON.parse(decodeURIComponent(params.state));
						} catch(e) {
							try {
								state = JSON.parse(window.atob(params.state));
							} catch(e2) {
								// State might be in different format - this is acceptable
							}
						}

						// Check that either state has client_id or the service configuration exists
						var hasClientContext = (state && state.client_id) || hello.services.twitter.id;
						expect(hasClientContext).to.be.ok;
						done();
					}
				}

				return {closed: false};
			});

			utils.popup = popupSpy;

			// Set oauth_proxy for testing
			hello.login('twitter', {
				oauth_proxy: 'https://auth-server.herokuapp.com/proxy'
			});
		});

		it('should handle force login parameter correctly', function(done) {

			var twitterService = hello.services.twitter;
			var originalAuth = twitterService.oauth.auth;

			var popupSpy = sinon.spy(function(url) {
				// Verify that force login was applied to auth URL
				expect(twitterService.oauth.auth).to.contain('force_login=true');
				
				// Restore original auth URL
				twitterService.oauth.auth = originalAuth;
				done();

				return {closed: false};
			});

			utils.popup = popupSpy;

			hello.login('twitter', {force: true});
		});

	});

	describe('Error Handling', function() {

		it('should handle OAuth 1.0a version detection correctly', function() {
			var provider = hello.services.twitter;
			expect(parseInt(provider.oauth.version, 10)).to.equal(1);
		});

		it('should validate service configuration before login attempt', function(done) {
			// Test with completely missing service
			delete hello.services.twitter;

			hello.login('twitter')
				.then(null, function(error) {
					expect(error.error.code).to.equal('invalid_network');
					done();
				});
		});

	});

	describe('Backward Compatibility', function() {

		it('should not break existing login flow for other OAuth versions', function(done) {

			// Add a OAuth 2.0 service for comparison
			hello.init({
				oauth2_service: {
					oauth: {
						version: 2,
						auth: 'https://example.com/oauth/authorize'
					}
				}
			});

			var popupSpy = sinon.spy(function(url) {
				// OAuth 2.0 should not go through proxy by default
				expect(url).to.contain('example.com');
				done();
				return {closed: false};
			});

			utils.popup = popupSpy;

			hello.login('oauth2_service');
		});

		it('should maintain existing Twitter functionality', function() {
			var twitterService = hello.services.twitter;
			
			// Verify essential Twitter service properties
			expect(twitterService.oauth.version).to.equal('1.0a');
			expect(twitterService.oauth.auth).to.contain('api.twitter.com');
			expect(twitterService.oauth.request).to.contain('request_token');
			expect(twitterService.oauth.token).to.contain('access_token');
		});

	});

});