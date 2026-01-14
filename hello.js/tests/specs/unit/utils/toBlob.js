
var utils = hello.utils;

// Are errors thrown if an invalid network is provided?

if (supportsBlob) {

	describe('utils.toBlob', function() {

		var test = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';

		it('should convert a data-URI to a Blob', function() {

			var value = utils.toBlob(test);

			// Assert that its the same but different.
			expect(value).to.be.a(Blob);

		});

		it('should return the item if it is not a dataURI, or otherwise the browser doeas not support blobs', function() {

			var invalid = 'http://' + test;
			var value = utils.toBlob(invalid);

			// Assert that it's the same but different.
			expect(value).to.equal(invalid);

		});

	});

}
