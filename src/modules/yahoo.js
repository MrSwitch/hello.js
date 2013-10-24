//
// Yahoo
//
// Register Yahoo developer
(function(){

function formatError(o){
	if(o && "meta" in o && "error_type" in o.meta){
		o.error = {
			code : o.meta.error_type,
			message : o.meta.error_message
		};
	}
}

function formatFriends(o){
	formatError(o);
	var contact,field;
	if(o.query&&o.query.results&&o.query.results.contact){
		o.data = o.query.results.contact;
		delete o.query;
		if(!(o.data instanceof Array)){
			o.data = [o.data];
		}
		for(var i=0;i<o.data.length;i++){
			contact = o.data[i];
			o.data[i].id = null;
			for(var j=0;j<contact.fields.length;j++){
				field = contact.fields[j];
				if(field.type === 'email'){
					o.data[i].email = field.value;
				}
				if(field.type === 'name'){
					o.data[i].first_name = field.value.givenName;
					o.data[i].last_name = field.value.familyName;
					o.data[i].name = field.value.givenName + ' ' + field.value.familyName;
				}
				if(field.type === 'yahooid'){
					o.data[i].id = field.value;
				}
			}
		}
	}
	return o;
}

var yql = function(q){

	// PAGING
	// http://developer.yahoo.com/yql/guide/paging.html#local_limits

	return 'http://query.yahooapis.com/v1/yql?q=' + q.replace(" ", '%20') + "&format=json";
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

		// AutoRefresh
		// Signin once token expires?
		autorefresh : false,

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
			"me"		: yql('select * from social.profile where guid=me limit @{limit|100}'),
			"me/friends"	: yql('select * from social.contacts where guid=me limit @{limit|100}'),
			"me/following"	: yql('select * from social.contacts where guid=me limit @{limit|100}')
		},
		wrap : {
			me : function(o){
				formatError(o);
				if(o.query&&o.query.results&&o.query.results.profile){
					o = o.query.results.profile;
					o.id = o.guid;
					o.name = o.givenName + ' ' +o.familyName;
					o.last_name = o.familyName;
					o.first_name = o.givenName;
					o.email = o.emails?o.emails.handle:null;
					o.thumbnail = o.image?o.image.imageUrl:null;
				}
				return o;
			},
			// Can't get ID's
			// It might be better to loop through the social.relationshipd table with has unique ID's of users.
			"me/friends" : formatFriends,
			"me/following" : formatFriends
		},
		xhr : false
	}
});

})();
