import * as vscode from "vscode";

export function getWebviewOverview(webview: vscode.Webview, context: any) {
    const onDiskPathStyles = vscode.Uri.joinPath(context.extensionUri, "src/components/overview", "overview.css");
    const styles = webview.asWebviewUri(onDiskPathStyles);
    const onDiskPathTailwind = vscode.Uri.joinPath(context.extensionUri, "dist", "output.css");
    const tailwindStyles = webview.asWebviewUri(onDiskPathTailwind);
    return `<!DOCTYPE html>
	<html lang="en">
		<head>
			<meta charset="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <link rel="stylesheet" href="${styles}">
			<link href="${tailwindStyles}" rel="stylesheet">
		</head>
		<body>
			<div class="plain">
                <h1>Overview</h1>
                <button>View Subfolder</button>
			</div>
            <div id="notes-container" class="container"></div>
            <div id="folders-container" class="container"></div>
			<div id="add-container" class="container">
				<div class="plain">
					<div class="left">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
							<path
								d="M586-349h25.5v-79.5H691V-454h-79.5v-79.5H586v79.5h-79.5v25.5H586v79.5ZM194.28-217q-24.218 0-40.749-16.531Q137-250.062 137-274.363v-411.274q0-24.301 16.531-40.832Q170.062-743 194.5-743h187l77.5 77.5h306.72q24.218 0 40.749 16.531Q823-632.438 823-608v333.5q0 24.438-16.531 40.969Q789.938-217 765.72-217H194.28Zm.22-25.5h571q14 0 23-9t9-23V-608q0-14-9-23t-23-9H449l-77.5-77.5h-177q-14 0-23 9t-9 23v411q0 14 9 23t23 9Zm-32 0v-475 475Z" />
						</svg>
					</div>
					<div class="right">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
							<path
								d="M234-177q-23.969 0-40.734-16.766Q176.5-210.531 176.5-234.5V-726q0-23.969 16.766-40.734Q210.031-783.5 234-783.5h492q23.969 0 40.734 16.766Q783.5-749.969 783.5-726v228q-6.873-1.386-13.186-2.193Q764-501 758-503v-223q0-12-10-22t-22-10H234q-12 0-22 10t-10 22v491.5q0 12 10 22t22 10h224.963q1.037 7 1.889 13.043.853 6.043 3.148 12.457H234Zm-32-67v41.5V-758v255-3 262Zm106.5-77h159.027q1.973-6 4.473-12.25t5.5-13.25h-169v25.5Zm0-146.5H580q14.5-7.5 25.5-13t24-10.5v-2h-321v25.5Zm0-146.5h343v-25.5h-343v25.5ZM718.534-93.5Q658-93.5 616-135.466q-42-41.967-42-102.5 0-60.534 41.966-102.534 41.967-42 102.5-42Q779-382.5 821-340.534q42 41.967 42 102.5 0 60.534-41.966 102.534-41.967 42-102.5 42ZM705-125h27.5v-99.5H832v-27h-99.5V-351H705v99.5h-99.5v27H705v99.5Z" />
						</svg>
					</div>
				</div>
			</div>

            <script>
            const vscode = acquireVsCodeApi();

            document.addEventListener('DOMContentLoaded', function () {
                vscode.postMessage({ command: 'getFolderContents' });
            });

            window.addEventListener('message', function (event) {
                const foldersContainer = document.getElementById('folders-container');
                const notesContainer = document.getElementById('notes-container');
            
                if (event.data.command === 'updateFolderContents') {
                    const folderContents = event.data.data;

                    notesContainer.innerHTML = '<div class="plain"><h2>Notes</h2><div>';
                    foldersContainer.innerHTML = '<div class="plain"><h2>Folders</h2><div>';
         
                    Object.keys(folderContents).forEach(key => {
                        const folderItem = document.createElement('div');
                        folderItem.classList.add('item');
                        const folderValue = folderContents[key];

		                folderContents[key].files.forEach(file => {
                            const noteItem = document.createElement('div');
                            noteItem.classList.add('item');
                            // const noteValue = folderContents[key].file;

                            // console.log(folderContents[key].nameWithoutExtension); // DELETE
                            // console.log(folderContents[key].files); // DELETE
                            // console.log(folderContents[key].mtime); // DELETE

                            noteItem.innerHTML = \`
                                <div class="left">
                                <p class="folder-name">\${folderContents[key].files}</p>
                                    </div>
                                    <div class="right">
                                        <p class="mtime">\${folderContents[key].mtime}</p>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="#fff" height="24" viewBox="0 -960 960 960" width="24">
                                            <path
                                                d="M480.12-139q-34.055 0-57.881-23.803-23.826-23.804-23.826-57.784 0-34.078 23.804-57.952Q446.02-302.413 480-302.413q34.174 0 57.88 23.844 23.707 23.844 23.707 57.881 0 34.036-23.707 57.862Q514.174-139 480.12-139Zm0-259.413q-34.055 0-57.881-23.804Q398.413-446.02 398.413-480q0-34.174 23.804-57.88Q446.02-561.587 480-561.587q34.174 0 57.88 23.707 23.707 23.706 23.707 57.76 0 34.055-23.707 57.881-23.706 23.826-57.76 23.826Zm0-259.174q-34.055 0-57.881-23.894t-23.826-58q0-34.106 23.804-57.813Q446.02-821 480-821q34.174 0 57.88 23.706 23.707 23.707 23.707 57.813t-23.707 58q-23.706 23.894-57.76 23.894Z" />
                                        </svg>
                                    </div>
                                            \`;
                            notesContainer.appendChild(noteItem);
                        })

                        folderItem.innerHTML = \`
                        <div class="left">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="#fff" height="24" viewBox="0 -960 960 960" width="24">
                                <path
                                    d="M194.28-217q-24.218 0-40.749-16.531Q137-250.062 137-274.363v-411.274q0-24.301 16.531-40.832Q170.062-743 194.5-743h187l77.5 77.5h306.72q24.218 0 40.749 16.531Q823-632.438 823-608v333.5q0 24.438-16.531 40.969Q789.938-217 765.72-217H194.28Zm.22-25.5h571q14 0 23-9t9-23V-608q0-14-9-23t-23-9H449l-77.5-77.5h-177q-14 0-23 9t-9 23v411q0 14 9 23t23 9Zm-32 0v-475 475Z" />
                            </svg>
                            <p class="folder-name">\${folderContents[key].folderName}</p>
                        </div>
                        <div class="right">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="#fff" height="24" viewBox="0 -960 960 960" width="24">
                                <path
                                    d="M480.12-139q-34.055 0-57.881-23.803-23.826-23.804-23.826-57.784 0-34.078 23.804-57.952Q446.02-302.413 480-302.413q34.174 0 57.88 23.844 23.707 23.844 23.707 57.881 0 34.036-23.707 57.862Q514.174-139 480.12-139Zm0-259.413q-34.055 0-57.881-23.804Q398.413-446.02 398.413-480q0-34.174 23.804-57.88Q446.02-561.587 480-561.587q34.174 0 57.88 23.707 23.707 23.706 23.707 57.76 0 34.055-23.707 57.881-23.706 23.826-57.76 23.826Zm0-259.174q-34.055 0-57.881-23.894t-23.826-58q0-34.106 23.804-57.813Q446.02-821 480-821q34.174 0 57.88 23.706 23.707 23.707 23.707 57.813t-23.707 58q-23.706 23.894-57.76 23.894Z" />
                            </svg>
                        </div>
                            \`;
                            
                        folderItem.addEventListener('click', function () {
                            vscode.postMessage({
                                command: 'openFolder',
                                data: { folderValue }
                            });
                        });

                        foldersContainer.appendChild(folderItem);
                    });
                } else if (event.data.command === 'updateFolderDetails') {
                    const folderData = event.data.data;

                    foldersContainer.innerHTML = '<h2>Details for ' + folderData.data.files[0] + '</h2>';
                }
            });

            document.querySelector("button").addEventListener("click", () => {
                vscode.postMessage({
                    page: "subfolder",
                });
            });
            </script>
		</body>
	</html>`;
}