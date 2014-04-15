//
// Facebook
//
(function(hello){

function formatUser(o){
	if(o.id){
		o.thumbnail = o.picture = 'http://graph.facebook.com/'+o.id+'/picture';
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

function format(o){
	if("data" in o){
		var token = hello.getAuthResponse('facebook').access_token;
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

		// REF: http://developers.facebook.com/docs/reference/dialogs/oauth/
		oauth : {
			version : 2,
			auth : 'https://www.facebook.com/dialog/oauth/'
		},

		logout : function(){
			var domain = window.location.hostname;
			var token = (hello.utils.store('facebook')||{}).access_token;
			var id = hello.services.facebook.id;
			return "https://www.facebook.com/logout.php?access_token="+token+"&app_id="+id+"&channel_url=http%3A%2F%2Fstatic.ak.facebook.com%2Fconnect%2Fxd_arbiter.php%3Fversion%3D28%23cb%3Df1f0c8f8b8%26domain%3D"+domain+"%26origin%3Dhttp%253A%252F%252F"+domain+"%252Ff2931a264%26relation%3Dparent.parent&display=hidden&e2e=%7B%7D&locale=en_US&next=http%3A%2F%2Fstatic.ak.facebook.com%2Fconnect%2Fxd_arbiter.php%3Fversion%3D28%23cb%3Df1b925c374%26domain%3D"+domain+"%26origin%3Dhttp%253A%252F%252F"+domain+"%252Ff2931a264%26relation%3Dparent%26frame%3Df2b703c1d&sdk=joey";
		},

		// Authorization scopes
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

		// API Base URL
		base : 'https://graph.facebook.com/',

		// Map GET requests
		get : {
			'me' : 'me',
			'me/friends' : 'me/friends',
			'me/following' : 'me/friends',
			'me/followers' : 'me/friends',
			'me/share' : 'me/feed',
			'me/files' : 'me/albums',
			'me/albums' : 'me/albums',
			'me/album' : '@{id}/photos',
			'me/photos' : 'me/photos',
			'me/photo' : '@{id}'

			// PAGINATION
			// https://developers.facebook.com/docs/reference/api/pagination/
		},

		// Map POST requests
		post : {
			'me/share' : 'me/feed',
			'me/albums' : 'me/albums',
			'me/album' : '@{id}/photos'
		},

		// Map DELETE requests
		del : {
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
			return true;
		},

		// Special requirements for handling JSONP fallback
		jsonp : function(p,qs){
			var m = p.method.toLowerCase();
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