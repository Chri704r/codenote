import * as vscode from "vscode";
import { getWebviewNote } from "../components/note/note";
import path from "path";

export function addDecoratorToLine(
	webview: vscode.Webview,
	context: vscode.ExtensionContext,
	currentFileName: string = "",
	currentFilePath: string = "",
	decorationType: any
) {
	const activeEditor = vscode.window.activeTextEditor;

	if (activeEditor && currentFileName !== "" && currentFilePath !== "") {
		const globalState = context.globalState;
		const file = activeEditor.document.fileName;
		const line = activeEditor.selection.active.line;
		const selection = activeEditor.document.getText(activeEditor.selection);
		let text = "";

		if (selection === "") {
			// if there is no selection of text, get text from current line
			text = activeEditor.document.lineAt(line).text;
		} else {
			// get the selected text
			text = activeEditor.document.getText(activeEditor.selection);
		}

		//Retrieve the existing array or initialize a new one
		const allDecoratorsInNote = globalState.get<any[]>(`decorators-${currentFileName}`) || [];

		//check if there is already a decorator on same line in active file
		const hasDecorator = allDecoratorsInNote?.some((decorator) => line === decorator.line && file === decorator.file);

		if (!hasDecorator) {
			pushDecorator();
		} else {
			vscode.window.showErrorMessage("Error! Already declared in note");
		}

		async function pushDecorator() {
			// Add object to array
			allDecoratorsInNote.push({ file, line, text });

			// Store the updated array in global state
			globalState.update(`decorators-${currentFileName}`, allDecoratorsInNote);

			// Specify the line the decorator should be placed on
			const decorationRange = new vscode.Range(line, 0, line, 0);

			// Add decorator to editor
			activeEditor?.setDecorations(decorationType, [decorationRange]);

			// Add code to file
			const fs = require("fs");
			// const globalStorageUri = context.globalStorageUri;
			const data = fs.readFileSync(currentFilePath);
			const jsonData = JSON.parse(data);

			// split selected text after each line
			const lines = text.split(/\r?\n/);

			// push object with empty line and push object containg 'reference' with filname and line number
			jsonData.ops.push({ insert: "\n" });
			jsonData.ops.push({ insert: `</> (${path.basename(file)}, Ln ${line + 1})\n`, attributes: { color: "#575757" } });

			// map trough each line in text from json, to add codeblock to each line from selected text
			lines.map((line) => {
				jsonData.ops.push(
					{ insert: `${line}` },
					{
						attributes: {
							"code-block": true,
						},
						insert: "\n",
					}
				);
			});

			// update content in note to include the selected code
			fs.writeFileSync(currentFilePath, JSON.stringify(jsonData));

			// update note webview to see the changes immediately
			webview.html = await getWebviewNote(webview, context, currentFileName, currentFilePath);
		}
	} else {
		vscode.window.showErrorMessage(`You need to have a note open to add a comment`);
	}
}
