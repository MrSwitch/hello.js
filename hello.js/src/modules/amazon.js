// Amazon
// Amazon services
(function(hello) {

	hello.init({

		amazon: {
			name: 'Amazon',

			oauth: {
				version: 2,
				auth: 'https://www.amazon.com/ap/oa',
				grant: 'https://api.amazon.com/auth/o2/token'
			},

			// Refresh the access_token once expired
			refresh: true,

			scope: {
				basic: 'profile'
			},

			scope_delim: ' ',

			login: function(p) {
				p.options.popup.width = 710;
			},

			base: 'https://api.amazon.com/',

			// There aren't many routes that map to the hello.api so I included me/bikes
			// ... because, bikes
			get: {
				me: 'user/profile'
			},
			wrap: {
				me: function(o, headers) {}
			}
		}
	});

})(hello);
