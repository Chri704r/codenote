import * as vscode from "vscode";
import { displayFolders } from "../../utils/displayFolders";
import { searchInput } from "../search/searchInput";
import { getAllFolderContents } from "../../utils/getAllFolders";
import { renderSettingsDropdown } from "../dropdown/dropdown";

export async function getWebviewOverview(webview: vscode.Webview, context: any, folders: any, files: any) {
    const onDiskPathStyles = vscode.Uri.joinPath(context.extensionUri, "src/components/overview", "overview.css");
    const generalStyles = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "src/style", "general.css"));
    const codiconsUri = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "node_modules", "@vscode/codicons", "dist", "codicon.css"));
    const styles = webview.asWebviewUri(onDiskPathStyles);
    const script = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "src/utils", "script.js"));


	const folderContentsHTML = await displayFolders(folders);
	const allFolders = await getAllFolderContents(context);
    const globalStoragePath = context.globalStorageUri.fsPath;

    const notesHTML = await renderFiles(files);

    async function renderFiles(files: any) {
        return files
            .map((file: any) => {
                const dropdownHtml = renderSettingsDropdown(file);
                return `
                    <div class="item">
                        <div class="left file-item" data-file-name="${file.fileName}" data-file-path="${file.uriPath}">
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
                    </div>
                    `;
            })
            .join("");
    }

    return `<!DOCTYPE html>
	<html lang="en">
		<head>
			<meta charset="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <link rel="stylesheet" href="${styles}">
            <link rel="stylesheet" href="${generalStyles}">
            <link rel="stylesheet" href="${codiconsUri}">
		</head>
		<body>
            ${searchInput()}
            <div>
                <div class="plain">
                    <h2>Last edited</h2>
                </div>
                <div id="folders-container" class="container">
                    ${notesHTML}
                </div>
            </div>
            <div>
                <div class="plain">
                    <h2>All folders</h2>
                </div>
                <div id="folders-container" class="container">
                    ${folderContentsHTML}
                </div>
            </div>

        <!-- TODO: Move to utils folder/file -->			
            <div id="buttons-container" class="container">
				<div class="plain">
					<div id="add-folder-button" class="left">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
							<path
								d="M586-349h25.5v-79.5H691V-454h-79.5v-79.5H586v79.5h-79.5v25.5H586v79.5ZM194.28-217q-24.218 0-40.749-16.531Q137-250.062 137-274.363v-411.274q0-24.301 16.531-40.832Q170.062-743 194.5-743h187l77.5 77.5h306.72q24.218 0 40.749 16.531Q823-632.438 823-608v333.5q0 24.438-16.531 40.969Q789.938-217 765.72-217H194.28Zm.22-25.5h571q14 0 23-9t9-23V-608q0-14-9-23t-23-9H449l-77.5-77.5h-177q-14 0-23 9t-9 23v411q0 14 9 23t23 9Zm-32 0v-475 475Z" />
						</svg>
					</div>
					<div id="add-note-button" class="right">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
							<path
								d="M234-177q-23.969 0-40.734-16.766Q176.5-210.531 176.5-234.5V-726q0-23.969 16.766-40.734Q210.031-783.5 234-783.5h492q23.969 0 40.734 16.766Q783.5-749.969 783.5-726v228q-6.873-1.386-13.186-2.193Q764-501 758-503v-223q0-12-10-22t-22-10H234q-12 0-22 10t-10 22v491.5q0 12 10 22t22 10h224.963q1.037 7 1.889 13.043.853 6.043 3.148 12.457H234Zm-32-67v41.5V-758v255-3 262Zm106.5-77h159.027q1.973-6 4.473-12.25t5.5-13.25h-169v25.5Zm0-146.5H580q14.5-7.5 25.5-13t24-10.5v-2h-321v25.5Zm0-146.5h343v-25.5h-343v25.5ZM718.534-93.5Q658-93.5 616-135.466q-42-41.967-42-102.5 0-60.534 41.966-102.534 41.967-42 102.5-42Q779-382.5 821-340.534q42 41.967 42 102.5 0 60.534-41.966 102.534-41.967 42-102.5 42ZM705-125h27.5v-99.5H832v-27h-99.5V-351H705v99.5h-99.5v27H705v99.5Z" />
						</svg>
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
                            currentPage: 'overview'
                        });
                    });
                });

            document.querySelector("#add-folder-button").addEventListener("click", () => {
                const globalStorageName = 'undefined_publisher.codenote';
                const globalStoragePath = ${JSON.stringify(globalStoragePath)};
                const overview = 'overview';
                vscode.postMessage({
                    command: 'addFolder',
                    destinationFolderName: globalStorageName,
                    destinationFolderUri: globalStoragePath,
                    webviewToRender: overview,
                });
            });

            document.querySelector("#add-note-button").addEventListener("click", () => {
                const notesFolderPath = ${JSON.stringify(globalStoragePath)} + '/Notes';
                const overview = 'overview';
                vscode.postMessage({
                    command: 'addNote',
                    destinationFolderUri: notesFolderPath,
                    webviewToRender: overview,
                });
            });
            
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

                        if (deleteContainer) {
                            deleteContainer.classList.remove("hidden");
                            const deleteButtonPerm = deleteContainer.querySelector("#delete-button-perm");
                
                            deleteButtonPerm.addEventListener("click", () => {
                                deleteContainer.classList.add("hidden");
                                if (folderName) {
                                    vscode.postMessage({
                                        command: 'deleteFolder',
                                        folderName: folderName,
                                        folderPath: folderPath,
                                        setPage: 'overview'
                                    });                            
                                } else {
                                    vscode.postMessage({
                                        command: 'deleteFile',
                                        fileName: deleteButton.getAttribute("data-file-name"),
                                        filePath: deleteButton.getAttribute("data-file-path"),
                                        setPage: 'overview',
                                        currentFolderName: ${JSON.stringify(globalStoragePath)}
                                    }); 
                                }
                            });
                        }
                    });
                });
            </script>
            <script src="${script}"></script>
		</body>
	</html>`;
}
