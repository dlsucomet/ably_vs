/**
 * @summary Checks if HTML follows WCAG Success Critereon 4.1.3 - Status Messages
 */
const { DiagnosticSeverity } = require("vscode-languageserver/node");

// Status messages should have an aria-live attribute and "status" as its role attribute
const pattern413 = /<div\s+(?=[^>]*\brole=["']status["'])(?![^>]*\baria-live=["'])[^\s>]*>/g;

// Check WCAG 4.1.3
function checkWCAG413(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability) {
	while ((m = pattern413.exec(text)) && problems < settings.maxNumberOfProblems) {
		problems++;
		const diagnostic = {
		  severity: DiagnosticSeverity.Warning,
		  range: {
			start: textDocument.positionAt(m.index),
			end: textDocument.positionAt(m.index + m[0].length),
		  },
		  message: `Status messages should both have an aria-live attribute and "status" as its role attribute.`,
		  source: "WCAG 2.1 | 4.1.3",
		};
		if (hasDiagnosticRelatedInformationCapability) {
		  diagnostic.relatedInformation = [
			{
			  location: {
				uri: textDocument.uri,
				range: Object.assign({}, diagnostic.range),
			  },
			  message: 'Please add an `aria-live` attribute.',
			},
		  ];
		}
		diagnostics.push(diagnostic);
	}
}

module.exports = checkWCAG413;