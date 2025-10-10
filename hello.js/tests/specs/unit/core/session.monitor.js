// Session monitor
describe('Session monitor', function() {

	beforeEach(function() {
		// Define the service
		hello.services.test = {
			id: 'id'
		};
	});

	afterEach(function() {
		// Define the service
		delete hello.services.test;
	});

	it('should listen to changes within shared storage and trigger global callbacks where they have otherwise not been triggered', function(done) {

		// Create a callback
		var callbackName = hello.utils.globalEvent(function(obj) {
			expect(obj).to.have.property('access_token', 'token');
			expect(obj).to.have.property('expires_in', 3600);

			// Should remove the callback from the session
			expect(obj).to.not.have.property('callback');
			done();
		});

		// Construct an AuthResponse
		var obj = {
			callback: callbackName,
			access_token: 'token',
			expires_in: 3600
		};

		// Store the new auth response and the global callback will be triggered
		hello.utils.store('test', obj);
	});

	it.skip('should ignore services which do not have an id defined', function(done) {
		// Create a spy
		var spy = sinon.spy(done);

		// Remove the id from the test service
		delete hello.services.test.id;

		// Create a callback
		var callbackName = hello.utils.globalEvent(spy);

		// Construct an AuthResponse
		var obj = {
			callback: callbackName,
			access_token: 'token',
			expires_in: 3600
		};

		// Store the new auth response and the global callback will be triggered
		hello.utils.store('test', obj);

		// Create a timer
		setTimeout(function() {
			expect(spy.called).to.not.be.ok();
			done();
		}, 1500);
	});
});

