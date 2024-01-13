import * as vscode from "vscode";
import * as fse from "fs-extra";

export async function deleteFile(filePath: string): Promise<void> {
	try {
		if (await fse.pathExists(filePath)) {
			fse.unlink(filePath);
			vscode.window.showInformationMessage(`File deleted successfully.`);
		} else {
			vscode.window.showErrorMessage(`File not found.`);
		}
	} catch (error: any) {
		vscode.window.showErrorMessage(`Error deleting file: ${error.message}`);
	}
}
