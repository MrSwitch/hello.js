define([], function() {

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

	});

});
