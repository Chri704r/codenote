import * as path from 'path';
import * as vscode from "vscode";
const fs = require('fs');

//TODO: Only create folder and file if folder is empty
export async function initializeFileAndFolder(context: vscode.ExtensionContext) {
    const globalStorageUri = context.globalStorageUri;

    const folderName = 'Notes';
    const fileName = 'Getting started with Entry.txt';

    const folderPath = path.join(globalStorageUri.fsPath, folderName);
    const filePath = path.join(folderPath, fileName);

    try {
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        fs.writeFileSync(filePath, 'Hello, world!');
    } catch (error: any) {
        console.error(`Error creating folder and file: ${error.message}`);
    }
}

export async function getFolderContents(context: vscode.ExtensionContext) {
	const fsp = require('fs').promises;

    try {
        const globalStorageUri = context.globalStorageUri;
        const folders = await fsp.readdir(globalStorageUri.fsPath);
        const folderContents = [];

        for (const folderName of folders) {
            const folderPath = path.join(globalStorageUri.fsPath, folderName);
            const stats = await fsp.stat(folderPath);

            if (stats.isDirectory()) {
                const files = await fsp.readdir(folderPath);
                folderContents.push({ folderName, files });
            }
        }

        return folderContents;
    } catch (error) {
        console.error(`Error reading global storage directory`);
        return [];
    }
}