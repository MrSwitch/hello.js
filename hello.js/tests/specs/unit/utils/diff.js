

var utils = hello.utils;

describe('utils.diff', function() {

	it('should return the values which are in the second array but not the first', function() {

		var value = utils.diff([1, 3], [1, 2, 3]);
		expect(value).to.eql([2]);

		value = utils.diff([1, 2, 3], [1, 3]);
		expect(value).to.eql([]);

	});

});

