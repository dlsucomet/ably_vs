/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as vscode from 'vscode';
import * as path from 'path';
//	Variables for managing the vscode extension
export let doc: vscode.TextDocument;
export let editor: vscode.TextEditor;
export let documentEol: string;
export let platformEol: string;

/**
 * Activates the vscode.lsp-sample extension
 */
export async function activate(docUri: vscode.Uri) {
	// The extensionId is `publisher.name` from package.json
	const ext = vscode.extensions.getExtension('vscode-samples.lsp-sample')!;
	await ext.activate();
	//	Attempts to open a text document specified by docUri, then shows it in the editor
	try {
		doc = await vscode.workspace.openTextDocument(docUri);
		editor = await vscode.window.showTextDocument(doc);
		await sleep(2000); // Wait for server activation
	} catch (e) {
		console.error(e);
	}
}

// Introduce delay
async function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

//	Construct absolute path to test figure file
export const getDocPath = (p: string) => {
	return path.resolve(__dirname, '../../testFixture', p);
};

//	Convert path to uri object for VSCode API to interact with
export const getDocUri = (p: string) => {
	return vscode.Uri.file(getDocPath(p));
};

// 	Replaces content with provided string
export async function setTestContent(content: string): Promise<boolean> {
	const all = new vscode.Range(
		doc.positionAt(0),
		doc.positionAt(doc.getText().length)
	);
	return editor.edit(eb => eb.replace(all, content));
}
