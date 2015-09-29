// Phonegap override for hello.phonegap.js
(function() {

	// Is this a phonegap implementation?
	if (!(/^file:\/{3}[^\/]/.test(window.location.href) && window.cordova)) {
		// Cordova is not included.
		return;
	}

	// Augment the hidden iframe method
	hello.utils.iframe = function(url, redirectUri) {
		hello.utils.popup(url, redirectUri, {hidden: 'yes'});
	};
})();
