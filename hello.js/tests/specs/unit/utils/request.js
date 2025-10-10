
var utils = hello.utils;

describe('utils.request', function() {

	// Stub utils/xhr
	var xhr = utils.xhr;

	afterEach(function() {
		utils.xhr = xhr;
	});

	it('should by default use a XMLHttpRequest', function() {

		var p = {
			url: '/localrequest'
		};

		var spy = sinon.spy(function() {
			return {};
		});

		// Implicitly undefined
		utils.xhr = spy;
		utils.request(p);
		expect(spy.called).to.be.ok();

		spy = sinon.spy(function() {
			return {};
		});

		// Explicitly undefined
		p.xhr = undefined;
		utils.xhr = spy;
		utils.request(p);
		expect(spy.called).to.be.ok();
	});

});

