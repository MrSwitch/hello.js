//
// Knarly unit tests
// These are Unit test pages for the knarly api endpoint using a web client and hello.js
// The purpose of these tests is to be awesome... unfourtunatly these tests are hard to write
// Anyone copying them for their own API should be really pround of themselves for getting out of doing the hard work.
//
// @author Andrew Dodson #mr_switch
// @company Knarly

var griffins = {
	peter : {username:'Peter',email:'sonofdod@gmail.com',password:'pichachu'},
	brian : {username:'Brian',email:'sonofdod@gmail.com',password:'pichachu'},
	louis : {username:'Louis',email:'sonofdod@gmail.com',password:'pichachu'}
};

var unittests = [
	{
		// Test that a domain does not exist
		// The user can do this by changing their dev domain... dont use 'localhost'
		name : 'Can\'t access a domain which doesn\'t exist',
		method : 'get',
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
		path : 'knarly/',
		validate : function(r){
			return ("error" in r ) && r.error.code === 'invalid_domain';
		}
	},
	{
		name : 'Can\'t \'put\' or post anything to the /me path other than a user',
		method : 'put',
		variants : [
			{method:'post'},
			{method:'put', data:{type:'dataset',email:'andrew@gmail.com'}},
			{method:'post'}
		],
		path : 'knarly/me',
		validate : function(r){
			return "error" in r && r.error.code === 'invalid_domain';
		}
	},
	{
		name : 'Check that when we put a user, the email must be present',
		method : 'put',
		variants : [
			{email : ''}
		],
		path : 'knarly/me',
		data : {
			type : 'user'
		},
		validate : function(r){
			return "error" in r && r.error.code === 'required_email';
		}
	},
	{
		name : 'Check that when we put a user, the email must be correct format',
		method : 'put',
		variants : [
			{data:{email:1234}},
			{data:{email:"!@#$%^&"}},
			{data:{email:"asdfasdf@sdf$.com"}},
			{data:{email:["asdfasdf@gmail.com"]}},
			{data:{email:{email:"asdfasdf@gmail.com"}}}
		],
		path : 'knarly/me',
		data : {
			type : 'user',
			email : 'asdasd'
		},
		validate : function(r){
			return ("error" in r ) && r.error.code === 'invalid_email';
		}
	},
	{
		name : 'Check that when we put a user, the password must exist',
		method : 'put',
		variants : [
			{data:{password:''}}
		],
		path : 'knarly/me',
		data : {
			type : 'user',
			email : 'email@gmail.com'
		},
		validate : function(r){
			return "error" in r && r.error.code === 'required_password';
		}
	},
	{
		name : 'Check that when we put a user, the password must be of correct format',
		method : 'put',
		variants : [
			{data:{password:'12345'}},
			{data:{password:function(){}}},
			{data:{password:['asdasd']}}
		],
		path : 'knarly/me',
		data : {
			type : 'user',
			email : 'email@mail.com'
		},
		validate : function(r){
			return "error" in r && r.error.code === 'invalid_password';
		}
	},
	{
		name : 'Check that we cannot define a status on a user. Unless we are already signed in.',
		method : 'put',
		variants : [
			{status : 0},
			{status : -1}
		],
		path : 'knarly/me',
		data : {
			type : 'user',
			email : 'email@mail.com',
			password : '123456',
			status : 1
		},
		validate : function(r){
			return "error" in r && r.error.code === 'invalid_status';
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
	for( var j=0;j<unittests[i].variants.length;j++){
		// merge the changes in the variant property to create new testing resources.
		unittests[i] = _merge(unittests[i],unittests[i].variants[j]);
		tests.push(unittests[i]);
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