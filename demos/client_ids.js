// 
// Client IDS
// Defines the CLIENT_ID (AppID's) of the OAuth2 providers
// relative to the domain host where this code is presented.

// Register your domain with Facebook at  and add here
var FACEBOOK_CLIENT_ID = {
	'adodson.com' : '160981280706879',
	'local.knarly.com' : '285836944766385',
	'mrswitch.github.com' : '304672569582045'
}[window.location.hostname];

// Register your domain with Windows Live at http://manage.dev.live.com and add here
var WINDOWS_CLIENT_ID = {
	'adodson.com' : '00000000400D8578',
	'mrswitch.github.com' : '0000000044088105',
	'local.knarly.com' : '000000004405FD31'
}[window.location.hostname];

// 
var GOOGLE_CLIENT_ID = '656984324806-sr0q9vq78tlna4hvhlmcgp2bs2ut8uj8.apps.googleusercontent.com';
