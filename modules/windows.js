//
// Windows
//
hello.init({
	windows : {
		name : 'Windows live',

		uri : {
			// REF: http://msdn.microsoft.com/en-us/library/hh243641.aspx
			auth : 'https://oauth.live.com/authorize',
			base : 'https://apis.live.net/v5.0/',
			"me/share" : function(p,callback){
				// If this is a POST them return
				callback( p.method==='get' ? "me/feed" : "me/share" );
			},
			"me/feed" : function(p,callback){
				// If this is a POST them return
				callback( p.method==='get' ? "me/feed" : "me/share" );
			},
			"me/files" : 'me/skydrive/files'

		},
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
		wrap : {
			me : function(o){
				if(o.id){
					o.email = (o.emails?o.emails.preferred:null);
					o.picture = 'https://apis.live.net/v5.0/'+o.id+'/picture?access_token='+hello.getAuthResponse('windows').access_token;
					o.thumbnail = 'https://apis.live.net/v5.0/'+o.id+'/picture?access_token='+hello.getAuthResponse('windows').access_token;
				}
				return o;
			},
			'me/friends' : function(o){
				if("data" in o){
					for(var i=0;i<o.data.length;i++){
						o.data[i].picture = 'https://apis.live.net/v5.0/'+o.data[i].id+'/picture?access_token='+hello.getAuthResponse('windows').access_token;
						o.data[i].thumbnail = 'https://apis.live.net/v5.0/'+o.data[i].id+'/picture?access_token='+hello.getAuthResponse('windows').access_token;
					}
				}
				return o;
			},
			'me/albums' : function(o){
				if("data" in o){
					for(var i=0;i<o.data.length;i++){
						o.data[i].photos = 'https://apis.live.net/v5.0/'+o.data[i].id+'/photos';
						o.data[i].files = 'https://apis.live.net/v5.0/'+o.data[i].id+'/photos';
					}
				}
				return o;
			},
			'default' : function(o){
				if("data" in o){
					for(var i=0;i<o.data.length;i++){
						if(o.data[i].picture){
							o.data[i].thumbnail = o.data[i].picture;
						}
					}
				}
				return o;
			}
		},
		xhr : function(p){
			if(p.method==='post'&& !hello.utils.hasBinary(p.data) ){
				p.data = JSON.stringify(p.data);
				return {
					contentType : 'application/json'
				};
			}
			return {};
		},
		jsonp : function(p){
			if( p.method.toLowerCase() !== 'get'){
				//p.data = {data: JSON.stringify(p.data), method: p.method.toLowerCase()};
				p.data.method = p.method.toLowerCase();
				p.method = 'get';
			}
			return p;
		}
	}
});