hello.init({

	box: {

		name: 'Box',

		oauth: {
			version: 2,
			auth: 'https://app.box.com/api/oauth2/authorize',
			grant: 'https://api.box.com/oauth2/token',
			response_type: 'code'
		},

		base: 'https://api.box.com/2.0/',

		get: {
			me: 'users/me',
			'me/files': 'files'
		},

		wrap: {
			me: function(o) {
				if (o.id) {
					o.picture = o.thumbnail = o.avatar_url;
					if (o.login.match('@')) {
						o.email = o.login;
					}
				}

				return o;
			},

			'me/files': function(o) {
				if (Array.isArray(o)) {
					return {data: o};
				}

				return o;
			}
		},

		xhr: function(p) {

			p.proxy = true;
			p.proxy_response_type = 'proxy';
			return true;
		},

		jsonp: false
	}
});
