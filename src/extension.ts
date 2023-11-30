import * as vscode from "vscode";
import * as path from 'path';
import { getWebviewOverview } from "./components/overview/overview";
import { getWebviewSubfolder } from "./components/subfolder/subfolder";
import { getWebviewNote } from "./components/note/note";
import { getWebviewNewNote } from "./components/newNote/newNote";

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
				}
			},
			undefined,
			context.subscriptions
		);

		panel.webview.onDidReceiveMessage(async (message) => {
			switch (message.command) {
				case 'fetchFolders':
					const foldersPath = path.join(context.extensionPath, 'src/components/overview', 'folders.json');
					const foldersUri = vscode.Uri.file(foldersPath);

					try {
						const folderContent = await vscode.workspace.fs.readFile(foldersUri);
						const folderData = JSON.parse(new TextDecoder().decode(folderContent));

						panel.webview.postMessage({ command: 'updateFolders', folderData });
					} catch (error) {
						console.error('Error reading or parsing folders.json:', error);
					}
					break;
				case 'fetchNotes':
					const notesPath = path.join(context.extensionPath, 'src/components/overview', 'notes.json');
					const notesUri = vscode.Uri.file(notesPath);

					try {
						const noteContent = await vscode.workspace.fs.readFile(notesUri);
						const noteData = JSON.parse(new TextDecoder().decode(noteContent));

						panel.webview.postMessage({ command: 'updateNotes', noteData });
					} catch (error) {
						console.error('Error reading or parsing notes.json:', error);
					}
					break;
			}
		});

	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }