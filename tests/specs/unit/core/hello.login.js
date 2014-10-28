define([
//	'../../../src/hello'
	'../../libs/error_response'
], function(
//	hello
	error_response
){


	//
	// Login
	//
	describe('hello.login', function(){


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
			hello.login('invalidname', error_response('invalid_network',done) );
		});

		it('should throw a error event if network name is wrong', function(done){
			var instance = hello.login('invalidname');
			instance.on('error', error_response('invalid_network',done) );
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
});