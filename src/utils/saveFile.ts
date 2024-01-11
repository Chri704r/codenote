import * as vscode from "vscode";
import * as fs from "fs";

export async function saveFile(filePath: string, quillContentDelta: any): Promise<void> {
	try {
		const quillContentString = JSON.stringify(quillContentDelta, null, 2);

		await fs.promises.writeFile(filePath, quillContentString, "utf8");

		vscode.window.showInformationMessage(`File saved`);
	} catch (error: any) {
		vscode.window.showErrorMessage(`Error saving file: ${error.message}`);
	}
}

export async function loadFile(filePath: string) {
	try {
		const fileStats = await fs.promises.stat(filePath);

		if (fileStats.size > 0) {
			const fileContent = await fs.promises.readFile(filePath, "utf8");

			const quillContentDelta = JSON.parse(fileContent);

			return quillContentDelta;
		} else {
			return null;
		}
	} catch (error: any) {
		vscode.window.showErrorMessage(`Error loading file: ${error.message}`);
		return null;
	}
}
