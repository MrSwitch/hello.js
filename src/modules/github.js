//
// GitHub
//
(function(hello){

function formatError(o,headers){
	var code = headers ? headers.statusCode : ( o && "meta" in o && "status" in o.meta && o.meta.status );
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
		o.thumbnail = o.picture = o.avatar_url;
		o.name = o.login;
	}
}

function paging(res,headers,req){
	if(res.data&&res.data.length&&headers&&headers.Link){
		var next = headers.Link.match(/&page=([0-9]+)/);
		if(next){
			res.paging = {
				next : "?page="+ next[1]
			};
		}
	}
}

hello.init({
	github : {
		name : 'GitHub',
		oauth : {
			version : 2,
			auth : 'https://github.com/login/oauth/authorize',
			grant : 'https://github.com/login/oauth/access_token',
			response_type : 'code'
		},

		scope : {
			basic           : '',
			email           : 'user:email'
		},
		base : 'https://api.github.com/',
		get : {
			'me' : 'user',
			'me/friends' : 'user/following?per_page=@{limit|100}',
			'me/following' : 'user/following?per_page=@{limit|100}',
			'me/followers' : 'user/followers?per_page=@{limit|100}'
		},
		wrap : {
			me : function(o,headers){

				formatError(o,headers);
				formatUser(o);

				return o;
			},
			"default" : function(o,headers,req){

				formatError(o,headers);

				if(Object.prototype.toString.call(o) === '[object Array]'){
					o = {data:o};
					paging(o,headers,req);
					for(var i=0;i<o.data.length;i++){
						formatUser(o.data[i]);
					}
				}
				return o;
			}
		}
	}
});

})(hello);
