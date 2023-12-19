import * as path from 'path';
import * as vscode from 'vscode';
import * as fse from 'fs-extra';
import { getWebviewOverview } from '../components/overview/overview';
import { getFolderContents } from './initialize';
import { getFiles } from './getLastEditedNotes';

async function updateWebviewContent(panel: vscode.Webview, context: vscode.ExtensionContext) {
    const folders = await getFolderContents(context);
    const files = await getFiles(context);
    return await getWebviewOverview(panel, context, folders, files);
}

export async function deleteFolder(folderName: string, context: vscode.ExtensionContext, panel: vscode.WebviewPanel): Promise<void> {
    try {
        const globalStorageUri = context.globalStorageUri;
        const folderPath = path.join(globalStorageUri.fsPath, folderName);
        console.log(folderPath);
            if (await fse.pathExists(folderPath)) {
                await deleteFolderRecursive(folderPath);
                vscode.window.showInformationMessage(`Folder ${folderName} deleted successfully.`);
            } else {
                vscode.window.showErrorMessage(`Folder ${folderName} not found.`);
            }

            const updateOverview = await updateWebviewContent(panel.webview, context);
            panel.webview.html = updateOverview;
    } catch (error: any) {
        vscode.window.showErrorMessage(`Error deleting folder: ${error.message}`);
    }
}

async function deleteFolderRecursive(folderPath: string): Promise<void> {
    try {
        const folderContents = await fse.readdir(folderPath);

        for (const item of folderContents) {
            const itemPath = path.join(folderPath, item);
            const itemStat = await fse.lstat(itemPath);

            if (itemStat.isDirectory()) {
                // Recursive call for subfolder
                await deleteFolderRecursive(itemPath);
            } else {
                // Delete file
                await fse.unlink(itemPath);
            }
        }

        // Remove the empty folder
        await fse.rmdir(folderPath);
    } catch (error) {
        console.error(`Error deleting folder ${folderPath}`);
    }
}