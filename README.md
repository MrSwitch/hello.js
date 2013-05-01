


# hello.js

A client-side Javascript SDK for authenticating with [OAuth2](http://tools.ietf.org/pdf/draft-ietf-oauth-v2-12.pdf) (and OAuth1 with a [oauth proxy](#oauth-proxy)) web services and querying their REST API's. HelloJS Standardizes paths and responses to common API's like Google Data Services, Facebook Graph and Windows Live Connect. Its modular so that list is [growing](modules.html). No more spaghetti code! 




## Features

Looking for more? HelloJS supports a lot more actions than just getting the users profile. Like, matching users with a users social friends list, sharing events with the users social streams, accessing and playing around with a users photos. Lets see if these whet your appetite ...

<table>
	<thead>
		<tr>
			<th></th>
			<th>Windows</th>
			<th>FaceBook</th>
			<th>Google</th>
			<th><a href="tests/">More..</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<th class="method get"><a href="demos/profile.html">Profile: name, picture (email)</a></th>
			<td>&#10003;</td>
			<td>&#10003;</td>
			<td>&#10003;</td>
		</tr>
		<tr>
			<th class="method get"><a href="demos/friends.html">Friends/Contacts: name, id (email)</a></th>
			<td>&#10003;</td>
			<td>&#10003;</td>
			<td>&#10003;</td>
		</tr>
		<tr>
			<th class="method get">Albums, name, id, web link</th>
			<td>&#10003;</td>
			<td>&#10003;</td>
			<td>&#10003;</td>
		</tr>
		<tr>
			<th class="method get"><a href="demos/albums.html">Photos in albums, names, links</a></th>
			<td>&#10003;</td>
			<td>&#10003;</td>
			<td>&#10003;</td>
		</tr>
		<tr>
			<th class="method get">Photo file: url, dimensions</th>
			<td>&#10003;</td>
			<td>&#10003;</td>
			<td>&#10003;</td>
		</tr>
		<tr>
			<th class="method post">Create a new album</th>
			<td>&#10003;</td>
			<td>&#10003;</td>
			<td></td>
		</tr>
		<tr>
			<th class="method post"><a href="demos/upload.html">Upload a photo</a></th>
			<td>&#10003;</td>
			<td>&#10003;</td>
			<td></td>
		</tr>
		<tr>
			<th class="method delete">Delete an album</th>
			<td>&#10003;</td>
			<td>&#10007;</td>
			<td></td>
		</tr>
		<tr>
			<th class="method get"><a href="demos/activities.html">Status updates</a></th>
			<td>&#10007;</td>
			<td>&#10003;</td>
			<td>&#10003;</td>
		</tr>
		<tr>
			<th class="method post"><a href="demos/share.html">Update Status</a></th>
			<td>&#10003;</td>
			<td>&#10003;</td>
			<td>&#10007;</td>
		</tr>
	</tbody>
</table>



Items marked with a &#10003; are fully working and can be [tested here](./tests/). 
Items marked with a &#10007; aren't provided by the provider at this time. 
Blank items are work in progress, but there is good evidence that they can be done.
Anything not listed i have no knowledge of and would appreciate input.






## Quick Start
Quick start shows you how to go from zero to loading in the name and picture of a user, like in the demo above.

Register your app domain
Include hello.js script 
Create the signin buttons
Setup listener for login and retrieve user info.
Initiate the client_ids and all listeners


### 1. Register

Register your application with atleast one of the following networks. Ensure you register the correct domain as they can be quite picky


<!-- 
- [Windows Live](http://msdn.microsoft.com/en-us/library/hh243641.aspx)
- [Google+](http://code.google.com/apis/accounts/docs/OAuth2UserAgent.html)
- [FaceBook](http://developers.facebook.com/docs/reference/dialogs/oauth/)
-->
- [FaceBook](https://developers.facebook.com/apps)
- [Windows Live](https://manage.dev.live.com/)
- [Google +](https://code.google.com/apis/console/b/0/#:access)


### 2. Include Hello.js script in your page

	<script class="pre" src="./dist/hello.all.min.js"></script>

### 3. Create the signin buttons
Just add onclick events to call hello.login(network). Style your buttons as you like, i've used [zocial css](http://zocial.smcllns.com), but there are many other icon sets and fonts


	&lt;button onclick="hello.login('windows')"&gt;windows&lt;/button&gt;



### 4. Add listeners for the user login

Lets define a simple function, which will load a user profile into the page after they signin and on subsequent page refreshes. Below is our event listener which will listen for a change in the authentication event and make an API call for data.



	hello.subscribe('auth.login', function(auth){
		
		// call user information, for the given network
		hello.api( auth.network + '/me', function(r){
			if(!r.id || !!document.getElementById(r.id) ){
				return;
			}
			var target = document.getElementById("profile_"+ auth.network );
			target.innerHTML = '<img src="'+ r.picture +'" /> Hey '+r.name;

		});
	});


### 5. Configure hello.js with your client_id's and initiate all listeners

Now let's wire it up with our registration detail obtained in step 1. By passing a [key:value, ...] list into the hello.init function. e.g....


	hello.init({ 
		facebook : FACEBOOK_CLIENT_ID,
		windows  : WINDOWS_CLIENT_ID,
		google   : GOOGLE_CLIENT_ID
	},{redirect_uri:'redirect.html'});


That's it. The code above actually powers the demo at the start so, no excuses.


## Core Methods

### hello.init()

Initiate the environment. And add the application credentials 

hello.init( {facebook: id, windows: id, google: id, 
.... } )

<table>
	<thead>
	<tr><th>name</th><th>type</th></tr>
	</thead>
	<tbody>
		<tr><td>credentials</td><td>
	<i>object( key =&gt; value, ...&nbsp; )</i>
	<table>
		<thead>
		<tr><th>name</th><th>type</th><th>example</th><th>description</th><th>
			argument</th><th>default</th></tr>
		</thead>
		<tbody>
		<tr><td>key</td><td><i>string</i></td><td><q>windows</q>, <q>facebook</q> or <q>google</q></td><td>
			App name&#39;s</td><td><em>required</em></td><td>n/a</td></tr>
		<tr><td>value</td><td><i>string</i></td><td>
			<q>0000000AB1234</q></td><td>ID of the service to connect to</td><td>
			<em>required</em></td><td>n/a</td></tr>
		</tbody>
	</table>
	</td></tr>
	<tr><td>options</td><td>
	set's default <i>options</i>, as in hello.login()</i>
	</td></tr>
	</tbody>
</table>

#### Example:


	hello.init({
		facebook : '359288236870',
		windows : '000000004403AD10'
	});


### hello.login()

If a network string is provided: A consent window to authenticate with that network will be initiated. Else if no network is provided a prompt to select one of the networks will open. A callback will be executed if the user authenticates and or cancels the authentication flow.

#### hello.login( [network] [,options] [, callback() ] )

<table>
	<tr><th>name</th><th>type</th><th>example</th><th>description</th><th>
		argument</th><th>default</th></tr>
	<tr><td>network</td><td><i>string</i></td><td><q>windows</q>, <q>facebook</q></td><td>One of our services.</td><td>
		<em>required</em></td><td>
		<em>null</em></td></tr>
	<tr><td>options</td><td colspan="5">
		<i>object</i>
		<table>
			<tr><th>name</th><th>type</th><th>example</th><th>description</th><th>
				argument</th><th>default</th></tr>
			<tr><td>display</td><td><i>string</i></td><td><q>popup</q>, <q>page</q> or <q>none</q></td><td>
				How the signin flow should work, "none" is used to refresh the access_token in the background</td><td>
				<em>optional</em></td><td>
				<q>popup</q></td></tr>
			<tr><td>scope</td><td><i>string</i></td><td><q>email</q>, <q>publish</q> or <q>photos</q></td><td>
				Comma separated list of scopes</td><td>
				<em>optional</em></td><td>
				<em>null</em></td></tr>
			<tr><td>redirect_uri</td><td><i>string</i></td><td><q>http://domain.com/hello.html</q></td><td>
				A full URI of a page which includes this script file hello.js</td><td>
				<em>optional</em></td><td>
				<em>window.location.href</em></td></tr>
			<tr><td>response_type</td><td><i>string</i></td><td><q>token</q>, <q>code</q></td><td>
				Mechanism for authentication</td><td>
				<em>optional</em></td><td>
				<q>token</q></td></tr>
		</table>
	<tr><td>callback</td><td><i>function</i></td><td><code>function(){alert(&quot;Logged 
		in!&quot;);}</code></td><td>
		A callback when the users session has been initiated</td><td>
		<em>optional</em></td><td>
		<em>null</em></td></tr>
	</td></tr>
</table>

#### Examples:


	hello.login(&#39;facebook&#39;, function(){
		alert("You are signed in to Facebook");
	});


### hello.logout()

Remove all sessions or individual sessions.

#### hello.logout( [network] [, callback() ] )

<table>
	<tr><th>name</th><th>type</th><th>example</th><th>description</th><th>
		argument</th><th>default</th></tr>
	<tr><td>network</td><td><i>string</i></td><td><q>windows</q>, <q>facebook</q></td><td>One of our services.</td><td>
		<em>optional</em></td><td>
		<em>null</em></td></tr>
	<tr><td>callback</td><td><i>function</i></td><td><code>function(){alert(&quot;Logged 
		in!&quot;);}</code></td><td>
		A callback when the users session has been initiated</td><td>
		<em>optional</em></td><td>
		<em>null</em></td></tr>
</table>

#### Example:


	hello.logout(&#39;facebook&#39;, function(){
		alert("Signed out");
	});


### hello.getAuthResponse()

Get the current status of the session, this is an synchronous request and does not validate any session cookies which may have expired.

#### hello.getAuthResponse( network );

<table>
	<tr><th>name</th><th>type</th><th>example</th><th>description</th><th>
		argument</th><th>default</th></tr>
	<tr><td>network</td><td><i>string</i></td><td><q>windows</q>, <q>facebook</q></td><td>One of our services.</td><td>
		<em>optional</em></td><td>
		<em>current</em></td></tr>
</table>

#### Examples:


	alert((hello.getAuthResponse(&#39;facebook&#39;)?&quot;Signed&quot;:&#39;Not signed&#39;) + &#39; into FaceBook, &#39; +( hello.getAuthResponse(&#39;windows&#39;)?&quot;Signed&quot;:&#39;Not signed&#39;)+&quot;into Windows Live&quot;);



### hello.api()

Make calls to the API for getting and posting data

#### hello.api( [ path ], [ method ], [ data ], [ callback(json) ] )

<table>
	<tr><th>name</th><th>type</th><th>example</th><th>description</th><th>
		argument</th><th>default</th></tr>
	<tr><td>path</td><td><i>string</i></td><td><q>/me</q>, <q>/me/friends</q></td><td>Path or URI of the resource. See <a href="#REST API">REST API</a>, 
		Can be prefixed with the name of the service</td><td>
		<em>required</em></td><td>null</td></tr>
	<tr><td>method</td><td><q>get</q>, <q>post</q>, <q>delete</q>, <q>put</q></td><td>See<em> type</em></td><td>HTTP request method to use. 
		</td><td><em>optional</em></td><td><q>get</q></td></tr>
	<tr><td>data</td><td><i>object</i></td><td><code>{name: <q>Hello</q>, descrition: <q>Fandelicious</q>}</td><td>
		A JSON object of data, FormData, HTMLInputElement, HTMLFormElment to be sent along with a <q>get</q>, <q>post</q> or <q>put</q> request</td><td>
		<em>optional</em></td><td>
		<em>null</em></td></tr>
	<tr><td>callback</td><td><i>function</i></td><td><code>function(json){console.log(json);}</code></td><td>
		A function to call with the body of the response returned in the first 
		parameter as an object, else boolean false</td><td>
		<em>optional</em></td><td>
		<em>null</em></td></tr>
</table>


#### Examples:


	hello.api("me", function(json){
		if(!json||json.error){
			alert("Whoops!");
			return;
		}
		alert("Your name is "+ json.name);
	});


## Event subscription

### hello.subscribe()

Bind a callback to an event. An event maybe triggered by a change in user state or a change in some detail. 

#### hello.subscribe( event, callback );


<table>
	<thead>
		<tr>
			<th>event</th>
			<th>description</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>auth</td>
			<td>Triggered whenever session changes</td>
		</tr>
		<tr>
			<td>auth.login</td>
			<td>Triggered whenever a user logs in</td>
		</tr>
		<tr>
			<td>auth.logout</td>
			<td>Triggered whenever a user logs out</td>
		</tr>
		<tr>
			<td>auth.update</td>
			<td>Triggered whenever a users credentials change</td>
		</tr>
	</tbody>
</table>


#### Example:


	var sessionstart =  function(){
		alert("Session has started");
	};
	hello.subscribe("auth.login",sessionstart);



### hello.unsubscribe()

Remove a callback, both event name and function must exist

#### hello.unsubscribe( event, callback );


	hello.unsubscribe("auth.login",sessionstart);




## Scope and Permissions
Scopes define what services your asking the user to 
grant your app permission to. As you 
can gather these can be quite intrusive so only ask permission for scopes which 
are obvious to your app. You may always 
request more from the user later.




### Update scope settings

The table shows how the providers have different scopes, however HelloJS sync's the names, so you only have to ever know what HelloJS calls them. 

Select the scopes you want to use and update the current session. 

<table>
	<thead>
		<tr><th><code>scope</code></th><th>Facebook</th><th>Windows Live</th><th>Google</th></tr>
	</thead>
	<tbody>
		<tr>
			<th colspan="4"></th>
		</tr>
		<tr>
			<th><em>default</em></th><td>&nbsp;</td><td>wl.signin, wl.basic</td><td>https://www.googleapis.com/auth/plus.me</td>
		</tr>
		<tr>
			<th><input type="checkbox" name="scopes" value="email"/><q>email</q></th><td>email</td><td>wl.emails</td><td></td>
		</tr>
		<tr>
			<th><input type="checkbox" name="scopes" value="birthday"/> <q>birthday</q></th><td>user_birthday</td><td>wl.birthday</td><td></td>
		</tr>
		<tr>
			<th><input type="checkbox" name="scopes" value="events"/> <q>events</q></th><td>user_events</td><td>wl.calenders</td><td></td>
		</tr>
		<tr>
			<th><input type="checkbox" name="scopes" value="photos"/> <q>photos</q></br /><input type="checkbox" name="scopes" value="videos"/> <q>videos</q></th><td>user_photos,user_videos</td><td>wl.photos</td><td></td>
		</tr>
		<tr>
			<th><input type="checkbox" name="scopes" value="friends"/> <q>friends</q></th><td></td><td></td><td>https://www.google.com/m8/feeds</td>
		</tr>
		<tr>
			<th colspan="4"></th>
		</tr>
		<tr>
			<th><input type="checkbox" name="scopes" value="publish"/> <q>publish</q></th><td>publish_streams</td><td>wl.share</td><td></td>
		</tr>
		<tr>
			<th><input type="checkbox" name="scopes" value="create_event"/> <q>create_event</q></th><td>create_event</td><td>wl.calendars_update,wl.events_create</td><td></td>
		</tr>
		<tr>
			<th colspan="4"></th>
		</tr>
		<tr>
			<th><input type="checkbox" name="scopes" value="offline_access"/> <q>offline_access</q></th><td>offline_access</td><td>wl.offline_access</td><td></td>
		</tr>
	</tbody>
</table>


google
facebook
windows





## REST API

### Path Translation

hello.js translates paths if there are common paths across services.

<table>
	<thead>
		<tr><th><code>hello.js</code></th><th>Facebook</th><th>Windows Live</th><th>Google</th></tr>
	</thead>
	<tbody>
		<tr>
			<th><em>OAuth2 endpoint</em></th><td>http://www.facebook.com/dialog/oauth/</td><td>https://oauth.live.com/authorize</td><td>https://accounts.google.com/o/oauth2/auth</td>
		</tr>
		<tr>
			<th><em>REST API base</em></th><td>https://graph.facebook.com/</td><td>https://apis.live.net/v5.0/</td><td>https://www.googleapis.com/</td>
		</tr>
		<tr>
			<th><q>me</q></th><td>me</td><td>me</td><td>plus/v1/people/me?pp=1</td>
		</tr>
		<tr>
			<th><q>me/friends</q></th><td>me/friends</td><td>me/friends</td><td>https://www.google.com/m8/feeds/contacts/default/full?alt=json&max-results=1000</td>
		</tr>
		<tr>
			<th><q>me/share</q></th><td>me/feed</td><td>me/share</td><td>n/a</td>
		</tr>
		<tr>
			<th><q>me/albums</q></th><td>me/albums</td><td>me/albums</td><td>n/a</td>
		</tr>
	</tbody>
</table>


### Paths
These are some of the paths you can use with hello.api( path, callback ).
e.g.
hello.api("me", function(json){console.log(json);})
Below is a REST playground, clicking the paths on the left will return the results on the right



### Play Ground

Windows
FaceBook
Google



e.g...

- /me
- /me/friends
- /me/feed
- /me/home
- /me/photos
- /me/albums
- /me/videos
- /me/events


Runclear [update your scopes and permissions](#scope-and-permissions)





### Error handling

For hello.api([path], [callback]) the first parameter of callback 
upon error will be either boolean (false) or be an error object as 
described below.

#### Error Object

<table>
	<thead>
		<tr><th>name</th><th>type</th></tr>
	</thead>
	<tbody>
	<tr><td>error</td><td><i>object</i>
<table>
	<thead>
	<tr><th>name</th><th>type</th><th>example</th><th>description</th><th>
		argument</th><th>default</th></tr>
	</thead>
	<tbody>
	<tr><td>code</td><td><i>string</i></td><td>
		<q>request_token_unauthorized</q></td><td>Code</td><td>
		<em>required</em></td><td>n/a</td></tr>
	<tr><td>message</td><td><i>string</i></td><td class="auto-style2">The 
		provided access token....</td><td>
		Error message</td><td><em>required</em></td><td>n/a</td></tr>
	</tbody>
</table>



</table>


## Extending the services
Services are added to HelloJS as "modules" for more information about creating your own modules and examples, go to [Modules](./modules.html)

## OAuth Proxy

OAuth 1.0 and OAuth 1.0a require a server side handshake with the secret key. OAuth 1 does not use the redirect_uri to verify the application, unlike OAuth2. Making HelloJS work with OAuth1 therefore requires a proxy server to sign requests.

By default the service uses [http://auth-server.herokuapp.com/](http://auth-server.herokuapp.com/) as its proxy. Developers may add their own network registration AppID/client_id and secret to this service thus supporting OAuth1.0 and OAuth1.0a web services.


## Browser Support

<table>
	<thead>
	<tr>
		<td>Browser</td>
		<th><div class="ie9"></div>IE10</th>
		<th><div class="ie9"></div>IE9</th>
		<th><div class="ie8"></div>IE8</th>
		<th><div class="ie7"></div>IE7</th>
		<th><div class="ff"></div>FF</th>
		<th><div class="cr"></div>CR</th>
		<th><div class="sa"></div>SA</th>
		<th><div class="op"></div>OP</th>
		<th><div class="op"></div>Mob</th>
		<th><div class="op"></div>Mini5</th>
		<th>iOS</th>
		<th>WP 7</th>
	</tr>
	</thead>
	<tbody>
	<tr>
		<th>hello.js</th>
		<td>&#10003;</td>
		<td>&#10003;</td>
		<td>&#10003;</td>
		<td>&#10003;<sup>1,2</sup></td>
		<td>&#10003;</td>
		<td>&#10003;</td>
		<td>&#10003;</td>
		<td>&#10003;</td>
		<td>&#10003;</td>
		<td>&#10003;<sup>3</sup></td>
		<td>&#10003;</td>
		<td>&#10003;<sup>4</sup></td>
	</tr>
	</tbody>
</table>



IE7: Makes beeping sounds whenever the POST, PUT or DELETE methods are 
used - because of the XD, IFrame+Form+hack.
- IE7: Requires JSON.js and localStorage shims
- Opera Mini: Supports inline consent only, i.e. reloads original page.
- WP7: Supports inline consent only, i.e. reloads original page.








