	//
	// Tests
	// An array containing objects
	// Each object contains a name, path, method, data, test (callback)
	// This executes them equentially
	//
	var tests = [
		{
			name : 'Get user data',
			path : 'knarly/me',
			method : 'get',
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
				lat	 : 52.500556,
				lng : 13.398889
			}
		},
		{
			name : 'Search for a contact by name',
			path : 'knarly/me/contacts',
			data : {
				name : 'Zeeman',
				limit : 3
			}
		},
		{
			name : 'Search contacts closest to longitude and latitude',
			note : "The lng/lat coords i've used are for Sydney, which is where i am!",
			path : 'knarly/me/contacts',
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
		}
	];
