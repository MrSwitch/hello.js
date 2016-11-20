// Chrome Packaged Apps
// The Chrome Extension redefines the "hello.utils.popup"

describe('ChromeApp hello.utils.popup', function() {

	if (!(typeof chrome === 'object' && typeof chrome.identity === 'object' && chrome.identity.launchWebAuthFlow)) {
		// dont run tests for chrome
		return;
	}

	var _launch = chrome.identity.launchWebAuthFlow;

	after(function() {
		chrome.identity.launchWebAuthFlow = _launch;
	});

	it('Should launch chrome.identity.launchWebAuthFlow', function() {

		var spy = sinon.spy();

		chrome.identity.launchWebAuthFlow = spy;

		hello.utils.popup('https://doma.in/oauth/auth', 'https://redirect.uri/path', {});

		expect(spy.calledOnce).to.be.ok();
	});
});
