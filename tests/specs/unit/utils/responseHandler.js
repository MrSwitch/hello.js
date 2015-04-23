define([], function() {

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

			beforeEach(function() {

				_accessToken = '1234';

				_state = {
					callback: 'callbackTestFunc',
					network: 'network'
				};

				// Mock up _window and _parent objects for the tests
				_window = {
					location: mockLocation('http://adodson.com/redirect.html?state=' + JSON.stringify(_state) + '&access_token=' + _accessToken),
					close: function() {
					}
				};

				_parent = {
					callbackTestFunc: function() {
						// This is the callback function on the parent
					}
				};
			});

			it('should do nothing if the current window has no state parameter', function() {

				_window.location = mockLocation('http://adodson.com/redirect.html');

				var spy = sinon.spy();

				_window.close = spy;

				utils.responseHandler(_window, _parent);

				expect(spy.callCount).to.be(0);

			});

			it('should return the access_token to the parent if the current window location contains a access_token and a state parameter containing a callback and network', function() {

				var spy = sinon.spy();
				_window.close = spy;

				var spy2 = sinon.spy();
				_parent.callbackTestFunc = spy2;

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

				_parent.callbackTestFunc = spy2;

				utils.responseHandler(_window, _parent);

				expect(spy.calledOnce).to.be.ok();
				expect(spy2.calledOnce).to.be.ok();

				var response = spy2.args[0][0];

				expect(response).to.be.a('string');
				response = JSON.parse(response);

				expect(response).to.have.property('network', _state.network);
				expect(response).to.have.property('access_token', _accessToken);

			});

			it('should return OAuth failures', function() {

				var spy = sinon.spy();
				_window.close = spy;
				_window.location = mockLocation('http://adodson.com/redirect.html?error=error&error_description=description&state=' + JSON.stringify(_state));

				var spy2 = sinon.spy();
				_parent.callbackTestFunc = spy2;

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

		});

		xdescribe('POST Response', function() {

		});

	});

});
