/**
 * Headless test runner using Puppeteer directly
 */
import localhost from 'localhost';
import puppeteer from 'puppeteer';

const server = localhost('./');

server.listen(8080, async () => {
	let browser;
	try {
		// Launch browser with CI-friendly flags
		browser = await puppeteer.launch({
			headless: true,
			args: [
				'--no-sandbox',
				'--disable-setuid-sandbox',
				'--disable-dev-shm-usage',
				'--disable-gpu',
				'--disable-extensions',
				'--disable-background-timer-throttling',
				'--disable-backgrounding-occluded-windows',
				'--disable-renderer-backgrounding'
			]
		});

		const page = await browser.newPage();
		await page.setViewport({width: 800, height: 600});
		
		// Navigate to test page
		await page.goto('http://localhost:8080/tests/specs/index.html', {waitUntil: 'networkidle2'});
		
		// Wait for tests to complete
		await new Promise(resolve => setTimeout(resolve, 5000));
		
		// Get test results from the DOM
		const testResults = await page.evaluate(() => {
			const mocha = document.querySelector('#mocha');
			if (!mocha) return {error: 'No mocha element found'};
			
			const passes = mocha.querySelectorAll('.pass').length;
			const failures = mocha.querySelectorAll('.fail').length;
			const pending = mocha.querySelectorAll('.pending').length;
			
			return {
				passes,
				failures,
				pending,
				total: passes + failures + pending
			};
		});
		
		// Check for failures
		if (testResults.failures > 0) {
			throw new Error(`Tests Failed: ${testResults.failures} failures out of ${testResults.total} tests`);
		}
		
		if (testResults.total === 0) {
			throw new Error('No tests were found or executed');
		}
		
		console.log(`Tests completed successfully: ${testResults.passes} passed, ${testResults.pending} pending`);
		
	} catch (e) {
		console.error(e);
		process.exit(1);
	} finally {
		if (browser) {
			await browser.close();
		}
		server.close();
	}
});

