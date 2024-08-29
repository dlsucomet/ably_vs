"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
const node_1 = require("vscode-languageserver/node");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const validator = require("@pamkirsten/html-validator");
// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = (0, node_1.createConnection)(node_1.ProposedFeatures.all);
// Create a simple text document manager.
const documents = new node_1.TextDocuments(
  vscode_languageserver_textdocument_1.TextDocument
);
let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

// WHATWG Dictionary for what WCAG rules are being checked
const WHATWGtoRule = [
  { 
    ruleid: "area-alt",
    wcag: "WCAG 2.2 | 1.1.1, 2.4.4, 2.4.9",
    errorMsg: "'alt' attribute must be set and non-empty when the 'href' attribute is present (area-alt)",
    suggestMsg: "Please add an 'alt' and 'href' attribute to your area element to ensure accessibility."
  },
  { 
    ruleid: "aria-hidden-body", 
    wcag: "WCAG 2.2",
    errorMsg: "aria-hidden must not be used on <body>",
    suggestMsg: "Please do not use aria-hidden attribute in the <body> element",
  },
  { 
    ruleid: "aria-label-misuse", 
    wcag: "WCAG 2.2",
    errorMsg: "'aria-label' cannot be used on this element",
    suggestMsg: "Please do not use aria-label on this element"
  },
  { 
    ruleid: "empty-heading", 
    wcag: "WCAG 2.2 | 2.4.6",
    errorMsg: "Headings cannot be empty.",
    suggestMsg: "Please make sure to provide descriptive headings for your content."
  },
  { 
    ruleid: "empty-title", 
    wcag: "WCAG 2.2 | 2.4.2",
    errorMsg: "Title cannot be empty.",
    suggestMsg: "Please make sure to provide a descriptive title"
  },
  { 
    ruleid: "hidden-focusable", 
    wcag: "WCAG 2.2",
    errorMsg: "aria-hidden cannot be used on focusable elements",
    suggestMsg: "Please remove aria-hidden or remove the element"
  },
  { ruleid: "input-missing-label", 
    wcag: "WCAG 2.2",
    errorMsg: "Input is missing a label",
    suggestMsg: "Please add a label attribute to your input."
  },
  { ruleid: "meta-refresh", 
    wcag: "WCAG2 2.2 | 2.2.1, 2.2.4, 3.2.5",
    errorMsg: "Meta refresh should either be instant or not be used.",
    suggestMsg: "Please remove it if not necessary or set it to 0 seconds.",
  },
  { 
    ruleid: "multiple-labeled-controls", 
    wcag: "WCAG 2.2",
    errorMsg: "Label must not be associated with multiple controls.",
    suggestMsg: "Please make sure that each label is associated with only one control.",
  },
  { 
    ruleid: "no-autoplay", 
    wcag: "WCAG 2.2",
    errorMsg: "Autoplay should not be used as it can be disruptive to users.",
    suggestMsg: "Please remove the autoplay attribute from your media element.",
  },
  { 
    ruleid: "wcag/h30", 
    wcag: "WCAG 2.2 | 1.1.1, 2.4.4, 2.4.9",
    errorMsg: "Anchor link must have a text describing its purpose.",
    suggestMsg: "Please add either an 'alt' tribute inside your anchor link or a text describing it."
  },
  { 
    ruleid: "wcag/h32", 
    wcag: "WCAG 2.2 | 3.2.2",
    errorMsg: "Form elements must have a submit button",
    suggestMsg: "Please add submit button on your form group.",
  },
  { 
    ruleid: "wcag/h36", 
    wcag: "WCAG 2.2 | 1.1.1",
    errorMsg: "Images used as submit buttons should have a non-empty alt attribute.",
    suggestMsg: "Please add an 'alt' attribute to your image element to ensure accessibility: <img src='...' alt='Submit button'>"
  },
  { 
    ruleid: "wcag/h37", 
    wcag: "WCAG 2.2 | 1.1.1",
    errorMsg: "Image elements should have an alt attribute.",
    suggestMsg: `Please add an 'alt' attribute to your image element to ensure accessibility: <img src='...' alt=>`,
  },
  { 
    ruleid: "wcag/h63", 
    wcag: "WCAG 2.2 | 1.3.1",
    errorMsg: "Header elements must have content and be properly nested.",
    suggestMsg: "Please add a valid scope attribute (row, col, rowgroup, colgroup) to your header element.",
  },
  { 
    ruleid: "wcag/h67", 
    wcag: "WCAG 2.2 | 1.1.1",
    errorMsg: "Image elements should have an alt attribute.",
    suggestMsg: `Please add an 'alt' attribute to your image element to ensure accessibility: <img src='...' alt=>`,
  },
  { ruleid: "wcag/h71", 
    wcag: "WCAG 2.2 | 1.3.1, 3.3.2",
    errorMsg: "Fieldset must contain a legend element.",
    suggestMsg: "Please add a <legend> element to your fieldset.",
  },
  { ruleid: "long-title", 
    wcag: "WCAG 2.2 | 2.4.2",
    errorMsg: "Title text cannot be longer than 70 characters.",
    suggestMsg: "Please limit your webpage title to below 70 characters for better SEO.",
  },
  { 
    ruleid: "heading-level", 
    wcag: "WCAG 2.2 | 2.4.10",
    errorMsg: "Heading level can only increase by one.",
    suggestMsg: "Please check if your headings start at h1 and if it only increases one level at a time. (h1>h6)",
  }
];

