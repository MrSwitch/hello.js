//
// Linkedin
//
(function(){

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
	if(o.values){
		o.data = o.values;
		for(var i=0;i<o.data.length;i++){
			formatUser(o.data[i]);
		}
		delete o.values;
	}
	return o;
}


hello.init({
	'linkedin' : {

		login: function(p){
			p.qs.response_type = 'code';
		},
		oauth : {
			version : 2,
			grant	: "https://www.linkedin.com/uas/oauth2/accessToken"
		},
		querystring : function(qs){
			// Linkedin signs requests with the parameter 'oauth2_access_token'... yeah anotherone who thinks they should be different!
			qs.oauth2_access_token = qs.access_token;
			delete qs.access_token;
		},
		uri : {
			auth	: "https://www.linkedin.com/uas/oauth2/authorization",
			base	: "https://api.linkedin.com/v1/",
			me		: 'people/~:(picture-url,first-name,last-name,id,formatted-name)',
			"me/friends"	: 'people/~/connections',
			"me/followers"	: 'people/~/connections',
			"me/following"	: 'people/~/connections',
			"me/share" : function(p, next){
				// POST unsupported
				next( p.method === 'get' ? 'people/~/network/updates' : 'people/~/current-status' );
			}
		},
		scope : {
			basic	: 'r_fullprofile',
			email	: 'r_emailaddress',
			friends : 'r_network',
			publish : 'rw_nus'
		},
		scope_delim : ' ',
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
				if(o.values){
					o.data = o.values;
					for(var i=0;i<o.data.length;i++){
						formatUser(o.data[i]);
						o.data[i].message = o.data[i].headline;
					}
					delete o.values;
				}
				return o;
			}
		},
		jsonp : function(p,qs){
			qs.format = 'jsonp';
			if(p.method==='get'){
				qs['error-callback'] = '?';
			}
		},
		xhr : false
	}
});

})();
