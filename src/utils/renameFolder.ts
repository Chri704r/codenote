import * as vscode from "vscode";
const fs = require("fs-extra");
const path = require("path");

export async function renameFolder(oldFolderPath: string): Promise<void> {
	const newFolderName = await vscode.window.showInputBox({
		placeHolder: 'Enter the new folder name',
		prompt: 'Provide a new name for the folder'
	});

	if (!newFolderName) {
		return;
	}

    const parentPath = oldFolderPath.substring(0, oldFolderPath.lastIndexOf("/"));

	try {
		await fs.move(oldFolderPath, path.join(parentPath, newFolderName));

		vscode.window.showInformationMessage(`Folder '${path.basename(oldFolderPath)}' renamed to '${newFolderName}'.`);

	} catch (error: any) {
			vscode.window.showWarningMessage(`A folder with the name "${newFolderName}" already exists. Please enter a valid name.`);
		}
	}