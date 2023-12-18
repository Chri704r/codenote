import * as vscode from "vscode";
const fs = require('fs').promises;
const path = require('path');
import { getWebviewOverview } from '../components/overview/overview';
import { getFolderContents } from './initialize';
import { getFiles } from './getLastEditedNotes';

async function updateWebviewContent(panel: vscode.Webview, context: vscode.ExtensionContext) {
	const folders = await getFolderContents(context);
	const files = await getFiles(context);
	return getWebviewOverview(panel, context, folders, files);
}

export async function addFolder(destinationFolder: string, context: vscode.ExtensionContext, panel: vscode.WebviewPanel): Promise<void> {
	const globalStorageUri = context.globalStorageUri;
	// const currentFolder = path.join(globalStorageUri.fsPath, folderName);

	const newFolderName = await vscode.window.showInputBox({
		placeHolder: 'Enter folder name',
		prompt: 'Provide a name for the new folder'
	});

	if (!newFolderName) {
		// User canceled or entered an empty name
		return;
	}

	// const currentFolderPath = path.join(globalStorageUri.fsPath, currentFolder);
	const newFolderPath = path.join(destinationFolder, newFolderName);

	try {
		await fs.mkdir(newFolderPath, Error);
		vscode.window.showInformationMessage(`Folder "${newFolderName}" created successfully.`);
		console.log(`Folder '${newFolderName}' created successfully.`);

		const updateOverview = await updateWebviewContent(panel.webview, context);
		panel.webview.html = updateOverview;
		
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