/**
 * @summary Checks if HTML follows WCAG Success Critereon 1.3.5 - Identify Input Purpose
 */
const { DiagnosticSeverity } = require("vscode-languageserver/node");

// A. Input must have a name attribute
const pattern135a = /(<input(?!.*?name=(['"]).*?\2)[^>]*)(>)/g;
// B. Input must have a type attribute
const pattern135b = /<(input|textarea|select)(?![^>]*\btype=)([^>]*|)>[ \n]*<\/\1\s*>$/g;

// Check WCAG 1.3.5
function checkWCAG135(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability) {
	checkWCAG135a(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability);
	checkWCAG135b(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability);
}

// Check pattern 1.3.5a
function checkWCAG135a(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability) {
	while ((m = pattern135a.exec(text)) && problems < settings.maxNumberOfProblems) {
		problems++;
		const diagnostic = {
		  severity: DiagnosticSeverity.Warning,
		  range: {
			start: textDocument.positionAt(m.index),
			end: textDocument.positionAt(m.index + m[0].length),
		  },
		  message: `Headings and labels should be descriptive.`,
		  source: "WCAG 2.1 | 1.3.5",
		};
		if (hasDiagnosticRelatedInformationCapability) {
		  diagnostic.relatedInformation = [
			{
			  location: {
				uri: textDocument.uri,
				range: Object.assign({}, diagnostic.range),
			  },
			  message: "Please add a 'name' attribute (ex: <input name='/>)",
			},
		  ];
		}
		diagnostics.push(diagnostic);
	}
}

// Check pattern 1.3.5b
function checkWCAG135b(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability) {
	while (
		(m = pattern135b.exec(text)) &&
		problems < settings.maxNumberOfProblems
	) {
		problems++;
		const diagnostic = {
		  severity: DiagnosticSeverity.Warning,
		  range: {
			start: textDocument.positionAt(m.index),
			end: textDocument.positionAt(m.index + m[0].length),
		  },
		  message: `Input elements must have a type attributed to identify their purpose.`,
		  source: "WCAG 2.1 | 1.3.5",
		};
		if (hasDiagnosticRelatedInformationCapability) {
		  diagnostic.relatedInformation = [
			{
			  location: {
				uri: textDocument.uri,
				range: Object.assign({}, diagnostic.range),
			  },
			  message: "Use an appropriate type for input.",
			},
		  ];
		}
		diagnostics.push(diagnostic);
	}
}

module.exports = checkWCAG135;