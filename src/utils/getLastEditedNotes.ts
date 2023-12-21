const fsp = require("fs").promises;
const path = require('path');

export function timeAgo(mtime: EpochTimeStamp) {
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

export async function readFirstLine(filePath: string): Promise<string> {
    try {
        const fileContent = await fsp.readFile(filePath, 'utf-8');
        const deltaContent = JSON.parse(fileContent);

        // Check if the Delta contains any operations
        if (Array.isArray(deltaContent.ops) && deltaContent.ops.length > 0) {
            // Extract the first operation (assuming it's a text operation)
            const firstOperation = deltaContent.ops[0];

            if (typeof firstOperation.insert === 'string' && firstOperation.insert.match(/^[0-9A-z!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)) {
                // Extract the first line of text
                const firstLine = firstOperation.insert.split('\n')[0];
                return firstLine;
            }
        }

        return 'This note is empty.';
    } catch (error: any) {
        return `Error reading file: ${error.message}`;
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
        const date = new Date(mtime);
        const dateCreated = date.getDate() + "." + date.getMonth() + "." + date.getFullYear();
        const lastModified = timeAgo(mtime);
        const firstLine = await readFirstLine(filePath);

        if (folderItem.isDirectory()) {
            folderContents = folderContents.concat(
                await getNotes(filePath)
            );
        } else if (folderItem.isFile() && path.extname(folderItem.name) === '.json' && !folderItem.name.startsWith('.')) {
            folderContents.push({
                fileName: folderItem.name,
                uriPath: filePath,
                nameWithoutExtension: nameWithoutExtension,
                mtime: mtime,
                firstLine: firstLine,
                lastModified: lastModified,
                date: dateCreated });
        }
    }

    // console.log('All JSON Files:', folderContents);
    return folderContents.sort((b: Record<string, number>, a: Record<string, number>) => a.mtime - b.mtime).slice(0, 5);

}