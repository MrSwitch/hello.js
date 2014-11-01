/**
 * API endpoint tests
 * @author Andrew Dodson
 */

//
// The following properties pertain to helper objects when defining the tests
//
var reg = {
	url : /^https?\:\/\//,
	name : /^[\w\d\s\.\-]+$/,
	id : /^[\w\d\@\.\-]+$/,
	string : /^\S+$/,
	optional_name : /^[\w\d\s\-]*$/,
	optional_url : /^(https?\:\/\/|$)/
};

var INPUT_FILE = 'file',
	DATA_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAadEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41LjEwMPRyoQAAByJJREFUeF7tW81uHEUQziPwBvAG8ASYHMD27vw4XCLbO2teIAhxRPAGgIRyQxEHzkicOGEJJI4QkFAkEEIBDvwG4UggsBNiqK+6etzbUzNTvTMbr6yU9Gl3pqu667erZ9a+9Ige0XrRxkb5WFZUN/Ji/kV55YX/8JmX1Tu4LywXlyaTvafJ4N9heIy8nP+BcWG9eIQIk5G/acZ7wAkXNhOQ9prRMcAnIutHQ+o3a0n9GPnOwWcisl40tH6LnYOGXBvgVBFbDxqjfrNyfqrJxSgIeVEdith60ND63dy8+gQZZXMAZUpWzF4X0fUgit6nmrIxyAHficgCTaf7z8Cw3jLYcZjk1TURZRqy94xClN7HDWVboCkFB5RXnAOQ4pocDPcOAr+IrsfZISurnzUFYsC4UHlP29t7GRzAfGyo4/UyuOboyz3vRHwO3XtGIXLAj9riMRDBOH1BeV69pPFroGgfidj6nB2yYv+6tX41ZaZ59ZYqoyDsAHR2+FfjibHys8O0mM2t9au1sGlRvd+QaYHvAJRJJZeGwqOBF1oVuU2MFmJDXd3iWqtfTRlyyrfheBd8CcERvVknoH3gJi+0SkrpBOj7IsZEsn9pfBr8JkoyP1gdQHvU17zQKokU+kZbXAPSV8T8Tm6qZQD81NqeIpnTsLRaQTzbWbUny62OKI3fUxVQQOn7qoidlY8BvgMg/f09y97DC62aYJSqhAI4S8SwmV3TeDT4DZRS+tbCGBtKkOtw7wnXSiKkWsrxEmm9oFQHwrYURrMP4MX+Qe3vgTauAR1KlrLTMsfLui4VGQ0ihtI51MY1IFtSMgZIPgXKptR5vKTMOLp8+fnHRaQmkjN3gmA3/1Ub1wCZRvp3wJdMElmPl3R4uSMiNaVEE6kpzj7RxjXA6cRv7hjIFlHNTtZH25J212e3dnMRY7I6D8CmmdoB4DRtrA3xecNEKWlMzvpFxJgSO8FhagfI8tmH2pgGsmO50581A3yroQeZ10Q0rafTZprWAfavp6Q/giFqpZE1jfkAQoAhPtWkpu9p/BryYvaxdl/DJJ+/rd1vA7oSG5RK2Ggsx0uGvMSg9KwPG+QA864O52n3NZCzPtHua6Asvi3qLEfTrLrBJyllcj51lYj+4v2trNqArLkTBA60gA5hf2v3NaC02JBlCalMpXC7KF2tY9LweKk5h6LJm465rpU52pAXB+anRcCfMQbRWctxtQ6jXWm0R42Mf9HaqlozTAEF4yftvgb/wDQKUVTNbQdATW9v713VxmL07jMBaF7zERubuKg/nJ6bzp6kxc2tB6BaPbZE1+wAzjzlfgvwUCbqj0PTfP6GtlAX/L7RDZsDUjIFELXHI+ntd7TF2tCrNEd0fAeE7XhUSj2D2xxgAKe/3QHQU1Ru0LTcf4VOky/LZTpRFtzUFtXQVwLWmk6pfQDZKurWtDnZn2aFe+KEM6lLfLXU74Y46Jij0RO5cAxGssMUY1OijwOYqMqUZVVFHaH5ul3WQcfSXux0Ek34ZWPCFnRFD4bxwWrh3iKPU9TuAP/sD8PJGd9rPEDoVDiBDbMSXi9bo9LFxw7QIr7w3W48nEVp/SYMUscDsF7B2mKajfgPGcrK9EJSc4BL9Q7HhN87+Dw4i8gY62+EHjkd8f13Mc1Ocjjq/RFkwQBSkms98HwbmIf5uh3QmI+v3bG9jjA+w2tByCNmpZFpQ5QF+qKuIZdPjjB/l5Ih+HXDEmHDy3nrOjwejflrMSmdqJ10P/cHyqbCKdwy5gEe3ON1HDR+D9Yl4PFziDnpRB3hrotOE26x5Yw/gyIfGVvszDnyvF7MqyDmG+QAN0G0gEwa3lsWzonxdTB37Yxmerci4qPN8x8xJ53w3I1JfBZ4ZcIFBgHz+c+G4c5oB7f2gmwXhH+Szz8QU5Yj/+orF0UaCy2L2CB8l/l5HVkvRs3fAcxLHex4MtnfFTOWp/rdX6zwAGAebV+pDeV3kXBCwJ/gANq3jtDGxYRhhPfu9eSKAlal+uDn6W1zGFfGPPLi4ET7PXNpwnv3cIE4cqM6wJBl7IQWHtqvHiQ/+FjIb4SAc8CZ0WM6wDqXd0K9MRNIx/ujRj6k+HWZr0lfo+4zuE6Em8vugLhEYPxKIu+JX5f5dijKhgp4uMgYjfBgZ7rvfekfA8dk/BXJyiIfEn4ctdaoKRN4rkWHWZ2HlAcvBeV0a2t3Iiqunsjbpn936TOEx4VnKQcQH7Xnew/VeFBWzj/XFGqgy5AoixaMlqyorzUQzySbfZT8rm8MwulKVSoBsYHaddxqPSjlTx561EMy/1EFjAqi3BjruGZIliy0OXL+uUQ9JPwe11BWAUdRM4zH4mtD5yCZPJ+9K2qcH3E7LOf3VSU9YCCjzQHRfUQaz/rhvRBs/PzPc4++J/z40KVsXzS1cZcF+CT4e3yf6/7u8EPOpUv/A/7Hk1sMFDYJAAAAAElFTkSuQmCC';

