import * as vscode from "vscode";
export function addDecoratorToLine(context: vscode.ExtensionContext) {
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

		if (selection == "") {
			// if there is no selection of text, get text from current line
			text = activeEditor.document.lineAt(line).text;
		} else {
			// get the selected text
			text = activeEditor.document.getText(activeEditor.selection);
		}

		//Retrieve the existing array or initialize a new one
		let allDecorators = globalState.get<any[]>("decorators") || [];

		//check if there is already a decorator on same line in active file
		const hasDecorator = allDecorators?.some((decorator) => line == decorator.line && file == decorator.file);

		if (hasDecorator) {
			const indexToRemove = allDecorators.findIndex((obj) => line === obj.line);

			// Check if the object was found
			if (indexToRemove !== -1) {
				// Remove the object from global state
				allDecorators.splice(indexToRemove, 1);

				// Update global state with the modified array
				globalState.update("decorators", allDecorators);

				// remove decorator from editor
				activeEditor?.setDecorations(decorationType, []);
			}
		} else {
			pushDecorator();
		}

		function pushDecorator() {
			// Add object to array
			allDecorators.push({ file: file, line: line, text: text });

			// Store the updated array in global state
			globalState.update("decorators", allDecorators);

			// Specify the line the decorator should be placed on
			const decorationRange = new vscode.Range(line, 0, line, 0);

			// Add decorator to editor
			activeEditor?.setDecorations(decorationType, [decorationRange]);
		}
	}
}
