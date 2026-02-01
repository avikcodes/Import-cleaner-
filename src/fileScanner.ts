import * as fg from 'fast-glob';
import * as path from 'path';
import * as vscode from 'vscode';

export interface ScanOptions {
    include?: string[];
    exclude?: string[];
}

export async function scanWorkspaceFiles(options: ScanOptions = {}): Promise<string[]> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        return [];
    }

    const defaultPatterns = [
        '**/*.{js,jsx,ts,tsx}'
    ];

    const defaultExcludes = [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/.git/**'
    ];

    const patterns = options.include || defaultPatterns;
    const excludes = options.exclude || defaultExcludes;

    const allFiles: string[] = [];

    for (const folder of workspaceFolders) {
        const folderPath = folder.uri.fsPath;
        
        const entries = await fg.async(patterns, {
            cwd: folderPath,
            ignore: excludes,
            absolute: true,
            onlyFiles: true
        });

        allFiles.push(...entries);
    }

    return allFiles.sort();
}