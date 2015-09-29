// Test file
mocha.ui('bdd');

// Substitute some of the tests because this is running on a Chrome app.
if (typeof chrome === 'object' && typeof chrome.identity === 'object' && chrome.identity.launchWebAuthFlow) {

	// Substitute the following tests
	require.config({
		path: {
			'./unit/utils/popup': './ext/chromeapp/popup'
		}
	});
}

// Load
require([

	// Utils
	'./unit/utils/args',
	'./unit/utils/clone',
	'./unit/utils/dataToJSON',
	'./unit/utils/diff',
	'./unit/utils/domInstance',
	'./unit/utils/events',
	'./unit/utils/extend',
	'./unit/utils/merge',
	'./unit/utils/param',
	'./unit/utils/popup',
	'./unit/utils/qs',
	'./unit/utils/request',
	'./unit/utils/responseHandler',
	'./unit/utils/store',
	'./unit/utils/toBlob',
	'./unit/utils/url',

	// Core
	'./unit/core/hello.api',
	'./unit/core/hello.getAuthResponse',
	'./unit/core/hello.init',
	'./unit/core/hello.login',
	'./unit/core/hello.logout',
	'./unit/core/hello.use',
	'./unit/core/hello.events',
	'./unit/core/session.monitor',

	// Modules
	'./unit/modules/index',

	// E2E
	'./e2e/modules'

], function() {
	if (window.mochaPhantomJS) { mochaPhantomJS.run(); }
	else { mocha.run(); }
});
