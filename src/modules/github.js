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
		var next = headers.Link.match(/<(.*?)>;\s*rel=\"next\"/);
		if(next){
			res.paging = {
				next : next[1]
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
			'me/followers' : 'user/followers?per_page=@{limit|100}',
			'me/like' : 'user/starred?per_page=@{limit|100}'
		},
		// post : {

		//		// https://developer.github.com/v3/activity/starring/#star-a-repository
		//		'me/like' : function(p,callback){
		//			p.method = 'put';
		//			p.headers['Content-Length'] = 0;
		//			var id = p.data.id;
		//			p.data = null;
		//			callback("user/starred/"+id);
		//		}
		//	},
		//	del : {

		//		// https://developer.github.com/v3/activity/starring/#unstar-a-repository
		//		'me/like' : "user/starred/@{id}"
		//	},
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
		},
		xhr : function(p){

			if( p.method !== 'get' && p.data ){
				// Serialize payload as JSON
				p.headers = p.headers || {};
				p.headers['Content-Type'] = 'application/json';
				if (typeof(p.data) === 'object'){
					p.data = JSON.stringify(p.data);
				}
			}

			return true;
		}
	}
});

})(hello);
