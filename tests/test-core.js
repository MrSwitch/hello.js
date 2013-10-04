

describe('Hello Core', function(){


	var invalid_network = function(done, event_name){
		event_name = event_name || 'error';
		return function(data, type){
			expect(type).to.be(event_name);
			expect(data).to.be.a("object");
			expect(data).to.have.property("error");
			expect(data.error.code).to.be("invalid_network");
			done();
		};
	};


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

		it('should trigger an error when accessed through login', function(done){

			// Make request
			hello("Facelessbook").login().on('error', invalid_network(done));

		});
		it('should trigger an error when accessed through logout', function(done){

			// Make request
			hello("Facelessbook").logout().on('error', invalid_network(done));

		});
		it('should trigger an error when accessed through api', function(done){

			// Make request
			hello("Facelessbook").api("/").on('error', invalid_network(done));

		});
		it('should trigger an error when accessed through getAuthResponse', function(done){

			// Make request
			hello("Facelessbook").on('error', invalid_network(done)).getAuthResponse();

		});
	});


	//
	// Login
	//
	describe('Login', function(){

		it('should assign a complete event', function(){
			var instance = hello.login('test', function(){});
			expect( instance.events ).to.have.property( 'complete' );
		});

		it('should throw a completed event if network name is wrong', function(done){
			hello.login('test', invalid_network(done, "complete") );
		});
		it('should throw a error event if network name is wrong', function(done){
			var instance = hello.login('test');
			instance.on('error', invalid_network(done));
		});
	});

	//
	// Logout
	//
	describe('Logout', function(){

		it('should assign a complete event', function(){
			var instance = hello.logout('test', function(){});
			expect( instance.events ).to.have.property( 'complete' );
		});

		it('should throw a completed event if network name is wrong', function(done){
			var instance = hello.logout('test', function(e){
				expect( e ).to.have.property( 'error' );
				done();
			});
		});
		it('should throw a error event if network name is wrong', function(done){
			var instance = hello.logout('test');
			instance.on('error', function(){
				done();
			});
		});
	});



	//
	// Api
	//
	describe('API', function(){

		it('should assign a complete event', function(){
			var instance = hello('test').api('/', function(){});
			expect( instance.events ).to.have.property( 'complete' );
		});

		it('should throw a completed event if network name is wrong', function(done){
			hello('test').api('/', invalid_network(done, "complete") );
		});

		it('should throw a error event if network name is wrong', function(done){
			var instance = hello('test').api("/");
			instance.on('error', invalid_network(done));
		});
	});


	//
	// UTILS
	//
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