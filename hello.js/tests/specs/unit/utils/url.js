
var Url = hello.utils.url;

describe('utils.url', function() {

	var testLocationRoot = window.location.protocol + '//' + window.location.host;
	var testLocationDir = window.location.pathname.replace(/\/[^\/]+$/, '/');
	var testLocationFilename = 'redirect.html';

	it('should return current URL, if no URL is given', function() {

		var path = Url().href;
		expect(path).to.equal(window.location.href);

	});

	it('should return a full URL, if a full URL is given', function() {

		var path = 'http://test/' + testLocationFilename;
		var url = Url(path);
		expect(url.href).to.equal(path);
		expect(url.hostname).to.equal('test');
		expect(url.protocol).to.equal('http:');

	});

	it('should return a full URL, if a protocol-less URL is given', function() {
		var url = '//test/' + testLocationFilename;
		var path = Url(url).href;
		expect(path).to.equal(window.location.protocol + url);
	});

	it('should return a full URL, if a base-path is given', function() {
		var url = '/test/' + testLocationFilename;
		var path = Url(url).href;
		expect(path).to.equal(testLocationRoot + url);
	});

	it('should return a full URL, if a relative-path is given', function() {
		var url = './' + testLocationFilename;
		var path = Url(url).href;
		expect(path).to.equal(testLocationRoot + (testLocationDir + url.replace('./', '')));
	});

	it('should return a full URL, if a relative-ascendant-path is given', function() {
		var url = '../' + testLocationFilename;
		var path = Url(url).href;
		expect(path).to.equal(testLocationRoot + testLocationDir.replace(/\/[^\/]+\/$/, '/') + testLocationFilename);
	});

	it('should return a full URL, if a deeper relative-ascendant-path is given', function() {
		var url = '../../' + testLocationFilename;
		var path = Url(url).href;
		expect(path).to.equal(testLocationRoot + testLocationDir.replace(/\/[^\/]+\/$/, '/').replace(/\/[^\/]+\/$/, '/') + testLocationFilename);
	});

	it('should return a full URL, if a complex relative-ascendant-path is given', function() {
		var url = '../../asdasd/asdasd/../../' + testLocationFilename;
		var path = Url(url).href;
		expect(path).to.equal(testLocationRoot + testLocationDir.replace(/\/[^\/]+\/$/, '/').replace(/\/[^\/]+\/$/, '/') + testLocationFilename);
	});

});
