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

	function formatPerson(o){
		o.name = o.displayName || o.name;
		o.picture = o.picture || ( o.image ? o.image.url : null);
		o.thumbnail = o.picture;
	}

	function formatFriends(o, headers, req){
		paging(o);
		var r = [];
		if("feed" in o && "entry" in o.feed){
			var token = req.query.access_token;
			for(var i=0;i<o.feed.entry.length;i++){
				var a = o.feed.entry[i];

				a.id	= a.id.$t;
				a.name	= a.title.$t;
				delete a.title;
				if(a.gd$email){
					a.email	= (a.gd$email&&a.gd$email.length>0)?a.gd$email[0].address:null;
					a.emails = a.gd$email;
					delete a.gd$email;
				}
				if(a.updated){
					a.updated = a.updated.$t;
				}

				if(a.link){
					var pic = (a.link.length>0)?a.link[0].href+'?access_token='+token:null;
					if(pic){
						a.picture = pic;
						a.thumbnail = pic;
					}
					delete a.link;
				}
				if(a.category){
					delete a.category;
				}
			}
			o.data = o.feed.entry;
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


	// Multipart
	// Construct a multipart message

	function Multipart(){
		// Internal body
		var body = [],
			boundary = (Math.random()*1e10).toString(32),
			counter = 0,
			line_break = "\r\n",
			delim = line_break + "--" + boundary,
			ready = function(){},
			data_uri = /^data\:([^;,]+(\;charset=[^;,]+)?)(\;base64)?,/i;

		// Add File
		function addFile(item){
			var fr = new FileReader();
			fr.onload = function(e){
				//addContent( e.target.result, item.type );
				addContent( btoa(e.target.result), item.type + line_break + "Content-Transfer-Encoding: base64");
			};
			fr.readAsBinaryString(item);
		}

		// Add content
		function addContent(content, type){
			body.push(line_break + 'Content-Type: ' + type + line_break + line_break + content);
			counter--;
			ready();
		}

		// Add new things to the object
		this.append = function(content, type){

			// Does the content have an array
			if(typeof(content) === "string" || !('length' in Object(content)) ){
				// converti to multiples
				content = [content];
			}

			for(var i=0;i<content.length;i++){

				counter++;

				var item = content[i];

				// Is this a file?
				// Files can be either Blobs or File types
				if(
					(typeof(File) !== 'undefined' && item instanceof File) ||
					(typeof(Blob) !== 'undefined' && item instanceof Blob)
				){
					// Read the file in
					addFile(item);
				}

				// Data-URI?
				// data:[<mime type>][;charset=<charset>][;base64],<encoded data>
				// /^data\:([^;,]+(\;charset=[^;,]+)?)(\;base64)?,/i
				else if( typeof( item ) === 'string' && item.match(data_uri) ){
					var m = item.match(data_uri);
					addContent(item.replace(data_uri,''), m[1] + line_break + "Content-Transfer-Encoding: base64");
				}

				// Regular string
				else{
					addContent(item, type);
				}
			}
		};

		this.onready = function(fn){
			ready = function(){
				if( counter===0 ){
					// trigger ready
					body.unshift('');
					body.push('--');
					fn( body.join(delim), boundary);
					body = [];
				}
			};
			ready();
		};
	}



	//
	// Upload to Drive
	// If this is PUT then only augment the file uploaded
	// PUT https://developers.google.com/drive/v2/reference/files/update
	// POST https://developers.google.com/drive/manage-uploads
	function uploadDrive(p, callback){
		
		var data = {};

		// Test for DOM element
		if( p.data &&
			( typeof(HTMLInputElement) !== 'undefined' && p.data instanceof HTMLInputElement )
		){
			p.data = { file : p.data };
		}

		if( !p.data.name && Object(Object(p.data.file).files).length && p.method === 'post' ){
			p.data.name = p.data.file.files[0].name;
		}

		if(p.method==='post'){
			p.data = {
				"title": p.data.name,
				"parents": [{"id":p.data.parent||'root'}],
				"file" : p.data.file
			};
		}
		else{
			// Make a reference
			data = p.data;
			p.data = {};

			// Add the parts to change as required
			if( data.parent ){
				p.data["parents"] =  [{"id":p.data.parent||'root'}];
			}
			if( data.file ){
				p.data.file = data.file;
			}
			if( data.name ){
				p.data.title = data.name;
			}
		}


		// Extract the file, if it exists from the data object
		// If the File is an INPUT element lets just concern ourselves with the NodeList
		var file;
		if( "file" in p.data ){
			file = p.data.file;
			delete p.data.file;

			if( typeof(file)==='object' && "files" in file){
				// Assign the NodeList
				file = file.files;
			}
			if(!file || !file.length){
				callback({
					error : {
						code : 'request_invalid',
						message : 'There were no files attached with this request to upload'
					}
				});
				return;
			}
		}


//		p.data.mimeType = Object(file[0]).type || 'application/octet-stream';

		// Construct a multipart message
		var parts = new Multipart();
		parts.append( JSON.stringify(p.data), 'application/json');

		// Read the file into a  base64 string... yep a hassle, i know
		// FormData doesn't let us assign our own Multipart headers and HTTP Content-Type
		// Alas GoogleApi need these in a particular format
		if(file){
			parts.append( file );
		}

		parts.onready(function(body, boundary){

			p.headers['content-type'] = 'multipart/related; boundary="'+boundary+'"';
			p.data = body;

			callback('upload/drive/v2/files'+( data.id ? '/' + data.id : '' )+'?uploadType=multipart');
		});

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
				if(p.qs.display==='none'){
					// Google doesn't like display=none
					p.qs.display = '';
				}
				if(p.qs.response_type==='code'){

					// Lets set this to an offline access to return a refresh_token
					p.qs.access_type = 'offline';
				}
			},

			// REF: http://code.google.com/apis/accounts/docs/OAuth2UserAgent.html
			oauth : {
				version : 2,
				auth : "https://accounts.google.com/o/oauth2/auth",
				grant : "https://accounts.google.com/o/oauth2/token"
			},

			// Authorization scopes
			scope : {
				//,
				basic : "https://www.googleapis.com/auth/plus.me profile",
				email			: 'email',
				birthday		: '',
				events			: '',
				photos			: 'https://picasaweb.google.com/data/',
				videos			: 'http://gdata.youtube.com',
				friends			: 'https://www.google.com/m8/feeds, https://www.googleapis.com/auth/plus.login',
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
				'me'	: "plus/v1/people/me",
				// deprecated Sept 1, 2014
				//'me' : 'oauth2/v1/userinfo?alt=json',

				// https://developers.google.com/+/api/latest/people/list
				'me/friends' : 'plus/v1/people/me/people/visible?maxResults=@{limit|100}',
				'me/following' : contacts_url,
				'me/followers' : contacts_url,
				'me/contacts' : contacts_url,
				'me/share' : 'plus/v1/people/me/activities/public?maxResults=@{limit|100}',
				'me/feed' : 'plus/v1/people/me/activities/public?maxResults=@{limit|100}',
				'me/albums' : 'https://picasaweb.google.com/data/feed/api/user/default?alt=json&max-results=@{limit|100}&start-index=@{start|1}',
				'me/album' : function(p,callback){
					var key = p.query.id;
					delete p.query.id;
					callback(key.replace("/entry/", "/feed/"));
				},
				'me/photos' : 'https://picasaweb.google.com/data/feed/api/user/default?alt=json&kind=photo&max-results=@{limit|100}&start-index=@{start|1}',

				// https://developers.google.com/drive/v2/reference/files/list
				'me/files' : 'drive/v2/files?q=%22@{parent|root}%22+in+parents+and+trashed=false&maxResults=@{limit|100}',

				// https://developers.google.com/drive/v2/reference/files/list
				'me/folders' : 'drive/v2/files?q=%22@{id|root}%22+in+parents+and+mimeType+=+%22application/vnd.google-apps.folder%22+and+trashed=false&maxResults=@{limit|100}',

				// https://developers.google.com/drive/v2/reference/files/list
				'me/folder' : 'drive/v2/files?q=%22@{id|root}%22+in+parents+and+trashed=false&maxResults=@{limit|100}'
			},

			// Map post requests
			post : {
				/*
				// PICASA
				'me/albums' : function(p, callback){
					p.data = {
						"title": p.data.name,
						"summary": p.data.description,
						"category": 'http://schemas.google.com/photos/2007#album'
					};
					callback('https://picasaweb.google.com/data/feed/api/user/default?alt=json');
				},
				*/
				// DRIVE
				'me/files' : uploadDrive,
				'me/folders' : function(p, callback){
					p.data = {
						"title": p.data.name,
						"parents": [{"id":p.data.parent||'root'}],
						"mimeType": "application/vnd.google-apps.folder"
					};
					callback('drive/v2/files');
				}
			},

			// Map post requests
			put : {
				'me/files' : uploadDrive
			},

			// Map DELETE requests
			del : {
				'me/files' : 'drive/v2/files/@{id}',
				'me/folder' : 'drive/v2/files/@{id}'
			},

			wrap : {
				me : function(o){
					if(o.id){
						o.last_name = o.family_name || (o.name? o.name.familyName : null);
						o.first_name = o.given_name || (o.name? o.name.givenName : null);

						if( o.emails && o.emails.length ){
							o.email = o.emails[0].value;
						}

						formatPerson(o);
					}
					return o;
				},
				'me/friends'	: function(o){
					if(o.items){
						paging(o);
						o.data = o.items;
						delete o.items;
						for(var i=0;i<o.data.length;i++){
							formatPerson(o.data[i]);
						}
					}
					return o;
				},
				'me/contacts'	: formatFriends,
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
				// Post
				if(p.method==='post'||p.method==='put'){
					toJSON(p);
				}
				return true;
			},

			// Dont even try submitting via form.
			// This means no post operations in <=IE9
			form : false
		}
	});

	
	function toJSON(p){
		if( typeof(p.data) === 'object' ){
			// Convert the POST into a javascript object
			try{
				p.data = JSON.stringify(p.data);
				p.headers['content-type'] = 'application/json';
			}
			catch(e){}
		}
	}


})(hello);