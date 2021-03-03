import errorResponse from '../../libs/errorResponse';

describe('hello.logout', function() {

	before(function() {
		hello.init({
			test: {
				name: 'test',
				id: 'id'
			}
		});
	});

	after(function() {
		delete hello.services.test;
	});

	it('should trigger an error when network is unknown', function(done) {
		// Make request
		hello('unknown')
			.logout()
			.then(null, errorResponse('invalid_network', done));
	});

	it('should assign a complete event', function(done) {
		hello('unknown').logout(function() {done();});
	});

	it('should throw an error events in the eventCompleted handler', function(done) {
		hello('unknown').logout(function(e) {
			expect(e).to.have.property('error');
			done();
		});
	});

	describe('remove session from store', function() {

		var store = hello.utils.store;

		beforeEach(function() {
			hello.utils.store = store;
		});

		afterEach(function() {
			hello.utils.store = store;
		});

		it('should remove the session from the localStorage', function() {

			var spy = sinon.spy(function() {
				return {};
			});

			hello.utils.store = spy;

			hello('test').logout();

			expect(spy.calledWith('test', null)).to.be.ok();
		});
	});

	describe('force=true', function() {

		describe('module.logout handler', function() {

			var module = {
				logout: function() {}
			};

			var store = hello.utils.store;
			var session = {};

			beforeEach(function() {

				// Clear all services
				delete hello.services.testable;

				hello.init({
					testable: module
				});

				hello.utils.store = function() {
					return session;
				};

			});

			afterEach(function() {
				// Restore... bah dum!
				hello.utils.store = store;
			});

			it('should call module.logout', function(done) {

				module.logout = function() {
					done();
				};

				hello('testable').logout({force: true});
			});

			it('should attach authResponse object to the options.authResponse', function(done) {

				module.logout = function(callback, options) {
					expect(options).to.have.property('authResponse', session);
					done();
				};

				hello('testable').logout({force: true});
			});
		});
	});
});

