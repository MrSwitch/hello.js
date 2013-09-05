

describe('Hello Core', function(){

	before(function(){

	});
	beforeEach(function(){

	});
	afterEach(function(){

	});
	after(function(){

	});


	//
	// Are errors thrown if an invalid network is provided
	//
	describe('Invalid network', function(){

		var test_response = function(done){
			return function(data, type){
				assert.equal(type, "error");
				assert.typeOf(data, "object");
				assert.property(data, "error");
				assert.equal(data.error.code, "invalid_network");
				done();
			};
		};

		it('should trigger an error when accessed through login', function(done){

			// Make request
			hello("Facelessbook").login().on('error', test_response(done));

		});
		it('should trigger an error when accessed through logout', function(done){

			// Make request
			hello("Facelessbook").logout().on('error', test_response(done));

		});
		it('should trigger an error when accessed through api', function(done){

			// Make request
			hello("Facelessbook").api("/").on('error', test_response(done));

		});
		it('should trigger an error when accessed through getAuthResponse', function(done){

			// Make request
			hello("Facelessbook").on('error', test_response(done)).getAuthResponse();

		});
	});


	describe('Utils.Events', function(){

		// Pass an arbitary piece of data around
		var arbitary_data = {boom:true},
			event_name = 'custom';

		var test_response = function(done){
			return function(data, type){
				assert.equal(event_name, type);
				assert.equal(arbitary_data, data);
				done();
			};
		};

		it('should trigger event on constructor', function(done){

			// Make request
			hello.on(event_name, test_response(done));
			hello.emit(event_name, arbitary_data);

		});
		it('should trigger event on instance', function(done){

			// Make request
			var boom = hello("boom");
			boom.on(event_name, test_response(done));
			boom.emit(event_name, arbitary_data);

		});
	});

});