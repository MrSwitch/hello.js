//
// Twitter
//
(function(hello){


function formatUser(o){
	if(o.id){
		if(o.name){
			var m = o.name.split(" ");
			o.first_name = m[0];
			o.last_name = m[1];
		}
		o.thumbnail = o.profile_image_url;
	}
}

function formatFriends(o){
	formaterror(o);
	paging(o);
	if(o.users){
		o.data = o.users;
		for(var i=0;i<o.data.length;i++){
			formatUser(o.data[i]);
		}
		delete o.users;
	}
	return o;
}

function formaterror(o){
	if(o.errors){
		var e = o.errors[0];
		o.error = {
			code : "request_failed",
			message : e.message
		};
	}
}


//
// Paging
// Take a cursor and add it to the path
function paging(res){
	// Does the response include a 'next_cursor_string'
	if("next_cursor_str" in res){
		// https://dev.twitter.com/docs/misc/cursoring
		res['paging'] = {
			next : "?cursor=" + res.next_cursor_str
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
		data_uri = /^data\:([^;,]+(\;charset=[^;,]+)?)(\;base64)?,/i,
		ready = function(){};

	// Add File
	function addFile(name, value, filename){
		var fr = new FileReader();
		fr.onload = function(e){
			//addContent( e.target.result, value.type );
			addContent( btoa(e.target.result), value.type + line_break + "Content-Transfer-Encoding: base64", name, filename);
		};
		fr.readAsBinaryString(value);
	}

	// Add content
	function addContent(name, value, type, filename){
		var headers = line_break + 'Content-Disposition: form-data; name="' + name + '"';

		headers += filename ? '; filename="' + filename + '"' : '';
		headers += line_break + 'Content-Type: ' + type;
		headers += line_break + line_break + value + line_break;

		body.push(headers);

		counter--;
		ready();
	}

	// Add new things to the object
	this.append = function(name, value, filename){
		counter++;

		// Is this a file?
		// Files can be either Blobs or File types
		if(value instanceof window.File || value instanceof window.Blob){
			// Read the file in
			addFile(name, value, filename);
		}

		// Data-URI?
		// data:[<mime type>][;charset=<charset>][;base64],<encoded data>
		// /^data\:([^;,]+(\;charset=[^;,]+)?)(\;base64)?,/i
		else if( typeof( value ) === 'string' && value.match(data_uri) ){
			addContent(name, value.replace(data_uri,''), 'application/octect-stream' + line_break + "Content-Transfer-Encoding: base64", filename);
		}

		// Regular string
		else{
			addContent(name, value, 'application/json');
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

/*
// THE DOCS SAY TO DEFINE THE USER IN THE REQUEST
// ... although its not actually required.

var user_id;

function withUserId(callback){
	if(user_id){
		callback(user_id);
	}
	else{
		hello.api('twitter:/me', function(o){
			user_id = o.id;
			callback(o.id);
		});
	}
}

function sign(url){
	return function(p, callback){
		withUserId(function(user_id){
			callback(url+'?user_id='+user_id);
		});
	};
}
*/

hello.init({
	'twitter' : {
		// Ensure that you define an oauth_proxy
		oauth : {
			version : "1.0a",
			auth	: "https://twitter.com/oauth/authorize",
			request : 'https://twitter.com/oauth/request_token',
			token	: 'https://twitter.com/oauth/access_token'
		},

		base	: "https://api.twitter.com/1.1/",

		get : {
			"me"			: 'account/verify_credentials.json',
			"me/friends"	: 'friends/list.json?count=@{limit|200}',
			"me/following"	: 'friends/list.json?count=@{limit|200}',
			"me/followers"	: 'followers/list.json?count=@{limit|200}',

			// https://dev.twitter.com/docs/api/1.1/get/statuses/user_timeline
			"me/share"	: 'statuses/user_timeline.json?count=@{limit|200}'
		},

		post : {
			'me/share' : function(p,callback){
				var data = p.data;
				p.data = null;
				callback( 'statuses/update.json?include_entities=1&status='+data.message );
			},
			'me/media' : function (p, callback) {
				var data = p.data,
						parts = new Multipart();

				parts.append('status', data.message);
				parts.append('media[]', data.file, data.filename);

				parts.onready( function onReady(body, boundary) {
					p.headers = {
						'Content-Type' : 'multipart/form-data; boundary="' + boundary + '"'
					};
					p.data = body;
					callback('statuses/update_with_media.json');
				});
			}
		},

		wrap : {
			me : function(res){
				formaterror(res);
				formatUser(res);
				return res;
			},
			"me/friends" : formatFriends,
			"me/followers" : formatFriends,
			"me/following" : formatFriends,

			"me/share" : function(res){
				formaterror(res);
				paging(res);
				if(!res.error&&"length" in res){
					return {data : res};
				}
				return res;
			},
			"default" : function(res){
				paging(res);
				return res;
			}
		},
		xhr : function(p){
			// Rely on the proxy for non-GET requests.
			return (p.method!=='get');
		}
	}
});

})(hello);
