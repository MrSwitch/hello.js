//
// Twitter
//
hello.init({
	'tumblr' : {
		// Set default window height
		login : function(p){
			p.options.window_width = 600;
			p.options.window_height = 510;
		},

		// Ensure that you define an oauth_proxy
		oauth : {
			version : "1.0a",
			auth	: "https://www.tumblr.com/oauth/authorize",
			request : 'https://www.tumblr.com/oauth/request_token',
			token	: 'https://www.tumblr.com/oauth/access_token'
		},

		base	: "https://api.tumblr.com/v2/",

		get : {
			me		: 'user/info'
		},

		wrap : {
			me : function(o){
				if(o&&o.response&&o.response.user){
					o = o.response.user;
				}
				return o;
			}
		},

		xhr : false
	}
});