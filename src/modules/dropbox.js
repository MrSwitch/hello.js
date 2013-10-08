//
// Dropbox
//
(function(){

function formatError(o){
	if(o&&"error" in o){
		o.error = {
			code : "server_error",
			message : o.error
		};
	}
}
	
function format_file(o){

	if(typeof(o)!=='object' ||
		"Blob" in window && o instanceof Blob ||
		"ArrayBuffer" in window && o instanceof ArrayBuffer){
		// this is a file, let it through unformatted
		return;
	}
	if("error" in o){
		return;
	}

	var path = o.root + o.path.replace(/\&/g, '%26');
	if(o.thumb_exists){
		o.thumbnail = hello.settings.oauth_proxy + "?path=" +
		encodeURIComponent('https://api-content.dropbox.com/1/thumbnails/'+ path + '?format=jpeg&size=m') + '&access_token=' + hello.getAuthResponse('dropbox').access_token;
	}
	o.type = ( o.is_dir ? 'folder' : o.mime_type );
	o.name = o.path.replace(/.*\//g,'');
	if(o.is_dir){
		o.files = 'metadata/' + path;
	}
	else{
		o.downloadLink = hello.settings.oauth_proxy + "?path=" +
		encodeURIComponent('https://api-content.dropbox.com/1/files/'+ path ) + '&access_token=' + hello.getAuthResponse('dropbox').access_token;
		o.file = 'https://api-content.dropbox.com/1/files/'+ path;
	}
	if(!o.id){
		o.id = o.name;
	}
//	o.media = "https://api-content.dropbox.com/1/files/" + path;
}

hello.init({
	'dropbox' : {

		login : function(p){
			// The dropbox login window is a different size.
			p.options.window_width = 1000;
			p.options.window_height = 1000;
		},

		// Define the OAuth Settings of the service
		// Ensure that you define an oauth_proxy
		oauth : {
			version : "1.0",
			auth	: "https://www.dropbox.com/1/oauth/authorize",
			request : 'https://api.dropbox.com/1/oauth/request_token',
			token	: 'https://api.dropbox.com/1/oauth/access_token'
		},
		uri : {
			base	: "https://api.dropbox.com/1/",
			me		: 'account/info',
			"me/files"	: function(p,callback){
				if(p.method === 'get'){
					callback('metadata/dropbox');
					return;
				}
				var path = p.data.dir;
				delete p.data.dir;
				callback('https://api-content.dropbox.com/1/files/dropbox/'+path);
			},
			"me/folders" : function(p, callback){
				var name = p.data.name;
				p.data = null;
				callback('fileops/create_folder?'+hello.utils.param({
					path : name,
					root : 'dropbox'
				}));
			},
			"default" : function(p,callback){
				if(p.path.match("https://api-content.dropbox.com/1/files/")){
					// this is a file, return binary data
					if(p.method === 'get'){
						p.method = 'blob';
					}
				}
				callback(p.path);
			}
		},
		wrap : {
			me : function(o){
				formatError(o);
				if(!o.uid){
					return o;
				}
				o.name = o.display_name;
				o.first_name = o.name.split(" ")[0];
				o.last_name = o.name.split(" ")[1];
				o.id = o.uid;
				delete o.uid;
				delete o.display_name;
				return o;
			},
			"default"	: function(o){
				formatError(o);
				if(o.is_dir && o.contents){
					o.data = o.contents;
					delete o.contents;

					for(var i=0;i<o.data.length;i++){
						o.data[i].root = o.root;
						format_file(o.data[i]);
					}
				}

				format_file(o);

				return o;
			}
		},
		// doesn't return the CORS headers
		xhr : function(p){
			// forgetting content DropBox supports the allow-cross-origin-resource
			if(p.path.match("https://api-content.dropbox.com/")){
				//p.data = p.data.file.files[0];
				return false;
			}
			else if(p.path.match("me/files")&&p.method==='post'){
				return true;
			}
			return true;
		}
	}
});

})();
