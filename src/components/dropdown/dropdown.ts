interface Folder {
    folderName: string;
    uriPath: string;
}

interface File {
    fileName: string;
    uriPath: string;
}

type FolderOrFile = Folder | File; 

export function renderSettingsDropdown(folderOrFile: FolderOrFile) {
    const isFolder = 'folderName' in folderOrFile;
    return `
            <div class="dropdown hidden">
                <ul>
                    <li class="move" value="${folderOrFile.uriPath}" name="${isFolder ? (folderOrFile as Folder).folderName : (folderOrFile as File).fileName}"><a>
                        <p>Move</p>
                        <span class="codicon codicon-chevron-right"></span>
                    </a></li>
                    <li class="rename" value="${folderOrFile.uriPath}" name="${isFolder ? (folderOrFile as Folder).folderName : (folderOrFile as File).fileName}"><a>
                        <p>Rename</p>
                        <span class="codicon codicon-case-sensitive"></span>
                    </a></li>
                    <li><a class="delete-button" data-${isFolder ? 'folder' : 'file'}-name="${isFolder ? (folderOrFile as Folder).folderName : (folderOrFile as File).fileName}" data-${isFolder ? 'folder' : 'file'}-path="${folderOrFile.uriPath}">
                        <p>Delete</p>
                        <span class="codicon codicon-trash"></span>
                    </a></li>
                </ul>
            </div>`;
}
