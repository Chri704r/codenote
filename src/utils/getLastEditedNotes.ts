import * as vscode from "vscode";
const fsp = require("fs").promises;
const path = require('path');


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

export async function getNotes(folderName: string) {
    let folderContents: any = [];

    const folderItems = await fsp.readdir(folderName, { withFileTypes: true });

    for (const folderItem of folderItems) {

        const nameWithoutExtension = path.basename(folderItem.name, path.extname(folderItem.name));
        const filePath = path.join(folderName, folderItem.name);
        const stats = await fsp.stat(filePath);
        const mtime = stats.mtimeMs;
        const lastModified = timeAgo(mtime);


        if (folderItem.isDirectory()) {
            folderContents = folderContents.concat(
                await getNotes(filePath)
            );
        } else if (folderItem.isFile() && path.extname(folderItem.name) === '.json' && !folderItem.name.startsWith('.')) {
            folderContents.push({ folderItem, nameWithoutExtension, mtime, lastModified });
        }
    }

    console.log('All JSON Files:', folderContents);
    return folderContents.sort((b: Record<string, number>, a: Record<string, number>) => a.mtime - b.mtime).slice(0, 5);

}