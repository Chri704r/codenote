import * as path from "path";
import * as vscode from "vscode";
import { timeAgo, readFirstLine } from "./getLastEditedNotes";
const fs = require("fs");
const fsp = require("fs").promises;

export async function initializeFileAndFolder(context: vscode.ExtensionContext) {
	const folderName = 'Notes';
	const fileName = 'Getting started with Entry.json';
	const fileContent = {
		"ops": [
		  {
			"attributes": {
			  "size": "large",
			  "bold": true
			},
			"insert": "Welcome to Entry!"
		  },
		  {
			"insert": "\n\nYour new favorite notes extension for VSCode. Take your note taking to a new level with our amazing tools, designed to make it easier for you.\n\nTake notes, add bookmarks to your code - and save them directly in your notes!\n\n"
		  }
		]
	};

	const jsonString = JSON.stringify(fileContent, null, 2);
	
	const globalStorageUri = context.globalStorageUri;
	const folderPath = path.join(globalStorageUri.fsPath, folderName);
	const filePath = path.join(folderPath, fileName);

	if (!fs.existsSync(folderPath)) {
		fs.mkdirSync(folderPath, { recursive: true });
		fs.writeFileSync(filePath, jsonString);
	}

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

interface Folders {
	folderName: string;
	uriPath: string;
}

interface Files {
    fileName: string,
	uriPath: string,
	nameWithoutExtension: string,
	mtime: number,
	firstLine: string,
	lastModified: string,
	date: string
}

export async function getContentInFolder(folder: Folder): Promise<any> {
	try {
		const mainFolderPath = folder.uriPath;
		const stats = await fsp.stat(mainFolderPath);

		let folderContent = {};

		if (stats.isDirectory()) {
			const filesInFolder = await fsp.readdir(mainFolderPath);

			const folders: Folders[] = [];
			const files: Files[] = [];

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