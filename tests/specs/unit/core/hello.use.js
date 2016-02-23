define([], function() {

	describe('hello.use', function() {

		it('should set the service on the current instance only', function() {
			var root = hello;
			var rootService = hello.settings.network;
			var instance = hello('instance');
			var descendent = instance.use('descendent');
			expect(hello.settings.network).to.be(rootService);
			expect(instance.settings.network).to.be('instance');
			expect(descendent.settings.network).to.be('descendent');
		});

		it('should return a new instance', function() {

			var instance = hello('instance');
			expect(instance).to.not.be(hello);
		});

	});

});
