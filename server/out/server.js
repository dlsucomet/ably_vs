"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
const node_1 = require("vscode-languageserver/node");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const validator = require("@pamkirsten/html-validator");
const { checkDocumentContrast } = require("./helpers/color-contrast");
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

const WHATWGtoWCAG = require("./dicts/whatwg-wcag");
const W3CtoWCAG = require("./dicts/w3c-wcag");
const checkWCAG = require("./regex/wcag");
const suggestAltText = require("./helpers/img-caption");

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

async function validateTextDocument(textDocument) {
  // In this simple example we get the settings for every validate run.
  const settings = await getDocumentSettings(textDocument.uri);
  const text = textDocument.getText();
  // These variables are there to store and tally the number of problems found in the HTML file
  let m;
  let problems = 0;
  const diagnostics = [];
  // Regex patterns are used to identify if the HTML file does not follow a certain WCAG Success Criteria
  checkWCAG(m, text, textDocument, problems, diagnostics, settings, hasDiagnosticRelatedInformationCapability);

  // W3C Validator
  const W3C = {
    data: text,
    format: "json",
  };

  const W3Cresult = await validator(W3C);
  const diagnosticPromises = W3Cresult.messages.map((msg) => processDiagnostics(msg, diagnostics, problems, settings, textDocument));
  await Promise.all(diagnosticPromises);

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

    const wcag = WHATWGtoWCAG.find((element) => element.ruleid == error.ruleId);
    
    // If the error is not in the list of WCAG rules, skip it
    if (wcag == undefined) {
      return;
    }
    console.log(`WHATWG: Line ${error.line} Column ${error.column}: ${wcag.errorMsg}`);
    
    // If a similar diagnostic has already been added, skip it
    const isExisting = diagnostics.find((diag) =>
      diag.range.start.line === (error.line - 1) &&
      (diag.range.start.character - error.column) === -1 &&
      diag.message === wcag.errorMsg
    );
    // console.log(isExisting);
    if (isExisting) {
      return
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

  // Color Contrast
  const contrastIssues = checkDocumentContrast(textDocument._content);
  // console.log(contrastIssues);
  contrastIssues.forEach((issue) => {
    const diagnostic = {
      severity: node_1.DiagnosticSeverity.Warning,
      range: {
        start: textDocument.positionAt(issue.start),
        end: textDocument.positionAt(issue.end),
      },
      relatedInformation: [
        {
          location: {
            uri: textDocument.uri,
            range: {
              start: textDocument.positionAt(issue.start),
              end: textDocument.positionAt(issue.end),
            },
          },
          message: "Please increase the color contrast of the elements.",
        },
      ],
      message: issue.contrastIssue,
      source: "WCAG 2.1 | Color Contrast (1.4.3, 1.4.6)"
    };
    // console.log(diagnostic);
    diagnostics.push(diagnostic);
  });

  // Sort the diagnostics by start's line number > column number > end's line number > column number > source
  diagnostics.sort((a, b) => {
    if (a.range.start.line === b.range.start.line) {
      if (a.range.start.character === b.range.start.character) {
        if (a.range.end.line === b.range.end.line) {
          if (a.range.end.character === b.range.end.character) {
            return a.source.localeCompare(b.source);
          } else {
            return a.range.end.character - b.range.end.character;
          }
        } else {
          return a.range.end.line - b.range.end.line;
        }
      } else {
        return a.range.start.character - b.range.start.character;
      }
    } else {
      return a.range.start.line - b.range.start.line;
    }
  });

  // Send the computed diagnostics to VSCode.
  connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
  var files = diagnostics;
  const html = text;
  const score = countAttributes(html);

  //  console.log("SCORE");
  //  console.log(score); // Output: 14

  var files = diagnostics;
  files.push(score);
  connection.sendNotification("custom/loadFiles", files);
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

    const wcag = W3CtoWCAG.find((element) => msg.message.includes(element.ruleid));
    if (wcag == undefined) {
      return;
    }
     // console.log(wcag);

    const diagnostic = {
      severity: node_1.DiagnosticSeverity.Warning,
      range: {
        start: {line: msg.lastLine - 1, character: msg.firstColumn},
        end: {line: msg.lastLine - 1, character: msg.lastColumn - 1}
      },
      message: wcag.errorMsg,
      source: wcag.wcag,
    };
    console.log(`W3C: Line ${diagnostic.range.start.line} Column ${diagnostic.range.start.character}: ${diagnostic.message}`);

    // If the extract is about an image, generate an alt text
    if (wcag.suggestMsg.includes("Please add an 'alt' attribute to your image")) {
      const extracted = msg.extract;
      if (extracted) {
        const imgTag = extracted.match(/<img[^>]*>/g)[0];
        const src = imgTag.match(/src\s*=\s*['"`](.*?)['"`]/i)[1];

        try {
          const altText = await suggestAltText(src);
          wcag.suggestMsg = `Please add an 'alt' attribute to your image element to ensure accessibility${altText}`;
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
              start: {line: msg.lastLine - 1, character: msg.firstColumn},
              end: {line: msg.lastLine - 1, character: msg.lastColumn - 1}
            },
          },
          message: wcag.suggestMsg,
        },
      ];
    }
    diagnostics.push(diagnostic);

}

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);
// Listen on the connection
connection.listen();
//# sourceMappingURL=server.js.map
