import * as vscode from "vscode";
import { displayFolders } from "../../utils/displayFolders";
import { displayNotes } from "../../utils/displayNotes";
import { searchInput } from "../search/searchInput";
import { getAllFolderContents } from "../../utils/getAllFolders";
import { renderSettingsDropdown } from "../dropdown/dropdown";
import { renderAddButtons } from "../../utils/renderAddButtons";

export async function getWebviewOverview(webview: vscode.Webview, context: any, folders: any, files: any) {
	const onDiskPathStyles = vscode.Uri.joinPath(context.extensionUri, "src/components/overview", "overview.css");
	const generalStyles = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "src/style", "general.css"));
	const codiconsUri = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "node_modules", "@vscode/codicons", "dist", "codicon.css"));
	const styles = webview.asWebviewUri(onDiskPathStyles);
	const script = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "src/utils", "script.js"));

	const isDark = vscode.window.activeColorTheme?.kind === vscode.ColorThemeKind.Dark;

	const globalStoragePath = context.globalStorageUri.fsPath;
	const allFolders = await getAllFolderContents(context);

	const notesHTML = await displayNotes(files);
	const folderContentsHTML = await displayFolders(folders);
	const addButtonsHtml = await renderAddButtons();

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

            ${addButtonsHtml}
            
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
                const globalStorageName = 'entry.entry';
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
                    moveButton.addEventListener("mouseover", (button) => {
                        const data = ${JSON.stringify(allFolders)}
                        const sourcePath = moveButton.getAttribute("value")
                        const sourceFoldername = moveButton.getAttribute("name")
                        moveButton.appendChild(list(data, sourcePath, sourceFoldername));
                    }, { once: true })
                });

                document.querySelectorAll(".rename").forEach((renameButton) => {
                    renameButton.addEventListener("click", () => {
                        const oldFolderPath = renameButton.getAttribute("value");
                        const parentPath = oldFolderPath.substr(0, oldFolderPath.lastIndexOf("/"));
                        const parentFolder = parentPath.substr(parentPath.lastIndexOf("/") + 1);
                            vscode.postMessage({
                                command: 'renameFolder',
                                oldFolderPath: oldFolderPath,
                                parentPath: parentPath,
                                parentFolder: parentFolder,
                                webviewToRender: 'overview'
                            });
                        });
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
            <script>
	            updateTheme(${isDark});
            </script>
		</body>
	</html>`;
}
