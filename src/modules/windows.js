//
// Windows
//

(function(hello){

function formatUser(o){
	if(o.id){
		var token = hello.getAuthResponse('windows').access_token;
		o.email = (o.emails?o.emails.preferred:null);
		o.thumbnail = o.picture = 'https://apis.live.net/v5.0/'+o.id+'/picture?access_token='+token;
	}
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
	windows : {
		name : 'Windows live',

		// REF: http://msdn.microsoft.com/en-us/library/hh243641.aspx
		oauth : {
			version : 2,
			auth : 'https://login.live.com/oauth20_authorize.srf'
		},

		// Authorization scopes
		scope : {
			basic			: 'wl.signin,wl.basic',
			email			: 'wl.emails',
			birthday		: 'wl.birthday',
			events			: 'wl.calendars',
			photos			: 'wl.photos',
			videos			: 'wl.photos',
			friends			: '',
			files			: 'wl.skydrive',
			
			publish			: 'wl.share',
			publish_files	: 'wl.skydrive_update',
			create_event	: 'wl.calendars_update,wl.events_create',

			offline_access	: 'wl.offline_access'
		},

		// API Base URL
		base : 'https://apis.live.net/v5.0/',

		// Map GET requests
		get : {
			// Friends
			"me"	: "me",
			"me/friends" : "me/friends",
			"me/following" : "me/friends",
			"me/followers" : "me/friends",

			"me/albums"	: 'me/albums',

			// Include the data[id] in the path
			"me/album"	: '@{id}/files',
			"me/photo"	: '@{id}',

			// FILES
			"me/files"	: '@{id|me/skydrive}/files',

			"me/folders" : '@{id|me/skydrive}/files',
			"me/folder" : '@{id|me/skydrive}/files'
		},

		// Map POST requests
		post : {
			"me/feed" : "me/share",
			"me/share" : "me/share",
			"me/albums" : "me/albums",
			"me/album" : "@{id}/files",

			"me/folders" : '@{id|me/skydrive/}',
			"me/files" : "@{id|me/skydrive/}/files"
		},

		// Map DELETE requests
		del : {
			// Include the data[id] in the path
			"me/album"	: '@{id}',
			"me/files"	: '@{id}'
		},

		wrap : {
			me : function(o){
				formatUser(o);
				return o;
			},
			'me/friends' : formatFriends,
			'me/followers' : formatFriends,
			'me/following' : formatFriends,
			'me/albums' : function(o){
				if("data" in o){
					for(var i=0;i<o.data.length;i++){
						var d = o.data[i];
						d.photos = d.files = 'https://apis.live.net/v5.0/'+d.id+'/photos';
					}
				}
				return o;
			},
			'default' : function(o){
				if("data" in o){
					for(var i=0;i<o.data.length;i++){
						var d = o.data[i];
						if(d.picture){
							d.thumbnail = d.picture;
						}
					}
				}
				return o;
			}
		},
		xhr : false,
		jsonp : function(p){
			if( p.method.toLowerCase() !== 'get' && !hello.utils.hasBinary(p.data) ){
				//p.data = {data: JSON.stringify(p.data), method: p.method.toLowerCase()};
				p.data.method = p.method.toLowerCase();
				p.method = 'get';
			}
		}
	}
});

})(hello);