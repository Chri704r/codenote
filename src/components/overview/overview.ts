import * as vscode from "vscode";
export function getWebviewOverview(webview: vscode.Webview, context: any) {
	const onDiskPathStyles = vscode.Uri.joinPath(context.extensionUri, "src/components/overview", "overview.css");
	const styles = webview.asWebviewUri(onDiskPathStyles);
	return `<!DOCTYPE html>
	<html lang="en">
		<head>
			<meta charset="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <link rel="stylesheet" href="${styles}">
		</head>
		<body>
			<h1>Overview</h1>
            <button>Go to subfolder</button>
            <script>
            const vscode = acquireVsCodeApi();
            document.querySelector("button").addEventListener("click", () => {
                vscode.postMessage({
                    page: "subfolder",
                });
            });
            </script>
		</body>
	</html>`;
}
