import * as vscode from "vscode";
import { getWebviewOverview } from "./components/overview/overview";
import { getWebviewSubfolder } from "./components/subfolder/subfolder";
import { getWebviewNote } from "./components/note/note";
import { getWebviewNewNote } from "./components/newNote/newNote";

const path = require('path');
const fs = require('fs');

function createFolderAndFile(folderName: string, fileName: string, fileContent: string, context: vscode.ExtensionContext) {
	const globalStorageUri = context.globalStorageUri;
    const folderPath = path.join(globalStorageUri.fsPath, folderName);
    const filePath = path.join(folderPath, fileName);

	if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

	fs.writeFileSync(filePath, fileContent);

    return filePath;
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand("codenote.codenote", () => {
		// Create and show panel
		const panel = vscode.window.createWebviewPanel("codenote", "codenote", vscode.ViewColumn.One, {
			enableScripts: true,
		});

		panel.webview.html = getWebviewOverview(panel.webview, context);

		panel.webview.onDidReceiveMessage(
			(message) => {
				switch (message.page) {
					case "overview":
						panel.webview.html = getWebviewOverview(panel.webview, context);
						return;
					case "subfolder":
						panel.webview.html = getWebviewSubfolder(panel.webview, context);
						return;
					case "note":
						panel.webview.html = getWebviewNote(panel.webview, context);
						return;
					case "newNote":
						panel.webview.html = getWebviewNewNote(panel.webview, context);
						return;
					case "createFolderAndFile":
						const fileContent = 'This is a sample content.';
						const filePath = createFolderAndFile('webviewFolder', 'webviewFile.txt', fileContent, context);
						panel.webview.postMessage({ command: 'createFolderAndFile', filePath });
				}
			},
			undefined,
			context.subscriptions
		);
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}