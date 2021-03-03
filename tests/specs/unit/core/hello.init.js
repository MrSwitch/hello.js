
describe('hello.init', function() {

	it('should set app credentials and options', function() {

		var credentials = {
			service: 'id'
		};
		var options = {
			redirect_uri: './relative'
		};

		hello.init(credentials, options);
		expect(hello.settings.redirect_uri).to.match(/\/relative/);
	});

});
