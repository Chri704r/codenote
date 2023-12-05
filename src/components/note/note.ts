import * as vscode from "vscode";

export function getWebviewNote(webview: vscode.Webview, context: any) {
	const onDiskPathStyles = vscode.Uri.joinPath(context.extensionUri, "src/components/note", "note.css");
	const styles = webview.asWebviewUri(onDiskPathStyles);
	const codiconsUri = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'node_modules', '@vscode/codicons', 'dist', 'codicon.css'));
	const onDiskPathTailwind = vscode.Uri.joinPath(context.extensionUri, "dist", "output.css");
	const tailwindStyles = webview.asWebviewUri(onDiskPathTailwind);

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

			//let Embed = Quill.import("blots/embed");
			//let BlockEmbed = Quill.import('blots/block/embed')
		/* 	class CodeLanguage extends BlockEmbed {
				static create(language) {
					let node = super.create();

					node.setAttribute('data-language', language);
					node.innerHTML = language;
					return node;
				}

				static value(node) {
					return node.getAttribute('data-language');
				}
			} */

			//CodeLanguage.blotName = "language-label";
			//CodeLanguage.className = "language-label";
			//CodeLanguage.tagName = "div";

			//Quill.register(CodeLanguage);

			//let processingCodeBlock = false;

/* 			quill.on('editor-change', function (eventName, delta, oldDelta, source) {
				if (source === 'user' && !processingCodeBlock) {
					processingCodeBlock = true;

					let format = quill.getFormat();
					if (format && format['code-block']) {
						quill.scroll.lines().forEach(function (line, index) {
							if (line.domNode.nodeName === 'PRE') {
								let code = quill.getText();
								let language = detectLanguage(code);

								quill.insertEmbed(index + 1, 'string', language);
							}
						});
						
						processingCodeBlock = false;
					}
				}
				let selection = quill.getSelection();
				if (selection && quill.getText(selection.index, 2)) {
					let format = quill.getFormat();
					if (format && format['code-block']) {
						let code = quill.getText();
						let language = detectLanguage(code);

						quill.insertEmbed(selection.index, 'language-label', language, 'user');
						quill.setSelection(selection.index + 2);
					}
				}
			}); */

			/* Quill.register({
				"formats/language-label": CodeLanguage
			}); */

			/* let index = quill.getSelection(true).index;
			let cObj = {text : 'Test', value : 'value'};
			quill.insertEmbed(0,"language-label",cObj) */

			

		/* 	quill.on('text-change', function() {
				console.log("HEHEHEH");
				let format = quill.getFormat();
				if (format && format['code-block']) {
					let selection = quill.getSelection();
					let code = quill.getText();
					let language = detectLanguage(code);
					console.log(language);
				}
			}); */

			quill.on('text-change', function() {
				let format = quill.getFormat();
				if (format && format['code-block']) {
 					let blocks = document.querySelectorAll('pre');
					
					blocks.forEach(function (block) {
						let code = block.textContent;
						let language = detectLanguage(code);

						//let codeBlockContainer = document.createElement('div');
						//codeBlockContainer.className = 'code-block-container';

						let languageLabel = document.createElement('div');
						languageLabel.className = 'language-label';
    					languageLabel.textContent = language;

						//codeBlockContainer.appendChild(block);

						//codeBlockContainer.appendChild(languageLabel);

						//document.getElementById('editor').appendChild(languageLabel);
						quill.setSelection(quill.getLength(), 0);
                		quill.insertEmbed(quill.getSelection().index, 'language-label', language, 'user');
					});
				}
			});

			function detectLanguage(code) {
				let result = hljs.highlightAuto(code);
				return result.language || 'plaintext';
			};
            </script>
		</body>
	</html>`;
}
