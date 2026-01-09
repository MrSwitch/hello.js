// BikeIndex
// Https://bikeindex.org/documentation/api_v2
(function(hello) {

	hello.init({

		bikeindex: {
			name: 'BikeIndex',

			oauth: {
				version: 2,
				auth: 'https://bikeindex.org/oauth/authorize/',
				grant: 'https://api.bikeindex.org/oauth/access_token'
			},

			scope: {
				basic: 'read_user,read_bikes',
				email: 'read_user'

				// Read_bikes: 'View user's bikes user owned',
				// Write_bikes: 'Edit and create bikes'
			},

			scope_delim: '+',

			// Refresh the access_token once expired
			refresh: true,

			base: 'https://bikeindex.org/api/v2/',

			// There aren't many routes that map to the hello.api so I included me/bikes
			// ... because, bikes
			get: {
				me: 'me',
				'me/bikes': 'me/bikes'
			},

			post: {},

			del: {},

			wrap: {
				me: function(o, headers) {

					formatError(o, headers);
					formatUser(o);

					return o;
				},

				'default': function(o, headers, req) {

					formatError(o, headers);

					if (Array.isArray(o)) {
						o = {data: o};
						paging(o, headers, req);
						o.data.forEach(formatUser);
					}

					return o;
				}
			},

			xhr: function(p) {
				if (p.method !== 'get' && p.data) {
					// Serialize payload as JSON
					p.headers = p.headers || {};
					p.headers['Content-Type'] = 'application/json';
					if (typeof (p.data) === 'object') {
						p.data = JSON.stringify(p.data);
					}
				}

				return true;
			}
		}
	});

	function formatError(o) {
		if (o && o.error) {
			o.error = {
				code: (o.error === 'OAuth error: unauthorized' ? 'access_denied' : 'server_error'),
				message: o.error
			};
		}
	}

	function formatUser(o) {
		if (o.id) {
			o.thumbnail = o.image;
		}

		if (o.user) {
			hello.utils.extend(o, o.user);
			delete o.user;
		}

		if (o.image) {
			o.thumbnail = o.image;
		}

		return o;
	}

	function paging(res, headers, req) {
		if (res.data && res.data.length && headers && headers.Link) {
			var next = headers.Link.match(/<(.*?)>;\s*rel=\"next\"/);
			if (next) {
				res.paging = {
					next: next[1]
				};
			}
		}
	}

})(hello);
