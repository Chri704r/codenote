import * as vscode from "vscode";
import { getFolderContents } from "./initialize";
import { getWebviewOverview } from "../components/overview/overview";
import { getWebviewSubfolder } from "../components/subfolder/subfolder";
import { getNotes } from './getLastEditedNotes';

export async function updateWebview(destinationFolderName: string, destinationFolderUri: string, webviewToRender: string, panel: vscode.Webview, context: vscode.ExtensionContext): Promise<string> {
	const updatedFolder = { folderName: destinationFolderName, uriPath: destinationFolderUri };
	const updatedFolders = await getFolderContents(context);
	const lastEditedNotes = await getNotes(context.globalStorageUri.fsPath);

	if (webviewToRender === 'subfolder') {
		return await getWebviewSubfolder(updatedFolder, panel, context);
	} else if (webviewToRender === 'overview') {
		return await getWebviewOverview(panel, context, updatedFolders, lastEditedNotes);
	} else {
		return 'There was an error rendering the webview.';
	}
}