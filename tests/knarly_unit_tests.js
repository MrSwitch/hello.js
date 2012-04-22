//
// Knarly unit tests
// These are Unit test pages for the knarly api endpoint using a web client and hello.js
// The purpose of these tests is to be awesome... unfourtunatly these tests are hard to write
// Anyone copying them for their own API should be really pround of themselves for getting out of doing the hard work.
//
// @author Andrew Dodson #mr_switch
// @company Knarly

var griffins = {
	peter : {username:'Peter',email:'sonofdod@gmail.com',password:'pichachu',type:'user'},
	brian : {username:'Brian',email:'andrew.live@gmail.com',password:'pichachu',type:'user'},
	louis : {username:'Louis',email:'sonofdod@gmail.com',password:'pichachu',type:'user'}
};

var unittests = [
	{
		section: 'No Domain or authentication',
		aside : ''
	},
	{
		// Test that a domain does not exist
		// The user can do this by changing their dev domain... dont use 'localhost'
		name : 'Can\'t access a domain which doesn\'t exist',
		method : 'get',
		path : 'knarly/',
		variants : [
			{method:'put'},
			{method:'post'},
			{method:'delete'},
			{path:'knarly/path',method:'get'},
			{method:'put'},
			{method:'post'},
			{method:'delete'},
			{path:'knarly/me',method:'get'},
			{method:'put'},
			{method:'post'},
			{method:'delete'}
		],
		validate : function(r){
			return ("error" in r ) && r.error.code === 'invalid_domain';
		}
	},
	{
		section: 'Admin: Creating the first user',
		aside : ''
	},
	{
		name : 'Can\'t \'put\' or post anything to the /me path other than a user',
		method : 'put',
		path : 'knarly/me',
		variants : [
			{method:'post'},
			{method:'put', data:{type:'dataset',email:'andrew@gmail.com'}},
			{method:'post'}
		],
		validate : function(r){
			return "error" in r && r.error.code === 'invalid_domain';
		}
	},
	{
		name : 'Check that when we put a user, the email must be present',
		method : 'put',
		path : 'knarly/me',
		data : {
			type : 'user'
		},
		variants : [
			{email : ''}
		],
		validate : function(r){
			return "error" in r && r.error.code === 'required_email';
		}
	},
	{
		name : 'Check that when we put a user, the email must be correct format',
		method : 'put',
		path : 'knarly/me',
		data : {
			type : 'user',
			email : 'asdasd'
		},
		variants : [
			{data:{email:1234}},
			{data:{email:"!@#$%^&"}},
			{data:{email:"asdfasdf@sdf$.com"}},
			{data:{email:["asdfasdf@gmail.com"]}},
			{data:{email:{email:"asdfasdf@gmail.com"}}}
		],
		validate : function(r){
			return ("error" in r ) && r.error.code === 'invalid_email';
		}
	},
	{
		name : 'Check that when we put a user, the password must exist',
		method : 'put',
		path : 'knarly/me',
		data : {
			type : 'user',
			email : 'email@gmail.com'
		},
		variants : [
			{data:{password:''}}
		],
		validate : function(r){
			return "error" in r && r.error.code === 'required_password';
		}
	},
	{
		name : 'Check that when we put a user, the password must be of correct format',
		method : 'put',
		path : 'knarly/me',
		data : {
			type : 'user',
			email : 'email@mail.com'
		},
		variants : [
			{data:{password:'12345'}},
			{data:{password:function(){}}},
			{data:{password:['asdasd']}}
		],
		validate : function(r){
			return "error" in r && r.error.code === 'invalid_password';
		}
	},
	{
		name : 'Check that we cannot define a status on a user. Unless we are already signed in.',
		method : 'put',
		path : 'knarly/me',
		data : {
			type : 'user',
			email : 'email@mail.com',
			password : '123456',
			status : 1
		},
		variants : [
			{status : 0},
			{status : -1}
		],
		validate : function(r){
			return "error" in r && r.error.code === 'invalid_status';
		}
	},
	{
		name : 'POST the first user (admin)',
		method : 'put',
		path : 'knarly/me',
		data : griffins.peter,
		variants : [
		],
		validate : function(r){
			return "id" in r;
		}
	},
	{
		name : 'Login user (admin)',
		method : 'login',
		data : {
			username : griffins.peter.username,
			password : griffins.peter.password,
			display	: 'none'
		},
		validate : function(r){
			return "authResponse" in r;
		}
	},
{
	section: 'Admin: Creating categories and access levels',
	aside : ''
},
	{
		name : 'Create a new category',
		method : 'put',
		path : 'knarly/quotes',
		data : {
			name : 'Quotes',
			state : 3 // let people add children
		},
		validate : function(r){
			return "id" in r;
		}
	},
	{
		name : 'Post the first item to the category',
		method : 'post',
		path : 'knarly/quotes',
		data : {
			name : 'First quotes',
			description : 'Something someone just said'
		},
		validate : function(r){
			return "id" in r;
		}
	},

{
	section: 'User1: Create user',
	aside : ''
},
	{
		name : 'Signout current users',
		method : 'logout',
		validate : function(r){
			var auth = hello.getAuthResponse('knarly');
			return !auth || !("access_token" in auth);
		}
	},
	{
		name : 'Check we can\'t reuse and existing email',
		path : 'knarly',
		note : 'Check for the existance of an `email` address',
		method : 'get',
		data : {
			type : 'user',
			email : griffins.peter.email,
			limit : 1
		},
		validate : function(r){
			return "data" in r && r.data.length === 1;
		}
	},
	{
		name : 'Check we can\'t reuse and existing username',
		path : 'knarly',
		note : 'Check for the existance of a `username`',
		method : 'get',
		data : {
			type : 'user',
			username : griffins.peter.username,
			limit : 1
		},
		validate : function(r){
			return "data" in r && r.data.length === 1;
		}
	},
	{
		name : 'Check new email email isn\'t used',
		path : 'knarly',
		note : 'Check for the existance of an `email` address',
		method : 'get',
		data : {
			type : 'user',
			email : griffins.louis.email,
			limit : 1
		},
		validate : function(r){
			return "data" in r && r.data.length === 0;
		}
	},
	{
		name : 'Check new username isn\'t used',
		path : 'knarly',
		note : 'Check for the existance of a `username`',
		method : 'get',
		data : {
			type : 'user',
			username : griffins.louis.username,
			limit : 1
		},
		validate : function(r){
			return "data" in r && r.data.length === 0;
		}
	},
	{
		name : 'Check we can\'t post with an existing username',
		method : 'put',
		path : 'knarly/me',
		data : _merge( griffins.louis, {username:griffins.peter.username} ),
		validate : function(r){
			return "error" in r && r.error.code === 'unique_username';
		}
	},
	{
		name : 'Check we can\'t post with an existing email',
		method : 'put',
		path : 'knarly/me',
		data : _merge( griffins.louis, {email:griffins.peter.email} ),
		validate : function(r){
			return "error" in r && r.error.code === 'unique_email';
		}
	},
	{
		name : 'Create a new user',
		method : 'put',
		path : 'knarly/me',
		data : griffins.louis,
		validate : function(r){
			return "id" in r;
		}
	},
	{
		name : 'Signin Louis',
		method : 'login',
		data : {
			username : griffins.louis.username,
			password : griffins.louis.password
		},
		validate : function(r){
			return "authResponse" in r;
		}
	},
	{
		name : 'Post quotes',
		method : 'post',
		path : 'knarly/quotes',
		data : {
			name : 'Louis quotes',
			description : 'aye'
		},
		validate : function(r){
			return "id" in r;
		}
	},
	{
		name : 'Adding a social network to an existing account',
		method : 'post',
		path : 'knarly/me',
		data : {
			type : 'token',
			provider_token : '',
			provider_name : ''
		},
		validate : function(r){
			return "id" in r;
		}
	}

];




// Create the 'tests' based on the unittests
// These are a little different from the playgound examples.
// unittests (above) included variations on the same theme.
// So lets augment them into the regular format
var tests = [];
for( var i=0;i<unittests.length;i++){
	// add the initial tests
	tests.push(unittests[i]);

	if(unittests[i].variants){
		for( var j=0, len = unittests[i].variants.length;j<len;j++){
			// merge the changes in the variant property to create new testing resources.
			unittests[i] = _merge(unittests[i],unittests[i].variants[j]);
			tests.push(unittests[i]);
		}
	}
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