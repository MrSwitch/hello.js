(function(hello) {
	hello.init({

		simplelogin: {

			name: 'SimpleLogin',

			oauth: {
				version: 2,
				auth: 'https://app.simplelogin.io/oauth2/authorize',
				grant: 'https://app.simplelogin.io/oauth2/token'
			},

			base: 'https://app.simplelogin.io/',

			get: {
				me: 'oauth2/userinfo'
			},

			wrap: {
				me: function(o) {
					if (o.id) {
						o.picture = o.thumbnail = o.avatar_url;
					}

					return o;
				}
			},

			xhr: function(p, qs) {
				var token = qs.access_token;
				delete qs.access_token;
				p.headers.Authorization = 'Bearer ' + token;

				return true;
			},

			jsonp: false
		}
	});

})(hello);
