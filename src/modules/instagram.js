(function(hello) {

	hello.init({

		instagram: {

			name: 'Instagram',

			oauth: {
				// See: http://instagram.com/developer/authentication/
				version: 2,
				auth: 'https://instagram.com/oauth/authorize/',
				grant: 'https://api.instagram.com/oauth/access_token'
			},

			// Refresh the access_token once expired
			refresh: true,

			carousel_as_images: true,

			scope: {
				basic: 'basic',
				photos: '',
				friends: 'relationships',
				publish: 'likes comments',
				email: '',
				share: '',
				publish_files: '',
				files: '',
				videos: '',
				offline_access: ''
			},

			scope_delim: ' ',

			logout: function(callback, options) {
				//Logout from instagram too
				hello.utils.iframe('https://instagram.com/accounts/logout/');
			},

			base: 'https://api.instagram.com/v1/',

			get: {
				me: 'users/self',
				'me/feed': 'users/self/feed?count=@{limit|100}',
				'me/photos': 'users/self/media/recent?min_id=0&count=@{limit|100}',
				'me/friends': 'users/self/follows?count=@{limit|100}',
				'me/following': 'users/self/follows?count=@{limit|100}',
				'me/followers': 'users/self/followed-by?count=@{limit|100}',
				'friend/photos': 'users/@{id}/media/recent?',
				'friend/search': 'users/search?q=@{search}'
			},

			post: {
				'me/like': function(p, callback) {
					var id = p.data.id;
					p.data = {};
					callback('media/' + id + '/likes');
				}
			},

			del: {
				'me/like': 'media/@{id}/likes'
			},

			wrap: {
				me: function(o) {

					formatError(o);

					if ('data' in o) {
						o.id = o.data.id;
						o.thumbnail = o.data.profile_picture;
						o.name = o.data.full_name || o.data.username;
					}

					return o;
				},

				'me/friends': formatFriends,
				'me/following': formatFriends,
				'me/followers': formatFriends,
				'friend/search': formatFriends,
				'me/photos': formatPhotos,
				'friend/photos': formatPhotos,

				'default': function(o) {
					o = formatError(o);
					paging(o);
					return o;
				}
			},

			// Instagram does not return any CORS Headers
			// So besides JSONP we're stuck with proxy
			xhr: function(p, qs) {

				var method = p.method;
				var proxy = method !== 'get';

				if (proxy) {

					if ((method === 'post' || method === 'put') && p.query.access_token) {
						p.data.access_token = p.query.access_token;
						delete p.query.access_token;
					}

					// No access control headers
					// Use the proxy instead
					p.proxy = proxy;
				}

				return proxy;
			},

			// No form
			form: false
		}
	});

	function formatPhotos(o) {

		formatError(o);
		paging(o);

		if ('data' in o) {

			o.data = o.data.filter(function(d) {
				return d.type === 'image' || d.type === 'carousel';
			});

			if (hello.services.instagram.carousel_as_images) {
				o.data.forEach(function(d, i) {
					if (d.type != 'carousel') return;
					var j = 1;
					d.carousel_media.forEach(function(c) {
						if (c.type != 'image') return;

						var clone = hello.utils.clone(d);
						delete clone.carousel_media;
						clone.images = c.images;
						clone.users_in_photo = c.users_in_photo;
						clone.type = 'image';
						o.data.splice(i + j, 0, clone);
						j++;
					});

					// Remove carousel
					o.data.splice(i, 1);
				});

			}

			o.data.forEach(function(d, i) {
				d.name = d.caption ? d.caption.text : null;
				d.thumbnail = d.images.thumbnail.url;
				d.picture = d.images.standard_resolution.url;
				d.pictures = Object.keys(d.images)
					.map(function(key) {
						var image = d.images[key];
						return formatImage(image);
					})
					.sort(function(a, b) {
						return a.width - b.width;
					});
			});
		}

		return o;
	}

	function formatImage(image) {
		return {
			source: image.url,
			width: image.width,
			height: image.height
		};
	}

	function formatError(o) {
		if (typeof o === 'string') {
			return {
				error: {
					code: 'invalid_request',
					message: o
				}
			};
		}

		if (o && 'meta' in o && 'error_type' in o.meta) {
			o.error = {
				code: o.meta.error_type,
				message: o.meta.error_message
			};
		}

		return o;
	}

	function formatFriends(o) {
		paging(o);
		if (o && 'data' in o) {
			o.data.forEach(formatFriend);
		}

		return o;
	}

	function formatFriend(o) {
		if (o.id) {
			o.thumbnail = o.profile_picture;
			o.name = o.full_name || o.username;
		}
	}

	// See: http://instagram.com/developer/endpoints/
	function paging(res) {
		if ('pagination' in res) {
			res.paging = {
				next: res.pagination.next_url
			};
			delete res.pagination;
		}
	}

})(hello);
