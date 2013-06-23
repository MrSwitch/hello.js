//
// hello.all.js
// Load all modules
function loadModule(a){
	for(var i=0;i<a.length;i++){
		document.write('<script src="../src/modules/'+a[i]+'"><\/script>');
	}
}

loadModule([
	'facebook.js',
	'google.js',
	'windows.js',
	'dropbox.js',
	'twitter.js',
	'yahoo.js',
	'instagram.js',
	'linkedin.js',
	'foursquare.js',
	'github.js',
	'soundcloud.js'
]);