const hello = require('../../../../src/hello.js');
const errorResponse = require('../../../lib/errorResponse.js');
const queryparse = require('tricks/string/queryparse');
const closed = true;

describe('hello.login', () => {

	let testable;
	let second;

	// Create a dummy network
	beforeEach(() => {
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
				another_scope: 'another_scope'
			}
		};

		// Add a network
		hello.init({
			testable,
			second
		});

	});

	// Destroy it
	afterEach(() => {
		delete hello.services.testable;
	});

	const utils = hello.utils;
	const _open = utils.popup;

	after(() => {
		hello.utils.popup = _open;
	});

	it('should throw an error if the popup reference is marked as closed', done => {

		const popup = {
			closed: false
		};

		window.open = () => popup;

		hello
			.login('testable')
			.then(done, errorResponse('cancelled', done))
			.catch(done);

		popup.closed = true;

	});

	it('should throw a error event if network name is wrong', done => {
		hello
			.login('invalidname')
			.then(done, errorResponse('invalid_network', done))
			.catch(done);

	});

	it('should by default, trigger window.open request', done => {

		const spy = sinon.spy(() => done());

		utils.popup = spy;

		hello
			.login('testable');

	});

	it('should include the basic scope defined by the module, by default', done => {

		const spy = sinon.spy(url => {

			expect(url).to.contain(`scope=${  hello.services.testable.scope.basic}`);
			return {closed};
		});

		utils.popup = spy;

		hello
			.login('testable')
			.then(done, err => {
				expect(spy.called).to.be.ok();
				errorResponse('cancelled', done)(err);
			})
			.catch(done);
	});

	it('should not use "basic" as the default scope, if there is no mapping', done => {

		// Remove the basic scope
		delete hello.services.testable.scope.basic;

		// Now the response should not include the scope...
		const spy = sinon.spy(url => {
			expect(url).to.not.contain('scope=basic');
			return {closed};
		});

		utils.popup = spy;

		hello('testable')
			.login()
			.then(done, err => {
				expect(spy.called).to.be.ok();
				errorResponse('cancelled', done)(err);
			})
			.catch(done);
	});

	describe('options', () => {

		it('should apply `options.redirect_uri`', done => {

			const REDIRECT_URI = 'http://dummydomain.com/';

			const spy = sinon.spy(url => {

				const params = queryparse(url.split('?')[1]);

				expect(params.redirect_uri).to.equal(REDIRECT_URI);

				return {closed};
			});

			utils.popup = spy;

			hello
				.login('testable', {redirect_uri: REDIRECT_URI})
				.then(done, err => {
					expect(spy.called).to.be.ok();
					errorResponse('cancelled', done)(err);
				})
				.catch(done);
		});

		it('should URIencode `options.redirect_uri`', done => {

			const REDIRECT_URI = 'http://dummydomain.com/?breakdown';

			const spy = sinon.spy(url => {

				expect(url).to.not.contain(REDIRECT_URI);
				expect(url).to.contain(encodeURIComponent(REDIRECT_URI));

				return {closed};
			});

			utils.popup = spy;

			hello
				.login('testable', {redirect_uri: REDIRECT_URI})
				.then(done, err => {
					expect(spy.called).to.be.ok();
					errorResponse('cancelled', done)(err);
				})
				.catch(done);
		});

		it('should pass through unknown scopes defined in `options.scope`', done => {

			const spy = sinon.spy(url => {

				const params = queryparse(url.split('?')[1]);

				expect(params.scope).to.contain('email');

				return {closed};
			});

			utils.popup = spy;

			hello
				.login('testable', {scope: 'email'})
				.then(done, err => {
					expect(spy.called).to.be.ok();
					errorResponse('cancelled', done)(err);
				})
				.catch(done);
		});

		it('should include the basic scope defined in the settings `hello.settings.scope`', done => {

			hello.settings.scope = ['basic'];
			testable.scope.basic = 'basic';

			const spy = sinon.spy(url => {
				const params = queryparse(url.split('?')[1]);
				expect(params.scope).to.contain('basic');
				return {closed};
			});

			utils.popup = spy;

			hello
				.login('testable', {scope: ['email']})
				.then(done, err => {
					expect(spy.called).to.be.ok();
					errorResponse('cancelled', done)(err);
				})
				.catch(done);
		});

		it('should discard common scope, aka scopes undefined by this module but defined as a global standard in the libary (i.e. basic)', done => {

			const commonScope = 'common_scope';

			// Set this as a common scope (always set to '')
			hello.settings.scope_map[commonScope] = '';

			const spy = sinon.spy(url => {

				// Parse parameters
				const params = queryparse(url.split('?')[1]);

				expect(params.scope).to.not.contain(commonScope);
				return {closed};
			});

			utils.popup = spy;

			hello
				.login('testable', {scope: commonScope})
				.then(done, err => {
					expect(spy.called).to.be.ok();
					errorResponse('cancelled', done)(err);
				})
				.catch(done);
		});

		it('should not included empty scopes', done => {

			const scope = 'scope';
			const paddedScope = `,${  scope  },`;
			delete testable.scope.basic;

			const spy = sinon.spy(url => {

				// Parse parameters
				const params = queryparse(url.split('?')[1]);

				expect(params.scope).to.eql(scope);
				return {closed};
			});

			utils.popup = spy;

			hello
				.login('testable', {scope: paddedScope})
				.then(done, err => {
					expect(spy.called).to.be.ok();
					errorResponse('cancelled', done)(err);
				})
				.catch(done);
		});

		it('should use the correct and unencoded delimiter to separate scope', done => {

			const basicScope = 'read_user,read_bikes';
			const scopeDelim = '+';

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

			const spy = sinon.spy(url => {

				expect(url).to.contain(basicScope.replace(/[+,\s]/, scopeDelim));
				return {closed};
			});

			utils.popup = spy;

			hello
				.login('test_delimit_scope')
				.then(done, err => {
					expect(spy.called).to.be.ok();
					errorResponse('cancelled', done)(err);
				})
				.catch(done);
		});

		it('should space encode the delimiter of multiple response_type\'s', done => {

			const opts = {
				response_type: 'code grant_scopes'
			};

			const spy = sinon.spy(url => {

				expect(url).to.contain('code%20grant_scopes');
				return {closed};
			});

			utils.popup = spy;

			hello
				.login('testable', opts)
				.then(done, err => {
					expect(spy.called).to.be.ok();
					errorResponse('cancelled', done)(err);
				})
				.catch(done);
		});

		it('should substitute "token" for "code" when there is no Grant URL defined', done => {

			const opts = {
				response_type: 'code grant_scopes'
			};

			hello.services.testable.oauth.grant = null;

			const spy = sinon.spy(url => {

				expect(url).to.contain('token%20grant_scopes');
				return {closed};
			});

			utils.popup = spy;

			hello
				.login('testable', opts)
				.then(done, err => {
					expect(spy.called).to.be.ok();
					errorResponse('cancelled', done)(err);
				})
				.catch(done);
		});
	});

	describe('popup options', () => {

		it('should give the popup the default options', done => {

			const spy = sinon.spy((url, name, options) => {
				expect(options.resizable).to.eql('1');
				expect(options.scrollbars).to.eql('1');
				expect(options.width).to.eql('500');
				expect(options.height).to.eql('550');
				return {closed};
			});

			utils.popup = spy;

			hello
				.login('testable')
				.then(done, err => {
					expect(spy.called).to.be.ok();
					errorResponse('cancelled', done)(err);
				})
				.catch(done);
		});

		it('should allow the popup options to be overridden', done => {

			const spy = sinon.spy((url, name, options) => {
				expect(options.location).to.eql('no');
				expect(options.toolbar).to.eql('no');
				expect(options.hidden).to.eql(true);
				return {closed};
			});

			utils.popup = spy;

			hello
				.login('testable', {
					popup: {
						hidden: true,
						location: 'no',
						toolbar: 'no'
					}
				})
				.then(done, err => {
					expect(spy.called).to.be.ok();
					errorResponse('cancelled', done)(err);
				})
				.catch(done);
		});
	});

	describe('option.force = false', () => {

		const _store = hello.utils.store;
		let session = null;

		beforeEach(() => {

			session = {
				access_token: 'token',
				expires: ((new Date()).getTime() / 1e3) + 1000,
				scope: 'basic'
			};

			hello.utils.store = () => session;
		});

		afterEach(() => {

			hello.utils.store = _store;
		});

		it('should not trigger the popup if there is a valid session', done => {

			const spy = sinon.spy(done.bind(null, new Error('window.open should not be called')));
			utils.popup = spy;

			hello('testable')
				.login({force: false})
				.then(r => {
					expect(spy.notCalled).to.be.ok();
					expect(r.authResponse).to.eql(session);
					done();
				})
				.catch(done);
		});

		it('should trigger the popup if the token has expired', done => {

			const spy = sinon.spy(() => ({closed: true}));

			utils.popup = spy;

			session.expires = ((new Date()).getTime() / 1e3) - 1000;

			hello('testable')
				.login({force: false})
				.then(done, err => {
					expect(spy.called).to.be.ok();
					errorResponse('cancelled', done)(err);
				})
				.catch(done);
		});

		it('should trigger the popup if the scopes have changed', done => {

			const spy = sinon.spy(() => ({closed: true}));

			utils.popup = spy;

			hello('testable')
				.login({force: false, scope: 'not-basic'})
				.then(done, err => {
					expect(spy.called).to.be.ok();
					errorResponse('cancelled', done)(err);
				})
				.catch(done);
		});
	});

	describe('custom query string parameters', () => {

		it('should attach custom parameters to the querystring', done => {

			const options = {
				custom: 'custom'
			};

			const spy = sinon.spy((url, name, options) => {

				const params = queryparse(url.split('?')[1]);

				expect(params).to.have.property('custom', options.custom);

				return {closed: true};
			});

			utils.popup = spy;

			hello
				.login('testable', options)
				.then(done, err => {
					expect(spy.called).to.be.ok();
					errorResponse('cancelled', done)(err);
				})
				.catch(done);
		});
	});

	describe('global events', () => {

		it('should trigger an auth.init event before requesting the auth flow', done => {

			const spyGlobal = sinon.spy(e => {
				expect(e).to.have.property('network', 'testable');
				expect(spyPop.notCalled).to.be.ok();
			});

				// Listen out for the auth-flow
			hello.on('auth.init', spyGlobal);

			// Go no further
			const spyPop = sinon.spy(() => ({closed}));
			utils.popup = spyPop;

			// Login
			hello('testable')
				.login({force: true})
				.then(done, err => {
					expect(spyPop.called).to.be.ok();
					expect(spyGlobal.called).to.be.ok();
					errorResponse('cancelled', done)(err);
				})
				.catch(done);

		});

	});

});
