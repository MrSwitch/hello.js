// Script to support ChromeApps
// This registers a listener for the message from the popup window
// Is this a chrome extension?
if (typeof chrome === 'object' && typeof chrome.extension === 'object') {
	chrome.runtime.onMessageExternal.addListener(function(data) {
		if (data.message_type == 'google_auth_response') {
			window[data.callback](data.obj);
		}
	});
}
