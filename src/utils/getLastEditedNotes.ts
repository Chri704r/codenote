import * as path from "path";
import * as vscode from "vscode";
const fsp = require("fs").promises;


function timeAgo(mtime: EpochTimeStamp) {
    const currentDate = new Date();
    const pastDate = new Date(mtime);

    const timeDifference = currentDate.getTime() - pastDate.getTime();
    const minutes = Math.floor(timeDifference / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);

    if (months > 0) {
        return `${months} month${months > 1 ? 's' : ''} ago`;
    } else if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
        return `Less than a minute`;
    }
}


export async function getFiles(context: vscode.ExtensionContext) {
    try {
        const globalStorageUri = context.globalStorageUri;
        const files = await fsp.readdir(globalStorageUri.fsPath, { withFileTypes: true });
        const allFiles = [];

        for (const file of files) {
            if (file.isFile() && path.extname(file.name) === '.json') {
                const nameWithoutExtension = path.basename(file.name, path.extname(file.name));
                const filePath = path.join(globalStorageUri.fsPath, file.name);
                const stats = await fsp.stat(filePath);
                const mtime = stats.mtimeMs;
                const lastModified = timeAgo(mtime);
                allFiles.push({ file, nameWithoutExtension, mtime, lastModified });

                const lastEditedNotes = allFiles.sort((b, a) => a.mtime - b.mtime);
                console.log('Last:', lastEditedNotes);
            }
        }

        return allFiles.slice(0,5);

    } catch (error: any) {
        console.error(`Error reading global storage directory ${error.message}`);
        return [];
    }
}