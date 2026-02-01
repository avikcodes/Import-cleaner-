import * as ts from 'typescript';
import { logger } from './logger';

export interface UnusedImport {
    name: string;
    line: number;
    character: number;
    endLine: number;
    endCharacter: number;
}

/**
 * Analyzes a TypeScript/JavaScript file to find unused imports.
 * @param fileContent The content of the file.
 * @param filePath The path to the file.
 * @returns A list of unused imports with their locations.
 */
export function analyzeUnusedImports(fileContent: string, filePath: string): UnusedImport[] {
    logger.info(`Analyzing file: ${filePath}`);
    const sourceFile = ts.createSourceFile(
        filePath,
        fileContent,
        ts.ScriptTarget.Latest,
        true
    );

    const unusedImports: UnusedImport[] = [];
    const importedIdentifiers = new Map<string, ts.ImportSpecifier | ts.ImportClause | ts.NamespaceImport | ts.ImportSpecifier>();
    const usedIdentifiers = new Set<string>();

    function visit(node: ts.Node) {
        if (ts.isImportDeclaration(node)) {
            const importClause = node.importClause;
            if (importClause) {
                // Handle default import
                if (importClause.name) {
                    importedIdentifiers.set(importClause.name.text, importClause);
                }

                if (importClause.namedBindings) {
                    if (ts.isNamespaceImport(importClause.namedBindings)) {
                        importedIdentifiers.set(importClause.namedBindings.name.text, importClause.namedBindings);
                    } else if (ts.isNamedImports(importClause.namedBindings)) {
                        importClause.namedBindings.elements.forEach(element => {
                            importedIdentifiers.set(element.name.text, element);
                        });
                    }
                }
            }
        } else if (ts.isIdentifier(node)) {
            if (isActualUsage(node)) {
                usedIdentifiers.add(node.text);
            }
        }
        ts.forEachChild(node, visit);
    }

    function isActualUsage(node: ts.Identifier): boolean {
        const parent = node.parent;
        if (!parent) return false;

        // Skip identifiers that are part of the import declaration itself
        let current: ts.Node = node;
        while (current) {
            if (ts.isImportDeclaration(current)) return false;
            current = current.parent;
        }

        // Handle PropertyAccess: obj.property
        // Usage if it's 'obj', but NOT if it's 'property'
        if (ts.isPropertyAccessExpression(parent)) {
            return parent.expression === node;
        }

        // Handle PropertyAssignment: { key: value }
        // Usage if it's 'value', but NOT if it's 'key'
        if (ts.isPropertyAssignment(parent)) {
            return parent.initializer === node;
        }

        // Handle ShorthandPropertyAssignment: { identifier }
        // This IS a usage of the identifier
        if (ts.isShorthandPropertyAssignment(parent)) {
            return true;
        }

        // Handle JSX elements and attributes
        if (ts.isJsxSelfClosingElement(parent) || ts.isJsxOpeningElement(parent)) {
            return (parent as any).tagName === node;
        }
        if (ts.isJsxAttribute(parent)) {
            // Identifier in JSX attribute is a usage if it's in the initializer (expression)
            return parent.initializer === (node as any);
        }

        return true;
    }

    visit(sourceFile);

    const importsToRemove = new Set<ts.Node>();

    // For each import declaration, check if all its bindings are unused
    sourceFile.statements.forEach(statement => {
        if (ts.isImportDeclaration(statement)) {
            const importClause = statement.importClause;
            if (!importClause) return;

            let allBindingsUnused = true;
            const unusedInThisDeclaration: ts.Node[] = [];

            // Check default import
            if (importClause.name) {
                if (usedIdentifiers.has(importClause.name.text)) {
                    allBindingsUnused = false;
                } else {
                    unusedInThisDeclaration.push(importClause.name);
                }
            }

            // Check named bindings
            if (importClause.namedBindings) {
                if (ts.isNamespaceImport(importClause.namedBindings)) {
                    if (usedIdentifiers.has(importClause.namedBindings.name.text)) {
                        allBindingsUnused = false;
                    } else {
                        unusedInThisDeclaration.push(importClause.namedBindings);
                    }
                } else if (ts.isNamedImports(importClause.namedBindings)) {
                    let allNamedUnused = true;
                    importClause.namedBindings.elements.forEach(element => {
                        if (usedIdentifiers.has(element.name.text)) {
                            allBindingsUnused = false;
                            allNamedUnused = false;
                        } else {
                            unusedInThisDeclaration.push(element);
                        }
                    });
                }
            }

            if (allBindingsUnused) {
                // Remove entire declaration (including semicolon/newline)
                const { line: startLine, character: startChar } = sourceFile.getLineAndCharacterOfPosition(statement.getStart());
                const fullEnd = statement.getEnd();
                const { line: endLine, character: endChar } = sourceFile.getLineAndCharacterOfPosition(fullEnd);

                unusedImports.push({
                    name: statement.moduleSpecifier.getText(),
                    line: startLine + 1,
                    character: startChar + 1,
                    endLine: endLine + 1,
                    endCharacter: endChar + 1
                });
            } else {
                // Add individual unused bindings
                unusedInThisDeclaration.forEach(node => {
                    const { line: startLine, character: startChar } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
                    const { line: endLine, character: endChar } = sourceFile.getLineAndCharacterOfPosition(node.getEnd());
                    unusedImports.push({
                        name: (node as any).name?.text || node.getText(),
                        line: startLine + 1,
                        character: startChar + 1,
                        endLine: endLine + 1,
                        endCharacter: endChar + 1
                    });
                });
            }
        }
    });

    logger.info(`Found ${unusedImports.length} unused items to remove in ${filePath}`);
    return unusedImports;
}
