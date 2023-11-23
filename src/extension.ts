// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand("codenote.codenote", () => {
		// Create and show panel
		const panel = vscode.window.createWebviewPanel("Code Note", "Entry", vscode.ViewColumn.One, { enableScripts: true });

		// render html file as panel html
		const filePath: vscode.Uri = vscode.Uri.file(path.join(context.extensionPath, "src/components/start", "file.html"));
		panel.webview.html = fs.readFileSync(filePath.fsPath, "utf8");
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}