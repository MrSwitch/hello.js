// Vkontakte (vk.com)
(function(hello) {
	
	hello.init({
		
		vk: {
			name: 'Vk',

			// See https://vk.com/dev/oauth_dialog
			oauth: {
				version: 2,
				auth: 'https://oauth.vk.com/authorize',
				grant: 'https://oauth.vk.com/access_token'
			},
			
			// Authorization scopes
			scope: {
				basic: '',
				email: 'email',
				offline_access: 'offline'
			},

			// Refresh the access_token
			refresh: true,

			login: function(p) {
				p.qs.display = window.navigator &&
					window.navigator.userAgent &&
					/ipad|phone|phone|android/.test(window.navigator.userAgent.toLowerCase())
					? 'mobile' : 'popup';
			},

			// API Base URL
			base: 'https://api.vk.com/method/',

			// Map GET requests
			get: {
				me: 'users.get'
			},

			// Map POST requests
			post: false,

			wrap: {
				me: formatUser
			},

			// No XHR
			xhr: false,

			// All requests should be JSONP as of missing CORS headers in https://api.vk.com/method/*
			jsonp: function(p, qs) {
				
				if (p.path === 'me') {
					qs.fields = 'id,first_name,last_name,photo_max';
				}
				
				return true;
			},

			// No form
			form: false
		}
	});

	function formatUser(o) {
		
		if (o != null && o.response != null && o.response.length) {
			o = o.response[0];
			o.id = o.uid;
			o.thumbnail = o.picture = o.photo_max;
			o.name = o.first_name + ' ' + o.last_name;

			var vk = hello.utils.store('vk');
			if (vk != null && vk.email != null)
				o.email = vk.email;
		}
		
		return o;
	}
})(hello);
