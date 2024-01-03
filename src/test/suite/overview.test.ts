/* import * as assert from 'assert';
import * as vscode from 'vscode';
import { getWebviewOverview } from '../../components/overview/overview';

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests');

    const context = {
        extensionUri: vscode.Uri.file('/bachelor/entry-notes-app/codenote'),
        globalStorageUri: vscode.Uri.file('/AppData/Roaming/Code/User/globalStorage/entry.entry')
    };

    const folders = [
        {
            folderName: "Notes",
            uriPath: "/C:/Users/aisas/AppData/Roaming/Code/User/globalStorage/entry.entry"
        }
    ];

    const files = [
        {
            dateCreated: "23.11.2023",
            fileName: "Getting started with Entry",
            firstLine: "Welcome to Entry",
            folderItem: {
                name: "Getting started with Entry.json"
            },
            lastModified: "2 days ago",
            mtime: 1703342335296.4587,
            uriPath: "/C:/Users/aisas/AppData/Roaming/Code/User/globalStorage/entry.entry"
        }
    ];

    test('getWebviewOverview returns non-empty string', async () => {
        const webview = {
            asWebviewUri: (uri: vscode.Uri) => uri,
        } as vscode.Webview;

        const result = await getWebviewOverview(webview, context, folders, files);

        assert.strictEqual(typeof result, 'string');
        assert.notStrictEqual(result.length, 0);
    });

    test('Generated HTML contains folders and files', async () => {
        const webview = {
            asWebviewUri: (uri: vscode.Uri) => uri,
        } as vscode.Webview;

        const result = await getWebviewOverview(webview, context, folders, files);

        assert.ok(result.includes('<div class="left folder-item"'), 'Expected folder element');
        assert.ok(result.includes('<div class="left file-item"'), 'Expected file element');
    });

    test('Array has correct length', async () => {
        assert.strictEqual(folders.length, 1, 'Expected one folder');
        assert.strictEqual(files.length, 1, 'Expected one file');
    });

    test('Array has correct keys', async () => {
        const folderKeys = Object.keys(folders[0]);
        const fileKeys = Object.keys(files[0]);

        assert.deepStrictEqual(folderKeys, ['folderName', 'uriPath'], 'Folder keys are as expected');
        assert.deepStrictEqual(fileKeys, ['dateCreated', 'fileName', 'firstLine', 'folderItem', 'lastModified', 'mtime', 'uriPath'], 'File keys are as expected');
    });
}); */