import { renderSettingsDropdown } from "../dropdown/dropdown";
import * as vscode from "vscode";
import { searchInput } from "./searchInput";
import { getAllFolderContents } from "../../utils/getAllFolders";

export async function search(searchTerm: string, webview: vscode.Webview, context: any) {
	const styles = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "src/components/overview", "overview.css"));
	const codiconsUri = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "node_modules", "@vscode/codicons", "dist", "codicon.css"));
	const generalStyles = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "src/style", "general.css"));
	const script = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "src/utils", "script.js"));

	const isDark = vscode.window.activeColorTheme?.kind === vscode.ColorThemeKind.Dark;

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

	return `<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="${styles}" />
        <link rel="stylesheet" href="${codiconsUri}">
        <link rel="stylesheet" href="${generalStyles}">
	</head>
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
            ${searchInput()}
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

				document.querySelectorAll(".file-item").forEach((folder) => {
					folder.addEventListener("click", () => {
						vscode.postMessage({
							page: 'note',
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
		<script src="${script}"></script>
		<script>
			updateTheme(${isDark});
		</script>
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
	uriPath: any;
	name: string;
	type: vscode.FileType;
	date: any;
}

async function searchFilesInStorage(rootUri: vscode.Uri, searchTerm: string) {
	const result: SearchResult[] = [];

	const processDirectory = async (dirUri: vscode.Uri) => {
		const entries = await vscode.workspace.fs.readDirectory(dirUri);

		for (const [name, type] of entries) {
			const fsp = require("fs").promises;

			const uriPath = vscode.Uri.joinPath(dirUri, name);
			const stats = await fsp.stat(uriPath.path);

			let date = new Date(stats.mtimeMs);
			let dateStr = date.getDate() + "." + date.getMonth() + "." + date.getFullYear();

			if (type === vscode.FileType.Directory) {
				await processDirectory(uriPath);
			}

			if (name.toLowerCase().includes(searchTerm.toLowerCase())) {
				result.push({ uriPath: uriPath.path, name, type, date: dateStr });
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
	                    <svg xmlns="http://www.w3.org/2000/svg" fill="#fff" height="24" viewBox="0 -960 960 960" width="24">
	                        <path
	                            d="M194.28-217q-24.218 0-40.749-16.531Q137-250.062 137-274.363v-411.274q0-24.301 16.531-40.832Q170.062-743 194.5-743h187l77.5 77.5h306.72q24.218 0 40.749 16.531Q823-632.438 823-608v333.5q0 24.438-16.531 40.969Q789.938-217 765.72-217H194.28Zm.22-25.5h571q14 0 23-9t9-23V-608q0-14-9-23t-23-9H449l-77.5-77.5h-177q-14 0-23 9t-9 23v411q0 14 9 23t23 9Zm-32 0v-475 475Z" />
	                        </svg>
	                    <p class="folder-name">${folder.name}</p>
						</div>
	                </div>
	                <div class="right">
	                    <div class="settings-container">
	                        <svg xmlns="http://www.w3.org/2000/svg" fill="#fff" height="24" viewBox="0 -960 960 960" width="24">
	                            <path
	                                d="M480.12-139q-34.055 0-57.881-23.803-23.826-23.804-23.826-57.784 0-34.078 23.804-57.952Q446.02-302.413 480-302.413q34.174 0 57.88 23.844 23.707 23.844 23.707 57.881 0 34.036-23.707 57.862Q514.174-139 480.12-139Zm0-259.413q-34.055 0-57.881-23.804Q398.413-446.02 398.413-480q0-34.174 23.804-57.88Q446.02-561.587 480-561.587q34.174 0 57.88 23.707 23.707 23.706 23.707 57.76 0 34.055-23.707 57.881-23.706 23.826-57.76 23.826Zm0-259.174q-34.055 0-57.881-23.894t-23.826-58q0-34.106 23.804-57.813Q446.02-821 480-821q34.174 0 57.88 23.706 23.707 23.707 23.707 57.813t-23.707 58q-23.706 23.894-57.76 23.894Z" />
	                        </svg>
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
                    <div class="left file-item" data-folder-name="${file.name}" folder-path="${file.uriPath}">
                        <p class="folder-name">${file.name}</p>
                        <p class="mtime">${file.date}</p>
                    </div>
                    <div class="right">
                        <div class="settings-container">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="#fff" height="24" viewBox="0 -960 960 960" width="24">
                                <path
                                d="M480.12-139q-34.055 0-57.881-23.803-23.826-23.804-23.826-57.784 0-34.078 23.804-57.952Q446.02-302.413 480-302.413q34.174 0 57.88 23.844 23.707 23.844 23.707 57.881 0 34.036-23.707 57.862Q514.174-139 480.12-139Zm0-259.413q-34.055 0-57.881-23.804Q398.413-446.02 398.413-480q0-34.174 23.804-57.88Q446.02-561.587 480-561.587q34.174 0 57.88 23.707 23.707 23.706 23.707 57.76 0 34.055-23.707 57.881-23.706 23.826-57.76 23.826Zm0-259.174q-34.055 0-57.881-23.894t-23.826-58q0-34.106 23.804-57.813Q446.02-821 480-821q34.174 0 57.88 23.706 23.707 23.707 23.707 57.813t-23.707 58q-23.706 23.894-57.76 23.894Z" />
                            </svg>
                            ${dropdownHtml}
                        </div>
                    </div>
                </div>
                `;
		})
		.join("");
}
