//
// FourSquare
//
(function(hello){

function formatError(o){
	if(o.meta&&(o.meta.code===400||o.meta.code===401)){
		o.error = {
			code : "access_denied",
			message : o.meta.errorDetail
		};
	}
}

function formatUser(o){
	if(o&&o.id){
		o.thumbnail = o.photo.prefix + '100x100'+ o.photo.suffix;
		o.name = o.firstName + ' ' + o.lastName;
		o.first_name = o.firstName;
		o.last_name = o.lastName;
		if(o.contact){
			if(o.contact.email){
				o.email = o.contact.email;
			}
		}
	}
}

function paging(res){
	
}


hello.init({
	foursquare : {

		name : 'FourSquare',

		oauth : {
			// https://developer.foursquare.com/overview/auth
			version : 2,
			auth : 'https://foursquare.com/oauth2/authenticate',
			grant : 'https://foursquare.com/oauth2/access_token'
		},

		// Refresh the access_token once expired
		refresh : true,

		base : 'https://api.foursquare.com/v2/',

		get : {
			'me' : 'users/self',
			'me/friends' : 'users/self/friends',
			'me/followers' : 'users/self/friends',
			'me/following' : 'users/self/friends'
		},
		wrap : {
			me : function(o){
				formatError(o);
				if(o && o.response){
					o = o.response.user;
					formatUser(o);
				}
				return o;
			},
			'default' : function(o){
				formatError(o);

				// Format Friends
				if(o && "response" in o && "friends" in o.response && "items" in o.response.friends ){
					o.data = o.response.friends.items;
					delete o.response;
					for(var i=0;i<o.data.length;i++){
						formatUser(o.data[i]);
					}
				}
				return o;
			}
		},

		xhr : formatRequest,
		jsonp : formatRequest
	}
});


function formatRequest(p,qs){
	var token = qs.access_token;
	delete qs.access_token;
	qs.oauth_token = token;
	qs.v = 20121125;
	return true;
}


})(hello);