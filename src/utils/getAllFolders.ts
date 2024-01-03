import * as vscode from "vscode";
import * as path from "path";

interface Folders {
	folderName: string;
	uriPath: string;
	subfolders?: Folders[];
}

type FilesArrayFromFolders = Folders['folderName'][];

async function exploreFolder(folderName: string, globalStorageUri: vscode.Uri, folderPath: string) {
	const fsp = require("fs").promises;

	const files: FilesArrayFromFolders = await fsp.readdir(folderPath);
	const subfolders: Folders[] = [];

	await Promise.all(
		files.map(async (file) => {
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
		const folderContents: Folders[] = [];

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
