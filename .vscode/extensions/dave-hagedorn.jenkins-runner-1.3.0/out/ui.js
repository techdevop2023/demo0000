"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const log = require("./log");
const constants_1 = require("./constants");
class UI {
    constructor() {
        this.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
        this.jobOutputChannel = vscode.window.createOutputChannel(constants_1.default.PLUGIN_FRIENDLY_NAME);
        this.jobDiagnostics = vscode.languages.createDiagnosticCollection(constants_1.default.PLUGIN_FRIENDLY_NAME);
        this.statusBarIdle("");
    }
    async showError(msg, actionText = "Show Logs", action = () => { log.showPanel(); }) {
        let answer = await vscode.window.showErrorMessage(msg, actionText);
        if (actionText === answer) {
            action();
        }
    }
    statusBarIdle(commandOnClick) {
        this.statusBar.command = commandOnClick;
        this.statusBar.text = constants_1.default.STATUS_BAR_IDLE;
        this.statusBar.color = "white";
        this.statusBar.tooltip = "Launch Jenkins Job";
        this.statusBar.show();
        if (this.statusBarTimer) {
            clearInterval(this.statusBarTimer);
            this.statusBarTimer = undefined;
        }
    }
    statusBarRunning(commandOnClick, description) {
        this.statusBar.command = commandOnClick;
        this.statusBar.text = constants_1.default.STATUS_BAR_RUNNING("zap", description);
        this.statusBar.color = "white";
        this.statusBar.tooltip = "Show Log";
        this.statusBar.show();
        let tick = 1;
        this.statusBarTimer = setInterval(() => {
            this.statusBar.text = constants_1.default.STATUS_BAR_RUNNING(tick % 2 ? "zap" : "file", description);
            tick++;
        }, 1000);
    }
}
UI.instance = new UI();
exports.default = UI;
//# sourceMappingURL=ui.js.map