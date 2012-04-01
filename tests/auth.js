	// Var
	var FACEBOOK_CLIENT_ID = [
		'304672569582045',
		'285836944766385'
	][local];

	// Var
	var WINDOWS_CLIENT_ID = [
		'0000000044088105',
		'000000004405FD31'
	][local];

	// 
	var GOOGLE_CLIENT_ID = '656984324806-sr0q9vq78tlna4hvhlmcgp2bs2ut8uj8.apps.googleusercontent.com';

	hello.init({ 
		facebook : FACEBOOK_CLIENT_ID,
		windows  : WINDOWS_CLIENT_ID,
		google   : GOOGLE_CLIENT_ID
		/**<<< Dev environment settings, not actual spec*/
		,knarly   : (local ? {uri: { auth: function(qs){
					var url = '/auth.knarly.com/';

					// if the user is signed into another service. Lets attach the credentials to that and hopefully get the user signed in.
					var service = hello.service(),
						session = hello.getAuthResponse( service );

					if( service && service !== 'knarly' && session && "access_token" in session ){
						qs.access_token = session.access_token;
						qs.provider = service;
					}

					return url + '?' + hello._param(qs);
				}, base : '/api.knarly.com/' }} : {})
		//>>>*/
	}, 
	{redirect_uri: '/hello.js/'});
	
	