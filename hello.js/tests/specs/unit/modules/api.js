
// API, A quick run through of the endpoints and their responses
import helper from './helper';
import endpoints from '../../stubs/endpoints';

// Endpoints is an generated array of files in the stubs directory.
// Here we are using it to simulate a range of API requests and responses to see how Hello.API handles them.

describe('API endpoints', function() {

	helper.sharedSetup();

	helper.forEach(endpoints, function(fileName) {

		// Extract from the file name the endpoint request
		var m = fileName.match(/([a-z]+)\/(get|post|del|put)\/(.*?)(;[^.]+)?(\-([a-z]+))?\.json/);
		var network = m[1];
		var method = m[2];
		var path = m[3];
		var query = m[4];
		var errors = m[5];

		// Format query
		if (query) {
			query = splitter(query, ';', '-');
		}

		it('should handle ' + m.slice(1, 5).join(' '), function(done) {

			var req = {
				path: path,
				method: method,
				query: query,
				stub: m[0]
			};

			var promise = hello(network).api(req);

			if (!errors) {
				promise.then(function() {
					done();
				}, done);
			}
			else {
				promise.then(done, function() {
					done();
				});
			}
		});

	});

});

function splitter(str, delim, sep) {
	var q = {};

	str.split(delim).forEach(function(s) {
		if (s === '') {
			return;
		}

		var m = s.split(sep);
		q[m[0]] = m[1];
	});

	return q;
}
