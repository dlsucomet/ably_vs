/**
 * @summary Checks if HTML follows WCAG Success Critereon 2.1.1 - Keyboard
 */
const { DiagnosticSeverity } = require("vscode-languageserver/node");

// A. If a <div> has the `class="button"` attribute
const pattern211a = /(<div(?=.*?class="button")[^>]*)(>)/g;
// B. If a <div> has the `class="form"` attribute
const pattern211b = /(<div(?=.*?class="form")[^>]*)(>)/g;

// Check WCAG 2.1.1
function checkWCAG211(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability) {
	checkWCAG211a(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability);
	checkWCAG211b(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability);
}

// Check pattern 2.1.1a
function checkWCAG211a(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability) {
	while ((m = pattern211a.exec(text)) && problems < settings.maxNumberOfProblems) {
		problems++;
		const diagnostic = {
		  severity: DiagnosticSeverity.Warning,
		  range: {
			start: textDocument.positionAt(m.index),
			end: textDocument.positionAt(m.index + m[0].length),
		  },
		  message: `All functionality should be operable with a keyboard. Choose between the two options.`,
		  source: "WCAG 2.1 | 2.1.1",
		};
		if (hasDiagnosticRelatedInformationCapability) {
		  diagnostic.relatedInformation = [
			{
			  location: {
				uri: textDocument.uri,
				range: Object.assign({}, diagnostic.range),
			  },
			  message: "Please change this to <button></button>",
			},
			{
			  location: {
				uri: textDocument.uri,
				range: Object.assign({}, diagnostic.range),
			  },
			  message:
				'Please change the `class` attribute to `role` and add `tabindex="0"` (ex: <div role="button" tabindex="0"></div>)',
			},
		  ];
		}
		diagnostics.push(diagnostic);
	}	
}

// Check pattern 2.1.1b
function checkWCAG211b(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability) {
	while (
		(m = pattern211b.exec(text)) &&
		problems < settings.maxNumberOfProblems
	) {
		problems++;
		const diagnostic = {
		  severity: node_1.DiagnosticSeverity.Warning,
		  range: {
			start: textDocument.positionAt(m.index),
			end: textDocument.positionAt(m.index + m[0].length),
		  },
		  message: `All functionality should be operable with a keyboard. Choose between the two options.`,
		  source: "WCAG 2.1 | 2.1.1",
		};
		if (hasDiagnosticRelatedInformationCapability) {
		  diagnostic.relatedInformation = [
			{
			  location: {
				uri: textDocument.uri,
				range: Object.assign({}, diagnostic.range),
			  },
			  message: "Please change this to &lt;form&gt;",
			},
		  ];
		}
		diagnostics.push(diagnostic);
	}
}

module.exports = checkWCAG211;