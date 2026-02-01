import * as vscode from 'vscode';
import { cleanUnusedImports } from './cleanImports';

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension "tidy-imports" is now active!');

    let disposable = vscode.commands.registerCommand('tidyImports.clean', () => {
        cleanUnusedImports();
    });

    context.subscriptions.push(disposable);
}

export function deactivate() { }