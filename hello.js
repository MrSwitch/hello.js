
/**
 * @hello.js
 *
 * So many web services are putting their content online accessible on the web using OAuth2 as a provider.
 * The downside is they all have seperate REST calls, + client-side libraries to access their data.
 * Meaning that if you want to implement more than one of the API's, your going to have to write code for each of them seperatly, 
 * not to mention the extra page bulk of including their propriatary script files.
 *
 * You could also use a proprietary service like Gigya or Jan Rain to circumnavigate the problem. But i think you'll like hello.js
 * It works with FaceBook, Windows Live Connect and Google+ it is easy to understand with a simple generic API.
 , Its easy to extend and add new services. But best of all its free!
 *
 * @author Andrew Dodson
 * @company Knarly
 *
 * @copyright 2012, Andrew Dodson
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

var hello = (function(){

	"use strict";

	// JSONP
	var _jsonp_counter = 0;
	
	// Events
	var listeners = {};

	// Shy elements, without dispay:none
	var shy = {position:'absolute',left:"-1000px",bottom:0,height:'1px',width:'1px'};

	// default timeout, 20 seconds for API calls
	var _timeout = 20000;

	// hello.init() already called?
	var _initstarted = false;

	//
	// Options
	// #fragment not allowed
	//
	var _options = {
		redirect_uri  : window.location.href.split('#')[0],
		response_type : 'token',
		display       : 'popup',
		state         : ''
	};

	//
	// Services
	//
	var _services = {

		google : {
			name : "Google Plus",
			uri : {
				// REF: http://code.google.com/apis/accounts/docs/OAuth2UserAgent.html
				auth : "https://accounts.google.com/o/oauth2/auth",
//				me	: "plus/v1/people/me?pp=1",
				me : 'oauth2/v1/userinfo?alt=json',
				base : "https://www.googleapis.com/",
				'me/friends' : 'https://www.google.com/m8/feeds/contacts/default/full?alt=json&max-results=1000'

			},
			scope : {
				//,
				basic : "https://www.googleapis.com/auth/plus.me https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
				email			: '',
				birthday		: '',
				events			: '',
				photos			: 'https://picasaweb.google.com/data/',
				videos			: 'http://gdata.youtube.com',
				friends			: 'https://www.google.com/m8/feeds',
				
				publish			: '',
				create_event	: '',

				offline_access : ''
			},
			scope_delim : ' ',
			wrap : {
				me : function(o){
					if(o.id){
						o.last_name = o.family_name || o.name.familyName;
						o.first_name = o.given_name || o.name.givenName;
//						o.name = o.first_name + ' ' + o.last_name;
						o.picture = o.picture || o.image.url;
						o.name = o.displayName || o.name;
					}
					return o;
				},
				'me/friends'	: function(o){
					var r = [];
					if("feed" in o && "entry" in o.feed){
						for(var i=0;i<o.feed.entry.length;i++){
							var a = o.feed.entry[i];
							r.push({
								id		: a.id.$t,
								name	: a.title.$t, 
								email	: (a.gd$email&&a.gd$email.length>0)?a.gd$email[0].address:null,
								updated	: a.updated.$t,
								picture : (a.link&&a.link.length>0)?a.link[0].href+'?access_token='+hello.getAuthResponse('google').access_token:null
							});
						}
						return {
							name : o.feed.title.$t,
							updated : o.feed.updated.$t,
							data : r
						}
					}
					return o;
				} 
			}
		},
	
		windows : {
			name : 'Windows live',

			uri : {
				// REF: http://msdn.microsoft.com/en-us/library/hh243641.aspx
				auth : 'https://oauth.live.com/authorize',
				base : 'https://apis.live.net/v5.0/'
			},
			scope : {
				basic			: 'wl.signin,wl.basic',
				email			: 'wl.emails',
				birthday		: 'wl.birthday',
				events			: 'wl.calendars',
				photos			: 'wl.photos',
				videos			: 'wl.photos',
				friends			: '',
				
				publish			: 'wl.share',
				create_event	: 'wl.calendars_update,wl.events_create',

				offline_access	: 'wl.offline_access'
			},
			wrap : {
				me : function(o){
					if(o.id){
						o.email = (o.emails?o.emails.preferred:null);
						o.picture = 'https://apis.live.net/v5.0/'+o.id+'/picture?access_token='+hello.getAuthResponse('windows').access_token;
					}
					return o;
				},
				'me/friends' : function(o){
					if("data" in o){
						for(var i=0;i<o.data.length;i++){
							o.data[i].picture = 'https://apis.live.net/v5.0/'+o.data[i].id+'/picture?access_token='+hello.getAuthResponse('windows').access_token;
						}
					}
					return o;
				}
			},
			preprocess : function(p){
				if( p.method.toLowerCase() !== 'get'){
					//p.data = {data: JSON.stringify(p.data), method: p.method.toLowerCase()};
					p.path = {
							'me/feed' : 'me/share'
						}[p.path] || p.path;

					p.method = 'get';
					p.data.method = 'post';
				}
				return p;
			}
		},
		
		facebook : {
			name : 'Facebook',

			uri : {
				// REF: http://developers.facebook.com/docs/reference/dialogs/oauth/
				auth : 'http://www.facebook.com/dialog/oauth/',
				base : 'https://graph.facebook.com/',
				'me/share' : 'me/feed'
			},
			scope : {
				basic			: '',
				email			: 'email',
				birthday		: 'user_birthday',
				events			: 'user_events',
				photos			: 'user_photos,user_videos',
				videos			: 'user_photos,user_videos',
				friends			: '',
				
				publish			: 'publish_stream',
				create_event	: 'create_event',

				offline_access : 'offline_access'
			},
			wrap : {
				me : function(o){
					if(o.id){
						o.picture = 'http://graph.facebook.com/'+o.id+'/picture';
					}
					return o;
				},
				'me/friends' : function(o){
					if("data" in o){
						for(var i=0;i<o.data.length;i++){
							o.data[i].picture = 'http://graph.facebook.com/'+o.data[i].id+'/picture';
						}
					}
					return o;
				}
			},
			preprocess : function(p){
				if( p.method.toLowerCase() !== 'get'){
					p.data.method = p.method.toLowerCase();
					p.method = 'get';
				}
				return p;
			}
		},
		
		knarly : {
			name : 'Knarly',
//			autologin : true,
			id : window.location.host,
			uri : {
				// REF:
				auth : 'http://oauth.knarly.com/',
				base : 'http://api.knarly.com/'
			},
			scope : {
				basic : ''
			},
			wrap : {
				// knarly has no special paths
			},
			preprocess : function(p){
				if( p.method.toLowerCase() !== 'get'){

					// is this a collection of items in a post?
					if( p.method === 'post' && _isArray( p.data ) ){
						// wrap data up
						p.data = { json : JSON.stringify(p.data) };
					}
					
					// Add method as a parameter
					p.data.method = p.method.toLowerCase();
					
					// change the method to GET aka JSONP
					p.method = 'get';
				}
				if( !hello.getAuthResponse('knarly') ){
					p.data.client_id = this.id;
				}
				return p;
			}
		}
	};

	var hello = {
		//
		// Service
		// Get/Set the default service
		//
		service : function(service){
			if(typeof (service) !== 'undefined' ){
				return _store( 'sync_service', service );
			}
			return _store( 'sync_service' );
		},


		//
		// init
		// Define the clientId's for the endpoint services
		// @param object o, contains a key value pair, service => clientId
		// @param object opts, contains a key value pair of options used for defining the authentication defaults
		// @param number timeout, timeout in seconds
		//
		init : function(services,opts,timeout){
		
			// Arguments
			var p = _arguments({services:'o!',opts:'o',timeout:'i'},arguments);

			// Define provider credentials
			// Reformat the ID field
			for( var x in p.services ){if(p.services.hasOwnProperty(x)){
				if( typeof(p.services[x]) !== 'object' ){
					p.services[x] = {id : p.services[x]};
				}
			}}

			// merge objects
			_services = _merge(_services, p.services);

			// options
			if(p.opts){
				_options = _merge(_options, p.opts);
			}

			// Timeout
			if(p.timeout){
				_timeout = p.timeout;
			}

			// Have we already run init?
			if(_initstarted){
				return false;
			}
			else{
				_initstarted = true;
			}


			// Monitor for a change in state and fire
			var old_tokens = {}, pending = {};


			//
			// Monitoring session state
			// Check for session changes
			(function self(){

				//
				// Check for error Callbacks
				//
				var error = _store('error');
				if(error && "callback" in error && error.callback in listeners){

					// to do remove from session object...
					var cb = error.callback;
					delete error.callback;

					// Update store
					_store('error',error);

					// fire
					hello.trigger(cb, error );
				}

				//
				for(var x in _services){if(_services.hasOwnProperty(x)){
				
					// Get session
					var session = hello.getAuthResponse(x);
					var token = ( session ? session.access_token : null);
					var evt = '';

					//
					// Listen for callbacks fired from Signin
					//
					if(session && "callback" in session && session.callback in listeners){

						// to do remove from session object...
						var cb = session.callback;
						delete session.callback;

						// Update store
						_store(x,session);

						// fire
						hello.trigger(cb, { network:x, authResponse: session } );
					}
					
					//
					// Refresh login
					//
					if( ( session && ("expires" in session) && ( !( x in pending ) || pending[x] < ((new Date()).getTime()/1e3) ) && session.expires < ((new Date()).getTime()/1e3) ) ){

						// try to resignin
						log( x + " has expired trying to resignin" );
						hello.login(x,{display:'none'});

						// update pending, every 10 minutes
						pending[x] = ((new Date()).getTime()/1e3) + 600;
					}


					// Has token changed?
					if( old_tokens[x] === token ){
						continue;
					}
					else{
						if(!token){
							evt = 'auth.logout.' + x;
						}
						// else if(!_diff[x]){
						else{
							evt = 'auth.login.' + x;
						}
						hello.trigger(evt, { network:x, authResponse: session } );
					}
					
					old_tokens[x] = token;
				}}

				// Check error events
				setTimeout(self, 1000);
			})();
		},

		//
		// Login
		// Using the endpoint defined by _services[x].auth we prompt the login
		// @param service	stringify				name to connect to
		// @param options	object		(optional)	{display mode, is either none|popup(default)|page, scope: email,birthday,publish, .. }
		// @param callback	function	(optional)	fired on signin
		//
		login :  function(service, opts, callback){

			var url,
				p = _arguments({service:'s!', options:'o', callback:'f'}, arguments);
			

			// merge/override options with app defaults
			p.options = _merge(_options, p.options || {} );


			// Is our service valid?
			if( typeof(p.service) === 'string' ){

				var provider  = _services[p.service],
					callback_id = '';

				//
				// Callback
				// Save the callback until state comes back.
				//
				if(p.callback){
					// choose a random callback ID string
					callback_id = "" + Math.round(Math.random()*1e9);
					
					// pass in a self unsubscribing function
					this.subscribe(callback_id, function self(){ hello.unsubscribe(callback_id,self); p.callback.apply(this, arguments);} );
				}


				//
				// QUERY STRING
				// querystring parameters, we may pass our own arguments to form the querystring
				//
				var qs = _merge( p.options, {
					client_id		: provider.id,
					scope			: provider.scope.basic,
					state			: p.service + '.' + p.options.display + '.' + callback_id + '.' + p.options.state
				});

				//
				// SCOPES
				// Authentication permisions
				//
				var scope = p.options.scope;
				if(scope){
					if(typeof(scope)!=='string'){
						scope = scope.join(',');
					}
					qs.scope = (qs.scope+ ',' + scope).replace(/[^,\s]+/ig, function(m){
						return (m in provider.scope) ? provider.scope[m] : m;
					});
					// remove duplication and empty spaces
					qs.scope = _unique(qs.scope.split(/,+/)).join( provider.scope_delim || ',');
				}

				//
				// REDIRECT_URI
				// Is the redirect_uri root?
				//
				if( qs.redirect_uri.indexOf('/') === 0 ){
					qs.redirect_uri = window.location.protocol + '//' + window.location.host + qs.redirect_uri;
				}
				// Is the redirect_uri relative?
				else if( !qs.redirect_uri.match(/^https?\:\/\//) ){
					qs.redirect_uri = (window.location.href.replace(/#.*/,'').replace(/\/[^\/]+$/,'/') + qs.redirect_uri).replace(/\/\.\//g,'/').replace(/\/[^\/]+\/\.\.\//g, '/');
				}

				//
				// URL
				//
				url = provider.uri.auth + '?' + _param(qs);

				// 
				// Execute
				// Trigger how we want this displayed
				// Calling Quietly?
				//
				if( qs.display === 'none' ){
					// signin in the background, iframe
					_append('iframe', { src : url, style : shy }, 'body');
				}

				// Triggering popup?
				else if( qs.display === 'popup'){

					// Trigger callback
					window.open( 
						url,
						'name', 
						"height=400,width=450,left="+((window.innerWidth-450)/2)+",top="+((window.innerHeight-400)/2)
					);
				}
				else {
					window.location = url;
				}
			}
			else{
				
				// trigger the default login.
				// ahh we dont have one.
				log('Please specify a service.');
			}
			return {url:url,method:qs.display};
		},
	
	
		//
		// Logout
		// Remove any data associated with a given service
		// @param string name of the service
		// @param function callback
		//
		logout : function(s, callback){
			if(s && _store(s)){
				_store(s,'');
			}
			else if(!s){
				for(var x in _services){if(_services.hasOwnProperty(x)){
					hello.logout(x);
				}}
				// remove the default
				hello.service(false);
				// trigger callback
			}
			else{
				log( s + ' had no session' );
			}
			if(callback){
				callback(false);
			}
		},


		//
		// API
		// @param path		string
		// @param method	string (optional)
		// @param data		object (optional)
		// @param timeout	integer (optional)
		// @param callback	function (optional)
		//
		api : function(){

			// get arguments
			var p = _arguments({path:'s!', method : 's', data:'o', timeout:'i', callback:"f" }, arguments);
			
			// method
			p.method = (p.method || 'get').toLowerCase();
			
			// data
			p.data = p.data || {};
			
			// Path
			p.path = p.path.replace(/^\/+/,'');
			var a = (p.path.split(/[\/\:]/,2)||[])[0].toLowerCase();
	
			var service;
	
			if(a in _services){
				service = a;
				var reg = new RegExp('^'+a+'\:?\/?');
				p.path = p.path.replace(reg,'');
			}
			else {
				service = this.service();
			}
			
			// callback
			p.callback = p.callback || function(){};
			
			// timeout global setting
			_timeout = p.timeout || _timeout;
			
			
			log("API:",p);
			
			var o = _services[service];
			
			// Have we got a service
			if(!o){
				log("No user");
				p.callback(false);
				return;
			}

			// 
			// Callback wrapper?
			// Change the incoming values so that they are have generic values according to the path that is defined
			var callback = (o.wrap && (p.path in o.wrap)) ? function(r){ log(p.path,r); p.callback(o.wrap[p.path](r)); } : p.callback;
	

			// Preprocess the parameters
			// Change the p parameters
			if("preprocess" in o){
				p = o.preprocess(p);
			}


			// push out to all networks
			// as long as the path isn't flagged as unavaiable, e.g. path == false
			if( !(p.path in o.uri) || o.uri[p.path] !== false ){

				var url = (p.path in o.uri ? o.uri[p.path] : p.path),
					session = this.getAuthResponse(service),
					token = (session?session.access_token:null);

				// if url needs a base
				if( !url.match(/^https?:\/\//) ){
					url = o.uri.base + url;
				}
				
				var qs = {};
				
				if(token){
					qs.access_token = token;
				}

				// 
				// build the call
				var request = function(){

					// Update the resource_uri
					url += ( url.indexOf('?') > -1 ? "&" : "?" );

					// Is this a post?
					if( p.method === 'post' ){

						qs.channelUrl = window.location.href;

						var req = _post( url + _param(qs), p.data, callback );

						return {
							url : req,
							method : 'POST',
							data : p.data
						};
					}
					// Make the call
					else{

						qs.callback = '?';

						var req = _jsonp( url + _param(qs), p.data, callback );

						return {
							url : req,
							method : 'JSONP'
						};
					}
				};

				// has the session expired?
				// Compare the session time, if session doesn't exist but we can feign it. Then use autologin
				// otherwise consider the session is current, or the resource doesn't need it
				if( ( session && "expires" in session && session.expires < ((new Date()).getTime()/1e3) ) 
					|| (!session && o.autologin) ){

					log("Callback");
	
					// trigger refresh
					hello.login(service, {display:'none'}, function(r){
					
						// success?
						if( typeof(r)==='object' && "error" in r){
							callback(r);
							return;
						}

						// regardless of the response, lets make the request
						request();

					});

					return {
						status : 'Signing in'
					};
				}
				else{
					return request();
				}
			}
			else{
				log('The path "'+ p.path +'" is not recognised');
			}
		},


		//
		// getAuthResponse
		// Returns all the sessions that are subscribed too
		// @param string optional, name of the service to get information about.
		//
		getAuthResponse : function(service){
			return _store(service||this.service());
		},
		



		//
		// Subscribe to events
		// @param evt		string
		// @param callback	function
		//
		subscribe : function(evt, callback){

			log("Subscribed", evt, callback);

			var p = _arguments({evt:'s!', callback:"f!"}, arguments);

			if(!p){
				return false;
			}
	
			listeners[p.evt] = [p.callback].concat(listeners[p.evt]||[]);

		},


		//
		// Unsubscribe to events
		// @param evt		string
		// @param callback	function
		//
		unsubscribe : function(evt, callback){
	
			log('Unsubscribe', evt, callback);

			var p = _arguments({evt:'s!', callback:"f!"}, arguments);

			if(!p){
				return false;
			}
			
			
			for(var i=0;i<listeners[p.evt].length;i++){
				if(listeners[p.evt][i] === callback){
					listeners[p.evt] = listeners[p.evt].splice(i,1);
				}
			}
		},
		
		//
		// Trigger
		// Triggers any subscribed events
		//
		trigger : function(evt, data){
			// loop through the events
			log("Trigger", evt, JSON.stringify(listeners));

			for(var x in listeners){if(listeners.hasOwnProperty(x)){
				if( evt.indexOf(x) > -1 ){
					for(var i=0;i<listeners[x].length;i++){
						listeners[x][i].call(this, data);
					}
				} 
			}}
		},
		
		//
		// Utilities
		//
		_param : _param,
		_store : _store,
		_append : _append
	};
	

	//
	// Save session, from redirected authentication
	// #access_token has come in?
	//	
	var p = _param(window.location.hash||null);

	if(!p){
		// FACEBOOK is returning auth errors within as a query_string... thats a stickler for consistency.
		p = _param(window.location.search);
	}
	// if p.state
	if( p && "state" in p ){

		// remove any addition information
		// e.g. p.state = 'facebook.page';
		var a = p.state.split('.');
		p.state = a[0];
		if(a.length>0){
			p.display = a[1];
		}
		

		// access_token?
		if( ("access_token" in p)
			&& p.state in _services){

			if(parseInt(p.expires_in,10) === 0){
				// Facebook, tut tut tut,
				p.expires_in = (3600 * 24 * 7 * 52);
			}

			// Lets use the "state" to assign it to one of our networks
			_store( p.state, {
				access_token : p.access_token, 
				expires_in : parseInt(p.expires_in,10), 
				expires : ((new Date()).getTime()/1e3) + parseInt(p.expires_in,10),
				callback : a[2]
			});

			// Make this the default users service
			hello.service( p.state );

			// this is a popup so
			if(!("display" in p) || p.display !== 'page'){
				window.close();
				log('Trying to close window');

				// Dont execute any more
				return;
			}
		}

		//error=?
		//&error_description=?
		//&state=?
		else if( ("error" in p)
				&& p.state in _services){

			_store( 'error', {
				error : p.error, 
				error_message : p.error_message || p.error_description,
				callback : a[2],
				state : p.state
			});

			// possible reasons are invalid_scope, user cancelled the authentication.
			// we're just going to close the page for now, 
			// @todo should this fire an event?
			// this is a popup so

			if(!("display" in p) || p.display !== 'page'){
				window.close();
				log('Trying to close window');

				// Dont execute any more
				return;
			}
		}
	}


	return hello;
	
	//////////////////////////////////////////////
	//////////////////////////////////////////////
	/////////////////UTILITIES////////////////////
	//////////////////////////////////////////////
	//////////////////////////////////////////////

	//
	// Log
	// [@param,..]
	//
	function log() {
		if (typeof(console) === 'undefined'||typeof(console.log) === 'undefined'){ return; }
		if (typeof console.log === 'function') {
			console.log.apply(console, arguments); // FF, CHROME, Webkit
		}
		else{
			console.log(Array.prototype.slice.call(arguments)); // IE
		}
	}
	

	// 
	// isArray
	function _isArray(o){
		return Object.prototype.toString.call(o) === '[object Array]';
	}

	
	//
	// Param
	// Explode/Encode the parameters of an URL string/object
	// @param string s, String to decode
	//
	function _param(s){
		var b,
			a = {},
			m;
		
		if(typeof(s)==='string'){

			m = s.replace(/^[\#\?]/,'').match(/([^=\/\&]+)=([^\&]+)/g);
			log(m);
			if(m){
				for(var i=0;i<m.length;i++){
					b = m[i].split('=');
					a[b[0]] = decodeURIComponent( b[1] );
				}
			}
			return a;
		}
		else {
			var o = s;
		
			a = [];

			for( var x in o ){if(o.hasOwnProperty(x)){
				if( o.hasOwnProperty(x) ){
					a.push( [x, o[x] === '?' ? '?' : encodeURIComponent(o[x]) ].join('=') );
				}
			}}

			return a.join('&');
		}
	}
	
	//
	// Store
	//
	function _store(name,value,days) {

		// log
		//log("_store",arguments);
		
		// Local storage
		var hello = JSON.parse(localStorage.getItem('hello')) || {};

		if(name && typeof(value) === 'undefined'){
			return hello[name];
		}
		else if(name && value === ''){
			delete hello[name];
		}
		else if(name){
			hello[name] = value;
		}
		else {
			return hello;
		}

		localStorage.setItem('hello', JSON.stringify(hello));

		return hello;
		
		/*
		if(typeof(value) === 'undefined'){
			var nameEQ = name + "=";
			var ca = document.cookie.split(';');
			for(var i=0;i < ca.length;i++) {
				var c = ca[i];
				while (c.charAt(0)==' '){
					c = c.substring(1,c.length);
				}
				if (c.indexOf(nameEQ) == 0){
					r = c.substring(nameEQ.length,c.length);
					if( r.match(/^\{/) ){
						try{ 
							r = JSON.parse(r);
						}catch(e){}
					}
					return r;
				}
			}
			return null;
		}
		else if (value === ''){
			days = -1;
		}
	
		if (days) {
			var date = new Date();
			date.setTime(date.getTime()+(days*24*60*60*1000));
			var expires = "; expires="+date.toGMTString();
		}
		else var expires = "";
		
		if(typeof(value)!=='string'){
			value = JSON.stringify(value);
		}
		document.cookie = name+"="+value+expires+"; path=/";
		*/
	}

	//
	// unique
	// remove duplicate and null values from an array
	// @param a array
	//
	function _unique(a){
		if(typeof(a)!=='object'){ return []; }
		var r = [];
		for(var i=0;i<a.length;i++){
			if(!a[i]||a[i].length===0||r.indexOf(a[i])!==-1){
				continue;
			}
			else{
				r.push(a[i]);
			}
		}
		return r;
	}

	//
	// merge
	// recursive merge two objects into one, second parameter overides the first
	// @param a array
	//
	function _merge(a,b){
		var x,r = {};
		if( typeof(a) === 'object' && typeof(b) === 'object' ){
			for(x in a){if(a.hasOwnProperty(x)){
				r[x] = a[x];
				if(x in b){
					r[x] = _merge( a[x], b[x]);
				}
			}}
			for(x in b){if(b.hasOwnProperty(x)){
				if(!(x in a)){
					r[x] = b[x];
				}
			}}
		}
		else{
			r = b;
		}
		return r;
	}

	//
	// Args utility
	// Makes it easier to assign parameters, where some are optional
	// @param o object
	// @param a arguments
	//
	function _arguments(o,args){

		var p = {},
			i = 0,
			t = null,
			x = null;
		
		// define x
		for(var x in o){if(o.hasOwnProperty(x)){
			break;
		}}

		// Passing in hash object of arguments?
		// Where the first argument can't be an object
		if((args.length===1)&&(typeof(args[0])==='object')&&o[x]!='o!'){
			// return same hash.
			return args[0];
		}

		// else loop through and account for the missing ones.
		for(x in o){if(o.hasOwnProperty(x)){

			t = typeof( args[i] );

			if( ( typeof( o[x] ) === 'function' && o[x].test(args[i]) ) || 
				( typeof( o[x] ) === 'string' && (
					( o[x][0] === 's' && t === 'string' ) ||
					( o[x][0] === 'o' && t === 'object' ) ||
					( o[x][0] === 'i' && t === 'number' ) ||
					( o[x][0] === 'a' && t === 'object' ) ||
					( o[x][0] === 'f' && t === 'function' )
				) )	
			){
				p[x] = args[i++];
			}
			
			else if( typeof( o[x] ) === 'string' && o[x][1] === '!' ){
				log("Whoops! " + x + " not defined");
				return false;
			}
		}}
		return p;
	}


	//
	// Create and Append new Dom elements
	// @param node string
	// @param attr object literal
	// @param dom/string 
	//
	function _append(node,attr,target){

		var n = typeof(node)==='string' ? document.createElement(node) : node;

		if(typeof(attr)==='object' ){
			if( "tagName" in attr ){
				target = attr;
			}
			else{
				for(var x in attr){if(attr.hasOwnProperty(x)){
					if(typeof(attr[x])==='object'){
						for(var y in attr[x]){if(attr[x].hasOwnProperty(y)){
							n[x][y] = attr[x][y];
						}}
					}
					else{
						n[x] = attr[x];
					}
				}}
			}
		}
		
		if(target==='body'){
			(function self(){
				if(document.body){
					document.body.appendChild(n);
				}
				else{
					setTimeout( self, 16 );
				}
			})();
		}
		else if(typeof(target)==='object'){
			target.appendChild(n);
		}
		else if(typeof(target)==='string'){
			log(target);
			document.getElementsByTagName(target)[0].appendChild(n);
		}
		return n;
	}


	//
	// JSONP
	// Injects a script tag into the dom to be executed and appends a callback function to the window object
	// TODO: IE triggering a click event to initiate the code, can't repo this apparent bug.
	//

	function _jsonp(path,data,callback){

		// Add data
		path += (path.indexOf('?')===-1?'?':'&')+_param(data);
		
		// Change the name of the callback
		var cb_name = '__lx_jsonp'+(_jsonp_counter++),
			bool = 0,
			head = document.getElementsByTagName('head')[0],
			operafix,
			script,
			result = {error:{message:'server_error',code:'server_error'}},
			cb = function(){
				if( !( bool++ ) ){
					window.setTimeout(function(){
						callback(result);
						head.removeChild(script);
					},0);
				}
			};

		// Add callback to the window object
		window[cb_name] = function(json){
			result = json;
			delete window[cb_name];
		};

		// Build script tag
		script = _append('script',{
			id:cb_name,
			name:cb_name,
			src:path.replace(new RegExp("=\\?(&|$)"),'='+cb_name+'$1'),
			async:true,
			onload:cb,
			onerror:cb,
			onreadystatechange : function(){
				if(/loaded|complete/i.test(this.readyState)){
					cb();
				}
			}
		});

		// Opera fix error
		// Problem: If an error occurs with script loading Opera fails to trigger the script.onerror handler we specified
		// Fix: 
		// By setting the request to synchronous we can trigger the error handler when all else fails.
		// This action will be ignored if we've already called the callback handler "cb" with a successful onload event
		if( window.navigator.userAgent.toLowerCase().indexOf('opera') > -1 ){
			operafix = _append('script',{
				text:"document.getElementById('"+cb_name+"').onerror();"
			});
			script.async = false;
		}

		// Add timeout
		window.setTimeout(function(){
			result = {error:{message:'timeout',code:'timeout'}};
			cb();
		}, _timeout);

		// Todo: 
		// Add fix for msie,
		// However: unable recreate the bug of firing off the onreadystatechange before the script content has been executed and the value of "result" has been defined.

		// Inject script tag into the head element
		head.appendChild(script);
		
		// Append Opera Fix to run after our script
		if(operafix){
			head.appendChild(operafix);
		}

		// return the request url
		return script.src;
	}


	//
	// Post
	// Send information to a remote location using the post mechanism
	// @param string uri path
	// @param object data, key value data to send
	// @param function callback, function to execute in response
	//
	function _post(uri, data, callback){

		// Build an iFrame and inject it into the DOM
		var ifm = _append('iframe',{id:'_'+Math.round(Math.random()*1e9), style:shy});
		
		// Build an HTML form, with a target attribute as the ID of the iFrame, and inject it into the DOM.
		var frm = _append('form',{ method: 'post', action: uri, target: ifm.id, style:shy});

		// insert into the HTML form all the values
		for( var x in data ){ if(data.hasOwnProperty(x) ){
			// Add input
			_append('input',{ name: x, value: data[x] }, frm);
		}}

		// Append iFrame & Form to the DOM
		document.body.appendChild(ifm);
		document.body.appendChild(frm);

		// Submit form
		frm.submit();

		return uri;
	}

})();