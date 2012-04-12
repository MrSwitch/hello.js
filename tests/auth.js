	var local = ( /local/.test(window.location.host) ? 1 : 0);

	
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

	var KNARLY = [
		{uri: { auth: '/auth.knarly.com/', base : '/api.knarly.com/' }},
		{}
	][local];

	//
	var GOOGLE_CLIENT_ID = '656984324806-sr0q9vq78tlna4hvhlmcgp2bs2ut8uj8.apps.googleusercontent.com';

	hello.init({
		facebook : FACEBOOK_CLIENT_ID,
		windows  : WINDOWS_CLIENT_ID,
		google   : GOOGLE_CLIENT_ID
		/**<<< Dev environment settings, not actual spec*/
		,knarly   : KNARLY
		//>>>*/
	},
	{redirect_uri: '/hello.js/'});
	
	