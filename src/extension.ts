import * as vscode from "vscode";
import { getWebviewOverview } from "./components/overview/overview";
import { getWebviewSubfolder } from "./components/subfolder/subfolder";
import { getWebviewNote } from "./components/note/note";
import { displayDecorators } from "./utils/displayDecorators";
import { addDecoratorToLine } from "./utils/addDecoratorToLine";
import { moveToFolder } from "./utils/moveToFolder";
import { getFolderContents, initializeFileAndFolder } from "./utils/initialize";
import { search } from "./components/search/search";
import { getFiles } from "./utils/getLastEditedNotes";
import { addFolder } from "./utils/addFolder";
import { addNote } from "./utils/addNote";

export async function activate(context: vscode.ExtensionContext) {
	const files = await getFiles(context);
	const folders = await getFolderContents(context);

	let disposable = vscode.commands.registerCommand("codenote.codenote", async () => {
		const panel = vscode.window.createWebviewPanel("codenote", "codenote", vscode.ViewColumn.One, {
			enableScripts: true,
		});

		panel.webview.html = await getWebviewOverview(panel.webview, context, folders, files);

		panel.webview.onDidReceiveMessage(
			async (message) => {
				switch (message.page) {
					case "overview":
						panel.webview.html = await getWebviewOverview(panel.webview, context, folders, files);
						return;
					case "subfolder":
						const folder = { folderName: message.folderName, uriPath: message.folderPath };
						panel.webview.html = await getWebviewSubfolder(folder, panel.webview, context);
						return;
					case "note":
						panel.webview.html = getWebviewNote(panel.webview, context);
						return;
				}
				switch (message.command) {
					case "move":
						moveToFolder(message.pathTo, message.pathFrom);
						return;
					case "search":
						panel.webview.html = await search(message.searchTerm, panel.webview, context);
						return;
					case 'addFolder':
						await addFolder(message.destinationFolderName, message.destinationFolderUri, message.webviewToRender, context, panel);
						const updatedFolders = await getFolderContents(context);
						// const updatedFolder = await getContentInFolder(message.destinationFolder);
						const updatedFolderF = { folderName: message.destinationFolderName, uriPath: message.destinationFolderUri };

						if (message.webviewToRender === 'subfolder') {
							panel.webview.html = await getWebviewSubfolder(updatedFolderF, panel.webview, context);
						} else if (message.webviewToRender === 'overview') {
							panel.webview.html = await getWebviewOverview(panel.webview, context, updatedFolders, files);
						} else {
							console.error('Error rendering webview.');
						}
						return;
					case 'addNote':
						await addNote(message.destinationFolderName, message.destinationFolderUri, message.webviewToRender, context, panel);
						const updatedFilesN = await getFiles(context);
						// const updatedFolder = await getContentInFolder(message.destinationFolder);
						const updatedFolderN = { folderName: message.destinationFolderName, uriPath: message.destinationFolderUri };

						if (message.webviewToRender === 'subfolder') {
							panel.webview.html = await getWebviewSubfolder(updatedFolderN, panel.webview, context);
						} else if (message.webviewToRender === 'overview') {
							panel.webview.html = await getWebviewOverview(panel.webview, context, folders, updatedFilesN);
						} else {
							console.error('Error rendering webview.');
						}
						return;
				}
			},
			undefined,
			context.subscriptions
		);

		await initializeFileAndFolder(context);
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

// This method is called when your extension is deactivated
export function deactivate() { }
