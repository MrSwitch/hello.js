// Bacwards compatibilty
// Augment functions to provide backwards compatibility
(function(hello) {

	// Backup
	var init = hello.init;

	// Replace it
	hello.init = function(services, options) {

		if (services) {
			for (var x in services) {
				var provider = services[x];
				if (typeof provider === 'object' && provider.scope) {
					// Deprecated
					console.warn('HelloJS: Module property `scope` deprecated, use `scope_map` as of 1.11.0');
					provider.scope_map = provider.scope;
					delete provider.scope;
				}
			}
		}

		return init.call(this, services, options);
	};

})(hello);