// W3C Dictionary for what WCAG rules are being checked
const W3CtoRule = [
  {
    ruleid:`An “img” element must have an “alt” attribute`,
    wcag: "WCAG 2.1 | 1.1.1",
    errorMsg: "Image elements should have an alt attribute.",
    suggestMsg: `Please add an 'alt' attribute to your image element to ensure accessibility: <img src='...' alt=>`,
  },
  {
    ruleid: "Unclosed element",
    wcag: "WCAG 2.1 | 4.1.1",
    errorMsg: "Element must have a proper opening/closing tag.",
    suggestMsg: "Please add the appropriate HTML tag to complete.",
  },
  {
    ruleid: "Stray end tag",
    wcag: "WCAG 2.1 | 4.1.1",
    errorMsg: "Element must have a proper opening/closing tag.",
    suggestMsg: "Please add the appropriate HTML tag to complete.",
  },
  {
    ruleid: "Duplicate ID",
    wcag: "WCAG 2.1 | 4.1.1",
    errorMsg: "Element must have unique IDs.",
    suggestMsg: "Please make sure all your attributes have different and unique IDs.",
  },
  {
    ruleid: `Element “title” must not be empty.`,
    wcag: "WCAG 2.1 | 2.4.2",
    errorMsg: "Element title cannot be empty, must have text content",
    suggestMsg: "Please add a descriptive title to your content.",
  },
  {
    ruleid: "missing a required instance of child element",
    wcag: "WCAG 2.1 | 2.4.2",
    errorMsg: "Element title cannot be empty, must have text content",
    suggestMsg: "Please add a descriptive title to your content.",
  },
  {
    ruleid: "is missing a required instance of child element",
    wcag: "WCAG 2.1 | 2.4.2",
    errorMsg: "Web pages must have a descriptive and concise title that accurately reflects the topic or purpose of the page.",
    suggestMsg: "Please add a descriptive and concise title to your web page using the 'title' element within the 'head' section.",
  },
  {
    ruleid: `Consider adding a “lang” attribute to the “html” start tag to declare the language of this document.`,
    wcag: "WCAG 2.1 | 3.1.1",
    errorMsg: "You must programatically define the primary language of each page.",
    suggestMsg: "Please add a lang attribute to the HTML tag and state the primary language.",
  },
  {
    ruleid: `Element “area” is missing required attribute “alt”`,
    wcag: "WCAG 2.1 | 1.1.1",
    errorMsg: "'Area' elements should have an alt attribute.",
    suggestMsg: "Please add an 'alt' attribute to your area element to ensure accessibility.",
  },
  {
    ruleid: `Element “area” is missing required attribute “href”`,
    wcag: "WCAG 2.1 | 1.1.1",
    errorMsg: "'Area' elements should have an href attribute.",
    suggestMsg: "Make sure there is an 'href' present in your area element.",
  },
  {
    ruleid: "<input> element does not have a <label>",
    wcag: "WCAG 2.1 | 1.1.1",
    errorMsg: "Input is missing a label",
    suggestMsg: "Please add a label attribute to your input.",
  },
  {
    ruleid: "title text cannot be longer than 70 characters",
    wcag: "WCAG 2.1 | 2.4.2",
    errorMsg: "Title text cannot be longer than 70 characters.",
    suggestMsg: "Please limit your webpage title to below 70 characters for better SEO.",
  },
  {
    ruleid: "Anchor link must have a text describing its purpose",
    wcag: "WCAG 2.1 | 2.4.4",
    errorMsg: "Anchor link must have a text describing its purpose.",
    suggestMsg: "Please add either an 'alt' tribute inside your anchor link or a text describing it.",
  },
  {
    ruleid: "Empty Heading",
    wcag: "WCAG 2.1 | 2.4.6",
    errorMsg: "Headings cannot be empty.",
    suggestMsg: "Please make sure to provide descriptive headings for your content.",
  },
  {
    ruleid: "Heading level can only increase by one, expected <h2> but got <h3>",
    wcag: "WCAG 2.1 | 2.4.10",
    errorMsg: "Heading level can only increase by one.",
    suggestMsg: "Please check if your headings start at h1 and if it only increases one level at a time. (h1>h6)",
  },
  {
    ruleid: `Element “area” is missing required attribute “alt”`,
    wcag: "WCAG 2.1 | 1.1.1",
    errorMsg: "'Area' elements should have an alt attribute.",
    suggestMsg: "Please add an 'alt' attribute to your area element to ensure accessibility.",
  },
  {
    ruleid: `Element “area” is missing required attribute “href”`,
    wcag: "WCAG 2.1 | 1.1.1",
    errorMsg: "'Area' elements should have an href attribute.",
    suggestMsg: "Make sure there is an 'href' present in your area element.",
  },
  {
    ruleid: "<input> element does not have a <label>",
    wcag: "WCAG 2.1 | 1.1.1",
    errorMsg: "Input is missing a label",
    suggestMsg: "Please add a label attribute to your input.",
  },
  {
    ruleid: "<form> element must have a submit button",
    wcag: "WCAG 2.1 | 3.2.2",
    errorMsg: "Form elements must have a submit button",
    suggestMsg: "Please add submit button on your form group.",
  },
  {
    ruleid: "<textarea> element does not have a <label>",
    wcag: "WCAG 2.1 | 3.3.2",
    errorMsg: "Textarea is missing a label",
    suggestMsg: "Please add a label attribute to your input.",
  },
  {
    ruleid: "<input> element does not have a <label>",
    wcag: "WCAG 2.1 | 3.3.2",
    errorMsg: "Input is missing a label",
    suggestMsg: "Please add a label attribute to your input.",
  },
  {
    ruleid: "<select> element does not have a <label>",
    wcag: "WCAG 2.1 | 3.3.2",
    errorMsg: "Select is missing a label",
    suggestMsg: "Please add a label attribute to your input.",
    },
];

