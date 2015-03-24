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
						grant : 'https://testdemo/grant',
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
			hello
			.login('invalidname', error_response('invalid_network',done) );
		});

		it('should throw a error event if network name is wrong', function(done){
			hello
			.login('invalidname')
			.then( null, error_response('invalid_network',done) );
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

			it('should URIencode `options.redirect_uri`', function(done){

				var REDIRECT_URI ='http://dummydomain.com/?breakdown';

				var spy = sinon.spy(function(url, name, optins){

					url = safari_hack(url);

					expect( url ).to.not.contain( REDIRECT_URI );
					expect( url ).to.contain( encodeURIComponent(REDIRECT_URI) );

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

			it('should use the correct and unencoded delimiter to separate scope', function(done){

				var basic_scope = 'read_user,read_bikes';
				var scope_delim = '+';

				hello.init({
					test_delimit_scope : {
						oauth : {
							auth : 'https://testdemo/access',
							version : 2
						},
						scope_delim : scope_delim,
						scope : {
							'basic' : basic_scope
						}
					}
				});

				var spy = sinon.spy(function(url, name, optins){

					url = safari_hack(url);

					expect(url).to.contain(basic_scope.replace(/[\+\,\s]/, scope_delim));
					done();
				});

				window.open = spy;

				hello.login('test_delimit_scope');
			});

			it('should space encode the delimiter of multiple response_type\'s', function(done){

				var opts = {
					response_type : 'code grant_scopes'
				};

				var spy = sinon.spy(function(url, name){

					url = safari_hack(url);

					expect(url).to.contain( 'code%20grant_scopes' );
					done();
				});

				window.open = spy;

				hello.login('testable', opts);
			});


			it('should substitute "token" for "code" when there is no Grant URL defined', function(done){

				var opts = {
					response_type : 'code grant_scopes'
				};

				hello.services.testable.oauth.grant = null;

				var spy = sinon.spy(function(url, name){

					url = safari_hack(url);

					expect(url).to.contain( 'token%20grant_scopes' );
					done();
				});

				window.open = spy;

				hello.login('testable', opts);
			});

		});


	});
});