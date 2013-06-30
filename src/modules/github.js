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
			me : function(o,code){
				if(o.id){
					o.picture = o.avatar_url;
					o.thumbnail = o.avatar_url;
					o.name = o.login;
				}
				else if(code===401||code===403){
					o.error = {
						code : "access_denied",
						message : o.message
					};
					delete o.message;
				}
				return o;
			},
			"me/friends" : function(o,code){
				if(Object.prototype.toString.call(o) === '[object Array]'){
					return {data:o};
				}
				else if(code===401||code===403){
					o.error = {
						code : "access_denied",
						message : o.message
					};
					delete o.message;
				}
				return o;
			}
		}
	}
});