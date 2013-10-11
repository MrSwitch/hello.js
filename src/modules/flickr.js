//
// Flickr
//
(function(){


function getApiUrl(method, extra_params, skip_network){
	var url=((skip_network) ? "" : "flickr:") +
			"?method=" + method +
			"&api_key="+ hello.init().flickr.id +
			"&format=json";
	for (var param in extra_params){ if (extra_params.hasOwnProperty(param)) {
		url += "&" + param + "=" + extra_params[param];
		// url += "&" + param + "=" + encodeURIComponent(extra_params[param]);
	}}
	return url;
}

function withUser(cb){
	if(!flickr_user){
		hello.api(getApiUrl("flickr.test.login"), function(userJson){
			flickr_user = {"user_id" : checkResponse(userJson, "user").id};
			cb();
		});
	}
	else{
		cb();
	}
}

function getBuddyIcon(profile, size){
	var url="http://www.flickr.com/images/buddyicon.gif";
	if (profile.nsid && profile.iconserver && profile.iconfarm){
		url="http://farm" + profile.iconfarm + ".staticflickr.com/" +
			profile.iconserver + "/" +
			"buddyicons/" + profile.nsid +
			((size) ? "_"+size : "") + ".jpg";
	}
	return url;
}

function getPhoto(id, farm, server, secret, size){
	size = (size) ? "_"+size : '';
	return "http://farm"+farm+".staticflickr.com/"+server+"/"+id+"_"+secret+size+".jpg";
}

function formatUser(o){
}

function formatError(o){
	if(o && o.stat && o.stat.toLowerCase()!='ok'){
		o.error = {
			code : "invalid_request",
			message : o.message
		};
	}
}

function formatPhotos(o){
	if (o.photoset || o.photos){
		var set = (o.photoset) ? 'photoset' : 'photos';
		o = checkResponse(o, set);
		o.data = o.photo;
		delete o.photo;
		for(var i=0;i<o.data.length;i++){
			var photo = o.data[i];
			photo.name = photo.title;
			photo.picture = getPhoto(photo.id, photo.farm, photo.server, photo.secret, '');
			photo.source = getPhoto(photo.id, photo.farm, photo.server, photo.secret, 'b');
			photo.thumbnail = getPhoto(photo.id, photo.farm, photo.server, photo.secret, 'm');
		}
	}
}
function checkResponse(o, key){

	if( key in o) {
		o = o[key];
	}
	else if(!("error" in o)){
		o.error = {
			code : "invalid_request",
			message : o.message || "Failed to get data from Flickr"
		};
	}
	return o;
}


// this is not exactly neat but avoid to call
// the method 'flickr.test.login' for each api call
var flickr_user;

hello.init({
	'flickr' : {
		// Ensure that you define an oauth_proxy
		oauth : {
			version : "1.0a",
			auth	: "http://www.flickr.com/services/oauth/authorize?perms=read",
			request : 'http://www.flickr.com/services/oauth/request_token',
			token	: 'http://www.flickr.com/services/oauth/access_token'
		},
		logout : function(){
			// Function is executed when the user logs out.
			flickr_user = null;
		},

		// AutoRefresh
		// Signin once token expires?
		autorefresh : false,


		name : "Flickr",
		jsonp: function(p,qs){
			if(p.method.toLowerCase() == "get"){
				delete qs.callback;
				qs.jsoncallback = '?';
			}
		},
		uri : {
			base	: "http://api.flickr.com/services/rest",
			me		: function(p, callback){
				withUser(function(){
					callback(getApiUrl("flickr.people.getInfo", flickr_user, true));
				});
			},
			"me/friends": function(p, callback){
				withUser(function(){
					callback(getApiUrl("flickr.contacts.getList", flickr_user, true));
				});
			},
			"me/albums"	: function(p,callback){
				withUser(function(){
					callback(getApiUrl("flickr.photosets.getList", flickr_user, true));
				});
			},
			"me/photos" : function(p, callback) {
				withUser(function(){
					callback(getApiUrl("flickr.people.getPhotos", flickr_user, true));
				});
			}
		},
		wrap : {
			me : function(o){
				formatError(o);
				o = checkResponse(o, "person");
				if(o.id){
					if(o.realname){
						o.name = o.realname._content;
						var m = o.name.split(" ");
						o.first_name = m[0];
						o.last_name = m[1];
					}
					o.thumbnail = getBuddyIcon(o, 'l');
					o.picture = getBuddyIcon(o, 'l');
				}
				return o;
			},
			"me/friends" : function(o){
				formatError(o);
				if(o.contacts){
					o.data = o.contacts.contact;
					delete o.contacts;
					for(var i=0;i<o.data.length;i++){
						var item = o.data[i];
						item.id = item.nsid;
						item.name = item.realname || item.username;
						item.thumbnail = getBuddyIcon(item, 'm');
					}
				}
				return o;
			},
			"me/albums" : function(o){
				formatError(o);
				o = checkResponse(o, "photosets");
				if(o.photosets){
					o.data = o.photoset;
					delete o.photoset;
					for(var i=0;i<o.data.length;i++){
						var item = o.data[i];
						item.name = item.title._content;
						item.photos = "http://api.flickr.com/services/rest" + getApiUrl("flickr.photosets.getPhotos", {photoset_id: item.id}, true);
					}
				}
				return o;
			},
			"me/photos" : function(o){
				formatError(o);
				formatPhotos(o);

				return o;
			},
			"default" : function(o){

				formatError(o);
				formatPhotos(o);

				return o;
			}
		},
		xhr : false
	}
});
})();