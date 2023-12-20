import * as vscode from 'vscode';
import * as fse from 'fs-extra';

export async function deleteFile(fileName: string, filePath: string, context: vscode.ExtensionContext, panel: vscode.WebviewPanel): Promise<void> {
    try {
        console.log(fileName);
            if (await fse.pathExists(filePath)) {
                await fse.unlink(filePath);
                vscode.window.showInformationMessage(`File ${fileName} deleted successfully.`);
            } else {
                vscode.window.showErrorMessage(`File ${fileName} not found.`);
            }
    } catch (error: any) {
        vscode.window.showErrorMessage(`Error deleting file: ${error.message}`);
    }
}