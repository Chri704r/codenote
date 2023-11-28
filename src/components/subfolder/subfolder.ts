import * as vscode from "vscode";
export function getWebviewSubfolder(webview: vscode.Webview, context: any) {
	const onDiskPathStyles = vscode.Uri.joinPath(context.extensionUri, "src/components/overview", "overview.css");
	const styles = webview.asWebviewUri(onDiskPathStyles);
	const onDiskPathStylesfolder = vscode.Uri.joinPath(context.extensionUri, "src/components/subfolder", "subfolder.css");
	const subfolderstyles = webview.asWebviewUri(onDiskPathStylesfolder);
	const onDiskPathTailwind = vscode.Uri.joinPath(context.extensionUri, "dist", "output.css");
	return `<!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <link rel="stylesheet" href="${styles}" />
            <link rel="stylesheet" href="${subfolderstyles}" />
        </head>
        <body>
            <h1>Subfolder</h1>
            <h2>Folders</h2>
            <div class="folders-container">
                <div class="folder-item relative mb-3">
                    <div class="left cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="#fff" height="24" viewBox="0 -960 960 960" width="24">
                            <path
                                d="M194.28-217q-24.218 0-40.749-16.531Q137-250.062 137-274.363v-411.274q0-24.301 16.531-40.832Q170.062-743 194.5-743h187l77.5 77.5h306.72q24.218 0 40.749 16.531Q823-632.438 823-608v333.5q0 24.438-16.531 40.969Q789.938-217 765.72-217H194.28Zm.22-25.5h571q14 0 23-9t9-23V-608q0-14-9-23t-23-9H449l-77.5-77.5h-177q-14 0-23 9t-9 23v411q0 14 9 23t23 9Zm-32 0v-475 475Z"
                            />
                        </svg>
                        <p class="folder-name">All notes</p>
                    </div>
                    <div class="right">
                        <!-- <p class="mtime">3 hours ago</p> -->

                        <div class="settings-container z-10">
                            <svg class="ellipsis-icon cursor-pointer" xmlns="http://www.w3.org/2000/svg" fill="#fff" height="24" viewBox="0 -960 960 960" width="24">
                            <path
                                d="M480.12-139q-34.055 0-57.881-23.803-23.826-23.804-23.826-57.784 0-34.078 23.804-57.952Q446.02-302.413 480-302.413q34.174 0 57.88 23.844 23.707 23.844 23.707 57.881 0 34.036-23.707 57.862Q514.174-139 480.12-139Zm0-259.413q-34.055 0-57.881-23.804Q398.413-446.02 398.413-480q0-34.174 23.804-57.88Q446.02-561.587 480-561.587q34.174 0 57.88 23.707 23.707 23.706 23.707 57.76 0 34.055-23.707 57.881-23.706 23.826-57.76 23.826Zm0-259.174q-34.055 0-57.881-23.894t-23.826-58q0-34.106 23.804-57.813Q446.02-821 480-821q34.174 0 57.88 23.706 23.707 23.707 23.707 57.813t-23.707 58q-23.706 23.894-57.76 23.894Z"
                            />
                            </svg>

                            <div id="container" class="hidden">
	                            <ul>
    	                            <li class="move"><a>Move</a></li>
    	                            <li><a>Delete</a></li>
	                            </ul>
                            </div>

                        </div>

                    </div>
                    </div>
                </div>
            </div>
            
            <script>
                const vscode = acquireVsCodeApi();

                data = [
                    {
                        name: "subfolder 1",
                        subfolder: [
                            { name: "subfolder 1.1" },
                            { name: "subfolder 1.2" },
                        ],
                    },
                    {
                        name: "subfolder 2",
                        subfolder: [
                            { name: "subfolder 3", subfolder: [{ name: "subfolder 3.1" }, { name: "subfolder 3.2" }] },
                            { name: "subfolder 4", subfolder: [{ name: "subfolder 4.1" }, { name: "subfolder 4.2" }] },
                        ],
                    },
                ];

                function list(data = []) {
                    if (data.length > 0) {
                        const ul = document.createElement("ul");
                        data.forEach((folder) => {
                            const li = document.createElement("li");
                            const a = document.createElement("a");
                            a.textContent = folder.name;
                            li.appendChild(a);
                            listenForMouseOver(li, folder.subfolder);
                            ul.appendChild(li);
                        });
                        return ul;
                    }
                }

                function listenForMouseOver(option, subfolders) {
                    option.addEventListener(
                        "mouseover",
                        () => {
                            option.appendChild(list(subfolders));
                        },
                        { once: true }
                    );
                }

                document.querySelector(".move").addEventListener(
                    "mouseover",
                    (button) => {
                        button.target.parentElement.appendChild(list(data));
                    },
                    { once: true }
                );

                document.querySelectorAll(".settings-container").forEach((button) => {
                    button.addEventListener("click", () => {
                        document.querySelector("#container").classList.toggle("hidden");
                    });
                });
                document.querySelectorAll(".left").forEach((folder) => {
                    folder.addEventListener("click", (e) => {
                        console.log(e.target);
                        vscode.postMessage({
                            page: "note",
                        });
                    });
                });
           
            </script>
        </body>
    </html>
    `;
}
