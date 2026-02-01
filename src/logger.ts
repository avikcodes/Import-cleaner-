import * as vscode from 'vscode';

class Logger {
    private readonly channel: vscode.OutputChannel;

    constructor() {
        this.channel = vscode.window.createOutputChannel('Tidy Imports');
    }

    private formatMessage(message: string, level: string): string {
        const timestamp = new Date().toLocaleTimeString();
        return `[${timestamp}] [${level}] ${message}`;
    }

    public info(message: string): void {
        this.channel.appendLine(this.formatMessage(message, 'INFO'));
    }

    public warn(message: string): void {
        this.channel.appendLine(this.formatMessage(message, 'WARN'));
    }

    public error(message: string, error?: any): void {
        let msg = this.formatMessage(message, 'ERROR');
        if (error) {
            if (error instanceof Error) {
                msg += `\n${error.stack}`;
            } else {
                msg += `\n${JSON.stringify(error, null, 2)}`;
            }
        }
        this.channel.appendLine(msg);
    }

    public show(): void {
        this.channel.show(true);
    }
}

export const logger = new Logger();
