import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import * as fse from 'fs-extra';
import { get } from 'http';
import { getWebviewOverview } from '../components/overview/overview';
import { getFolderContents } from './initialize';

async function updateWebviewContent(panel: vscode.Webview, context: vscode.ExtensionContext) {
    const folders = await getFolderContents(context);
    return getWebviewOverview(panel, context, folders);
}

async function confirmDeleteModal(): Promise<boolean> {
    const result = await vscode.window.showWarningMessage(
        "If you delete this folder, it will also delete the content of the folder",
        { modal: true },
        "Confirm",
        "Cancel"
    );

    return result === 'Confirm';
}

export async function deleteFolder(folderName: string, context: vscode.ExtensionContext, panel: vscode.WebviewPanel): Promise<void> {
    try {
        const globalStorageUri = context.globalStorageUri;
        const folderPath = path.join(globalStorageUri.fsPath, folderName);

        const shouldFolderBeDeleted = await confirmDeleteModal();

        if (shouldFolderBeDeleted) {
            if (await fse.pathExists(folderPath)) {
                await fse.remove(folderPath);
            } else {
                vscode.window.showErrorMessage(`Folder ${folderName} not found.`);
            }

            const updateOverview = await updateWebviewContent(panel.webview, context);
            panel.webview.html = updateOverview;
        } else {
            vscode.window.showInformationMessage(`Deletion of ${folderName} cancelled`);
        }
    } catch (error: any) {
        vscode.window.showErrorMessage(`Error deleting folder: ${error.message}`);
    }
}