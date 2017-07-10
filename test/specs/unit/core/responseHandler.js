const hello = require('../../../../src/hello.js');

const utils = hello.utils;

function mockLocation(url) {
	const a = document.createElement('a');
	a.href = url;

	const mock = {
		assign() {

		}
	};

	const props = ['hash', 'host', 'hostname', 'href', 'pathname', 'port', 'protocol', 'search'];
	for (let i = 0; i < props.length; i++) {
		const x = props[i];
		mock[x] = a[x];
	}

	return mock;
}

describe('utils.responseHandler', () => {

	// Window denotes the current window which is operating the script.
	// Parent refers to that windows parent.

	let _window;
	let _parent;
	let _state;
	let _accessToken;

	describe('OAuth handler', () => {

		const _store = utils.store;

		beforeEach(() => {

			_accessToken = '1234';

			_state = {
				callback: '_hellojs_callbackTestFunc',
				network: 'network'
			};

			// Mock up _window and _parent objects for the tests
			_window = {
				location: mockLocation(`http://adodson.com/redirect.html?state=${  JSON.stringify(_state)  }&access_token=${  _accessToken}`),
				close() {
				}
			};

			_parent = {
				_hellojs_callbackTestFunc() {
					// This is the callback function on the parent
				}
			};
		});

		afterEach(() => {
			utils.store = _store;
		});

		it('should do nothing if the current window has no state parameter', () => {

			_window.location = mockLocation('http://adodson.com/redirect.html');

			const spy = sinon.spy();

			_window.close = spy;

			utils.responseHandler(_window, _parent);

			expect(spy.callCount).to.be(0);

		});


		it('should not call functions which are not prefixed with _hellojs_', () => {

			const spy = sinon.spy();
			_window.close = spy;

			const spy2 = sinon.spy();
			_parent.callbackTestNotCalled = spy2;

			_state.callback = 'callbackTestNotCalled';
			_window.location = mockLocation(`http://adodson.com/redirect.html?state=${  JSON.stringify(_state)  }&access_token=${  _accessToken}`),

			utils.responseHandler(_window, _parent);

			expect(spy.calledOnce).to.be.ok();
			expect(spy2.notCalled).to.be.ok();
		});

		it('should return the access_token to the parent if the current window location contains a access_token and a state parameter containing a callback and network', () => {

			const spy = sinon.spy();
			_window.close = spy;

			const spy2 = sinon.spy();
			_parent._hellojs_callbackTestFunc = spy2;

			utils.responseHandler(_window, _parent);

			expect(spy.calledOnce).to.be.ok();
			expect(spy2.calledOnce).to.be.ok();

			let response = spy2.args[0][0];

			expect(response).to.be.a('string');
			response = JSON.parse(response);

			expect(response).to.have.property('network', _state.network);
			expect(response).to.have.property('access_token', _accessToken);

		});

		it('should always close window despite a parent handler which throws an exception', () => {

			const spy = sinon.spy();
			_window.close = spy;

			const spy2 = sinon.spy(() => {
				throw 'Error';
			});

			_parent._hellojs_callbackTestFunc = spy2;

			utils.responseHandler(_window, _parent);

			expect(spy.calledOnce).to.be.ok();
			expect(spy2.calledOnce).to.be.ok();

			let response = spy2.args[0][0];

			expect(response).to.be.a('string');
			response = JSON.parse(response);

			expect(response).to.have.property('network', _state.network);
			expect(response).to.have.property('access_token', _accessToken);

		});

		it('should return OAuth failures', () => {

			const spy = sinon.spy();
			_window.close = spy;
			_window.location = mockLocation(`http://adodson.com/redirect.html?error=error&error_description=description&state=${  JSON.stringify(_state)}`);

			const spy2 = sinon.spy();
			_parent._hellojs_callbackTestFunc = spy2;

			utils.responseHandler(_window, _parent);

			expect(spy.calledOnce).to.be.ok();
			expect(spy2.calledOnce).to.be.ok();

			let response = spy2.args[0][0];

			expect(response).to.be.a('string');
			response = JSON.parse(response);

			expect(response).to.have.property('error');
			expect(response.error).to.have.property('code', 'error')
				.and.to.have.property('message', 'description');

		});

		it('should call hello.utils.store with the authResponse including callback property, if the callback was not found on the parent', () => {

			const spy = sinon.spy();
			_window.close = spy;

			// Remove the global callback function
			delete _parent._hellojs_callbackTestFunc;

			// Spy on the store function
			const spy2 = sinon.spy();
			utils.store = spy2;

			// Trigger the response handler
			utils.responseHandler(_window, _parent);

			expect(spy.calledOnce).to.be.ok();
			expect(spy2.calledOnce).to.be.ok();

			// Should set the callback name along with the auth response.
			expect(spy2.args[0][1]).to.have.property('callback', '_hellojs_callbackTestFunc');
		});

	});

	describe('OAuth Server Response', () => {
		it('should handle Authorization Code response and redirect to state.oauth_proxy', () => {

			const state = JSON.stringify(Object.assign(_state, {
				redirect_uri: 'https://redirect/',
				oauth_proxy: 'https://auth-proxy/'
			}));
			const code = 'code';

			const qs = `?state=${encodeURIComponent(state)}&code=${code}`;

			// Mock up _window and _parent objects for the tests
			_window.location = mockLocation(`http://adodson.com/redirect.html${qs}`);

			const spy = sinon.spy();
			_window.location.assign = spy;

			// Trigger the response handler
			utils.responseHandler(_window, _parent);

			// Trigger Spy called
			expect(spy.calledOnce).to.be.ok();
			expect(spy.args[0][0]).to.eql(`${_state.oauth_proxy}${qs}&redirect_uri=${encodeURIComponent(_state.redirect_uri)}`);

		});
	});

});
