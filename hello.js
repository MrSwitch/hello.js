/**
 * hello.js
 *
 * So many web services are putting their content online accessible on the web using OAuth2 as a provider.
 * The downside is they all have seperate REST calls, and client-side libraries to access their data.
 * So its either one service or the other, or add a ton of libraries and logic to your scripts.
 * 
 * You could use a proprietary service like Gigya or Jan Rain to circumnavigate the problem. But i think you'll like hello.js
 * It works with FaceBook, Windows and Google+ and is FREE to use and hack!
 *
 * @author Andrew Dodson
 * @company Knarly
 */

var hello = (function(){

	"use strict";

	// JSONP
	var _jsonp_counter = 0;
	
	// Events
	var listeners = {};


	//
	// Services
	//
	var services = {

		google : {
			name : "Google Plus",
			uri : {
				// REF: http://code.google.com/apis/accounts/docs/OAuth2UserAgent.html
				auth : "https://accounts.google.com/o/oauth2/auth",
				me	: "plus/v1/people/me?pp=1",
				base : "https://www.googleapis.com/"
			},
			scope : {
				basic : "https://www.googleapis.com/auth/plus.me",
				email			: '',
				birthday		: '',
				events			: '',
				photos			: 'https://picasaweb.google.com/data/',
				videos			: 'http://gdata.youtube.com',
				
				publish			: '',
				create_event	: '',

				offline_access : ''
			},
			scope_delim : ' ',
			wrap : {
				me : function(o){
					if(o.id){
						o.last_name = o.name.familyName;
						o.first_name = o.name.givenName;
						o.picture = o.image.url;
						o.name = o.displayName; 
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
				events			: 'wl.events,wl.calendars',
				photos			: 'wl.photos',
				videos			: 'wl.photos',
				
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
				}
			},
			preprocess : function(p){
				if( p.method.toLowerCase() !== 'get'){
					p.method = 'get';
					p.data.method = 'post';
				}
				return p;
			}
		},
		
		knarly : {
			name : 'Knarly',
			autologin : true,
			id : window.location.host,
			uri : {
				// REF: 
				auth : function(qs){
					var url = '/knarly.net/oauth';

					// if the user is signed into another service. Lets attach the credentials to that and hopefully get the user signed in.
					var service = hello.service(),
						session = hello.getAuthResponse( service );

					if( session && "access_token" in session ){
						qs.access_token = session.access_token;
						qs.provider = service;
					}
					return url + '?' + _param(qs);
				},

				base : '/knarly.net/api/'
			},
			scope : {
				basic : ''
			},
			wrap : {
				// knarly has no special paths
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
		//
		init : function(o){

			// Define provider credentials
			// Reformat the ID field
			for( var x in o ){if(o.hasOwnProperty(x)){
				if( typeof(o[x]) !== 'object' ){
					o[x] = {id : o[x]};
				}
			}}

			// merge objects
			services = _merge(services, o);

			// Monitor for a change in state and fire
			var _diff = {};

			// create monitoring function
			(function self(){

				for(var x in services){if(services.hasOwnProperty(x)){
				
					// Get session
					var session = hello.getAuthResponse(x);
					var token = ( session ? session.access_token : null);
					var evt = '';
					if( _diff[x] === token ){
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
					
					_diff[x] = token;
				}}

				setTimeout(self, 1000);
			})();
		},

		//
		// Login
		// Using the endpoint defined by services[x].auth we prompt the login
		// @param service	stringify				name to connect to
		// @param Callback	function	(optional)	fired on signin
		// @param options	object		(optional)	{display mode, is either none|popup(default)|page, scope: email,birthday,publish, .. }
		//
		login :  function(service, callback, options){

			var url,
				p = _arguments({service:'s!', callback : 'f', options:'o'}, arguments);
			
			// Format
			if(!p.options){
				p.options = {};
			}

			// display method
			var display = p.options.display || 'popup';

			// 
			if( typeof(p.service) === 'string' ){

				var provider  = services[p.service];

				// Build URL
				// querystring parameters
				var qs = {
					client_id		: provider.id,
					redirect_uri	: window.location.href,
					response_type	: "token",
					scope			: provider.scope.basic,
					state			: p.service,
					display			: display
				};

				// Additional
				// Scopes
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
				
				
				// Does the provider have their own algorithm?
				if( typeof(provider.uri.auth) === 'function'){
					url = provider.uri.auth(qs);
				}
				else{
					url = provider.uri.auth + '?' + _param(qs);
				}

				// Callback
				// Save the callback until session changes.
				if(p.callback){
					// pass in a self unsubscribing function
					this.subscribe('auth.login.'+p.service, function self(){ hello.unsubscribe('auth.login.'+p.service,self); p.callback.apply(this, arguments);} );
				}
			

				// Trigger how we want this displayed
				// Calling Quietly?
				if( display === 'none' ){
					// signin in the background, iframe
					_append('iframe', { src : url, style : {height:0,width:0,position:'absolute',top:0,left:0}  }, document.body);
				}

				// Triggering popup?
				else if( display === 'popup'){
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
				log('Please specify a service.');
			}
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
				if(callback){
					callback();
				}
			}
			else if(!s){
				for(var x in services){if(services.hasOwnProperty(x)){
					hello.logout(x);
				}}
				// remove the default
				hello.service(false);
				// trigger callback
				if(callback){
					callback();
				}
			}
			else{
				log( s + ' had no session' );
			}
		},


		//
		// API
		// @param path		string
		// @param method	string (optional)
		// @param data		object (optional)
		// @param callback	function (optional)
		//
		api : function(){
		
			// get arguments
			var p = _arguments({path:'s!', method : /get|post|put|delete/, data:'o', callback:"f"}, arguments);
			
			p.method = (p.method || 'get').toLowerCase();
			p.data = p.data || {};
			
			
			p.path = p.path.replace(/^\/+/,'');
			var a = (p.path.split("/",2)||[])[0].toLowerCase();
	
			var service;
	
			if(a in services){
				service = a;
				p.path = p.path.replace(/^.*?\//,'');
			}
			else {
				service = this.service();
			}
			
			
			p.callback = p.callback || function(){};
			
			
			log("API:",p);
			
			var o = services[service];
			
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

				var url = o.uri.base+(p.path in o.uri ? o.uri[p.path] : p.path),
					session = this.getAuthResponse(service),
					token = (session?session.access_token:null);
				
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

						_post( url + _param(qs), p.data, callback );
					}
					// Make the call
					else{

						qs.callback = '?';

						_jsonp( url + _param(qs), p.data, callback );
					}
				};

				// has the session expired?
				// Compare the session time, if session doesn't exist but we can feign it. Then use autologin
				// otherwise consider the session is current, or the resource doesn't need it
				if( ( session && "expires" in session && session.expires < ((new Date()).getTime()/1e3) ) 
					|| (!session && o.autologin) ){

					log("Callback");
	
					// trigger refresh
					hello.login(service, function(bool){
						// regardless of the response, lets make the request
						request();

					}, {display:'none'});
				}
				else{
					request();
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

			var p = _arguments({evt:'s!', callback:"f!"}, arguments);

			if(!p){
				return false;
			}
	
			listeners[p.evt] = [p.callback].concat(listeners[p.evt]||[]);

			log("Sub", evt);
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
		_store : _store
	};
	

	//
	// Save session, from redirected authentication
	// #access_token has come in?
	//	
	var p = _param(window.location.hash);

	if( p 
		&& ("access_token" in p)
		&& ("state" in p)
		&& p.state in services){

		if(parseInt(p.expires_in,10) === 0){
			// Facebook, tut tut tut,
			p.expires_in = (3600 * 24 * 7 * 52);
		}

		// Lets use the "state" to assign it to one of our networks
		_store( p.state, {
			access_token : p.access_token, 
			expires_in : parseInt(p.expires_in,10), 
			expires : ((new Date()).getTime()/1e3) + parseInt(p.expires_in,10)
		});

		// Service
		hello.service( p.state );

		// this is a popup so
		window.close();
		
		
		log('Trying to close window');

		// Dont execute any more
		return;
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
	// Param
	// Explode/Encode the parameters of an URL string/object
	// @param string s, String to decode
	//
	function _param(s){
		var b, 
			a = {},
			m;
		
		if(typeof(s)==='string'){

			m = s.replace(/.*[#\?]/,'').match(/([^=\/\&]+)=([^\/\&]+)/g);
	
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
		var x;
		if( typeof(a) === 'object' && typeof(b) === 'object' ){
			for(x in a){if(a.hasOwnProperty(x)){
				if(x in b){
					a[x] = _merge( a[x], b[x]);
				}
			}}
			for(x in b){if(b.hasOwnProperty(x)){
				if(!(x in a)){
					a[x] = b[x];
				}
			}}
		}
		else{
			a = b;
		}
		return a;
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
			t = null;

		for(var x in o){if(o.hasOwnProperty(x)){

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
		if(typeof(target)==='object'){
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
			result = false,
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
		window.setTimeout(cb, 60000);

		// Todo: 
		// Add fix for msie,
		// However: unable recreate the bug of firing off the onreadystatechange before the script content has been executed and the value of "result" has been defined.

		// Inject script tag into the head element
		head.appendChild(script);
		
		// Append Opera Fix to run after our script
		if(operafix){
			head.appendChild(operafix);
		}
	}


	//
	// Post
	// Send information to a remote location using the post mechanism
	// @param string uri path
	// @param object data, key value data to send
	// @param function callback, function to execute in response
	//
	function _post(uri, data, callback){

		// How to hide elements, without dispay:none
		var shy = {position:'absolute',left:-1000,bottom:0,height:'1px',width:'1px'};
	
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
	}

})();