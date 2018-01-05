const hello = require('../../../../src/hello.js');
const errorResponse = require('../../../lib/errorResponse.js');

describe('hello.api', () => {

	let _request = hello.utils.request;
	let _session = {
		access_token: 'token'
	};
	let testable = {};

	before(() => {

		// Unset
		_request = hello.utils.request;

		// Mock request
		hello.utils.request = (req, callback) => {
			setTimeout(() => {
				callback(req);
			});
		};

		hello.utils.store = () => _session;

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

	after(() => {

		// Renew
		hello.utils.request = _request;

	});

	it('should throw a error event if network name is undefined', done => {
		hello('test')
			.api('/')
			.then(null, errorResponse('invalid_network', done))
			.catch(done);
	});

	it('should throw a error event if path name is undefined', done => {
		hello('test')
			.api()
			.then(null, errorResponse('invalid_path', done))
			.catch(done);
	});

	it('should construct the url using the base and the pathname', done => {

		hello('testable')
			.api('/endpoint')
			.then(res => {
				expect(res.url).to.eql('https://testable/endpoint');
				done();
			})
			.catch(done);
	});

	it('should extract the parameters from the URL', done => {

		const session = _session;
		_session = null;

		hello('testable')
			.api('/endpoint?a=a&b=b')
			.then(res => {
				_session = session;
				expect(res.url).to.eql('https://testable/endpoint');
				expect(res.query).to.eql({
					a: 'a',
					b: 'b'
				});
				done();
			})
			.catch(done);
	});

	it('should attach query object to the req.query', done => {

		hello('testable')
			.api('/endpoint', {a: 'a'})
			.then(res => {

				expect(res.query).to.have.property('a', 'a');

				done();
			})
			.catch(done);
	});

	it('should attach authResponse object to the req.authResponse', done => {

		hello('testable')
			.api('/endpoint')
			.then(res => {

				expect(res.authResponse).to.eql(_session);

				done();
			})
			.catch(done);
	});

	it('should attach data object to the req.query when `req.method = get`', done => {

		hello('testable')
			.api('/endpoint', 'get', {a: 'a'})
			.then(res => {

				expect(res.query).to.have.property('a', 'a');
				expect(res.data).to.be.empty();

				done();
			})
			.catch(done);
	});

	it('should attach post data object to the req.data', done => {

		hello('testable')
			.api('/endpoint', 'post', {a: 'a'})
			.then(res => {

				expect(res.method).to.eql('post');
				expect(res.query).to.not.have.property('a');
				expect(res.data).to.have.property('a', 'a');

				done();
			})
			.catch(done);
	});

	describe('POST', () => {

		// Not supported in IE9
		const hasFormdata = typeof FormData === 'function';

		if (hasFormdata) {
			it('should accept FormData as the data object', done => {

				const formData = new FormData();
				formData.append('user', 'name');

				hello('testable')
					.api('/endpoint', 'POST', formData)
					.then(res => {
						// The formData should not be mutated, but left as is.
						expect(res.data).to.equal(formData);
						done();
					})
					.catch(done);
			});
		}
	});

	describe('signing', () => {

		it('should add the access_token to the req.query', done => {

			hello('testable')
				.api('/endpoint')
				.then(res => {
					expect(res.url).to.eql('https://testable/endpoint');
					expect(res.query).to.eql(_session);
					done();
				})
				.catch(done);
		});

		it('should mark OAuth1 endpoints with req.proxy', done => {

			// Override
			testable.oauth.version = 1;

			hello('testable')
				.api('/endpoint')
				.then(res => {

					// Renew
					testable.oauth.version = 2;

					// Test
					expect(res.proxy).to.be.ok();
					expect(res.oauth_proxy).to.eql(hello.settings.oauth_proxy);

					done();
				})
				.catch(done);
		});

	});

	describe('map', () => {

		it('should process req object through the modules.get[req.path] function', done => {

			testable.get = testable.get || {};
			testable.get.handled = p => {
				expect(p).to.have.property('path', 'handled');
				done();
			};

			hello('testable')
				.api('/handled', {a: 'a'})
				.catch(done);
		});

		it('should process req object through the modules.get.default function if req.path not in module.get', done => {

			testable.get = testable.get || {};
			testable.get.default = p => {
				expect(p).to.have.property('path', 'unhandled');
				delete testable.get.default;
				done();
			};

			hello('testable')
				.api('/unhandled', {a: 'a'})
				.catch(done);
		});

		it('should trigger an error if the mapped value is false', done => {

			testable.get = testable.get || {};
			testable.get.handled = false;

			hello('testable')
				.api('/handled')
				.then(null, res => {

					// Should place the value of a in the parameter list
					expect(res.error).to.have.property('code', 'invalid_path');

					delete testable.get.handled;

					done();
				})
				.catch(done);
		});

		describe('Replace @{} in path with request parameters', () => {

			it('should define the path using the query parameters and remove them from the query', done => {

				testable.get = testable.get || {};
				testable.get.handled = 'endpoint?b=@{a}';

				hello('testable')
					.api('/handled', {a: 'a'})
					.then(res => {

						// Should place the value of a in the parameter list
						expect(res.url).to.contain('endpoint?b=a');

						// Should place the value of a in the parameter list
						expect(res.path).to.eql('handled');

						// Should remove the property from the req.query
						expect(res.query).to.not.have.property('a');

						delete testable.get.handled;

						done();
					})
					.catch(done);
			});

			it('should define the path using the query parameters and remove them from the post data', done => {

				testable.post = testable.post || {};
				testable.post.handled = 'endpoint?b=@{a}';

				hello('testable')
					.api('/handled', 'post', {a: 'a'})
					.then(res => {

						// Should place the value of a in the parameter list
						expect(res.url).to.contain('endpoint?b=a');

						// Should place the value of a in the parameter list
						expect(res.path).to.eql('handled');

						// Should remove the property from the req.query
						expect(res.data).to.not.have.property('a');

						delete testable.get.handled;

						done();
					})
					.catch(done);
			});

			it('should trigger an error if there was no query parameter arg, i.e. @{arg}', done => {

				testable.get = testable.get || {};
				testable.get.handled = 'endpoint?b=@{a}';

				hello('testable')
					.api('/handled')
					.then(null, res => {

						// Should place the value of a in the parameter list
						expect(res.error).to.have.property('code', 'missing_attribute');

						delete testable.get.handled;

						done();
					})
					.catch(done);
			});

			it('should use the default value if one is defined i.e. @{arg|default}', done => {

				testable.get = testable.get || {};
				testable.get.handled = 'endpoint?empty=@{a|}&arg=@{b|default}';

				hello('testable')
					.api('/handled')
					.then(res => {

						// Should place the value of a in the parameter list
						expect(res.url).to.contain('endpoint?empty=&arg=default');

						// Should place the value of a in the parameter list
						expect(res.path).to.eql('handled');

						delete testable.get.handled;

						done();
					})
					.catch(done);
			});

		});
	});

	describe('wrap', () => {

		it('should trigger the wrap function', done => {

			testable.wrap = testable.wrap || {};
			testable.wrap.handled = () => {
				delete testable.wrap.handled;
				done();
			};

			hello('testable')
				.api('/handled')
				.catch(done);
		});

		it('should trigger the wrap.default function if none exists', done => {

			testable.wrap = testable.wrap || {};
			testable.wrap.default = () => {
				delete testable.wrap.default;
				done();
			};

			hello('testable')
				.api('/unhandled')
				.catch(done);
		});

		it('should not trigger the wrap function if formatResponse = false', done => {

			testable.wrap = testable.wrap || {};
			testable.wrap.handled = () => {
				done(new Error('Wrap handler erroneously called'));
			};

			hello('testable')
				.api({
					path: '/handled',
					formatResponse: false
				}).then(() => {
					// If the response handler was not called then we're good
					done();
				})
				.catch(done);
		});

	});

	describe('paging', () => {

		it('should override the path parameter with the hash fragment', done => {

			hello('testable')
				.api('/endpoint#formatting', res => {
					expect(res.url).to.eql('https://testable/endpoint');
					expect(res.path).to.eql('formatting');
					done();
				})
				.catch(done);
		});

		it('should append the req.path to the hash of the response.paging.next', done => {

			testable.wrap = testable.wrap || {};
			testable.wrap.default = req => {
				req.paging = {next: 'next?page=2'};
				delete testable.wrap.default;
			};

			hello('testable')
				.api('/unhandled', res => {

					// Should place the value of a in the parameter list
					expect(res.paging.next).to.contain('#unhandled');

					done();

				})
				.catch(done);

		});

	});

});
