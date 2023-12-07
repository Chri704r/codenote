import * as vscode from "vscode";

export function getWebviewSubfolder(folderData: any, webview: vscode.Webview) {
	return `<!DOCTYPE html>
	<html lang="en">
		<head>
			<meta charset="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		</head>
		<body>
			<h1 class="subfolder-header"></h1>
            <div id="folders"></div>
            <button id="goToNote">Go to note</button>
            <button id="goToNewNote">Go to new note</button>
            <script>
            const vscode = acquireVsCodeApi();

            window.addEventListener('message', function (event) {
                const subfolderHeader = document.querySelector('.subfolder-header');
            
                if (event.data.command === 'updateFolderDetails') {
                    const fileData = event.data.data;
                    console.log(fileData);
                    subfolderHeader.innerHTML = fileData.subfolder.folderName;
                    /* const folderContents = event.data.data;
            
                    contentDiv.innerHTML = '<h2>Folder Contents</h2>';
         
                    Object.keys(folderContents).forEach(key => {
                        const folderDiv = document.createElement('div');
                        const value = folderContents[key];
                        folderDiv.innerHTML += '<p class="folder">' + folderContents[key].folderName + '</p>';

                        folderDiv.addEventListener('click', function () {
                            vscode.postMessage({
                                command: 'openFolder',
                                data: { value }
                            });
                        });

                        contentDiv.appendChild(folderDiv);
                    }); */
                } 
               /*  else if (event.data.command === 'updateFolderDetails') {
                    const folderData = event.data.data;

                    contentDiv.innerHTML = '<h2>Details for ' + folderData.data.files[0] + '</h2>';
                } */
            });

            document.querySelector("#goToNote").addEventListener("click", () => {
                vscode.postMessage({
                    page: "note",
                });
            });
            document.querySelector("#goToNewNote").addEventListener("click", () => {
                vscode.postMessage({
                    page: "newNote",
                });
            });
            </script>
		</body>
	</html>`;
}