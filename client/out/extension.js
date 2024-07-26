/*
	extension.js sets up the language server to provide language features (auto completion, linting etc.) for HTML, CSS, JS.
*/
'use strict';
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, '__esModule', { value: true });
exports.deactivate = exports.activate = void 0;
const path = require('path');
const vscode_1 = require('vscode');
const node_1 = require('vscode-languageclient/node');
let client;

/*
	Called when the extension is activated. Path to the server module (server.js) is determined using context.asAbsolutePath.
	Debug options are specified to let the server run in Node Inspector mode.
	serverOptions object defines how server will run in both normal and debug.
*/
function activate(context) {
	// The server is implemented in node
	const serverModule = context.asAbsolutePath(path.join('server', 'out', 'server.js'));
	// The debug options for the server
	// --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
	const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };
	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	const serverOptions = {
		run: { module: serverModule, transport: node_1.TransportKind.ipc },
		debug: {
			module: serverModule,
			transport: node_1.TransportKind.ipc,
			options: debugOptions,
		},
	};
	// Options to control the language client
	const clientOptions = {
		// Register the server for HTML, JS, and CSS documents
		documentSelector: [
			{ scheme: 'file', language: 'html' },
			{ scheme: 'file', language: 'javascript' },
			{ scheme: 'file', language: 'css' },
		],
		synchronize: {
			// Watching the active editor for file changes to synchronize server with current state of the file (source: https://code.visualstudio.com/api/references/vscode-api#workspace.createFileSystemWatcher)
			fileEvents: vscode_1.workspace.createFileSystemWatcher(
				new vscode_1.RelativePattern(vscode_1.window.activeTextEditor.document.uri, '*')
			),
		},
	};
	// Create the language client and start the client.
	client = new node_1.LanguageClient(
		'languageServerExample',
		'Language Server Example',
		serverOptions,
		clientOptions
	);
	// Start the client. This will also launch the server
	client.start();
}

// Allows activate to be called by VSCode when extension activates, standard practice.
exports.activate = activate;

// Clean up resources if extension is deactivated
function deactivate() {
	// Does nothing if no client defined
	if (!client) {
		return undefined;
	}
	return client.stop();
}

// Allows deactivate to be called by VSCode when extension deactivates, standard practice.
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map
