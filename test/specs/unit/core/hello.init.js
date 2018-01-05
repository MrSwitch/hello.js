const hello = require('../../../../src/hello.js');

describe('hello.init', () => {

	it('should set app credentials and options', () => {

		const credentials = {
			service: 'id'
		};
		const options = {
			redirect_uri: './relative'
		};

		hello.init(credentials, options);
		expect(hello.settings.redirect_uri).to.match(/\/relative/);
	});

});