var query = {
	limit : [5,1,25,100]
};


//
// TESTS Array
// Each item within the array is a configuration of a test.
//
var tests = [
	{
		title : "Login to network",
		api : "login",
		method : 'login',
		data : {
			display : ["popup", "none", "page"],
			scope : ""
		},
		expected : {
			authResponse : {
				access_token : reg.string,
				expires : /\d/
			},
			network: reg.string
		}
	},
	// {
	// 	title : "Login via Authorization code grant flow",
	// 	api : "login",
	// 	method : 'login',
	// 	data : {
	// 		response_type : 'code',
	// 		display : ["popup", "none", "page"],
	// 		scope : ""
	// 	},
	// 	filter : function(test){
	// 		return hello.services[test.network].oauth.grant && hello.services[test.network].oauth.version === 2;
	// 	},
	// 	expected : {
	// 		authResponse : {
	// 			access_token : reg.string,
	// 			expires : /\d/
	// 		},
	// 		network: reg.string
	// 	}
	// },
	{
		title : "Logout from app",
		api : "logout",
		method : 'logout',
		expected : {
			network : reg.string
		}
	},
	{
		title : "Logout from app & network",
		api : "logout",
		method : 'logout',
		data : {
			force : true
		},
		filter : function(test){
			return "logout" in hello.services[test.network];
		},
		expected : {
			network : reg.string
		}
	},
	{
		title : "OAuth2: Implicit Grant, services which do not require server side authorization",
		api : "oauth",
		method : "OAuth2: Implicit Grant",
		filter : function(test){
			var oauth = hello.services[test.network].oauth;
			return oauth.version === 2 && oauth.response_type !== 'code';
		}
	},
	{
		title : "OAuth2: Authorization code, service requires oauth_proxy",
		api : "oauth",
		method : "OAuth2: Explicit Grant",
		filter : function(test){
			var oauth = hello.services[test.network].oauth;
			return oauth.version === 2 && oauth.grant;
		}
	},
	{
		title : "OAuth 1 + 1a, services which require oauth_proxy",
		api : "oauth",
		method : "oauth1 & 1a",
		filter : function(test){
			return hello.services[test.network].oauth.version !== 2;
		}
	},
	{
		title : "Refresh access token, using display=none",
		api : "refresh",
		method : "implicit grant",
		filter : function(test){
			return hello.services[test.network].refresh;
		}
	},
	{
		title : "Get current credentials",
		api : "getAuthResponse",
		method : 'getAuthResponse',
		expected : {
			access_token : reg.string,
			expires : /\d/
		}
	},
	{
		title : "Get my profile",
		api : "api",
		method : 'get',
		path : 'me',
		scope : ['email'],
		expected : {
			name : reg.name,
			id : reg.id,
/*			first_name : reg.name,
			last_name : reg.name,
*/
			thumbnail : reg.optional_url
		}
	},
	{
		title : "List my network friends",
		info : {
			facebook : 'For applications registered after April 2014 only friends who have used the same app appear in resultset. See https://developers.facebook.com/docs/apps/changelog'
		},
		api : "api",
		method : 'get',
		path : 'me/friends',
		data : query,
		scope : ["friends"],
		expected : {
			data : [{
				id : reg.id,
				name : reg.name,
				thumbnail : reg.url
			}]
		}
	},
	{
		title : "List my contacts",
		api : "api",
		method : 'get',
		path : 'me/contacts',
		data : query,
		scope : ["friends"],
		expected : {
			data : [{
				id : reg.id,
				name : reg.name,
				thumbnail : reg.url
			}]
		}
	},
	{
		title : "List my followers",
		api : "api",
		method : 'get',
		path : 'me/followers',
		data : query,
		scope : ["friends"],
		expected : {
			data : [{
				id : reg.id,
				name : reg.name,
				thumbnail : reg.url
			}]
		}
	},
	{
		title : "List who i'm following",
		api : "api",
		method : 'get',
		path : 'me/following',
		data : query,
		scope : ["friends"],
		expected : {
			data : [{
				id : reg.id,
				name : reg.name,
				thumbnail : reg.url
			}]
		}
	},
	{
		title : "List my recent status messages",
		api : "api",
		method : 'get',
		path : 'me/share',
		data : query,
		expected : {
			data : []
		}
	},
	{
		title : "Post a status message for me",
		api : "api",
		method : 'post',
		path : 'me/share',
		scope : ["publish"],
		data : {
			message : "Running the tests",
			link : window.location.href,
			picture : "http://adodson.com/hello.js/assets/logo.png"
		},
		expected : {}
	},
	{
		title : "Post a status and upload a media file",
		api : "api",
		method : 'post',
		path : 'me/share',
		scope : ["publish"],
		filter: function(p){
			return p.enabled && p.network === 'twitter';
		},
		data : {
			message : "Uploading image",
			file : INPUT_FILE
		},
		expected : {}
	},
	{
		title : "Reshare an existing message",
		api : "api",
		method : 'post',
		path : 'me/share',
		scope : ["publish"],
		filter: function(p){
			return p.enabled && 'twitter,linkedin'.indexOf(p.network) !== -1;
		},
		data : {
			id : 0
		},
		expected : {}
	},
	{
		title : "Get a list of items i've liked, favourited or starred",
		api : "api",
		method : 'get',
		path : 'me/like',
		data : query,
		expected : {
			data : []
		}
	},
	{
		title : "Like, favourite or star something",
		api : "api",
		method : 'post',
		path : 'me/like',
		scope : ["publish"],
		data : {
			id : 0
		},
		expected : {}
	},
	{
		title : "Unlike, unfavourite or unstar something",
		api : "api",
		method : 'delete',
		path : 'me/like',
		scope : ["publish"],
		data : {
			id : 0
		},
		expected : {}
	},
	{
		title : "List my albums",
		api : "api",
		method : 'get',
		path : 'me/albums',
		data : query,
		scope : ["photos"],
		expected : {
			data : [{
				id : reg.string,
				name : reg.name,
				thumbnail : reg.url,
				photos : reg.string
			}]
		}
	},
	{
		title : "List my photos from one of my Albums",
		api : "api",
		method : 'get',
		path : 'me/album',
		scope : ["photos"],
		data : {
			id : "[ALBUM_ID]"
		},
		setup : function(test, callback){
			hello(test.network).api("me/albums").on('success', function(r){
				if(r.data.length){
					test.data.id = test.data.id.replace("[ALBUM_ID]", r.data[0].id );
					callback();
					return;
				}
				callback("Failed to setup: the user has no albums");
			}).on('error',function(){
				callback("Failed to setup: could not open me/albums");
			});
		},
		expected : {
			data : [{
				id : reg.string,
				name : reg.name,
				picture : reg.url
			}]
		}
	},
	{
		title : "List my photos",
		api : "api",
		method : 'get',
		path : 'me/photos',
		data : query,
		scope : ["photos"],
		expected : {
			data : [{
				id : reg.string,
				name : reg.name,
				picture : reg.url
			}]
		}
	},
	{
		title : "Get a photo by ID",
		api : "api",
		method : 'get',
		path : 'me/photo',
		scope : ["photos"],
		data : {
			id : "[PHOTO_ID]"
		},
		setup : function(test, callback){
			hello(test.network).api("me/albums").on('success', function(r){
				if("data" in r && r.data.length > 0){

					// Pick one randomly
					var i = Math.floor(Math.random()*r.data.length);

					hello(test.network).api( "me/album", {
						id : r.data[i].id
					}, function(r){
						if("data" in r && r.data.length > 0){
							test.data.id = r.data[0].id;
							callback();
							return;
						}
						callback("Failed to setup: the user has no images in the album");
					});
				}
				else{
					callback("Failed to setup: The user has no albums yet");
				}
			}).on('error',function(){
				callback("Failed to setup: Error connecting to me/albums");
			});
		},
		expected : {
//			name : /^.+$/, // FaceBook doesn't always return a name
			id : reg.string,
			picture : reg.url
		}
	},
	{
		title : "Create a new Album",
		api : "api",
		method : 'post',
		path : 'me/albums',
		scope : ["publish_files"],
		data : {
			name : "TestAlbum",
			description : "This is a test album created at "+ window.location.href
		},
		expected : {
			id : reg.string
		}
	},
	{
		title : "Remove an album",
		api : "api",
		method : 'delete',
		path : 'me/album',
		scope : ["publish_files"],
		data : {
			id : '[ALBUM_ID]'
		},
		setup : before_photo_post,
		expected : {
			success : true
		}
	},
	{
		title : "Upload image to Album",
		api : "api",
		method : 'post',
		path : 'me/album',
		scope : ["publish_files"],
		data : {
			id : "[ALBUM_ID]",
			file : INPUT_FILE
		},
		setup : before_photo_post,
		expected : {
			id : reg.string
		}
	},
	{
		title : "Add image to Album via URL",
		api : "api",
		method : 'post',
		path : 'me/album',
		scope : ["publish_files"],
		data : {
			id : "[ALBUM_ID]",
			url : "http://adodson.com/hello.js/assets/logo.png",
			name : "Hello"
		},
		setup : before_photo_post,
		expected : {
			id : reg.string
		}
	},
	{
		title : "Remove a Photo from an Album",
		api : "api",
		method : 'delete',
		path : 'me/photo',
		scope : ["publish_files"],
		data : {
			id : '[PHOTO_ID]'
		},
		setup : get_test_photo,
		expected : {
			success : true
		}
	},
	{
		title : "List my files",
		api : "api",
		method : 'get',
		path : 'me/files',
		data : query,
		scope : ["files"],
		expected : {
			data : [{
				id : reg.string,
				name : reg.name,
				picture : reg.url,
				photos : reg.string
			}]
		}
	},
	{
		title : "List folders",
		api : "api",
		method : 'get',
		path : 'me/folders',
		data : query,
		scope : ["files"],
		expected : {
			data : [{
				id : reg.string,
				name : reg.name
			}]
		}
	},
	{
		title : "Create a folder",
		api : "api",
		method : 'post',
		path : 'me/folders',
		scope : ["publish_files"],
		data : {
			name : 'TestFolder'
		},
		expected : {
			id : reg.string,
			name : reg.name
		}
	},
	{
		title : "Get content of folder",
		api : "api",
		method : 'get',
		path : 'me/folder',
		scope : ["files"],
		data : {
			id : '[FOLDER_ID]'
		},
		setup : get_test_folder,
		expected : {
			data : [{
				id : reg.string,
				name : reg.name
			}]
		}
	},
	{
		title : "Delete a folder",
		api : "api",
		method : 'delete',
		path : 'me/folder',
		scope : ["publish_files"],
		data : {
			id : '[FOLDER_ID]'
		},
		setup : get_test_folder,
		expected : {
			success : true
		}
	},
	{
		title : "Get files in folder",
		api : "api",
		method : 'get',
		path : 'me/files',
		scope : ["files"],
		data : {
			parent : '[FOLDER_ID]'
		},
		setup : get_test_folder,
		expected : {
			data : [{
				id : reg.string,
				name : reg.name
			}]
		}
	},
	{
		title : "Upload my file",
		api : "api",
		method : 'post',
		path : 'me/files',
		scope : ["publish_files"],
		data : {
			parent : '[FOLDER_ID]',
			file : INPUT_FILE,
			name : "TestFile.png"
		},
		setup : get_test_folder,
		expected : {
			id : reg.string,
			name : reg.name
		}
	},
	{
		title : "Upload a DataURI as a file",
		api : "api",
		method : 'post',
		path : 'me/files',
		scope : ["publish_files"],
		data : {
			parent : '[FOLDER_ID]',
			file : DATA_URL,
			name : "TestFile.png"
		},
		setup : get_test_folder,
		expected : {
			id : reg.string,
			name : reg.name
		}
	},
	{
		title : "Update the file contents",
		api : "api",
		method : 'put',
		path : 'me/files',
		scope : ["publish_files"],
		data : {
			id : '[FILE_ID]',
			file : DATA_URL,
			name : "TestFile.png"
		},
		setup : get_test_file,
		expected : {
			id : reg.string,
			name : reg.name
		}
	},
	{
		title : "Move the file location",
		api : "api",
		method : 'put',
		path : 'me/files',
		scope : ["publish_files"],
		data : {
			id : '[FILE_ID]',
			parent : '[NEW_PARENT_ID]'
		},
		setup : get_test_file,
		expected : {
			id : reg.string,
			name : reg.name
		}
	},
	{
		title : "Delete my file",
		api : "api",
		method : 'delete',
		path : 'me/files',
		scope : ["publish_files"],
		data : {
			id : '[FILE_ID]'
		},
		setup : get_test_file,
		expected : {
			success : true
		}
	}
];


