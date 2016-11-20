let hello = require('../../../../src/hello.js');

	module.exports = {

		forEach: function(collection, fn) {
			if (collection && collection.length) {
				for (var i = 0; i < collection.length; i += 1) {
					fn(collection[i]);
				}
			}
		},

		getRequestProxy: function(originalRequest) {

			var requestProxy = function(req, callback) {

				var r = {
					...req,
					method: 'get',
					query: {},
					xhr: true
				};

				var stubName = req.path + (req.options.stubType || '') + '.json';
				r.url = './stubs/' + (req.stub || (req.network + '/' + req.method + '/' + stubName));
				originalRequest.call(hello.utils, r, callback);
			};

			return requestProxy;
		},

		sharedSetup: function() {

			var originalGetAuthResponse = hello.getAuthResponse;
			var originalRequest = hello.utils.request;
			var requestProxy = this.getRequestProxy(originalRequest);

			before(function() {
				hello.getAuthResponse = function(service) {
					return {
						access_token: 'token'
					};
				};

				hello.utils.request = requestProxy;
			});

			after(function() {
				hello.getAuthResponse = originalGetAuthResponse;
				hello.utils.request = originalRequest;
			});

		}

	};

