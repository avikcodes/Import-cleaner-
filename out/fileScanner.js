"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanWorkspaceFiles = void 0;
const fg = require("fast-glob");
const vscode = require("vscode");
async function scanWorkspaceFiles(options = {}) {
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
    const allFiles = [];
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
exports.scanWorkspaceFiles = scanWorkspaceFiles;
//# sourceMappingURL=fileScanner.js.map