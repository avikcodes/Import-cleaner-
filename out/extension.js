"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const cleanImports_1 = require("./cleanImports");
function activate(context) {
    console.log('Extension "tidy-imports" is now active!');
    let disposable = vscode.commands.registerCommand('tidyImports.clean', () => {
        (0, cleanImports_1.cleanUnusedImports)();
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map