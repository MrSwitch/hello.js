//
// GOOGLE API
//
(function(hello){

	"use strict";

	function int(s){
		return parseInt(s,10);
	}

	// Format
	// Ensure each record contains a name, id etc.
	function formatItem(o){
		if(o.error){
			return;
		}
		if(!o.name){
			o.name = o.title || o.message;
		}
		if(!o.picture){
			o.picture = o.thumbnailLink;
		}
		if(!o.thumbnail){
			o.thumbnail = o.thumbnailLink;
		}
		if(o.mimeType === "application/vnd.google-apps.folder"){
			o.type = "folder";
			o.files = "https://www.googleapis.com/drive/v2/files?q=%22"+o.id+"%22+in+parents";
		}
	}

	// Google has a horrible JSON API
	function gEntry(o){
		paging(o);

		var entry = function(a){

			var media = a['media$group']['media$content'].length ? a['media$group']['media$content'][0] : {};
			var i=0, _a;
			var p = {
				id		: a.id.$t,
				name	: a.title.$t,
				description	: a.summary.$t,
				updated_time : a.updated.$t,
				created_time : a.published.$t,
				picture : media ? media.url : null,
				thumbnail : media ? media.url : null,
				width : media.width,
				height : media.height
//				original : a
			};
			// Get feed/children
			if("link" in a){
				for(i=0;i<a.link.length;i++){
					var d = a.link[i];
					if(d.rel.match(/\#feed$/)){
						p.upload_location = p.files = p.photos = d.href;
						break;
					}
				}
			}

			// Get images of different scales
			if('category' in a&&a['category'].length){
				_a  = a['category'];
				for(i=0;i<_a.length;i++){
					if(_a[i].scheme&&_a[i].scheme.match(/\#kind$/)){
						p.type = _a[i].term.replace(/^.*?\#/,'');
					}
				}
			}

			// Get images of different scales
			if('media$thumbnail' in a['media$group'] && a['media$group']['media$thumbnail'].length){
				_a = a['media$group']['media$thumbnail'];
				p.thumbnail = a['media$group']['media$thumbnail'][0].url;
				p.images = [];
				for(i=0;i<_a.length;i++){
					p.images.push({
						source : _a[i].url,
						width : _a[i].width,
						height : _a[i].height
					});
				}
				_a = a['media$group']['media$content'].length ? a['media$group']['media$content'][0] : null;
				if(_a){
					p.images.push({
						source : _a.url,
						width : _a.width,
						height : _a.height
					});
				}
			}
			return p;
		};

		var r = [];
		if("feed" in o && "entry" in o.feed){
			for(i=0;i<o.feed.entry.length;i++){
				r.push(entry(o.feed.entry[i]));
			}
			o.data = r;
			delete o.feed;
		}

		// Old style, picasa, etc...
		else if( "entry" in o ){
			return entry(o.entry);
		}
		// New Style, Google Drive & Plus
		else if( "items" in o ){
			for(var i=0;i<o.items.length;i++){
				formatItem( o.items[i] );
			}
			o.data = o.items;
			delete o.items;
		}
		else{
			formatItem( o );
		}
		return o;
	}

	function formatFriends(o){
		paging(o);
		var r = [];
		if("feed" in o && "entry" in o.feed){
			var token = hello.getAuthResponse('google').access_token;
			for(var i=0;i<o.feed.entry.length;i++){
				var a = o.feed.entry[i],
					pic = (a.link&&a.link.length>0)?a.link[0].href+'?access_token='+token:null;

				r.push({
					id		: a.id.$t,
					name	: a.title.$t,
					email	: (a.gd$email&&a.gd$email.length>0)?a.gd$email[0].address:null,
					updated_time : a.updated.$t,
					picture : pic,
					thumbnail : pic
				});
			}
			o.data = r;
			delete o.feed;
		}
		return o;
	}


	//
	// Paging
	function paging(res){

		// Contacts V2
		if("feed" in res && res.feed['openSearch$itemsPerPage']){
			var limit = int(res.feed['openSearch$itemsPerPage']['$t']),
				start = int(res.feed['openSearch$startIndex']['$t']),
				total = int(res.feed['openSearch$totalResults']['$t']);

			if((start+limit)<total){
				res['paging'] = {
					next : '?start='+(start+limit)
				};
			}
		}
		else if ("nextPageToken" in res){
			res['paging'] = {
				next : "?pageToken="+res['nextPageToken']
			};
		}
	}


	//
	// URLS
	var contacts_url = 'https://www.google.com/m8/feeds/contacts/default/full?alt=json&max-results=@{limit|1000}&start-index=@{start|1}';

	//
	// Embed
	hello.init({
		google : {
			name : "Google Plus",

			// Login
			login : function(p){
				// Google doesn't like display=none
				if(p.qs.display==='none'){
					p.qs.display = '';
				}
			},

			// REF: http://code.google.com/apis/accounts/docs/OAuth2UserAgent.html
			oauth : {
				version : 2,
				auth : "https://accounts.google.com/o/oauth2/auth"
			},

			// Authorization scopes
			scope : {
				//,
				basic : "https://www.googleapis.com/auth/plus.me https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
				email			: '',
				birthday		: '',
				events			: '',
				photos			: 'https://picasaweb.google.com/data/',
				videos			: 'http://gdata.youtube.com',
				friends			: 'https://www.google.com/m8/feeds',
				files			: 'https://www.googleapis.com/auth/drive.readonly',
				
				publish			: '',
				publish_files	: 'https://www.googleapis.com/auth/drive',
				create_event	: '',

				offline_access : ''
			},
			scope_delim : ' ',

			// API base URI
			base : "https://www.googleapis.com/",

			// Map GET requests
			get : {
				//	me	: "plus/v1/people/me?pp=1",
				'me' : 'oauth2/v1/userinfo?alt=json',

				// https://developers.google.com/+/api/latest/people/list
				'me/friends' : contacts_url,
				'me/following' : contacts_url,
				'me/followers' : contacts_url,
				'me/share' : 'plus/v1/people/me/activities/public?maxResults=@{limit|100}',
				'me/feed' : 'plus/v1/people/me/activities/public?maxResults=@{limit|100}',
				'me/albums' : 'https://picasaweb.google.com/data/feed/api/user/default?alt=json&max-results=@{limit|100}&start-index=@{start|1}',
				'me/album' : function(p,callback){
					var key = p.data.id;
					delete p.data.id;
					callback(key.replace("/entry/", "/feed/"));
				},
				'me/photos' : 'https://picasaweb.google.com/data/feed/api/user/default?alt=json&kind=photo&max-results=@{limit|100}&start-index=@{start|1}',

				// https://developers.google.com/drive/v2/reference/files/list
				'me/files' : 'drive/v2/files?q=%22root%22+in+parents&maxResults=@{limit|100}'
			},

			post : {
//				'me/albums' : 'https://picasaweb.google.com/data/feed/api/user/default?alt=json'
			},

			// Map DELETE requests
			del : {
			},

			wrap : {
				me : function(o){
					if(o.id){
						o.last_name = o.family_name || (o.name? o.name.familyName : null);
						o.first_name = o.given_name || (o.name? o.name.givenName : null);
	//						o.name = o.first_name + ' ' + o.last_name;
						o.picture = o.picture || ( o.image ? o.image.url : null);
						o.thumbnail = o.picture;
						o.name = o.displayName || o.name;
					}
					return o;
				},
				'me/friends'	: formatFriends,
				'me/followers'	: formatFriends,
				'me/following'	: formatFriends,
				'me/share' : function(o){
					paging(o);
					o.data = o.items;
					delete o.items;
					return o;
				},
				'me/feed' : function(o){
					paging(o);
					o.data = o.items;
					delete o.items;
					return o;
				},
				'me/albums' : gEntry,
				'me/photos' : gEntry,
				'default' : gEntry
			},
			xhr : function(p){
				if(p.method==='post'){
					return false;
				}
				return true;
			}
		}
	});
})(hello);