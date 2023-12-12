import * as path from "path";
import * as vscode from "vscode";
const fs = require("fs");
const fsp = require("fs").promises;

export async function initializeFileAndFolder(context: vscode.ExtensionContext) {
	const globalStorageUri = context.globalStorageUri;

	const folderName = "Notes";
	const fileName = "Getting started with Entry.txt";

	const folderPath = path.join(globalStorageUri.fsPath, folderName);
	const filePath = path.join(folderPath, fileName);

	try {
		if (!fs.existsSync(folderPath)) {
			if (isDirectoryEmpty(globalStorageUri.fsPath)) {
				fs.mkdirSync(folderPath, { recursive: true });
				fs.writeFileSync(filePath, "Hello, world!");
			} else {
				return;
			}
		} else {
			return;
		}
	} catch (error: any) {
		console.error(`Error creating folder and file: ${error.message}`);
	}
}

function isDirectoryEmpty(directoryPath: string): boolean {
	const files = fs.readdirSync(directoryPath);
	return files.length === 0;
}

export async function getFolderContents(context: vscode.ExtensionContext) {
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

export async function getContentInFolder(context: vscode.ExtensionContext, folderName: string) {
	try {
		const globalStorageUri = context.globalStorageUri;
		const mainFolderPath = path.join(globalStorageUri.fsPath, folderName);
		const stats = await fsp.stat(mainFolderPath);

		let folderContent = {};

		if (stats.isDirectory()) {
			const filesInFolder = await fsp.readdir(mainFolderPath);

			const folders: any = [];
			const files: any = [];

			await Promise.all(
				filesInFolder.map(async (file: string) => {
					const folderPath = path.join(mainFolderPath, file);
					const stats = await fsp.stat(folderPath);
					if (stats.isDirectory()) {
						folders.push({ folderName: file, uriPath: folderPath });
					} else {
						files.push({ fileName: file, uriPath: folderPath });
					}
				})
			);
			folderContent = { folderName, uriPath: mainFolderPath, folders, files };
		}
		return folderContent;
	} catch (error) {
		console.error(`Error reading global storage directory`);
		return [];
	}
}
