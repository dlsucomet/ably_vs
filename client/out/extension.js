"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const path = require("path");
const vscode_1 = require("vscode");
const vscode = require("vscode");
const fs = require("fs");
const node_1 = require("vscode-languageclient/node");
let client;
let receivedData;
async function activate(context) {
    const provider = new ColorsViewProvider(context.extensionUri);
    // The server is implemented in node
    const serverModule = context.asAbsolutePath(path.join('server', 'out', 'server.js'));
    // The debug options for the server
    // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
    const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };
    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    const serverOptions = {
        run: { module: serverModule, transport: node_1.TransportKind.ipc },
        debug: {
            module: serverModule,
            transport: node_1.TransportKind.ipc,
            options: debugOptions,
        },
    };
    // Options to control the language client
    const clientOptions = {
        // Register the server for javascript documents
        documentSelector: [{ scheme: 'file', language: 'html' },
            { scheme: 'file', language: 'javascript' }],
        synchronize: {
            // Notify the server about file changes to 'all' files contained in the workspace
            fileEvents: vscode_1.workspace.createFileSystemWatcher('**/*'),
        },
    };
    // Create the language client and start the client.
    client = new node_1.LanguageClient('languageServerExample', 'Language Server Example', serverOptions, clientOptions);
    //console.log("------ REFRESH -----");
    client.start();
    //client.sendNotification("custom/refreshClient", {});
    let done = 1;
    client.onReady().then(() => {
        client.onNotification("custom/loadFiles", (files) => {
            //console.log("loading files " + JSON.stringify(files));
            // console.log(files);
            receivedData = files;
            // console.log(receivedData);
            if (done != 2) {
                context.subscriptions.push(vscode.window.registerWebviewViewProvider(ColorsViewProvider.viewType, provider));
            }
            done = 2;
            provider.callView();
        });
    });
}
exports.activate = activate;
let score = 0;
let dataLength = 0;
class ColorsViewProvider {
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri
            ]
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        //console.log(webviewView);
        webviewView.webview.onDidReceiveMessage(data => {
            switch (data.type) {
                case 'colorSelected':
                    {
                        vscode.window.activeTextEditor?.insertSnippet(new vscode.SnippetString(`#${data.value}`));
                        break;
                    }
            }
        });
    }
    callView() {
        this.updateView(this._view);
    }
    updateView(webviewView) {
        //console.log("here");
        this._view = webviewView;
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
    }
    _getHtmlForWebview(webview) {
        try {
            score = receivedData.pop();
            // console.log(receivedData);
            let messageArray = [];
            messageArray = receivedData.map(item => item.relatedInformation[0].message);
            let errorArray = [];
            errorArray = receivedData.map(item => item.message);
            let lineArray = [];
            lineArray = receivedData.map(item => item.range.start.line + 1);
            let wcagArray = [];
            wcagArray = (receivedData.map(item => item.source));
            let extractedValues = [];
            extractedValues = wcagArray.map(item => {
                const [, value] = item.split(" | ");
                return value;
            });
            // console.log(extractedValues);
            let finalArray = [];
            finalArray = receivedData.map((item, index) => {
                return `Line ${lineArray[index]}:  ${messageArray[index]}`;
            });
            // console.log(finalArray);
            let stringArray = "";
            stringArray = finalArray.join(' + ');
            let guidelinesString = "";
            guidelinesString = extractedValues.join(' + ');
            // console.log(stringArray);
            // console.log(guidelinesString);
            dataLength = receivedData.length;
            // console.log(`Score: ${dataLength}/ ${score}`);
            const htmlFilePath = path.join(__dirname, '..', 'src', 'templates', 'webview.html');
            // console.log(htmlFilePath);
            let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
            // console.log(htmlContent);
            const cssFilePath = path.join(__dirname, '..', 'src', 'templates', 'styles.css');
            // console.log(cssFilePath);
            const cssContent = fs.readFileSync(cssFilePath, 'utf8');
            // console.log(cssContent);
            htmlContent = htmlContent
                .replace('{{score}}', score.toString())
                .replace('{{dataLength}}', dataLength.toString())
                .replace('{guidelinesString}', guidelinesString)
                .replace('{{stringArray}}', stringArray)
                .replace('{{styles}}', `<style>${cssContent}</style>`);
            // console.log(htmlContent);
            openHtmlInBrowser(htmlContent);
            return htmlContent;
        }
        catch (error) {
            console.log(error);
        }
    }
}
ColorsViewProvider.viewType = 'calicoColors.colorsView';
const os = require("os");
const child_process_1 = require("child_process");
function openHtmlInBrowser(htmlContent) {
    const tempFilePath = path.join(os.tmpdir(), 'temp.html');
    fs.writeFileSync(tempFilePath, htmlContent, 'utf8');
    // Open the file in the default web browser
    (0, child_process_1.exec)(`start ${tempFilePath}`);
}
function deactivate() {
    if (!client) {
        return undefined;
    }
    return client.stop();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map