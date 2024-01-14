import * as vscode from "vscode";
const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");

export async function addNote(destinationFolderUri: string): Promise<void> {
	const newNoteName = uuidv4();

	if (!newNoteName) {
		return;
	}

	const newNotePath = path.join(destinationFolderUri, `${newNoteName}.json`);

	try {
		await fs.access(newNotePath);

		vscode.window.showWarningMessage(`A note of that name already exists. Please try again.`);
		console.error(`Note already exists`);
	} catch {
		try {
			await fs.writeFile(newNotePath, "{}");
			vscode.window.showInformationMessage(`New note created successfully.`);
		} catch (error: any) {
			vscode.window.showErrorMessage(`Error creating note: ${error.message}`);
		}
	}
}
