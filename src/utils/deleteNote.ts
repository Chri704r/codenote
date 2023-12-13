import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import * as fse from 'fs-extra';
import { get } from 'http';
import { getWebviewOverview } from '../components/overview/overview';
import { getFolderContents } from './initialize';

/* async function updateWebviewContent(panel: vscode.Webview, context: vscode.ExtensionContext) {
    const folders = await getFolderContents(context);
    return getWebviewOverview(panel, context, folders);
} */

async function confirmDeleteModal(): Promise<boolean> {
    const result = await vscode.window.showWarningMessage(
        "If you delete this file, it cannot be restored",
        { modal: true },
        "Confirm",
        "Cancel"
    );

    return result === 'Confirm';
}

export async function deleteFile(fileName: string, context: vscode.ExtensionContext, panel: vscode.WebviewPanel): Promise<void> {
    try {
        const globalStorageUri = context.globalStorageUri;
        const filePath = path.join(globalStorageUri.fsPath, fileName);

        const shouldFileBeDeleted = await confirmDeleteModal();

        if (shouldFileBeDeleted) {
            if (await fse.pathExists(filePath)) {
                await fse.unlink(filePath);
            } else {
                vscode.window.showErrorMessage(`File ${fileName} not found.`);
            }

            /* const updateOverview = await updateWebviewContent(panel.webview, context);
            panel.webview.html = updateOverview; */
        } else {
            vscode.window.showInformationMessage(`Deletion of ${fileName} cancelled`);
        }
    } catch (error: any) {
        vscode.window.showErrorMessage(`Error deleting file: ${error.message}`);
    }
}