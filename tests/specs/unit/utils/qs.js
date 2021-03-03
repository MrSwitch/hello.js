// Qs
// Binds arguments to a URL string.
var u = hello.utils;

describe('utils.qs', function() {

	var test = {
		param: 'param1',
		param2: 'param2'
	};

	it('should append arguments to a url', function() {

		var value = u.qs('https://api.com/path?q=%22root%22+in+parents+and+trashed=false&maxResults=5', {access_token: 'token', path: 'path'});

		expect(value).to.eql('https://api.com/path?q=%22root%22+in+parents+and+trashed=false&maxResults=5&access_token=token&path=path');

	});

	it('should overwrite existing arguments in a url', function() {

		var value = u.qs('https://api.com/path?q=%22root%22+in+parents+and+trashed=false&maxResults=5', {q: 'word', access_token: 'token'});

		expect(value).to.eql('https://api.com/path?q=word&maxResults=5&access_token=token');

	});

});

