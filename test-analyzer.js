"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unusedImportAnalyzer_1 = require("./src/unusedImportAnalyzer");
const testFileContent = `
import { usedFunc, unusedFunc } from './utils';
import defaultImport from './default';
import * as ns from './namespace';

console.log(usedFunc);
console.log(ns.something);
`;
const result = (0, unusedImportAnalyzer_1.analyzeUnusedImports)(testFileContent, 'test.ts');
console.log('Unused Imports:', JSON.stringify(result, null, 2));
//# sourceMappingURL=test-analyzer.js.map