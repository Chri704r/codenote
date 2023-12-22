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
                                <span class="codicon codicon-kebab-vertical"></span>
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