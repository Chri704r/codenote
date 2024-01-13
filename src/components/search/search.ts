import { renderSettingsDropdown } from "../dropdown/dropdown";
import * as vscode from "vscode";
import { searchInput } from "./searchInput";
import { getAllFolderContents } from "../../utils/getAllFolders";
import { header } from "../../utils/header";
import { scriptImport } from "../../utils/scriptImport";
import { readFirstLine } from "../../utils/getLastEditedNotes";

export async function search(searchTerm: string, webview: vscode.Webview, context: vscode.ExtensionContext) {
	const allFolders = await getAllFolderContents(context);
	const results = await searchFiles(searchTerm, context);

	let folderContentsHTML: any;
	let fileContentsHTML: any;

	if (results !== undefined) {
		folderContentsHTML = await renderFolderContent(results?.folders);
		fileContentsHTML = await renderFiles(results?.files);
	} else {
		folderContentsHTML = `<p>No matching results..</p>`;
		fileContentsHTML = "";
	}

	const htmlHeader = await header(webview, context);
	const scriptHtml = await scriptImport(webview, context);

	return `<!DOCTYPE html>
	<html lang="en">
	${htmlHeader}

	<style>
		#search-backbutton-container{
			display: grid;
    		grid-template-columns: min-content 1fr;
    		gap: 15px
		}
	</style>
	<body>
		<div id="search-backbutton-container">
            <div class="back-button">
                <span class="codicon codicon-chevron-left"></span>
            </div>
            ${searchInput(searchTerm)}
        </div>

		<h1>Results</h1>
        <div id="folders-container" class="container">
            ${folderContentsHTML}
			${fileContentsHTML}
        </div>

		<div id="delete-container" class="hidden">
                <div id="delete-wrapper">
                    <div id="delete-modal">
                        <p>Are you sure you want to delete?</p>
                        <p>Once you click delete you will not be able to get it back.</p>
                        <div id="button-container">
                            <button class="secondary-button">Cancel</button>
                            <button id="delete-button-perm">
                                <p>Delete</p>
                                <span class="codicon codicon-trash"></span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

		<script>
			document.querySelectorAll(".folder-item").forEach((folder) => {
					folder.addEventListener("click", () => {
						const folderName = folder.getAttribute('data-folder-name');
						const path = folder.getAttribute('folder-path');
						vscode.postMessage({
							page: 'subfolder',
							folderName: folderName,
							folderPath: path
						});
					});
				});

				document.querySelectorAll(".file-item").forEach((file) => {
                    file.addEventListener("click", () => {
                        const noteName = file.getAttribute('data-file-name');
                        const notePath = file.getAttribute('data-file-path');
                        vscode.postMessage({
                            page: 'note',
                            fileName: noteName,
                            filePath: notePath,
                            currentPage: 'subfolder'
                        });
                    });
                });

				document.querySelector(".back-button").addEventListener("click", ()=>{
					vscode.postMessage({
						page: "overview",
					});
				})
		
				document.querySelectorAll(".move").forEach((moveButton)=>{
                    moveButton.addEventListener("mouseover", (button)=>{
                        const data = ${JSON.stringify(allFolders)}
                        const sourcePath = moveButton.getAttribute("value")
                        const sourceFoldername = moveButton.getAttribute("name")
                        moveButton.appendChild(list(data, sourcePath, sourceFoldername));
                    }, { once: true })
                })
		</script>
		${scriptHtml}
	</body>
</html>`;
}

async function searchFiles(searchTerm: string, context: vscode.ExtensionContext) {
	if (searchTerm) {
		const globalStorageUri = context.globalStorageUri;
		const results = await searchFilesInStorage(globalStorageUri, searchTerm);

		if (results.length > 0) {
			const files = results.filter((result: any) => result.type === vscode.FileType.File);
			const folders = results.filter((result: any) => result.type === vscode.FileType.Directory);

			return { files, folders };
		}
	}
}

interface SearchResult {
	uriPath: string;
	name: string;
	type: vscode.FileType;
	date?: string;
	firstLine?: string;
}

async function searchFilesInStorage(rootUri: vscode.Uri, searchTerm: string) {
	const result: SearchResult[] = [];

	const processDirectory = async (dirUri: vscode.Uri) => {
		const entries = await vscode.workspace.fs.readDirectory(dirUri);

		for (const [name, type] of entries) {
			const uriPath = vscode.Uri.joinPath(dirUri, name);

			if (type === vscode.FileType.Directory) {
				await processDirectory(uriPath);

				if (name.toLowerCase().includes(searchTerm.toLowerCase())) {
					result.push({ uriPath: uriPath.path, name, type });
				}
			} else if (type === vscode.FileType.File) {
				const content = await vscode.workspace.fs.readFile(uriPath);
				const contentStr = Buffer.from(content).toString("utf-8");

				let dateStr: string = "";
				let firstLine: string = "";
				try {
					const fsp = require("fs").promises;
					const uriPath = vscode.Uri.joinPath(dirUri, name);
					const stats = await fsp.stat(uriPath.path);

					const date = new Date(stats.mtimeMs);
					dateStr = date.getDate() + "." + date.getMonth() + "." + date.getFullYear();
					firstLine = await readFirstLine(uriPath.path);
				} catch (error) {
					console.error("Error getting file stats:", error);
				}

				if (name.toLowerCase().includes(searchTerm.toLowerCase()) || contentStr.toLowerCase().includes(searchTerm.toLowerCase())) {
					result.push({ uriPath: uriPath.path, name, type, date: dateStr, firstLine });
				}
			}
		}
	};

	await processDirectory(rootUri);

	return result;
}

async function renderFolderContent(folders: any) {
	return folders
		.map((folder: any) => {
			const dropdownHtml = renderSettingsDropdown(folder);
			return `
	            <div class="item folder-item" data-folder-name="${folder.name}" folder-path="${folder.uriPath}">
	                <div class="left">
					<div class="foldername-container">
						<span class="codicon codicon-folder"></span>
	                    <p class="folder-name">${folder.name}</p>
						</div>
	                </div>
	                <div class="right">
	                    <div class="settings-container">
							<span class="codicon codicon-kebab-vertical"></span>
	                        ${dropdownHtml}
	                    </div>
	                </div>
	            </div>
	            `;
		})
		.join("");
}

async function renderFiles(files: any) {
	return files
		.map((file: any) => {
			const dropdownHtml = renderSettingsDropdown(file);
			return `
                <div class="item">
                    <div class="left file-item" data-folder-name="${file.name}" data-file-path="${file.uriPath}">
                        <p class="folder-name">${file.firstLine}</p>
                        <p class="mtime">${file.date}</p>
                    </div>
                    <div class="right">
                        <div class="settings-container">
							<span class="codicon codicon-kebab-vertical"></span>
                            ${dropdownHtml}
                        </div>
                    </div>
                </div>
                `;
		})
		.join("");
}
