/**
 * npx localhost -p 8080;
 * npx mocha-headless-chrome -f http://localhost:8080/tests/specs/index.html
 */
import localhost from 'localhost';
import {runner} from 'mocha-headless-chrome';

const server = localhost('./');

const options = {
	file: 'http://localhost:8080/tests/specs/index.html',
	width: 800,
	height: 600,
	timeout: 120000,
};

server.listen(8080, async () => {
	try {
		const {result} = await runner(options);
		if (result.stats.failures) {
			throw 'Tests Failed';
		}
	} catch (e) {
		console.error(e);
		process.exit(1);
	} finally {
		server.close();
	}
});

