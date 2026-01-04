// Chrome Packaged Apps
// The Chrome Extension redefines the "hello.utils.popup"
describe('utils.popup', function() {

	var _open = window.open;

	after(function() {
		window.open = _open;
	});

	function safariHack(url) {
		var m = url.match(/\#oauth_redirect\=(.+)$/i);
		if (m) {
			url = decodeURIComponent(decodeURIComponent(m[1]));
		}

		return url;
	}

	it('should call window.open with url', function() {

		var url = 'https://doma.in/oauth/auth';

		var spy = sinon.spy(function(_url, name, options) {

			_url = safariHack(_url);

			expect(url).to.eql(_url);
		});

		window.open = spy;

		hello.utils.popup(url, 'https://redirect.uri/path', {});

		expect(spy.calledOnce).to.be.ok();
	});

	it('should set top and left when width and height are provided', function() {

		var url = 'https://doma.in/oauth/auth';

		var spy = sinon.spy(function(_url, name, options) {

			_url = safariHack(_url);

			expect(options).to.contain('top=');
			expect(options).to.contain('left=');
		});

		window.open = spy;

		hello.utils.popup(url, 'https://redirect.uri/path', {width: 500, height: 500});

		expect(spy.calledOnce).to.be.ok();
	});
});
