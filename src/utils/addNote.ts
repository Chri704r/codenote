import * as vscode from "vscode";
const fs = require('fs').promises;
const path = require('path');
const {v4 : uuidv4} = require('uuid');

export async function addNote(destinationFolderName: string, destinationFolderUri: string, webviewToRender: string, context: vscode.ExtensionContext, panel: vscode.WebviewPanel): Promise<void> {

    const newNoteName = uuidv4();

    if (!newNoteName) {
        return;
    }

    const newNotePath = path.join(destinationFolderUri, `${newNoteName}.json`);
    console.log(newNotePath);

    try {
        await fs.access(newNotePath);

        vscode.window.showWarningMessage(`A note of that name already exists. Please try again.`);
        // vscode.window.showWarningMessage(`Note "${newNoteName}.json" already exists.`);
        console.error(`Note already exists`);
    } catch {
        try {
            await fs.writeFile(newNotePath, `
                {
                    "ops": [
                    { "insert": "This is a new note.\n" }
                    ]
                }
                `);
            vscode.window.showInformationMessage(`New note created successfully.`);
            // vscode.window.showInformationMessage(`Note "${newNoteName}.json" created successfully.`);
        } catch (error: any) {
            vscode.window.showErrorMessage(`Error creating note: ${error.message}`);
        }
    }
}