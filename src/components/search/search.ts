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
                    <div class="left file-item" data-folder-name="${file.name}" folder-path="${file.uriPath}">
                        <p class="folder-name">${file.name}</p>
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
