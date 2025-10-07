
# hello.js

[![CDNJS](https://img.shields.io/cdnjs/v/hellojs.svg)](https://cdnjs.com/libraries/hellojs/)

A client-side JavaScript SDK for authenticating with [OAuth2](http://tools.ietf.org/pdf/draft-ietf-oauth-v2-12.pdf) (and **OAuth1** with a [oauth proxy](#oauth-proxy)) web services and querying their REST APIs. HelloJS standardizes paths and responses to common APIs like Google Data Services, Facebook Graph and Windows Live Connect. It's **modular**, so that list is [growing](./modules). No more spaghetti code!


## E.g.

<div id="profile">
<div data-bind="visible:false">See demo at <a href="https://adodson.com/hello.js/">https://adodson.com/hello.js/</a>.</div>
<div data-bind="foreach:networks">
<button data-bind="click:function(){ hello( name ).login();}, attr:{'class': 'zocial icon ' + name, title: 'Sign in to ' + displayName}" title="Sign in"></button>
</div>
<br />
</div>
<p data-bind="visible: hasConnected, text: 'Hey, we got your details, test done! Checkout below to see what else hello.js can do'"></p>

## Try out the next version
The `next` version is a modern rewrite of hellojs, please support this development in the `v2` branch.

	npm i hellojs@next

## Features

Here are some more demos...

<table>
	<thead>
		<tr>
			<th></th>
			<th>Windows</th>
			<th>Facebook</th>
			<th>Google</th>
			<th><a href="#helloapi">More..</a></th>
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



- Items marked with a &#10003; are fully working and can be [tested here](./tests/).
- Items marked with a &#10007; aren't provided by the provider at this time.
- Blank items are a work in progress, but there is good evidence that they can be done.
- I have no knowledge of anything unlisted and would appreciate input.


## Install

Download: [HelloJS](https://github.com/MrSwitch/hello.js/raw/master/dist/hello.all.js) | [HelloJS (minified)](https://github.com/MrSwitch/hello.js/raw/master/dist/hello.all.min.js)

Compiled source, which combines all of the modules, can be obtained from [GitHub](https://github.com/MrSwitch/hello.js/tree/master/dist), and source files can be found in [Source](https://github.com/MrSwitch/hello.js/tree/master/src).

**Note:** Some services require OAuth1 or server-side OAuth2 authorization. In such cases, HelloJS communicates with an [OAuth Proxy](#oauth-proxy).

### NPM

```bash
npm i hellojs
```

At the present time only the bundled files in the `/dist/hello.*` support CommonJS. e.g. `let hello = require('hellojs/dist/hello.all.js')`.

### Bower

```bash
bower install hello
```

The [Bower](http://bower.io/) package shall install the aforementioned "/src" and "/dist" directories. The "/src" directory provides individual modules which can be packaged as desired.



## Help &amp; Support


- [GitHub](https://github.com/MrSwitch/hello.js/issues) for reporting bugs and feature requests.
- [Gitter](https://gitter.im/MrSwitch/hello.js) to reach out for help.
- [Stack Overflow](http://stackoverflow.com/questions/tagged/hello.js) use tag **hello.js**
- [Slides](http://freddy03h.github.io/hello-presentation/#/) by Freddy Harris



## Quick Start
Quick start shows you how to go from zero to loading in the name and picture of a user, like in the demo above.


- [Register your app domain](#1-register)
- [Include hello.js script](#2-include-hellojs-script-in-your-page)
- [Create the sign-in buttons](#3-create-the-signin-buttons)
- [Setup listener for login and retrieve user info](#4-add-listeners-for-the-user-login)
- [Initiate the client_ids and all listeners](#5-configure-hellojs-with-your-client_ids-and-initiate-all-listeners)


### 1. Register

Register your application with at least one of the following networks. Ensure you register the correct domain as they can be quite picky.


- [Facebook](https://developers.facebook.com/apps)
- [Windows Live](https://account.live.com/developers/applications/index)
- [Google+](https://code.google.com/apis/console/b/0/#:access)


### 2. Include Hello.js script in your page

```html
<script src="./dist/hello.all.js"></script>
```

### 3. Create the sign-in buttons
Just add onclick events to call hello(network).login(). Style your buttons as you like; I've used [zocial css](http://zocial.smcllns.com), but there are many other icon sets and fonts.

```html
<button onclick="hello('windows').login()">windows</button>
```

### 4. Add listeners for the user login

Let's define a simple function, which will load a user profile into the page after they sign in and on subsequent page refreshes. Below is our event listener which will listen for a change in the authentication event and make an API call for data.

```javascript
hello.on('auth.login', function(auth) {

	// Call user information, for the given network
	hello(auth.network).api('me').then(function(r) {
		// Inject it into the container
		var label = document.getElementById('profile_' + auth.network);
		if (!label) {
			label = document.createElement('div');
			label.id = 'profile_' + auth.network;
			document.getElementById('profile').appendChild(label);
		}
		label.innerHTML = '<img src="' + r.thumbnail + '" /> Hey ' + r.name;
	});
});
```

### 5. Configure hello.js with your client IDs and initiate all listeners

Now let's wire it up with our registration detail obtained in step 1. By passing a [key:value, ...] list into the `hello.init` function. e.g....

```javascript
hello.init({
	facebook: FACEBOOK_CLIENT_ID,
	windows: WINDOWS_CLIENT_ID,
	google: GOOGLE_CLIENT_ID
}, {redirect_uri: 'redirect.html'});
```

That's it. The code above actually powers the demo at the start so, no excuses.

# Core Methods

## hello.init()

Initiate the environment. And add the application credentials.

### hello.init({facebook: *id*, windows: *id*, google: *id*, ... })

<table>
	<thead>
		<tr>
			<th>name</th>
			<th>type</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>credentials</td>
			<td><i>object( key =&gt; value, ...&nbsp; )</i>
				<table>
					<thead>
						<tr>
							<th>name</th>
							<th>type</th>
							<th>example</th>
							<th>description</th>
							<th>argument</th>
							<th>default</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>key</td>
							<td><i>string</i></td>
							<td><q>windows</q>, <q>facebook</q> or <q>google</q></td>
							<td>App names</td>
							<td><em>required</em></td>
							<td>n/a</td>
						</tr>
						<tr>
							<td>value</td>
							<td><i>string</i></td>
							<td><q>0000000AB1234</q></td>
							<td>ID of the service to connect to</td>
							<td><em>required</em></td>
							<td>n/a</td>
						</tr>
					</tbody>
				</table>
			</td>
		</tr>
		<tr>
			<td>options</td>
			<td>sets default <i>options</i>, as in hello.login()</i></td>
		</tr>
	</tbody>
</table>

### Example:

```js
hello.init({
	facebook: '359288236870',
	windows: '000000004403AD10'
});
```

## hello.login()

<div data-bind="template: { name: 'tests-template', data: { test: $root, filter:'login' } }"></div>

If a network string is provided: A consent window to authenticate with that network will be initiated. Else if no network is provided a prompt to select one of the networks will open. A callback will be executed if the user authenticates and or cancels the authentication flow.

### hello.login([network] [, options] [, callback()])

<table>
	<tr>
		<th>name</th>
		<th>type</th>
		<th>example</th>
		<th>description</th>
		<th>argument</th>
		<th>default</th>
	</tr>
	<tr>
		<td>network</td>
		<td><i>string</i></td>
		<td><q>windows</q>, <q>facebook</q></td>
		<td>One of our services.</td>
		<td><em>required</em></td>
		<td><em>null</em></td>
	</tr>
	<tr>
		<td>options</td>
		<td colspan="5"><i>object</i>
			<table>
				<tr>
					<th>name</th>
					<th>type</th>
					<th>example</th>
					<th>description</th>
					<th>argument</th>
					<th>default</th>
				</tr>
				<tr>
					<td>display</td>
					<td><i>string</i></td>
					<td><q>popup</q>, <q>page</q> or <q>none</q></td>
					<td>"popup" - as the name suggests, "page" - navigates the whole page, "none" - refresh the access_token in the background</td>
					<td><em>optional</em></td>
					<td><q>popup</q></td>
				</tr>
				<tr>
					<td>scope</td>
					<td><i>string</i></td>
					<td><q>email</q>, <q>publish</q> or <q>photos</q></td>
					<td>Comma separated list of <a href="#scope">scopes</a></td>
					<td><em>optional</em></td>
					<td><em>null</em></td></tr>
				<tr>
					<td>redirect_uri</td>
					<td><i>string</i></td>
					<td><q><a href="#redirect-page">Redirect Page</a></q></td>
					<td>
					A full or relative URI of a page which includes this script file hello.js</td>
					<td>
					<em>optional</em></td>
					<td>
					<em>window.location.href</em></td>
				</tr>
				<tr>
					<td>response_type</td>
					<td><i>string</i></td>
					<td><q>token</q>, <q>code</q></td>
					<td>Implicit (token) or Explicit (code) Grant flow</td>
					<td><em>optional</em></td>
					<td><q>token</q></td>
				</tr>
				<tr>
					<td>force</td>
					<td><i>Boolean</i> or <i>null</i></td>
					<td><i>true</i>, <i>false</i> or <i>null</i></td>
					<td>(true) initiate auth flow and prompt for reauthentication where available. (null) initiate auth flow. (false) only prompt auth flow if the scopes have changed or the token expired.</td>
					<td><em>optional</em></td>
					<td><i>null</i></td>
				</tr>
				<tr>
					<td>popup</td>
					<td><i>object</i></td>
					<td>{resizable:1}</td>
					<td>Overrides the <a href="http://www.w3schools.com/jsref/met_win_open.asp">popups specs</a></td>
					<td><em>optional</em></td>
					<td>See <code>hello.settings.popup</code></td>
				</tr>
				<tr>
					<td>state</td>
					<td><i>string</i></td>
					<td><q>ijustsetthis</q></td>
					<td>Honours the state parameter, by storing it within its own state object</td>
					<td><em>optional</em></td>
					<td></td>
				</tr>
			</table>
		</td>
	</tr>
	<tr>
		<td>callback</td>
		<td><i>function</i></td>
		<td><code>function(){alert("Logged in!");}</code></td>
		<td>A callback when the users session has been initiated</td>
		<td><em>optional</em></td>
		<td><em>null</em></td>
	</tr>
</table>

### Examples:

```js
hello('facebook').login().then(function() {
	alert('You are signed in to Facebook');
}, function(e) {
	alert('Signin error: ' + e.error.message);
});
```

## hello.logout()

<div data-bind="template: { name: 'tests-template', data: { test: $root, filter: 'logout' } }"></div>

Remove all sessions or individual session.

### hello.logout([network] [, options] [, callback()])

<table>
	<tr>
		<th>name</th>
		<th>type</th>
		<th>example</th>
		<th>description</th>
		<th>argument</th>
		<th>default</th>
	</tr>
	<tr>
		<td>network</td>
		<td><i>string</i></td>
		<td>
			<q>windows</q>,
			<q>facebook</q>
		</td>
		<td>One of our services.</td>
		<td>
			<em>optional</em>
		</td>
		<td>
			<em>null</em>
		</td>
	</tr>
	<tr>
		<td>options</td>
		<td colspan="5"><i>object</i>
			<table>
				<tr>
					<th>name</th>
					<th>type</th>
					<th>example</th>
					<th>description</th>
					<th>argument</th>
					<th>default</th>
				</tr>
				<tr>
					<td>force</td>
					<td><i>boolean</i></td>
					<td><i>true</i></td>
					<td>If set to true, the user will be logged out of the providers site as well as the local application. By default the user will still be signed into the providers site.</td>
					<td>
						<em>optional</em>
					</td>
					<td><i>false</i></td>
				</tr>
			</table>
		</td>
	</tr>
	<tr>
		<td>callback</td>
		<td><i>function</i></td>
		<td>
			<code>function() {alert('Logged out!');}
			</code>
		</td>
		<td>
			A callback when the users session has been terminated</td>
		<td>
			<em>optional</em>
		</td>
		<td>
			<em>null</em>
		</td>
	</tr>
</table>

### Example:

```js
hello('facebook').logout().then(function() {
	alert('Signed out');
}, function(e) {
	alert('Signed out error: ' + e.error.message);
});
```

## hello.getAuthResponse()

<div data-bind="template: { name: 'tests-template', data: { test: $root, filter: 'getAuthResponse' } }"></div>

Get the current status of the session. This is a synchronous request and does not validate any session cookie which may have gone expired.

### hello.getAuthResponse(network)

<table>
	<tr>
		<th>name</th>
		<th>type</th>
		<th>example</th>
		<th>description</th>
		<th>argument</th>
		<th>default</th>
	</tr>
	<tr>
		<td>network</td>
		<td><i>string</i></td>
		<td><q>windows</q>, <q>facebook</q></td>
		<td>One of our services.</td>
		<td><em>optional</em></td>
		<td><em>current</em></td>
	</tr>
</table>

### Examples:

```js
var online = function(session) {
	var currentTime = (new Date()).getTime() / 1000;
	return session && session.access_token && session.expires > currentTime;
};

var fb = hello('facebook').getAuthResponse();
var wl = hello('windows').getAuthResponse();

alert((online(fb) ? 'Signed' : 'Not signed') + ' into Facebook, ' + (online(wl) ? 'Signed' : 'Not signed') + ' into Windows Live');
```

## hello.api()

<div data-bind="template: { name: 'tests-template', data: { test: $root, filter:'api' } }"></div>

Make calls to the API for getting and posting data.

### hello.api([path], [method], [data], [callback(json)])

```
hello.api([path], [method], [data], [callback(json)]).then(successHandler, errorHandler)
```

<table>
	<tr>
		<th>name</th>
		<th>type</th>
		<th>example</th>
		<th>description</th>
		<th>argument</th>
		<th>default</th>
	</tr>
	<tr>
		<td>path</td>
		<td><i>string</i></td>
		<td>
			<q>/me</q>,
			<q>/me/friends</q>
		</td>
		<td>A relative path to the modules <code>base</code> URI, a full URI or a mapped path defined by the module - see <a href="https://adodson.com/hello.js#REST API">REST API</a>.</td>
		<td>
			<em>required</em>
		</td>
		<td>null</td>
	</tr>
	<tr>
		<td>query</td>
		<td><i>object</i></td>
		<td>
			<code>{name:<q>Hello</q>}</code>
		</td>
		<td>HTTP query string parameters.</td>
		<td>
			<em>optional</em>
		</td>
		<td>null</td>
	</tr>
	<tr>
		<td>method</td>
		<td>
			<q>get</q>,
			<q>post</q>,
			<q>delete</q>,
			<q>put</q>
		</td>
		<td>See
			<em>type</em>
		</td>
		<td>HTTP request method to use.</td>
		<td>
			<em>optional</em>
		</td>
		<td>
			<q>get</q>
		</td>
	</tr>
	<tr>
		<td>data</td>
		<td><i>object</i></td>
		<td>
			<code>{name:<q>Hello</q>, description:<q>Fandelicious</q>}</code>
		</td>
		<td>
			A JSON object of data, FormData, HTMLInputElement, HTMLFormElment to be sent along with a
			<q>get</q>,
			<q>post</q>or
			<q>put</q>request
		</td>
		<td>
			<em>optional</em>
		</td>
		<td>
			<em>null</em>
		</td>
	</tr>
	<tr>
		<td>timeout</td>
		<td><i>integer</i></td>
		<td>
			<code>3000</code> = 3 seconds.
		</td>
		<td>
			Wait <em>milliseconds</em> before resolving the Promise with a reject.
		</td>
		<td>
			<em>optional</em>
		</td>
		<td>
			<em>60000</em>
		</td>
	</tr>
	<tr>
		<td>callback</td>
		<td><i>function</i></td>
		<td>
			<code>function(json){console.log(json);}</code>
		</td>
		<td>
			A function to call with the body of the response returned in the first parameter as an object, else boolean false.
		</td>
		<td>
			<em>optional</em>
		</td>
		<td>
			<em>null</em>
		</td>
	</tr>
	<tr>
		<td colspan='6'>More options (below) require putting the options into a 'key'=>'value' hash. I.e. <code>hello(network).api(options)</code>
		</td>
	</tr>
	<tr>
		<td>formatResponse</td>
		<td><i>boolean</i></td>
		<td>
			<code>false</code>
		</td>
		<td>
			<code>true</code>: format the response, <code>false</code>: return raw response.
		</td>
		<td>
			<em>optional</em>
		</td>
		<td>
			<em>true</em>
		</td>
	</tr>
</table>

### Examples:

```js
hello('facebook').api('me').then(function(json) {
	alert('Your name is ' + json.name);
}, function(e) {
	alert('Whoops! ' + e.error.message);
});
```

# Event Subscription

Please see [demo of the global events](demos/events.html).

## hello.on()

Bind a callback to an event. The event may be triggered by any change in user state or a change in any detail.

### hello.on(event, callback)

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
			<td>auth.init</td>
			<td>Triggered prior to requesting an authentication flow</td>
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

### Example:

```js
var sessionStart = function() {
	alert('Session has started');
};
hello.on('auth.login', sessionStart);
```

## hello.off()

Remove a callback. Both event name and function must co-exist.

### hello.off(event, callback)

```js
hello.off('auth.login', sessionStart);
```

# Concepts

## Pagination, Limit and Next Page
Responses which are a subset of the total results should provide a `response.paging.next` property. This can be plugged back into `hello.api` in order to get the next page of results.

In the example below the function `paginationExample()` is initially called with `me/friends`. Subsequent calls take the path from `resp.paging.next`.

```js
function paginationExample(path) {
	hello('facebook')
		.api(path, {limit: 1})
		.then(
			function callback(resp) {
				if (resp.paging && resp.paging.next) {
					if (confirm('Got friend ' + resp.data[0].name + '. Get another?')) {
						// Call the API again but with the 'resp.paging.next` path
						paginationExample(resp.paging.next);
					}
				}
				else {
					alert('Got friend ' + resp.data[0].name);
				}
			},
			function() {
				alert('Whoops!');
			}
		);
}

paginationExample('me/friends');
```


## Scope
The scope property defines which privileges an app requires from a network provider. The scope can be defined globally for a session through `hello.init(object, {scope: 'string'})`, or at the point of triggering the auth flow e.g. `hello('network').login({scope: 'string'});`
An app can specify multiple scopes, separated by commas - as in the example below.

```js
hello('facebook').login({
    scope: 'friends, photos, publish'
});
```

Scopes are tightly coupled with API requests. Unauthorized error response from an endpoint will occur if the scope privileges have not been granted. Use the [hello.api reference table](http://adodson.com/hello.js/#helloapi) to explore the API and scopes.

It's considered good practice to limit the use of scopes. The more unnecessary privileges you ask for the more likely users are going to drop off. If your app has many different sections, consider re-authorizing the user with different privileges as they go.

HelloJS modules standardises popular scope names. However you can always use proprietary scopes, e.g. to access google spreadsheets: `hello('google').login({scope: 'https://spreadsheets.google.com/feeds'});`

<div data-bind="template: { name: 'tests-template', data: { test: $root, filter:'scope' } }">See <a href="http://adodson.com/hello.js/#scope">Scope</a> for standardised scopes.</div>

## Redirect Page
Providers of the OAuth1/2 authorization flow must respect a Redirect URI parameter in the authorization request (also known as a Callback URL). E.g. `...&redirect_uri=http://mydomain.com/redirect.html&...`

The `redirect_uri` is always a full URL. It must point to a Redirect document which will process the authorization response and set user session data. In order for an application to communicate with this document and set the session data, the origin of the document must match that of the application - this restriction is known as the same-origin security policy.

A successful authorisation response will append the user credentials to the Redirect URI. e.g. `?access_token=12312&amp;expires_in=3600`. The Redirect document is responsible for interpreting the request and setting the session data.

### Create a Redirect Page and URI

In HelloJS the default value of `redirect_uri` is the current page. However its recommended that you explicitly set the `redirect_uri` to a dedicated page with minimal UI and page weight.

Create an HTML page on your site which will be your redirect document. Include the HelloJS script e.g...

```html
<!doctype html>
<script src="./hello.js"></script>;
```

Do add css animations incase there is a wait. **View Source** on [./redirect.html](./redirect.html) for an example.

Then within your application script where you initiate HelloJS, define the Redirect URI to point to this page. e.g.

```js
hello.init({
	facebook:client_id
}, {
	redirect_uri: '/redirect.html'
});
```

Please note: The `redirect_uri` example above in `hello.init` is relative, it will be turned into an absolute path by HelloJS before being used.

## Error Handling

Errors are returned i.e. `hello.api([path]).then(null, [*errorHandler*])` - alternatively `hello.api([path], [*handleSuccessOrError*])`.

The [Promise](#promises-a) response standardizes the binding of error handlers.

### Error Object

The first parameter of a failed request to the *errorHandler* may be either *boolean (false)* or be an **Error Object**...

<table>
	<thead>
		<tr>
			<th>name</th>
			<th>type</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>error</td>
			<td><i>object</i>
				<table>
					<thead>
						<tr>
							<th>name</th>
							<th>type</th>
							<th>example</th>
							<th>description</th>
							<th>argument</th>
							<th>default</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>code</td>
							<td><i>string</i></td>
							<td>
								<q>request_token_unauthorized</q>
							</td>
							<td>Code</td>
							<td>
								<em>required</em>
							</td>
							<td>n/a</td>
						</tr>
						<tr>
							<td>message</td>
							<td><i>string</i></td>
							<td class="auto-style2">The provided access token....</td>
							<td>
								Error message</td>
							<td>
								<em>required</em>
							</td>
							<td>n/a</td>
						</tr>
					</tbody>
				</table>
			</td>
		</tr>
	</tbody>
</table>


## Extending the services
Services are added to HelloJS as "modules" for more information about creating your own modules and examples, go to [Modules](./modules)

## OAuth Proxy

<div data-bind="template: { name: 'tests-template', data: { test: $root, filter: 'oauth' } }">
A list of the service providers OAuth* mechanisms is available at <a href="http://adodson.com/hello.js/#oauth-proxy">Provider OAuth Mechanisms</a>
</div>

For providers which support only OAuth1 or OAuth2 with Explicit Grant, the authentication flow needs to be signed with a secret key that may not be exposed in the browser. HelloJS gets round this problem by the use of an intermediary webservice defined by `oauth_proxy`. This service looks up the secret from a database and performs the handshake required to provision an `access_token`. In the case of OAuth1, the webservice also signs subsequent API requests.


**Quick start:** Register your Client ID and secret at the OAuth Proxy service, [Register your App](https://auth-server.herokuapp.com/)


The default proxy service is [https://auth-server.herokuapp.com/](https://auth-server.herokuapp.com/). Developers may add their own network registration Client ID and secret to this service in order to get up and running.
Alternatively recreate this service with [node-oauth-shim](https://npmjs.org/package/oauth-shim). Then override the default `oauth_proxy` in HelloJS client script in `hello.init`, like so...

```javascript
hello.init(
	CLIENT_IDS,
	{
		oauth_proxy: 'https://auth-server.herokuapp.com/proxy'
	}
)
```

### Enforce Explicit Grant

Enforcing the OAuth2 Explicit Grant is done by setting `response_type=code` in [hello.login](#hellologin) options - or globally in [hello.init](#helloinit) options. E.g...

```javascript
hello(network).login({
	response_type: 'code'
});
```

## Refresh Access Token

Access tokens provided by services are generally short lived - typically 1 hour. Some providers allow for the token to be refreshed in the background after expiry.

<div data-bind="template: { name: 'tests-template', data: { test: $root, filter:'refresh' } }">A list of services which enable silent authentication after the Implicit Grant signin <a href="http://adodson.com/hello.js/#refresh-access-token">Refresh access_token</a>
</div>

Unlike Implicit grant; Explicit grant may return the `refresh_token`. HelloJS honors the OAuth2 refresh_token, and will also request a new access_token once it has expired.


### Bulletproof Requests

A good way to design your app is to trigger requests through a user action, you can then test for a valid access token prior to making the API request with a potentially expired token.

```javascript
var google = hello('google');
// Set force to false, to avoid triggering the OAuth flow if there is an unexpired access_token available.
google.login({force: false}).then(function() {
	google.api('me').then(handler);
});
```

## Promises A+

The response from the async methods `hello.login`, `hello.logout` and `hello.api` return a thenable method which is Promise A+ compatible.

For a demo, or, if you're bundling up the library from `src/*` files, then please checkout [Promises](demos/promises.html)

## Browser Support

HelloJS targets all modern browsers.

Polyfills are included in `src/hello.polyfill.js` this is to bring older browsers upto date. If you're using the resources located in `dist/` this is already bundled in. But if you're building from source you might like to first determine whether these polyfills are required, or if you're already supporting them etc...

## PhoneGap Support

HelloJS can also be run on PhoneGap applications. Checkout the demo [hellojs-phonegap-demo](https://github.com/MrSwitch/hellojs-phonegap-demo)

## Chrome Apps

**Demo** [hellojs-chromeapp-demo](https://github.com/MrSwitch/hellojs-chromeapp-demo)

HelloJS module [src/hello.chromeapp.js](./src/hello.chromeapp.js) (also bundled in dist/*) shims the library to support the unique API's of the Chrome App environment (or Chrome Extension).


### Chrome manifest.json prerequisites

The `manifest.json` file must have the following permissions...

```json
	"permissions": [
	    "identity",
	    "storage",
	    "https://*/"
	],
```

# Credits

HelloJS relies on these fantastic services for it's development and deployment, without which it would still be kicking around in a cave - not evolving very fast.

- [BrowserStack](https://www.browserstack.com/) for providing a means to test across multiple devices.


## Can I contribute?

Yes, yes you can. In fact this isn't really free software, it comes with bugs and documentation errors. Moreover it tracks third party API's which just won't sit still. And it's intended for everyone to understand, so if you dont understand something then it's not fulfilling it's goal.

... otherwise give it a [star](https://github.com/MrSwitch/hello.js).


### Changing Code?
Ensure you setup and test your code on a variety of browsers.

```bash
# Using Node.js on your dev environment
# cd into the project root and install dev dependencies
npm install -l

# Install the grunt CLI (if you haven't already)
sudo npm install -g grunt-cli

# Run the tests
grunt test

# Run the tests in the browser...

# 1. In project root create local web server e.g.
python -m SimpleHTTPServer

# 2. Then open the following URL in your web browser:
# http://localhost:8000/tests/specs/index.html
```

