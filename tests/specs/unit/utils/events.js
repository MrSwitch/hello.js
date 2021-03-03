
var utils = hello.utils;

describe('utils.event', function() {

	var hello;
	var arbitaryData;
	var eventName;

	beforeEach(function() {

		// Pass an arbitary piece of data around
		arbitaryData = {boom: true};

		eventName = 'custom';

		hello = {
			utils: utils
		};
		utils.Event.call(hello);
	});

	it('should bind events by name and be able to trigger them by name', function() {

		// Make request
		var spy = sinon.spy(function(data, type) {

			expect(eventName).to.be(type);

			expect(arbitaryData).to.be(data);

		});

		hello.on(eventName, spy);

		hello.emit(eventName, arbitaryData);

		expect(spy.called).to.be.ok();
	});

	it('should listen to any event by using a "*"', function() {

		// Make request
		var spy = sinon.spy(function(data, type) {

			expect(eventName).to.be(type);

			expect(arbitaryData).to.be(data);

		});

		hello.on('*', spy);

		hello.emit(eventName, arbitaryData);

		expect(spy.called).to.be.ok();
	});

	it('should unbind an event by name and callback', function() {

		// Listeners
		var spy = sinon.spy(function() {
			// Should not be called.
		});

		var spy2 = sinon.spy(function() {
			// Should not be called.
		});

		// Bind
		hello.on(eventName, spy);

		hello.on(eventName, spy2);

		// Remove
		hello.off(eventName, spy);

		// Trigger
		hello.emit(eventName);

		// Test spies
		expect(!spy.called).to.be.ok();
		expect(spy2.called).to.be.ok();

	});

	it('should unbind all events by name', function() {

		// Listeners
		var spy = sinon.spy(function() {
			// Should not be called.
		});

		var spy2 = sinon.spy(function() {
			// Should not be called.
		});

		// Bind
		hello.on(eventName, spy);

		hello.on(eventName, spy2);

		// Remove
		hello.off(eventName);

		// Trigger
		hello.emit(eventName);

		// Test spies
		expect(!spy.called).to.be.ok();
		expect(!spy2.called).to.be.ok();

	});

	it('should trigger events on its proto (predecessor in chain)', function() {

		// PROTO
		// Listeners
		var spy = sinon.spy(function() {
			// Should not be called.
		});

		// Bind
		hello.on(eventName, spy);

		// PROTO
		var child = Object.create(hello);

		var spy2 = sinon.spy(function() {
			// Should not be called.
		});

		hello.on(eventName, spy2);

		// Trigger
		hello.emit(eventName);

		// Test spies
		expect(spy.called).to.be.ok();
		expect(spy2.called).to.be.ok();

	});

});
