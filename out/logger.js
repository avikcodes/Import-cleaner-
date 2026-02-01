"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const vscode = require("vscode");
class Logger {
    constructor() {
        this.channel = vscode.window.createOutputChannel('Tidy Imports');
    }
    formatMessage(message, level) {
        const timestamp = new Date().toLocaleTimeString();
        return `[${timestamp}] [${level}] ${message}`;
    }
    info(message) {
        this.channel.appendLine(this.formatMessage(message, 'INFO'));
    }
    warn(message) {
        this.channel.appendLine(this.formatMessage(message, 'WARN'));
    }
    error(message, error) {
        let msg = this.formatMessage(message, 'ERROR');
        if (error) {
            if (error instanceof Error) {
                msg += `\n${error.stack}`;
            }
            else {
                msg += `\n${JSON.stringify(error, null, 2)}`;
            }
        }
        this.channel.appendLine(msg);
    }
    show() {
        this.channel.show(true);
    }
}
exports.logger = new Logger();
//# sourceMappingURL=logger.js.map