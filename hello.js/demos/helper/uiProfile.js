// Profile UI
// Displays the users profile details


// Listen to signin requests
hello.on('auth.login', function(r) {
	// Get Profile
	hello( r.network ).api( '/me' ).then( function(p) {
		var label = document.getElementById(r.network);
		label.innerHTML = "<img src='"+ p.thumbnail + "' width=24/>Connected to "+ r.network+" as " + p.name;

		// On chrome apps we're not able to get remote images
		// This is a workaround
		if (typeof(chrome) === 'object') {
			img_xhr(label.getElementsByTagName('img')[0], p.thumbnail);
		}
	});
});


// Intiate App credentials
hello.init({
	google : CLIENT_IDS_ALL.google,
	windows : CLIENT_IDS_ALL.windows,
	facebook : CLIENT_IDS_ALL.facebook,
	twitter : CLIENT_IDS_ALL.twitter
},{
	scope : 'email',
	redirect_uri: REDIRECT_URI
});


// Bind events to the buttons on the page
var b = Array.prototype.slice.call(document.querySelectorAll('button.profile'));
b.forEach(function(btn){
	btn.onclick = function(){
		hello(this.id).login();
	};
});

// Utility for loading the thumbnail in chromeapp
function img_xhr(img, url) {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	xhr.responseType = 'blob';
	xhr.onload = function(e) {
		img.src = window.URL.createObjectURL(this.response);
	};
	xhr.send();
}