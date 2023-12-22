export function moveToFolder(destinationFolderPath: string, sourceFolderPath: string) {
	const fs = require("fs-extra");
	const path = require("path");
	const vscode = require("vscode");

	// Move the file into the directory
	fs.move(sourceFolderPath, path.join(destinationFolderPath, path.basename(sourceFolderPath)), (err: any) => {
		if (err) {
			if (err === "Error: dest already exists.") {
				vscode.window.showErrorMessage("Error! File already exists in folder. Try to rename before moving.");
			}
		} else {
			vscode.window.showInformationMessage("Succesfully moved!");
		}
	});
}
