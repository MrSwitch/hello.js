

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
				expect(type).to.be("error");
				expect(data).to.be.a("object");
				expect(data).to.have.property("error");
				expect(data.error.code).to.be("invalid_network");
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
				expect( event_name ).to.be( type );
				expect( arbitary_data ).to.be( data);
				done();
			};
		};

		it('should trigger event on constructor', function(done){

			// Make request
			var func = test_response(done);
			hello.on(event_name, func);
			hello.emit(event_name, arbitary_data);

		});
		it('should remove event from constructor', function(done){

			var spy = sinon.spy(function(){
				console.log("Whooo");
			});

			hello.on("notfired", spy );
			hello.off("notfired", spy );
			hello.emit("notfired", arbitary_data);
			setTimeout(function(){
				expect( !spy.called ).to.be.ok();
				done();
			},10);

		});
		it('should trigger event on instance', function(done){

			// Make request
			var boom = hello("boom");
			boom.on(event_name, test_response(done));
			boom.emit(event_name, arbitary_data);

		});
	});

});