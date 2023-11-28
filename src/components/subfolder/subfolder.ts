import * as vscode from "vscode";
export function getWebviewSubfolder(webview: vscode.Webview, context: any) {
	return `<!DOCTYPE html>
	<html lang="en">
		<head>
			<meta charset="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		</head>
		<body>
			<h1>Subfolder</h1>
            <button id="goToNote">Go to note</button>
            <button id="goToNewNote">Go to new note</button>
            <button id="createFolderAndFile">Create folder and file</button>
            <script>
            const vscode = acquireVsCodeApi();
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
            document.querySelector("#createFolderAndFile").addEventListener("click", () => {
                vscode.postMessage({
                    page: "createFolderAndFile",
                });
            });

            window.addEventListener('message', (event) => {
                const message = event.data;
    
                // Perform actions based on the received message
                if (message.command === 'createFolderAndFile') {
                    console.log(message.filePath);  // Display a message or perform other actions
                }
            });
            </script>
		</body>
	</html>`;
}