///////////////////////////////////
// BEFORE SETUPS


//
// Get the ID of the test album
//
function before_photo_post(test, callback){
	hello(test.network).api("me/albums").on('success',function(r){
		for(var i=0;i<r.data.length;i++){
			if(r.data[i].name === "TestAlbum"){
				var id = r.data[i].id;
				test.data.id = id;
				return callback();
			}
		}
		callback("Failed to setup: Could not find the album 'TestAlbum'");
	}).on('error',function(){
		callback("Failed to setup: could not access me/albums");
	});
}

function get_test_photo(test, callback){

	before_photo_post(test, function(s){
		if(s){
			callback(s);
			return;
		}
		hello(test.network).api( "me/album", { id : test.data.id } ).on('success',function(r){
			for(var i=0;i<r.data.length;i++){
				var file = r.data[i];
				test.data.id = file.id;
				return callback();
			}
			callback("Failed to setup: Create file 'TestFile.png' (there's a test above which does this)");
		}).on('error',function(){
			callback("Failed to setup, could not access me/files");
		});
	});
}

function get_test_folder(test, callback){

	if(!("id" in test.data)&&!("parent" in test.data)){
		callback();
		return;
	}

	// If there is no ID, post to root
	hello(test.network).api("me/folders").on('success',function(r){
		for(var i=0;i<r.data.length;i++){
			var folder = r.data[i];
			if(folder.name === "TestFolder"){
				if(test.data.id){
					test.data.id = folder.id;
				}
				else if(test.data.parent){
					test.data.parent = folder.id;
				}
				return callback();
			}
		}
		callback("Failed to setup: First create a folder called 'TestFolder' (there's a test above which does this)");
	}).on('error',function(){
		callback("Failed to setup, could not access me/folders, ensure your signed in with the 'files' scope");
	});
}

