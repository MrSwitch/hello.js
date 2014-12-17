//
// Linkedin
//
(function(hello){

function formatError(o){
	if(o && "errorCode" in o){
		o.error = {
			code : o.status,
			message : o.message
		};
	}
}


function formatUser(o){
	if(o.error){
		return;
	}
	o.first_name = o.firstName;
	o.last_name = o.lastName;
	o.name = o.formattedName || (o.first_name + ' ' + o.last_name);
	o.thumbnail = o.pictureUrl;
	o.email = o.emailAddress;
}


function formatFriends(o){
	formatError(o);
	paging(o);
	if(o.values){
		o.data = o.values;
		for(var i=0;i<o.data.length;i++){
			formatUser(o.data[i]);
		}
		delete o.values;
	}
	return o;
}

function paging(res){
	if( "_count" in res && "_start" in res && (res._count + res._start) < res._total ){
		res['paging'] = {
			next : "?start="+(res._start+res._count)+"&count="+res._count
		};
	}
}


function empty(o,headers){
	if(JSON.stringify(o) === '{}'&&headers.statusCode === 200){
		o.success = true;
	}
}

hello.init({
	'linkedin' : {

		oauth : {
			version : 2,
			response_type : 'code',
			auth	: "https://www.linkedin.com/uas/oauth2/authorization",
			grant	: "https://www.linkedin.com/uas/oauth2/accessToken"
		},

		// Refresh the access_token once expired
		refresh : true,

		scope : {
			basic	: 'r_fullprofile',
			email	: 'r_emailaddress',
			friends : 'r_network',
			publish : 'rw_nus'
		},
		scope_delim : ' ',

		base	: "https://api.linkedin.com/v1/",

		get : {
			"me"			: 'people/~:(picture-url,first-name,last-name,id,formatted-name,email-address)',
			"me/friends"	: 'people/~/connections?count=@{limit|500}',
			"me/followers"	: 'people/~/connections?count=@{limit|500}',
			"me/following"	: 'people/~/connections?count=@{limit|500}',

			// http://developer.linkedin.com/documents/get-network-updates-and-statistics-api
			"me/share"		: "people/~/network/updates?count=@{limit|250}"
		},

		post : {

			// https://developer.linkedin.com/documents/api-requests-json
			"me/share"		: function(p, callback){
				var data =  {
					"visibility": {
						"code": "anyone"
					}
				};

				if(p.data.id){

					data["attribution"] = {
						"share": {
							"id": p.data.id
						}
					};

				}
				else{
					data["comment"] = p.data.message;
					if (p.data.picture && p.data.link) {
						data["content"] = {
							"submitted-url": p.data.link,
							"submitted-image-url": p.data.picture
						};
					}
				}

				p.data = JSON.stringify(data);

				callback('people/~/shares?format=json');
			},

			"me/like" : like
		},


		del :{
			"me/like" : like
		},


		wrap : {
			me : function(o){
				formatError(o);
				formatUser(o);
				return o;
			},
			"me/friends" : formatFriends,
			"me/following" : formatFriends,
			"me/followers" : formatFriends,
			"me/share" : function(o){
				formatError(o);
				paging(o);
				if(o.values){
					o.data = o.values;
					delete o.values;
					for(var i=0;i<o.data.length;i++){
						var d = o.data[i];
						formatUser(d);
						d.message = d.headline;
					}
				}
				return o;
			},
			"default" : function(o,headers){
				formatError(o);
				empty(o,headers);
				paging(o);
			}
		},
		jsonp : function(p,qs){
			formatQuery(qs);
			if(p.method==='get'){
				qs.format = 'jsonp';
				qs['error-callback'] = p.callbackID;
			}
		},
		xhr : function(p,qs){
			if(p.method !== 'get'){
				formatQuery(qs);
				p.headers['Content-Type'] = 'application/json';
				// x-li-format ensures error responses are not returned in XML
				p.headers['x-li-format'] = 'json';
				p.proxy = true;
				return true;
			}
			return false;
		}
	}
});


function formatQuery(qs){
	// Linkedin signs requests with the parameter 'oauth2_access_token'... yeah anotherone who thinks they should be different!
	if(qs.access_token){
		qs.oauth2_access_token = qs.access_token;
		delete qs.access_token;
	}
}

function like(p, callback){
	p.headers["x-li-format"] = "json";
	var id = p.data.id;
	p.data = (p.method !== 'delete').toString();
	p.method = 'put';
	callback('people/~/network/updates/key=' + id + '/is-liked');
}

})(hello);
