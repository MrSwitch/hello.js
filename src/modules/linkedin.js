//
// Linkedin
//
(function(hello){

var utils = hello.utils;

function formatError(o){
	if(o && "errorCode" in o){
		o.error = {
			code : o.status,
			message : o.message
		};
	}
}


function formatUser(o){
	if(o.error){
		return;
	}
	o.first_name = o.firstName;
	o.last_name = o.lastName;
	o.name = o.formattedName || (o.first_name + ' ' + o.last_name);
	o.thumbnail = o.pictureUrl;
}


function formatFriends(o){
	formatError(o);
	paging(o);
	if(o.values){
		o.data = o.values;
		for(var i=0;i<o.data.length;i++){
			formatUser(o.data[i]);
		}
		delete o.values;
	}
	return o;
}

function paging(res){
	if( "_count" in res && "_start" in res && (res._count + res._start) < res._total ){
		res['paging'] = {
			next : "?start="+(res._start+res._count)+"&count="+res._count
		};
	}
}

var counter=1;

var addEvent, removeEvent;

if(document.removeEventListener){
	addEvent = function(elm, event_name, callback){
		elm.addEventListener(event_name, callback);
	};
	removeEvent = function(elm, event_name, callback){
		elm.removeEventListener(event_name, callback);
	};
}
else if(document.detachEvent){
	removeEvent = function (elm, event_name, callback){
		elm.detachEvent("on"+event_name, callback);
	};
	addEvent = function (elm, event_name, callback){
		elm.attachEvent("on"+event_name, callback);
	};
}


//
// XD postMessage
// Opens up an iframe and send messages to it.
function xd(method, url, headers, data, callback){

	var origin  = 'https://api.linkedin.com';

	var xd_id = 'default'+parseInt(Math.random()*1e5,10);

	// Create the iframe
	var iframe = utils.append('iframe', { src : origin + '/uas/js/xdrpc.html?v=0.0.1198-RC1.31370-1408#xdm_e='+encodeURIComponent(window.location.protocol+'//'+window.location.hostname)+'&xdm_c='+xd_id+'&xdm_p=1#mode=cors', style : {position:'absolute',left:"-1000px",bottom:0,height:'1px',width:'1px'} }, 'body');

	// Set the window listener to handle responses from this
	addEvent( window, "message", function CB(e){

		if(e.origin !== origin){
			return;
		}

		// Try a callback
		if(e.data === xd_id + "-ready"){

			var num = ++counter;

			var params = utils.param(url.match(/\?.*$/)[0]);

			// The endpoint is ready send the response
			var message = xd_id+" "+JSON.stringify({
				method : 'ajax',
				params : [{
					method : method.toUpperCase(),
					url : url.replace(/\?.*$/,''),
					params : {
						oauth_token : params.access_token
					},
					postBody : JSON.stringify(data)
				}],
				id : num,
				jsonrpc : "2.0"
			});

			addEvent( window, "message", function CB2(e){

				var message = e.data;

				// Convert this message to a format which can be understood
				if( e.origin !== origin || message.indexOf(xd_id)!==0){
					return;
				}
				try{
					var json = JSON.parse(message.replace(xd_id+' ',''));
					if(json.id === num){
						removeEvent( window, "message", CB2);
						try{
							json.error.message = JSON.parse(json.error.message);
						}catch(ee){}
						callback(json);
					}
				}
				catch(ee){}
			});

			// Post a message to iframe once it has loaded
			iframe.contentWindow.postMessage(message, '*');
		}
	});
}


hello.init({
	'linkedin' : {

		login: function(p){
			p.qs.response_type = 'code';
		},

		oauth : {
			version : 2,
			auth	: "https://www.linkedin.com/uas/oauth2/authorization",
			grant	: "https://www.linkedin.com/uas/oauth2/accessToken"
		},

		scope : {
			basic	: 'r_fullprofile',
			email	: 'r_emailaddress',
			friends : 'r_network',
			publish : 'rw_nus'
		},
		scope_delim : ' ',

		querystring : function(qs){
			// Linkedin signs requests with the parameter 'oauth2_access_token'... yeah anotherone who thinks they should be different!
			qs.oauth2_access_token = qs.access_token;
			delete qs.access_token;
		},

		base	: "https://api.linkedin.com/v1/",

		get : {
			"me"			: 'people/~:(picture-url,first-name,last-name,id,formatted-name)',
			"me/friends"	: 'people/~/connections?count=@{limit|500}',
			"me/followers"	: 'people/~/connections?count=@{limit|500}',
			"me/following"	: 'people/~/connections?count=@{limit|500}',

			// http://developer.linkedin.com/documents/get-network-updates-and-statistics-api
			"me/share"		: "people/~/network/updates?count=@{limit|250}"
		},

		post : {
			"me/share"		: function(p, callback){
				p.method = 'put';
				p.data = p.data.message;
				callback('people/~/current-status');
			}
		},

		wrap : {
			me : function(o){
				formatError(o);
				formatUser(o);
				return o;
			},
			"me/friends" : formatFriends,
			"me/following" : formatFriends,
			"me/followers" : formatFriends,
			"me/share" : function(o){
				formatError(o);
				paging(o);
				if(o.values){
					o.data = o.values;
					delete o.values;
					for(var i=0;i<o.data.length;i++){
						var d = o.data[i];
						formatUser(d);
						d.message = d.headline;
					}
				}
				return o;
			},
			"default" : function(o){
				formatError(o);
				paging(o);
			}
		},


		xhr : false,

		jsonp : function(p,qs){
			qs.format = 'jsonp';
			if(p.method==='get'){
				qs['error-callback'] = '?';
			}
		},

		//
		// Custom API handler, overwrites the default fallbacks
		// Linkedin uses xdrpc (XDomain, Remote Procedure Calls), a convoluted "standard" adopted by oooh a whopping ONE client in the list thus far.
		// This function performs a postMessage Request
		//
		api : function(url,p,qs,callback){

			if(p.method==='get'){
				return;
			}

			// Handle the data and insert into a string which the postmessage source will understand
			// e.g. SEND TO https://api.linkedin.com/uas/js/xdrpc.html?v=0.0.1196-RC1.31125-1408
			// postMessage: "default8691 {"method":"ajax","params":[{"method":"PUT","url":"https://api.linkedin.com/v1/people/~/current-status","params":{"oauth_token":"VzZwhCEiIlXNAv_kSEXtGA06asKsRawODJoStMj"},"postBody":"\"Updating my status using the JavaScript API\""}],"id":4,"jsonrpc":"2.0"}
			// RESPOSNE: default8691 {"id":4,"result":"","jsonrpc":"2.0"}
			xd( p.method, utils.qs(url, qs), p.headers, p.data, callback);


			// Return a truthy value to say that this function handled the request.
			return true;
		}
	}
});

})(hello);
