import * as vscode from "vscode";
import * as path from "path";
async function exploreFolder(folderName: string, globalStorageUri: vscode.Uri, folderPath: any) {
	const fsp = require("fs").promises;

	const files = await fsp.readdir(folderPath);
	const subfolders: any = [];

	await Promise.all(
		files.map(async (file: any) => {
			const uriPath = path.join(folderPath, file);
			const newStats = await fsp.stat(uriPath);

			if (newStats.isDirectory()) {
				const subfolderData = await exploreFolder(file, globalStorageUri, uriPath);
				subfolders.push(subfolderData);
			}
		})
	);

	if (subfolders.length) {
		return { folderName, subfolders, uriPath: folderPath };
	} else {
		return { folderName, uriPath: folderPath };
	}
}

export async function getAllFolderContents(context: vscode.ExtensionContext) {
	const globalStorageUri = context.globalStorageUri;
	const fsp = require("fs").promises;

	try {
		const folders = await fsp.readdir(globalStorageUri.fsPath);
		const folderContents: any = [];

		await Promise.all(
			folders.map(async (folderName: string) => {
				const folderPath = path.join(globalStorageUri.fsPath, folderName);
				const stats = await fsp.stat(folderPath);
				if (stats.isDirectory()) {
					const folderData = await exploreFolder(folderName, globalStorageUri, folderPath);
					folderContents.push(folderData);
				}
			})
		);

		return folderContents;
	} catch (error) {
		console.error(`Error reading global storage directory: ${error}`);
		return [];
	}
}
