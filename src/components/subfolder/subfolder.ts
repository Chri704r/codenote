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
            </script>
		</body>
	</html>`;
}