function countAttributes(html) {
  const rules = [
    { name: 'area', score: 1 },
    { name: 'background-position-x', score: 1 },
    { name: 'background-position-y', score: 1 },
    { name: 'background-size', score: 1 },
    { name: 'border-radius', score: 1 },
    { name: 'button', score: 1 },
    { name: 'font-size', score: 1 },
    { name: 'height', score: 1 },
    { name: 'html', score: 1 },
    { name: 'img', score: 1 },
    { name: 'input', score: 5 },
    { name: 'left', score: 1 },
    { name: 'letter-spacing', score: 1 },
    { name: 'line-height', score: 1 },
    { name: 'margin', score: 1 },
    { name: 'max-height', score: 1 },
    { name: 'min-height', score: 1 },
    { name: 'min-width', score: 1 },
    { name: 'opacity', score: 1 },
    { name: 'outline-offset', score: 1 },
    { name: 'padding', score: 1 },
    { name: 'right', score: 1 },
    { name: 'select', score: 3 },
    { name: 'text-indent', score: 1 },
    { name: 'textarea', score: 1 },
    { name: 'title', score: 1 },
    { name: 'top', score: 1 },
    { name: 'transform-origin', score: 1 },
    { name: 'width', score: 1 },
    { name: 'z-index', score: 1 },
  ];

  const counts = {};
  let total = 0;

  for (const { name, score } of rules) {
    const regex = new RegExp(`<${name}[^>]*>`, 'gi');
    const count = (html.match(regex) || []).length;
    counts[name] = count;
    total += count * score;
   // console.log(count);
    //console.log("elements");

  }
  for (const { name, score } of rules) {
    const regex = new RegExp(`${name}:`, 'gi');
    const count = (html.match(regex) || []).length;
    //console.log(count);
    counts[name] = count;
    //console.log(count);
    total += count * score;

  }
  return total;
}





