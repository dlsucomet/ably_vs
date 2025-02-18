/**
 * @summary Checks if HTML follows WCAG Success Critereon 1.3.4 - Orientation
 */
const { DiagnosticSeverity } = require("vscode-languageserver/node");

// Checks if background-position-x, background-position-y, background-size, 
// border-radius, font-size, height, left, letter-spacing, line-height, margin, 
// max-height, max-width, min-height, min-width, opacity, outline-offset, padding, right, 
// text-indent, top, transform-origin, width, and z-index uses px
const pattern134 = /(background-position-x|background-position-y|background-size|border-radius|height|left|letter-spacing|line-height|margin|max-height|min-height|min-width|opacity|outline-offset|padding|right|text-indent|top|transform-origin|(?<!max-)(width)|z-index):.*?\d+px.*?/g;

// Check WCAG 1.3.4
function checkWCAG134(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability) {
	while ((m = pattern134.exec(text)) && problems < settings.maxNumberOfProblems) {
		problems++;
		const diagnostic = {
		  severity: DiagnosticSeverity.Warning,
		  range: {
			start: textDocument.positionAt(m.index),
			end: textDocument.positionAt(m.index + m[0].length),
		  },
		  message: `Content should adapt to different screen sizes and display orientation.`,
		  source: "WCAG 2.1 | 1.3.4",
		};
		if (hasDiagnosticRelatedInformationCapability) {
		  diagnostic.relatedInformation = [
			{
			  location: {
				uri: textDocument.uri,
				range: Object.assign({}, diagnostic.range),
			  },
			  message:
				"Use % for sizes to ensure compatibility with different orientations and add a media query for other screen sizes.",
			},
		  ];
		}
		diagnostics.push(diagnostic);
	}
}

module.exports = checkWCAG134;