//
// Linkedin
//
(function(){

function formatUser(o){
	if(o.error){
		return;
	}
	o.first_name = o.firstName;
	o.last_name = o.lastName;
	o.name = o.formattedName || (o.first_name + ' ' + o.last_name);
	o.thumbnail = o.pictureUrl;
}

hello.init({
	'linkedin' : {

		// Ensure that you define an oauth_proxy
		oauth : {
			version : "1.0a",
			auth	: "https://api.linkedin.com/uas/oauth/authenticate",
			request : 'https://api.linkedin.com/uas/oauth/requestToken?scope=r_fullprofile%2Br_emailaddress%2Br_network',
			token	: 'https://api.linkedin.com/uas/oauth/accessToken'
		},
		uri : {
			base	: "https://api.linkedin.com/v1/",
			me		: 'people/~:(picture-url,first-name,last-name,id,formatted-name)',
			"me/friends"	: 'people/~/connections'
		},
		scope : {
			basic	: 'r_fullprofile',
			email	: 'r_emailaddress',
			friends : 'r_network'
		},
		scope_delim : ' ',
		wrap : {
			me : function(o){
				formatUser(o);
				return o;
			},
			"me/friends" : function(o){
				if(o.values){
					o.data = o.values;
					for(var i=0;i<o.data.length;i++){
						formatUser(o.data[i]);
					}
					delete o.values;
				}
				return o;
			}
		},
		jsonp : function(p,qs){
			qs.format = 'jsonp';
		},
		xhr : false
	}
});

})();
