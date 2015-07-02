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

			// Ensure node-oauth-shim passes an extra Authorization header when granting
			// https://developer.vimeo.com/api/authentication#generate-redirect
			authorisation: 'header'
		}
	});
})(hello);
