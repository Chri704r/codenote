import * as vscode from "vscode";
import { renderSettingsDropdown } from "../dropdown/dropdown";
import { renderFolderContent } from "../../utils/renderFolderContent";
import { getAllFolderContents } from "../../utils/getAllFolders";

export async function getWebviewOverview(webview: vscode.Webview, context: any, folders: any) {
    const onDiskPathStyles = vscode.Uri.joinPath(context.extensionUri, "src/components/overview", "overview.css");
    const styles = webview.asWebviewUri(onDiskPathStyles);
    const deleteModalStyles = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "src/style", "deleteModal.css"));
	const codiconsUri = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "node_modules", "@vscode/codicons", "dist", "codicon.css"));
    const subfolderstyles = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "src/components/subfolder", "subfolder.css"));

    const deleteModal = 
    Object.keys(folders).map(key => {
        return `<div id="delete-container" class="hidden" data-folder-name="${folders[key].folderName}">
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
        </div>`;
}).join('');

    const folderContentsHTML = await renderFolderContent(folders);
    const allFolders = await getAllFolderContents(context);

    return `<!DOCTYPE html>
	<html lang="en">
		<head>
			<meta charset="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <link rel="stylesheet" href="${styles}">
            <link rel="stylesheet" href="${deleteModalStyles}" />
            <link rel="stylesheet" href="${codiconsUri}">
            <link rel="stylesheet" href="${subfolderstyles}" />
		</head>
		<body>
            <div>
                <h1>All folders</h1>
                <div id="folders-container" class="container">
                    ${folderContentsHTML}
                </div>
            </div>
            ${deleteModal}

        <!-- TODO: Move to utils folder/file -->			
            <div id="add-container" class="container">
				<div class="plain">
					<div class="left">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
							<path
								d="M586-349h25.5v-79.5H691V-454h-79.5v-79.5H586v79.5h-79.5v25.5H586v79.5ZM194.28-217q-24.218 0-40.749-16.531Q137-250.062 137-274.363v-411.274q0-24.301 16.531-40.832Q170.062-743 194.5-743h187l77.5 77.5h306.72q24.218 0 40.749 16.531Q823-632.438 823-608v333.5q0 24.438-16.531 40.969Q789.938-217 765.72-217H194.28Zm.22-25.5h571q14 0 23-9t9-23V-608q0-14-9-23t-23-9H449l-77.5-77.5h-177q-14 0-23 9t-9 23v411q0 14 9 23t23 9Zm-32 0v-475 475Z" />
						</svg>
					</div>
					<div class="right">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
							<path
								d="M234-177q-23.969 0-40.734-16.766Q176.5-210.531 176.5-234.5V-726q0-23.969 16.766-40.734Q210.031-783.5 234-783.5h492q23.969 0 40.734 16.766Q783.5-749.969 783.5-726v228q-6.873-1.386-13.186-2.193Q764-501 758-503v-223q0-12-10-22t-22-10H234q-12 0-22 10t-10 22v491.5q0 12 10 22t22 10h224.963q1.037 7 1.889 13.043.853 6.043 3.148 12.457H234Zm-32-67v41.5V-758v255-3 262Zm106.5-77h159.027q1.973-6 4.473-12.25t5.5-13.25h-169v25.5Zm0-146.5H580q14.5-7.5 25.5-13t24-10.5v-2h-321v25.5Zm0-146.5h343v-25.5h-343v25.5ZM718.534-93.5Q658-93.5 616-135.466q-42-41.967-42-102.5 0-60.534 41.966-102.534 41.967-42 102.5-42Q779-382.5 821-340.534q42 41.967 42 102.5 0 60.534-41.966 102.534-41.967 42-102.5 42ZM705-125h27.5v-99.5H832v-27h-99.5V-351H705v99.5h-99.5v27H705v99.5Z" />
						</svg>
					</div>
				</div>
			</div>
            <script>
                const vscode = acquireVsCodeApi();

                document.addEventListener('DOMContentLoaded', function () {
                    document.querySelectorAll(".settings-container").forEach((button) => {
                        button.addEventListener("click", () => {
                            event.stopPropagation();
                            button.querySelector(".dropdown").classList.toggle("hidden");
                        });
                    });

                    document.querySelectorAll(".delete-button").forEach((deleteButton) => {
                        deleteButton.addEventListener("click", () => {
                            const deleteContainer = document.querySelector("#delete-container");
                            deleteContainer.classList.remove("hidden");

                            const folderName = deleteContainer.getAttribute('data-folder-name');
                            
                            const deleteButton = document.querySelector(".secondary-button");
                            deleteButton.addEventListener("click", function () {
                                deleteContainer.classList.add("hidden");
                            })
                            const deleteFolderConfirm = document.getElementById("delete-button-perm");

                            deleteFolderConfirm.addEventListener('click', function () {
                                deleteContainer.classList.add('hidden');

                                vscode.postMessage({
                                    command: 'deleteFolder',
                                    folderName: folderName
                                });
                            });

                        });
                    });

                    const folderItems = document.querySelectorAll('.item');
                    const deleteContainer = document.getElementById('delete-container');

                    folderItems.forEach(item => {
                        item.addEventListener('click', function () {
                            const folderName = item.getAttribute('data-folder-name');

                            vscode.postMessage({
                                page: 'subfolder',
                                folderName: folderName
                            });
                        });
                    });

                    document.querySelectorAll(".move").forEach((moveButton)=>{
                        moveButton.addEventListener("mouseover", (button)=>{
                            const data = ${JSON.stringify(allFolders)}
                            const sourcePath = moveButton.getAttribute("value")
                            const sourceFoldername = moveButton.getAttribute("name")
                            moveButton.appendChild(list(data, sourcePath, sourceFoldername));
                        }, { once: true })
                    })

                    function list(data = [], sourcePath, sourceFoldername) {
                        if (data.length > 0) {
                            const ul = document.createElement("ul");
                            data.forEach((folder) => {
                                const li = document.createElement("li");
                                li.id = folder.folderName;
                                const a = document.createElement("a");
                                const p = document.createElement("p");
                                p.textContent = folder.folderName;
                                if (folder.uriPath === sourcePath) {
                                    p.style.color = "#747474";
                                    li.style.cursor = "not-allowed";
                                }
                                a.appendChild(p);
                                if (folder.subfolders && folder.subfolders.length > 0) {
                                    const icon = document.createElement("span");
                                    icon.classList.add("codicon");
                                    icon.classList.add("codicon-chevron-right");
                                    a.appendChild(icon);
                                }
                                li.appendChild(a);
                                listenForMouseOver(li, folder.subfolders, sourcePath);
                                if (folder.uriPath !== sourcePath) {
                                    clickOnFolder(li, folder, sourcePath, sourceFoldername);
                                }
                                ul.appendChild(li);
                            });
                            return ul;
                        }
                    }

                    function clickOnFolder(option, folder, sourcePath, sourceFolderName) {
                        option.addEventListener("click", () => {
                            //document.querySelector('[data-folder-name="sourceFolderName"').classList.add("hidden");
                        })
                    }
    
                    function listenForMouseOver(option, subfolders, sourcePath) {
                        option.addEventListener(
                            "mouseover",
                            () => {
                                if (subfolders !== undefined) {
                                    option.appendChild(list(subfolders, sourcePath));
                                }
                            },
                            { once: true }
                        );
                    }
    
                    document.addEventListener("click", (e) => {
                        let isClickInside = false;
                        document.querySelectorAll(".settings-container").forEach((container) => {
                            if (container.contains(event.target)) {
                                isClickInside = true;
                            }
                        });
                        if (!isClickInside) {
                            document.querySelectorAll(".dropdown").forEach((dropdown) => dropdown.classList.add("hidden"));
                        }
                    });
                });
            </script>
		</body>
	</html>`;
}