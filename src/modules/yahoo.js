//
// Yahoo
//
// Register Yahoo developer
(function(hello){

function formatError(o){
	if(o && "meta" in o && "error_type" in o.meta){
		o.error = {
			code : o.meta.error_type,
			message : o.meta.error_message
		};
	}
}

function formatFriends(o,headers,request){
	formatError(o);
	paging(o, headers, request);
	var contact,field;
	if(o.query&&o.query.results&&o.query.results.contact){
		o.data = o.query.results.contact;
		delete o.query;
		if(!(o.data instanceof Array)){
			o.data = [o.data];
		}
		for(var i=0;i<o.data.length;i++){
			contact = o.data[i];
			contact.id = null;
			for(var j=0;j<contact.fields.length;j++){
				field = contact.fields[j];
				if(field.type === 'email'){
					contact.email = field.value;
				}
				if(field.type === 'name'){
					contact.first_name = field.value.givenName;
					contact.last_name = field.value.familyName;
					contact.name = field.value.givenName + ' ' + field.value.familyName;
				}
				if(field.type === 'yahooid'){
					contact.id = field.value;
				}
			}
		}
	}
	return o;
}

function paging(res, headers, request){

	// PAGING
	// http://developer.yahoo.com/yql/guide/paging.html#local_limits
	if(res.query && res.query.count && request.options ){
		res['paging'] = {
			next : '?start='+ ( res.query.count + ( +request.options.start || 1 ) )
		};
	}
}

var yql = function(q){
	return 'https://query.yahooapis.com/v1/yql?q=' + (q + ' limit @{limit|100} offset @{start|0}').replace(/\s/g, '%20') + "&format=json";
};

hello.init({
	'yahoo' : {
		// Ensure that you define an oauth_proxy
		oauth : {
			version : "1.0a",
			auth	: "https://api.login.yahoo.com/oauth/v2/request_auth",
			request : 'https://api.login.yahoo.com/oauth/v2/get_request_token',
			token	: 'https://api.login.yahoo.com/oauth/v2/get_token'
		},

		// Login handler
		login : function(p){
			// Change the default popup window to be atleast 560
			// Yahoo does dynamically change it on the fly for the signin screen (only, what if your already signed in)
			p.options.window_width = 560;
		},
		/*
		// AUTO REFRESH FIX: Bug in Yahoo can't get this to work with node-oauth-shim
		login : function(o){
			// Is the user already logged in
			var auth = hello('yahoo').getAuthResponse();

			// Is this a refresh token?
			if(o.options.display==='none'&&auth&&auth.access_token&&auth.refresh_token){
				// Add the old token and the refresh token, including path to the query
				// See http://developer.yahoo.com/oauth/guide/oauth-refreshaccesstoken.html
				o.qs.access_token = auth.access_token;
				o.qs.refresh_token = auth.refresh_token;
				o.qs.token_url = 'https://api.login.yahoo.com/oauth/v2/get_token';
			}
		},
		*/

		base	: "https://social.yahooapis.com/v1/",

		get : {
			"me"		: yql('select * from social.profile(0) where guid=me'),
			"me/friends"	: yql('select * from social.contacts(0) where guid=me'),
			"me/following"	: yql('select * from social.contacts(0) where guid=me')
		},
		wrap : {
			me : function(o){
				formatError(o);
				if(o.query&&o.query.results&&o.query.results.profile){
					o = o.query.results.profile;
					o.id = o.guid;
					o.last_name = o.familyName;
					o.first_name = o.givenName || o.nickname;
					var a = [];
					if(o.first_name){
						a.push(o.first_name);
					}
					if(o.last_name){
						a.push(o.last_name);
					}
					o.name = a.join(' ');
					o.email = o.emails?o.emails.handle:null;
					o.thumbnail = o.image?o.image.imageUrl:null;
				}
				return o;
			},
			// Can't get ID's
			// It might be better to loop through the social.relationshipd table with has unique ID's of users.
			"me/friends" : formatFriends,
			"me/following" : formatFriends,
			"default" : function(res){
				paging(res);
				return res;
			}
		}
	}
});

})(hello);
