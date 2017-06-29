const hello = require('../../../../src/hello.js');
const errorResponse = require('../../../lib/errorResponse.js');


describe('hello.logout', () => {

	before(() => {
		hello.init({
			test: {
				name: 'test',
				id: 'id'
			}
		});
	});

	after(() => {
		delete hello.services.test;
	});

	it('should trigger an error when network is unknown', done => {
		// Make request
		hello('unknown')
			.logout()
			.then(null, errorResponse('invalid_network', done))
			.catch(done);
	});

	describe('remove session from store', () => {

		const store = hello.utils.store;

		beforeEach(() => {
			hello.utils.store = store;
		});

		afterEach(() => {
			hello.utils.store = store;
		});

		it('should remove the session from the localStorage', done => {

			const spy = sinon.spy(() => ({}));

			hello.utils.store = spy;

			hello('test')
				.logout()
				.then(() => {
					expect(spy.calledWith('test', null)).to.be.ok();
					done();
				})
				.catch(done);

		});
	});

	describe('force=true', () => {

		describe('module.logout handler', () => {

			const module = {
				logout() {}
			};

			const store = hello.utils.store;
			const session = {};

			beforeEach(() => {

				// Clear all services
				delete hello.services.testable;

				hello.init({
					testable: module
				});

				hello.utils.store = () => session;

			});

			afterEach(() => {
				// Restore... bah dum!
				hello.utils.store = store;
			});

			it('should call module.logout', done => {

				module.logout = () => done();

				hello('testable')
					.logout({force: true})
					.catch(done);
			});

			it('should attach authResponse object to the options.authResponse', done => {

				module.logout = (callback, options) => {
					expect(options).to.have.property('authResponse', session);
					done();
				};

				hello('testable')
					.logout({force: true})
					.catch(done);
			});
		});
	});
});
