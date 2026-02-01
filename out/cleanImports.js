"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanUnusedImports = void 0;
const vscode = require("vscode");
const fileScanner_1 = require("./fileScanner");
const unusedImportAnalyzer_1 = require("./unusedImportAnalyzer");
const applyEdits_1 = require("./applyEdits");
const logger_1 = require("./logger");
/**
 * Main orchestration function for the "Tidy Imports" command.
 * Scans the workspace, analyzes files for unused imports, and applies edits.
 */
async function cleanUnusedImports() {
    logger_1.logger.show();
    logger_1.logger.info('Starting "Clean Unused Imports" command');
    try {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Tidy Imports: Analyzing workspace...",
            cancellable: false
        }, async (progress) => {
            // 1. Scan for files
            progress.report({ message: "Scanning files..." });
            const files = await (0, fileScanner_1.scanWorkspaceFiles)();
            logger_1.logger.info(`Scanned ${files.length} file(s) in workspace`);
            if (files.length === 0) {
                logger_1.logger.warn('No relevant files found in workspace');
                return;
            }
            const editsByFile = new Map();
            const totalFiles = files.length;
            // 2. Analyze each file
            for (let i = 0; i < totalFiles; i++) {
                const filePath = files[i];
                progress.report({
                    message: `Analyzing ${i + 1}/${totalFiles}: ${vscode.workspace.asRelativePath(filePath)}`,
                    increment: (1 / totalFiles) * 100
                });
                try {
                    const document = await vscode.workspace.openTextDocument(filePath);
                    const content = document.getText();
                    const unused = (0, unusedImportAnalyzer_1.analyzeUnusedImports)(content, filePath);
                    if (unused.length > 0) {
                        editsByFile.set(filePath, unused);
                    }
                }
                catch (err) {
                    console.error(`Failed to analyze file ${filePath}:`, err);
                    // Continue with other files even if one fails
                }
            }
            // 3. Apply edits (this function handles user confirmation)
            await (0, applyEdits_1.applyUnusedImportEdits)(editsByFile);
        });
        logger_1.logger.info('Completed "Clean Unused Imports" operation');
    }
    catch (error) {
        logger_1.logger.error('Unexpected error in cleanUnusedImports', error);
        vscode.window.showErrorMessage(`Tidy Imports failed: ${error.message}`);
    }
}
exports.cleanUnusedImports = cleanUnusedImports;
//# sourceMappingURL=cleanImports.js.map