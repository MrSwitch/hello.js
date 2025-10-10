

var domInstance = hello.utils.domInstance;

describe('utils.domInstance', function() {

	it('should return true, if type is an HTMLInputElement matches "input"', function() {

		var type = 'input';

		var value = domInstance(type, document.createElement(type));

		expect(value).to.equal(true);

	});

	it('should return false, if type is an HTMLInputElement matches "form"', function() {

		var type = 'input';

		var value = domInstance('form', document.createElement(type));

		expect(value).to.equal(false);

	});

	it('should return false, if an object posess as an HTMLInputElement', function() {

		var type = 'input';

		var value = domInstance('input', {tagName: type});

		expect(value).to.equal(false);

	});

	it('should return false, if second parameter is ommited or null', function() {

		expect(domInstance('input')).to.equal(false);

		expect(domInstance('input', false)).to.equal(false);

		expect(domInstance('input', true)).to.equal(false);

		expect(domInstance('input', null)).to.equal(false);

	});

});

