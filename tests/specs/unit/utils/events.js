define([
//	'../../../../src/utils/event',
//	'../../../../src/utils/objectCreate'
], function(
//	Event,
//	objectCreate
){

var objectCreate = hello.utils.objectCreate;
var utils = hello.utils;

//
// Events
//
describe('utils / event', function(){

	var hello,
		arbitary_data,
		event_name;

	beforeEach(function(){

		// Pass an arbitary piece of data around
		arbitary_data = {boom:true};

		event_name = 'custom';

		hello = {
			utils : utils
		};
		utils.Event.call(hello);
	});



	it('should bind events by name and be able to trigger them by name', function(){

		// Make request
		var spy = sinon.spy(function( data, type ){

			expect( event_name ).to.be( type );

			expect( arbitary_data ).to.be( data );

		});


		hello.on( event_name, spy );

		hello.emit( event_name, arbitary_data );


		expect( spy.called ).to.be.ok();
	});


	it('should listen to any event by using a "*"', function(){

		// Make request
		var spy = sinon.spy(function( data, type ){

			expect( event_name ).to.be( type );

			expect( arbitary_data ).to.be( data );

		});


		hello.on( '*', spy );

		hello.emit( event_name, arbitary_data );


		expect( spy.called ).to.be.ok();
	});


	it('should unbind an event by name and callback', function(){

		// Listeners
		var spy = sinon.spy(function(){
			// should not be called.
		});

		var spy2 = sinon.spy(function(){
			// should not be called.
		});


		// Bind
		hello.on( event_name, spy );

		hello.on( event_name, spy2 );

		// Remove
		hello.off( event_name, spy );

		// Trigger
		hello.emit( event_name );

		// Test spies
		expect( !spy.called ).to.be.ok();
		expect( spy2.called ).to.be.ok();

	});


	it('should unbind all events by name', function(){

		// Listeners
		var spy = sinon.spy(function(){
			// should not be called.
		});

		var spy2 = sinon.spy(function(){
			// should not be called.
		});


		// Bind
		hello.on( event_name, spy );

		hello.on( event_name, spy2 );

		// Remove
		hello.off( event_name );

		// Trigger
		hello.emit( event_name );

		// Test spies
		expect( !spy.called ).to.be.ok();
		expect( !spy2.called ).to.be.ok();

	});



	it('should trigger events on its proto (predecessor in chain)', function(){

		// PROTO
		// Listeners
		var spy = sinon.spy(function(){
			// should not be called.
		});

		// Bind
		hello.on( event_name, spy );



		// PROTO
		var child = objectCreate(hello);


		var spy2 = sinon.spy(function(){
			// should not be called.
		});

		hello.on( event_name, spy2 );



		// Trigger
		hello.emit( event_name );

		// Test spies
		expect( spy.called ).to.be.ok();
		expect( spy2.called ).to.be.ok();

	});


});

	
});