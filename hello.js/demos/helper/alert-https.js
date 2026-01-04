if(document.location.href.indexOf('https://')!==0){
	document.body.appendChild((function(){
		var div = document.createElement('div');
		div.className = "alert alert-warning";
		div.appendChild((function(){
			var a = document.createElement('a');
			a.href = document.location.href.replace('http://', 'https://');
			a.innerHTML = "Launch page with secure protocol - https://";
			return a;
		})());
		return div;
	})());
}