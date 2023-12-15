import * as vscode from "vscode";
import { getAllFolderContents } from "../../utils/getAllFolders";
import { getContentInFolder } from "../../utils/initialize";
import { displayFolders } from "../../utils/displayFolders";

export async function getWebviewSubfolder(folderData: any, webview: vscode.Webview, context: any) {
	const styles = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "src/components/overview", "overview.css"));
	const subfolderstyles = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "src/components/subfolder", "subfolder.css"));
	const deleteModalStyles = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "src/style", "deleteModal.css"));
	const codiconsUri = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "node_modules", "@vscode/codicons", "dist", "codicon.css"));
	const script = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "src/components/subfolder", "subfolder.js"));

	const allFolders = await getAllFolderContents(context);
	const folderContent = await getContentInFolder(folderData);
	const folderContentsHTML = await displayFolders(folderContent.folders);

	return `<!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <link rel="stylesheet" href="${styles}" />
            <link rel="stylesheet" href="${deleteModalStyles}" />
            <link rel="stylesheet" href="${subfolderstyles}" />
            <link rel="stylesheet" href="${codiconsUri}">
        </head>
        <body>
            <div class="folder-title-container">
                <div class="back-button">
                    <span class="codicon codicon-chevron-left"></span>
                </div>
                <h1 class="subfolder-header">${folderData.folderName}</h1> 
            </div>       
            <h2>Folders</h2>
            <div id="folders-container" class="container">
                ${folderContentsHTML}
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
                const vscode = acquireVsCodeApi();
                document.querySelectorAll(".left").forEach((folder) => {
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
                })
            </script>
            <script src="${script}"></script>
        </body>
    </html>
    `;
}
