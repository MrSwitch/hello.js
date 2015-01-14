//
// Twitter
//
(function(hello){


function formatUser(o){
	if(o.id){
		if(o.name){
			var m = o.name.split(" ");
			o.first_name = m[0];
			o.last_name = m[1];
		}
		// See https://dev.twitter.com/overview/general/user-profile-images-and-banners
		o.thumbnail = o.profile_image_url_https || o.profile_image_url;
	}
}

function formatFriends(o){
	formaterror(o);
	paging(o);
	if(o.users){
		o.data = o.users;
		for(var i=0;i<o.data.length;i++){
			formatUser(o.data[i]);
		}
		delete o.users;
	}
	return o;
}

function formaterror(o){
	if(o.errors){
		var e = o.errors[0];
		o.error = {
			code : "request_failed",
			message : e.message
		};
	}
}


//
// Paging
// Take a cursor and add it to the path
function paging(res){
	// Does the response include a 'next_cursor_string'
	if("next_cursor_str" in res){
		// https://dev.twitter.com/docs/misc/cursoring
		res['paging'] = {
			next : "?cursor=" + res.next_cursor_str
		};
	}
}


/*
// THE DOCS SAY TO DEFINE THE USER IN THE REQUEST
// ... although its not actually required.

var user_id;

function withUserId(callback){
	if(user_id){
		callback(user_id);
	}
	else{
		hello.api('twitter:/me', function(o){
			user_id = o.id;
			callback(o.id);
		});
	}
}

function sign(url){
	return function(p, callback){
		withUserId(function(user_id){
			callback(url+'?user_id='+user_id);
		});
	};
}
*/

var base = "https://api.twitter.com/";

hello.init({
	'twitter' : {
		// Ensure that you define an oauth_proxy
		oauth : {
			version : "1.0a",
			auth	: base + "oauth/authenticate",
			request : base + "oauth/request_token",
			token	: base + "oauth/access_token"
		},

		base	: base + "1.1/",

		get : {
			"me"			: 'account/verify_credentials.json',
			"me/friends"	: 'friends/list.json?count=@{limit|200}',
			"me/following"	: 'friends/list.json?count=@{limit|200}',
			"me/followers"	: 'followers/list.json?count=@{limit|200}',

			// https://dev.twitter.com/docs/api/1.1/get/statuses/user_timeline
			"me/share"	: 'statuses/user_timeline.json?count=@{limit|200}',

			// https://dev.twitter.com/rest/reference/get/favorites/list
			"me/like" : 'favorites/list.json?count=@{limit|200}'
		},

		post : {
			'me/share' : function(p,callback){

				var data = p.data;
				p.data = null;

				// TWEET MEDIA
				if( data.file ){
					p.data = {
						status : data.message,
						"media[]" : data.file
					};
					callback('statuses/update_with_media.json');
				}
				// RETWEET?
				else if( data.id ){
					callback('statuses/retweet/'+data.id+'.json');
				}
				// TWEET
				else{
					callback( 'statuses/update.json?include_entities=1&status='+data.message );
				}
			},

			// https://dev.twitter.com/rest/reference/post/favorites/create
			'me/like' : function(p,callback){
				var id = p.data.id;
				p.data = null;
				callback("favorites/create.json?id="+id);
			}
		},

		del : {
			// https://dev.twitter.com/rest/reference/post/favorites/destroy
			'me/like' : function(){
				p.method = 'post';
				var id = p.data.id;
				p.data = null;
				callback("favorites/destroy.json?id="+id);
			}
		},

		wrap : {
			me : function(res){
				formaterror(res);
				formatUser(res);
				return res;
			},
			"me/friends" : formatFriends,
			"me/followers" : formatFriends,
			"me/following" : formatFriends,

			"me/share" : function(res){
				formaterror(res);
				paging(res);
				if(!res.error&&"length" in res){
					return {data : res};
				}
				return res;
			},
			"default" : function(res){
				res = arrayToDataResponse(res);
				paging(res);
				return res;
			}
		},
		xhr : function(p){
			// Rely on the proxy for non-GET requests.
			return (p.method!=='get');
		}
	}
});


function arrayToDataResponse(res){

	return hello.utils.isArray( res ) ? { data : res } : res;

}


})(hello);
