/**
 * @hello.js
 *
 * HelloJS is a client side Javascript SDK for making OAuth2 logins and subsequent REST calls.
 *
 * @author Andrew Dodson
 * @company Knarly
 *
 * @copyright 2012, Andrew Dodson
 * @license Free for non-commercial
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
	// Services Object
	var _services = {};

	// Monitor for a change in state and fire
	var old_session = {}, pending = {};

	//
	// Monitoring session state
	// Check for session changes
	(function self(){

		// Loop through the services
		for(var x in _services){if(_services.hasOwnProperty(x)){

			if(!_services[x].id){
				// we haven't attached an ID so dont listen.
				continue;
			}
		
			// Get session
			var session = hello.getAuthResponse(x) || {};
			var oldsess = old_session[x] || {};
			var evt = '';

			//
			// Listen for callbacks fired from Signin
			//
			if(session && "callback" in session && session.callback in listeners){

				// to do remove from session object...
				var cb = session.callback;
				try{
					delete session.callback;
				}catch(e){}

				// Update store
				_store(x,session);

				// fire
				hello.trigger(cb, { network:x, authResponse: session } );
			}
			
			//
			// Refresh login
			//
			if( session && ("expires" in session) && session.expires < ((new Date()).getTime()/1e3) ){

				if( !( x in pending ) || pending[x] < ((new Date()).getTime()/1e3) ) {
					// try to resignin
					log( x + " has expired trying to resignin" );
					hello.login(x,{display:'none'});

					// update pending, every 10 minutes
					pending[x] = ((new Date()).getTime()/1e3) + 600;
				}
				// If session has expired then we dont want to store its value until it can be established that its been updated
				continue;
			}
			// Has session changed?
			else if( oldsess.access_token === session.access_token &&
						oldsess.expires === session.expires ){
				continue;
			}
			// Access_token has been removed
			else if( !session.access_token && oldsess.access_token ){
				hello.trigger( x+':auth.logout', {
					network : x,
					authResponse : session
				});
			}
			// Access_token has been created
			else if( session.access_token && !oldsess.access_token ){
				hello.trigger( x+':auth.login', {
					network:x,
					authResponse: session
				} );
			}
			// Access_token has been updated
			else if( session.expires !== oldsess.expires ){
				hello.trigger( x+':auth.update', {
					network:x,
					authResponse: session
				} );
			}
			
			old_session[x] = session;
		}}

		// Check error events
		setTimeout(self, 1000);
	})();



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

			if(!services){
				return _services;
			}

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

			// Tidy
			for( x in _services ){if(_services.hasOwnProperty(x)){
				_services[x].scope = _services[x].scope || {};
			}}

			// options
			if(p.opts){
				_options = _merge(_options, p.opts);

				if("redirect_uri" in p.opts){
					_options.redirect_uri = _realPath(p.opts.redirect_uri);
				}
			}

			// Timeout
			if(p.timeout){
				_timeout = p.timeout;
			}

			return _services;
		},

		//
		// Login
		// Using the endpoint defined by _services[x].auth we prompt the login
		// @param network	stringify				name to connect to
		// @param options	object		(optional)	{display mode, is either none|popup(default)|page, scope: email,birthday,publish, .. }
		// @param callback	function	(optional)	fired on signin
		//
		login :  function(network, opts, callback){

			var url,
				p = _arguments({network:'s!', options:'o', callback:'f'}, arguments);
			

			// merge/override options with app defaults
			p.options = _merge(_options, p.options || {} );

			// Is our service valid?
			if( typeof(p.network) !== 'string' ){
				// trigger the default login.
				// ahh we dont have one.
				log('Please specify a service.');
			}

			//
			var provider  = _services[p.network],
				callback_id = "" + Math.round(Math.random()*1e9);

			//
			// Callback
			// Save the callback until state comes back.
			//
			var responded = false;
			this.subscribe(callback_id, function self(){
				responded = true;
				hello.unsubscribe(callback_id,self);
				if(p.callback){
					p.callback.apply(this, arguments);
				}
			});


			//
			// QUERY STRING
			// querystring parameters, we may pass our own arguments to form the querystring
			//
			var qs = _merge( p.options, {
				client_id		: provider.id,
				scope			: 'basic',
				state			: {
					network : p.network,
					display : p.options.display,
					callback : callback_id,
					state : p.options.state
				}
			});

			//
			// SCOPES
			// Authentication permisions
			//
			var scope = p.options.scope;
			if(scope){
				// Format
				if(typeof(scope)!=='string'){
					scope = scope.join(',');
				}
			}
			scope = (scope ? scope + ',' : '') + qs.scope;

			// Save in the State
			qs.state.scope = scope.split(/,\s/);

			// Replace each with the default scopes
			qs.scope = scope.replace(/[^,\s]+/ig, function(m){
				return (m in provider.scope) ? provider.scope[m] : '';
			}).replace(/[,\s]+/ig, ',');
			// remove duplication and empty spaces
			qs.scope = _unique(qs.scope.split(/,+/)).join( provider.scope_delim || ',');

			//
			// Is the user already signed in
			//
			var session = hello.getAuthResponse(p.network);
			if( session && "expires" in session && session.expires > ((new Date()).getTime()/1e3) ){
				// What is different about the scopes in the session vs the scopes in the new login?
				var diff = _diff( session.scope || [], qs.state.scope || [] );
				if(diff.length===0){
					// Ok trigger the callback
					this.trigger(callback_id+".login", {
						network : p.network,
						authResponse : session
					});

					// Notthing has changed
					return;
				}
			}

			//
			// REDIRECT_URI
			// Is the redirect_uri root?
			//
			qs.redirect_uri = _realPath(qs.redirect_uri);

			// Convert state to a string
			qs.state = JSON.stringify(qs.state);

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
				var popup = window.open(
					url,
					'Authentication',
					"resizeable=true,height=550,width=500,left="+((window.innerWidth-500)/2)+",top="+((window.innerHeight-550)/2)
				);
				var self = this;
				var timer = setInterval(function(){
					if(popup.closed){
						clearInterval(timer);
						if(!responded){
							self.trigger(callback_id+".failed", {error:{code:"user_cancelled", message:"Cancelled"}, network:p.network });
						}
					}
				}, 100);
			}

			else {
				window.location = url;
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

			var p = _arguments({name:'s', callback:"f" }, arguments);

			if(p.name && _store(p.name)){
				_store(p.name,'');
			}
			else if(!p.name){
				for(var x in _services){if(_services.hasOwnProperty(x)){
					hello.logout(x);
				}}
				// remove the default
				hello.service(false);
				// trigger callback
			}
			else{
				log( p.name + ' had no session' );
			}
			if(p.callback){
				p.callback(false);
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
				var reg = new RegExp('^'+a+':?\/?');
				p.path = p.path.replace(reg,'');
			}
			else {
				service = this.service();
			}
			
			// callback
			p.callback = p.callback || function(){};
			
			// timeout global setting
			_timeout = p.timeout || _timeout;
			
			
			log("API: "+p.method.toUpperCase()+" '"+p.path+"' (request)",p);
			
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
			var callback = function(r){
				if( o.wrap && ( (p.path in o.wrap) || ("default" in o.wrap) )){
					var wrap = (p.path in o.wrap ? p.path : "default");
					r = o.wrap[wrap](r);
				}
				log("API: "+p.method.toUpperCase()+" '"+p.path+"' (response)", r);
				p.callback(r);
			};

			// push out to all networks
			// as long as the path isn't flagged as unavaiable, e.g. path == false
			if( !(p.path in o.uri) || o.uri[p.path] !== false ){

				var url = (p.path in o.uri ?
							o.uri[p.path] :
							( o.uri['default'] ? o.uri['default'] : p.path)),
					session = this.getAuthResponse(service),
					token = (session?session.access_token:null);

				// if url needs a base
				// Wrap everything in
				var getPath = function(url){

					if( !url.match(/^https?:\/\//) ){
						url = o.uri.base + url;
					}


					var qs = {};
					
					if(token){
						qs['access_token'] = token;
					}

					if(o.querystring){
						// Make amendments to the standard querystring
						o.querystring(qs);
					}

					// Update the resource_uri
					url += ( url.indexOf('?') > -1 ? "&" : "?" );

					// Format the data
					if( !_isEmpty(p.data) && !_dataToJSON(p) ){
						// If we can't format the post then, we are going to run the iFrame hack
						_post( url + _param(qs), p.data, ("post" in o ? o.post(p) : null), callback);
						return;
					}

					// Each provider and their protocol has unique features
					// We place it in the config
					var config ={};


					// the delete callback needs a better response
					if(p.method === 'delete'){
						var _callback = callback;
						callback = function(r){
							_callback((!r||_isEmpty(r))? {response:'deleted'} : r);
						};
					}


					// Can we use XHR for Cross domain delivery?
					if( 'withCredentials' in new XMLHttpRequest() && (!("xhr" in o) || (config = o.xhr(p))) ){

						var r = new XMLHttpRequest();

						// xhr.responseType = "json"; // is not supported in any of the vendors yet.
						r.onload = function(e){
							var json = r.responseText ? JSON.parse(r.responseText) : null;
							callback( json || ( p.method!=='delete' ? {error:{message:"Could not get resource"}} : {} ));
						};
						r.onerror = function(e){
							callback(r.responseText?JSON.parse(r.responseText):{error:{message:"There was an error accessing "+ url}});
						};

						/**
						// Google Data API needs to overwrite this entirely... Urgh!
						if(config&&config.handler){
							config.handler(url, qs, p.data, r);
							return;
						}
						*/

						// Add the token
						qs.suppress_response_codes = true;
						url += _param(qs);

						// Should we add the query to the URL?
						if(p.method === 'get'||p.method === 'delete'){
							if(!_isEmpty(p.data)){
								url += (url.indexOf('?')===-1?'?':'&')+_param(p.data);
							}
							p.data = null;
						}
						else if( p.data && typeof(p.data) !== 'string' && !(p.data instanceof FormData)){
							// Loop through and add formData
							var f = new FormData();
							for( var x in p.data )if(p.data.hasOwnProperty(x)){
								if( p.data[x] instanceof HTMLInputElement ){
									if( "files" in p.data[x] && p.data[x].files.length > 0){
										f.append(x, p.data[x].files[0]);
									}
								}
								else{
									f.append(x, p.data[x]);
								}
							}
							p.data = f;
						}

						// Open URL
						r.open( p.method.toUpperCase(), url );

						if(config.contentType)
							r.setRequestHeader("Content-Type", config.contentType);

						// Should we wrap the post data in the body of the request?
						// The fake atrribute is required if this is a shim
						if( p.data && p.data instanceof FormData && "fake" in p.data && p.data.fake ){
							r.setRequestHeader("Content-Type", "multipart/form-data; boundary="+ p.data.boundary);
							r.sendAsBinary(p.data.toString());
						}
						else{
							r.send( p.data );
						}

						// we're done
						return {
							url : url,
							method : 'XHR',
							data : p.data
						};
					}

					// Otherwise we're on to the old school, IFRAME hacks and JSONP
					// Preprocess the parameters
					// Change the p parameters
					if("jsonp" in o){
						p = o.jsonp(p);
					}

					// Is this still a post?
					if( p.method === 'post' ){

						//qs.channelUrl = window.location.href;
						return {
							url : _post( url + _param(qs), p.data, ("post" in o ? o.post(p) : null), callback ),
							method : 'POST',
							data : p.data
						};
					}
					// Make the call
					else{

						qs.callback = '?';

						return {
							url : _jsonp( url + _param(qs), p.data, callback ),
							method : 'JSONP'
						};
					}
				};

				// Make request
				if(typeof(url)==='function'){
					url(p, getPath);
				}
				else{
					getPath(url);
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

			var p = _arguments({evt:'s!', callback:"f"}, arguments);

			if(!p){
				return false;
			}
			
			for(var i=0;i<listeners[p.evt].length;i++){
				if(!p.callback || listeners[p.evt][i] === p.callback){
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
			log("Trigger: '"+ evt+"'", data);

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
		utils : {
			param : _param,
			hasBinary : _hasBinary,
			store : _store,
			append : _append,
			merge : _merge
		}
	};




	//
	// AuthCallback
	// Trigger a callback to authenticate
	//
	function authCallback(network, obj){
		// Trigger the callback on the parent
		_store(obj.network, obj );

		// this is a popup so
		if( !("display" in p) || p.display !== 'page'){

			// trigger window.opener
			var win = (window.opener||window.parent);

			if(win&&"hello" in win&&win.hello){
				// Call the generic listeners
//				win.hello.trigger(network+":auth."+(obj.error?'failed':'login'), obj);
				// Call the inline listeners

				// to do remove from session object...
				var cb = obj.callback;
				try{
					delete obj.callback;
				}catch(e){}


				// Trigger on the parent
				if(obj.error){
					win.hello.trigger(obj.network+":"+cb+".failed", obj );
				}
				else{
					win.hello.trigger(obj.network+":"+cb+".login", {
						network : obj.network,
						authResponse : obj
					});

					// Save on the parent window the new credentials
					// This fixes an IE10 bug i think... atleast it does for me.
					win.hello.utils.store(obj.network,obj);
				}

				// Update store
				_store(obj.network,obj);
			}

			window.close();
			log('Trying to close window');

			// Dont execute any more
			return;
		}
	}
	//
	// Save session, from redirected authentication
	// #access_token has come in?
	//
	// FACEBOOK is returning auth errors within as a query_string... thats a stickler for consistency.
	// SoundCloud is the state in the querystring and the rest in the hashtag
	var p = _merge(_param(window.location.search||''), _param(window.location.hash||''));

	
	// if p.state
	if( p && "state" in p ){

		// remove any addition information
		// e.g. p.state = 'facebook.page';
		try{
			var a = JSON.parse(p.state);
			p = _merge(p, a);
		}catch(e){
			log("Could not decode state parameter");
		}

		// access_token?
		if( ("access_token" in p&&p.access_token) && p.network ){

			if(parseInt(p.expires_in,10) === 0){
				// Facebook, tut tut tut,
				p.expires_in = (3600 * 24 * 7 * 52);
			}
			p.expires_in = parseInt(p.expires_in,10);
			p.expires = ((new Date()).getTime()/1e3) + parseInt(p.expires_in,10);

			// Make this the default users service
			hello.service( p.network );

			// Lets use the "state" to assign it to one of our networks
			authCallback( p.network, p );
		}

		//error=?
		//&error_description=?
		//&state=?
		else if( ("error" in p && p.error) && p.network ){
			// Error object
			p.error = {
				code: p.error,
				message : p.error_message || p.error_description
			};

			// Let the state handler handle it.
			authCallback( p.network, p );
		}

		// API Calls
		// IFRAME HACK
		// Result is serialized JSON string.
		if(p&&p.callback&&"result" in p && p.result ){
			// trigger a function in the parent
			if(p.callback in window.parent){
				window.parent[p.callback](JSON.parse(p.result));
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
		if(typeof arguments[0] === 'string'){
			arguments[0] = "HelloJS-" + arguments[0];
		}
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

	// isEmpty
	function _isEmpty(obj){
		// scalar?
		if(!obj){
			return true;
		}

		// Array?
		if(obj && obj.length>0) return false;
		if(obj && obj.length===0) return true;

		// object?
		for (var key in obj) {
			if (obj.hasOwnProperty(key))
				return false;
		}
		return true;
	}

	//
	// diff
	function _diff(a,b){
		var r = [];
		for(var i=0;i<b.length;i++){
			if(_indexOf(a,b[i])===-1){
				r.push(b[i]);
			}
		}
		return r;
	}

	// _DOM
	// return the type of DOM object
	function _domInstance(type,data){
		var test = "HTML" + (type||'').replace(/^[a-z]/,function(m){return m.toUpperCase();}) + "Element";
		if(window[test]){
			return data instanceof window[test];
		}else if(window.Element){
			return data instanceof window.Element && (!type || data.tagName === type);
		}else{
			return (!(data instanceof Object||data instanceof Array||data instanceof String||data instanceof Number) && data.tagName && data.tagName === type );
		}
	}

	//
	// indexOf
	// IE hack Array.indexOf doesn't exist prior to IE9
	function _indexOf(a,s){
		// Do we need the hack?
		if(a.indexOf){
			return a.indexOf(s);
		}

		for(var j=0;j<a.length;j++){
			if(a[j]===s){
				return j;
			}
		}
		return -1;
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
			try{
				delete hello[name];
			}
			catch(e){
				hello[name]=null;
			}
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

			if(!a[i]||a[i].length===0||_indexOf(r, a[i])!==-1){
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
		for(x in o){if(o.hasOwnProperty(x)){
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

			if( ( typeof( o[x] ) === 'function' && o[x].test(args[i]) ) || ( typeof( o[x] ) === 'string' && (
					( o[x].indexOf('s')>-1 && t === 'string' ) ||
					( o[x].indexOf('o')>-1 && t === 'object' ) ||
					( o[x].indexOf('i')>-1 && t === 'number' ) ||
					( o[x].indexOf('a')>-1 && t === 'object' ) ||
					( o[x].indexOf('f')>-1 && t === 'function' )
				) )
			){
				p[x] = args[i++];
			}
			
			else if( typeof( o[x] ) === 'string' && o[x].indexOf('!')>-1 ){
				log("Whoops! " + x + " not defined");
				return false;
			}
		}}
		return p;
	}

	//
	// realPath
	//
	function _realPath(path){
		if( path.indexOf('/') === 0 ){
			path = window.location.protocol + '//' + window.location.host + path;
		}
		// Is the redirect_uri relative?
		else if( !path.match(/^https?\:\/\//) ){
			path = (window.location.href.replace(/#.*/,'').replace(/\/[^\/]+$/,'/') + path).replace(/\/\.\//g,'/');
		}
		while( /\/[^\/]+\/\.\.\//g.test(path) ){
			path = path.replace(/\/[^\/]+\/\.\.\//g, '/');
		}
		return path;
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
					else if(x==="html"){
						n.innerHTML = attr[x];
					}
					// IE doesn't like us setting methods with setAttribute
					else if(!/^on/.test(x)){
						n.setAttribute( x, attr[x]);
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
			try{
				delete window[cb_name];
			}catch(e){}
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
	function _post(url, data, options, callback){

		// This hack needs a form
		var form = null,
			reenableAfterSubmit = [],
			newform,
			i = 0,
			x = null,
			bool = 0,
			cb = function(r){
				if( !( bool++ ) ){
					try{
						// remove the iframe from the page.
						//win.parentNode.removeChild(win);
						// remove the form
						if(newform){
							newform.parentNode.removeChild(newform);
						}
					}
					catch(e){log("could not remove iframe");}

					// reenable the disabled form
					for(var i=0;i<reenableAfterSubmit.length;i++){
						if(reenableAfterSubmit[i]){
							reenableAfterSubmit[i].setAttribute('disabled', false);
						}
					}

					// fire the callback
					callback(r);
				}
			};

		// What is the name of the callback to contain
		// We'll also use this to name the iFrame
		var callbackID = "ifrmhack_"+parseInt(Math.random()*1e6,10).toString(16);

		// Save the callback to the window
		window[callbackID] = cb;

		// Build the iframe window
		var win;
		try{
			// IE7 hack, only lets us define the name here, not later.
			win = document.createElement('<iframe name="'+callbackID+'">');
		}
		catch(e){
			win = document.createElement('iframe');
		}

		win.name = callbackID;
		win.id = callbackID;
		win.style.display = 'none';

		// Override callback mechanism. Triggger a response onload/onerror
		if(options&&options.callbackonload){
			// onload is being fired twice
			win.onload = function(){
				cb({
					response : "posted",
					message : "Content was posted"
				});
			};
		}

		setTimeout(function(){
			cb({
				error : {
					code:"timeout",
					message : "The post operation timed out"
				}
			});
		}, _timeout);

		document.body.appendChild(win);

		// Add some additional query parameters to the URL
		url += "&suppress_response_codes=true&redirect_uri="+encodeURIComponent(_options.redirect_uri) +"&state="+JSON.stringify({callback:callbackID})+
			"&callbackUrl="+encodeURIComponent(_options.redirect_uri)+
			"&redirect-uri="+encodeURIComponent(_options.redirect_uri);

		// if we are just posting a single item
		if( _domInstance('form', data) ){
			// get the parent form
			form = data.form;
			// Loop through and disable all of its siblings
			for( i = 0; i < form.elements.length; i++ ){
				if(form.elements[i] !== data){
					form.elements[i].setAttribute('disabled',true);
				}
			}
			// Move the focus to the form
			data = form;
		}

		// Posting a form
		if( _domInstance('form', data) ){
			// This is a form element
			form = data;

			// Does this form need to be a multipart form?
			for( i = 0; i < form.elements.length; i++ ){
				if(!form.elements[i].disabled && form.elements[i].type === 'file'){
					form.encoding = form.enctype = "multipart/form-data";
					form.elements[i].setAttribute('name', 'file');
				}
			}
		}
		else{
			// Its not a form element,
			// Therefore it must be a JSON object of Key=>Value or Key=>Element
			// If anyone of those values are a input type=file we shall shall insert its siblings into the form for which it belongs.
			for(x in data) if(data.hasOwnProperty(x)){
				// is this an input Element?
				if( _domInstance('input', data[x]) && data[x].type === 'file' ){
					form = data[x].form;
					form.encoding = form.enctype = "multipart/form-data";
				}
			}

			// Do If there is no defined form element, lets create one.
			if(!form){
				// Build form
				form = document.createElement('form');
				document.body.appendChild(form);
				newform = form;
			}

			// Add elements to the form if they dont exist
			for(x in data) if(data.hasOwnProperty(x)){

				// Is this an element?
				var el = ( _domInstance('input', data[x]) || _domInstance('textArea', data[x]) || _domInstance('select', data[x]) );

				// is this not an input element, or one that exists outside the form.
				if( !el || data[x].form !== form ){

					// Does an element have the same name?
					if(form.elements[x]){
						// Remove it.
						form.elements[x].parentNode.removeChild(form.elements[x]);
					}

					// Create an input element
					var input = document.createElement('input');
					input.setAttribute('name', x);

					// Does it have a value attribute?
					if(el){
						input.value = data[x].value;
					}
					else if( _domInstance(null, data[x]) ){
						input.value = data[x].innerHTML || data[x].innerText;
					}else{
						input.value = data[x];
					}

					form.appendChild(input);
				}
				// it is an element, which exists within the form, but the name is wrong
				else if( el && data[x].name !== x){
					data[x].setAttribute('name', x);
					data[x].name = x;
				}
			}

			// Disable elements from within the form if they weren't specified
			for(i=0;i<form.children.length;i++){
				// Does the same name and value exist in the parent
				if( !( form.children[i].name in data ) && form.children[i].getAttribute('disabled') !== true ) {
					// disable
					form.children[i].setAttribute('disabled',true);
					// add re-enable to callback
					reenableAfterSubmit.push(form.children[i]);
				}
			}
		}


		// Set the target of the form
		form.setAttribute('method', 'POST');
		form.setAttribute('action', url);
		form.setAttribute('target', callbackID);
		form.target = callbackID;

		// Submit the form
		setTimeout(function(){
			form.submit();
		},100);

		// Build an iFrame and inject it into the DOM
		//var ifm = _append('iframe',{id:'_'+Math.round(Math.random()*1e9), style:shy});
		
		// Build an HTML form, with a target attribute as the ID of the iFrame, and inject it into the DOM.
		//var frm = _append('form',{ method: 'post', action: uri, target: ifm.id, style:shy});

		// _append('input',{ name: x, value: data[x] }, frm);
	}


	//
	// Some of the providers require that only MultiPart is used with non-binary forms.
	// This function checks whether the form contains binary data
	function _hasBinary(data){
		for(var x in data ) if(data.hasOwnProperty(x)){
			if( (_domInstance('input', data[x]) && data[x].type === 'file')	||
				("FileList" in window && data[x] instanceof window.FileList) ||
				("File" in window && data[x] instanceof window.File) ||
				("Blob" in window && data[x] instanceof window.Blob)
			){
				return true;
			}
		}
		return false;
	}

	//
	// dataToJSON
	// This takes a FormElement and converts it to a JSON object
	//
	function _dataToJSON(p){

		var data = p.data;

		// Is data a form object
		if( _domInstance('form', data) ){
			// Get the first FormElement Item if its an type=file
			var kids = data.elements;

			var json = {};

			// Create a data string
			for(var i=0;i<kids.length;i++){

				// Is this a file, does the browser not support 'files' and 'FormData'?
				if( kids[i].type === 'file' ){
					// the browser does not XHR2
					if("FormData" in window){
						// include the whole element
						json[kids[i].name] = kids[i];
						break;
					}
					else if( !("files" in kids[i]) ){
						return false;
					}
				}
				else{
					json[ kids[i].name ] = kids[i].value || kids[i].innerHTML;
				}
			}

			// Convert to a postable querystring
			data = json;
		}

		// Is this a form input element?
		if( _domInstance('input', data) ){
			// Get the Input Element
			// Do we have a Blob data?
			if("files" in data){

				var o = {};
				o[ data.name ] = data.files;
				// Turn it into a FileList
				data = o;
			}
			else{
				// This is old school, we have to perform the FORM + IFRAME + HASHTAG hack
				return false;
			}
		}

		// Is data a blob, File, FileList?
		if( ("File" in window && data instanceof window.File) ||
			("Blob" in window && data instanceof window.Blob) ||
			("FileList" in window && data instanceof window.FileList) ){

			// Convert to a JSON object
			data = {'file' : data};
		}

		// Loop through data if its not FormData it must now be a JSON object
		if( !( "FormData" in window && data instanceof window.FormData ) ){

			// Loop through the object
			for(var x in data) if(data.hasOwnProperty(x)){

				// FileList Object?
				if("FileList" in window && data[x] instanceof window.FileList){
					// Get first record only
					if(data[x].length===1){
						data[x] = data[x][0];
					}
					else{
						log("We were expecting the FileList to contain one file");
					}
				}
				else if( _domInstance('input', data[x]) && data[x].type === 'file' ){

					if( ( "files" in data[x] ) ){
						// this supports HTML5
						// do nothing
					}
					else{
						// this does not support HTML5 forms FileList
						return false;
					}
				}
				else if( _domInstance('input', data[x]) ||
					_domInstance('select', data[x]) ||
					_domInstance('textArea', data[x])
					){
					data[x] = data[x].value;
				}
				else if( _domInstance(null, data[x]) ){
					data[x] = data[x].innerHTML || data[x].innerText;
				}
			}
		}

		// Data has been converted to JSON.
		p.data = data;

		return true;
	}

})();




//
// GOOGLE API
//
(function(){

	// Format
	// Ensure each record contains a name, id etc.
	function formatItem(o){
		if(o.error){
			return;
		}
		if(!o.name){
			o.name = o.title || o.message || o.message;
		}
		if(!o.picture){
			o.picture = o.thumbnailLink;
		}
		if(!o.thumbnail){
			o.thumbnail = o.thumbnailLink;
		}
		if(o.mimeType === "application/vnd.google-apps.folder"){
			o.type = "folder";
			o.files = "https://www.googleapis.com/drive/v2/files?q=%22"+o.id+"%22+in+parents";
		}
	}

	// Google has a horrible JSON API
	function gEntry(o){

		var entry = function(a){
			var i=0, _a;
			var p = {
				id		: a.id.$t,
				name	: a.title.$t,
				description	: a.summary.$t,
				updated_time : a.updated.$t,
				created_time : a.published.$t,
				picture : a['media$group']['media$content'][0].url,
				thumbnail : a['media$group']['media$content'][0].url,
				width : a['media$group']['media$content'][0].width,
				height : a['media$group']['media$content'][0].height
//				original : a
			};
			// Get feed/children
			if("link" in a){
				for(i=0;i<a.link.length;i++){
					if(a.link[i].rel.match(/\#feed$/)){
						p.photos = a.link[i].href;
						p.files = a.link[i].href;
						p.upload_location = a.link[i].href;
						break;
					}
				}
			}

			// Get images of different scales
			if('category' in a&&a['category'].length){
				_a  = a['category'];
				for(i=0;i<_a.length;i++){
					if(_a[i].scheme&&_a[i].scheme.match(/\#kind$/)){
						p.type = _a[i].term.replace(/^.*?\#/,'');
					}
				}
			}

			// Get images of different scales
			if('media$thumbnail' in a['media$group']){
				_a = a['media$group']['media$thumbnail'];
				p.thumbnail = a['media$group']['media$thumbnail'][0].url;
				p.images = [];
				for(i=0;i<_a.length;i++){
					p.images.push({
						source : _a[i].url,
						width : _a[i].width,
						height : _a[i].height
					});
				}
				p.images.push({
					source : a['media$group']['media$content'][0].url,
					width : a['media$group']['media$content'][0].width,
					height : a['media$group']['media$content'][0].height
				});
			}
			return p;
		};

		var r = [];
		if("feed" in o && "entry" in o.feed){
			for(i=0;i<o.feed.entry.length;i++){
				r.push(entry(o.feed.entry[i]));
			}
			return {
				//name : o.feed.title.$t,
				//updated : o.feed.updated.$t,
				data : r
			};
		}

		// Old style, picasa, etc...
		if( "entry" in o ){
			return entry(o.entry);
		}else if( "items" in o ){
			for(var i=0;i<o.items.length;i++){
				formatItem( o.items[i] );
			}
			return {
				data : o.items
			};
		}
		else{
			formatItem( o );
			return o;
		}
	}



	//
	// Embed
	hello.init({
		google : {
			name : "Google Plus",
			uri : {
				// REF: http://code.google.com/apis/accounts/docs/OAuth2UserAgent.html
				auth : "https://accounts.google.com/o/oauth2/auth",
	//				me	: "plus/v1/people/me?pp=1",
				me : 'oauth2/v1/userinfo?alt=json',
				base : "https://www.googleapis.com/",
				'me/friends' : 'https://www.google.com/m8/feeds/contacts/default/full?alt=json&max-results=1000',
				'me/share' : 'plus/v1/people/me/activities/public',
				'me/feed' : 'plus/v1/people/me/activities/public',
				'me/albums' : 'https://picasaweb.google.com/data/feed/api/user/default?alt=json',
				'me/photos' : 'https://picasaweb.google.com/data/feed/api/user/default?alt=json&kind=photo&max-results=100',
				"me/files" : 'https://www.googleapis.com/drive/v2/files?q=%22root%22+in+parents'
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
				files			: 'https://www.googleapis.com/auth/drive.readonly',
				
				publish			: '',
				publish_files	: 'https://www.googleapis.com/auth/drive',
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
						o.thumbnail = o.picture;
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
								updated_time : a.updated.$t,
								picture : (a.link&&a.link.length>0)?a.link[0].href+'?access_token='+hello.getAuthResponse('google').access_token:null,
								thumbnail : (a.link&&a.link.length>0)?a.link[0].href+'?access_token='+hello.getAuthResponse('google').access_token:null
							});
						}
						return {
							//name : o.feed.title.$t,
							//updated : o.feed.updated.$t,
							data : r
						};
					}
					return o;
				},
				'me/share' : function(o){
					o.data = o.items;
					try{
						delete o.items;
					}catch(e){
						o.items = null;
					}
					return o;
				},
				'me/feed' : function(o){
					o.data = o.items;
					try{
						delete o.items;
					}catch(e){
						o.items = null;
					}
					return o;
				},
				'me/albums' : gEntry,
				'me/photos' : gEntry,
				'default' : gEntry
			},
			xhr : function(p){
				if(p.method==='post'){
	/*					if(p.data.file){
						return {handler: gMultiPart};
					}
	*/
					return false;
				}
				return {};
			}
		}
	});
})();


//
// Windows
hello.init({
	windows : {
		name : 'Windows live',

		uri : {
			// REF: http://msdn.microsoft.com/en-us/library/hh243641.aspx
			auth : 'https://oauth.live.com/authorize',
			base : 'https://apis.live.net/v5.0/',
			"me/share" : function(p,callback){
				// If this is a POST them return
				callback( p.method==='get' ? "me/feed" : "me/share" );
			},
			"me/feed" : function(p,callback){
				// If this is a POST them return
				callback( p.method==='get' ? "me/feed" : "me/share" );
			},
			"me/files" : 'me/skydrive/files'

		},
		scope : {
			basic			: 'wl.signin,wl.basic',
			email			: 'wl.emails',
			birthday		: 'wl.birthday',
			events			: 'wl.calendars',
			photos			: 'wl.photos',
			videos			: 'wl.photos',
			friends			: '',
			files			: 'wl.skydrive',
			
			publish			: 'wl.share',
			publish_files	: 'wl.skydrive_update',
			create_event	: 'wl.calendars_update,wl.events_create',

			offline_access	: 'wl.offline_access'
		},
		wrap : {
			me : function(o){
				if(o.id){
					o.email = (o.emails?o.emails.preferred:null);
					o.picture = 'https://apis.live.net/v5.0/'+o.id+'/picture?access_token='+hello.getAuthResponse('windows').access_token;
					o.thumbnail = 'https://apis.live.net/v5.0/'+o.id+'/picture?access_token='+hello.getAuthResponse('windows').access_token;
				}
				return o;
			},
			'me/friends' : function(o){
				if("data" in o){
					for(var i=0;i<o.data.length;i++){
						o.data[i].picture = 'https://apis.live.net/v5.0/'+o.data[i].id+'/picture?access_token='+hello.getAuthResponse('windows').access_token;
						o.data[i].thumbnail = 'https://apis.live.net/v5.0/'+o.data[i].id+'/picture?access_token='+hello.getAuthResponse('windows').access_token;
					}
				}
				return o;
			},
			'me/albums' : function(o){
				if("data" in o){
					for(var i=0;i<o.data.length;i++){
						o.data[i].photos = 'https://apis.live.net/v5.0/'+o.data[i].id+'/photos';
						o.data[i].files = 'https://apis.live.net/v5.0/'+o.data[i].id+'/photos';
					}
				}
				return o;
			},
			'default' : function(o){
				if("data" in o){
					for(var i=0;i<o.data.length;i++){
						if(o.data[i].picture){
							o.data[i].thumbnail = o.data[i].picture;
						}
					}
				}
				return o;
			}
		},
		xhr : function(p){
			if(p.method==='post'&& !hello.utils.hasBinary(p.data) ){
				p.data = JSON.stringify(p.data);
				return {
					contentType : 'application/json'
				};
			}
			return {};
		},
		jsonp : function(p){
			if( p.method.toLowerCase() !== 'get'){
				//p.data = {data: JSON.stringify(p.data), method: p.method.toLowerCase()};
				p.data.method = p.method.toLowerCase();
				p.method = 'get';
			}
			return p;
		}
	}
});


//
// Facebook
hello.init({
	facebook : {
		name : 'Facebook',

		uri : {
			// REF: http://developers.facebook.com/docs/reference/dialogs/oauth/
			auth : 'http://www.facebook.com/dialog/oauth/',
			base : 'https://graph.facebook.com/',
			'me/share' : 'me/feed',
			'me/files' : 'me/albums'
		},
		scope : {
			basic			: '',
			email			: 'email',
			birthday		: 'user_birthday',
			events			: 'user_events',
			photos			: 'user_photos,user_videos',
			videos			: 'user_photos,user_videos',
			friends			: '',
			files			: 'user_photos,user_videos',
			
			publish_files	: 'user_photos,user_videos,publish_stream',
			publish			: 'publish_stream',
			create_event	: 'create_event',

			offline_access : 'offline_access'
		},
		wrap : {
			me : function(o){
				if(o.id){
					o.picture = 'http://graph.facebook.com/'+o.id+'/picture';
					o.thumbnail = 'http://graph.facebook.com/'+o.id+'/picture';
				}
				return o;
			},
			'me/friends' : function(o){
				if("data" in o){
					for(var i=0;i<o.data.length;i++){
						o.data[i].picture = 'http://graph.facebook.com/'+o.data[i].id+'/picture';
						o.data[i].thumbnail = 'http://graph.facebook.com/'+o.data[i].id+'/picture';
					}
				}
				return o;
			},
			'me/albums' : function(o){
				if("data" in o){
					for(var i=0;i<o.data.length;i++){
						o.data[i].files = 'https://graph.facebook.com/'+o.data[i].id+'/photos';
						o.data[i].photos = 'https://graph.facebook.com/'+o.data[i].id+'/photos';
						if(o.data[i].cover_photo){
							o.data[i].thumbnail = 'https://graph.facebook.com/'+o.data[i].cover_photo+'/picture?access_token='+hello.getAuthResponse('facebook').access_token;
						}
						o.data[i].type = "album";
						if(o.data[i].can_upload){
							o.data[i].upload_location = 'https://graph.facebook.com/'+o.data[i].id+'/photos';
						}
					}
				}
				return o;
			},
			'me/files' : function(o){return this["me/albums"](o);},
			'default' : function(o){
				if("data" in o){
					for(var i=0;i<o.data.length;i++){
						if(o.data[i].picture){
							o.data[i].thumbnail = o.data[i].picture;
						}
						if(o.data[i].cover_photo){
							o.data[i].thumbnail = 'https://graph.facebook.com/'+o.data[i].cover_photo+'/picture?access_token='+hello.getAuthResponse('facebook').access_token;
						}
					}
				}
				return o;
			}
		},

		// special requirements for handling XHR
		xhr : function(p){
			if(p.method==='get'||p.method==='post'){
				return {};
			}
			else{
				return false;
			}
		},

		// Special requirements for handling JSONP fallback
		jsonp : function(p){
			if( p.method.toLowerCase() !== 'get' && !hello.utils.hasBinary(p.data) ){
				p.data.method = p.method.toLowerCase();
				p.method = 'get';
			}
			return p;
		},

		// Special requirements for iframe form hack
		post : function(p){
			return {
				// fire the callback onload
				callbackonload : true
			};
		}
	}
});
