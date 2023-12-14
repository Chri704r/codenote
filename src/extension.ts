import * as vscode from "vscode";
import { getWebviewOverview } from "./components/overview/overview";
import { getWebviewSubfolder } from "./components/subfolder/subfolder";
import { getWebviewNote } from "./components/note/note";
import { getWebviewNewNote } from "./components/newNote/newNote";
import { displayDecorators } from "./displayDecorators";
import { addDecoratorToLine } from "./addDecoratorToLine";
import { getFiles } from "./components/overview/getLatestNotes";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	const files = await getFiles(context);

	let disposable = vscode.commands.registerCommand("codenote.codenote", async () => {
		// Create and show panel
		const panel = vscode.window.createWebviewPanel("codenote", "codenote", vscode.ViewColumn.One, {
			enableScripts: true,
		});

		panel.webview.html = await getWebviewOverview(panel.webview, context, files);

		panel.webview.onDidReceiveMessage(
			async (message) => {
				switch (message.page) {
					case "overview":
						panel.webview.html = await getWebviewOverview(panel.webview, context, files);
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