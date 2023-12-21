import * as vscode from 'vscode';
import * as fse from 'fs-extra';
import { getWebviewOverview } from '../components/overview/overview';
import { getWebviewSubfolder } from '../components/subfolder/subfolder';
import { getNotes } from './getLastEditedNotes';

async function updateWebview(setPage: string, panel: vscode.WebviewPanel, context: vscode.ExtensionContext, folders: any, currentFolderName: string, currentFolderPath?: string) {
    const updatedFiles = await getNotes(currentFolderName);
	const updatedFolderDeleteFiles = { folderName: currentFolderName, uriPath: currentFolderPath };

    if (setPage === 'overview') {
        panel.webview.html = await getWebviewOverview(panel.webview, context, folders, updatedFiles);
    } else if (setPage === 'subfolder') {
        panel.webview.html = await getWebviewSubfolder(updatedFolderDeleteFiles, panel.webview, context);
    } else {
        vscode.window.showErrorMessage("Error rendering page");
    }
}

export async function deleteFile(fileName: string, filePath: string, context: vscode.ExtensionContext, panel: vscode.WebviewPanel, folders: any, setPage: string, currentFolderName: string, currentFolderPath?: string): Promise<void> {
    try {
            if (await fse.pathExists(filePath)) {
                fse.unlink(filePath);
                vscode.window.showInformationMessage(`File ${fileName} deleted successfully.`);
            } else {
                vscode.window.showErrorMessage(`File ${fileName} not found.`);
            }

            await updateWebview(setPage, panel, context, folders, currentFolderName, currentFolderPath)
    } catch (error: any) {
        vscode.window.showErrorMessage(`Error deleting file: ${error.message}`);
    }
}
