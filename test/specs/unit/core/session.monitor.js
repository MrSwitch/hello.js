// Session monitor
const hello = require('../../../../src/hello.js');
const globalCallback = require('tricks/events/globalCallback');

describe('Session monitor', () => {

	beforeEach(() => {
		// Define the service
		hello.services.test = {
			id: 'id'
		};
	});

	afterEach(() => {
		// Define the service
		delete hello.services.test;
	});

	it('should listen to changes within shared storage and trigger global callbacks where they have otherwise not been triggered', done => {

		// Create a callback
		const callbackName = globalCallback(obj => {
			expect(obj).to.have.property('access_token', 'token');
			expect(obj).to.have.property('expires_in', 3600);

			// Should remove the callback from the session
			expect(obj).to.not.have.property('callback');
			done();
		});

			// Construct an AuthResponse
		const obj = {
			callback: callbackName,
			access_token: 'token',
			expires_in: 3600
		};

			// Store the new auth response and the global callback will be triggered
		hello.utils.store('test', obj);
	});

	it('should ignore services which do not have an id defined', done => {
		// Create a spy
		const spy = sinon.spy(done);

		// Remove the id from the test service
		delete hello.services.test.id;

		// Create a callback
		const callbackName = globalCallback(spy);

		// Construct an AuthResponse
		const obj = {
			callback: callbackName,
			access_token: 'token',
			expires_in: 3600
		};

			// Store the new auth response and the global callback will be triggered
		hello.utils.store('test', obj);

		// Create a timer
		setTimeout(() => {
			expect(spy.called).to.not.be.ok();
			done();
		}, 1500);
	});
});
