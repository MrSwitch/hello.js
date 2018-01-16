(function(hello) {

	/*
	* Register Kakao App at https://auth-server.herokuapp.com before use.
	* type `grunt_url` to https://kauth.kakao.com/oauth/token.
	*/
	hello.init({

		kakao: {

			name: 'Kakao',

			oauth: {
				version: 2,
				auth: 'https://kauth.kakao.com/oauth/authorize',
				grant: 'https://kauth.kakao.com/oauth/token',
				response_type: 'code'
			},

			scope: {

			},

			base: 'https://kapi.kakao.com/',

			get: {
				me: 'v1/user/me'
			},

			post: {
				logout: 'v1/user/logout'
			},

			wrap: {
				me: formatUser
			},

			xhr: function(p) {

				if (p.method === 'get' && p.path === 'me') {
					p.headers = p.headers || {};
					p.headers['Content-Type'] = 'application/x-www-form-urlencoded';

					// Must use proxy because it does not allow CORS request (even if you registered your domain in Kakao Apps)
					p.proxy = true;
					p.proxy_response_type = 'proxy';
				}

				return true;
			}
		}
	});

	function formatUser(o) {
		if (o.id) {
			o.name = o.properties.nickname;
			o.email = o.kaccount_email;
			o.verified = o.kaccount_email_verified;
			o.thumbnail = o.properties.thumbnail_image;
			o.picture = o.properties.profile_image;
		}
	}

})(hello);
