
import * as vscode from "vscode";

const isDark = vscode.window.activeColorTheme?.kind === vscode.ColorThemeKind.Dark;

export function getSyntaxTheme() {
	if (isDark === true) {
		return "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/styles/github-dark.min.css";
	}
	else {
		return "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/styles/github.min.css";
	}
}