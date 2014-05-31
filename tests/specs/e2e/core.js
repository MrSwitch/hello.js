define([
//	'../../../src/hello'
], function(
//	hello
){



describe('Hello Core', function(){


	// //////////////////////////////
	// Create a dummy network
	// //////////////////////////////

	before(function(){
		//
		// Add a default network
		hello.init({
			testable : {
				oauth : {
					auth : 'https://testdemo/access',
					version : 2
				},
				scope : {
					'basic' : 'basic_scope'
				}
			},
			second : {
				oauth : {
					auth : 'https://testdemo/access',
					version : 2
				},
				scope : {
					'common_scope' : 'common_scope'
				}
			}
		});

	});

	// destroy it
	after(function(){
		delete hello.services.testable;
	});



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
	describe("GetAuthResponse", function(){

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
	describe('hello.login( [network] [,options] [,callback])', function(){

		var _open;

		before(function(){
			_open = window.open;
		});

		after(function(){
			window.open = _open;
		});


		function safari_hack(url){
			var m = url.match(/\#oauth_redirect\=(.+)$/i);
			if(m){
				url = decodeURIComponent(decodeURIComponent(m[1]));
			}
			return url;
		}


		it('should assign a complete event', function(){
			var instance = hello.login('invalidname', function(){});
			expect( instance.events ).to.have.property( 'complete' );
		});

		it('should throw a completed and error event if network name is wrong', function(done){
			hello.login('invalidname', invalid_network(done, "complete") );
		});

		it('should throw a error event if network name is wrong', function(done){
			var instance = hello.login('invalidname');
			instance.on('error', invalid_network(done));
		});

		it('should by default, trigger window.open request', function(done){

			var spy = sinon.spy(function(){done();});

			window.open = spy;

			hello.login('testable');
		});

		it('should by default, include the basic scope defined by the module', function(done){

			var spy = sinon.spy(function(url, name, optins){

				url = safari_hack(url);

				expect(url).to.contain('scope='+hello.services.testable.scope.basic);

				done();
			});

			window.open = spy;

			hello.login('testable');
		});

		describe('options', function(){

			it('should apply `options.redirect_uri`', function(done){

				var REDIRECT_URI ='http://dummydomain.com/';

				var spy = sinon.spy(function(url, name, optins){

					url = safari_hack(url);

					var params = hello.utils.param(url.split('?')[1]);

					expect(params.redirect_uri).to.equal(REDIRECT_URI);

					done();
				});

				window.open = spy;

				hello.login('testable', {redirect_uri:REDIRECT_URI});
			});

			it('should permit custom scope in `options.scope` which are unique to this service', function(done){

				var custom_scope = 'custom_scope';

				var spy = sinon.spy(function(url, name, optins){

					url = safari_hack(url);

					var params = hello.utils.param(url.split('?')[1]);

					expect(params.scope).to.contain(custom_scope);

					done();
				});

				window.open = spy;

				hello.login('testable', {scope:custom_scope});
			});
			it('should discard common scope, aka scopes undefined by this module but defined by other services', function(done){

				var common_scope = 'common_scope';

				var spy = sinon.spy(function(url, name, optins){

					url = safari_hack(url);

					// Parse parameters
					var params = hello.utils.param(url.split('?')[1]);

					expect(params.scope).to.not.contain(common_scope);
					done();
				});

				window.open = spy;

				hello.login('testable', {scope:common_scope});
			});

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