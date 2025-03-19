
var utils = hello.utils;

// Are errors thrown if an invalid network is provided?

describe('utils.dataToJSON', function() {

	var test;

	beforeEach(function() {

		test = document.createElement('div');
		document.body.appendChild(test);
	});

	afterEach(function() {

		test.parentNode.removeChild(test);
	});

	it('should extrapolate the data in a form', function() {

		// Create a form
		test.innerHTML = '<form id="form">' +
				[
					'<input name="key" value="value"/>',
					'<input name="key2" value="value2"/>',
					'<input name="file" type="file"/>'
				].join() + '</form>';

		// Make request
		var obj = {
			data: document.getElementById('form')
		};

		var bool = utils.dataToJSON(obj);

		if (bool) {
			// This has been altered to a JSON object
			expect(obj.data).to.be.a('object');
			expect(obj.data.key).to.be('value');
			expect(obj.data.key2).to.be('value2');
			expect(obj.data.file).to.be.a('object');
		}
		else {
			// The data object can't be altered
			expect(obj.data.tagName.toUpperCase()).to.be('FORM');
		}

	});

});
