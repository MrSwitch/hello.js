/*
	Module for HelloJS.  
	
	This module allows HelloJS to interact with a FusionAuth instance.
	
	
	Instructions:
		
		To interact with a FusionAuth instance, you need to set the correct host.
		
		There are 2 ways of doing that.
		1. Use this module as is, and add a javascript-variable before you include hello.js 
		    
			Example: <script>window.FusionAuthHost="my.fusionauth.ext";</script>
			
		2. Modify this module, and replace 'window.FusionAuthHost' with your designated oauth-host
		
		
	
	
*/

(function(hello) {

	hello.init({

		fusionauth: {

			name: 'fusionauth',

			oauth: {
				version: "2",
				auth: 'https://'+window.FusionAuthHost+'/oauth2/authorize',
				response_type: 'token'
			},

			scope: {
				email: 'email'
			},

			base: 'https://'+window.FusionAuthHost+'/',

			get: {
				me: 'oauth2/userinfo'
			},

			wrap: {
				me: function(o, headers) {

					formatError(o, headers);
					formatUser(o);

					return o;
				},

				'default': function(o, headers, req) {

					formatError(o, headers);

					if (Array.isArray(o)) {
						o = {data:o};
					}

					if (o.data) {
						paging(o, headers, req);
						o.data.forEach(formatUser);
					}

					return o;
				}
			},

			xhr: function(p) {
				var token = p.query.access_token;
				delete p.query.access_token;
				if(token){
					p.headers = {
						"Authorization": "Bearer " + token,
					};
				}
				return true;
			}
		}
	});

	function formatError(o, headers) {
		var code = headers ? headers.statusCode : (o && 'meta' in o && 'status' in o.meta && o.meta.status);
		if ((code === 401 || code === 403)) {
			o.error = {
				code: 'access_denied',
				message: o.message || (o.data ? o.data.message : 'Could not get response')
			};
			delete o.message;
		}
	}

	function formatUser(o) {
		if (o.id) {
			o.thumbnail = o.picture = o.avatar_url;
			o.name = o.login;
		}
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
