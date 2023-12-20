import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export async function saveFile(fileName: string, quillContentDelta: any, context: vscode.ExtensionContext): Promise<void> {
    try {
        const globalStorageUri = context.globalStorageUri.fsPath;
        const filePath = path.join(globalStorageUri, `${fileName}.json`);

        const quillContentString = JSON.stringify(quillContentDelta, null, 2);

        await fs.promises.writeFile(filePath, quillContentString, 'utf8');

        vscode.window.showInformationMessage(`File ${fileName} saved`);
    } catch (error: any) {
        vscode.window.showErrorMessage(`Error saving file ${fileName}: ${error.message}`);
    }
}

export async function loadFile(fileName: string, context: vscode.ExtensionContext) {
    try {
        const globalStorageUri = context.globalStorageUri.fsPath;
        const filePath = path.join(globalStorageUri, `${fileName}.json`);

        const fileStats = await fs.promises.stat(filePath);

        if (fileStats.size > 0) {
            const fileContent = await fs.promises.readFile(filePath, 'utf8');

            const quillContentDelta = JSON.parse(fileContent);

            return quillContentDelta;
        } else {
            return null;
        }
    } catch (error: any) {
        vscode.window.showErrorMessage(`Error loading file ${fileName}: ${error.message}`);
        return null;
    }
}