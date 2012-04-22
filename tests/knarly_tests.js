//
// Tests
// An array containing objects
// Each object contains a name, path, method, data, test (callback)
// This executes them equentially
//
var tests = [
{
	section : "Admin",
	aside : 'Initiate an administrator account on a new domain. Create pages with client access levels (shared articles). Create templates for wrapping articles for email and web.'
},
	{
		name : 'Create the first account (Admin)',
		path : 'knarly',
		note : 'The first account created is assigned Administrator status. By "putting" a name, email and password to knarly/me. The response data shall be a authentication code or otherwise an error.',
		method : 'post',
		data : {
			type : 'user',
			name : '',
			email : '',
			username : '',
			password : '',
			file : ''
		},
		auth : false // do not check for authentication
	},
	{
		name : 'Signin',
		note : 'Send username and/or email along with a password oauth.knarly.com using the `login` api method the response shall be an acces_token or otherwise an error.',
		method : 'login',
		data : {
			username : '',
			password : '',
			display : 'none'
		},
		auth : false // do not check for authentication
	},
	{
		name : 'Create a shared wall where users can view oneanothers content',
		path : 'knarly/sharedwall',
		note : 'Enabling users to create content on other paths requires permission which we define by setting a status number, 5=Full edit access, 4=Can post to path',
		method : 'put',
		data : {
			name : 'SharedWall',
			description : 'Post your comments on the site',
			status : 4
		}
	},
	{
		name : 'Create',
		path : 'knarly/recoveraccounttemplate',
		note : 'Defines a template used for wrapping emails. This introduces special characters, e.g. {$characters} where we can customise the form',
		method : 'put',
		data : {
			name : 'Forgotten Password', // this is used as the subject of the email
			content : 'Whoops, so you forgot your password, Oh well everyone does it. Please click here to signin http://sitedomain.com/#access_token={$access_token}', // this is used as the body of the email
			status : 4
		}
	},
{
	section : "User",
	aside : "Creating a user account"
},
	{
		name : 'Decide whether a username or email exist',
		path : 'knarly',
		note : 'Check for the existance of a `username` or `email` address',
		method : 'get',
		data : {
			type : 'user',
			email : 'replace@th.is',
			limit : 1
		},
		auth : false // do not check for authentication
	},
	{
		name : 'Create an account',
		path : 'knarly/me',
		note : 'Create a user by "post"ing a name, email and password to the root, "knarly". The response will be the newly created object. We can get the access token so the user can create other types of articles etc by calling hello.login("knarly",{username:string, password: string})',
		method : 'put',
		data : {
			name : '',
			email : '',
			username : '',
			password : '',
			file : ''
		},
		auth : false // do not check for authentication
	},
	{
		name : 'Signin with a Username and Password',
		note : 'Send username and/or email along with a password oauth.knarly.com using the `login` api method the response shall be an acces_token or otherwise an error.',
		method : 'login',
		data : {
			username : '',
			password : ''
		},
		auth : false // do not check for authentication
	},
	{
		name : 'Signin [/Create an Account] with an AccessToken from another OAuth2 network',
		note : 'Send an Access Token of another network provider e.g. Google+, Facebook or Windows Live. The access_token can be obtained by using hello.js with another provider or using their default libraries. The authentication token must have been created with the scope allowing access to the users email. Warning: If the user is already signed in via another method the accounts are linked! The application is responsible for properly signing the user out first.',
		method : 'login',
		data : {
			access_token : '',
			provider : 'google'
		},
		auth : false // do not check for authentication
	},
	{
		name : 'Add a network to an existing account',
		note : 'Using hello.getAuthReponse(provider), we can obtain the accessToken. We can post to this to the user\'s profile along with [type=token]. This shall then link the account enabling the user to identify themselves with one of the Network Providers',
		path : 'knarly/me',
		method : 'post',
		data : {
			type : 'token',
			token : '',
			provider : ''
		}
	},
	{
		name : 'Search for linked networks',
		note : 'Return all the networks the user is linked to',
		path : 'knarly/me',
		method : 'get',
		data : {
			type : 'token',
			limit: 100
		}
	},
	{
		name : 'Remove a network from an existing account',
		note : 'Remove a linked account from a user, just define the path as the ID - as returned from searching the tokens (above)',
		path : '{id}',
		method : 'delete'
	},
	{
		name : 'Forgotten password',
		note : 'Posting to an Admin authored template renders a message given to the recipient defined in the username and or email field. e.g...',
		path : 'knarly/recoveraccounttemplate',
		method : 'post',
		data : {
			name : 'Recover Account Access',
			type : 'message',
			email : 'example@ema.il'
		}
	},
	{
		name : 'Get user data',
		path : 'knarly/me',
		method : 'get'
	},
	{
		name : 'Change user data',
		path : 'knarly/me',
		method : 'put',
		data : {
			description : 'Simply amazing'
		}
	},
	{
		name : 'Delete the users Account',
		note : 'Revoke access to a user account as well as publc access to all pages authored by the user.',
		path : 'knarly/me',
		method : 'delete'
	},
{
	section : "Add Contacts",
	aside : "Adding private information to a user object"
},
	{
		name : 'Create a new path to store contacts',
		path : 'knarly/me/contacts',
		method : 'put',
		data : {
			name : 'My Contacts',
			description : 'List of user contacts'
		}
	},
	{
		name : 'Add friends to contacts list',
		note : "Post with lat/lng, for Auckland, NZ use -41.283333/174.45, For London use 51.507222/-0.1275 respectively",
		path : 'knarly/me/contacts',
		method : 'post',
		data : {
			name : 'Boris',
			city : 'Berlin',
			latitude : 52.500556,
			longitude : 13.398889
		}
	},
	{
		name : 'Search for a contact by name',
		path : 'knarly/me/contacts',
		method : 'get',
		data : {
			name : 'Zeeman',
			limit : 3
		}
	},
	{
		name : 'Search contacts closest to longitude and latitude',
		note : "The lng/lat coords i've used are for Sydney, which is where i am!",
		path : 'knarly/me/contacts',
		method : 'get',
		data : {
			latitude : -33.859972,
			longitude : 151.211111,
			sort : 'distance ASC',
			limit : 3
		}
	},
	{
		name : 'Delete access to contacts',
		path : 'knarly/me/contacts',
		method : 'delete'
	},
	{
		name : 'Verified the page is deleted',
		path : 'knarly/me/contacts',
		method : 'get'
	},
{
	section : "POST",
	aside : 'User Posted articles'
},
	{
		name : 'Add Articles',
		note : "Post with lat/lng, for Auckland, NZ use -41.283333/174.45, For London use 51.507222/-0.1275 respectively",
		path : 'knarly/sharedwall',
		method : 'post',
		data : {
			name : 'Boris',
			city : 'Berlin',
			lat	: 52.500556,
			lng : 13.398889
		}
	},
{
	section : "Search",
	aside : 'Query articles'
},
	{
		name : 'Get the latest articles',
		path : 'knarly/sharedwall',
		note : 'Get the latest 5 articles to the sharedwall',
		method : 'get',
		data : {
			sort : 'created DESC', // This is in the form of what (ASC|DESC)
			limit : 5
		}
	},
	{
		name : 'Search articles by title',
		path : 'knarly/sharedwall',
		method : 'get',
		data : {
			name : 'Zeeman',
			limit : 3
		}
	},
	{
		name : 'Search articles closest to longitude and latitude',
		note : "The lng/lat coords i've used are for Sydney, which is where i am!",
		path : 'knarly/sharedwall',
		method : 'get',
		data : {
			latitude : -33.859972,
			longitude : 151.211111,
			sort : 'distance ASC',
			limit : 3
		}
	},
	{
		name : 'Return aggregate data',
		note : "Lets discover how many posts have been made by a given user at a given path",
		path : 'knarly/sharedwall',
		method : 'get',
		data : {
			author_id : 12345,
			limit : 1
		}
	},
{
	section : "Social",
	aside : 'Link, follow, comment on articles and users'
},
	{
		name : 'Link to another article',
		path : 'knarly/following',
		note : 'Post a link on the root of the user, where `link` is the id of an article and or user we want to connect with',
		method : 'post',
		data : {
			type : 'link',	// type as a link
			link : 12345 // ID of the article or the user to follow
		}
	},
	{
		name : 'Show items you have linked with',
		path : 'knarly/following',
		note : 'Get a list of shared resources',
		method : 'get',
		data : {
			user_id : '{me}',
			$return : 'link' // this says the target element is the 'link' ID
		}
	},
	{
		name : 'See who is following you',
		note : 'Get a list of people who are following you, we search the client ID, and say the target is the user_id',
		path : 'knarly/following',
		method : 'get',
		data : {
			link : '{me}',
			$return : 'user_id' // this says the target element is the 'link' ID
		}
	},
	{
		name : 'Comment on an article',
		path : 'knarly/{id}',
		note : 'Post a comment given an ID.',
		method : 'post',
		data : {
			summary : 'So have you considered X',
			type : 'comment'
		}
	},
];
