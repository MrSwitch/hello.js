// SmugMug services
(function(hello) {

	hello.init({

		smugmug: {
			name: 'SmugMug',

			oauth: {
				version: '1.0a',
				request: 'http://api.smugmug.com/services/oauth/1.0a/getRequestToken',
				auth: 'http://api.smugmug.com/services/oauth/1.0a/authorize?access=Full&permissions=Modify',
				token: 'http://api.smugmug.com/services/oauth/1.0a/getAccessToken'
			},

			login: function(p) {
				p.options.window_width = 710;
			},

			base: 'https://api.smugmug.com/api/v2',

		}
	});

})(hello);
