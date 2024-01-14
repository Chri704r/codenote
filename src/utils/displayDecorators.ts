import * as vscode from "vscode";
export async function displayDecorators(context: vscode.ExtensionContext, currentOpenFile: string = "", currentOpenFilePath: string = "") {
	const activeEditor = vscode.window.activeTextEditor;

	// if there is an active editor and the user has a note open (the current open file is not an empty string)
	if (activeEditor && currentOpenFile !== "" && currentOpenFilePath !== "") {
		// Create a decoration type with a gutter icon
		const decorationType = vscode.window.createTextEditorDecorationType({
			gutterIconPath: context.asAbsolutePath("src/assets/pencil.png"), // Use the pencil icon
			gutterIconSize: "20px", // Adjust size as needed
		});

		const activeEditorFilename = activeEditor.document.fileName.substr(activeEditor.document.fileName.lastIndexOf("/") + 1);

		const fs = require("fs");

		function getJsondata(filePath: string) {
			return new Promise((resolve, reject) => {
				fs.readFile(filePath, "utf8", (error: any, data: any) => {
					if (error) {
						reject(`Error reading the JSON file: ${error}`);
						return;
					}
					const jsonData = JSON.parse(data);
					resolve(jsonData);
				});
			});
		}

		getJsondata(currentOpenFilePath)
			.then((data: any) => {
				// Log the parsed JSON data to the console outside the readFile callback
				const decoratorsInFile = data?.ops.filter((ops: any) => {
					if (ops.insert.includes(activeEditorFilename)) {
						return ops;
					}
				});

				// lines of decorators in current open note
				const decoratorLines = decoratorsInFile?.map((decorator: any) => {
					const opsLine = decorator.insert.substring(decorator.insert.indexOf("Ln") + 3, decorator.insert.indexOf(")"));
					return parseInt(opsLine) - 1;
				});

				// decorators in current open note
				const allDecorators = context.globalState.get<any[]>(`decorators-${currentOpenFile}`);

				const matchedDecorators = allDecorators?.filter((decorator) => {
					// if decorator in globalstate is in 'decoratorLines' (active/in note) and decorator has filename that matches
					// current open file name, then return it
					if (decoratorLines.includes(decorator.line) && decorator.file.includes(activeEditorFilename)) {
						return decorator;
					} else {
						// if 'reference' has been deleted from note but not globalstate, remove decorator from globalstate
						if (decorator.file.includes(activeEditorFilename)) {
							// if the decorators filename (from globalstate) matches the current open file in editor
							// (but has been removed from not, and therefore is not included in the 'decoratorLines' array)
							// then remove it from globalstate

							const globalState = context.globalState;

							const indexToRemove = allDecorators.findIndex((obj) => decorator === obj);
							//Remove the decorator object from global state
							allDecorators.splice(indexToRemove, 1);

							// Update global state with the modified array
							globalState.update(`decorators-${currentOpenFile}`, allDecorators);

							// remove decorator from editor
							activeEditor?.setDecorations(decorationType, []);
						}
					}
				});

				//Create an array to store the decoration options
				const decorations: vscode.DecorationOptions[] = [];

				matchedDecorators?.map((decorator) => {
					// Populate the array with DecorationOptions for each line
					const decorationRange = new vscode.Range(decorator.line, 0, decorator.line, Number.MAX_VALUE);
					decorations.push({ range: decorationRange });
				});
				// Apply the decorations to the active editor
				activeEditor?.setDecorations(decorationType, decorations);
			})
			.catch((error) => {
				console.error(error);
			});
	}
}
