export function renderSettingsDropdown(folder: any) {
	return `
            <div class="dropdown hidden">
                <ul>
                    <li class="move" value="${folder.uriPath}" name="${folder.folderName}"><a>
                        <p>Move</p>
                        <span class="codicon codicon-chevron-right"></span>
                    </a></li>
                    <li><a class="delete-button">
                        <p>Delete</p>
                        <span class="codicon codicon-trash"></span>
                    </a></li>
                </ul>
            </div>`;
}
