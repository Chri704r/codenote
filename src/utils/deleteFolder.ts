import * as vscode from "vscode";
import * as fse from "fs-extra";

export async function deleteFolder(folderName: string, folderPath: string): Promise<void> {
	try {
		if (await fse.pathExists(folderPath)) {
			await fse.remove(folderPath);
			vscode.window.showInformationMessage(`Folder ${folderName} deleted successfully.`);
		} else {
			vscode.window.showErrorMessage(`Folder ${folderName} not found.`);
		}
	} catch (error: any) {
		vscode.window.showErrorMessage(`Error deleting folder: ${error.message}`);
	}
}
