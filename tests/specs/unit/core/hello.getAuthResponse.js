
describe('hello.getAuthResponse', function() {

	it('should return null when accessing an invalid network implicitly', function() {
		// Make request
		var r = hello('Facelessbook').getAuthResponse();
		expect(r).to.be(null);
	});

	it('should return null when accessing an invalid network explicitly', function() {
		// Make request
		var r = hello.getAuthResponse('Facelessbook');
		expect(r).to.be(null);
	});
});

