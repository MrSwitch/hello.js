/* globals chrome */
// Chrome Packaged Apps
// The Chrome Extension redefines the "hello.utils.popup"

const hello = require('../../../../../src/hello.js');

describe('ChromeApp hello.utils.popup', () => {

	if (!(typeof chrome === 'object' && typeof chrome.identity === 'object' && chrome.identity.launchWebAuthFlow)) {
		// dont run tests for chrome
		return;
	}

	const _launch = chrome.identity.launchWebAuthFlow;

	after(() => {
		chrome.identity.launchWebAuthFlow = _launch;
	});

	it('Should launch chrome.identity.launchWebAuthFlow', () => {

		const spy = sinon.spy();

		chrome.identity.launchWebAuthFlow = spy;

		hello.utils.popup('https://doma.in/oauth/auth', 'https://redirect.uri/path', {});

		expect(spy.calledOnce).to.be.ok();
	});
});
