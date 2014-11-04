//
// Twitter
//


(function(hello){

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
			me		: 'user/info',
			'me/like' : 'user/likes',
			'default' : function(p,callback){
				if(p.path.match(/(^|\/)blog\//)){
					delete p.query.access_token;
					p.query.api_key = hello.services.tumblr.id;
				}
				callback(p.path);
			}
		},
		post : {
			'me/like' : function(p,callback){
				p.path = 'user/like';
				query(p,callback);
			}
		},
		del : {
			'me/like' : function(p,callback){
				p.method = 'post';
				p.path = 'user/unlike';
				query(p,callback);
			}
		},

		wrap : {
			me : function(o){
				if(o&&o.response&&o.response.user){
					o = o.response.user;
				}
				return o;
			},
			'me/like' : function(o){
				if(o&&o.response&&o.response.liked_posts){
					o.data = o.response.liked_posts;
					delete o.response;
				}
				return o;
			},
			'default' : function(o){

				if(o.response){
					var r = o.response;
					if( r.posts ){
						o.data = r.posts;
					}
				}

				return o;
			}
		},

		xhr : function(p,qs){
			if(p.method !== 'get'){
				return true;
			}
			return false;
		}
	}
});


// Converts post parameters to query
function query(p,callback){
	if(p.data){
		extend( p.query, p.data );
		p.data = null;
	}
	callback(p.path);
}

function extend(a,b){
	for(var x in b){
		if(b.hasOwnProperty(x)){
			a[x] = b[x];
		}
	}
}



})(hello);