//
// SoundCloud
//
hello.init({
	soundcloud : {
		name : 'SoundCloud',
		// Alter the querystring
		querystring : function(qs){
			var token = qs.access_token;
			delete qs.access_token;
			qs.oauth_token = token;
			qs['_status_code_map[302]'] = 200;
		},
		// Request path translated
		uri : {
			auth : 'https://soundcloud.com/connect',
			base : 'https://api.soundcloud.com/',
			'default' : function(p, callback){
				// include ".json at the end of each request"
				callback(p.path + '.json');
			}
		},
		// Response handlers
		wrap : {
			me : function(o){
				if(o.id){
					o.picture = o.avatar_url;
					o.thumbnail = o.avatar_url;
					o.name = o.username;
				}
				return o;
			}
		}
	}
});