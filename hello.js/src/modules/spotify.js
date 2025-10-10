// See: https://developer.spotify.com/web-api/
(function(hello) {

	hello.init({

		spotify: {
			name: 'Spotify',

			oauth: {
				version: 2,
				auth: 'https://accounts.spotify.com/authorize',
				grant: 'https://accounts.spotify.com/api/token'
			},

			// See: https://developer.spotify.com/web-api/using-scopes/
			scope_delim: ' ',
			scope: {
				basic: '',
				photos: '',
				friends: 'user-follow-read',
				publish: 'user-library-read',
				email: 'user-read-email',
				share: '',
				publish_files: '',
				files: '',
				videos: '',
				offline_access: ''
			},

			// Request path translated
			base: 'https://api.spotify.com',

			// See: https://developer.spotify.com/web-api/endpoint-reference/
			get: {
				me: '/v1/me',
				'me/following': '/v1/me/following?type=artist', // Only 'artist' is supported

				// Because tracks, albums and playlist exist on spotify, the tracks are considered
				// the resource for the 'me/likes' endpoint
				'me/like': '/v1/me/tracks'
			},

			// Response handlers
			wrap: {
				me: formatUser,
				'me/following': formatFollowees,
				'me/like': formatTracks
			},

			xhr: formatRequest,
			jsonp: false
		}
	});

	// Move the access token from the request body to the request header
	function formatRequest(p, qs) {
		var token = qs.access_token;
		delete qs.access_token;
		p.headers.Authorization = 'Bearer ' + token;

		return true;
	}

	function formatUser(o) {
		if (o.id) {
			o.name = o.display_name;
			o.thumbnail = o.images.length ? o.images[0].url : null;
			o.picture = o.thumbnail;
		}

		return o;
	}

	function formatFollowees(o) {
		paging(o);
		if (o && 'artists' in o) {
			o.data = o.artists.items.forEach(formatUser);
		}

		return o;
	}

	function formatTracks(o) {
		paging(o);
		o.data = o.items;

		return o;
	}

	function paging(res) {
		if (res && 'next' in res) {
			res.paging = {
				next: res.next
			};
			delete res.next;
		}
	}

})(hello);
