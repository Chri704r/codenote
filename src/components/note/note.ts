import * as vscode from "vscode";
export function getWebviewNote(webview: vscode.Webview, context: any) {
	return `<!DOCTYPE html>
	<html lang="en">
		<head>
			<meta charset="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
		</head>
		<body>
			<h1>Note</h1>
            <button>Go to overview</button>
			<div id="editor">
				<p>Hello World!</p>
				<p>Some initial <strong>bold</strong> text</p>
				<p><br></p>
			</div>
			<script src="https://cdn.quilljs.com/1.3.6/quill.js"></script>
            <script>
			var quill = new Quill('#editor', {
				theme: 'snow'
			});
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
