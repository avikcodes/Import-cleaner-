"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyUnusedImportEdits = void 0;
const vscode = require("vscode");
const ts = require("typescript");
const logger_1 = require("./logger");
/**
 * Groups unused imports by file and applies normalized deletions via WorkspaceEdit after user confirmation.
 * This implementation robustly handles default, namespace, and named imports, ensuring
 * that syntax remains valid and 'type' modifiers are preserved.
 * @param editsByFile A Map where keys are file URIs (as strings) and values are arrays of UnusedImport.
 */
async function applyUnusedImportEdits(editsByFile) {
    if (editsByFile.size === 0) {
        vscode.window.showInformationMessage('No unused imports found.');
        return;
    }
    let totalImportsCount = 0;
    editsByFile.forEach(imports => totalImportsCount += imports.length);
    logger_1.logger.info(`Detected ${totalImportsCount} unused items across ${editsByFile.size} file(s)`);
    const selection = await vscode.window.showInformationMessage(`Tidy Imports: Found ${totalImportsCount} unused item(s) across ${editsByFile.size} file(s). Clean them now?`, 'Clean', 'Cancel');
    if (selection !== 'Clean') {
        logger_1.logger.info('User cancelled removal operation');
        return;
    }
    logger_1.logger.info('User confirmed cleanup. Normalizing and applying edits...');
    const workspaceEdit = new vscode.WorkspaceEdit();
    for (const [fileUriStr, unusedItems] of editsByFile) {
        const fileUri = vscode.Uri.file(fileUriStr);
        let document;
        try {
            document = await vscode.workspace.openTextDocument(fileUri);
        }
        catch (err) {
            logger_1.logger.error(`Could not open document ${fileUriStr}`, err);
            continue;
        }
        const content = document.getText();
        const sourceFile = ts.createSourceFile(fileUriStr, content, ts.ScriptTarget.Latest, true);
        // Filter for import declarations
        const importDeclarations = sourceFile.statements.filter(ts.isImportDeclaration);
        for (const declaration of importDeclarations) {
            const declarationStart = declaration.getStart();
            const declarationEnd = declaration.getEnd();
            // Find unused items that fall within the range of this declaration
            const unusedForThisDecl = unusedItems.filter(item => {
                const itemStart = sourceFile.getPositionOfLineAndCharacter(item.line - 1, item.character - 1);
                const itemEnd = sourceFile.getPositionOfLineAndCharacter(item.endLine - 1, item.endCharacter - 1);
                return itemStart >= declarationStart && itemEnd <= declarationEnd;
            });
            if (unusedForThisDecl.length === 0)
                continue;
            const importClause = declaration.importClause;
            if (!importClause) {
                // Side-effect import - rule A: always keep.
                continue;
            }
            // Create a set of range spans that are marked unused
            const unusedRanges = unusedForThisDecl.map(item => ({
                start: sourceFile.getPositionOfLineAndCharacter(item.line - 1, item.character - 1),
                end: sourceFile.getPositionOfLineAndCharacter(item.endLine - 1, item.endCharacter - 1)
            }));
            // Helper to check if a node's range is covered by any unused range
            const isUnused = (node) => {
                const nodeStart = node.getStart();
                const nodeEnd = node.getEnd();
                return unusedRanges.some(range => range.start <= nodeStart && range.end >= nodeEnd);
            };
            // Analyze components of the import clause
            let defaultName = importClause.name && !isUnused(importClause.name) ? importClause.name.text : undefined;
            let namespaceBinding;
            if (importClause.namedBindings && ts.isNamespaceImport(importClause.namedBindings)) {
                if (!isUnused(importClause.namedBindings)) {
                    namespaceBinding = importClause.namedBindings.name.text;
                }
            }
            let namedImports = [];
            if (importClause.namedBindings && ts.isNamedImports(importClause.namedBindings)) {
                namedImports = importClause.namedBindings.elements
                    .filter(e => !isUnused(e))
                    .map(e => ({
                    name: e.name.text,
                    propertyName: e.propertyName?.text
                }));
            }
            const isTypeOnly = !!importClause.isTypeOnly; // Rule F preservation
            const moduleSpecifier = declaration.moduleSpecifier.getText();
            // Decisions based on what's left
            if (!defaultName && !namespaceBinding && namedImports.length === 0) {
                // All specifiers removed -> delete entire declaration (Rule B, C, D, E all-unused case)
                workspaceEdit.delete(fileUri, getFullDeclarationRange(document, declaration));
            }
            else {
                // Reconstruct with valid syntax
                let newImportStr = isTypeOnly ? 'import type ' : 'import ';
                if (namespaceBinding) {
                    newImportStr += `* as ${namespaceBinding}`;
                }
                else {
                    if (defaultName) {
                        newImportStr += defaultName;
                        if (namedImports.length > 0)
                            newImportStr += ', ';
                    }
                    if (namedImports.length > 0) {
                        newImportStr += '{ ' + namedImports.map(ni => ni.propertyName ? `${ni.propertyName} as ${ni.name}` : ni.name).join(', ') + ' }';
                    }
                }
                newImportStr += ` from ${moduleSpecifier};`;
                // Replace the exact range of the declaration (excluding trivia before start)
                const range = new vscode.Range(document.positionAt(declaration.getStart()), document.positionAt(declaration.getEnd()));
                workspaceEdit.replace(fileUri, range, newImportStr);
            }
        }
    }
    const success = await vscode.workspace.applyEdit(workspaceEdit);
    if (success) {
        logger_1.logger.info(`Successfully processed and normalized unused imports`);
        vscode.window.showInformationMessage(`Successfully removed unused import(s).`);
    }
    else {
        logger_1.logger.error('Failed to apply normalized workspace edits');
        vscode.window.showErrorMessage('Failed to apply edits. Please check if files are read-only or modified.');
    }
}
exports.applyUnusedImportEdits = applyUnusedImportEdits;
/**
 * Gets the range for the entire declaration including leading whitespace/trivia and trailing semicolon.
 */
function getFullDeclarationRange(document, node) {
    const startPos = document.positionAt(node.getFullStart());
    const endPos = document.positionAt(node.getEnd());
    let endLine = endPos.line;
    let endChar = endPos.character;
    const lineText = document.lineAt(endLine).text;
    // Check if there's a semicolon right after the node end
    if (endChar < lineText.length && lineText[endChar] === ';') {
        endChar++;
    }
    return new vscode.Range(startPos, new vscode.Position(endLine, endChar));
}
//# sourceMappingURL=applyEdits.js.map