// Register Yahoo developer
hello.init({
	'yahoo' : {
		// Ensure that you define an oauth_proxy
		oauth : {
			version : "1.0a",
			auth	: "https://api.login.yahoo.com/oauth/v2/request_auth",
			request : 'https://api.login.yahoo.com/oauth/v2/get_request_token',
			token	: 'https://api.login.yahoo.com/oauth/v2/get_token'
		},
		uri : {
			base	: "http://social.yahooapis.com/v1/",
			me		: "http://query.yahooapis.com/v1/yql?q=select%20*%20from%20social.profile%20where%20guid%3Dme&format=json",
			"me/friends"	: 'http://query.yahooapis.com/v1/yql?q=select%20*%20from%20social.contacts%20where%20guid=me&format=json'
		},
		wrap : {
			me : function(o){
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
			"me/friends" : function(o){
				var contact,field;
				o.data = o.query.results.contact;
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
				return o;
			}
		},
		xhr : false
	}
});