connection.onInitialize((params) => {
  const capabilities = params.capabilities;
  // Does the client support the `workspace/configuration` request?
  // If not, we fall back using global settings.
  hasConfigurationCapability = !!(
    capabilities.workspace && !!capabilities.workspace.configuration
  );
  hasWorkspaceFolderCapability = !!(
    capabilities.workspace && !!capabilities.workspace.workspaceFolders
  );
  hasDiagnosticRelatedInformationCapability = !!(
    capabilities.textDocument &&
    capabilities.textDocument.publishDiagnostics &&
    capabilities.textDocument.publishDiagnostics.relatedInformation
  );
  const result = {
    capabilities: {
      textDocumentSync: node_1.TextDocumentSyncKind.Incremental,
      // Tell the client that this server supports code completion.
      completionProvider: {
        resolveProvider: true,
      },
    },
  };
  if (hasWorkspaceFolderCapability) {
    result.capabilities.workspace = {
      workspaceFolders: {
        supported: true,
      },
    };
  }
  return result;
});
connection.onInitialized(() => {
  if (hasConfigurationCapability) {
    // Register for all configuration changes.
    connection.client.register(
      node_1.DidChangeConfigurationNotification.type,
      undefined
    );
  }
  if (hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders((_event) => {
      connection.console.log("Workspace folder change event received.");
    });
  }
});
// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings = { maxNumberOfProblems: 1000 };
let globalSettings = defaultSettings;
// Cache the settings of all open documents
const documentSettings = new Map();
connection.onDidChangeConfiguration((change) => {
  if (hasConfigurationCapability) {
    // Reset all cached document settings
    documentSettings.clear();
  } else {
    globalSettings = change.settings.languageServerExample || defaultSettings;
  }
  // Revalidate all open text documents
  documents.all().forEach(validateTextDocument);
});
function getDocumentSettings(resource) {
  if (!hasConfigurationCapability) {
    return Promise.resolve(globalSettings);
  }
  let result = documentSettings.get(resource);
  if (!result) {
    result = connection.workspace.getConfiguration({
      scopeUri: resource,
      section: "languageServerExample",
    });
    documentSettings.set(resource, result);
  }
  return result;
}
// Only keep settings for open documents
documents.onDidClose((e) => {
  documentSettings.delete(e.document.uri);
});
// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidSave((change) => {
  validateTextDocument(change.document);
});

const htmlValidator = require('html-validator');
const { DiagnosticSeverity } = require('vscode-languageserver');

