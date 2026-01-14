(function(hello) {
	var baseUrl = 'https://api.vimeo.com/';

	hello.init({
		vimeo: {
			name: 'Vimeo',

			oauth: {
				version: 2,
				auth: baseUrl + 'oauth/authorize',
				grant: baseUrl + 'oauth/access_token',
				response_type: 'code'
			},

			login: function(p) {
				// Instruct node-oauth-shim to pass an extra Authorization header when granting
				// Authorization: basic base64(client_id:cient_secret)
				// https://developer.vimeo.com/api/authentication#generate-redirect
				p.qs.state.authorisation = 'header';
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
			},

			// See https://developer.vimeo.com/api/authentication#scopes
			scope: {
				basic: 'public',
				videos: 'public private',
				publish: 'create edit delete interact',
				publish_files: 'create edit delete interact upload'
			},

			base: baseUrl
		}
	});
})(hello);