function get_test_file(test, callback){

	get_test_folder(test, function(s){
		if(s){
			callback(s);
			return;
		}
		hello(test.network).api( "me/files", { parent : test.data.id } ).on('success',function(r){
			for(var i=0;i<r.data.length;i++){
				var file = r.data[i];
				test.data.id = file.id;
				return callback();
			}
			callback("Failed to setup: Create file 'TestFile.png' (there's a test above which does this)");
		}).on('error',function(){
			callback("Failed to setup, could not access me/files");
		});
	});
}









////////////////////////////////////

function Test(test,network,parent){

	var self = this;

	this.api = ko.observable(test.api);

	// Toggle debug
	this.debug = ko.observable(false);


	// Parameters
	this.method = test.method;
	this.path = test.path;

	// Data
	// A hash table of the key=>value pairs
	this.data = new Dictionary( test.data || {} );

	// Form
	// If the data contains file data
	this.formId = ko.observable("form_"+parseInt(Math.random()*1e10, 10).toString(16));

	this.scope = ko.observableArray(test.scope||[]);
	this.setup = test.setup;
	this.title = test.title;
	this.network = network;

	this.variants = ko.observableArray([]);
	if(!network){
		for(var x in CLIENT_IDS_ALL){
			this.variants.push(new Test(test,x,this));
		}
	}
	else {

		this.info = test.info && test.info[network];

		var action = {'delete':'del'}[this.method] || this.method;
		this.enabled = {login:1,logout:1,getAuthResponse:1}[this.method] || (action in hello.services[network] && test.path in hello.services[network][action] );

		// Test filter
		if( test.filter ){
			this.enabled = test.filter(this);
		}
	}

	this.expected = test.expected;
	this.validate = test.validate || function(r){
		return r && !("error" in r) && (!this.expected || testExpected(this.expected,r));
	};

	this.next = ko.observable(null);
	this.passed = ko.observable();
	this.response = ko.observable();
	this.request = ko.observable();
	this.status = ko.observable();

	this.showResponse = ko.observable(false);
	this.showResponse.subscribe(function(bool){

		if(bool){
			// Loop through the others and disable them
			parent.variants().forEach(function(test){
				if(test !== self){
					test.showResponse(false);
				}
			});
		}

	});

	this.run = function(callback){
		var authResponse = hello.getAuthResponse(network);
		var test = this;
		test.data = JSON.parse(ko.toJSON(parent.data.itemsAsObject()));

		// If the data contains a file?
		// Can't grab it from the dictionary so...
		if("file" in test.data && test.data.file === INPUT_FILE ){

			// lets define the form as the data source
			test.data = document.getElementById(parent.formId());

			// Format the data now
			hello.utils.dataToJSON(test);

			/*
			var form = document.getElementById(parent.formId());
			var data = {};
			for(var i=0;i<form.length;i++){
				var input = form[i];
				if(input.name&&!input.disabled){
					if(input.type==='file'){
						data[input.name] = input;
					}
					else{
						data[input.name] = input.value || input.innerHTML;
					}
				}
			}
			*/
		}
		test.status('working');

		var action = function(r){

			var cb = function(r,next){
				// update the test
				var b = test.validate(r);

				// Next enabled
				test.next(r.paging && r.paging.next?function(){
					// Call hello.api
					// Save the request information
					test.request( hello( network ).api( r.paging.next, test.method, test.data, cb) );
				}:null);

				// passed?
				test.passed(b);

				// update model
				test.response(r);

				test.status(b?'success':'failure');
				
				if(callback&&typeof(callback)==='function'){
					callback.call(test);
				}
			};
			
			if(test.method === 'login'){
				test.request( hello(network).login(test.data,cb) );
			}
			else if(test.method === 'logout'){
				test.request( hello(network).logout(network,test.data,cb) );
			}
			else if(test.method === 'getAuthResponse'){
				test.request({});
				cb(hello(network).getAuthResponse(network));
			}
			else{
				// Call hello.api
				// Save the request information
				test.request( hello(network).api( test.path, test.method, test.data, cb) );
			}
		};

		if(test.setup){
			test.setup(test, function(s){
				// a string shows that an exception occured whilst setting the test up.
				if(s){
					test.status('exception');
					test.response(s);
					return;
				}
				action({authResponse:authResponse});
			});
		}
		else{
			action({authResponse:authResponse});
		}
	};
}

