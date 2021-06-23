
var utils = hello.utils;

// Are errors thrown if an invalid network is provided?

describe('utils.clone', function() {

	it('should clone a simple object', function() {

		var orig = {
			prop: 'prop'
		};

		var clone = utils.clone(orig);

		// Assert that its the same but different.
		expect(clone).to.be.eql(orig).and.not.to.be.equal(orig);

	});

	if (supportsBlob) {
		it('should not clone Blob values', function() {

			var blob = new Blob([new Int8Array([17, -45.3])], {type: 'image/jpeg'});

			var orig = {
				prop: blob
			};

			var clone = utils.clone(orig);

			// Assert that its the same but different.
			expect(clone.prop).to.be.a(Blob).and.to.be.equal(orig.prop);

		});
	}

	it('should not clone DOM element', function() {

		var orig = {
			prop: document.createElement('input')
		};

		var clone = utils.clone(orig);

		// Assert that its the same but different.
		expect(clone.prop).to.be.a(window.Element || window.HTMLElement).and.to.be.equal(orig.prop);

	});

	it('should clone arrays', function() {

		var orig = [1, 2, 3];
		var clone = utils.clone(orig);

		// Assert that its the same but different.
		expect(clone).to.be.eql(orig).and.to.not.be.equal(orig);

	});

	it('should return primitive value (Number)', function() {

		var orig = 1;
		var clone = utils.clone(orig);

		// Assert that its the same but different.
		expect(clone).to.be.eql(orig);

	});

	it('should return primitive value (null)', function() {

		var orig = null;
		var clone = utils.clone(orig);

		// Assert that its the same but different.
		expect(clone).to.be.eql(orig);

	});

	it('should return primitive value (String)', function() {

		var orig = 'string';
		var clone = utils.clone(orig);

		// Assert that its the same but different.
		expect(clone).to.be.eql(orig);

	});

	it('should clone Date objects', function() {

		var orig = (new Date());
		var clone = utils.clone(orig);

		// Assert that its the same but different.
		expect(clone).to.be.eql(orig);

	});

	it('should clone arrays in objects', function() {
		var orig = {
			foo: 'bar',
			arr: [
				{
					a: 'b',
					c: 'd'
				},
				{
					a: '1',
					c: '3'
				}
			]
		};
		var clone = utils.clone(orig);

		expect(clone).to.be.eql(orig).and.to.not.be.equal(orig);
	});
});
