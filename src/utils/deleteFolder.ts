import * as vscode from "vscode";
import * as fse from "fs-extra";
import { getWebviewOverview } from "../components/overview/overview";
import { getWebviewSubfolder } from "../components/subfolder/subfolder";
import { getFolderContents } from "./initialize";
import { getNotes } from "./getLastEditedNotes";

async function updateWebview(
	setPage: string,
	panel: vscode.WebviewPanel,
	context: vscode.ExtensionContext,
	currentFolderName: string,
	currentFolderPath: string,
	files: any
) {
	const updatedFolders = await getFolderContents(context);
	const updatedFolder = { folderName: currentFolderName, uriPath: currentFolderPath };

	if (setPage === "overview") {
		panel.webview.html = await getWebviewOverview(panel.webview, context, updatedFolders, files);
	} else if (setPage === "subfolder") {
		panel.webview.html = await getWebviewSubfolder(updatedFolder, panel.webview, context);
	} else {
		vscode.window.showErrorMessage("Error rendering page");
	}
}

export async function deleteFolder(
	folderName: string,
	folderPath: string,
	context: vscode.ExtensionContext,
	panel: vscode.WebviewPanel,
	setPage: string,
	currentFolderName: string,
	currentFolderPath: string,
	files: any
): Promise<void> {
	try {
		if (await fse.pathExists(folderPath)) {
			await fse.remove(folderPath);
			vscode.window.showInformationMessage(`Folder ${folderName} deleted successfully.`);
		} else {
			vscode.window.showErrorMessage(`Folder ${folderName} not found.`);
		}

		await updateWebview(setPage, panel, context, currentFolderName, currentFolderPath, files);
	} catch (error: any) {
		vscode.window.showErrorMessage(`Error deleting folder: ${error.message}`);
	}
}
