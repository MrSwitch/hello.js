
var utils = hello.utils;

describe('utils.merge', function() {

	it('should merge arguments into one new object', function() {

		var a = {
			key: 'valueA'
		};

		var b = {
			key: 'valueB'
		};

		var value = utils.merge(a, b);

		// Check: a is like b
		expect(value).to.eql(b);

		// But a is not b
		expect(value).to.not.equal(b);

	});

});
