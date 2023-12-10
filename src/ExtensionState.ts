import * as path from 'path';
import * as fsp from 'fs/promises';
import * as vscode from "vscode";

class ExtensionState {
    private static instance: ExtensionState;
    private globalStorageUri: vscode.Uri | undefined;
    private folders: string[] = [];

    private constructor() {};

    public static getInstance(): ExtensionState {
        if (!ExtensionState.instance) {
            ExtensionState.instance = new ExtensionState();
        }
        
        return ExtensionState.instance;
    }

    public setGlobalStorageUri(globalStorageUri: vscode.Uri): void {
        this.globalStorageUri = globalStorageUri;
    }

    public getGlobalStorageUri(): vscode.Uri | undefined {
        return this.globalStorageUri;
    }

    public getFolders(): string[] {
        return this.folders;
    }

    public setFolders(folders: string[]): void {
        this.folders = folders;
        console.log(folders, "kakakaka");
    }

    public async loadState(): Promise<void> {
        if (this.globalStorageUri) {
            const stateFilePath = path.join(this.globalStorageUri.fsPath, 'extensionState.json');
            try {
                const content = await fsp.readFile(stateFilePath, 'utf-8');
                const data = JSON.parse(content);
                if (data.folders) {
                    this.folders = data.folders;
                }
            } catch (error) {
                // Handle errors during state loading
                console.error('Error loading extension state:', error);
            }
        }
    }

    private async saveState(): Promise<void> {
        if (this.globalStorageUri) {
            const stateFilePath = path.join(this.globalStorageUri.fsPath, 'extensionState.json');
            const data = { folders: this.folders };
            try {
                await fsp.writeFile(stateFilePath, JSON.stringify(data), 'utf-8');
            } catch (error) {
                // Handle errors during state saving
                console.error('Error saving extension state:', error);
            }
        }
    }

    public async getFolderContents(): Promise<any[]> {
        if (!this.globalStorageUri) {
            throw new Error('Global Storage URI is not set.');
        }
        
        return Promise.all(
            this.folders.map(async (folderName) => {
                const folderPath = path.join(this.globalStorageUri!.fsPath, folderName);
                const files = await fsp.readdir(folderPath);
                console.log("jaja", folderName, files);
                return { folderName, files };
            })
        );
    }
}

const extensionState = ExtensionState.getInstance();

export { extensionState };