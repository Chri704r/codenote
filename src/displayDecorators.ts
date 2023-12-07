import * as vscode from "vscode";
export function displayDecorators(context: vscode.ExtensionContext) {
	let activeEditor = vscode.window.activeTextEditor;

	if (activeEditor) {
		const allDecorators = context.globalState.get<any[]>("decorators");

		// Create an array to store the decoration options
		const decorations: vscode.DecorationOptions[] = [];

		allDecorators?.map((decorator) => {
			if (activeEditor?.document.uri.toString() === "file://" + decorator.file) {
				// Create a decoration type with a gutter icon
				const decorationType = vscode.window.createTextEditorDecorationType({
					gutterIconPath: context.asAbsolutePath("src/assets/icons/pencil.png"), // Use the pencil icon
					gutterIconSize: "20px", // Adjust size as needed
				});

				// Populate the array with DecorationOptions for each line
				const decorationRange = new vscode.Range(decorator.line, 0, decorator.line, Number.MAX_VALUE);
				decorations.push({ range: decorationRange });

				// Apply the decorations to the active editor
				activeEditor?.setDecorations(decorationType, decorations);
			}
		});
	}
}