function Provider(network){
	this.name = network;
	this.displayName = network.replace(/^[a-z]/,function(m){
		return m.toUpperCase();
	});
	this.runAll = function(){
		hello.login(network, {scope: model.checkedScopes() }, function(r){
			if(!r||r.error){
				alert("Login error: "+r.error.message);
				return;
			}
			var tests = [];
			// Loop through all the tests
			ko.utils.arrayForEach(model.tests(), function(test){
				// Get the variant that matches this name
				ko.utils.arrayForEach(test.variants(), function(variant){
					if(variant.network === network){
						tests.push(variant);
					}
				});
			});

			// Now iterate through the tests
			(function loop(i){
				var test = tests[i];
				if(!test){
					return;
				}
				else if(!test.enabled){
					loop(++i);
				}
				else{
					test.run(function(){
						loop(++i);
					});
				}
			})(0);
		});
	};
	this.login = function(){
		hello.login(network, {scope: model.checkedScopes() });
	};
	this.logout = function(){
		this.online(false);
		hello.logout(network);
	};
	this.online = ko.observable(false);
}

var model = new (function(){
	this.networks = ko.observableArray([]);
	this.tests = ko.observableArray([]);
	this.checkedScopes = ko.observableArray([]);
	this.checkAllScopes = function(){
		ko.utils.arrayForEach(this.scopes(), function(scope){
			model.checkedScopes.push(scope);
		});
	};
	this.scopes = ko.observableArray([]);
});

