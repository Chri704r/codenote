import * as vscode from "vscode";
import { getAllFolderContents } from "../../utils/getAllFolders";
import { getContentInFolder } from "../../utils/initialize";
import { displayFolders } from "../../utils/displayFolders";
import { searchInput } from "../search/searchInput";
import { renderSettingsDropdown } from "../dropdown/dropdown";

export async function getWebviewSubfolder(folderData: any, webview: vscode.Webview, context: any) {
	const styles = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "src/components/overview", "overview.css"));
	const codiconsUri = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "node_modules", "@vscode/codicons", "dist", "codicon.css"));
	const script = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "src/utils", "script.js"));
	const generalStyles = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "src/style", "general.css"));

	const allFolders = await getAllFolderContents(context);
	const folderContent = await getContentInFolder(folderData);
	const folderContentsHTML = await displayFolders(folderContent.folders);

	const notesHTML = await renderFiles(folderContent.files);

    return `<!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <link rel="stylesheet" href="${styles}" />
            <link rel="stylesheet" href="${codiconsUri}">
            <link rel="stylesheet" href="${generalStyles}">
        </head>
        <body>
            <div class="folder-title-container">
                <div class="back-button">
                    <span class="codicon codicon-chevron-left"></span>
                </div>
                <h1 class="subfolder-header">${folderData.folderName}</h1> 
            </div>       
            ${searchInput()}
            <h2>Folders</h2>
            <div id="folders-container" class="container">
                ${folderContentsHTML}
            </div> 
            <h2>Files</h2>
            <div id="folders-container" class="container">
                ${notesHTML}
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
                    const uri = ${JSON.stringify(folderData.uriPath)}
                    const parentUri = uri.substr(0, uri.lastIndexOf("/"));
                    const parentFolder = parentUri.substr(parentUri.lastIndexOf("/") + 1);
                    if(parentFolder == "undefined_publisher.codenote"){
                        vscode.postMessage({
                            page: "overview",
                        });
                    } else{
                        vscode.postMessage({
                            page: 'subfolder',
                            folderName: parentFolder,
                            folderPath: parentUri
                        });
                    }
                })

                document.querySelectorAll(".move").forEach((moveButton)=>{
                    moveButton.addEventListener("mouseover", (button)=>{
                        const data = ${JSON.stringify(allFolders)}
                        const sourcePath = moveButton.getAttribute("value")
                        const sourceFoldername = moveButton.getAttribute("name")
                        moveButton.appendChild(list(data, sourcePath, sourceFoldername));
                    }, { once: true })
                });

                document.querySelectorAll(".delete-button").forEach((deleteButton) => {
                    deleteButton.addEventListener("click", () => {
                        const folderName = deleteButton.getAttribute("data-folder-name");
                        const folderPath = deleteButton.getAttribute("data-folder-path");
                
                        const deleteContainer = deleteButton.closest(".item").querySelector("#delete-container");
                
                        deleteContainer.classList.remove("hidden");
                
                        const deleteButtonPerm = deleteContainer.querySelector("#delete-button-perm");
                
                        deleteButtonPerm.addEventListener("click", () => {
                            deleteContainer.classList.add("hidden");
                
                            vscode.postMessage({
                                command: 'deleteFolder',
                                folderName: folderName,
                                folderPath: folderPath,
                                setPage: 'subfolder',
                                currentFolderName: ${JSON.stringify(folderData.folderName)},
                                currentFolderPath: ${JSON.stringify(folderData.uriPath)}
                            });
                        });
                    });
                });
            </script>
            <script src="${script}"></script>
        </body>
    </html>
    `;
}

async function renderFiles(files: any) {
	return files
		.map((file: any) => {
			const dropdownHtml = renderSettingsDropdown(file);
			return `
                <div class="item">
                    <div class="left file-item" data-folder-name="${file.fileName}" folder-path="${file.uriPath}">
                        <p class="folder-name">${file.fileName}</p>
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
