//
// GitHub
//
hello.init({
	github : {
		name : 'GitHub',
		oauth : {
			version : 2,
			grant : 'https://github.com/login/oauth/access_token'
		},
		uri : {
			auth : 'https://github.com/login/oauth/authorize',
			base : 'https://api.github.com/',
			'me' : 'user',
			'me/friends' : 'user/following'
		},
		wrap : {
			me : function(o){
				if(o.id){
					o.picture = o.avatar_url;
					o.thumbnail = o.avatar_url;
					o.name = o.login;
				}
				return o;
			},
			"me/friends" : function(o){
				if(Object.prototype.toString.call(o) === '[object Array]'){
					return {data:o};
				}
				return o;
			}
		}
	}
});