import * as vscode from "vscode";
import { loadFile } from "../../utils/saveFile";
import { header } from "../../utils/header";

export async function getWebviewNote(
	webview: vscode.Webview,
	context: vscode.ExtensionContext,
	fileName: string,
	filePath: string,
	currentPage?: string
) {
	const script = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "out/utils", "script.js"));

	const isDark = vscode.window.activeColorTheme?.kind === vscode.ColorThemeKind.Dark;

	const loadedContent = await loadFile(filePath);

	const htmlHeader = await header(webview, context);

	return `<!DOCTYPE html>
	<html lang="en">
		${htmlHeader}

		<body>
			<div class="toolbar-container">
			<div class="back-button">
				<span class="codicon codicon-chevron-left"></span>
			</div>				
				<div class="toolbar">
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

			document.addEventListener('keydown', (e) => {
				if((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
					e.preventDefault();

					const uri = ${JSON.stringify(filePath)};
					const replaceBackslash = uri.replace(/[\/\\\\]/g, "/");
					const lastSlashIndex = Math.max(replaceBackslash.lastIndexOf("/"));
					const parentUri = replaceBackslash.substr(0, lastSlashIndex);
					const parentFolder = parentUri.substr(parentUri.lastIndexOf("/") + 1);
					const currentPage = ${JSON.stringify(currentPage)};
					const fileContent = quill.getContents();
					const fileName = ${JSON.stringify(fileName)};
					const filePath = ${JSON.stringify(filePath)};


					if (parentFolder == 'entry.entry' || currentPage == 'overview'){			
						vscode.postMessage({
							command: 'saveOnKey',
							data: { fileName, fileContent },
							fileName: fileName,
							filePath: filePath,
						});
					} else {
						vscode.postMessage({
							command: 'saveOnKey',
							data: { fileName, fileContent },
							fileName: fileName,
							filePath: filePath,
						});
					}
				}
			})

			document.querySelector(".back-button").addEventListener("click", () => {
				const uri = ${JSON.stringify(filePath)};
                const replaceBackslash = uri.replace(/[\/\\\\]/g, "/");
                const lastSlashIndex = Math.max(replaceBackslash.lastIndexOf("/"));
                const parentUri = replaceBackslash.substr(0, lastSlashIndex);
                const parentFolder = parentUri.substr(parentUri.lastIndexOf("/") + 1);
				const currentPage = ${JSON.stringify(currentPage)};
				const fileContent = quill.getContents();
				const fileName = ${JSON.stringify(fileName)};
				const filePath = ${JSON.stringify(filePath)};


                if (parentFolder == 'entry.entry' || currentPage == 'overview'){			
					vscode.postMessage({
						command: 'save',
						data: { fileName, fileContent },
						fileName: fileName,
						filePath: filePath,
						destinationFolderName: parentFolder,
						destinationFolderUri: parentUri,
						webviewToRender: 'overview'
					});
                } else {
                    vscode.postMessage({
						command: 'save',
						data: { fileName, fileContent },
						fileName: fileName,
						filePath: filePath,
						destinationFolderName: parentFolder,
						destinationFolderUri: parentUri,
						webviewToRender: 'subfolder'
                    });
                }
            });

			const loadedContent = ${JSON.stringify(loadedContent)};
			if (loadedContent !== null) {
				quill.setContents(loadedContent);
			}
            </script>
			<script src="${script}"></script>
			<script>
				updateTheme(${isDark});
			</script>
		</body>
	</html>`;
}
