//
// GitHub
//
(function(){

function formatError(o,code){
	code = code || ( o && "meta" in o && "status" in o.meta && o.meta.status );
	if( (code===401||code===403) ){
		o.error = {
			code : "access_denied",
			message : o.message || (o.data?o.data.message:"Could not get response")
		};
		delete o.message;
	}
}

function formatUser(o){
	if(o.id){
		o.picture = o.avatar_url;
		o.thumbnail = o.avatar_url;
		o.name = o.login;
	}
}

hello.init({
	github : {
		name : 'GitHub',
		oauth : {
			version : 2,
			auth : 'https://github.com/login/oauth/authorize',
			grant : 'https://github.com/login/oauth/access_token'
		},
		base : 'https://api.github.com/',
		get : {
			'me' : 'user',
			'me/friends' : 'user/following',
			'me/following' : 'user/following',
			'me/followers' : 'user/followers'
		},
		wrap : {
			me : function(o,code){

				formatError(o,code);
				formatUser(o);

				return o;
			},
			"default" : function(o,code){

				formatError(o,code);

				if(Object.prototype.toString.call(o) === '[object Array]'){
					o = {data:o};

					for(var i=0;i<o.data.length;i++){
						formatUser(o.data[i]);
					}
				}
				return o;
			}
		}
	}
});

})();