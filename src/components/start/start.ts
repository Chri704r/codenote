import * as vscode from 'vscode';



export function getWebviewContent(webview: vscode.Webview, context: any) {
    const myStyle = webview.asWebviewUri(
        vscode.Uri.joinPath(
            context.extensionUri, 'src/style', 'fonts.css'
        )
    );

	return `<!DOCTYPE html>
  <html lang="en">
  <head>
	  <meta charset="UTF-8">
	  <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="${myStyle}" rel="stylesheet" />
  </head>
  <body>
	<h1 class="title">Codenote</h1>
    <button>opret note</button>
  </body>
  </html>`;
}