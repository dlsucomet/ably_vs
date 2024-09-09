/**
 * @summary Checks if HTML follows WCAG Success Critereon 1.3.1 - Info and Relationships 
 */
const { DiagnosticSeverity } = require("vscode-languageserver/node");

// A. Nav landmark element should have a ul element (list)
const pattern131a = /<nav[^>]*>(?:(?!<\/?ul)[\s\S])*<\/nav>/g;
// B. <footer> should be the last landmark element before the closing body tag
const pattern131b = /<footer\b[\s\S]*?<\/footer>(?:(?!(header|main|nav|aside|article|section|footer)\b)[\s\S])*?(<header\b[\s\S]*?<\/header>|<main\b[\s\S]*?<\/main>|<nav\b[\s\S]*?<\/nav>|<aside\b[\s\S]*?<\/aside>|<article\b[\s\S]*?<\/article>|<section\b[\s\S]*?<\/section>|<footer\b[\s\S]*?<\/footer>)[\s\S]*?<\/body>[\s\S]*?<\/html>/g;
// C. main landmark element should have role="main"
const pattern131c = /^(?!.*<main.*role=["']main["'].*>).*<main.*>/g;
// D. header landmark element should have role="banner"
const pattern131d = /^(?!.*<header.*role=["']banner["'].*>).*<header.*>/g;
// E. nav landmark element should have role="navigation"
const pattern131e = /^(?!.*<nav.*role=["']navigation["'].*>).*<nav.*>/g;
// F. aside landmark element should have role="complementary"
const pattern131f = /^(?!.*<aside.*role=["']complementary["'].*>).*<aside.*>/g;
// G. footer landmark element should have role="contentinfo"
const pattern131g = /^(?!.*<footer.*role=["']contentinfo["'].*>).*<footer.*>/g;
// H. span shouldn't have a font attribute
const pattern131h = /(span {[\s\S\n]+?.*?)(font-.*?)[\s\S\n]+?(})/g;

// Check WCAG 1.3.1
function checkWCAG131(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability) {
	checkDocument131a(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability);
	checkDocument131b(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability);
	checkDocument131c(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability);
	checkDocument131d(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability);
	checkDocument131e(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability);
	checkDocument131f(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability);
	checkDocument131g(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability);
	checkDocument131h(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability);
}

// Checks pattern 1.3.1a
function checkDocument131a(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability) {
	while (
		(m = pattern131a.exec(text)) &&
    	(problems < settings.maxNumberOfProblems)
  	) {
		problems++;
		const diagnostic = {
			severity: DiagnosticSeverity.Warning,
			range: {
				start: textDocument.positionAt(m.index + 1),
				end: textDocument.positionAt(m.index + m[0].length - 1)
			},
			message: `Navbars should be more accessible. Provide structure and semantic meaning to the navigation links.`,
			source: "WCAG 2.1 | 1.3.1",
    	};
		if (hasDiagnosticRelatedInformationCapability) {
			diagnostic.relatedInformation = [
				{
					location: {
						uri: textDocument.uri,
						range: Object.assign({}, diagnostic.range),
					},
					message: "Please use lists."
				}
			];
    	}
    	diagnostics.push(diagnostic);
  	}
}

// Checks pattern 1.3.1b
function checkDocument131b(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability) {
	while (
		(m = pattern131b.exec(text)) &&
		(problems < settings.maxNumberOfProblems)
	) {
		problems++;
		const diagnostic = {
		  	severity: DiagnosticSeverity.Warning,
		  	range: {
				start: textDocument.positionAt(m.index + 1),
				end: textDocument.positionAt(m.index + m[0].length - 1),
		  	},
			message: `The footer element must be in its proper place. There should also be only one footer element per page.`,
		  	source: "WCAG 2.1 | 1.3.1",
		};
		if (hasDiagnosticRelatedInformationCapability) {
		  diagnostic.relatedInformation = [
			{
			  location: {
				uri: textDocument.uri,
				range: Object.assign({}, diagnostic.range),
			  },
			  message: "Place the footer element after all other landmark elements and remove duplicates of the footer element, if any.",
			},
		  ];
		}
		diagnostics.push(diagnostic);
	}
}

// Checks pattern 1.3.1c
function checkDocument131c(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability) {
	while (
		(m = pattern131c.exec(text)) &&
		problems < settings.maxNumberOfProblems
		) {
		problems++;
		const diagnostic = {
			severity: DiagnosticSeverity.Warning,
			range: {
			start: textDocument.positionAt(m.index + 1),
			end: textDocument.positionAt(m.index + m[0].length - 1),
			},
			message: `The main landmark element must have additional context.`,
			source: "WCAG 2.1 | 1.3.1",
		};
		if (hasDiagnosticRelatedInformationCapability) {
			diagnostic.relatedInformation = [
			{
				location: {
				uri: textDocument.uri,
				range: Object.assign({}, diagnostic.range),
				},
				message: "Add the appropriate role, main, to the landmark element.",
			},
			];
		}
		diagnostics.push(diagnostic);
	}
}

// Checks pattern 1.3.1d
function checkDocument131d(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability) {
	while (
	(m = pattern131d.exec(text)) &&
	problems < settings.maxNumberOfProblems
	) {
		problems++;
		const diagnostic = {
			severity: DiagnosticSeverity.Warning,
			range: {
			start: textDocument.positionAt(m.index + 1),
			end: textDocument.positionAt(m.index + m[0].length - 1),
			},
			message: `The header landmark element must have additional context.`,
			source: "WCAG 2.1 | 1.3.1",
		};
		if (hasDiagnosticRelatedInformationCapability) {
			diagnostic.relatedInformation = [
			{
				location: {
				uri: textDocument.uri,
				range: Object.assign({}, diagnostic.range),
				},
				message: "Add the appropriate role, banner, to the landmark element.",
			},
			];
		}
		diagnostics.push(diagnostic);
	}
}

// Checks pattern 1.3.1e
function checkDocument131e(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability) {
	while (
		(m = pattern131e.exec(text)) &&
		problems < settings.maxNumberOfProblems
	  ) {
		problems++;
		const diagnostic = {
		  severity: DiagnosticSeverity.Warning,
		  range: {
			start: textDocument.positionAt(m.index + 1),
			end: textDocument.positionAt(m.index + m[0].length - 1),
		  },
		  message: `The nav landmark element must have additional context.`,
		  source: "WCAG 2.1 | 1.3.1",
		};
		if (hasDiagnosticRelatedInformationCapability) {
		  diagnostic.relatedInformation = [
			{
			  location: {
				uri: textDocument.uri,
				range: Object.assign({}, diagnostic.range),
			  },
			  message: "Add the appropriate role, navigation, to the landmark element.",
			},
		  ];
		}
		diagnostics.push(diagnostic);
	}	
}

// Checks pattern 1.3.1f
function checkDocument131f(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability) {
	while (
		(m = pattern131f.exec(text)) &&
		problems < settings.maxNumberOfProblems
	  ) {
		problems++;
		const diagnostic = {
		  severity: DiagnosticSeverity.Warning,
		  range: {
			start: textDocument.positionAt(m.index + 1),
			end: textDocument.positionAt(m.index + m[0].length - 1),
		  },
		  message: `The aside landmark element must have additional context.`,
		  source: "WCAG 2.1 | 1.3.1",
		};
		if (hasDiagnosticRelatedInformationCapability) {
		  diagnostic.relatedInformation = [
			{
			  location: {
				uri: textDocument.uri,
				range: Object.assign({}, diagnostic.range),
			  },
			  message: "Add the appropriate role, complementary, to the landmark element.",
			},
		  ];
		}
		diagnostics.push(diagnostic);
	}
}

// Checks pattern 1.3.1g
function checkDocument131g(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability) {
	while (
		(m = pattern131g.exec(text)) &&
		problems < settings.maxNumberOfProblems
	  ) {
		problems++;
		const diagnostic = {
		  severity: DiagnosticSeverity.Warning,
		  range: {
			start: textDocument.positionAt(m.index + 1),
			end: textDocument.positionAt(m.index + m[0].length - 1),
		  },
		  message: `The footer landmark element must have additional context.`,
		  source: "WCAG 2.1 | 1.3.1",
		};
		if (hasDiagnosticRelatedInformationCapability) {
		  diagnostic.relatedInformation = [
			{
			  location: {
				uri: textDocument.uri,
				range: Object.assign({}, diagnostic.range),
			  },
			  message: "Add the appropriate role, contentinfo, to the landmark element.",
			},
		  ];
		}
		diagnostics.push(diagnostic);
	}
}

// Checks pattern 1.3.1h
function checkDocument131h(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability) {
	while ((m = pattern131h.exec(text)) && problems < settings.maxNumberOfProblems) {
		problems++;
		const diagnostic = {
		  severity: DiagnosticSeverity.Warning,
		  range: {
			start: textDocument.positionAt(m.index + 1),
			end: textDocument.positionAt(m.index + m[0].length - 1),
		  },
		  message: `Span has a 'font' attribute. Try making it simpler and more intuitive.`,
		  source: "WCAG 2.1 | 1.3.1",
		};
		if (hasDiagnosticRelatedInformationCapability) {
		  diagnostic.relatedInformation = [
			{
			  location: {
				uri: textDocument.uri,
				range: Object.assign({}, diagnostic.range),
			  },
			  message:
				"Remove this from its style. Use the appropriate HTML tag instead of <span></span>.",
			},
		  ];
		}
		diagnostics.push(diagnostic);
	}
}

module.exports = checkWCAG131;
