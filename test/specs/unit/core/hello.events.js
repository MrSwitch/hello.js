const hello = require('../../../../src/hello.js');
describe('hello events', () => {

	it('should bind handler using hello.on(eventName, handler) and trigger hello.emit', done => {
		function handler() {
			done();
		}

		hello.on('auth.login', handler);
		hello.emit('auth.login');
		hello.off('auth.login', handler);
	});

});
