import * as vscode from "vscode";
const fs = require("fs").promises;
const path = require("path");

export async function addFolder(destinationFolderUri: string): Promise<void> {
	const newFolderName = await vscode.window.showInputBox({
		placeHolder: "Enter folder name",
		prompt: "Provide a name for the new folder",
	});

	if (!newFolderName) {
		return;
	}

	const newFolderPath = path.join(destinationFolderUri, newFolderName);

	try {
		await fs.mkdir(newFolderPath, Error);
		vscode.window.showInformationMessage(`Folder "${newFolderName}" created successfully.`);
	} catch (error: any) {
		if (error.code === "EEXIST") {
			vscode.window.showWarningMessage(`Folder "${newFolderName}" already exists.`);
		} else {
			vscode.window.showErrorMessage(`Error creating folder: ${error.message}`);
		}
	}
}
