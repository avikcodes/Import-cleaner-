import * as vscode from 'vscode';
import { scanWorkspaceFiles } from './fileScanner';
import { analyzeUnusedImports, UnusedImport } from './unusedImportAnalyzer';
import { applyUnusedImportEdits } from './applyEdits';
import { logger } from './logger';

/**
 * Main orchestration function for the "Tidy Imports" command.
 * Scans the workspace, analyzes files for unused imports, and applies edits.
 */
export async function cleanUnusedImports(): Promise<void> {
    logger.show();
    logger.info('Starting "Clean Unused Imports" command');
    try {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Tidy Imports: Analyzing workspace...",
            cancellable: false
        }, async (progress) => {
            // 1. Scan for files
            progress.report({ message: "Scanning files..." });
            const files = await scanWorkspaceFiles();
            logger.info(`Scanned ${files.length} file(s) in workspace`);

            if (files.length === 0) {
                logger.warn('No relevant files found in workspace');
                return;
            }

            const editsByFile = new Map<string, UnusedImport[]>();
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
                    const unused = analyzeUnusedImports(content, filePath);

                    if (unused.length > 0) {
                        editsByFile.set(filePath, unused);
                    }
                } catch (err) {
                    console.error(`Failed to analyze file ${filePath}:`, err);
                    // Continue with other files even if one fails
                }
            }

            // 3. Apply edits (this function handles user confirmation)
            await applyUnusedImportEdits(editsByFile);
        });
        logger.info('Completed "Clean Unused Imports" operation');
    } catch (error: any) {
        logger.error('Unexpected error in cleanUnusedImports', error);
        vscode.window.showErrorMessage(`Tidy Imports failed: ${error.message}`);
    }
}
