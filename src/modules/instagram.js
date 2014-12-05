//
// Instagram
//
(function(hello){


function formatError(o){
	if(o && "meta" in o && "error_type" in o.meta){
		o.error = {
			code : o.meta.error_type,
			message : o.meta.error_message
		};
	}
}


function formatFriends(o){
	paging(o);
	if(o && "data" in o ){
		for(var i=0;i<o.data.length;i++){
			formatFriend(o.data[i]);
		}
	}
	return o;
}

function formatFriend(o){
	if(o.id){
		o.thumbnail = o.profile_picture;
		o.name = o.full_name || o.username;
	}
}


// Paging
// http://instagram.com/developer/endpoints/
function paging(res){
	if("pagination" in res){
		res['paging'] = {
			next : res['pagination']['next_url']
		};
		delete res.pagination;
	}
}

hello.init({
	instagram : {
		name : 'Instagram',
		login: function(p){
			// Instagram throws errors like "Javascript API is unsupported" if the display is 'popup'.
			// Make the display anything but 'popup'
			p.qs.display = '';
		},

		oauth : {
			// http://instagram.com/developer/authentication/
			version : 2,
			auth : 'https://instagram.com/oauth/authorize/',
			grant : 'https://api.instagram.com/oauth/access_token'
		},

		// Refresh the access_token once expired
		refresh : true,

		scope : {
			basic : 'basic',
			friends : 'relationships',
			publish : 'likes comments'
		},
		scope_delim : ' ',

		base : 'https://api.instagram.com/v1/',

		get : {
			'me' : 'users/self',
			'me/feed' : 'users/self/feed?count=@{limit|100}',
			'me/photos' : 'users/self/media/recent?min_id=0&count=@{limit|100}',
			'me/friends' : 'users/self/follows?count=@{limit|100}',
			'me/following' : 'users/self/follows?count=@{limit|100}',
			'me/followers' : 'users/self/followed-by?count=@{limit|100}',
			
			'friend/photos' : 'users/@{id}/media/recent?min_id=0&count=@{limit|100}'
		},

		post : {
			'me/like' : function( p, callback ){
				var id = p.data.id;
				p.data = {};
				callback('media/'+id+'/likes');
			}
		},

		del : {
			'me/like' : 'media/@{id}/likes'
		},

		wrap : {
			me : function(o){

				formatError(o);

				if("data" in o ){
					o.id = o.data.id;
					o.thumbnail = o.data.profile_picture;
					o.name = o.data.full_name || o.data.username;
				}
				return o;
			},
			"me/friends" : formatFriends,
			"me/following" : formatFriends,
			"me/followers" : formatFriends,
			"me/photos" : function(o){

				formatError(o);
				paging(o);

				if("data" in o){
					for(var i=0;i<o.data.length;i++){
						var d = o.data[i];
						if(d.type !== 'image'){
							o.data.splice(i,1);
							i--;
							continue;
						}
						d.thumbnail = d.images.thumbnail.url;
						d.picture = d.images.standard_resolution.url;
						d.name = d.caption ? d.caption.text : null;
					}
				}
				return o;
			},
			"default" : function(o){
				paging(o);
				return o;
			}
		},

		// Instagram does not return any CORS Headers
		// So besides JSONP we're stuck with proxy
		xhr : function(p,qs){

			var method = p.method;
			var proxy = method !== 'get';

			if( proxy ){

				if( ( method === 'post' || method === 'put' ) && p.query.access_token ){
					p.data.access_token = p.query.access_token;
					delete p.query.access_token;
				}
				// No access control headers
				// Use the proxy instead
				p.proxy = proxy;
			}

			return proxy;
		},

		// no form
		form : false
	}
});
})(hello);