//
// FourSquare
//
hello.init({
	foursquare : {
		name : 'FourSquare',
		// Alter the querystring
		querystring : function(qs){
			var token = qs.access_token;
			delete qs.access_token;
			qs.oauth_token = token;
			qs.v = 20121125;
		},
		uri : {
			auth : 'https://foursquare.com/oauth2/authenticate',
			base : 'https://api.foursquare.com/v2/',
			'me' : 'users/self'
		},
		wrap : {
			me : function(o){
				o = o.response.user;
				if(o.id){
					o.thumbnail = o.photo.prefix + '100x100'+ o.photo.suffix;
					o.name = o.firstName + ' ' + o.lastName;
				}
				return o;
			},
			'default' : function(){

			} 
		}
	}
});