/**
 * @summary Goes through every regex file and checks if HTML follows a certain WCAG Success Criteria
 */
// const checkWCAGxyz = require("./wcagxyz");
const checkWCAG131 = require("./wcag131");
const checkWCAG134 = require("./wcag134");
const checkWCAG135 = require("./wcag135");
const checkWCAG144 = require("./wcag144");
const checkWCAG211 = require("./wcag211");
const checkWCAG253 = require("./wcag253");
const checkWCAG413 = require("./wcag413");

function checkWCAG(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability) {
  // checkWCAGxyz(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability);
  checkWCAG131(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability);
  checkWCAG134(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability);
  checkWCAG135(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability);
  checkWCAG144(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability);
  checkWCAG211(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability);
  checkWCAG253(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability);
  checkWCAG413(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability);
}

module.exports = checkWCAG;