import * as vscode from "vscode";
const fs = require('fs').promises;
const path = require('path');

export async function addFolder(context: any) {
	const globalStorageUri = context.globalStorageUri;

	const newFolderName = await vscode.window.showInputBox({
		placeHolder: 'Enter folder name',
		prompt: 'Provide a name for the new folder'
	});

	if (!newFolderName) {
		// User canceled or entered an empty name
		return;
	}

	const folderPath = path.join(globalStorageUri.fsPath, newFolderName);

	try {
		await fs.mkdir(folderPath, Error);
		vscode.window.showInformationMessage(`Folder "${newFolderName}" created successfully.`);
		console.log(`Folder '${newFolderName}' created successfully.`);
	} catch (error: any) {
		if (error.code === 'EEXIST') {
			vscode.window.showWarningMessage(`Folder "${newFolderName}" already exists.`);
			console.error(`Folder already exists: ${error.message}`);
		} else {
			vscode.window.showErrorMessage(`Error creating folder: ${error.message}`);
			console.error(`Error creating folder: ${error.message}`);

		}
	}
}