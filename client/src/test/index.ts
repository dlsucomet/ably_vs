/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import * as path from 'path';
import * as Mocha from 'mocha';
import * as glob from 'glob';

/*
	Mocha test suites
	Returns promise that resolves if successful
*/
export function run(): Promise<void> {
	// Create the mocha test
	const mocha = new Mocha({
		ui: 'tdd',
		color: true
	});
	mocha.timeout(100000);

	//	Current directory
	const testsRoot = __dirname;

	/*
		Return Promise using glob to find all test files matching test.js in directory
		Each file added to mocha instance then run tests
	*/
	return new Promise((resolve, reject) => {
		glob('**.test.js', { cwd: testsRoot }, (err, files) => {
			if (err) {
				return reject(err);
			}

			// Add files to the test suite
			files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

			try {
				// Run the mocha test
				mocha.run(failures => {
					if (failures > 0) {
						reject(new Error(`${failures} tests failed.`));
					} else {
						resolve();
					}
				});
			} catch (err) {
				console.error(err);
				reject(err);
			}
		});
	});
}