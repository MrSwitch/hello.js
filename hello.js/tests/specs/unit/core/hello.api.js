import errorResponse from '../../libs/errorResponse';


describe('hello.api', function() {

	var _request = hello.utils.request;
	var _store = hello.utils.store;
	var _session = {
		access_token: 'token'
	};
	var testable = {};

	before(function() {

		// Unset
		_request = hello.utils.request;
		_store = hello.utils.store;

		// Mock request
		hello.utils.request = function(req, callback) {
			setTimeout(function() {
				callback(req);
			});
		};

		hello.utils.store = function(label, body) {
			return _session;
		};

		// Define default network
		hello.init({
			testable: {
				oauth: {
					auth: 'https://testdemo/access',
					version: 2
				},

				scope: {
					basic: 'basic_scope'
				},

				base: 'https://testable/'
			}
		});

		testable = hello.services.testable;

	});

	after(function() {

		// Renew
		hello.utils.request = _request;

	});

	it('should assign a complete event', function(done) {
		hello('test')
			.api('/', function() {done();});
	});

	it('should throw a completed event if network name is undefined', function(done) {
		hello('test')
			.api('/', errorResponse('invalid_network', done));
	});

	it('should throw a error event if network name is undefined', function(done) {
		hello('test')
			.api('/')
			.then(null, errorResponse('invalid_network', done));
	});

	it('should throw a error event if path name is undefined', function(done) {
		hello('test')
			.api()
			.then(null, errorResponse('invalid_path', done));
	});

	it('should construct the url using the base and the pathname', function(done) {

		hello('testable')
			.api('/endpoint', function(res) {
				expect(res.url).to.eql('https://testable/endpoint');
				done();
			});
	});

	it('should extract the parameters from the URL', function(done) {

		var session = _session;
		_session = null;

		hello('testable')
			.api('/endpoint?a=a&b=b', function(res) {
				_session = session;
				expect(res.url).to.eql('https://testable/endpoint');
				expect(res.query).to.eql({
					a: 'a',
					b: 'b'
				});
				done();
			});
	});

	it('should attach query object to the req.query', function(done) {

		hello('testable')
			.api('/endpoint', {a: 'a'}, function(res) {

				expect(res.query).to.have.property('a', 'a');

				done();
			});
	});

	it('should attach authResponse object to the req.authResponse', function(done) {

		hello('testable')
			.api('/endpoint', function(res) {

				expect(res.authResponse).to.eql(_session);

				done();
			});
	});

	it('should attach data object to the req.query when `req.method = get`', function(done) {

		hello('testable')
			.api('/endpoint', 'get', {a: 'a'}, function(res) {

				expect(res.query).to.have.property('a', 'a');
				expect(res.data).to.be.empty();

				done();
			});
	});

	it('should attach post data object to the req.data', function(done) {

		hello('testable')
			.api('/endpoint', 'post', {a: 'a'}, function(res) {

				expect(res.method).to.eql('post');
				expect(res.query).to.not.have.property('a');
				expect(res.data).to.have.property('a', 'a');

				done();
			});
	});

	describe('POST', function() {

		// Not supported in IE9
		var hasFormdata = typeof FormData === 'function';

		if (hasFormdata) {
			it('should accept FormData as the data object', function(done) {

				var formData = new FormData();
				formData.append('user', 'name');

				hello('testable')
					.api('/endpoint', 'POST', formData)
					.then(function(res) {
						// The formData should not be mutated, but left as is.
						expect(res.data).to.equal(formData);
						done();
					});
			});
		}
	});

	describe('signing', function() {

		it('should add the access_token to the req.query', function(done) {

			hello('testable')
				.api('/endpoint', function(res) {
					expect(res.url).to.eql('https://testable/endpoint');
					expect(res.query).to.eql(_session);
					done();
				});
		});

		it('should mark OAuth1 endpoints with req.proxy', function(done) {

			// Override
			testable.oauth.version = 1;

			hello('testable')
				.api('/endpoint', function(res) {

					// Renew
					testable.oauth.version = 2;

					// Test
					expect(res.proxy).to.be.ok();
					expect(res.oauth_proxy).to.eql(hello.settings.oauth_proxy);

					done();
				});
		});

	});

	describe('map', function() {

		it('should process req object through the modules.get[req.path] function', function(done) {

			testable.get = testable.get || {};
			testable.get.handled = function(p) {
				expect(p).to.have.property('path', 'handled');
				done();
			};

			hello('testable')
				.api('/handled', {a: 'a'});
		});

		it('should process req object through the modules.get.default function if req.path not in module.get', function(done) {

			testable.get = testable.get || {};
			testable.get['default'] = function(p) {
				expect(p).to.have.property('path', 'unhandled');
				delete testable.get['default'];
				done();
			};

			hello('testable')
				.api('/unhandled', {a: 'a'});
		});

		it('should trigger an error if the mapped value is false', function(done) {

			testable.get = testable.get || {};
			testable.get.handled = false;

			hello('testable')
				.api('/handled')
				.then(null, function(res) {

					// Should place the value of a in the parameter list
					expect(res.error).to.have.property('code', 'invalid_path');

					delete testable.get.handled;

					done();
				});
		});

		describe('Replace @{} in path with request parameters', function() {

			it('should define the path using the query parameters and remove them from the query', function(done) {

				testable.get = testable.get || {};
				testable.get.handled = 'endpoint?b=@{a}';

				hello('testable')
					.api('/handled', {a: 'a'})
					.then(function(res) {

						// Should place the value of a in the parameter list
						expect(res.url).to.contain('endpoint?b=a');

						// Should place the value of a in the parameter list
						expect(res.path).to.eql('handled');

						// Should remove the property from the req.query
						expect(res.query).to.not.have.property('a');

						delete testable.get.handled;

						done();
					}, done);
			});

			it('should define the path using the query parameters and remove them from the post data', function(done) {

				testable.post = testable.post || {};
				testable.post.handled = 'endpoint?b=@{a}';

				hello('testable')
					.api('/handled', 'post', {a: 'a'})
					.then(function(res) {

						// Should place the value of a in the parameter list
						expect(res.url).to.contain('endpoint?b=a');

						// Should place the value of a in the parameter list
						expect(res.path).to.eql('handled');

						// Should remove the property from the req.query
						expect(res.data).to.not.have.property('a');

						delete testable.get.handled;

						done();
					}, done);
			});

			it('should trigger an error if there was no query parameter arg, i.e. @{arg}', function(done) {

				testable.get = testable.get || {};
				testable.get.handled = 'endpoint?b=@{a}';

				hello('testable')
					.api('/handled')
					.then(null, function(res) {

						// Should place the value of a in the parameter list
						expect(res.error).to.have.property('code', 'missing_attribute');

						delete testable.get.handled;

						done();
					});
			});

			it('should use the default value if one is defined i.e. @{arg|default}', function(done) {

				testable.get = testable.get || {};
				testable.get.handled = 'endpoint?empty=@{a|}&arg=@{b|default}';

				hello('testable')
					.api('/handled', function(res) {

						// Should place the value of a in the parameter list
						expect(res.url).to.contain('endpoint?empty=&arg=default');

						// Should place the value of a in the parameter list
						expect(res.path).to.eql('handled');

						delete testable.get.handled;

						done();
					});
			});

		});
	});

	describe('wrap', function() {

		it('should trigger the wrap function', function(done) {

			testable.wrap = testable.wrap || {};
			testable.wrap.handled = function(req) {
				delete testable.wrap.handled;
				done();
			};

			hello('testable')
				.api('/handled');
		});

		it('should trigger the wrap.default function if none exists', function(done) {

			testable.wrap = testable.wrap || {};
			testable.wrap['default'] = function(req) {
				delete testable.wrap['default'];
				done();
			};

			hello('testable')
				.api('/unhandled');
		});

		it('should not trigger the wrap function if formatResponse = false', function(done) {

			testable.wrap = testable.wrap || {};
			testable.wrap.handled = function(req) {
				done(new Error('Wrap handler erroneously called'));
			};

			hello('testable')
				.api({
					path: '/handled',
					formatResponse: false
				}).then(function() {
					// If the response handler was not called then we're good
					done();
				});
		});

	});

	describe('paging', function() {

		it('should override the path parameter with the hash fragment', function(done) {

			hello('testable')
				.api('/endpoint#formatting', function(res) {
					expect(res.url).to.eql('https://testable/endpoint');
					expect(res.path).to.eql('formatting');
					done();
				});
		});

		it('should append the req.path to the hash of the response.paging.next', function(done) {

			testable.wrap = testable.wrap || {};
			testable.wrap['default'] = function(req) {
				req.paging = {next: 'next?page=2'};
				delete testable.wrap['default'];
			};

			hello('testable')
				.api('/unhandled', function(res) {

					// Should place the value of a in the parameter list
					expect(res.paging.next).to.contain('#unhandled');

					done();

				});

		});

	});

});
