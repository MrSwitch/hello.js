const hello = require('../../../../src/hello.js');

const utils = hello.utils;

describe('utils.proxyHandler', () => {

	const access_token = 'access_token';
	const url = 'https://provider/endpoint';
	const oauth_proxy = 'https://auth-proxy/';

	let request;

	beforeEach(() => {
		request = {
			method: 'get',
			url,
			authResponse: {
				oauth: {
					version: '1.0a'
				}
			},
			query: {
				access_token
			},
			oauth_proxy
		};
	});

	// Augment the request for data
	it('should augment the response and apply the oauth_proxy url for OAuth1 traffic', () => {


		const spy = sinon.spy();

		utils.proxyHandler(request, spy);

		expect(spy.called).to.be.ok();
		expect(request.url).to.eql(oauth_proxy);
		expect(request.query.access_token).to.eql(access_token);
		expect(request.query.path).eql(url);
	});

});
