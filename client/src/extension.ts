/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as path from 'path';
import { workspace, ExtensionContext } from 'vscode';
import * as vscode from 'vscode';
import * as fs from 'fs';

import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    TransportKind,
} from 'vscode-languageclient/node';

let client: LanguageClient;

let receivedData;


export async function activate(context: vscode.ExtensionContext) {

    const provider = new ColorsViewProvider(context.extensionUri);

    // The server is implemented in node
    const serverModule = context.asAbsolutePath(path.join('server', 'out', 'server.js'));
    // The debug options for the server
    // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
    const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    const serverOptions: ServerOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: {
            module: serverModule,
            transport: TransportKind.ipc,
            options: debugOptions,
        },
    };

    // Options to control the language client
    const clientOptions: LanguageClientOptions = {
        // Register the server for javascript documents
        documentSelector: [{ scheme: 'file', language: 'html' },
        { scheme: 'file', language: 'javascript' }],
        synchronize: {
            // Notify the server about file changes to 'all' files contained in the workspace
            fileEvents: workspace.createFileSystemWatcher('**/*'),
        },
    };

    // Create the language client and start the client.
    client = new LanguageClient(
        'languageServerExample',
        'Language Server Example',
        serverOptions,
        clientOptions
    );



    //console.log("------ REFRESH -----");

    client.start();
    //client.sendNotification("custom/refreshClient", {});
    let done = 1;
    client.onReady().then(() => {

        client.onNotification("custom/loadFiles", (files: Array<string>) => {
            //console.log("loading files " + JSON.stringify(files));
            // console.log(files);
            receivedData = files;
            // console.log(receivedData);

            
            if (done != 2) {
                context.subscriptions.push(
                    vscode.window.registerWebviewViewProvider(ColorsViewProvider.viewType, provider));
            }


            done = 2;
            provider.callView();


        });

    });



}

let score = 0;
let dataLength = 0;

class ColorsViewProvider implements vscode.WebviewViewProvider {


    public static readonly viewType = 'calicoColors.colorsView';

    private _view?: vscode.WebviewView;

    constructor(
        private readonly _extensionUri: vscode.Uri,
    ) { }

    public resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, _token: vscode.CancellationToken,
    ) {
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

    public callView() {
        this.updateView(this._view);
    }

    public updateView(webviewView: vscode.WebviewView) {
        //console.log("here");
        this._view = webviewView;
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        try {
            score = receivedData.pop();
            console.log(receivedData);

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
       
        } catch (error) {
            console.log(error);
        }
    }
}

import * as os from 'os';
import { exec } from 'child_process';

function openHtmlInBrowser(htmlContent: string): void {
    const tempFilePath = path.join(os.tmpdir(), 'temp.html');
    fs.writeFileSync(tempFilePath, htmlContent, 'utf8');

    // Open the file in the default web browser
    exec(`start ${tempFilePath}`);
}


export function deactivate(): Thenable<void> | undefined {
    if (!client) {
        return undefined;
    }
    return client.stop();
}