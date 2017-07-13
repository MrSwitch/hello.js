const hello = require('../../../../src/hello.js');

module.exports = {

	forEach(collection, fn) {
		if (collection && collection.length) {
			for (let i = 0; i < collection.length; i += 1) {
				fn(collection[i]);
			}
		}
	},

	getRequestProxy(originalRequest) {

		return (req, callback) => {

			const r = Object.assign(req || {}, {
				method: 'get',
				query: {},
				xhr: true
			});

			const stubName = `${req.path + (req.options.stubType || '')  }.json`;
			r.url = `./stubs/${  req.stub || (`${req.network  }/${  req.method  }/${  stubName}`)}`;
			originalRequest.call(hello.utils, r, callback);
		};
	},

	sharedSetup() {

		const originalGetAuthResponse = hello.getAuthResponse;
		const originalProxyHandler = hello.utils.proxyHandler;
		const originalRequest = hello.utils.request;
		const requestProxy = this.getRequestProxy(originalRequest);

		before(() => {
			hello.getAuthResponse = () => ({access_token: 'token'});
			hello.utils.proxyHandler = (p, cb) => cb();

			hello.utils.request = requestProxy;
		});

		after(() => {
			hello.getAuthResponse = originalGetAuthResponse;
			hello.utils.request = originalRequest;
			hello.utils.proxyHandler = originalProxyHandler;
		});

	}

};

