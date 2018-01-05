const hello = require('../../../../src/hello.js');

describe('hello.getAuthResponse', () => {

	it('should return null when accessing an invalid network implicitly', () => {
		// Make request
		const r = hello('Facelessbook').getAuthResponse();
		expect(r).to.be(null);
	});

	it('should return null when accessing an invalid network explicitly', () => {
		// Make request
		const r = hello.getAuthResponse('Facelessbook');
		expect(r).to.be(null);
	});
});