ko.utils.arrayForEach( tests, function(test){

	// Urgh, IE8 including empty prototype at end of array
	if(!test){
		return;
	}
	model.tests.push(new Test(test));

	if(test.scope){
		ko.utils.arrayForEach(test.scope, function(scope){
			if(_indexOf(model.scopes(), scope)===-1){
				model.scopes.push(scope);
			}
		});
	}
});

if(!Object.keys){
	Object.keys = function(o){
		var a = [];
		for(var x in o)if(o.hasOwnProperty(x)){
			a.push(x);
		}
		return a;
	};
}

ko.utils.arrayForEach( Object.keys(CLIENT_IDS_ALL), function(network){
	model.networks.push(new Provider(network));
});


// Subscribe to the authentication
hello.on('auth.login', function(o){
	ko.utils.arrayForEach( model.networks(), function(network){
		if(o.network===network.name){
			network.online(true);
		}
	});
}).on('auth.expired auth.logout', function(o){
	ko.utils.arrayForEach( model.networks(), function(network){
		if(o.network===network.name){
			network.online(false);
		}
	});
});



//
// Bind beautifier handler
//
ko.bindingHandlers.beautify = {
    update: function(element, valueAccessor, allBindingsAccessor) {
		var value = ko.utils.unwrapObservable( valueAccessor() );
		function fixRegExp(k,v){
			if(v instanceof RegExp){
				v = v.toString();
			}
			return v;
		}
		value = (JSON.stringify(value,fixRegExp,1)||'').replace(/https?:\/\/[^\'\"\s]+/ig, function(r){
			return r.link(r).replace('<a ', '<a target="_blank" ');
		}).replace(/\"(\/.*?\/)\"/ig, function(m,a){
			// Format the RegExp to make it look good
			return a;
		}).replace(/\"(.*?)\"\:/ig, function(m,a){
			// Format the key to look a different
			return "<i>"+a+":</i>";
		});

        element.innerHTML = value; // Make the element visible
    }
};



