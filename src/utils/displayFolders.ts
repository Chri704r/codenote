import { renderSettingsDropdown } from "../components/dropdown/dropdown";
export async function displayFolders(folders: any) {
	return folders
		.map((folder: any) => {
			const dropdownHtml = renderSettingsDropdown(folder);
			return `
                <div class="item">
                    <div class="left folder-item" data-folder-name="${folder.folderName}" folder-path="${folder.uriPath}">
                        <div class="foldername-container">
                            <span class="codicon codicon-folder"></span>
                            <p class="folder-name">${folder.folderName}</p>
                        </div>
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