async function validateTextDocument(textDocument) {
  // In this simple example we get the settings for every validate run.
  const settings = await getDocumentSettings(textDocument.uri);
  const text = textDocument.getText();

  // These variables are there to store and tally the number of problems found in the HTML file
  let m;
  let problems = 0;
  const diagnostics = [];

  // 1.3.1 - Info and Relationships
  // nav landmark element should have a ul element (list)
  const pattern1311 = /<nav[^>]*>(?:(?!<\/?ul)[\s\S])*<\/nav>/g;
  while (
    (m = pattern1311.exec(text)) &&
    problems < settings.maxNumberOfProblems
  ) {
    problems++;
    const diagnostic = {
      severity: node_1.DiagnosticSeverity.Warning,
      range: {
        start: textDocument.positionAt(m.index),
        end: textDocument.positionAt(m.index + m[0].length),
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
          message: "Please use lists.",
        },
      ];
    }
    diagnostics.push(diagnostic);
  }

  // <footer> should be the last landmark element before the closing body tag
  const pattern1312 = /<footer\b[\s\S]*?<\/footer>(?:(?!(header|main|nav|aside|article|section|footer)\b)[\s\S])*?(<header\b[\s\S]*?<\/header>|<main\b[\s\S]*?<\/main>|<nav\b[\s\S]*?<\/nav>|<aside\b[\s\S]*?<\/aside>|<article\b[\s\S]*?<\/article>|<section\b[\s\S]*?<\/section>|<footer\b[\s\S]*?<\/footer>)[\s\S]*?<\/body>[\s\S]*?<\/html>/g;
  while (
    (m = pattern1312.exec(text)) &&
    problems < settings.maxNumberOfProblems
  ) {
    problems++;
    const diagnostic = {
      severity: node_1.DiagnosticSeverity.Warning,
      range: {
        start: textDocument.positionAt(m.index),
        end: textDocument.positionAt(m.index + m[0].length),
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

  // main landmark element should have role="main"
  const pattern1313 = /^(?!.*<main.*role=["']main["'].*>).*<main.*>/g;
  while (
    (m = pattern1313.exec(text)) &&
    problems < settings.maxNumberOfProblems
  ) {
    problems++;
    const diagnostic = {
      severity: node_1.DiagnosticSeverity.Warning,
      range: {
        start: textDocument.positionAt(m.index),
        end: textDocument.positionAt(m.index + m[0].length),
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

  // header landmark element should have role="banner"
  const pattern1314 = /^(?!.*<header.*role=["']banner["'].*>).*<header.*>/g;
  while (
    (m = pattern1314.exec(text)) &&
    problems < settings.maxNumberOfProblems
  ) {
    problems++;
    const diagnostic = {
      severity: node_1.DiagnosticSeverity.Warning,
      range: {
        start: textDocument.positionAt(m.index),
        end: textDocument.positionAt(m.index + m[0].length),
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

  // nav landmark element should have role="navigation"
  const pattern1315 = /^(?!.*<nav.*role=["']navigation["'].*>).*<nav.*>/g;
  while (
    (m = pattern1315.exec(text)) &&
    problems < settings.maxNumberOfProblems
  ) {
    problems++;
    const diagnostic = {
      severity: node_1.DiagnosticSeverity.Warning,
      range: {
        start: textDocument.positionAt(m.index),
        end: textDocument.positionAt(m.index + m[0].length),
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

  // aside landmark element should have role="complementary"
  const pattern1316 = /^(?!.*<aside.*role=["']complementary["'].*>).*<aside.*>/g;
  while (
    (m = pattern1316.exec(text)) &&
    problems < settings.maxNumberOfProblems
  ) {
    problems++;
    const diagnostic = {
      severity: node_1.DiagnosticSeverity.Warning,
      range: {
        start: textDocument.positionAt(m.index),
        end: textDocument.positionAt(m.index + m[0].length),
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

  // footer landmark element should have role="contentinfo"
  const pattern1317 = /^(?!.*<footer.*role=["']contentinfo["'].*>).*<footer.*>/g;
  while (
    (m = pattern1317.exec(text)) &&
    problems < settings.maxNumberOfProblems
  ) {
    problems++;
    const diagnostic = {
      severity: node_1.DiagnosticSeverity.Warning,
      range: {
        start: textDocument.positionAt(m.index),
        end: textDocument.positionAt(m.index + m[0].length),
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

  // span shouldn't have a font attribute
  const pattern1318 = /(span {[\s\S\n]+?.*?)(font-.*?)[\s\S\n]+?(})/g;
  while ((m = pattern1318.exec(text)) && problems < settings.maxNumberOfProblems) {
    problems++;
    const diagnostic = {
      severity: node_1.DiagnosticSeverity.Warning,
      range: {
        start: textDocument.positionAt(m.index),
        end: textDocument.positionAt(m.index + m[0].length),
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
            "Remove this from its style. Use the appropriate HTML tag instead of &lt;span&gt;&lt;/span&gt;.",
        },
      ];
    }
    diagnostics.push(diagnostic);
  }

  // 1.3.4
  // Checks if background-position-x, background-position-y, background-size, 
  // border-radius, font-size, height, left, letter-spacing, line-height, margin, 
  // max-height, max-width, min-height, min-width, opacity, outline-offset, padding, right, 
  // text-indent, top, transform-origin, width, and z-index uses px
  const pattern1341 = /(background-position-x|background-position-y|background-size|border-radius|height|left|letter-spacing|line-height|margin|max-height|min-height|min-width|opacity|outline-offset|padding|right|text-indent|top|transform-origin|(?<!max-)(width)|z-index):.*?\d+px.*?/g;
  while ((m = pattern1341.exec(text)) && problems < settings.maxNumberOfProblems) {
    problems++;
    const diagnostic = {
      severity: node_1.DiagnosticSeverity.Warning,
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

  // 1.3.5 - Identify Input Purpose
  // Input must have a name attribute
  const pattern1351 = /(<input(?!.*?name=(['"]).*?\2)[^>]*)(>)/g;
  while ((m = pattern1351.exec(text)) && problems < settings.maxNumberOfProblems) {
    problems++;
    const diagnostic = {
      severity: node_1.DiagnosticSeverity.Warning,
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
          message: 'Please add a `name` attribute (ex: &lt;input name=""/&gt;)',
        },
      ];
    }
    diagnostics.push(diagnostic);
  }

  // input elements must have a type attribute
  const pattern1352 = /<(input|textarea|select)(?![^>]*\btype=)([^>]*|)>[ \n]*<\/\1\s*>$/g;
  while (
    (m = pattern1352.exec(text)) &&
    problems < settings.maxNumberOfProblems
  ) {
    problems++;
    const diagnostic = {
      severity: node_1.DiagnosticSeverity.Warning,
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

  // 1.4.4
  // font-size shouldn't use px or pt
  const pattern8 = /(font-size:.*?\d+(px|pt).*?)/g;
  while ((m = pattern8.exec(text)) && problems < settings.maxNumberOfProblems) {
    problems++;
    const diagnostic = {
      severity: node_1.DiagnosticSeverity.Warning,
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

  // 2.1.1 - Keyboard
  // if a <div> has the `class="button"` attribute
  const pattern2111 = /(<div(?=.*?class="button")[^>]*)(>)/g;
  while ((m = pattern2111.exec(text)) && problems < settings.maxNumberOfProblems) {
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
          message: "Please change this to &lt;button&gt;&lt;/button&gt;",
        },
        {
          location: {
            uri: textDocument.uri,
            range: Object.assign({}, diagnostic.range),
          },
          message:
            'Please change the `class` attribute to `role` and add `tabindex="0"` (ex: &lt;div role="button" tabindex="0"&gt;&lt;/div&gt;)',
        },
      ];
    }
    diagnostics.push(diagnostic);
  }

  // if a <div> has the `class="form"` attribute
  const pattern2112 = /(<div(?=.*?class="form")[^>]*)(>)/g;
  while (
    (m = pattern2112.exec(text)) &&
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

  // 2.5.3 - Label in name
  // button elements must have an aria-label or aria-labelledby attribute
  const pattern2531 = /<button(?![^>]*(?:aria-label|aria-labelledby)[^>]*)(?:(?<=\sname=)[^>\s]+)?(?:(?<=\svalue=)['"][^'"]*['"])?(?:\s+aria-label=(?:""|''))?[^>]*>/g;
  while ((m = pattern2531.exec(text)) && problems < settings.maxNumberOfProblems) {
    problems++;
    const diagnostic = {
      severity: node_1.DiagnosticSeverity.Warning,
      range: {
        start: textDocument.positionAt(m.index),
        end: textDocument.positionAt(m.index + m[0].length),
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

  // input elements must have an aria-label or aria-labelledby attribute
  const pattern2532 = /<input(?![^>]*(?:aria-label|aria-labelledby)[^>]*)(?:(?<=\sname=)[^>\s]+)?(?:(?<=\svalue=)['"][^'"]*['"])?(?:\s+aria-label=(?:""|''))?[^>]*>/g;
  while (
    (m = pattern2532.exec(text)) &&
    problems < settings.maxNumberOfProblems
  ) {
    problems++;
    const diagnostic = {
      severity: node_1.DiagnosticSeverity.Warning,
      range: {
        start: textDocument.positionAt(m.index),
        end: textDocument.positionAt(m.index + m[0].length),
      },
      message: `The input element needs more context.`,
      source: "WCAG 2.1 | 1.3.1",
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

  // textarea elements must have an aria-label or aria-labelledby attribute
  const pattern2533 = /<textarea(?![^>]*(?:aria-label|aria-labelledby)[^>]*)(?:(?<=\sname=)[^>\s]+)?(?:(?<=\svalue=)['"][^'"]*['"])?(?:\s+aria-label=(?:""|''))?[^>]*>/g;
  while (
    (m = pattern2533.exec(text)) &&
    problems < settings.maxNumberOfProblems
  ) {
    problems++;
    const diagnostic = {
      severity: node_1.DiagnosticSeverity.Warning,
      range: {
        start: textDocument.positionAt(m.index),
        end: textDocument.positionAt(m.index + m[0].length),
      },
      message: `The textarea element needs more context.`,
      source: "WCAG 2.1 | 1.3.1",
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

  // select elements must have an aria-label or aria-labelledby attribute
  const pattern2534 = /<select(?![^>]*(?:aria-label|aria-labelledby)[^>]*)(?:(?<=\sname=)[^>\s]+)?(?:(?<=\svalue=)['"][^'"]*['"])?(?:\s+aria-label=(?:""|''))?[^>]*>/g;
  while (
    (m = pattern2534.exec(text)) &&
    problems < settings.maxNumberOfProblems
  ) {
    problems++;
    const diagnostic = {
      severity: node_1.DiagnosticSeverity.Warning,
      range: {
        start: textDocument.positionAt(m.index),
        end: textDocument.positionAt(m.index + m[0].length),
      },
      message: `The select element needs more context.`,
      source: "WCAG 2.1 | 1.3.1",
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


  // 4.1.3 - Status Messagess
  const pattern413 = /<div\s+(?=[^>]*\brole=["']status["'])(?![^>]*\baria-live=["'])[^\s>]*>/g;
  while ((m = pattern413.exec(text)) && problems < settings.maxNumberOfProblems) {
    problems++;
    const diagnostic = {
      severity: node_1.DiagnosticSeverity.Warning,
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

  // WHATWG Validator
  const WHATWG = {
    data: text,
    validator: 'WHATWG',
    format: "json",
  };

  const WHATWGresult = await validator(WHATWG);

  WHATWGresult.errors.forEach((error) => {
    if (problems >= settings.maxNumberOfProblems) {
      return;
    }
    problems++;

    const wcag = WHATWGtoRule.find((element) => element.ruleid == error.ruleId);
    if (wcag == undefined) {
      return;
    }
    // console.log(wcag);
    
    const diagnostic = {
      severity: node_1.DiagnosticSeverity.Warning,
      range: {
        start: {
          line: error.line - 1,
          character: error.column - 1,
        },
        end: {
          line: error.line - 1,
          character: error.column - 1 + error.size,
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
            range: {
              start: {
                line: error.line - 1,
                character: error.column - 1,
              },
              end: {
                line: error.line - 1,
                character: error.column - 1 + error.size,
              },
            },
          },
          message: wcag.suggestMsg,
        },
      ];
    }
    diagnostics.push(diagnostic);
  });

  // W3C Validator
  const W3C = {
    data: text,
    format: "json",
  };

  const W3Cresult = await validator(W3C);
  const diagnosticPromises = W3Cresult.messages.map((msg) => processDiagnostics(msg, diagnostics, problems, settings, textDocument));
  await Promise.all(diagnosticPromises);

  // Send the computed diagnostics to VSCode.
  connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
  var files = diagnostics;
  const html = text;
  const score = countAttributes(html);

  //  console.log("SCORE");
  //  console.log(score); // Output: 14

  var files = diagnostics;
  files.push(score);

  connection.sendNotification("custom/loadFiles", [files]);
}

connection.onDidChangeWatchedFiles((_change) => {
  // Monitored files have change in VSCode
  connection.console.log("We received an file change event");
});
// This handler provides the initial list of the completion items.
connection.onCompletion((_textDocumentPosition) => {
  // The pass parameter contains the position of the text document in
  // which code complete got requested. For the example we ignore this
  // info and always provide the same completion items.
  return [
    {
      label: "TypeScript",
      kind: node_1.CompletionItemKind.Text,
      data: 1,
    },
    {
      label: "JavaScript",
      kind: node_1.CompletionItemKind.Text,
      data: 2,
    },
  ];
});
// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve((item) => {
  if (item.data === 1) {
    item.detail = "TypeScript details";
    item.documentation = "TypeScript documentation";
  } else if (item.data === 2) {
    item.detail = "JavaScript details";
    item.documentation = "JavaScript documentation";
  }
  return item;
});

async function processDiagnostics(msg, diagnostics, problems, settings, textDocument) {
    if (problems >= settings.maxNumberOfProblems) {
      return;
    }
    problems++;

    const wcag = W3CtoRule.find((element) => msg.message.includes(element.ruleid));
    if (wcag == undefined) {
      return;
    }
     // console.log(wcag);

    const diagnostic = {
      severity: node_1.DiagnosticSeverity.Warning,
      range: {
        start: {line: msg.lastLine - 1, character: msg.firstColumn - 1 },
        end: {line: msg.lastLine - 1, character: msg.lastColumn - 1}
      },
      message: wcag.errorMsg,
      source: wcag.wcag,
    };

    // If the extract is about an image, generate an alt text
    if (wcag.suggestMsg.includes("Please add an 'alt' attribute to your image")) {
      const extracted = msg.extract;
      if (extracted) {
        const imgTag = extracted.match(/<img[^>]*>/g)[0];
        const src = imgTag.match(/src\s*=\s*['"`](.*?)['"`]/i)[1];

        try {
          const altText = await query(src);
          wcag.suggestMsg = `Please add an 'alt' attribute to your image element to ensure accessibility: <img src='${src}' alt='${altText}'>`;
          // console.log(wcag.suggestMsg);
        } catch (error) {
          // console.error('Error fetching alt text:', error);
        }
      }
    }

    if (hasDiagnosticRelatedInformationCapability) {
      diagnostic.relatedInformation = [
        {
          location: {
            uri: textDocument.uri,
            range: {
              start: {line: msg.lastLine - 1, character: msg.firstColumn - 1 },
              end: {line: msg.lastLine - 1, character: msg.lastColumn - 1}
            },
          },
          message: wcag.suggestMsg,
        },
      ];
    }
    diagnostics.push(diagnostic);

}

// Import the env (must be in the same folder as the server.js file)
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const fs1 = require('fs'); // Import the promises API from the fs module

// A function that generates an alt text for an image
async function query(filename) {
  try {
    let data;
    if (filename.startsWith("http") || filename.startsWith("https")) {
      data = JSON.stringify({ url: filename });
    } else {
      data = fs1.readFileSync(filename);
    }
    const token = process.env.BLIP_TOKEN;
    // console.log(token);
    const response = await fetch(
        "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large",
        {
            headers: {
                Authorization: token,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: data,
        }
    );
    const result = await response.json();
  
    // lowercase the alt text
    // console.log(result);
    let alt_text = result[0].generated_text;
  
  
    // Remove the "There are" and "There is" parts
    alt_text = alt_text.replace("there are ", "");
    alt_text = alt_text.replace("there is ", "");

    // Remove "arafed", "araffe", and "araf" parts
    alt_text = alt_text.replace("arafed ", ""); 
    alt_text = alt_text.replace("araffe ", "");
    alt_text = alt_text.replace("araf ", "person");
    alt_text = alt_text.replace("araffes ", "people ");
  
    // Capitalize the first character
    alt_text = alt_text.charAt(0).toUpperCase() + alt_text.slice(1);
  
    return alt_text;
  } catch (error) {
    // If the url is imgur (because it is bad practice to scrape imgur)
    if (filename.includes("imgur")) {
      return "Imgur is not supported.";
    }
    else {
      const alt_text = filename.split('.')[0];
      return alt_text;
    }
  }
}

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);
// Listen on the connection
connection.listen();
//# sourceMappingURL=server.js.map
