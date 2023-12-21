import * as vscode from "vscode";
import { getWebviewNote } from "../components/note/note";

export function addDecoratorToLine(webview: vscode.Webview, context: vscode.ExtensionContext, currentFileName: string, currentFilePath: string) {
	let activeEditor = vscode.window.activeTextEditor;

	if (activeEditor) {
		// Create a decoration type with a gutter icon
		const decorationType = vscode.window.createTextEditorDecorationType({
			gutterIconPath: context.asAbsolutePath("src/assets/icons/pencil.png"),
			gutterIconSize: "20px",
		});
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
		let allDecoratorsInNote = globalState.get<any[]>(`decorators-${currentFileName}`) || [];

		//check if there is already a decorator on same line in active file
		const hasDecorator = allDecoratorsInNote?.some((decorator) => line === decorator.line && file === decorator.file);

		if (!hasDecorator) {
			console.log("push decorator");
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
			const globalStorageUri = context.globalStorageUri;
			const data = fs.readFileSync(`${globalStorageUri.path}/${currentFileName}.json`);
			const jsonData = JSON.parse(data);

			// split selected text after each line
			const lines = text.split(/\r?\n/);

			jsonData.ops.push({ insert: "\n" });
			jsonData.ops.push({ insert: `</> (${file.substr(file.lastIndexOf("/") + 1)}, Ln ${line + 1})\n`, attributes: { color: "#575757" } });

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

			fs.writeFileSync(`${globalStorageUri.path}/${currentFileName}.json`, JSON.stringify(jsonData));

			webview.html = await getWebviewNote(webview, context, currentFileName, currentFilePath);
		}
	}
}
