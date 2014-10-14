define(function(){
	
	return function( url ){
		var m = url.match(/\#oauth_redirect\=(.+)$/i);
		if(m){
			url = decodeURIComponent(decodeURIComponent(m[1]));
		}
		return url;
	};
	
});