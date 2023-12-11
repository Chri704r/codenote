import * as vscode from "vscode";
export function isDarkTheme(): boolean {
	const activeColorTheme = vscode.window.activeColorTheme;

	if (activeColorTheme) {
		// Check the kind property to determine the theme type
		return activeColorTheme.kind === vscode.ColorThemeKind.Dark;
	}

	// Default to assuming it's a dark theme if information is not available
	return true;
}
