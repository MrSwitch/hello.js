(function(){

function formatUser(o){
	if(o.id){
		if(o.name){
			var m = o.name.split(" ");
			o.first_name = m[0];
			o.last_name = m[1];
		}
		o.thumbnail = o.profile_image_url;
	}
}

hello.init({
	'twitter' : {
		// Ensure that you define an oauth_proxy
		oauth : {
			version : "1.0a",
			auth	: "https://twitter.com/oauth/authorize",
			request : 'https://twitter.com/oauth/request_token',
			token	: 'https://twitter.com/oauth/access_token'
		},
		uri : {
			base	: "https://api.twitter.com/1.1/",
			me		: 'account/verify_credentials.json',
			"me/friends"	: 'friends/list.json',
			'me/share' : function(p,callback){
				p.data = {
					status : p.data.message
				};
				callback( p.method==='post' ? 'statuses/update.json?include_entities=1' : 'statuses/user_timeline.json' );
			}
		},
		wrap : {
			me : function(o){
				formatUser(o);
				return o;
			},
			"me/friends" : function(o){
				if(o.users){
					o.data = o.users;
					for(var i=0;i<o.data.length;i++){
						formatUser(o.data[i]);
					}
					delete o.users;
				}
				return o;
			},
			"me/share" : function(o){
				if(!o.error&&"length" in o){
					return {data : o};
				}
				return o;
			}
		},
		xhr : false
	}
});

})();