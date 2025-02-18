/**
 * @summary Checks if HTML follows WCAG Success Critereon 2.5.3 - Label in Name
 */
const { DiagnosticSeverity } = require("vscode-languageserver/node");

// A. Button elements must have an aria-label or aria-labelledby attribute
const pattern253a = /<button(?![^>]*(?:aria-label|aria-labelledby)[^>]*)(?:(?<=\sname=)[^>\s]+)?(?:(?<=\svalue=)['"][^'"]*['"])?(?:\s+aria-label=(?:""|''))?[^>]*>/g;
// B. Input elements must have an aria-label or aria-labelledby attribute
const pattern253b = /<input(?![^>]*(?:aria-label|aria-labelledby)[^>]*)(?:(?<=\sname=)[^>\s]+)?(?:(?<=\svalue=)['"][^'"]*['"])?(?:\s+aria-label=(?:""|''))?[^>]*>/g;
// C. Textarea elements must have an aria-label or aria-labelledby attribute
const pattern253c = /<textarea(?![^>]*(?:aria-label|aria-labelledby)[^>]*)(?:(?<=\sname=)[^>\s]+)?(?:(?<=\svalue=)['"][^'"]*['"])?(?:\s+aria-label=(?:""|''))?[^>]*>/g;
// D. Select elements must have an aria-label or aria-labelledby attribute
const pattern253d = /<select(?![^>]*(?:aria-label|aria-labelledby)[^>]*)(?:(?<=\sname=)[^>\s]+)?(?:(?<=\svalue=)['"][^'"]*['"])?(?:\s+aria-label=(?:""|''))?[^>]*>/g;

// Check WCAG 2.5.3
function checkWCAG253(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability) {
	checkWCAG253a(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability);
	checkWCAG253b(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability);
	checkWCAG253c(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability);
	checkWCAG253d(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability);
}

// Check pattern 2.5.3a
function checkWCAG253a(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability) {
	while ((m = pattern253a.exec(text)) && problems < settings.maxNumberOfProblems) {
		problems++;
		const diagnostic = {
		  severity: DiagnosticSeverity.Warning,
		  range: {
			start: textDocument.positionAt(m.index + 1),
			end: textDocument.positionAt(m.index + m[0].length - 1),
		  },
		  message: `The button element needs more context.`,
		  source: "WCAG 2.1 | 2.5.3",
		};
		if (hasDiagnosticRelatedInformationCapability) {
		  diagnostic.relatedInformation = [
			{
			  location: {
				uri: textDocument.uri,
				range: Object.assign({}, diagnostic.range),
			  },
			  message:
				'Add the appropriate aria-label to the input element.',
			},
		  ];
		}
		diagnostics.push(diagnostic);
	}
}

// Check pattern 2.5.3b
function checkWCAG253b(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability) {
	while (
		(m = pattern253b.exec(text)) &&
		problems < settings.maxNumberOfProblems
	  ) {
		problems++;
		const diagnostic = {
		  severity: DiagnosticSeverity.Warning,
		  range: {
			start: textDocument.positionAt(m.index + 1),
			end: textDocument.positionAt(m.index + m[0].length - 1),
		  },
		  message: `The input element needs more context.`,
		  source: "WCAG 2.1 | 2.5.3",
		};
		if (hasDiagnosticRelatedInformationCapability) {
		  diagnostic.relatedInformation = [
			{
			  location: {
				uri: textDocument.uri,
				range: Object.assign({}, diagnostic.range),
			  },
			  message: "Add the appropriate aria-label to the input element.",
			},
		  ];
		}
		diagnostics.push(diagnostic);
	}
}

// Check pattern 2.5.3c
function checkWCAG253c(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability) {
	while (
		(m = pattern253c.exec(text)) &&
		problems < settings.maxNumberOfProblems
	) {
		problems++;
		const diagnostic = {
		  severity: DiagnosticSeverity.Warning,
		  range: {
			start: textDocument.positionAt(m.index + 1),
			end: textDocument.positionAt(m.index + m[0].length - 1),
		  },
		  message: `The textarea element needs more context.`,
		  source: "WCAG 2.1 | 2.5.3",
		};
		if (hasDiagnosticRelatedInformationCapability) {
		  diagnostic.relatedInformation = [
			{
			  location: {
				uri: textDocument.uri,
				range: Object.assign({}, diagnostic.range),
			  },
			  message: "Add the appropriate aria-label to the textarea element.",
			},
		  ];
		}
		diagnostics.push(diagnostic);
	}
}

// Check pattern 2.5.3d
function checkWCAG253d(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability) {
	while (
		(m = pattern253d.exec(text)) &&
		problems < settings.maxNumberOfProblems
	) {
		problems++;
		const diagnostic = {
		  severity: DiagnosticSeverity.Warning,
		  range: {
			start: textDocument.positionAt(m.index + 1),
			end: textDocument.positionAt(m.index + m[0].length - 1),
		  },
		  message: `The select element needs more context.`,
		  source: "WCAG 2.1 | 2.5.3",
		};
		if (hasDiagnosticRelatedInformationCapability) {
		  diagnostic.relatedInformation = [
			{
			  location: {
				uri: textDocument.uri,
				range: Object.assign({}, diagnostic.range),
			  },
			  message: "Add the appropriate aria-label to the select element.",
			},
		  ];
		}
		diagnostics.push(diagnostic);
	}
}

module.exports = checkWCAG253;