define([
	'../../libs/errorResponse'
], function(
	errorResponse
) {

	describe('hello.login', function() {

		var testable;
		var second;

		// Create a dummy network
		beforeEach(function() {
			// Create networks
			testable = {
				oauth: {
					auth: 'https://testdemo/access',
					grant: 'https://testdemo/grant',
					version: 2
				},
				scope: {
					basic: 'basic_scope'
				}
			};

			second = {
				oauth: {
					auth: 'https://testdemo/access',
					version: 2
				},
				scope: {
					common_scope: 'common_scope'
				}
			};

			// Add a network
			hello.init({
				testable: testable,
				second: second
			});

		});

		// Destroy it
		afterEach(function() {
			delete hello.services.testable;
		});

		var _open;

		before(function() {
			_open = window.open;
		});

		after(function() {
			window.open = _open;
		});

		function safariHack(url) {
			var m = url.match(/\#oauth_redirect\=(.+)$/i);
			if (m) {
				url = decodeURIComponent(decodeURIComponent(m[1]));
			}

			return url;
		}

		it('should assign a complete event', function(done) {

			var spy = sinon.spy(function() {done();});

			var popup = {
				closed: false
			};

			window.open = function() {
				return popup;
			};

			hello.login('testable', spy);

			popup.closed = true;

		});

		it('should throw a completed and error event if network name is wrong', function(done) {
			hello
				.login('invalidname', errorResponse('invalid_network', done));
		});

		it('should throw a error event if network name is wrong', function(done) {
			hello
				.login('invalidname')
				.then(null, errorResponse('invalid_network', done));
		});

		it('should by default, trigger window.open request', function(done) {

			var spy = sinon.spy(function() {done();});

			window.open = spy;

			hello.login('testable');
		});

		it('should by default, include the basic scope defined by the module', function(done) {

			var spy = sinon.spy(function(url, name, optins) {

				url = safariHack(url);

				expect(url).to.contain('scope=' + hello.services.testable.scope.basic);

				done();
			});

			window.open = spy;

			hello.login('testable');
		});

		describe('options', function() {

			it('should apply `options.redirect_uri`', function(done) {

				var REDIRECT_URI = 'http://dummydomain.com/';

				var spy = sinon.spy(function(url, name, optins) {

					url = safariHack(url);

					var params = hello.utils.param(url.split('?')[1]);

					expect(params.redirect_uri).to.equal(REDIRECT_URI);

					done();
				});

				window.open = spy;

				hello.login('testable', {redirect_uri:REDIRECT_URI});
			});

			it('should URIencode `options.redirect_uri`', function(done) {

				var REDIRECT_URI = 'http://dummydomain.com/?breakdown';

				var spy = sinon.spy(function(url, name, optins) {

					url = safariHack(url);

					expect(url).to.not.contain(REDIRECT_URI);
					expect(url).to.contain(encodeURIComponent(REDIRECT_URI));

					done();
				});

				window.open = spy;

				hello.login('testable', {redirect_uri:REDIRECT_URI});
			});

			it('should permit custom scope in `options.scope` which are unique to this service', function(done) {

				var customScope = 'custom_scope';

				var spy = sinon.spy(function(url, name, optins) {

					url = safariHack(url);

					var params = hello.utils.param(url.split('?')[1]);

					expect(params.scope).to.contain(customScope);

					done();
				});

				window.open = spy;

				hello.login('testable', {scope: customScope});
			});

			it('should discard common scope, aka scopes undefined by this module but defined by other services', function(done) {

				var commonScope = 'common_scope';

				var spy = sinon.spy(function(url, name, optins) {

					url = safariHack(url);

					// Parse parameters
					var params = hello.utils.param(url.split('?')[1]);

					expect(params.scope).to.not.contain(commonScope);
					done();
				});

				window.open = spy;

				hello.login('testable', {scope: commonScope});
			});

			it('should not included empty scopes', function(done) {

				var scope = 'scope';
				var paddedScope = ',' + scope + ',';
				delete testable.scope.basic;

				var spy = sinon.spy(function(url, name, optins) {

					url = safariHack(url);

					// Parse parameters
					var params = hello.utils.param(url.split('?')[1]);

					expect(params.scope).to.eql(scope);
					done();
				});

				window.open = spy;

				hello.login('testable', {scope: paddedScope});
			});

			it('should use the correct and unencoded delimiter to separate scope', function(done) {

				var basicScope = 'read_user,read_bikes';
				var scopeDelim = '+';

				hello.init({
					test_delimit_scope: {
						oauth: {
							auth: 'https://testdemo/access',
							version: 2
						},
						scope_delim: scopeDelim,
						scope: {
							basic: basicScope
						}
					}
				});

				var spy = sinon.spy(function(url, name, optins) {

					url = safariHack(url);

					expect(url).to.contain(basicScope.replace(/[\+\,\s]/, scopeDelim));
					done();
				});

				window.open = spy;

				hello.login('test_delimit_scope');
			});

			it('should space encode the delimiter of multiple response_type\'s', function(done) {

				var opts = {
					response_type: 'code grant_scopes'
				};

				var spy = sinon.spy(function(url, name) {

					url = safariHack(url);

					expect(url).to.contain('code%20grant_scopes');
					done();
				});

				window.open = spy;

				hello.login('testable', opts);
			});

			it('should substitute "token" for "code" when there is no Grant URL defined', function(done) {

				var opts = {
					response_type: 'code grant_scopes'
				};

				hello.services.testable.oauth.grant = null;

				var spy = sinon.spy(function(url, name) {

					url = safariHack(url);

					expect(url).to.contain('token%20grant_scopes');
					done();
				});

				window.open = spy;

				hello.login('testable', opts);
			});
		});

		describe('popup options', function() {

			it('should give the popup the default options', function(done) {

				var spy = sinon.spy(function(url, name, options) {
					expect(options).to.contain('resizeable');
					expect(options).to.contain('scrollbars');
					expect(options).to.contain('width');
					expect(options).to.contain('height');
					expect(options).to.contain('top');
					expect(options).to.contain('left');
					done();
				});

				window.open = spy;

				hello.login('testable');
			});

			it('should allow the popup options to be overridden', function(done) {

				var spy = sinon.spy(function(url, name, options) {
					expect(options).to.contain('location=no');
					expect(options).to.contain('toolbar=no');
					expect(options).to.contain('hidden=true');
					done();
				});

				window.open = spy;

				hello.login('testable', {
					popup: {
						hidden: true,
						location: 'no',
						toolbar: 'no'
					}
				});
			});
		});
	});

});
