// Script to support ChromeApps
// Overrides hello.utils.popup to support chrome.identity.launchWebAuthFlow
// Reference: https://developer.chrome.com/apps/app_identity#non

// Check if the environment is a Chrome App
if (typeof chrome === 'object' && typeof chrome.identity === 'object' && chrome.identity.launchWebAuthFlow) {

	(function() {
  
	  // Swap the popup method to use _open with interactive flag as true
	  hello.utils.popup = function(url) {
		return _open(url, true);
	  };
  
	  // Swap the hidden iframe method to use _open with interactive flag as false
	  hello.utils.iframe = function(url) {
		_open(url, false);
	  };
  
	  // Swap the request_cors method to always run as CORS
	  hello.utils.request_cors = function(callback) {
		callback();
		return true;  // Always run as CORS
	  };
  
	  // Initialize cache from chrome.storage.local
	  var _cache = {};
	  chrome.storage.local.get('hello', function(r) {
		_cache = r.hello || {};  // Update cache with stored data
	  });
  
	  // Custom store method to handle storage operations
	  hello.utils.store = function(name, value) {
		if (arguments.length === 0) {
		  return _cache;  // Return all stored data
		}
  
		if (arguments.length === 1) {
		  return _cache[name] || null;  // Get stored value by name
		}
  
		if (value !== undefined) {
		  _cache[name] = value;  // Set a new value
		  chrome.storage.local.set({ hello: _cache });
		  return value;
		}
  
		// Delete a value from storage
		if (value === null) {
		  delete _cache[name];
		  chrome.storage.local.set({ hello: _cache });
		  return null;
		}
	  };
  
	  // Helper function to handle the OAuth flow using chrome.identity.launchWebAuthFlow
	  function _open(url, interactive) {
		var ref = { closed: false };
  
		// Launch the WebAuthFlow
		chrome.identity.launchWebAuthFlow({
		  url: url,
		  interactive: interactive
		}, function(responseUrl) {
  
		  // Check if the user canceled the flow
		  if (responseUrl === undefined) {
			ref.closed = true;
			return;
		  }
  
		  // Process the response URL
		  var a = hello.utils.url(responseUrl);
  
		  // Define the popup object to simulate window operations
		  var _popup = {
			location: {
			  assign: function(url) {
				// Handle URL reassignment in case of OAuth1 (non-interactive mode)
				_open(url, false);
			  },
			  search: a.search,
			  hash: a.hash,
			  href: a.href
			},
			close: function() {}
		  };
  
		  // Call the HelloJS response handler with the simulated popup and current window
		  hello.utils.responseHandler(_popup, window);
		});
  
		return ref;  // Return reference to the caller
	  }
  
	})();
  
  }
  