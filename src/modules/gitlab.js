(function(hello) {

	// TODO: make host configurable
	var host = 'https://gitlab.com';

	hello.init({

		gitlab: {

			name: 'GitHub',

			oauth: {
				version: 2,
				auth: host + '/oauth/authorize',
				grant: host + '/login/oauth/token',
				response_type: 'code'
			},

			base: host + '/api/v3/',

			get: {
				me: 'user'
			},

			wrap: {
				me: function(o, headers) {

					formatError(o, headers);
					formatUser(o);

					return o;
				}
			}
		}
	});

	function formatError(o, headers) {
		if (o.message) {
			o.error = {
				message: o.message
			};
			delete o.message;
		}
	}

	function formatUser(o) {
		if (o.id) {
			o.thumbnail = o.picture = o.avatar_url;
			o.name = o.username;
		}
	}

})(hello);
