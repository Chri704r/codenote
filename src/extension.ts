import * as vscode from "vscode";
import * as path from 'path';
import { getWebviewOverview } from "./components/overview/overview";
import { getWebviewSubfolder } from "./components/subfolder/subfolder";
import { getWebviewNote } from "./components/note/note";
import { getWebviewNewNote } from "./components/newNote/newNote";
import { displayDecorators } from "./displayDecorators";
import { addDecoratorToLine } from "./addDecoratorToLine";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand("codenote.codenote", async () => {
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
					/* case "subfolder":
						panel.webview.html = getWebviewSubfolder(panel.webview, context);
						return; */
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
				case 'openFolder':
					const folderName = message.data.value;
					const folderData = await getDataForFolder(folderName);

					panel.webview.html = getWebviewSubfolder(folderData, panel.webview, context);

					panel.webview.postMessage({
						command: 'updateFolderDetails',
						data: folderData
					});

					break;
			}
		});

		const fs = require('fs');
		const path = require('path');

		function createFolderWithFile() {
			const globalStorageUri = context.globalStorageUri;
		
			const folderName = 'myFolder';
			const fileName = 'example.txt';
		
			const folderPath = path.join(globalStorageUri.fsPath, folderName);
			const filePath = path.join(folderPath, fileName);
		
			try {
				if (!fs.existsSync(folderPath)) {
					fs.mkdirSync(folderPath, { recursive: true });
				}
		
				fs.writeFileSync(filePath, 'Hello, world!');
		
				console.log(`Folder '${folderName}' with file '${fileName}' created successfully.`);
			} catch (error: any) {
				console.error(`Error creating folder and file: ${error.message}`);
			}
		}
		
		createFolderWithFile();

		const folders = await getFolderContents(context);

		panel.webview.postMessage({
			command: 'updateFolderContents',
			data: folders
		});

	});

	let displayDecoratorsInEditor = vscode.commands.registerCommand("extension.onDidChangeActiveTextEditor", () => {
		displayDecorators(context);
	});

	let addDecorator = vscode.commands.registerCommand("extension.addDecorator", () => {
		addDecoratorToLine(context);
	});

	vscode.window.onDidChangeActiveTextEditor(() => {
		// Trigger the registered command when the active text editor changes
		vscode.commands.executeCommand("extension.onDidChangeActiveTextEditor");
	});

	context.subscriptions.push(disposable, displayDecoratorsInEditor, addDecorator);
}

async function getFolderContents(context: vscode.ExtensionContext) {
	const fsp = require('fs').promises;

    try {
        const globalStorageUri = context.globalStorageUri;
        const folders = await fsp.readdir(globalStorageUri.fsPath);
        const folderContents = [];

        for (const folderName of folders) {
            const folderPath = path.join(globalStorageUri.fsPath, folderName);
            const stats = await fsp.stat(folderPath);

            if (stats.isDirectory()) {
                const files = await fsp.readdir(folderPath);
                folderContents.push({ folderName, files });
            }
        }

        return folderContents;
    } catch (error) {
        console.error(`Error reading global storage directory`);
        return [];
    }
}

async function getDataForFolder(subfolder: string) {
    return { subfolder };
}


// This method is called when your extension is deactivated
export function deactivate() {}