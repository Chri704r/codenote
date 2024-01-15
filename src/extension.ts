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
import { deleteFile } from "./utils/deleteNote";
import { renameFolder } from "./utils/renameFolder";
import { deleteFolder } from "./utils/deleteFolder";

let currentOpenFile: string;
let currentOpenFilePath: string;
let fileName: string;
let filePath: string;
let fileContent: any;

export async function activate(context: vscode.ExtensionContext) {
	await initializeFileAndFolder(context);

	const disposable = vscode.commands.registerCommand("entry.entry", async () => {
		const panel = vscode.window.createWebviewPanel("entry", "entry", vscode.ViewColumn.One, {
			enableScripts: true,
		});

		const folders = await getFolderContents(context);
		const files = await getNotes(context.globalStorageUri.fsPath);

		panel.webview.html = await getWebviewOverview(panel.webview, context, folders, files);

		// Create a decoration type with a gutter icon
		const decorationType = vscode.window.createTextEditorDecorationType({
			gutterIconPath: context.asAbsolutePath("src/assets/pencil.png"), // Use the pencil icon
			gutterIconSize: "20px", // Adjust size as needed
		});

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
						currentOpenFile = message.fileName;
						currentOpenFilePath = message.filePath;
						panel.webview.html = await getWebviewNote(panel.webview, context, message.fileName, message.filePath, message.currentPage);
						return;
				}
				switch (message.command) {
					case "move":
						moveToFolder(message.pathTo, message.pathFrom);
						panel.webview.html = await updateWebview(
							message.destinationFolderName,
							message.destinationFolderUri,
							message.webviewToRender,
							panel.webview,
							context
						);
						return;
					case "search":
						panel.webview.html = await search(message.searchTerm, panel.webview, context);
						return;
					case "addFolder":
						await addFolder(message.destinationFolderUri);
						panel.webview.html = await updateWebview(
							message.destinationFolderName,
							message.destinationFolderUri,
							message.webviewToRender,
							panel.webview,
							context
						);
						return;
					case "renameFolder":
						await renameFolder(message.oldFolderPath);
						panel.webview.html = await updateWebview(message.parentFolder, message.parentPath, message.webviewToRender, panel.webview, context);
						return;
					case "addNote":
						await addNote(message.destinationFolderUri);
						panel.webview.html = await updateWebview(
							message.destinationFolderName,
							message.destinationFolderUri,
							message.webviewToRender,
							panel.webview,
							context
						);
						return;
					case "save":
						await saveFile(message.filePath, message.data.fileContent);
						panel.webview.html = await updateWebview(
							message.destinationFolderName,
							message.destinationFolderUri,
							message.webviewToRender,
							panel.webview,
							context
						);
						currentOpenFile = "";
						currentOpenFilePath = "";
						return;
					case "deleteFile":
						await deleteFile(message.filePath);
						panel.webview.html = await updateWebview(
							message.currentFolderName,
							message.currentFolderPath,
							message.webviewToRender,
							panel.webview,
							context
						);
						return;
					case "deleteFolder":
						await deleteFolder(message.folderName, message.folderPath);
						panel.webview.html = await updateWebview(
							message.currentFolderName,
							message.currentFolderPath,
							message.webviewToRender,
							panel.webview,
							context
						);
						return;
					case "comment":
						addDecoratorToLine(panel.webview, context, message.fileName, message.filePath, decorationType);
						return;
					case "navigate":
						panel.webview.html = await updateWebview(
							message.destinationFolderName,
							message.destinationFolderUri,
							message.webviewToRender,
							panel.webview,
							context
						);
						return;
					case "saveOnKey":
						fileName = message.fileName;
						filePath = message.filePath;
						fileContent = message.data.fileContent;
						currentOpenFile = message.fileName;
						currentOpenFilePath = message.filePath;

						await vscode.commands.executeCommand("entry.saveNotes", fileName, filePath, fileContent);
				}
			},
			undefined,
			context.subscriptions
		);

		vscode.window.onDidChangeActiveColorTheme(async () => {
			panel.webview.html = await getWebviewOverview(panel.webview, context, folders, files);
		});

		const saveNotes = vscode.commands.registerCommand("entry.saveNotes", () => {
			saveFile(filePath, fileContent);
		});

		const addDecorator = vscode.commands.registerCommand("entry.addDecorator", () => {
			addDecoratorToLine(panel.webview, context, currentOpenFile, currentOpenFilePath, decorationType);
		});

		context.subscriptions.push(addDecorator, saveNotes);

		vscode.window.onDidChangeActiveTextEditor(() => {
			// Trigger the registered command when the active text editor changes
			// vscode.commands.executeCommand("extension.onDidChangeActiveTextEditor");
			displayDecorators(context, currentOpenFile, currentOpenFilePath, decorationType);
		});
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