//
// Turn an object of Key => Value into mutable stores
//
function DictionaryItem(key, value) {
    this.key = ko.observable(key);
	this.options = [];
    if(value instanceof Array){
		this.options = value;
		value = value[0];
    }
    this.value = (typeof(value)==='function')? value : ko.observable(value);
}


//
// Custom Dictionary observable in Knockout
// represent the dictionary object
//
function Dictionary(data) {
    this.items = ko.observableArray([]);
    for (var field in data) {
        if (data.hasOwnProperty(field)) {
            this.items.push(new DictionaryItem(field, data[field]));
        }
    }

    this.addItem = function() {
        this.items.push(new DictionaryItem());
    }.bind(this);

    this.removeItem = function(item) {
        this.items.remove(item);
    }.bind(this);
        
    this.itemsAsObject = ko.dependentObservable(function() {
        var result = {};
        ko.utils.arrayForEach(this.items(), function(item) {
            result[item.key()] = item.value;
        });

        return result;
    }, this);
}


function testExpected(test,r){
	for(var x in test){
		if(!r || !(x in r) ){
			b = test[x] instanceof RegExp && test[x].test("");
		}
		else if( test[x] === null ){
			// no test
			b = true;
		}
		else if( test[x] instanceof RegExp ){
			b = test[x].test(r[x]);
		}
		else if( test[x] instanceof Array ){
			b = r[x] instanceof Array;
		}
		else if( typeof( test[x] ) === 'object' ){
			b = testExpected(test[x],r[x]);
		}
		else{
			b = r[x] === test[x];
		}
		if(!b){
			return false;
		}
	}
	return true;
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



function getText(path, callback){
	// Load in the templates for API calls
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function(){
		if (xhr.readyState === 4){
			xhr.onload();
		}
	};
	xhr.onload = function(){
		callback(xhr.responseText);
		xhr.onload = function(){};
	};
	xhr.open("GET",path, true);
	xhr.send();
}