// hello.chromeapp.js
// This overides the hello.utils.popup method to support chrome.identity.launchWebAuthFlow
// See https://developer.chrome.com/apps/app_identity#non

// Is this a chrome app?
if (typeof chrome === 'object' && typeof chrome.identity === 'object' && chrome.identity.launchWebAuthFlow) {

	(function(){

		// Swap the popup method
		hello.utils.popup = function(url) {
			
			_open(url,true);

			return {
				closed: false
			};
		};

		// Swap the request_cors method
		hello.utils.request_cors = function(callback) {
			callback();
			// Always run as cors
			return true;
		}

		// Open function
		function _open(url,interactive) {
			// Launch 
			chrome.identity.launchWebAuthFlow({
				url: url,
				interactive: interactive
			}, function(response_url) {

				// Split appart the URL
				var a = hello.utils.url(response_url);

				// The location can be augmented in to a location object like so...
				// We dont have window operations on the popup so lets create some

				var _popup = {
					location: {
						// Change the location of the popup
						assign(url){
							// If there is a secondary reassign
							// In the case of OAuth1
							// Trigger this in non-interactive mode.
							_open(url,false);
						},

						search: a.search,
						hash: a.hash,
						href: a.href
					},
					close(){}
				};

				// Then this URL contains information which HelloJS must process
				// URL string
				// Window - any action such as window relocation goes here
				// Opener - the parent window which opened this, aka this script

				hello.utils.responseHandler(_popup, window);
			});
		}


	})();
}
