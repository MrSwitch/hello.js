//
// Instagram
//
(function(){

function formatError(o){
	if(o && "meta" in o && "error_type" in o.meta){
		o.error = {
			code : o.meta.error_type,
			message : o.meta.error_message
		};
	}
}


function formatFriends(o){
	if(o && "data" in o ){
		for(var i=0;i<o.data.length;i++){
			formatFriend(o.data[i]);
		}
	}
	return o;
}

function formatFriend(o){
	if(o.id){
		o.thumbnail = o.profile_picture;
		o.name = o.full_name || o.username;
	}
}


hello.init({
	instagram : {
		name : 'Instagram',
		login: function(p){
			// Instagram throws errors like "Javascript API is unsupported" if the display is 'popup'.
			// Make the display anything but 'popup'
			p.qs.display = '';
		},

		oauth : {
			version : 2,
			auth : 'https://instagram.com/oauth/authorize/'
		},

		scope : {
			basic : 'basic',
			friends : 'relationships'
		},

		base : 'https://api.instagram.com/v1/',

		get : {
			'me' : 'users/self',
			'me/feed' : 'users/self/feed?count=@{limit|100}',
			'me/photos' : 'users/self/media/recent?min_id=0&count=@{limit|100}',
			'me/friends' : 'users/self/follows?count=@{limit|100}',
			'me/following' : 'users/self/follows?count=@{limit|100}',
			'me/followers' : 'users/self/followed-by?count=@{limit|100}'
		},

		wrap : {
			me : function(o){

				formatError(o);

				if("data" in o ){
					o.id = o.data.id;
					o.thumbnail = o.data.profile_picture;
					o.name = o.data.full_name || o.data.username;
				}
				return o;
			},
			"me/friends" : formatFriends,
			"me/following" : formatFriends,
			"me/followers" : formatFriends,
			"me/photos" : function(o){

				formatError(o);

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
})();