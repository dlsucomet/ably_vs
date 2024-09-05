/**
 * @summary Checks if HTML follows WCAG Success Critereon 1.4.4 - Resize Text
 */
const { DiagnosticSeverity } = require("vscode-languageserver/node");

// Font-size shouldn't use px or pt
const pattern144 = /(font-size:.*?\d+(px|pt).*?)/g;

// Check WCAG 1.4.4
function checkWCAG144(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability) {
	while ((m = pattern144.exec(text)) && problems < settings.maxNumberOfProblems) {
		problems++;
		const diagnostic = {
		  severity: DiagnosticSeverity.Warning,
		  range: {
			start: textDocument.positionAt(m.index),
			end: textDocument.positionAt(m.index + m[0].length),
		  },
		  message: `Text content should be scalable to 200% without any loss of information or functionality.`,
		  source: "WCAG 2.1 | 1.4.4",
		};
		if (hasDiagnosticRelatedInformationCapability) {
		  diagnostic.relatedInformation = [
			{
			  location: {
				uri: textDocument.uri,
				range: Object.assign({}, diagnostic.range),
			  },
			  message:
				"Please change your font size unit from px to other much more flexible units such as rem or em to scale the content effectively.",
			},
		  ];
		}
		diagnostics.push(diagnostic);
	}
}

module.exports = checkWCAG144;