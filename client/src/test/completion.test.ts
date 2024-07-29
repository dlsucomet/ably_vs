/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as vscode from 'vscode';
import * as assert from 'assert';
import { getDocUri, activate } from './helper';

/*
	Test suite with test case "Completes JS/TS in txt file"
	Asynch and uses testCompletion to perform checks
*/
suite('Should do completion', () => {
	const docUri = getDocUri('completion.txt');

	test('Completes JS/TS in txt file', async () => {
		await testCompletion(docUri, new vscode.Position(0, 0), {
			items: [
				{ label: 'JavaScript', kind: vscode.CompletionItemKind.Text },
				{ label: 'TypeScript', kind: vscode.CompletionItemKind.Text }
			]
		});
	});
});

/*
	Function activates document using activate function, opens document in VSCode and waits for language server.
	Simulates triggering completion and compares actual completion list with expected completion list.
	@param docUri: Uri of the document to be tested
	@param position: Position in the document
	@param expectedCompletionList: Expected completion list
*/
async function testCompletion(
	docUri: vscode.Uri,
	position: vscode.Position,
	expectedCompletionList: vscode.CompletionList
) {
	await activate(docUri);

	// Executing the command `vscode.executeCompletionItemProvider` to simulate triggering completion
	const actualCompletionList = (await vscode.commands.executeCommand(
		'vscode.executeCompletionItemProvider',
		docUri,
		position
	)) as vscode.CompletionList;

	/* 
		Ensures at least two items in list to ensure completion is returning reasonable number of suggestions
		Iterates over list and compares extepcted and actual.
	*/
	assert.ok(actualCompletionList.items.length >= 2);
	expectedCompletionList.items.forEach((expectedItem, i) => {
		const actualItem = actualCompletionList.items[i];
		assert.equal(actualItem.label, expectedItem.label);
		assert.equal(actualItem.kind, expectedItem.kind);
	});
}
