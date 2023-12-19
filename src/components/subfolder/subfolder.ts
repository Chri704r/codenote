import * as vscode from "vscode";
import { getAllFolderContents } from "../../utils/getAllFolders";
import { getContentInFolder } from "../../utils/initialize";
import { renderSettingsDropdown } from "../dropdown/dropdown";
//import { displayFolders } from "../../utils/displayFolders";
import { searchInput } from "../search/searchInput";
import path from "path";

export async function getWebviewSubfolder(folderData: any, webview: vscode.Webview, context: any) {
	const styles = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "src/components/overview", "overview.css"));
	const subfolderstyles = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "src/components/subfolder", "subfolder.css"));
	const deleteModalStyles = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "src/style", "deleteModal.css"));
	const codiconsUri = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "node_modules", "@vscode/codicons", "dist", "codicon.css"));
	const script = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "src/components/subfolder", "subfolder.js"));
	const generalStyles = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "src/style", "general.css"));

	const allFolders = await getAllFolderContents(context);
	const folderContent = await getContentInFolder(context, folderData);
	const folderContentsHTML = await renderFolderContent(folderContent);

	return `<!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <link rel="stylesheet" href="${styles}" />
            <link rel="stylesheet" href="${deleteModalStyles}" />
            <link rel="stylesheet" href="${subfolderstyles}" />
            <link rel="stylesheet" href="${codiconsUri}">
            <link rel="stylesheet" href="${generalStyles}">
        </head>
        <body>
            <h1 class="subfolder-header"></h1>
            ${searchInput()}
            <h2>Folders</h2>
            <div id="folders-container" class="container">
                ${folderContentsHTML}
            </div> 
            <script>
                document.querySelectorAll(".move").forEach((moveButton)=>{
                    moveButton.addEventListener("mouseover", (button)=>{
                        const data = ${JSON.stringify(allFolders)}
                        const sourcePath = moveButton.getAttribute("value")
                        const sourceFoldername = moveButton.getAttribute("name")
                        moveButton.appendChild(list(data, sourcePath, sourceFoldername));
                    }, { once: true })
                });

                document.querySelectorAll(".item").forEach((folderItem) => {
                    const deleteButton = folderItem.querySelector(".delete-button");
                
                    deleteButton.addEventListener("click", () => {
                        const deleteContainer = document.querySelector("#delete-container");
                
                        deleteContainer.setAttribute('data-folder-name', folderItem.getAttribute('data-folder-name'));
                                
                        const deleteFolderConfirm = document.getElementById("delete-button-perm");
                        deleteFolderConfirm.addEventListener('click', function () {
                            deleteContainer.classList.add('hidden');
                
                            vscode.postMessage({
                                command: 'deleteFolder',
                                folderName: folderItem.getAttribute('data-folder-name')
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

async function renderFolderContent(folderContent: any) {
	return folderContent.folders
		.map((folder: any) => {
			const dropdownHtml = renderSettingsDropdown(folder);
			return `
                <div class="item" data-folder-name="${folder.folderName}">
                    <div class="left">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="#fff" height="24" viewBox="0 -960 960 960" width="24">
                            <path
                                d="M194.28-217q-24.218 0-40.749-16.531Q137-250.062 137-274.363v-411.274q0-24.301 16.531-40.832Q170.062-743 194.5-743h187l77.5 77.5h306.72q24.218 0 40.749 16.531Q823-632.438 823-608v333.5q0 24.438-16.531 40.969Q789.938-217 765.72-217H194.28Zm.22-25.5h571q14 0 23-9t9-23V-608q0-14-9-23t-23-9H449l-77.5-77.5h-177q-14 0-23 9t-9 23v411q0 14 9 23t23 9Zm-32 0v-475 475Z" />
                            </svg>
                        <p class="folder-name">${folder.folderName}</p>
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

                <div id="delete-container" class="hidden" data-folder-name="${folder.folderName}">
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
                `;
		})
		.join("");
}
