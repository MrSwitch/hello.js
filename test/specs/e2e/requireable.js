// Check that the dist packages can be imported

describe('Distribution', () => {
	it('Prebundled file hello.all.js should be requireable', () => {
		const hello = require('../../../dist/hello.js');
		expect(hello).to.be.a('function');
	});

	// it('Prebundled file hello.js should be requireable', () => {
	// 	const hello = require('../../../dist/hello.all.js');
	// 	expect(hello).to.be.a('function');
	// });
});