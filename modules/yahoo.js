// Register Yahoo developer
hello.init({
	'yahoo' : {
		// Ensure that you define an oauth_proxy
		oauth : {
			version : "1.0a",
			auth	: "https://api.login.yahoo.com/oauth/v2/request_auth",
			request : 'https://api.login.yahoo.com/oauth/v2/get_request_token',
			token	: 'https://api.login.yahoo.com/oauth/v2/get_token'
		},
		uri : {
			base	: "http://social.yahooapis.com/v1/",
			me		: "http://query.yahooapis.com/v1/yql?q=select%20*%20from%20social.profile%20where%20guid%3Dme&format=json",
			"me/friends"	: 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20social.profile%20where%20guid%20in%20(select%20guid%20from%20social.connections%20where%20owner_guid%3Dme)&format=json'
		},
		wrap : {
			me : function(o){
				if(o.query&&o.query.results&&o.query.results.profile){
					o = o.query.results.profile;
					o.id = o.guid;
					o.name = o.givenName + ' ' +o.familyName;
					o.last_name = o.familyName;
					o.first_name = o.givenName;
					o.email = o.emails?o.emails.handle:null;
					o.thumbnail = o.image?o.image.imageUrl:null;
				}
				return o;
			}
		},
		xhr : false
	}
});