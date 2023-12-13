import * as vscode from "vscode";
export function getWebviewNewNote(webview: vscode.Webview, context: any) {
	return `<!DOCTYPE html>
	<html lang="en">
		<head>
			<meta charset="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		</head>
		<body>
			<h1>New note</h1>
            <button>Go to overview</button>
            <script>
            const vscode = acquireVsCodeApi();
            document.querySelector("button").addEventListener("click", () => {
                vscode.postMessage({
                    page: "overview",
                });
            });
            </script>
		</body>
	</html>`;
}
