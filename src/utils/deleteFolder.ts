import * as path from 'path';
import * as vscode from 'vscode';
import * as fse from 'fs-extra';
import { getWebviewOverview } from '../components/overview/overview';
import { getFolderContents } from './initialize';
import { getFiles } from './getLastEditedNotes';

async function updateWebviewContent(panel: vscode.Webview, context: vscode.ExtensionContext) {
    const folders = await getFolderContents(context);
    const files = await getFiles(context);
    return getWebviewOverview(panel, context, folders, files);
}

export async function deleteFolder(folderName: string, context: vscode.ExtensionContext, panel: vscode.WebviewPanel): Promise<void> {
    try {
        const globalStorageUri = context.globalStorageUri;
        const folderPath = path.join(globalStorageUri.fsPath, folderName);

            if (await fse.pathExists(folderPath)) {
                await fse.remove(folderPath);
            } else {
                vscode.window.showErrorMessage(`Folder ${folderName} not found.`);
            }

            const updateOverview = await updateWebviewContent(panel.webview, context);
            panel.webview.html = updateOverview;
    } catch (error: any) {
        vscode.window.showErrorMessage(`Error deleting folder: ${error.message}`);
    }
}