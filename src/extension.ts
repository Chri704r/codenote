import * as vscode from "vscode";
import { getWebviewOverview } from "./components/overview/overview";
import { getWebviewSubfolder } from "./components/subfolder/subfolder";
import { getWebviewNote } from "./components/note/note";
import { displayDecorators } from "./utils/displayDecorators";
import { addDecoratorToLine } from "./utils/addDecoratorToLine";
import { moveToFolder } from "./utils/moveToFolder";
import { getFolderContents, initializeFileAndFolder } from "./utils/initialize";
import { getNotes } from "./utils/getLastEditedNotes";
import { search } from "./components/search/search";
import { addFolder } from "./utils/addFolder";
import { addNote } from "./utils/addNote";
import { updateWebview } from "./utils/updateWebview";
import { saveFile } from "./utils/saveFile";
import { deleteFolder } from "./utils/deleteFolder";
import { deleteFile } from "./utils/deleteNote";

let currentOpenFile: string;

export async function activate(context: vscode.ExtensionContext) {
	const folders = await getFolderContents(context);
	const files = await getNotes(context.globalStorageUri.fsPath);

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
						panel.webview.html = await getWebviewNote(panel.webview, context, message.fileName, message.filePath, message.currentPage);
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
						panel.webview.html = await updateWebview(message.destinationFolderName, message.destinationFolderUri, message.webviewToRender, panel.webview, context);						
						return;
					case 'addNote':
						await addNote(message.destinationFolderName, message.destinationFolderUri, message.webviewToRender, context, panel);
						panel.webview.html = await updateWebview(message.destinationFolderName, message.destinationFolderUri, message.webviewToRender, panel.webview, context);						
						return;
					case "save":
						console.log("save");
						await saveFile(message.fileName, message.filePath, message.data.fileContent, context);
						return;
					case "deleteFile":
						await deleteFile(message.fileName, message.filePath, context, panel, folders, message.setPage, message.currentFolderName, message.currentFolderPath);
					case "comment":
						addDecoratorToLine(panel.webview, context, message.fileName, message.filePath);
				}
			},
			undefined,
			context.subscriptions
		);

		await initializeFileAndFolder(context);
	});

	vscode.window.onDidChangeActiveTextEditor(() => {
		// Trigger the registered command when the active text editor changes
		// vscode.commands.executeCommand("extension.onDidChangeActiveTextEditor");
		displayDecorators(context, currentOpenFile);
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
