//
// GitHub
//
hello.init({
	github : {
		name : 'GitHub',

		uri : {
			auth : 'https://github.com/login/oauth/authorize',
			base : 'https://api.github.com/',
			'me' : 'user'
		},
		wrap : {
			me : function(o){
				if(o.id){
					o.picture = o.avatar_url;
					o.thumbnail = o.avatar_url;
					o.name = o.login;
				}
				return o;
			}
		}
	}
});