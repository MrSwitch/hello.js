// API, A quick run through of the endpoints and their responses
const hello = require('../../../../src/hello.js');
const helper = require('./helper.js');
const endpoints = require('../../../stubs/endpoints.js');

// Endpoints is an generated array of files in the stubs directory.
// Here we are using it to simulate a range of API requests and responses to see how Hello.API handles them.

describe('API endpoints', () => {

	helper.sharedSetup();

	helper.forEach(endpoints, fileName => {

		// Extract from the file name the endpoint request
		const m = fileName.match(/([a-z]+)\/(get|post|del|put)\/(.*?)(;[^.]+)?(-([a-z]+))?\.json/);
		const network = m[1];
		const method = m[2];
		const path = m[3];
		let query = m[4];
		const errors = m[5];

		// Format query
		if (query) {
			query = splitter(query, ';', '-');
		}

		it(`should handle ${m.slice(1, 5).join(' ')}`, done => {

			const req = {
				path,
				method,
				query,
				stub: m[0]
			};

			const promise = hello(network).api(req);

			if (!errors) {
				promise.then(() => {
					done();
				}, done);
			}
			else {
				promise.then(done, () => {
					done();
				});
			}
		});

	});

});

function splitter(str, delim, sep) {
	const q = {};

	str.split(delim).forEach(s => {
		if (s === '') {
			return;
		}

		const m = s.split(sep);
		q[m[0]] = m[1];
	});

	return q;
}
