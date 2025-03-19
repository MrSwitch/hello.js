
var utils = hello.utils;

function mockLocation(url) {
	var a = document.createElement('a');
	a.href = url;

	var mock = {
		assign: function() {

		}
	};

	var props = ['hash', 'host', 'hostname', 'href', 'pathname', 'port', 'protocol', 'search'];
	for (var i = 0; i < props.length; i++) {
		var x = props[i];
		mock[x] = a[x];
	}

	return mock;
}

describe('utils.responseHandler', function() {

	// Window denotes the current window which is operating the script.
	// Parent refers to that windows parent.

	var _window;
	var _parent;
	var _state;
	var _accessToken;

	describe('OAuth handler', function() {

		var _store = utils.store;

		beforeEach(function() {

			_accessToken = '1234';

			_state = {
				callback: '_hellojs_callbackTestFunc',
				network: 'network'
			};

			// Mock up _window and _parent objects for the tests
			_window = {
				location: mockLocation('http://adodson.com/redirect.html?state=' + JSON.stringify(_state) + '&access_token=' + _accessToken),
				close: function() {
				}
			};

			_parent = {
				_hellojs_callbackTestFunc: function() {
					// This is the callback function on the parent
				}
			};
		});

		afterEach(function() {
			utils.store = _store;
		});

		it('should do nothing if the current window has no state parameter', function() {

			_window.location = mockLocation('http://adodson.com/redirect.html');

			var spy = sinon.spy();

			_window.close = spy;

			utils.responseHandler(_window, _parent);

			expect(spy.callCount).to.be(0);

		});

		it('should redirect to oauth proxy and preserve the query string', function() {
			_state.oauth_proxy = 'http://adodson.com/oauth_proxy?foo=bar';
			_state.redirect_uri = 'http://adodson.com/';

			_window.location = mockLocation('http://adodson.com/redirect.html?code=abc&state=' + JSON.stringify(_state));

			var spy = sinon.spy();
			_window.location.assign = spy;

			utils.responseHandler(_window, _parent);

			// Using regex, instead of eq comparison, because the order
			// of query string parameters is not guaranteed
			expect(spy.args[0][0]).to.match(/foo=bar/);
			expect(spy.args[0][0]).to.match(/redirect_uri=/);
		});

		it('should redirect to page_uri', function() {
			_state.page_uri = 'https://example.com';

			_window.location = mockLocation('http://adodson.com/redirect.html?state=' + JSON.stringify(_state));

			var spy = sinon.spy();
			_window.location.assign = spy;

			utils.responseHandler(_window, _parent);

			// Should redirect to page_uri
			expect(spy.args[0][0]).to.match(/https:\/\/example.com/);
		});

		// Prevent Client Side redirects using HELLOJS_REDIRECT_URL
		[undefined, 'https://', 'https://example.com', /^https:\/\/(www.)?example.com/].forEach(HELLOJS_REDIRECT_URL => {

			var PAGE_URI = 'https://example.com/path';

			it(`should redirect to page_uri ${PAGE_URI} if 'HELLOJS_REDIRECT_URL=${HELLOJS_REDIRECT_URL}'`, function() {

				_state.page_uri = PAGE_URI;

				_window.location = mockLocation('http://adodson.com/redirect.html?state=' + JSON.stringify(_state));

				var spy = sinon.spy();
				_window.location.assign = spy;

				if (HELLOJS_REDIRECT_URL !== undefined) {
					_window.HELLOJS_REDIRECT_URL = HELLOJS_REDIRECT_URL;
				}

				utils.responseHandler(_window, _parent);

				// Should redirect to page_uri
				expect(spy.args[0][0]).to.eql(PAGE_URI);
			});
		});

		[false, 'http://', 'https://anotherdomain.com'].forEach(HELLOJS_REDIRECT_URL => {

			var PAGE_URI = 'https://example.com/path';

			it(`should not redirect to page_uri ${PAGE_URI} if 'HELLOJS_REDIRECT_URL=${HELLOJS_REDIRECT_URL}'`, function() {
				_state.page_uri = PAGE_URI;

				_window.location = mockLocation('http://adodson.com/redirect.html?state=' + JSON.stringify(_state));

				var spy = sinon.spy();
				_window.location.assign = spy;

				_window.HELLOJS_REDIRECT_URL = HELLOJS_REDIRECT_URL;

				utils.responseHandler(_window, _parent);

				// Should not redirect to anywhere
				expect(spy.notCalled);
			});
		});


		it('should return the access_token to the parent if the current window location contains a access_token and a state parameter containing a callback and network', function() {

			var spy = sinon.spy();
			_window.close = spy;

			var spy2 = sinon.spy();
			_parent._hellojs_callbackTestFunc = spy2;

			utils.responseHandler(_window, _parent);

			expect(spy.calledOnce).to.be.ok();
			expect(spy2.calledOnce).to.be.ok();

			var response = spy2.args[0][0];

			expect(response).to.be.a('string');
			response = JSON.parse(response);

			expect(response).to.have.property('network', _state.network);
			expect(response).to.have.property('access_token', _accessToken);

		});

		it('should always close window despite a parent handler which throws an exception', function() {

			var spy = sinon.spy();
			_window.close = spy;

			var spy2 = sinon.spy(function() {
				throw 'Error';
			});

			_parent._hellojs_callbackTestFunc = spy2;

			utils.responseHandler(_window, _parent);

			expect(spy.calledOnce).to.be.ok();
			expect(spy2.calledOnce).to.be.ok();

			var response = spy2.args[0][0];

			expect(response).to.be.a('string');
			response = JSON.parse(response);

			expect(response).to.have.property('network', _state.network);
			expect(response).to.have.property('access_token', _accessToken);

		});

		it('should close the iframe window', function(done) {

			window._hellojs_testIframeCloses = function() {
				// After the initial load we can expect this to have removed itself;
				setTimeout(function() {
					expect(frm.parentNode).to.eql(null);
					done();
				}, 100);
			};

			// In this example we load a page containing the responseHandler script on it.
			var frm = document.createElement('iframe');
			frm.src = 'redirect.html?state={}&network=test&callback=_hellojs_testIframeCloses&access_token=token';
			document.body.appendChild(frm);

		});

		it('should return OAuth failures', function() {

			var spy = sinon.spy();
			_window.close = spy;
			_window.location = mockLocation('http://adodson.com/redirect.html?error=error&error_description=description&state=' + JSON.stringify(_state));

			var spy2 = sinon.spy();
			_parent._hellojs_callbackTestFunc = spy2;

			utils.responseHandler(_window, _parent);

			expect(spy.calledOnce).to.be.ok();
			expect(spy2.calledOnce).to.be.ok();

			var response = spy2.args[0][0];

			expect(response).to.be.a('string');
			response = JSON.parse(response);

			expect(response).to.have.property('error');
			expect(response.error).to.have.property('code', 'error')
				.and.to.have.property('message', 'description');

		});

		it('should call hello.utils.store with the authResponse including callback property, if the callback was not found on the parent', function() {

			var spy = sinon.spy();
			_window.close = spy;

			// Remove the global callback function
			delete _parent._hellojs_callbackTestFunc;

			// Spy on the store function
			var spy2 = sinon.spy();
			utils.store = spy2;

			// Trigger the response handler
			utils.responseHandler(_window, _parent);

			expect(spy.calledOnce).to.be.ok();
			expect(spy2.calledOnce).to.be.ok();

			// Should set the callback name along with the auth response.
			expect(spy2.args[0][1]).to.have.property('callback', '_hellojs_callbackTestFunc');
		});

	});

	xdescribe('POST Response', function() {

	});

});
