define([
	'../../libs/errorResponse'
], function(
	errorResponse
) {

	describe('hello.logout', function() {

		it('should trigger an error when accessed through logout', function(done) {

			// Make request
			hello('Facelessbook')
				.logout()
				.then(null, errorResponse('invalid_network', done));

		});

		it('should assign a complete event', function(done) {
			hello.logout('test', function() {done();});
		});

		it('should throw a completed event if network name is wrong', function(done) {
			hello.logout('test', function(e) {
				expect(e).to.have.property('error');
				done();
			});
		});

		describe('force=true', function() {

			describe('module.logout handler', function() {

				var module = {
					logout: function() {}
				};

				var store = hello.utils.store;
				var session = {};

				before(function() {

					// Clear all services
					delete hello.services.testable;

					hello.init({
						testable: module
					});

					hello.utils.store = function() {
						return session;
					};

				});

				after(function() {
					// Restore... bah dum!
					hello.utils.store = store;
				});

				it('should call module.logout', function(done) {

					module.logout = function() {
						done();
					};

					hello('testable').logout({force:true});
				});

				it('should attach authResponse object to the options.authResponse', function(done) {

					module.logout = function(callback, options) {
						expect(options).to.have.property('authResponse', session);
						done();
					};

					hello('testable').logout({force:true});
				});
			});
		});
	});

});
