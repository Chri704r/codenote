import { renderSettingsDropdown } from "../components/dropdown/dropdown";
export async function displayNotes(files: any) {
    return files
        .map((file: any) => {
            const dropdownHtml = renderSettingsDropdown(file);
            return `
                        <div class="item">
                        <div class="left file-item" data-file-name="${file.fileName}" data-file-path="${file.uriPath}">
                            <p class="folder-name">${file.firstLine}</p>
                            <p class="mtime">${file.lastModified}</p>
                        </div>

                        <div class="right">
                            <div class="settings-container">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="#fff" height="24" viewBox="0 -960 960 960" width="24">
                                    <path
                                    d="M480.12-139q-34.055 0-57.881-23.803-23.826-23.804-23.826-57.784 0-34.078 23.804-57.952Q446.02-302.413 480-302.413q34.174 0 57.88 23.844 23.707 23.844 23.707 57.881 0 34.036-23.707 57.862Q514.174-139 480.12-139Zm0-259.413q-34.055 0-57.881-23.804Q398.413-446.02 398.413-480q0-34.174 23.804-57.88Q446.02-561.587 480-561.587q34.174 0 57.88 23.707 23.707 23.706 23.707 57.76 0 34.055-23.707 57.881-23.706 23.826-57.76 23.826Zm0-259.174q-34.055 0-57.881-23.894t-23.826-58q0-34.106 23.804-57.813Q446.02-821 480-821q34.174 0 57.88 23.706 23.707 23.707 23.707 57.813t-23.707 58q-23.706 23.894-57.76 23.894Z" />
                                </svg>
                                ${dropdownHtml}
                        </div>
                    </div>
                    <div id="delete-container" class="hidden">
                        <div id="delete-wrapper">
                            <div id="delete-modal">
                                <p>Are you sure you want to delete?</p>
                                <p>Once you click delete you will not be able to get it back.</p>
                                <div id="button-container">
                                    <button class="secondary-button">Cancel</button>
                                    <button id="delete-button-perm">
                                        <p>Delete</p>
                                        <span class="codicon codicon-trash"></span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                `;
        })
        .join("");
}