//
// Facebook
//
(function(hello){

function formatUser(o){
	if(o.id){
		o.thumbnail = o.picture = 'https://graph.facebook.com/'+o.id+'/picture';
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

function format(o,headers,req){
	if (typeof o === 'boolean') {
		o = {success: o};
	}
	if(o && "data" in o){
		var token = req.query.access_token;
		for(var i=0;i<o.data.length;i++){
			var d = o.data[i];
			if(d.picture){
				d.thumbnail = d.picture;
			}
			if(d.cover_photo){
				d.thumbnail = base + d.cover_photo+'/picture?access_token='+token;
			}
			if(d.type==='album'){
				d.files = d.photos = base + d.id+'/photos';
			}
			if(d.can_upload){
				d.upload_location = base + d.id+'/photos';
			}
		}
	}
	return o;
}

var base = 'https://graph.facebook.com/';

hello.init({
	facebook : {
		name : 'Facebook',

		login : function(p){
			// The facebook login window is a different size.
			p.options.window_width = 580;
			p.options.window_height = 400;
		},

		// https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow/v2.1
		oauth : {
			version : 2,
			auth : 'https://www.facebook.com/dialog/oauth/',
			grant : 'https://graph.facebook.com/oauth/access_token'
		},

		// Refresh the access_token
		refresh : true,

		logout : function(callback){
			// Assign callback to a global handler
			var callbackID = hello.utils.globalEvent( callback );
			var redirect = encodeURIComponent( hello.settings.redirect_uri + "?" + hello.utils.param( { callback:callbackID, result : JSON.stringify({force:true}), state : '{}' } ) );
			var token = (hello.utils.store('facebook')||{}).access_token;
			hello.utils.iframe( 'https://www.facebook.com/logout.php?next='+ redirect +'&access_token='+ token );

			// Possible responses
			// String URL	- hello.logout should handle the logout
			// undefined	- this function will handle the callback
			// true			- throw a success, this callback isn't handling the callback
			// false		- throw a error
			
			if(!token){
				// if there isn't a token, the above wont return a response, so lets trigger a response
				return false;
			}
		},

		// Authorization scopes
		scope : {
			basic			: 'public_profile',
			email			: 'email',
			birthday		: 'user_birthday',
			events			: 'user_events',
			photos			: 'user_photos,user_videos',
			videos			: 'user_photos,user_videos',
			friends			: 'user_friends',
			files			: 'user_photos,user_videos',
			
			publish_files	: 'user_photos,user_videos,publish_actions',
			publish			: 'publish_actions',

			// Deprecated in v2.0
			// create_event	: 'create_event',

			offline_access : 'offline_access'
		},

		// API Base URL
		base : 'https://graph.facebook.com/',

		// Map GET requests
		get : {
			'me' : 'me',
			'me/friends' : 'me/friends',
			'me/following' : 'me/friends',
			'me/followers' : 'me/friends',
			'me/share' : 'me/feed',
			'me/like' : 'me/likes',

			'me/files' : 'me/albums',
			'me/albums' : 'me/albums',
			'me/album' : '@{id}/photos',
			'me/photos' : 'me/photos',
			'me/photo' : '@{id}',
			
			'friend/albums' : '@{id}/albums',
			'friend/photos' : '@{id}/photos'

			// PAGINATION
			// https://developers.facebook.com/docs/reference/api/pagination/
		},

		// Map POST requests
		post : {
			'me/share' : 'me/feed',
			//	https://developers.facebook.com/docs/graph-api/reference/v2.2/object/likes/
			//	'me/like' : function(p, callback){
			//		var id = p.data.id;
			//		p.data = null;
			//		callback(id + '/likes');
			//	},
			'me/albums' : 'me/albums',
			'me/album' : '@{id}/photos'
		},

		// Map DELETE requests
		del : {
			// https://developers.facebook.com/docs/graph-api/reference/v2.2/object/likes/
			// 'me/like' : '@{id}/likes',
			/*
			// Can't delete an album
			// http://stackoverflow.com/questions/8747181/how-to-delete-an-album
			'me/album' : '@{id}'
			*/
			'me/photo' : '@{id}'
		},

		wrap : {
			me : formatUser,
			'me/friends' : formatFriends,
			'me/following' : formatFriends,
			'me/followers' : formatFriends,
			'me/albums' : format,
			'me/files' : format,
			'default' : format
		},

		// special requirements for handling XHR
		xhr : function(p,qs){
			if(p.method==='get'||p.method==='post'){
				qs.suppress_response_codes = true;
			}
			// Is this a post with a data-uri?
			if( p.method==='post' && p.data && typeof(p.data.file) === 'string'){
				// Convert the Data-URI to a Blob
				p.data.file = hello.utils.toBlob(p.data.file);
			}
			return true;
		},

		// Special requirements for handling JSONP fallback
		jsonp : function(p,qs){
			var m = p.method;
			if( m !== 'get' && !hello.utils.hasBinary(p.data) ){
				p.data.method = m;
				p.method = 'get';
			}
			else if(p.method === "delete"){
				qs.method = 'delete';
				p.method = "post";
			}
		},

		// Special requirements for iframe form hack
		form : function(p){
			return {
				// fire the callback onload
				callbackonload : true
			};
		}
	}
});


})(hello);
