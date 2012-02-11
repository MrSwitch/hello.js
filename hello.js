/**
 * hello.js
 * @author Andrew Dodson
 * @company Knarly
 */

var hello = (function(){

	// JSONP
	var _jsonp_counter = 0;
	
	// Events
	var listeners = {};


	/**
	 * Services
	 */
	var services = {
		google : {
			name : "Google Plus",
			uri : {
				// REF: http://code.google.com/apis/accounts/docs/OAuth2UserAgent.html
				auth : "https://accounts.google.com/o/oauth2/auth?client_id={id}"
					+"&redirect_uri="+encodeURIComponent(window.location.href)
					+"&response_type=token"
					+"&scope=https://www.googleapis.com/auth/plus.me"
					+"&state=google",

				me	: "people/me?pp=1",
				base : "https://www.googleapis.com/plus/v1/",
			},
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
				auth : 'https://oauth.live.com/authorize?client_id={id}'
					+'&response_type=token'
					+'&redirect_uri=' + encodeURIComponent(window.location.href)
					+'&scope=wl.basic'
					+'&state=windows',
				base : 'https://apis.live.net/v5.0/'
			},
			
			wrap : {
				me : function(o){
					if(o.id){
						o.email = (o.emails?o.emails.preferred:null); 
						o.picture = 'https://apis.live.net/v5.0/'+o.id+'/picture?access_token='+hello.getAuthResponse('windows').access_token; 
					}
					return o;
				}
			}
		},
		
		facebook : {
			name : 'Facebook',

			uri : {
				// REF: http://developers.facebook.com/docs/reference/dialogs/oauth/
				auth : 'http://www.facebook.com/dialog/oauth/?client_id={id}'
					+'&response_type=token'
					+'&redirect_uri='+ encodeURIComponent(window.location.href)
					+'&scope=email,offline_access'
					+'&display=popup'
					+'&state=facebook',
				base : 'https://graph.facebook.com/',
			},
			wrap : {
				me : function(o){
					if(o.id){
						o.picture = 'http://graph.facebook.com/'+o.id+'/picture'; 
					}
					return o;
				}
			}
		},
		
		knarly : {
			name : 'Knarly',

			uri : {
				// REF: 
				auth : 'http://knarly.net/oauth?client_id={id}'
					+'&response_type=token'
					+'&redirect_uri='+ encodeURIComponent(window.location.href)
					+'&scope=email'
					+'&display=popup'
					+'&state=knarly',

				base : 'http://knarly.net/api/',
			},
			wrap : {
				
			}
		}
		/*
		,
		twitter : {
			name : 'Twitter',

			uri : {
				// Ref: does not support OAuth2 yet
				auth : 'https://oauth.twitter.com/2/authorize?oauth_callback_url=" + redirect + "&oauth_mode=flow_web_client&oauth_client_identifier=" + appid + "&redirect_uri=" + redirect + "&response_type=token&client_id=" + appid;',
				me : '',
				base : ''
			}		
		}
		*/
	}


	var hello = {
		/**
		 * Service
		 * Get/Set the default service
		 */
		service : function(service){
			if(service){
				return _store( 'sync_service', service );
			}
			return _store( 'sync_service' );
		},

		/**
		 * Define the clientId's for the endpoint services
		 * @param object o, contains a key value pair, service => clientId
		 */
		init : function(o){
			for( var x in o ){
				services[x].id = o[x];
			}

			// Monitor for a change in state and fire
			var _diff = {};
			
			// create monitoring function
			(function self(){

				for(var x in services){
					var session = hello.getAuthResponse(x);
					var evt = '';
					if(_diff[x] === session 
						|| JSON.stringify(_diff[x]) === JSON.stringify(session) ){
						continue;
					}
					else{
						if(!session){
							evt = 'auth.logout.' + x;
						}
						// else if(!_diff[x]){
						else{
							evt = 'auth.login.' + x;
						}
						hello.trigger(evt);
					}
					
					_diff[x] = session;
				}

				setTimeout(self, 1000);
			})();
			
		},

		/**
		 * Login
		 * Using the endpoint defined by services[x].auth we prompt the login
		 * @param string name of the service to connect to
		 * @param callback or boolean, if callback then we trigger this immediatly, otherwise call the service inline
		 */	
		login :  function(s, callback){
			if( typeof(s) === 'string' ){

				var url = services[s].uri.auth.replace(/\{([a-z]+)\}/ig, function(m,v){
					return ( v in services[s] ? services[s][v] : '' );
				});

				if(callback===true){
					window.location = url;
				}
				else{
					// Save the callback until session changes.
					if(callback){
						// pass in a self unsubscribing function
						this.subscribe('auth.login.'+s, function self(){ hello.unsubscribe('auth.login.'+s,self); callback();} );
					}
				
					// Trigger callback
					window.open( 
						url,
						'name', 
						"height=400,width=450,left="+((window.innerWidth-450)/2)+",top="+((window.innerHeight-400)/2)
					);
				}
			}
			else{
				callback = s;
				s = '';
				
				// trigger the default login.
				log('Please specify a service.');
			}
		},
	
	
		/**
		 * Logout
		 * Remove any data associated with a given service
		 * @param string name of the service
		 */
		logout : function(s, callback){
			if(s && _store(s)){
				_store(s,'');
				(callback ? callback() : null);
			}
			else{
				log( s ? s + ' had no session' : 'please specify a service' );
			}
		},

		
		/**
		 * API
		 * @param path		string
		 * @param method	string (optional)
		 * @param data 		object (optional)
		 * @param callback	function (optional)
		 */
		api : function(){
		
			// get arguments
			var p = _arguments({path:'s!', method : 's', data:'o', callback:"f"}, arguments);
			
			p.method = p.method || 'get';
			p.data = p.data || {};
			
			
			p.path = p.path.replace(/^\//,'');
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
			
			// Callback wrapper?
			var callback = (o.wrap && (p.path in o.wrap)) ? function(r){ log(p.path,r); p.callback(o.wrap[p.path](r)); } : p.callback;
	
			// push out to all networks
			if( !(p.path in o.uri) || o.uri[p.path] !== false ){
				var url = o.uri.base+(p.path in o.uri ? o.uri[p.path] : p.path),
					session = this.getAuthResponse(service),
					token = (session?session.access_token:null);
				
				var qs = {
					callback : '?'
				};
				
				if(token){
					qs.access_token = token;
				}

				if( p.method.toLowerCase() !== 'get'){
					p.data = {data: JSON.stringify(p.data), method: p.method.toLowerCase()};
				}

				_jsonp( url + ( url.indexOf('?') > -1 ? "&" : "?" ) + _param(qs)
						, p.data
						, callback );
			}
			else{
				log('The path "'+ p.path +'" is not recognised');
			}
		},
	
	
		/**
		 * getAuthResponse
		 * Returns all the sessions that are subscribed too
		 * @param string optional, name of the service to get information about.
		 */
		getAuthResponse : function(service){
			return _store(service||this.service());
		},
		



		/**
		 * Subscribe to events
		 * @param evt string
		 * @param callback function
		 */
		subscribe : function(evt, callback){

			var p = _arguments({evt:'s!', callback:"f!"}, arguments);

			if(!p){
				return false;
			}
	
			listeners[p.evt] = [p.callback].concat(listeners[p.evt]||[]);

			log("Sub", evt);
		},


		/**
		 * Unsubscribe to events
		 * @param evt string
		 * @param callback function
		 */
		unsubscribe : function(evt, callback){
	

			log('Unsubscribe', evt, callback);

			var p = _arguments({evt:'s!', callback:"f!"}, arguments);

			if(!p){
				return false;
			}
			
			
			for(var i=0;i<listeners[p.evt].length;i++){
				if(listeners[p.evt][i] === callback){
					listeners[p.evt] = listeners[p.evt].splice(i,1);
				};
			}
		},
		
		/**
		 * Trigger
		 * Triggers any subscribed events
		 */
		trigger : function(evt){
			// loop through the events
			log("Trigger", evt, JSON.stringify(listeners));

			for(var x in listeners){
				if( evt.indexOf(x) > -1 ){
					for(var i=0;i<listeners[x].length;i++){
						listeners[x][i].call(this);
					}
				} 
			}
		},
		
		/**
		 * Utilities
		 */
		_param : _param,
		_store : _store
	};
	

	/**
	 * Save session, from redirected authentication
	 * #access_token has come in?
	 */	
	var p = _param(window.location.hash);

	if( p 
		&& ("access_token" in p)
		&& ("state" in p)
		&& p.state in services){

		// Lets use the "state" to assign it to one of our networks
		_store( p.state, {
			access_token : p.access_token, 
			expires_in : parseInt(p.expires_in), 
			expires : ((new Date).getTime()/1e3) + parseInt(p.expires_in)
		});

		// Service
		hello.service( p.state );

		// this is a popup so
		window.close();

		
		log('Trying to close window');

		// Dont execute any more
		// return;
	}


	return hello;
	
	//////////////////////////////////////////////
	//////////////////////////////////////////////
	/////////////////UTILITIES////////////////////
	//////////////////////////////////////////////
	//////////////////////////////////////////////

	/**
	 * Log
	 * [@param,..]
	 */
	function log() {
		if (typeof(console) === 'undefined'||typeof(console.log) === 'undefined') return;
		if (typeof console.log === 'function') {
			console.log.apply(console, arguments); // FF, CHROME, Webkit
		}
		else{
			console.log(Array.prototype.slice.call(arguments)); // IE
		}
	}
	
	/**
	 * Param
	 * Explode/Encode the parameters of an URL string/object
	 * @param string s, String to decode
	 */
	function _param(s){
		var b, 
			a = {},
			m;
		
		if(typeof(s)==='string'){

			m = s.replace(/.*[#\?]/,'').match(/([^=\/\&]+)=([^\/\&]+)/g);
	
			if(m){
				for(i=0;i<m.length;i++){
					b = m[i].split('=');
					a[b[0]] = decodeURIComponent( b[1] );
				}
			}
			return a;
		}
		else {
			var o = s,
				a = [];

			for( var x in o ){
				if( o.hasOwnProperty(x) ){
					a.push( [x, o[x] === '?' ? '?' : encodeURIComponent(o[x]) ].join('=') );
				}
			}

			return a.join('&');
		}
	}
	
	/**
	 * Store
	 */
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

	/**
	 * Args utility
	 * @param o object
	 * @param a arguments
	 */
	function _arguments(o,args){

		var p = {},
			i = 0,
			t = null;

		for(var x in o){

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
		}
		return p;
	}


	/**
	 * Create and Append new Dom elements
	 * @param node string
	 * @param attr object literal
	 * @param dom/string 
	 */
	function _append(node,attr,target){

		var n = typeof(node)==='string' ? document.createElement(node) : node;

		if(typeof(attr)==='object' ){
			if( "tagName" in attr ){
				target = attr;
			}
			else{
				for(var x in attr){
					n[x] = attr[x];
				}
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


	/**
	 * JSONP
	 * Injects a script tag into the dom to be executed and appends a callback function to the window object
	 * TODO: IE triggering a click event to initiate the code, can't repo this apparent bug.
	 */

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
			operafix = create('script',{
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


	/**
	 * Post
	 * Send information to a remote location using the post mechanism
	 * @param string uri path
	 * @param object data, key value data to send
	 * @param function callback, function to execute in response
	 */
	function _post(uri, data, callback){
	
		// Build an iFrame and inject it into the DOM
		
		// Build an HTML form, with a target attribute as the ID of the iFrame, and inject it into the DOM.
		
		// insert into the HTML form all the values
	}

})();