import * as vscode from "vscode";

export function getWebviewNote(webview: vscode.Webview, context: any) {
	const onDiskPathStyles = vscode.Uri.joinPath(context.extensionUri, "src/components/note", "note.css");
	const styles = webview.asWebviewUri(onDiskPathStyles);
	const codiconsUri = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'node_modules', '@vscode/codicons', 'dist', 'codicon.css'));

	return `<!DOCTYPE html>
	<html lang="en">
		<head>
			<meta charset="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
			<script src="https://cdn.quilljs.com/1.3.6/quill.js"></script>
			<link rel="stylesheet" href="${styles}">
			<link rel="stylesheet" href="${codiconsUri}">
		</head>
		<body>
            <button class="codicon codicon-chevron-left">Go to overview</button>
			<div id="editor"></div>
            <script>
			let toolbarOptions = [
				[{ 'header': [1, 2, 3, false] }],
				['bold', 'italic', 'underline', 'strike'], 
				[{ 'list': 'ordered'}, { 'list': 'bullet' }],
				[{ 'indent': '-1'}, { 'indent': '+1' }],
				['blockquote', 'code-block'],
			];
			let options = {
				modules: {
					toolbar: toolbarOptions
				},
				placeholder: 'Enter your text here...',
				theme: 'snow'
			};
			let quill = new Quill('#editor', options);
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
