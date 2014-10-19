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

	var error_response = function(event_code,done){
		return function(data, type){
			expect(data).to.be.a("object");
			expect(data).to.have.property("error");
			expect(data.error.code).to.be(event_code);
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


		it('should assign a complete event', function(done){

			var spy = sinon.spy(function(){done();});

			var popup = {
				closed : false
			};

			window.open = function(){
				return popup;
			};

			hello.login('testable', spy);

			popup.closed = true;

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

		it('should assign a complete event', function(done){
			hello.logout('test', function(){done();});
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

		var _request = hello.utils.request;
		var _store = hello.utils.store;
		var _session = {
			access_token : 'token'
		};
		var testable = {};

		before(function(){

			// unset
			_request = hello.utils.request;
			_store = hello.utils.store;

			// Mock request
			hello.utils.request = function(req, callback){
				setTimeout(function(){
					callback(req);
				});
			};

			hello.utils.store = function(label, body){
				return _session;
			};

			// Define default network
			hello.init({
				testable : {
					oauth : {
						auth : 'https://testdemo/access',
						version : 2
					},
					scope : {
						'basic' : 'basic_scope'
					},
					base : 'https://testable/'
				}
			});

			testable = hello.services.testable;

		});

		after(function(){

			// renew
			hello.utils.request = _request;

		});

		it('should assign a complete event', function(done){
			hello('test').api('/', function(){done();});
		});

		it('should throw a completed event if network name is undefined', function(done){
			hello('test').api('/', invalid_network(done, "complete") );
		});

		it('should throw a error event if network name is undefined', function(done){
			var instance = hello('test').api("/");
			instance.on('error', invalid_network(done));
		});

		it('should throw a error event if path name is undefined', function(done){
			var instance = hello('test').api();
			instance.on('error', error_response("invalid_path", done));
		});

		it('should construct the url using the base and the pathname', function(done){

			hello('testable').api("/endpoint", function(res){
				expect( res.url ).to.eql( 'https://testable/endpoint' );
				done();
			});
		});


		it('should extract the parameters from the URL', function(done){

			var session = _session;
			_session = null;

			hello('testable').api("/endpoint?a=a&b=b", function(res){
				_session = session;
				expect( res.url ).to.eql( 'https://testable/endpoint' );
				expect( res.query ).to.eql({
					a : 'a',
					b : 'b'
				});
				done();
			});
		});

		it('should attach query object to the req.query', function(done){

			hello('testable').api("/endpoint", {a:'a'}, function(res){

				expect( res.query ).to.have.property('a','a');

				done();
			});
		});

		it('should attach data object to the req.query when `req.method = get`', function(done){

			hello('testable').api("/endpoint", 'get', {a:'a'}, function(res){

				expect( res.query ).to.have.property('a','a');
				expect( res.data ).to.be.empty();

				done();
			});
		});


		it('should attach post data object to the req.data', function(done){

			hello('testable').api("/endpoint", 'post', {a:'a'}, function(res){

				expect( res.method ).to.eql( 'post' );
				expect( res.query ).to.not.have.property('a');
				expect( res.data ).to.have.property('a','a');

				done();
			});
		});

		describe("signing", function(){

			it('should add the access_token to the req.query', function(done){

				hello('testable').api("/endpoint", function(res){
					expect( res.url ).to.eql( 'https://testable/endpoint' );
					expect( res.query ).to.eql( _session );
					done();
				});
			});


			it('should mark OAuth1 endpoints with req.proxy', function(done){

				// Override
				testable.oauth.version = 1;

				hello('testable').api("/endpoint", function(res){

					// Renew
					testable.oauth.version = 2;

					// Test
					expect( res.proxy ).to.be.ok();
					expect( res.oauth_proxy ).to.eql( hello.settings.oauth_proxy );

					done();
				});
			});

		});

		describe("map", function(){

			it('should process req object through the modules.get[req.path] function', function(done){

				testable.get = testable.get || {};
				testable.get.handled = function( p ){
					expect( p ).to.have.property('path','handled');
					done();
				};

				hello('testable').api("/handled", {a:'a'});
			});

			it('should process req object through the modules.get.default function if req.path not in module.get', function(done){

				testable.get = testable.get || {};
				testable.get.default = function( p ){
					expect( p ).to.have.property('path','unhandled');
					delete testable.get.default;
					done();
				};

				hello('testable').api("/unhandled", {a:'a'});
			});


			it('should process req object through the modules.get[req.path] map string', function(done){

				testable.get = testable.get || {};
				testable.get.handled = 'endpoint?b=@{a}';

				hello('testable').api("/handled", {a:'a'}, function(res){

					// Should place the value of a in the parameter list
					expect( res.url ).to.contain('endpoint?b=a');
					// Should place the value of a in the parameter list
					expect( res.path ).to.eql('handled');
					// Should remove the property from the req.query
					expect( res.query ).to.not.have.property('a');

					delete testable.get.handled;

					done();
				});
			});

			it('should trigger an error if there was no value for a map string argument', function(done){

				testable.get = testable.get || {};
				testable.get.handled = 'endpoint?b=@{a}';

				hello('testable').api("/handled").on('error', function(res){

					// Should place the value of a in the parameter list
					expect( res.error ).to.have.property('code', 'missing_attribute');

					delete testable.get.handled;

					done();
				});
			});

			it('should trigger an error if the mapped value is false', function(done){

				testable.get = testable.get || {};
				testable.get.handled = false;

				hello('testable').api("/handled").on('error', function(res){

					// Should place the value of a in the parameter list
					expect( res.error ).to.have.property('code', 'invalid_path');

					delete testable.get.handled;

					done();
				});
			});

		});
		describe("wrap", function(){

			it('should trigger the wrap function', function(done){

				testable.wrap = testable.wrap || {};
				testable.wrap.handled = function(req){
					delete testable.wrap.handled;
					done();
				};

				hello('testable').api("/handled");
			});

			it('should trigger the wrap.default function if none exists', function(done){

				testable.wrap = testable.wrap || {};
				testable.wrap.default = function(req){
					delete testable.wrap.default;
					done();
				};

				hello('testable').api("/unhandled");
			});
		});


		describe('paging', function(){


			it('should override the path parameter with the hash fragment', function(done){

				hello('testable').api("/endpoint#formatting", function(res){
					expect( res.url ).to.eql( 'https://testable/endpoint' );
					expect( res.path ).to.eql( 'formatting' );
					done();
				});
			});

			it('should append the req.path to the hash of the response.paging.next', function(done){

				testable.wrap = testable.wrap || {};
				testable.wrap.default = function(req){
					req.paging = {next:'next?page=2'};
					delete testable.wrap.default;
					done();
				};

				hello('testable').api("/unhandled", function(res){

					// Should place the value of a in the parameter list
					expect( res.paging.next ).to.contain('#unhandled');

					done();

				});
			});

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