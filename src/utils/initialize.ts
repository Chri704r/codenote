import * as path from "path";
import * as vscode from "vscode";
import { timeAgo, readFirstLine } from "./getLastEditedNotes";
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
				folderContents.push({ folderName, uriPath: folderPath });
			}
		}

		return folderContents;
	} catch (error) {
		console.error(`Error reading global storage directory`);
		return [];
	}
}

interface Folder {
	files: [];
	folderName: string;
	folders: [];
	uriPath: string;
}

export async function getContentInFolder(folder: any): Promise<any> {
	try {
		const mainFolderPath = folder.uriPath;
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
						if (!file.startsWith(".")) {
							const nameWithoutExtension = path.basename(file, path.extname(file));
							const mtime = stats.mtimeMs;
							const date = new Date(mtime);
							const dateCreated = date.getDate() + "." + date.getMonth() + "." + date.getFullYear();
							const lastModified = timeAgo(mtime);
							const firstLine = await readFirstLine(folderPath);
							files.push({
								fileName: file,
								uriPath: folderPath,
								nameWithoutExtension: nameWithoutExtension,
								mtime: mtime,
								firstLine: firstLine,
								lastModified: lastModified,
								date: dateCreated
							});
						}
					}
				})
			);
			folderContent = { folderName: folder.folderName, uriPath: mainFolderPath, folders, files };
		}
		return folderContent;
	} catch (error) {
		console.error(`Error reading global storage directory`);
		return [];
	}
}