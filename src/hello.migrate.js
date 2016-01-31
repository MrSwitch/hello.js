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
					console.warn('HelloJS: Module definition has changed the name of property "scope" to "scope_map"');
					provider.scope_map = provider.scope;
					delete provider.scope;
				}
			}
		}

		return init.call(this, services, options);
	};

})(hello);
