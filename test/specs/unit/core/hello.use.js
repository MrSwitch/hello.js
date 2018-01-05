const hello = require('../../../../src/hello.js');

describe('hello.use', () => {

	it('should set the service on the current instance only', () => {
		const rootService = hello.settings.default_service;
		const instance = hello('instance');
		const descendent = instance.use('descendent');
		expect(hello.settings.default_service).to.be(rootService);
		expect(instance.settings.default_service).to.be('instance');
		expect(descendent.settings.default_service).to.be('descendent');
	});

	it('should return a new instance', () => {

		const instance = hello('instance');
		expect(instance).to.not.be(hello);
	});

});
