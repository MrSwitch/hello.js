---
title: HelloJs Modules
layout: default
---

<link rel="source" href="modules.md"/>


# HelloJS Modules

HelloJS is extensible, i.e. you can add new services to it as long as you can get your head around the important parts.

> A module defines a providers Authorisation and RESTful endpoints. It translates the API's nuances for the provider to closely match those of its peers with similar features.


## HelloJS already has you connected

The table shows the services which are already documented on HelloJS. Simply include these scripts in your page after your HelloJS script tag.


<table>
	<thead>
		<tr>
			<th>module</th>
			<th>demo</th>
			<th>credits</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td><a href="./src/modules/box.js">box.js</a></td>
			<td><a href="demos/box.html">Box.com demo</a></td>
			<td></td>
		</tr>
		<tr>
			<td><a href="./src/modules/bikeindex.js">bikeindex.js</a></td>
			<td><a href="demos/bikeindex.html">Bike Index demo</a></td>
			<td></td>
	    </tr>
		<tr>
			<td><a href="./src/modules/dropbox.js">dropbox.js</a></td>
			<td><a href="demos/dropbox.html">Dropbox demo</a></td>
			<td></td>
		</tr>
		<tr>
			<td><a href="./src/modules/facebook.js">facebook.js</a></td>
			<td></td>
			<td></td>
		</tr>
		<tr>
			<td><a href="./src/modules/foursquare.js">foursquare.js</a></td>
			<td><a href="demos/foursquare.html">Foursquare demo</a></td>
			<td></td>
		</tr>
		<tr>
			<td><a href="./src/modules/flickr.js">flickr.js</a></td>
			<td><a href="demos/flickr.html">Flickr demo</a></td>
			<td></td>
		</tr>
		<tr>
			<td><a href="./src/modules/github.js">github.js</a></td>
			<td><a href="demos/github.html">GitHub demo</a></td>
			<td></td>
		</tr>
		<tr>
			<td><a href="./src/modules/google.js">google.js</a></td>
			<td><a href="demos/google.html">Google+ demo</a></td>
			<td></td>
		</tr>
		<tr>
			<td><a href="./src/modules/instagram.js">instagram.js</a></td>
			<td><a href="demos/instagram.html">Instagram demo</a></td>
			<td></td>
		</tr>
		<tr>
			<td><a href="./src/modules/joinme.js">joinme.js</a></td>
			<td><a href="demos/joinme.html">join.me demo</a></td>
			<td></td>
		</tr>
		<tr>
			<td><a href="./src/modules/linkedin.js">linkedin.js</a></td>
			<td><a href="demos/linkedin.html">LinkedIn demo</a></td>
			<td></td>
		</tr>
		<tr>
			<td><a href="./src/modules/soundcloud.js">soundcloud.js</a></td>
			<td><a href="demos/soundcloud.html">SoundCloud demo</a></td>
			<td></td>
		</tr>
		<tr>
			<td><a href="./src/modules/tumblr.js">tumblr.js</a></td>
			<td><a href="demos/tumblr.html">Tumblr demo</a></td>
			<td></td>
		</tr>
		<tr>
			<td><a href="./src/modules/twitter.js">twitter.js</a></td>
			<td><a href="demos/twitter.html">Twitter demo</a></td>
			<td></td>
		</tr>
		<tr>
			<td><a href="./src/modules/vk.js">vk.js</a></td>
			<td></td>
			<td></td>
		</tr>
		<tr>
			<td><a href="./src/modules/windows.js">windows.js</a></td>
			<td></td>
			<td></td>
		</tr>
		<tr>
			<td><a href="./src/modules/yahoo.js">yahoo.js</a></td>
			<td><a href="demos/yahoo.html">Yahoo demo</a></td>
			<td></td>
		</tr>
	</tbody>
</table>

## Writing your own module

Modules are loaded into HelloJS using the hello.init() method, with a JSON object that has the name of the service as the only key and then whose value consists of an object with the following properties.

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
			<td>oauth</td>
			<td colspan="3">
				<i>Object</i>
				<table>
					<thead><tr><th>name</th><th>type</th><th>description</th></tr></thead>
					<tbody>
						<tr>
							<td>version</td>
							<td>string</td>
							<td>Version of OAuth, <q>1.0</q>, <q>1.0a</q>, <q>2</q></td>
						</tr>
						<tr>
							<td>request</td>
							<td>url</td>
							<td>Path of the first leg of OAuth 1</td>
						</tr>
						<tr>
							<td>auth</td>
							<td>url</td>
							<td>Path of the authorization URL, second leg of OAuth 1</td>
						</tr>
						<tr>
							<td>token</td>
							<td>url</td>
							<td>Path to get the Access token, OAuth 1 only, third leg of flow</td>
						</tr>
						<tr>
							<td>grant</td>
							<td>url</td>
							<td>Path to get the Access token, OAuth2 only</td>
						</tr>
						<tr>
							<td>response_type</td>
							<td>string</td>
							<td>Implicit (token) or Explicit (code) Grant flow</td>
						</tr>
					</tbody>
				</table>
			</td>
			<td>required</td>
			<td></td>
		</tr>
		<tr>
			<td>login</td>
			<td><i>function</i></td>
			<td></td>
			<td>A function to augment the login request.</td>
			<td>optional</td>
			<td></td>
		</tr>
		<tr>
			<td>refresh</td>
			<td><i>Boolean</i></td>
			<td></td>
			<td>Indicate that the providers supports silent signin, aka display=none, however if a refresh_token was proffered at signin, then an attempt will be made with that.</td>
			<td>optional</td>
			<td>false</td>
		</tr>
		<tr>
			<td>scope</td>
			<td><i>Object</i></td>
			<td></td>
			<td>A dictionary of key and value (the providers sudonym or name of comparative scope)</td>
			<td>optional</td>
			<td></td>
		</tr>
		<tr>
			<td>scope_delim</td>
			<td><q>string</q></td>
			<td><q>,</q>, <q> </q></td>
			<td>Overrides the default delmiter between multiple scopes</td>
			<td>optional</td>
			<td><q>,</q></td>
		</tr>
		<tr>
			<td>base</td>
			<td><q>url</q></td>
			<td></td>
			<td>Prefix for all API requests</td>
			<td>required</td>
			<td></td>
		</tr>
		<tr>
			<td>get,post,put,del</td>
			<td><i>Object</i></td>
			<td></td>
			<td>Map of standardized pathnames to an alternative path, or path rendering function, the key 'default' will be used where the path is unrecognised, see examples</td>
			<td>optional</td>
			<td></td>
		</tr>
		<tr>
			<td>wrap</td>
			<td><i>Object</i></td>
			<td></td>
			<td>Map containing response processing handlers, the key 'default' will be used where the path is unrecognised.</td>
			<td>optional</td>
			<td></td>
		</tr>
		<tr>
			<td>xhr, jsonp, form</td>
			<td><i>function</i></td>
			<td></td>
			<td>A function called if the browser supports the method requests. Use this function to augment the request. Return truthy value to proceed or false to fallback to another method.</td>
			<td>optional</td>
			<td>true</td>
		</tr>
	</tbody>
</table>


## Contributing modules

That would be fantastic if you could. Please make the following updates so its easiy for people to discover and test.

 * Fork the code from GitHub
 * Name your script with the label you want it to be identified with and use this as the key name of module settings above
 * Add your module to tests/hello.all.js
 * Check your script passes the test in as many browsers as you can.
 * Update the list of services above with a name and link, also get credit for your hard work by including your name
