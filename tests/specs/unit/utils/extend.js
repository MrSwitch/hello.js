
var extend = hello.utils.extend;

describe('utils.extend', function() {

	it('should overide the properties in the first object with those within the second', function() {

		var a = {
			key: 'valueA'
		};

		var b = {
			key: 'valueB'
		};

		extend(a, b);

		// Check a is like b
		expect(a).to.eql(b);

		// But a is not b
		expect(a).to.not.equal(b);

	});

	it('should merge child objects', function() {

		var a = {
			key: 'valueA'
		};
		a.child = {};
		a.child.key = 'valueA';
		a.child.key2 = 'valueA';

		var b = {
			key: 'valueB'
		};
		b.child = b;

		extend(a, b);

		// Check a is like b
		expect(a).to.not.eql(b);

	});

	it('should merge arrays', function() {

		var a = [1];
		var b = [2];

		extend(a, b);

		// Check arrays have merged
		expect(a).to.eql([1, 2]);
	});

	it('should clone arrays if one does not exist', function() {

		var a = {};
		var b = {arr: [1]};

		extend(a, b);

		// Check arrays are the same, but different
		expect(a).to.have.property('arr');
		expect(a.arr).to.eql(b.arr);
		expect(a.arr).to.not.equal(b.arr);
	});

});
