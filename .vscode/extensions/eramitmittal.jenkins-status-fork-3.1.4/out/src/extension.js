"use strict";
/*---------------------------------------------------------------------------------------------
*  Copyright (c) Alessandro Fragnani. All rights reserved.
*  Licensed under the MIT License. See License.md in the project root for license information.
*--------------------------------------------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const JenkinsIndicator = require("./JenkinsIndicator");
function activate(context) {
    let jenkinsIndicator;
    let jenkinsController;
    if (hasJenkinsInAnyRoot()) {
        createJenkinsIndicator(context);
        updateStatus();
    }
    const dispUpdateStatus = vscode.commands.registerCommand("jenkins.updateStatus", () => updateStatus(true));
    context.subscriptions.push(dispUpdateStatus);
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(e => {
        if (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 1)) {
            updateStatus(true);
        }
    }));
    context.subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders(e => {
        if (hasJenkinsInAnyRoot()) {
            createJenkinsIndicator(context);
        }
        updateStatus();
    }));
    const dispOpenInJenkins = vscode.commands.registerCommand("jenkins.openInJenkins", () => __awaiter(this, void 0, void 0, function* () {
        if (!hasJenkinsInAnyRoot()) {
            vscode.window.showWarningMessage("The project is not enabled for Jenkins. Missing .jenkins file.");
            return;
        }
        const settings = yield getCurrentSettings();
        if (!settings.length) {
            vscode.window.showWarningMessage("The current project is not enabled for Jenkins. Please review .jenkins file.");
            return;
        }
        if (settings.length > 1) {
            vscode.window.showQuickPick(settings.map(setting => setting.name), {
                placeHolder: "Select the Jenkins job to open in browser"
            }).then((settingName) => {
                vscode.commands.executeCommand("Jenkins." + settingName + ".openInJenkins");
            });
        }
        else {
            vscode.commands.executeCommand("Jenkins." + settings[0].name + ".openInJenkins");
        }
    }));
    context.subscriptions.push(dispOpenInJenkins);
    const dispOpenInJenkinsConsoleOutput = vscode.commands.registerCommand("jenkins.openInJenkinsConsoleOutput", () => __awaiter(this, void 0, void 0, function* () {
        if (!hasJenkinsInAnyRoot()) {
            vscode.window.showWarningMessage("The project is not enabled for Jenkins. Missing .jenkins file.");
            return;
        }
        const settings = yield getCurrentSettings();
        if (!settings.length) {
            vscode.window.showWarningMessage("The current project is not enabled for Jenkins. Please review .jenkins file.");
            return;
        }
        if (settings.length > 1) {
            vscode.window.showQuickPick(settings.map(setting => setting.name), {
                placeHolder: "Select the Jenkins job to open in browser"
            }).then((settingName) => {
                vscode.commands.executeCommand("Jenkins." + settingName + ".openInJenkinsConsoleOutput");
            });
        }
        else {
            vscode.commands.executeCommand("Jenkins." + settings[0].name + ".openInJenkinsConsoleOutput");
        }
    }));
    context.subscriptions.push(dispOpenInJenkinsConsoleOutput);
    function createJenkinsIndicator(aContext) {
        if (jenkinsIndicator) {
            return;
        }
        jenkinsIndicator = new JenkinsIndicator.JenkinsIndicator();
        jenkinsController = new JenkinsIndicator.JenkinsIndicatorController(jenkinsIndicator);
        aContext.subscriptions.push(jenkinsController);
        aContext.subscriptions.push(jenkinsIndicator);
    }
    function updateStatus(showMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            if (showMessage && !hasJenkinsInAnyRoot()) {
                vscode.window.showWarningMessage("The project is not enabled for Jenkins. Missing .jenkins file.");
                return;
            }
            if (jenkinsIndicator) {
                jenkinsIndicator.updateJenkinsStatus(yield getCurrentSettings(), registerCommand, deRegisterCommand);
            }
        });
    }
    ;
    // let interval;
    const polling = vscode.workspace.getConfiguration("jenkins").get("polling", 0);
    if (polling > 0) {
        setInterval(() => updateStatus(), polling * 60000);
    }
    function hasJenkinsInAnyRoot() {
        if (!vscode.workspace.workspaceFolders) {
            return false;
        }
        let hasAny = false;
        // for (let index = 0; index < vscode.workspace.workspaceFolders.length; index++) {
        for (const element of vscode.workspace.workspaceFolders) {
            // const element: vscode.WorkspaceFolder = vscode.workspace.workspaceFolders[index];
            hasAny = !!getConfigPath(element.uri.fsPath);
            if (hasAny) {
                return hasAny;
            }
        }
        return hasAny;
    }
    function getCurrentSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!vscode.workspace.workspaceFolders) {
                return [];
            }
            let settings = [];
            try {
                for (const element of vscode.workspace.workspaceFolders) {
                    const jenkinsSettingsPath = getConfigPath(element.uri.fsPath);
                    if (!!jenkinsSettingsPath) {
                        let jenkinsSettings = yield readSettings(jenkinsSettingsPath);
                        jenkinsSettings = Array.isArray(jenkinsSettings) ? jenkinsSettings : [jenkinsSettings];
                        settings = settings.concat(jenkinsSettings);
                    }
                }
            }
            catch (error) {
                vscode.window.showErrorMessage("Error while retrieving Jenkins settings");
            }
            return settings;
        });
    }
    function readSettings(jenkinsSettingsPath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (jenkinsSettingsPath.endsWith(".jenkinsrc.js")) {
                delete require.cache[require.resolve(jenkinsSettingsPath)];
                return yield require(jenkinsSettingsPath);
            }
            else {
                const content = fs.readFileSync(jenkinsSettingsPath, "utf-8");
                return JSON.parse(content);
            }
        });
    }
    function registerCommand(cmd, callback) {
        const command = vscode.commands.registerCommand(cmd, callback);
        context.subscriptions.push(new Command(cmd, command));
    }
    function deRegisterCommand(cmd) {
        let foundIndex = -1;
        for (let index = 0; index < context.subscriptions.length; index++) {
            const subscription = context.subscriptions[index];
            if (subscription instanceof Command) {
                if (subscription.cmdId === cmd) {
                    subscription.dispose();
                    foundIndex = index;
                    break;
                }
            }
        }
        if (foundIndex > -1) {
            context.subscriptions.splice(foundIndex, 1);
        }
        return;
    }
    function getConfigPath(root) {
        if (fs.existsSync(path.join(root, ".jenkinsrc.js"))) {
            return path.join(root, ".jenkinsrc.js");
        }
        else if (fs.existsSync(path.join(root, ".jenkins"))) {
            return path.join(root, ".jenkins");
        }
        return "";
    }
}
exports.activate = activate;
class Command {
    constructor(cmdId, command) {
        this.cmdId = cmdId;
        this.command = command;
    }
    dispose() {
        return this.command.dispose();
    }
}
//# sourceMappingURL=extension.js.map