const hello = require('../hello.js');

{
	const base = 'https://api.vimeo.com/';

	hello.init({
		vimeo: {
			name: 'Vimeo',

			oauth: {
				version: 2,
				auth: `${base}oauth/authorize`,
				grant: `${base}oauth/access_token`,
				response_type: 'code'
			},

			login(p) {
				// Instruct node-oauth-shim to pass an extra Authorization header when granting
				// Authorization: basic base64(client_id:cient_secret)
				// https://developer.vimeo.com/api/authentication#generate-redirect
				p.qs.state.authorisation = 'header';
			},

			xhr(p) {
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

			base
		}
	});
}