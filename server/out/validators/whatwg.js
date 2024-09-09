/**
 * @summary Processes the WHATWG results to the format for AB.LY 
 */
const { DiagnosticSeverity } = require("vscode-languageserver/node");
const WHATWGtoWCAG = require("../dicts/whatwg-wcag");

// Checks if there is already an existing diagnostic
function isAlreadyExisting(msg, wcag, diagnostics) {
	return diagnostics.find((diagnostic) => diagnostic.range.start.line === (msg.line - 1) &&
		(diagnostic.range.start.character - msg.column) === -1 &&
		diagnostic.message === wcag.errorMsg);
}

// Process an error in the WHATWG results
function processWHATWG(msg, diagnostics, problems, settings, textDocument, hasDiagnosticRelatedInformationCapability) {
	if (problems >= settings.maxNumberOfProblems) { return; }
	problems++;
	// Find the WCAG rule that corresponds to the W3C rule
	const wcag = WHATWGtoWCAG.find((element) => element.ruleid == msg.ruleId);
	// Check if rule not found or if already exists
	if (wcag == undefined || isAlreadyExisting(msg, wcag, diagnostics)) { return; }
	// Add a diagnostic
	const diagnostic = {
		severity: DiagnosticSeverity.Warning,
		range: {
			start: {
				line: msg.line - 1,
				character: msg.column - 1,
			},
			end: {
				line: msg.line - 1,
				character: msg.column - 1 + msg.size,
			},
		},
		message: wcag.errorMsg,
		source: wcag.wcag,
	};
	if (hasDiagnosticRelatedInformationCapability) {
		diagnostic.relatedInformation = [
			{
				location: {
				uri: textDocument.uri,
				range: Object.assign({}, diagnostic.range),
				},
				message: wcag.suggestMsg,
			},
		];
	}
	diagnostics.push(diagnostic);
}

module.exports = processWHATWG;