// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { getWebviewContent } from './components/start/start';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('codenote.codenote', () => {
		//   Create and show panel
		  const panel = vscode.window.createWebviewPanel(
			'codenote',
			'codenote',
			vscode.ViewColumn.One,
			{}
		  );

		  panel.webview.html = getWebviewContent(panel.webview, context);
	});
	
	context.subscriptions.push(disposable);
}




// This method is called when your extension is deactivated
export function deactivate() {}
