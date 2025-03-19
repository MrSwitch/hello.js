
var store = hello.utils.store;

describe('utils.store', function() {

	var data = {
		key: 'value',
		key1: 'value1'
	};
	var label = 'test';

	// Store data for retrieval
	beforeEach(function() {
		store(label, data);
	});

	it('should return the data placed into the store', function() {

		expect(store(label)).to.eql(data);

	});

	it('should update data placed into the store', function() {

		var update = {
			updated: 'update'
		};

		store(label, update);

		expect(store(label)).to.eql(update);

	});

	it('should delete data placed into the store', function() {

		store(label, null);

		expect(store(label)).to.equal(null);

	});

	it('should return null if data not found', function() {

		expect(store('notfound')).to.equal(null);

	});

});
