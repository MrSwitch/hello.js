define([
//	'../../../src/hello'
], function(
//	hello
){



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
	});

	//
	// GetAuthResposne
	//
	describe("GetAuthResposne", function(){

		it('should trigger an error when accessing an invalid network', function(done){
			// Make request
			hello("Facelessbook").on('error', invalid_network(done)).getAuthResponse();
		});
		it('should return null when accessing an invalid network implicitly', function(){
			// Make request
			var r = hello("Facelessbook").getAuthResponse();
			expect(r).to.be(null);
		});
		it('should return null when accessing an invalid network explicitly', function(){
			// Make request
			var r = hello.getAuthResponse("Facelessbook");
			expect(r).to.be(null);
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
	// Use
	//
	describe('use', function(){

		it('should set the service on the current instance only', function(){
			var root = hello, root_service = hello.settings.default_service;
			var instance = hello('instance');
			var descendent = instance.use('descendent');
			expect( hello.settings.default_service ).to.be( root_service );
			expect( instance.settings.default_service ).to.be( 'instance' );
			expect( descendent.settings.default_service ).to.be( 'descendent' );
		});

		it('should return a new instance', function(){

			var instance = hello('instance');
			expect( instance ).to.not.be( hello );
		});

	});

});


});