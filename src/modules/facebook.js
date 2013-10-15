//
// Facebook
//
(function(){

function formatUser(o){
	if(o.id){
		o.picture = 'http://graph.facebook.com/'+o.id+'/picture';
		o.thumbnail = 'http://graph.facebook.com/'+o.id+'/picture';
	}
	return o;
}

function formatFriends(o){
	if("data" in o){
		for(var i=0;i<o.data.length;i++){
			formatUser(o.data[i]);
		}
	}
	return o;
}


hello.init({
	facebook : {
		name : 'Facebook',

		uri : {
			// REF: http://developers.facebook.com/docs/reference/dialogs/oauth/
			auth : 'http://www.facebook.com/dialog/oauth/',
			base : 'https://graph.facebook.com/',
			'me/friends' : 'me/friends',
			'me/following' : 'me/friends',
			'me/followers' : 'me/friends',
			'me/share' : 'me/feed',
			'me/files' : 'me/albums'
		},
		scope : {
			basic			: '',
			email			: 'email',
			birthday		: 'user_birthday',
			events			: 'user_events',
			photos			: 'user_photos,user_videos',
			videos			: 'user_photos,user_videos',
			friends			: '',
			files			: 'user_photos,user_videos',
			
			publish_files	: 'user_photos,user_videos,publish_stream',
			publish			: 'publish_stream',
			create_event	: 'create_event',

			offline_access : 'offline_access'
		},
		wrap : {
			me : formatUser,
			'me/friends' : formatFriends,
			'me/following' : formatFriends,
			'me/followers' : formatFriends,
			'me/albums' : function(o){
				if("data" in o){
					for(var i=0;i<o.data.length;i++){
						o.data[i].files = 'https://graph.facebook.com/'+o.data[i].id+'/photos';
						o.data[i].photos = 'https://graph.facebook.com/'+o.data[i].id+'/photos';
						if(o.data[i].cover_photo){
							o.data[i].thumbnail = 'https://graph.facebook.com/'+o.data[i].cover_photo+'/picture?access_token='+hello.getAuthResponse('facebook').access_token;
						}
						o.data[i].type = "album";
						if(o.data[i].can_upload){
							o.data[i].upload_location = 'https://graph.facebook.com/'+o.data[i].id+'/photos';
						}
					}
				}
				return o;
			},
			'me/files' : function(o){return this["me/albums"](o);},
			'default' : function(o){
				if("data" in o){
					for(var i=0;i<o.data.length;i++){
						if(o.data[i].picture){
							o.data[i].thumbnail = o.data[i].picture;
						}
						if(o.data[i].cover_photo){
							o.data[i].thumbnail = 'https://graph.facebook.com/'+o.data[i].cover_photo+'/picture?access_token='+hello.getAuthResponse('facebook').access_token;
						}
					}
				}
				return o;
			}
		},

		// special requirements for handling XHR
		xhr : function(p,qs){
			if(p.method==='get'||p.method==='post'){
				qs.suppress_response_codes = true;
				return true;
			}
			else{
				return false;
			}
		},

		// Special requirements for handling JSONP fallback
		jsonp : function(p){
			if( p.method.toLowerCase() !== 'get' && !hello.utils.hasBinary(p.data) ){
				p.data.method = p.method.toLowerCase();
				p.method = 'get';
			}
		},

		// Special requirements for iframe form hack
		post : function(p){
			return {
				// fire the callback onload
				callbackonload : true
			};
		}
	}
});


})();