//
// Windows
//

(function(hello){

function formatUser(o,headers,req){
	if(o.id){
		var token = req.query.access_token;
		if(o.emails){
			o.email =  o.emails.preferred;
		}
		// If this is not an non-network friend
		if(o.is_friend!==false){
			// Use the id of the user_id if available
			var id = (o.user_id||o.id);
			o.thumbnail = o.picture = 'https://apis.live.net/v5.0/'+id+'/picture?access_token='+token;
		}
	}
}

function formatFriends(o, headers, req){
	if("data" in o){
		for(var i=0;i<o.data.length;i++){
			formatUser(o.data[i], headers, req);
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
			auth : 'https://login.live.com/oauth20_authorize.srf',
			grant : 'https://login.live.com/oauth20_token.srf'
		},

		// Refresh the access_token once expired
		refresh : true,

		logout : function(){
			return 'http://login.live.com/oauth20_logout.srf?ts='+(new Date()).getTime();
		},

		// Authorization scopes
		scope : {
			basic			: 'wl.signin,wl.basic',
			email			: 'wl.emails',
			birthday		: 'wl.birthday',
			events			: 'wl.calendars',
			photos			: 'wl.photos',
			videos			: 'wl.photos',
			friends			: 'wl.contacts_emails',
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
			"me/following" : "me/contacts",
			"me/followers" : "me/friends",
			"me/contacts" : "me/contacts",

			"me/albums"	: 'me/albums',

			// Include the data[id] in the path
			"me/album"	: '@{id}/files',
			"me/photo"	: '@{id}',

			// FILES
			"me/files"	: '@{parent|me/skydrive}/files',

			"me/folders" : '@{id|me/skydrive}/files',
			"me/folder" : '@{id|me/skydrive}/files'
		},

		// Map POST requests
		post : {
			"me/albums" : "me/albums",
			"me/album" : "@{id}/files/",

			"me/folders" : '@{id|me/skydrive/}',
			"me/files" : "@{parent|me/skydrive/}/files"
		},

		// Map DELETE requests
		del : {
			// Include the data[id] in the path
			"me/album"	: '@{id}',
			"me/photo"	: '@{id}',
			"me/folder"	: '@{id}',
			"me/files"	: '@{id}'
		},

		wrap : {
			me : function(o, headers, req){
				formatUser(o, headers, req);
				return o;
			},
			'me/friends' : formatFriends,
			'me/contacts' : formatFriends,
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
		xhr : function(p){
			if( p.method !== 'get' && p.method !== 'delete' && !hello.utils.hasBinary(p.data) ){

				// Does this have a data-uri to upload as a file?
				if( typeof( p.data.file ) === 'string' ){
					p.data.file = hello.utils.toBlob(p.data.file);
				}else{
					p.data = JSON.stringify(p.data);
					p.headers = {
						'Content-Type' : 'application/json'
					};
				}
			}
			return true;
		},
		jsonp : function(p){
			if( p.method !== 'get' && !hello.utils.hasBinary(p.data) ){
				//p.data = {data: JSON.stringify(p.data), method: p.method.toLowerCase()};
				p.data.method = p.method;
				p.method = 'get';
			}
		}
	}
});

})(hello);