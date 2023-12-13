import * as vscode from "vscode";
import { getWebviewOverview } from "./components/overview/overview";
import { getWebviewSubfolder } from "./components/subfolder/subfolder";
import { getWebviewNote } from "./components/note/note";
import { displayDecorators } from "./utils/displayDecorators";
import { addDecoratorToLine } from "./utils/addDecoratorToLine";
import { moveToFolder } from "./utils/moveToFolder";
import { getFolderContents, initializeFileAndFolder } from "./utils/initialize";
import { deleteFolder } from "./utils/deleteFolder";

export async function activate(context: vscode.ExtensionContext) {
	const folders = await getFolderContents(context);

	let disposable = vscode.commands.registerCommand("codenote.codenote", async () => {
		const panel = vscode.window.createWebviewPanel("codenote", "codenote", vscode.ViewColumn.One, {
			enableScripts: true,
		});

		panel.webview.html = await getWebviewOverview(panel.webview, context, folders);

		panel.webview.onDidReceiveMessage(
			async (message) => {
				switch (message.page) {
					case "overview":
						panel.webview.html = await getWebviewOverview(panel.webview, context, folders);
						return;
					case "subfolder":
						const folderName = message.folderName;
						panel.webview.html = await getWebviewSubfolder(folderName, panel.webview, context);
						return;
					case "note":
						panel.webview.html = getWebviewNote(panel.webview, context);
						return;
				}
				switch (message.command) {
					case "move":
						moveToFolder(message.pathTo, message.pathFrom);
						return;
					case "deleteFolder":
						const folderToDelete = message.folderName;
						await deleteFolder(folderToDelete, context, panel);
						const updatedFolders = await getFolderContents(context);
						panel.webview.html = await getWebviewOverview(panel.webview, context, updatedFolders);
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
export function deactivate() {}
