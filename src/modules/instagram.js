//
// Instagram
//
hello.init({
	instagram : {
		name : 'Instagram',
		auth_options: {
			display: ''
		},
		uri : {
			auth : 'https://instagram.com/oauth/authorize/',
			base : 'https://api.instagram.com/v1/',
			'me' : 'users/self',
			'me/feed' : 'users/self/feed',
			'me/photos' : 'users/self/media/recent?min_id=0',
			'me/friends' : 'users/self/follows'
		},
		scope : {
			basic : 'basic'
		},
		wrap : {
			me : function(o){

				if("data" in o ){
					o.id = o.data.id;
					o.thumbnail = o.data.profile_picture;
					o.name = o.data.full_name || o.data.username;
				}
				return o;
			},
			"me/photos" : function(o){
				if("data" in o){
					for(var i=0;i<o.data.length;i++){
						if(o.data[i].type !== 'image'){
							delete o.data[i];
							i--;
						}
						o.data[i].thumbnail = o.data[i].images.thumbnail.url;
						o.data[i].picture = o.data[i].images.standard_resolution.url;
						o.data[i].name = o.data[i].caption ? o.data[i].caption.text : null;
					}
				}
				return o;
			}
		},
		// Use JSONP
		xhr : false
	}
});
