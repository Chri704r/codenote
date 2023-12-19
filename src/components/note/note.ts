import * as vscode from "vscode";
import { loadFile } from "../../utils/saveFile";

export async function getWebviewNote(webview: vscode.Webview, context: any, fileName: string) {
	const onDiskPathStyles = vscode.Uri.joinPath(context.extensionUri, "src/components/note", "note.css");
	const styles = webview.asWebviewUri(onDiskPathStyles);
	const codiconsUri = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'node_modules', '@vscode/codicons', 'dist', 'codicon.css'));
	const onDiskPathTailwind = vscode.Uri.joinPath(context.extensionUri, "dist", "output.css");
	const tailwindStyles = webview.asWebviewUri(onDiskPathTailwind);

	const loadedContent = await loadFile(fileName, context);

	return `<!DOCTYPE html>
	<html lang="en">
		<head>
			<meta charset="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<script href="highlight.js"></script>
			<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css">
			<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
			<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/go.min.js"></script>
			<link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
			<script src="https://cdn.quilljs.com/1.3.6/quill.js"></script>
			<link rel="stylesheet" href="${styles}">
			<link rel="stylesheet" href="${codiconsUri}">
			<link href="${tailwindStyles}" rel="stylesheet">
		</head>
		<body>
			<div class="flex items-center">
				<div class="codicon codicon-chevron-left cursor-pointer"></div>
				<div class="mx-auto">
					<div id="toolbar">
						<select class="ql-size">
							<option value="small"></option>
							<option selected></option>
							<option value="large"></option>
							<option value="huge"></option>
						</select>
						<button class="ql-bold"></button>
						<button class="ql-italic"></button>
						<button class="ql-underline"></button>
						<button class="ql-strike"></button>
						<button class="ql-blockquote"></button>
						<button class="ql-code-block"></button>
						<button class="ql-list" value="ordered"></button>
						<button class="ql-list" value="bullet"></button>
						<button class="ql-indent" value="-1"></button>
						<button class="ql-indent" value="+1"></button>
						<button class="ql-link"></button>
						<button class="ql-image"></button>
					</div>
				</div>
				<button class="save-file">Save</button>
			</div>
			<div id="editor"></div>
            <script>
			let options = {
				modules: {
					syntax: true,
					toolbar: '#toolbar'
				},
				placeholder: 'Enter your text here...',
				theme: 'snow'
			};
			let quill = new Quill('#editor', options);
            const vscode = acquireVsCodeApi();
            document.querySelector(".codicon-chevron-left").addEventListener("click", () => {
                vscode.postMessage({
                    page: "overview",
                });
            });

			document.querySelector(".save-file").addEventListener("click", function () {
				const fileContent = quill.getContents();
				const fileName = "${fileName}";

				vscode.postMessage({
					command: 'save',
					data: { fileName, fileContent }
				})
			});	

			const loadedContent = ${JSON.stringify(loadedContent)};
			if (loadedContent !== null) {
				quill.setContents(loadedContent);
			}

			

/* 			function detectLanguage(code) {
				let result = hljs.highlightAuto(code);
				return result.language || 'plaintext';
			}; */
            </script>
		</body>
	</html>`;
}
