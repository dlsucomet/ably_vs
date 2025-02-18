/**
 * @summary Processes the W3C results to the format for AB.LY 
 */
const { DiagnosticSeverity } = require("vscode-languageserver/node");
const W3CtoWCAG = require("../dicts/w3c-wcag");
const suggestAltText = require("../helpers/img-caption");

// Process an error in the W3C results
async function processW3C(msg, diagnostics, problems, settings, textDocument, hasDiagnosticRelatedInformationCapability) {
    if (problems >= settings.maxNumberOfProblems) { return; }
    problems++;
	// Find the WCAG rule that corresponds to the W3C rule
    const wcag = W3CtoWCAG.find((element) => msg.message.includes(element.ruleid));
	// Check if rule not found
    if (wcag == undefined) { return; }
	// If the extract is about an image, generate an alt text
	if (wcag.suggestMsg.includes("Please add an 'alt' attribute to your image")) {
		const extractedTag = msg.extract;
		if (extractedTag) {
			const imgTag = extractedTag.match(/<img[^>]*>/g)[0];
			const imgSrc = imgTag.match(/src\s*=\s*['"`](.*?)['"`]/i)[1];
			try {
			const altText = await suggestAltText(imgSrc);
			wcag.suggestMsg = `Please add an 'alt' attribute to your image element to ensure accessibility${altText}`;
			} catch (error) {
			// console.error('Error fetching alt text:', error);
			}
		}
		}
	// Add a diagnostic
    const diagnostic = {
    	severity: DiagnosticSeverity.Warning,
    	range: {
        	start: {line: msg.lastLine - 1, character: msg.firstColumn},
        	end: {line: msg.lastLine - 1, character: msg.lastColumn - 1}
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

module.exports = processW3C;